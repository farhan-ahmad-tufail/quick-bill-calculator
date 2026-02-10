import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Zap, Home, Users, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rData, tData] = await Promise.all([
                api.getRooms(),
                api.getTenants()
            ]);
            setRooms(rData);
            setTenants(tData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    // Calculate Stats
    const totalRooms = rooms.length;
    const occupiedRooms = tenants.filter(t => t.active).length;
    const vacantRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Overview of your property</p>
                </div>
                <div className="text-right px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Occupancy</div>
                    <div className="text-xl font-bold text-white font-mono">{occupancyRate}%</div>
                </div>
            </div>

            {/* Stats Grid - Compact & Modern */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card glass-card p-5 flex items-center gap-4 relative overflow-hidden group border-l-4 border-l-blue-500">
                    <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-500/10 to-transparent group-hover:from-blue-500/20 transition-all duration-500"></div>
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Home size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white leading-none mb-1">{totalRooms}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Units</div>
                    </div>
                </div>

                <div className="card glass-card p-5 flex items-center gap-4 relative overflow-hidden group border-l-4 border-l-emerald-500">
                    <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-emerald-500/10 to-transparent group-hover:from-emerald-500/20 transition-all duration-500"></div>
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Users size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white leading-none mb-1">{occupiedRooms}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</div>
                    </div>
                </div>

                <div className="card glass-card p-5 flex items-center gap-4 relative overflow-hidden group border-l-4 border-l-amber-500">
                    <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-amber-500/10 to-transparent group-hover:from-amber-500/20 transition-all duration-500"></div>
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white leading-none mb-1">{vacantRooms}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vacant</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                    <Zap className="text-yellow-400 fill-yellow-400" size={18} />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-2">
                    {rooms.map(room => (
                        <div key={room.id} className="card glass-card hover:bg-slate-800/80 transition-all duration-300 border-slate-700/50 hover:border-indigo-500/30 group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        <Home size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-tight">Room {room.roomNumber}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{room.type.split('_').join(' ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs mb-3 p-2 bg-slate-900/50 rounded border border-white/5">
                                <span className="text-slate-400 font-medium">Submeter</span>
                                <span className="font-mono font-bold text-indigo-300">{room.submeterReading || 'N/A'}</span>
                            </div>

                            <button className="btn btn-primary w-full justify-center text-sm py-2 shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20 text-white">
                                <Zap size={14} className="mr-1.5" />
                                Add Reading
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
