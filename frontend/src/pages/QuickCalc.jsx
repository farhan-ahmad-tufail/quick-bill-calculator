import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RefreshCw, Printer, AlertTriangle, Zap, Home, User, Layers, ArrowRight, Calendar, Download, History, Save, Share2, Trash2, X } from 'lucide-react';
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

    // New State for History & Profiles
    const [history, setHistory] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        setAnimate(true);
        // Load from Local Storage
        const savedHistory = localStorage.getItem('billHistory');
        if (savedHistory) setHistory(JSON.parse(savedHistory));

        const savedProfiles = localStorage.getItem('tenantProfiles');
        if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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

        const newBill = {
            ...formData,
            units,
            elecAmount,
            total,
            generatedAt: new Date().toLocaleString()
        };

        setResult(newBill);

        // Save to History
        const updatedHistory = [newBill, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('billHistory', JSON.stringify(updatedHistory));
    };

    const handleSaveProfile = () => {
        if (!formData.name) return;
        const newProfile = {
            name: formData.name,
            floor: formData.floor,
            roomType: formData.roomType,
            rent: formData.rent,
            ratePerUnit: formData.ratePerUnit
        };

        // Remove existing profile with same name if any
        const updatedProfiles = profiles.filter(p => p.name !== formData.name);
        updatedProfiles.push(newProfile);

        setProfiles(updatedProfiles);
        localStorage.setItem('tenantProfiles', JSON.stringify(updatedProfiles));
        alert('Profile saved!');
    };

    const handleLoadProfile = (e) => {
        const selectedName = e.target.value;
        const profile = profiles.find(p => p.name === selectedName);
        if (profile) {
            setFormData({
                ...formData,
                name: profile.name,
                floor: profile.floor,
                roomType: profile.roomType,
                rent: profile.rent,
                ratePerUnit: profile.ratePerUnit
            });
        } else {
            setFormData({ ...formData, name: selectedName });
        }
    };

    const handleDeleteHistory = (index) => {
        const updatedHistory = history.filter((_, i) => i !== index);
        setHistory(updatedHistory);
        localStorage.setItem('billHistory', JSON.stringify(updatedHistory));
    };

    const handleShareWhatsapp = async () => {
        if (!result || !receiptRef.current) return;

        try {
            // 1. Generate Image
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            // 2. Convert to Blob/File
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `Bill_${result.name}_${result.billMonth}.png`, { type: 'image/png' });

            // 3. Construct Text Message
            const text = `*RENT RECEIPT*\nMonth: ${result.billMonth} ${result.billYear}\nTenant: ${result.name}\nTotal: ₹${result.total.toFixed(2)}`;

            // 4. Try Web Share API (Mobile)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Rent Receipt',
                    text: text
                });
            } else {
                // 5. Fallback for Desktop (Text only)
                const url = `https://wa.me/?text=${encodeURIComponent(text + "\n\n(Image sharing not supported on this device, please download the bill first)")}`;
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback if sharing fails (e.g. user cancelled)
            // alert('Could not share image directly.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadImage = async () => {
        if (receiptRef.current) {
            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2,
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
        if (isNaN(num)) return floor;

        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + "st Floor";
        if (j === 2 && k !== 12) return num + "nd Floor";
        if (j === 3 && k !== 13) return num + "rd Floor";
        return num + "th Floor";
    };

    return (
        <div className={`fade-in-up ${animate ? 'active' : ''}`} style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="icon-box">
                        <Calculator size={28} />
                    </div>
                </div>
                <button onClick={() => setShowHistory(true)} className="btn btn-secondary">
                    <History size={18} /> History
                </button>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold gradient-text">
                    Quick Bill Calculator
                </h1>
                <p className="text-muted text-sm">Generate instant electricity and rent bills</p>
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
                                        <label className="input-label flex justify-between">
                                            <span><User size={12} /> Tenant Name</span>
                                            {formData.name && (
                                                <button type="button" onClick={handleSaveProfile} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                    <Save size={10} /> Save Profile
                                                </button>
                                            )}
                                        </label>
                                        <input
                                            list="profiles"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleLoadProfile}
                                            placeholder="e.g. John Doe"
                                        />
                                        <datalist id="profiles">
                                            {profiles.map((p, i) => <option key={i} value={p.name} />)}
                                        </datalist>
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
                                <span className="status-badge success">Ready</span>
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
                                                <span className="text-xl font-bold text-slate-900">₹{(parseFloat(result.rent) + result.elecAmount + parseFloat(result.otherCharges || 0)).toFixed(2)}</span>
                                            </div>

                                            {result.arrears > 0 && (
                                                <div className="mt-6 pt-4 border-t-2 border-dashed border-red-200 bg-red-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center text-red-600">
                                                        <span className="text-base font-bold">Old Pending Balance</span>
                                                        <span className="font-mono font-bold text-xl">₹{parseFloat(result.arrears).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Grand Total Footer */}
                                        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '2rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">TOTAL PAYABLE AMOUNT</span>
                                                <span className="text-xs text-slate-500 mt-1">Please pay by due date</span>
                                            </div>
                                            <span className="text-5xl font-bold">₹{result.total.toFixed(2)}</span>
                                        </div>

                                        <div className="mt-8 text-center text-slate-400 text-xs">
                                            <p>Thank you for your timely payment.</p>
                                            <p className="mt-1">Generated electronically on {result.generatedAt}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-6">
                                        <button onClick={handleShareWhatsapp} className="btn bg-green-500 hover:bg-green-600 text-white shadow-lg justify-center py-4 text-lg font-bold rounded-xl transition-transform hover:scale-[1.02] flex items-center">
                                            <Share2 size={24} className="mr-3" /> WhatsApp
                                        </button>
                                        <button onClick={handleDownloadImage} className="btn bg-blue-600 hover:bg-blue-500 text-white shadow-lg justify-center py-4 text-lg font-bold rounded-xl transition-transform hover:scale-[1.02] flex items-center">
                                            <Download size={24} className="mr-3" /> Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
                    <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl overflow-y-auto border-l border-slate-800 animate-slide-in-right flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <History className="text-blue-500" size={20} />
                                <span>Recent Bills</span>
                            </h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                                    <History size={64} strokeWidth={1} className="mb-4" />
                                    <p className="text-lg font-medium">No history yet</p>
                                    <p className="text-sm">Generated bills will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => { setResult(item); setShowHistory(false); }}
                                            className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 cursor-pointer transition-all duration-200"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteHistory(idx); }}
                                                className="absolute top-3 right-3 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete this record"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="flex justify-between items-start mb-2 pr-8">
                                                <div>
                                                    <h3 className="font-bold text-slate-100 text-lg leading-tight mb-1">{item.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                        <Calendar size={10} /> {item.billMonth} {item.billYear}
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold text-emerald-400 font-mono">
                                                    ₹{item.total.toFixed(0)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    Rent: <span className="text-slate-200">₹{item.rent}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                    Elec: <span className="text-slate-200">₹{item.elecAmount.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="p-6 border-t border-slate-800 bg-slate-900">
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete all history?')) {
                                            setHistory([]);
                                            localStorage.removeItem('billHistory');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500/30 transition-all text-sm font-medium"
                                >
                                    <Trash2 size={16} /> Clear All History
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
