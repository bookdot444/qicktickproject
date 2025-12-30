"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Users, Store, Truck, RefreshCw, ArrowRight, 
  ShieldCheck, Activity, CreditCard, LayoutGrid, 
  Image as ImageIcon, UserPlus
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/count-users");
      const userData = await res.json();
      setTotalCustomers(userData.totalCustomers || 0);

      const { count: vendors } = await supabase
        .from("vendor_register")
        .select("*", { count: "exact", head: true });
      setTotalVendors(vendors || 0);

      const { count: transport } = await supabase
        .from("travel_requests")
        .select("*", { count: "exact", head: true });
      setTotalTransport(transport || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-[#facc15] pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Central Command</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                Admin <span className="text-[#e11d48]">Dashboard</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed italic">
                Platform Intelligence Hub. Real-time monitoring of user metrics, vendor partnerships, and logistics.
              </p>
            </div>
            
            <button 
              onClick={fetchCounts}
              disabled={loading}
              className="bg-black hover:bg-red-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl transition-all shadow-2xl active:scale-95 group font-black text-[10px] uppercase tracking-widest italic"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Total Customers */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl group hover:shadow-2xl transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-900 text-[#facc15] rounded-2xl shadow-lg">
                <Users size={28} />
              </div>
              <Activity className="text-emerald-500 animate-pulse" size={20} />
            </div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Users</h2>
            <p className="text-5xl font-black text-slate-900 italic tracking-tighter mb-6">{totalCustomers}</p>
            <Link href="/admin/customers" className="mt-auto flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              User Database <ArrowRight size={14} />
            </Link>
          </div>

          {/* Total Vendors */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl group hover:shadow-2xl transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-black text-[#facc15] rounded-2xl shadow-lg">
                <Store size={28} />
              </div>
              <ShieldCheck className="text-blue-500" size={20} />
            </div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Partner Network</h2>
            <p className="text-5xl font-black text-slate-900 italic tracking-tighter mb-6">{totalVendors}</p>
            <Link href="/admin/vendors" className="mt-auto flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Vendor Dossiers <ArrowRight size={14} />
            </Link>
          </div>

          {/* Transport Requests */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl group hover:shadow-2xl transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-black text-[#facc15] rounded-2xl shadow-lg">
                <Truck size={28} />
              </div>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-lg border border-amber-100 italic">Live Loads</div>
            </div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Transit Requests</h2>
            <p className="text-5xl font-black text-slate-900 italic tracking-tighter mb-6">{totalTransport}</p>
            <Link href="/admin/transportation" className="mt-auto flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Travel Manifest <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* QUICK MANAGEMENT TASKS */}
        <div className="bg-white rounded-[3.5rem] border border-slate-200 p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
            <div className="h-8 w-2 bg-[#e11d48] rounded-full" />
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">System Operations</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Manage Categories", href: "/admin/category", icon: <LayoutGrid size={18}/> },
              { name: "Website Banners", href: "/admin/site-home/digital-banner", icon: <ImageIcon size={18}/> },
              { name: "Payment Tracking", href: "/admin/payment-tracking", icon: <CreditCard size={18}/> },
              { name: "Sub Admin Panel", href: "/admin/subadmins", icon: <UserPlus size={18}/> }
            ].map((task) => (
              <Link 
                key={task.name} 
                href={task.href}
                className="group p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center text-center transition-all hover:bg-black hover:border-black active:scale-95 shadow-sm"
              >
                <div className="mb-4 text-[#e11d48] group-hover:text-[#facc15] transition-colors">
                  {task.icon}
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-white transition-colors">
                  {task.name}
                </span>
              </Link>
            ))}
          </div>
          
          {/* System Footer Decorative Element */}
          <div className="mt-12 flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> System Online</div>
             <div className="italic">Authorized Admin Access Only</div>
          </div>
        </div>
      </div>
    </div>
  );
}