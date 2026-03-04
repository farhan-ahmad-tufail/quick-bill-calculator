import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RefreshCw, Printer, AlertTriangle, Zap, Home, User, Layers, ArrowRight, Calendar, Download, History, Save, Share2, Trash2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const translations = {
    en: {
        receiptTitle: "RENT RECEIPT",
        tenant: "TENANT",
        rooms: "ROOMS",
        total: "Total",
        rent: "Rent",
        readings: "READINGS",
        units: "UNITS",
        rate: "RATE",
        elec: "ELEC",
        cur: "Cur",
        pre: "Pre",
        totalRent: "Total Rent",
        totalElectricity: "Total Electricity",
        otherCharges: "Other Charges",
        currentMonth: "CURRENT MONTH",
        oldPendingBalance: "Old Pending Balance",
        totalPayable: "TOTAL PAYABLE AMOUNT",
        payByDueDate: "Please pay by due date",
        thankYou: "Thank you for your timely payment.",
        generatedOn: "Generated electronically on"
    },
    hi: {
        receiptTitle: "किराया रसीद",
        tenant: "किरायेदार",
        rooms: "कमरे",
        total: "कुल",
        rent: "किराया",
        readings: "रीडिंग",
        units: "यूनिट",
        rate: "दर",
        elec: "बिजली",
        cur: "वर्तमान",
        pre: "पिछला",
        totalRent: "कुल किराया",
        totalElectricity: "कुल बिजली बिल",
        otherCharges: "अन्य शुल्क",
        currentMonth: "इस महीने का कुल",
        oldPendingBalance: "पिछला बकाया",
        totalPayable: "कुल देय राशि",
        payByDueDate: "कृपया नियत तिथि तक भुगतान करें",
        thankYou: "समय पर भुगतान के लिए धन्यवाद।",
        generatedOn: "इलेक्ट्रॉनिक रूप से तैयार:"
    }
};

export default function QuickCalc() {
    const currentDate = new Date();
    const [formData, setFormData] = useState({
        name: '',
        billMonth: currentDate.toLocaleString('default', { month: 'long' }),
        billYear: currentDate.getFullYear(),
        arrears: '',
        otherCharges: ''
    });

    const defaultRoom = { floor: '', roomType: 'Medium', rent: '', prevReading: '', currReading: '', ratePerUnit: 17 };
    const [rooms, setRooms] = useState([{ ...defaultRoom, id: Date.now() }]);

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [animate, setAnimate] = useState(false);
    const receiptRef = useRef(null);

    // New State for History & Profiles
    const [history, setHistory] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [language, setLanguage] = useState('en');

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

        const arrears = parseFloat(formData.arrears) || 0;
        const other = parseFloat(formData.otherCharges) || 0;

        let totalRent = 0;
        let totalElec = 0;
        let totalUnits = 0;
        let calculatedRooms = [];

        for (let i = 0; i < rooms.length; i++) {
            const r = rooms[i];
            const rRent = parseFloat(r.rent) || 0;
            const prev = parseFloat(r.prevReading) || 0;
            const curr = parseFloat(r.currReading) || 0;
            const rate = parseFloat(r.ratePerUnit) || 0;

            if (curr < prev && r.currReading !== '') {
                setError(`Current reading cannot be less than previous reading in Room ${i + 1}.`);
                return;
            }

            const units = curr - prev;
            const elecAmount = units * rate;

            totalRent += rRent;
            totalElec += elecAmount;
            totalUnits += units;

            calculatedRooms.push({
                ...r,
                units,
                elecAmount
            });
        }

        const total = totalRent + totalElec + arrears + other;

        const newBill = {
            ...formData,
            rooms: calculatedRooms,
            totalRent,
            totalElec,
            totalUnits,
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
            rooms: rooms.map(r => ({ ...r, id: Date.now() + Math.random() }))
        };

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
                name: profile.name
            });
            if (profile.rooms) {
                setRooms(profile.rooms.map(r => ({ ...r, id: Date.now() + Math.random() })));
            } else {
                setRooms([{
                    ...defaultRoom,
                    id: Date.now(),
                    floor: profile.floor || '',
                    roomType: profile.roomType || 'Medium',
                    rent: profile.rent || '',
                    ratePerUnit: profile.ratePerUnit || 17
                }]);
            }
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

    const handleDownloadPDF = async () => {
        if (receiptRef.current) {
            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Bill_${result.name || 'Tenant'}_${result.billMonth}.pdf`);
            } catch (err) {
                console.error("Failed to generate PDF", err);
                alert("Failed to download PDF. Please try again.");
            }
        }
    };

    const reset = () => {
        setFormData({
            name: '',
            billMonth: currentDate.toLocaleString('default', { month: 'long' }),
            billYear: currentDate.getFullYear(),
            arrears: '',
            otherCharges: ''
        });
        setRooms([{ ...defaultRoom, id: Date.now() }]);
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
                                </div>

                                {/* Section: Rooms Loop */}
                                {rooms.map((room, index) => (
                                    <div key={room.id} className="form-section relative border-l-2 border-blue-500 pl-4 mb-6">
                                        {rooms.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setRooms(rooms.filter(r => r.id !== room.id))}
                                                className="absolute top-2 right-2 p-2 text-slate-500 hover:bg-slate-800 rounded-lg hover:text-red-400"
                                                title="Remove Room"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                            <Home size={14} /> Room {index + 1}
                                        </h3>
                                        <div className="grid-2 mb-4">
                                            <div className="form-group">
                                                <label className="input-label">
                                                    <Layers size={12} /> Floor
                                                </label>
                                                <input
                                                    className="form-input"
                                                    value={room.floor}
                                                    onChange={e => {
                                                        const newRooms = [...rooms];
                                                        newRooms[index].floor = e.target.value;
                                                        setRooms(newRooms);
                                                    }}
                                                    placeholder="e.g. 1"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="input-label">
                                                    <Home size={12} /> Room Type
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={room.roomType}
                                                    onChange={e => {
                                                        const newRooms = [...rooms];
                                                        newRooms[index].roomType = e.target.value;
                                                        setRooms(newRooms);
                                                    }}
                                                >
                                                    <option value="Small">Small</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Big(Window)">Big (window)</option>
                                                    <option value="Shop">Shop</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid-2 mb-4">
                                            <div className="form-group">
                                                <label className="input-label">Rent (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={room.rent}
                                                    onChange={e => {
                                                        const newRooms = [...rooms];
                                                        newRooms[index].rent = e.target.value;
                                                        setRooms(newRooms);
                                                    }}
                                                    placeholder="5000"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="input-label flex justify-between">
                                                    <span>Rate (₹/unit)</span>
                                                </label>
                                                <div className="input-wrapper">
                                                    <input
                                                        type="number"
                                                        className="form-input pl-8"
                                                        value={room.ratePerUnit}
                                                        onChange={e => {
                                                            const newRooms = [...rooms];
                                                            newRooms[index].ratePerUnit = e.target.value;
                                                            setRooms(newRooms);
                                                        }}
                                                    />
                                                    <span className="currency-symbol">₹</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="icon-badge warning"><Zap size={14} /></div>
                                                <span className="text-sm font-bold text-primary">Electricity Readings</span>
                                            </div>
                                            {((parseFloat(room.currReading) || 0) - (parseFloat(room.prevReading) || 0) > 0) && (
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                                    Units: {((parseFloat(room.currReading) || 0) - (parseFloat(room.prevReading) || 0)).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid-2 relative" style={{ gap: '2.5rem' }}>
                                            <div className="form-group">
                                                <label className="input-label">Previous</label>
                                                <input
                                                    type="number"
                                                    className="form-input font-mono"
                                                    value={room.prevReading}
                                                    onChange={e => {
                                                        const newRooms = [...rooms];
                                                        newRooms[index].prevReading = e.target.value;
                                                        setRooms(newRooms);
                                                    }}
                                                    placeholder="0000"
                                                    required
                                                />
                                            </div>
                                            <div className="arrow-icon"><ArrowRight size={16} /></div>
                                            <div className="form-group">
                                                <label className="input-label">Current</label>
                                                <input
                                                    type="number"
                                                    className="form-input font-mono"
                                                    value={room.currReading}
                                                    onChange={e => {
                                                        const newRooms = [...rooms];
                                                        newRooms[index].currReading = e.target.value;
                                                        setRooms(newRooms);
                                                    }}
                                                    placeholder="0000"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setRooms([...rooms, { ...defaultRoom, id: Date.now() }])}
                                    className="w-full py-3 border border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 mb-8"
                                >
                                    <Home size={16} /> Add Another Room
                                </button>

                                {/* Section: Global Financials */}
                                <div className="form-section">
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="input-label text-danger">Old Pending Balance (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input border-danger-soft"
                                                value={formData.arrears}
                                                onChange={e => setFormData({ ...formData, arrears: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label">Global Other Charges (₹)</label>
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
                                {/* Language Toggle */}
                                <div className="mb-6 flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        onClick={() => setLanguage('en')}
                                    >
                                        English
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${language === 'hi' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        onClick={() => setLanguage('hi')}
                                    >
                                        हिंदी (Hindi)
                                    </button>
                                </div>

                                <div className="receipt-container w-full" style={{ maxWidth: '600px' }}>
                                    {/* Detailed Receipt Visual */}
                                    <div ref={receiptRef} className="receipt-paper" style={{ padding: '40px' }}>
                                        <div className="text-center mb-8">
                                            <div className="text-3xl font-bold uppercase tracking-wider text-slate-800">{translations[language].receiptTitle}</div>
                                            <div className="text-base font-medium text-slate-500 mt-2">{result.billMonth} {result.billYear}</div>
                                            <div style={{ borderBottom: '2px solid #cbd5e1', margin: '20px auto', width: '100%' }}></div>
                                        </div>

                                        {/* Tenant Details Row */}
                                        <div className="flex justify-between items-start mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{translations[language].tenant}</div>
                                                <div className="text-2xl font-bold text-slate-900 leading-tight">{result.name || 'Unknown Tenant'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{translations[language].rooms}</div>
                                                <div className="text-sm font-bold text-slate-900">{result.rooms ? result.rooms.length : 1} {translations[language].total}</div>
                                            </div>
                                        </div>

                                        {/* Rooms List */}
                                        {(result.rooms || [result]).map((room, idx) => (
                                            <div key={idx} className="mb-6 border border-slate-200 rounded-lg overflow-hidden bg-white">
                                                <div className="flex justify-between items-center py-2 px-4 bg-slate-50 border-b border-slate-200">
                                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Home size={14} className="text-blue-500" /> {room.roomType || 'Room'} <span className="text-xs text-slate-500 font-normal">({formatFloor(room.floor)})</span>
                                                    </div>
                                                    <div className="font-mono font-bold text-slate-800 text-sm">Rent: ₹{parseFloat(room.rent || 0).toFixed(2)}</div>
                                                </div>
                                                <div className="p-4 pt-2">
                                                    <table style={{ width: '100%' }}>
                                                        <thead>
                                                            <tr className="text-[10px] text-slate-400 text-left border-b border-slate-50">
                                                                <th className="pb-1 font-bold">{translations[language].readings}</th>
                                                                <th className="pb-1 font-bold text-center">{translations[language].units}</th>
                                                                <th className="pb-1 font-bold text-right">{translations[language].rate}</th>
                                                                <th className="pb-1 font-bold text-right text-slate-700">{translations[language].elec}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-2">
                                                                    <div className="text-xs text-slate-600">{translations[language].cur}: <span className="font-mono font-bold text-slate-800">{room.currReading}</span></div>
                                                                    <div className="text-xs text-slate-600">{translations[language].pre}: <span className="font-mono font-bold text-slate-800">{room.prevReading}</span></div>
                                                                </td>
                                                                <td className="py-2 text-center align-middle">
                                                                    <span className="font-mono font-bold text-slate-800">{parseFloat(room.units || 0).toFixed(2)}</span>
                                                                </td>
                                                                <td className="py-2 text-right align-middle">
                                                                    <span className="font-mono text-slate-600 text-xs">₹{room.ratePerUnit}</span>
                                                                </td>
                                                                <td className="py-2 text-right align-middle">
                                                                    <span className="font-mono font-bold text-slate-900">₹{parseFloat(room.elecAmount || 0).toFixed(2)}</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Main Charges Summary */}
                                        <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 font-medium text-base">{translations[language].totalRent}</span>
                                                <span className="font-mono font-bold text-slate-800 text-base">₹{(result.totalRent !== undefined ? result.totalRent : parseFloat(result.rent)).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 font-medium text-base">{translations[language].totalElectricity}</span>
                                                <span className="font-mono font-bold text-slate-800 text-base">₹{(result.totalElec !== undefined ? result.totalElec : parseFloat(result.elecAmount)).toFixed(2)}</span>
                                            </div>

                                            {result.otherCharges > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium text-base">{translations[language].otherCharges}</span>
                                                    <span className="font-mono font-bold text-slate-800 text-base">₹{parseFloat(result.otherCharges).toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div style={{ borderBottom: '2px dashed #cbd5e1', margin: '15px 0' }}></div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-slate-900">{translations[language].currentMonth}</span>
                                                <span className="text-xl font-bold text-slate-900">
                                                    ₹{((result.totalRent !== undefined ? result.totalRent : parseFloat(result.rent)) + (result.totalElec !== undefined ? result.totalElec : result.elecAmount) + parseFloat(result.otherCharges || 0)).toFixed(2)}
                                                </span>
                                            </div>

                                            {result.arrears > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium text-base">{translations[language].oldPendingBalance}</span>
                                                    <span className="font-mono font-bold text-slate-800 text-base">₹{parseFloat(result.arrears).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Grand Total Footer */}
                                        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '2rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{translations[language].totalPayable}</span>
                                                <span className="text-xs text-slate-500 mt-1">{translations[language].payByDueDate}</span>
                                            </div>
                                            <span className="text-5xl font-bold">₹{result.total.toFixed(2)}</span>
                                        </div>

                                        <div className="mt-8 text-center text-slate-400 text-xs">
                                            <p>{translations[language].thankYou}</p>
                                            <p className="mt-1">{translations[language].generatedOn} {result.generatedAt}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-6">
                                        <button onClick={handleShareWhatsapp} className="btn bg-green-500 hover:bg-green-600 text-white shadow-lg justify-center py-4 text-lg font-bold rounded-xl transition-transform hover:scale-[1.02] flex items-center">
                                            <Share2 size={24} className="mr-3" /> WhatsApp
                                        </button>
                                        <button onClick={handleDownloadPDF} className="btn bg-blue-600 hover:bg-blue-500 text-white shadow-lg justify-center py-4 text-lg font-bold rounded-xl transition-transform hover:scale-[1.02] flex items-center">
                                            <Download size={24} className="mr-3" /> Download PDF
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
                                                    Rent: <span className="text-slate-200">₹{item.totalRent !== undefined ? item.totalRent : item.rent}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                    Elec: <span className="text-slate-200">₹{(item.totalElec !== undefined ? item.totalElec : item.elecAmount).toFixed(0)}</span>
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
