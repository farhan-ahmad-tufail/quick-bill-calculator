
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { FileText, Plus, CheckCircle, AlertOctagon, Download, X, Zap, Calendar, User, Home, Layers, ArrowRight, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Billing() {
    const [bills, setBills] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]); // New state for tenants to show names
    const [showGenForm, setShowGenForm] = useState(false);
    const [showPayForm, setShowPayForm] = useState(false);
    const [viewBill, setViewBill] = useState(null);
    const receiptRef = useRef(null);

    // Gen Bill State
    const currentDate = new Date();
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [currentReading, setCurrentReading] = useState('');
    const [billMonth, setBillMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
    const [billYear, setBillYear] = useState(currentDate.getFullYear());
    const [manualBalance, setManualBalance] = useState('');

    // Payment State
    const [selectedBill, setSelectedBill] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payMode, setPayMode] = useState('CASH');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bData, rData, tData] = await Promise.all([
                api.getBills(),
                api.getRooms(),
                api.getTenants() // Fetch tenants too
            ]);
            setBills(bData.reverse());
            setRooms(rData);
            setTenants(tData);
        } catch (err) {
            console.error("Error loading data", err);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            await api.generateBill(selectedRoomId, currentReading, billMonth, billYear, manualBalance);
            setShowGenForm(false);
            setSelectedRoomId('');
            setCurrentReading('');
            setManualBalance('');
            loadData();
        } catch (err) {
            alert('Error generating bill. Ensure reading > last reading.');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await api.recordPayment(selectedBill.id, payAmount, payMode);
            setShowPayForm(false);
            setSelectedBill(null);
            setPayAmount('');
            loadData();
        } catch (err) {
            alert('Payment failed');
        }
    };

    const openPayModal = (bill) => {
        const remaining = bill.totalAmount - bill.paidAmount;
        setPayAmount(remaining > 0 ? remaining : '');
        setSelectedBill(bill);
        setShowPayForm(true);
    };

    const handleDownloadReceipt = async () => {
        if (receiptRef.current) {
            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `Receipt_${viewBill.billingMonth}_${viewBill.room?.roomNumber}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Failed to generate receipt image", err);
                alert("Failed to download receipt.");
            }
        }
    };

    const formatFloor = (floor) => {
        if (!floor) return '';
        const num = parseInt(floor);
        if (isNaN(num)) return floor;
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + "st Floor";
        if (j === 2 && k !== 12) return num + "nd Floor";
        if (j === 3 && k !== 13) return num + "rd Floor";
        return num + "th Floor";
    };

    // Helper to get floor from room number if not explicit
    const getFloorFromRoom = (roomNum) => {
        if (!roomNum) return '';
        return String(roomNum).charAt(0);
    };


    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Billing & Payments</h1>
                    <p className="text-muted text-sm mt-1">Manage invoices and track payments</p>
                </div>
                <button
                    onClick={() => setShowGenForm(!showGenForm)}
                    className="btn btn-primary shadow-glow"
                >
                    <Plus size={20} />
                    New Bill
                </button>
            </div>

            {/* Generate Bill Form - Styled like QuickCalc */}
            {showGenForm && (
                <div className="card glass-card mb-8 fade-in-up active border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="text-blue-400" size={24} />
                            Generate Monthly Bill
                        </h2>
                        <button onClick={() => setShowGenForm(false)} className="text-muted hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleGenerate}>
                        {/* 1. Date Selection */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="input-label">
                                    <Calendar size={12} /> Bill Month
                                </label>
                                <select
                                    className="form-input text-lg"
                                    value={billMonth}
                                    onChange={e => setBillMonth(e.target.value)}
                                >
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="input-label">
                                    <Calendar size={12} /> Year
                                </label>
                                <select
                                    className="form-input text-lg"
                                    value={billYear}
                                    onChange={e => setBillYear(e.target.value)}
                                >
                                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2. Room & Reading */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="input-label">
                                    <Home size={12} /> Select Room
                                </label>
                                <select
                                    className="form-input text-lg"
                                    value={selectedRoomId}
                                    onChange={e => {
                                        const rId = e.target.value;
                                        setSelectedRoomId(rId);

                                        // Auto-calculate pending dues for this room
                                        if (rId) {
                                            const pending = bills
                                                .filter(b => b.room?.id === rId && b.status !== 'PAID')
                                                .reduce((acc, b) => acc + (b.totalAmount - b.paidAmount), 0);
                                            setManualBalance(pending.toFixed(2));
                                        } else {
                                            setManualBalance('');
                                        }
                                    }}
                                    required
                                >
                                    <option value="">Choose Room...</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.roomNumber} ({r.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="input-label">
                                    <Zap size={12} /> Current Reading
                                </label>
                                <input
                                    className="form-input text-lg font-mono"
                                    type="number"
                                    value={currentReading}
                                    onChange={e => setCurrentReading(e.target.value)}
                                    required
                                    placeholder="0000"
                                />
                            </div>
                        </div>

                        {/* Dynamic Details Section */}
                        {selectedRoomId && (
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50 animate-scale-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tenant & Room Details</h3>
                                    {/* Tenant Name Display */}
                                    <span className="text-sm text-blue-400 font-bold flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                        <User size={14} />
                                        {tenants.find(t => t.room?.id === selectedRoomId && t.active)?.name || 'No Active Tenant'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Previous Reading</div>
                                        <div className="font-mono text-lg font-bold text-slate-200">
                                            {rooms.find(r => r.id === selectedRoomId)?.submeterReading || '0'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Unit Rate</div>
                                        <div className="font-mono text-lg font-bold text-slate-200">₹17.00</div>
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                        <div className="text-xs text-slate-500 mb-1">Base Rent</div>
                                        <div className="font-mono text-lg font-bold text-slate-200">
                                            ₹{rooms.find(r => r.id === selectedRoomId)?.baseRent || '0'}
                                        </div>
                                    </div>

                                    {/* Manual Previous Balance Input */}
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] uppercase font-bold text-red-400 mb-1 block">Prev. Month Pending</label>
                                        <input
                                            className="w-full bg-red-900/10 border border-red-900/30 text-red-400 font-mono font-bold rounded p-2 focus:outline-none focus:border-red-500"
                                            type="number"
                                            value={manualBalance}
                                            onChange={e => setManualBalance(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowGenForm(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-8 shadow-glow">
                                Generate Bill
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bills List */}
            <div className="space-y-4">
                {bills.map(bill => (
                    <div key={bill.id} className="card glass-card hover:translate-y-[-2px] transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                            {/* Left: Info */}
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${bill.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' :
                                    bill.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-white">
                                            {bill.billingMonth}
                                        </h3>
                                        <span className="text-muted text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                            Room {bill.room?.roomNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted">
                                        <div className="flex items-center gap-1">
                                            <User size={12} /> {bill.tenant?.name || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Zap size={12} /> {bill.unitsConsumed} Units
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions & status */}
                            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white font-mono">₹{bill.totalAmount}</div>
                                    <div className={`text-xs font-bold uppercase tracking-wider ${bill.status === 'PAID' ? 'text-emerald-500' :
                                        bill.status === 'PARTIAL' ? 'text-amber-500' : 'text-red-500'
                                        }`}>
                                        {bill.status}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewBill(bill)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                        title="View Receipt"
                                    >
                                        <FileText size={20} />
                                    </button>

                                    {bill.status !== 'PAID' && (
                                        <button
                                            onClick={() => openPayModal(bill)}
                                            className="btn btn-primary text-xs py-2"
                                        >
                                            Pay
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {showPayForm && selectedBill && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card glass-card w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold mb-1">Record Payment</h2>
                        <p className="text-muted text-sm mb-6">
                            Room {selectedBill.room?.roomNumber} • {selectedBill.billingMonth}
                        </p>

                        <form onSubmit={handlePayment}>
                            <div className="space-y-4 mb-6">
                                <div className="form-group">
                                    <label className="input-label">Amount (₹)</label>
                                    <input
                                        className="form-input text-lg"
                                        type="number"
                                        value={payAmount}
                                        onChange={e => setPayAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="input-label">Payment Mode</label>
                                    <select
                                        className="form-input"
                                        value={payMode}
                                        onChange={e => setPayMode(e.target.value)}
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="BANK">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPayForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary shadow-glow">
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Receipt Modal - Full Paper Design */}
            {viewBill && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl animate-scale-in my-8">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <h2 className="text-xl font-bold">Receipt Preview</h2>
                            <button onClick={() => setViewBill(null)} className="p-2 hover:bg-white/10 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div ref={receiptRef} className="bg-white text-slate-900 p-8 rounded-lg shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="text-3xl font-bold uppercase tracking-wider text-slate-800">RENT RECEIPT</div>
                                <div className="text-base font-medium text-slate-500 mt-2">{viewBill.billingMonth} {new Date(viewBill.billDate).getFullYear()}</div>
                                <div className="w-full border-b-2 border-slate-200 my-6"></div>
                            </div>

                            {/* Tenant Details */}
                            <div className="flex justify-between items-start mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TENANT</div>
                                    <div className="text-2xl font-bold text-slate-900 leading-tight">{viewBill.tenant?.name || 'Unknown'}</div>
                                    <div className="text-sm text-slate-500 mt-1">{viewBill.tenant?.mobile}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DETAILS</div>
                                    <div className="text-sm font-medium text-slate-600">Room {viewBill.room?.roomNumber}</div>
                                    <div className="text-sm font-medium text-slate-900">
                                        {viewBill.room?.floor ?
                                            `${viewBill.room.floor}${['1', '2', '3'].includes(viewBill.room.floor.slice(-1)) && !['11', '12', '13'].includes(viewBill.room.floor.slice(-2)) ?
                                                (viewBill.room.floor.slice(-1) === '1' ? 'st' : viewBill.room.floor.slice(-1) === '2' ? 'nd' : 'rd') : 'th'} Floor`
                                            : formatFloor(getFloorFromRoom(viewBill.room?.roomNumber))
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Electricity Table */}
                            <div className="mb-8 p-4 border border-slate-200 rounded-lg">
                                <div className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-500" /> Electricity Charges
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                                            <th className="pb-2 font-medium">READINGS</th>
                                            <th className="pb-2 font-medium text-center">UNITS</th>
                                            <th className="pb-2 font-medium text-right">RATE</th>
                                            <th className="pb-2 font-medium text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-3">
                                                <div className="text-sm text-slate-600">Current: <span className="font-mono font-bold text-slate-800">{viewBill.currentReading}</span></div>
                                                <div className="text-sm text-slate-600">Previous: <span className="font-mono font-bold text-slate-800">{viewBill.previousReading}</span></div>
                                            </td>
                                            <td className="py-3 text-center align-top">
                                                <span className="font-mono font-bold text-slate-800 text-lg">{viewBill.unitsConsumed}</span>
                                            </td>
                                            <td className="py-3 text-right align-top">
                                                <span className="font-mono text-slate-600">₹{viewBill.room?.ratePerUnit || 17}</span>
                                            </td>
                                            <td className="py-3 text-right align-top">
                                                <span className="font-mono font-bold text-slate-900 text-lg">₹{(viewBill.unitsConsumed * (viewBill.room?.ratePerUnit || 17)).toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-medium text-lg">Room Rent</span>
                                    <span className="font-mono font-bold text-slate-800 text-lg">₹{viewBill.room?.baseRent}</span>
                                </div>

                                <div className="border-b-2 border-slate-900 my-4"></div>

                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-900">TOTAL AMOUNT</span>
                                    <span className="text-2xl font-bold text-slate-900">₹{viewBill.totalAmount}</span>
                                </div>

                                <div className="flex justify-between items-center text-emerald-600 mt-2">
                                    <span className="font-medium">Paid Amount</span>
                                    <span className="font-mono font-bold">₹{viewBill.paidAmount}</span>
                                </div>

                                {(viewBill.totalAmount - viewBill.paidAmount) > 0 && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 flex justify-between items-center">
                                        <span className="font-bold">Pending Due</span>
                                        <span className="font-mono font-bold text-xl">₹{viewBill.totalAmount - viewBill.paidAmount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="text-center text-slate-400 text-xs mt-8">
                                <p>Generated electronically via RentManager</p>
                                <p className="mt-1">Due Date: {viewBill.billDate}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button onClick={() => setViewBill(null)} className="btn btn-secondary flex-1">
                                Close
                            </button>
                            <button onClick={handleDownloadReceipt} className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1 justify-center shadow-lg">
                                <Download size={20} className="mr-2" /> Download Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
