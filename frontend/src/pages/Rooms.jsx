import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Home, Tag, IndianRupee, Zap, X, Layers, Trash2, Edit2 } from 'lucide-react';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        type: 'MEDIUM',
        floor: '',
        baseRent: '',
        submeterReading: ''
    });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await api.getRooms();
            setRooms(data);
        } catch (err) {
            console.error('Error loading rooms:', err);
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            type: room.type,
            floor: room.floor || '',
            baseRent: room.baseRent,
            submeterReading: room.submeterReading || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
            try {
                await api.deleteRoom(id);
                loadRooms();
            } catch (err) {
                console.error('Error deleting room:', err);
                alert(`Failed to delete room: ${err.message}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.updateRoom(editingRoom.id, formData);
            } else {
                await api.createRoom(formData);
            }
            setShowForm(false);
            setEditingRoom(null);
            setFormData({ roomNumber: '', type: 'MEDIUM', floor: '', baseRent: '', submeterReading: '' });
            loadRooms();
        } catch (err) {
            console.error('Error saving room:', err);
            alert(`Failed to save room: ${err.message || 'Unknown error'}`);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingRoom(null);
        setFormData({ roomNumber: '', type: 'MEDIUM', floor: '', baseRent: '', submeterReading: '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Rooms</h1>
                    <p className="text-muted text-sm mt-1">Manage apartment units and meters</p>
                </div>
                <button
                    onClick={() => { setEditingRoom(null); setFormData({ roomNumber: '', type: 'MEDIUM', floor: '', baseRent: '', submeterReading: '' }); setShowForm(!showForm); }}
                    className="btn btn-primary shadow-glow"
                >
                    <Plus size={20} />
                    Add New Room
                </button>
            </div>

            {showForm && (
                <div className="card glass-card mb-8 fade-in-up active border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-accent/20 rounded-lg text-accent">
                                    <Home size={24} />
                                </div>
                                <span>{editingRoom ? 'Edit Room Details' : 'New Room Details'}</span>
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <Home size={14} className="text-accent" /> Room Number
                                </label>
                                <input
                                    className="form-input text-lg"
                                    value={formData.roomNumber}
                                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                    required
                                    placeholder="e.g. 101"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <Tag size={14} className="text-accent" /> Type
                                </label>
                                <select
                                    className="form-input text-lg"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="SMALL">Small</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="BIG_WINDOW">Big (window)</option>
                                    <option value="SHOP">Shop</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <Layers size={14} className="text-accent" /> Floor
                                </label>
                                <input
                                    className="form-input text-lg"
                                    value={formData.floor}
                                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                    placeholder="e.g. 1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label flex items-center gap-2">
                                    <IndianRupee size={14} className="text-accent" /> Base Rent
                                </label>
                                <input
                                    className="form-input text-lg"
                                    type="number"
                                    value={formData.baseRent}
                                    onChange={e => setFormData({ ...formData, baseRent: e.target.value })}
                                    required
                                    placeholder="5000"
                                />
                            </div>
                            <div className="form-group col-span-1 md:col-span-2">
                                <label className="input-label flex items-center gap-2">
                                    <Zap size={14} className="text-accent" /> Submeter Reading
                                </label>
                                <input
                                    className="form-input text-lg font-mono"
                                    value={formData.submeterReading}
                                    onChange={e => setFormData({ ...formData, submeterReading: e.target.value })}
                                    placeholder="Initial Reading / Serial No."
                                />
                                <p className="text-xs text-muted mt-1 ml-1">Enter the initial reading or meter serial number</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-secondary px-6"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-8 shadow-glow">
                                {editingRoom ? 'Update Room' : 'Save Room'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.map(room => (
                    <div key={room.id} className="card glass-card hover:translate-y-[-4px] transition-transform duration-300 group relative border-slate-700/50">
                        {/* Action Buttons - Always visible on mobile, hover on desktop */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={() => handleEdit(room)}
                                className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors backdrop-blur-md"
                                title="Edit Room"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(room.id)}
                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors backdrop-blur-md"
                                title="Delete Room"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                        <Home size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl leading-none mb-1 text-white tracking-tight">{room.roomNumber}</h3>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">ROOM NO</span>
                                    </div>
                                </div>
                                {room.floor && (
                                    <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm backdrop-blur-sm">
                                        {room.floor}{['1', '2', '3'].includes(room.floor.slice(-1)) && !['11', '12', '13'].includes(room.floor.slice(-2)) ?
                                            (room.floor.slice(-1) === '1' ? 'st' : room.floor.slice(-1) === '2' ? 'nd' : 'rd') : 'th'} Flr
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-3 bg-slate-900/40 rounded-lg border border-white/5 transition-colors hover:bg-slate-900/60">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <Tag size={15} />
                                        <span>Type</span>
                                    </div>
                                    <span className="font-medium text-slate-200">{room.type.replace('_', ' ')}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm p-3 bg-slate-900/40 rounded-lg border border-white/5 transition-colors hover:bg-slate-900/60">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <IndianRupee size={15} />
                                        <span>Rent</span>
                                    </div>
                                    <span className="font-bold text-emerald-400">₹{room.baseRent}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm p-3 bg-slate-900/40 rounded-lg border border-white/5 transition-colors hover:bg-slate-900/60">
                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <Zap size={15} />
                                        <span>Submeter</span>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-amber-400 tracking-wider bg-amber-400/10 px-2 py-0.5 rounded">
                                        {room.submeterReading || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
