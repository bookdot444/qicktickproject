"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Package,
  IndianRupee,
  Store,
  TrendingUp,
  Box,
  Search,
  ExternalLink,
  LayoutDashboard
} from "lucide-react";

export default function ProductOrdersPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVendor, setOpenVendor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ revenue: 0, orders: 0, vendors: 0 });

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    setLoading(true);
    try {
      const [{ data: vendorList }, { data: orders }] = await Promise.all([
        supabase.from("vendor_register").select("id, company_name"),
        supabase.from("orders").select("*").order("created_at", { ascending: false })
      ]);

      if (!orders || !vendorList) return;

      const vendorMap: Record<string, any> = {};
      let totalRev = 0;

      orders.forEach((order) => {
        let items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        if (!Array.isArray(items)) return;

        items.forEach((item) => {
          const vId = item?.product?.vendor_id;
          if (!vId) return;

          if (!vendorMap[vId]) {
            vendorMap[vId] = {
              id: vId,
              name: vendorList.find((v) => v.id === vId)?.company_name || "Partner Vendor",
              revenue: 0,
              itemsCount: 0,
              sales: [],
            };
          }

          const lineTotal = Number(item.product.price) * Number(item.quantity);
          vendorMap[vId].revenue += lineTotal;
          vendorMap[vId].itemsCount += Number(item.quantity);
          totalRev += lineTotal;
          vendorMap[vId].sales.push({ ...order, currentItem: item });
        });
      });

      const sorted = Object.values(vendorMap).sort((a, b) => b.revenue - a.revenue);
      setVendors(sorted);
      setStats({ revenue: totalRev, orders: orders.length, vendors: sorted.length });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white text-white pb-20 font-sans">
      
      {/* HEADER SECTION - Adjusted to match your Sidebar theme */}
      <div className="bg-[#1E293B] pt-12 pb-24 px-6 md:px-10 rounded-b-[2.5rem] border-b border-slate-700 shadow-2xl relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-yellow-500">
                <LayoutDashboard size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Metrics</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                Executive <span className="text-yellow-500">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                <TrendingUp size={14} className="text-emerald-400" /> Real-time Revenue Tracking
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Filter by vendor..." 
                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-yellow-500 transition-all text-sm shadow-inner"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* STATS GRID - Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatBox label="Gross Revenue" value={`₹${stats.revenue.toLocaleString()}`} sub="Live Inflow" color="text-yellow-500" />
            <StatBox label="Total Orders" value={stats.orders} sub="Lifetime Count" color="text-white" />
            <StatBox label="Active Partners" value={stats.vendors} sub="Verified Sources" color="text-white" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Fixed spacing to prevent overlap */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 mt-10">
        <div className="flex flex-col gap-4">
          {loading ? (
             <div className="py-20 flex flex-col items-center gap-4 bg-[#1E293B] rounded-[2rem] border border-slate-800">
               <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing database...</span>
             </div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-20 text-center bg-[#1E293B] rounded-[2rem] border border-slate-800">
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No matching records found</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <VendorCollapse 
                key={vendor.id} 
                vendor={vendor} 
                isOpen={openVendor === vendor.id}
                onToggle={() => setOpenVendor(openVendor === vendor.id ? null : vendor.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatBox({ label, value, sub, color }: any) {
  return (
    <div className="bg-[#0F172A]/40 backdrop-blur-md border border-slate-700/50 p-7 rounded-[2rem] hover:border-slate-600 transition-colors">
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">{label}</p>
      <h2 className={`text-3xl font-black italic tracking-tight ${color}`}>{value}</h2>
      <p className="text-[8px] font-bold text-slate-600 uppercase mt-2 tracking-widest">{sub}</p>
    </div>
  );
}

function VendorCollapse({ vendor, isOpen, onToggle }: any) {
  return (
    <div className={`bg-slate-500 border border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-yellow-500/50 shadow-2xl' : 'hover:border-slate-600'}`}>
      <div 
        className="p-6 md:p-7 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isOpen ? 'bg-yellow-500 text-black' : 'bg-[#0F172A] text-yellow-500'}`}>
            <Store size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight italic">{vendor.name}</h3>
            <p className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2 mt-1">
              <Box size={12} /> ID: {vendor.id.slice(0, 8)} • {vendor.itemsCount} SOLD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Commissionable Revenue</p>
            <p className="text-2xl font-black text-emerald-400 italic">₹{vendor.revenue.toLocaleString()}</p>
          </div>
          <div className={`w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center transition-all ${isOpen ? 'bg-yellow-500 border-yellow-500 text-black' : ''}`}>
            <ChevronDown size={20} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#161E2E] border-t border-slate-800"
          >
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.sales.map((sale: any, i: number) => (
                <div key={i} className="bg-[#1E293B] border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                  <img 
                    src={sale.currentItem.product.product_image?.split("|||")[0]} 
                    className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800" 
                    alt="product" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate text-slate-200">{sale.currentItem.product.product_name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Qty: {sale.currentItem.quantity}</p>
                    <p className="text-sm font-black text-white mt-1 italic">₹{(sale.currentItem.product.price * sale.currentItem.quantity).toLocaleString()}</p>
                  </div>
                  <button className="text-slate-500 hover:text-yellow-500 transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}