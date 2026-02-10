import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserPlus, User, CheckCircle, XCircle, X, Search, Phone, Home, Trash2, Edit2, Calendar } from 'lucide-react';

export default function Tenants() {
    const [tenants, setTenants] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        roomId: '',
        joinedDate: '',
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tData, rData] = await Promise.all([
                api.getTenants(),
                api.getRooms()
            ]);
            setTenants(tData);
            setRooms(rData);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    const handleEdit = (tenant) => {
        setEditingTenant(tenant);
        setFormData({
            name: tenant.name,
            mobile: tenant.mobile,
            roomId: tenant.room ? tenant.room.id : '',
            joinedDate: tenant.joinedDate,
            active: tenant.active
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tenant? This cannot be undone.')) {
            try {
                await api.deleteTenant(id);
                loadData();
            } catch (err) {
                console.error('Error deleting tenant:', err);
                alert(`Failed to delete tenant: ${err.message}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                joinedDate: formData.joinedDate,
                active: formData.active
            };

            if (editingTenant) {
                await api.updateTenant(editingTenant.id, payload, formData.roomId);
            } else {
                await api.addTenant(payload, formData.roomId);
            }

            setShowForm(false);
            setEditingTenant(null);
            setFormData({ name: '', mobile: '', roomId: '', joinedDate: '', active: true });
            loadData();
        } catch (err) {
            console.error('Error saving tenant:', err);
            alert(`Failed to save tenant: ${err.message || 'Unknown error'}`);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingTenant(null);
        setFormData({ name: '', mobile: '', roomId: '', joinedDate: '', active: true });
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mobile.includes(searchTerm) ||
        (t.room && t.room.roomNumber.toString().includes(searchTerm))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Tenants</h1>
                    <p className="text-muted text-sm mt-1">Directory of all active and past tenants</p>
                </div>
                <button
                    onClick={() => { setEditingTenant(null); setFormData({ name: '', mobile: '', roomId: '', joinedDate: '', isActive: true }); setShowForm(!showForm); }}
                    className="btn btn-primary shadow-glow"
                >
                    <UserPlus size={20} />
                    Onboard Tenant
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search by name, room, or mobile..."
                    className="form-input pl-10 bg-slate-800/50 border-slate-700 focus:bg-slate-800"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {showForm && (
                <div className="card glass-card mb-8 fade-in-up active border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus size={24} className="text-accent" />
                                <span>{editingTenant ? 'Edit Tenant Details' : 'Onboard New Tenant'}</span>
                            </h2>
                            <button onClick={resetForm} className="text-muted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    className="form-input text-lg"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Mobile Number</label>
                                <input
                                    className="form-input text-lg"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                    required
                                    placeholder="9876543210"
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Assign Room</label>
                                <select
                                    className="form-input text-lg"
                                    value={formData.roomId}
                                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Room...</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.roomNumber} ({r.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Joined Date and Status - Visible even for new tenants if needed, but critical for edit */}
                            <div className="form-group">
                                <label className="input-label">Joined Date</label>
                                <input
                                    type="date"
                                    className="form-input text-lg"
                                    value={formData.joinedDate}
                                    onChange={e => setFormData({ ...formData, joinedDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Status</label>
                                <select
                                    className="form-input text-lg"
                                    value={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
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
                                {editingTenant ? 'Update Tenant' : 'Onboard Tenant'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card glass-card p-0 overflow-hidden border border-slate-700/50">
                <div className="table-container">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="text-left p-4 pl-6">Name</th>
                                <th className="text-center p-4">Room</th>
                                <th className="text-left p-4">Mobile</th>
                                <th className="text-left p-4">Joined Date</th>
                                <th className="text-center p-4">Status</th>
                                <th className="text-right p-4 pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map(tenant => (
                                <tr key={tenant.id} className="group hover:bg-white/5 transition-colors border-b border-slate-700/50 last:border-0">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800 rounded-full text-slate-400 group-hover:text-white transition-colors">
                                                <User size={16} />
                                            </div>
                                            <span className="font-bold text-white group-hover:text-accent transition-colors">{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-center p-4">
                                        {tenant.room ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-white">
                                                <Home size={10} className="text-muted" />
                                                {tenant.room.roomNumber}
                                            </span>
                                        ) : <span className="text-muted text-xs italic">Unassigned</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Phone size={12} className="text-muted" />
                                            {tenant.mobile}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} />
                                            {tenant.joinedDate || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="text-center p-4">
                                        {tenant.active ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                                <XCircle size={12} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right p-4 pr-6">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(tenant)}
                                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                                title="Edit Tenant"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tenant.id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                title="Delete Tenant"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTenants.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-muted">
                                        No tenants found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
