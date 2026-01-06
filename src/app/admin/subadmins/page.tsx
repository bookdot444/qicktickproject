"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  UserCheck,
  Key,
  Lock,
  Hash
} from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function SubAdminPage() {
  const [subadmins, setSubadmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchSubAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("role", "subadmin")
      .order("created_at", { ascending: false });

    if (!error) setSubadmins(data || []);
    setLoading(false);
  }, []);

  const addSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const { error } = await supabase.from("admin_users").insert({
      email,
      password,
      role: "subadmin",
    });

    if (!error) {
      setEmail("");
      setPassword("");
      fetchSubAdmins();
    }
    setSubmitting(false);
  };

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins]);

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
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Security Infrastructure</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Access <span className="text-[#e11d48]">Control</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Personnel authorization gateway. Provisioning sub-administrator credentials and security clearance levels.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[140px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Active Admins</p>
                <p className="text-3xl font-black text-[#e11d48]">{subadmins.length}</p>
              </div>
              <button 
                onClick={fetchSubAdmins} 
                className="bg-black hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- AUTHORIZATION FORM --- */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl sticky top-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-yellow-300">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none">Provision User</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">New Sub-Admin Access</p>
                </div>
              </div>
              
              <form onSubmit={addSubAdmin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="OPERATOR@SYSTEM.COM"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-600 focus:bg-white outline-none font-black text-xs text-slate-900 transition-all placeholder:text-slate-300 uppercase tracking-widest"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Security Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-red-600 focus:bg-white outline-none font-black text-xs text-slate-900 transition-all placeholder:text-slate-300 uppercase tracking-widest"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-black text-yellow-300 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white disabled:bg-slate-200 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 italic"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                    <>Authorize Clearance <Key size={16} /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* --- PERSONNEL LIST --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel Identity</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Clearance</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="p-8"><div className="h-12 bg-slate-100 rounded-2xl w-full"></div></td>
                      </tr>
                    ))
                  ) : subadmins.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-32 text-center">
                        <UserCheck size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300 italic">No Authorized Personnel Detected</p>
                      </td>
                    </tr>
                  ) : (
                    subadmins.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50 transition-all">
                        <td className="p-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-yellow-300 font-black text-lg italic shadow-lg">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-base uppercase italic tracking-tighter leading-none mb-1">{user.email}</div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
                                <Hash size={12} className="text-red-500" /> ID: {user.id.slice(0, 8)} • Commissioned: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className="px-5 py-2 bg-yellow-100 text-red-900 text-[9px] font-black uppercase tracking-widest rounded-full border border-yellow-200 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all italic">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <button className="p-4 bg-slate-50 text-slate-400 hover:text-white hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}