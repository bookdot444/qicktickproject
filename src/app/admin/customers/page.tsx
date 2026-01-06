"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  RefreshCw, 
  Search, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck,
  Activity,
  User
} from "lucide-react";

export default function CustomerListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/get-users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
        else setUsers([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.user_metadata?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Administrative Core</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Member <span className="text-[#e11d48]">Database</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Verified platform intelligence. Monitoring registered user growth and authentication cycles.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[140px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Live Users</p>
                <p className="text-3xl font-black text-[#e11d48]">{users.length}</p>
              </div>
              <button 
                onClick={fetchUsers} 
                className="bg-black hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        
        {/* SEARCH BAR */}
        <div className="mb-8">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="SEARCH BY EMAIL OR NAME..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-red-600 outline-none shadow-xl shadow-slate-200/50 font-black text-xs uppercase tracking-[0.2em] transition-all"
              />
           </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Registration</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Session</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <RefreshCw className="animate-spin text-red-600 mx-auto mb-4" size={40} />
                      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Syncing database...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <Users className="text-slate-100 mx-auto mb-4" size={64} />
                      <p className="font-black text-xs uppercase tracking-widest text-slate-400">No matching records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          {/* Profile Circle */}
                          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-[#facc15] font-black text-lg italic shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform overflow-hidden">
                             {u.user_metadata?.name ? (
                               u.user_metadata.name.charAt(0).toUpperCase()
                             ) : (
                               <User size={24} />
                             )}
                          </div>
                          <div>
                            {/* Priority logic: If name exists, show it, else show email as primary */}
                            <h4 className="font-black text-slate-900 leading-none mb-2 text-base uppercase italic tracking-tighter">
                              {u.user_metadata?.name || u.email.split('@')[0]}
                            </h4>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                              <Mail size={12} className="text-red-500" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Joined</span>
                          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs italic">
                            <Calendar size={14} className="text-red-600" />
                            {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Network Activity</span>
                          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs italic">
                            <Clock size={14} className="text-slate-400" />
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "NONE RECORDED"}
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        {u.last_sign_in_at ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                            <Activity size={10} className="animate-pulse" />
                            Authenticated
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                            No Activity
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          {!loading && (
            <div className="bg-slate-50/50 p-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Total Records: {filteredUsers.length}
                </p>
              </div>
              <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
                 Security System Active
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}