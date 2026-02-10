import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RefreshCw, Printer, AlertTriangle, Zap, Home, User, Layers, ArrowRight, Calendar, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function QuickCalc() {
    const currentDate = new Date();
    const [formData, setFormData] = useState({
        name: '',
        floor: '',
        roomType: 'Medium',
        billMonth: currentDate.toLocaleString('default', { month: 'long' }),
        billYear: currentDate.getFullYear(),
        rent: '',
        prevReading: '',
        currReading: '',
        ratePerUnit: 17,
        arrears: '',
        otherCharges: ''
    });

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [animate, setAnimate] = useState(false);
    const receiptRef = useRef(null);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Generate years
    const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - 1 + i);

    const handleCalculate = (e) => {
        e.preventDefault();
        setError('');

        const rent = parseFloat(formData.rent) || 0;
        const prev = parseFloat(formData.prevReading) || 0;
        const curr = parseFloat(formData.currReading) || 0;
        const rate = parseFloat(formData.ratePerUnit) || 0;
        const arrears = parseFloat(formData.arrears) || 0;
        const other = parseFloat(formData.otherCharges) || 0;

        if (curr < prev) {
            setError('Current reading cannot be less than previous reading.');
            return;
        }

        const units = curr - prev;
        const elecAmount = units * rate;
        const total = rent + elecAmount + arrears + other;

        setResult({
            ...formData,
            units,
            elecAmount,
            total,
            generatedAt: new Date().toLocaleString()
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadImage = async () => {
        if (receiptRef.current) {
            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2, // High resolution
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true
                });

                const link = document.createElement('a');
                link.download = `Bill_${result.name || 'Tenant'}_${result.billMonth}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Failed to generate image", err);
                alert("Failed to download image. Please try again.");
            }
        }
    };

    const reset = () => {
        setFormData({
            name: '',
            floor: '',
            roomType: 'Medium',
            billMonth: currentDate.toLocaleString('default', { month: 'long' }),
            billYear: currentDate.getFullYear(),
            rent: '',
            prevReading: '',
            currReading: '',
            ratePerUnit: 17,
            arrears: '',
            otherCharges: ''
        });
        setResult(null);
        setError('');
    };

    const formatFloor = (floor) => {
        if (!floor) return '';
        const num = parseInt(floor);
        if (isNaN(num)) return floor; // Return as is if not a number

        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + "st Floor";
        if (j === 2 && k !== 12) return num + "nd Floor";
        if (j === 3 && k !== 13) return num + "rd Floor";
        return num + "th Floor";
    };

    return (
        <div className={`fade-in-up ${animate ? 'active' : ''}`} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex items-center justify-center gap-4 mb-8 text-center">
                <div className="icon-box">
                    <Calculator size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold gradient-text">
                        Quick Bill Calculator
                    </h1>
                    <p className="text-muted text-sm">Generate instant electricity and rent bills</p>
                </div>
            </div>

            <div className="flex flex-col" style={{ gap: '5rem' }}>
                {/* Input Form Section */}
                <div className="input-section">
                    <div className="card glass-card">
                        <div className="card-header-line"></div>
                        <div style={{ padding: 'var(--space-6)' }}>
                            <h2 className="section-title justify-center">
                                <span className="step-badge">1</span>
                                Enter Billing Details
                            </h2>

                            <form onSubmit={handleCalculate} className="form-stack">

                                {/* Section: Tenant Info */}
                                <div className="form-section">
                                    <div className="grid-2 mb-4">
                                        <div className="form-group">
                                            <label className="input-label">
                                                <Calendar size={12} /> Bill Month
                                            </label>
                                            <select
                                                className="form-input"
                                                value={formData.billMonth}
                                                onChange={e => setFormData({ ...formData, billMonth: e.target.value })}
                                            >
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">
                                                <Calendar size={12} /> Year
                                            </label>
                                            <select
                                                className="form-input"
                                                value={formData.billYear}
                                                onChange={e => setFormData({ ...formData, billYear: e.target.value })}
                                            >
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">
                                            <User size={12} /> Tenant Name
                                        </label>
                                        <input
                                            className="form-input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="input-label">
                                                <Layers size={12} /> Floor
                                            </label>
                                            <input
                                                className="form-input"
                                                value={formData.floor}
                                                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">
                                                <Home size={12} /> Room Type
                                            </label>
                                            <select
                                                className="form-input"
                                                value={formData.roomType}
                                                onChange={e => setFormData({ ...formData, roomType: e.target.value })}
                                            >
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Big(Window)">Big (window)</option>
                                                <option value="Shop">Shop</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Readings */}
                                <div className="form-section">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="icon-badge warning">
                                                <Zap size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-primary">Electricity Readings</span>
                                        </div>
                                        {((parseFloat(formData.currReading) || 0) - (parseFloat(formData.prevReading) || 0) > 0) && (
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                                Units: {((parseFloat(formData.currReading) || 0) - (parseFloat(formData.prevReading) || 0)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid-2 relative" style={{ gap: '2.5rem' }}>
                                        <div className="form-group">
                                            <label className="input-label">Previous</label>
                                            <input
                                                type="number"
                                                className="form-input font-mono"
                                                value={formData.prevReading}
                                                onChange={e => setFormData({ ...formData, prevReading: e.target.value })}
                                                placeholder="0000"
                                                required
                                            />
                                        </div>

                                        <div className="arrow-icon">
                                            <ArrowRight size={16} />
                                        </div>

                                        <div className="form-group">
                                            <label className="input-label">Current</label>
                                            <input
                                                type="number"
                                                className="form-input font-mono"
                                                value={formData.currReading}
                                                onChange={e => setFormData({ ...formData, currReading: e.target.value })}
                                                placeholder="0000"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label className="input-label">Rate (₹/unit)</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="number"
                                                    className="form-input pl-8"
                                                    value={formData.ratePerUnit}
                                                    onChange={e => setFormData({ ...formData, ratePerUnit: e.target.value })}
                                                />
                                                <span className="currency-symbol">₹</span>
                                            </div>
                                        </div>
                                        <div className="text-hint" style={{ flex: 2 }}>
                                            *Standard rate is ₹17. Edit if custom rate applies.
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Financials */}
                                <div className="form-section">
                                    <div className="grid-1 mb-4">
                                        <div className="form-group">
                                            <label className="input-label text-danger">Previous Month Remaining Balance (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input border-danger-soft"
                                                value={formData.arrears}
                                                onChange={e => setFormData({ ...formData, arrears: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="input-label">Rent (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.rent}
                                                onChange={e => setFormData({ ...formData, rent: e.target.value })}
                                                placeholder="5000"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Other (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.otherCharges}
                                                onChange={e => setFormData({ ...formData, otherCharges: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-box">
                                        <AlertTriangle size={16} /> {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={reset} className="btn btn-secondary">
                                        <RefreshCw size={18} /> Reset
                                    </button>
                                    <button type="submit" className="btn btn-primary flex-1 shadow-glow w-full">
                                        Generate Receipt
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Result / Receipt */}
                {result && (
                    <div className="result-section fade-in-up active">
                        <div className="card dark-card shadow-lg relative flex flex-col items-center">
                            <div className="card-header w-full">
                                <h2 className="text-lg font-bold text-bright">Bill Preview</h2>
                                <span className="status-badge success">Ready used</span>
                            </div>

                            <div className="card-body bg-pattern w-full flex flex-col items-center p-8">
                                <div className="receipt-container w-full" style={{ maxWidth: '600px' }}>
                                    {/* Detailed Receipt Visual */}
                                    <div ref={receiptRef} className="receipt-paper" style={{ padding: '40px' }}>
                                        <div className="text-center mb-8">
                                            <div className="text-3xl font-bold uppercase tracking-wider text-slate-800">RENT RECEIPT</div>
                                            <div className="text-base font-medium text-slate-500 mt-2">{result.billMonth} {result.billYear}</div>
                                            <div style={{ borderBottom: '2px solid #cbd5e1', margin: '20px auto', width: '100%' }}></div>
                                        </div>

                                        {/* Tenant Details Row */}
                                        <div className="flex justify-between items-start mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TENANT</div>
                                                <div className="text-2xl font-bold text-slate-900 leading-tight">{result.name || 'Unknown Tenant'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DETAILS</div>
                                                <div className="text-sm font-medium text-slate-600">{result.roomType}</div>
                                                <div className="text-sm font-medium text-slate-900">{formatFloor(result.floor)}</div>
                                            </div>
                                        </div>

                                        {/* Electricity Breakdown Box */}
                                        <div className="mb-8 p-4 border border-slate-200 rounded-lg">
                                            <div className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                                                <Zap size={14} className="text-yellow-500" /> Electricity Charges
                                            </div>
                                            <table style={{ width: '100%' }}>
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
                                                            <div className="text-sm text-slate-600">Current: <span className="font-mono font-bold text-slate-800">{result.currReading}</span></div>
                                                            <div className="text-sm text-slate-600">Previous: <span className="font-mono font-bold text-slate-800">{result.prevReading}</span></div>
                                                        </td>
                                                        <td className="py-3 text-center align-top">
                                                            <span className="font-mono font-bold text-slate-800 text-lg">{result.units.toFixed(2)}</span>
                                                        </td>
                                                        <td className="py-3 text-right align-top">
                                                            <span className="font-mono text-slate-600">₹{result.ratePerUnit}</span>
                                                        </td>
                                                        <td className="py-3 text-right align-top">
                                                            <span className="font-mono font-bold text-slate-900 text-lg">₹{result.elecAmount.toFixed(2)}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Main Charges Summary */}
                                        <div className="space-y-3 mb-8">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 font-medium text-lg">Room Rent</span>
                                                <span className="font-mono font-bold text-slate-800 text-lg">₹{parseFloat(result.rent).toFixed(2)}</span>
                                            </div>

                                            {result.otherCharges > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium text-lg">Other Charges</span>
                                                    <span className="font-mono font-bold text-slate-800 text-lg">₹{parseFloat(result.otherCharges).toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div style={{ borderBottom: '2px solid #0f172a', margin: '15px 0' }}></div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-slate-900">CURRENT MONTH TOTAL</span>
                                                <span className="text-2xl font-bold text-slate-900">₹{(parseFloat(result.rent) + result.elecAmount + parseFloat(result.otherCharges || 0)).toFixed(2)}</span>
                                            </div>

                                            {result.arrears > 0 && (
                                                <div className="mt-6 pt-4 border-t-2 border-dashed border-red-200 bg-red-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center text-red-600">
                                                        <span className="text-base font-bold">Old Pending Balance (Arrears)</span>
                                                        <span className="font-mono font-bold text-xl">₹{parseFloat(result.arrears).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Grand Total Footer */}
                                        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">TOTAL PAYABLE AMOUNT</span>
                                                <span className="text-xs text-slate-500 mt-1">Please pay by due date</span>
                                            </div>
                                            <span className="text-4xl font-bold">₹{result.total.toFixed(2)}</span>
                                        </div>

                                        <div className="mt-8 text-center text-slate-400 text-xs">
                                            <p>Thank you for your timely payment.</p>
                                            <p className="mt-1">Generated electronically on {result.generatedAt}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button onClick={handleDownloadImage} className="btn bg-green-600 hover:bg-green-500 text-white shadow-lg w-full justify-center py-4 text-lg font-bold rounded-xl transition-transform hover:scale-[1.02]">
                                            <Download size={24} className="mr-3" /> Download Bill Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
