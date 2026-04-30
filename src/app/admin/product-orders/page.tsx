"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Store,
  TrendingUp,
  Box,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  CreditCard,
  X,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function ProductOrdersPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVendor, setOpenVendor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid");
  const [selectedBankDetails, setSelectedBankDetails] = useState<any | null>(null);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, vendors: 0 });

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    setLoading(true);
    try {
      const [{ data: vendorList }, { data: bankAccounts }, { data: orders }] = await Promise.all([
        supabase.from("vendor_register").select("*"),
        supabase.from("vendor_bank").select("*"), // Fetching from your new table
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
            const vendorData = vendorList.find((v) => v.id === vId);
            const bankData = bankAccounts?.find((b) => b.vendor_id === vId); // Link Bank Table

            vendorMap[vId] = {
              id: vId,
              name: vendorData?.company_name || "Partner Vendor",
              bankDetails: {
                account_no: bankData?.account_number || "N/A", // From new table
                ifsc: bankData?.ifsc_code || "N/A",
                bank_name: bankData?.bank_name || "N/A",
                holder: bankData?.holder_name || vendorData?.company_name
              },
              revenue: 0,
              itemsCount: 0,
              sales: [],
            };
          }


          // Inside items.forEach loop (Replace your old calculation with this):
const lineTotal = Number(item.product.price) * Number(item.quantity);
const itemStatus = order.vendor_amount_status || "unpaid";

// FIX: Only add to totals if the item status matches the active tab (Pending/Settled)
if (itemStatus === activeTab) {
  vendorMap[vId].revenue += lineTotal;
  vendorMap[vId].itemsCount += Number(item.quantity);
  totalRev += lineTotal;
}

vendorMap[vId].sales.push({
  ...order,
  currentItem: item,
  vStatus: itemStatus
});
          
        });
      });

      const processedVendors = Object.values(vendorMap).map((v: any) => ({
        ...v,
        // Filter sales based on the active tab
        filteredSales: v.sales.filter((s: any) => s.vStatus === activeTab)
      })).filter(v => v.filteredSales.length > 0);

      setVendors(processedVendors);
      setStats({ revenue: totalRev, orders: orders.length, vendors: processedVendors.length });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run filter when tab changes
  useEffect(() => {
    fetchVendorOrders();
  }, [activeTab]);

const handleMarkAsPaid = async (vendorId: string) => {
  try {
    setLoading(true);
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const orderIdsToUpdate = vendor.filteredSales
      .filter((sale: any) => sale.vStatus === "unpaid")
      .map((sale: any) => sale.id);

    // 1. Update Database
    const { error } = await supabase
      .from("orders")
      .update({ vendor_amount_status: "paid" })
      .in("id", orderIdsToUpdate);

    if (error) throw error;

    // 2. Trigger Email Notification via Edge Function
    // You'll need the vendor's email from your vendor_register table
    await supabase.functions.invoke('send-payout-email', {
      body: { 
        vendorEmail: vendor.email, // Ensure email is in your vendor object
        vendorName: vendor.name,
        amount: vendor.revenue 
      },
    });

    setSelectedBankDetails(null);
    await fetchVendorOrders();
    alert(`Payout released and email sent to ${vendor.name}!`);

  } catch (err) {
    console.error("Payout Process Error:", err);
    alert("Process failed. Check console.");
  } finally {
    setLoading(false);
  }
};

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">

      {/* --- MASTER YELLOW COMMAND HEADER --- */}
      <div className="bg-yellow-300 pt-10 pb-32 px-6 md:px-10 rounded-b-[4rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-red-600" size={18} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Finance Control Unit</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-none italic">
                Vendor <span className="text-red-600">Payouts</span>
              </h1>
            </div>

            {/* TAB SYSTEM */}
            {/* TAB SYSTEM */}
<div className="flex gap-4 items-center">
  <div className="bg-black p-1.5 rounded-[2rem] flex gap-1 shadow-2xl">
    <TabButton 
      active={activeTab === "unpaid"} 
      onClick={() => setActiveTab("unpaid")} 
      label="Pending" 
      icon={<Clock size={14} />} 
    />
    <TabButton 
      active={activeTab === "paid"} 
      onClick={() => setActiveTab("paid")} 
      label="Settled" 
      icon={<CheckCircle2 size={14} />} 
    />
  </div>

  {/* NEW REFRESH BUTTON */}
  <button 
    onClick={() => fetchVendorOrders()} 
    className="bg-white p-3 rounded-full hover:bg-black hover:text-white transition-all shadow-lg group"
    disabled={loading}
  >
    <Zap size={18} className={`${loading ? "animate-spin text-red-600" : "text-black group-hover:text-yellow-400"}`} />
  </button>
</div>
          </div>

          {/* BENTO STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatBox label="System Revenue" value={`₹${stats.revenue.toLocaleString()}`} sub="Gross Volume" isHighlight />
            <StatBox label="Filtered Nodes" value={stats.vendors} sub={`Status: ${activeTab}`} />
            <div className="relative group overflow-hidden bg-white/40 border border-white/50 p-8 rounded-[2.5rem]">
              <Search className="absolute right-8 top-8 text-red-900/20 group-focus-within:text-red-600 transition-colors" size={40} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-red-900/60">Search Engine</p>
              <input
                type="text"
                placeholder="BY NAME..."
                className="bg-transparent border-none text-2xl font-black uppercase tracking-tighter w-full outline-none placeholder:text-black/10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 -mt-16 relative z-20">
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4 bg-white rounded-[3rem] shadow-xl border border-slate-100">
              <Zap className="animate-pulse text-red-600" size={40} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Financial Data...</span>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">No {activeTab} records detected</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <VendorCollapse
                key={vendor.id}
                vendor={vendor}
                isOpen={openVendor === vendor.id}
                onToggle={() => setOpenVendor(openVendor === vendor.id ? null : vendor.id)}
                onViewBank={() => setSelectedBankDetails(vendor)}
              />
            ))
          )}
        </div>
      </main>

      {/* --- BANK DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedBankDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border-4 border-yellow-300"
            >
              <div className="bg-yellow-300 p-8 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Bank Dossier</h2>
                <button onClick={() => setSelectedBankDetails(null)} className="bg-black text-white p-2 rounded-full hover:scale-110 transition-transform">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <BankRow label="Vendor Name" value={selectedBankDetails.name} />
                <BankRow label="Account Number" value={selectedBankDetails.bankDetails.account_no} />
                <BankRow label="IFSC Code" value={selectedBankDetails.bankDetails.ifsc} />
                <BankRow label="Bank Name" value={selectedBankDetails.bankDetails.bank_name} />

                <div className="pt-4 space-y-4">
                  <div className="bg-slate-900 text-yellow-400 p-4 rounded-2xl flex items-center gap-4">
                    <ShieldCheck size={24} />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">Verification Status</p>
                      <p className="text-xs font-bold uppercase">System Verified Payment Endpoint</p>
                    </div>
                  </div>

                  {/* ACTION BUTTON: Only show if there are unpaid orders */}
                  {activeTab === "unpaid" && (
                    <button
                      onClick={() => handleMarkAsPaid(selectedBankDetails.id)}
                      className="w-full bg-red-600 hover:bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                    >
                      <Zap size={18} className="group-hover:text-yellow-400 fill-current" />
                      <span className="uppercase tracking-widest text-xs">Release ₹{selectedBankDetails.revenue.toLocaleString()} Payout</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-[1.5rem] flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-yellow-300 text-black shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}
    >
      {icon} {label}
    </button>
  );
}

function StatBox({ label, value, sub, isHighlight }: any) {
  return (
    <div className={`backdrop-blur-md p-8 rounded-[2.5rem] border transition-all shadow-sm ${isHighlight ? 'bg-black text-yellow-400 border-black' : 'bg-white/40 border-white/50 text-black'}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${isHighlight ? 'text-yellow-400/60' : 'text-red-900/60'}`}>{label}</p>
      <h2 className="text-4xl font-black italic tracking-tighter">{value}</h2>
      <p className={`text-[8px] font-bold uppercase mt-2 tracking-widest ${isHighlight ? 'text-yellow-400/40' : 'text-slate-500'}`}>{sub}</p>
    </div>
  );
}

function BankRow({ label, value }: any) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-black tracking-tight">{value}</p>
    </div>
  );
}

function VendorCollapse({ vendor, isOpen, onToggle, onViewBank }: any) {
  return (
    <div className={`bg-white border-2 rounded-[3rem] overflow-hidden transition-all duration-500 ${isOpen ? 'border-red-600 shadow-2xl scale-[1.01]' : 'border-slate-100 hover:border-black shadow-sm'}`}>
      <div
        className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-lg ${isOpen ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'}`}>
            <Store size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">{vendor.name}</h3>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onViewBank(); }}
                className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-yellow-400 transition-colors"
              >
                <CreditCard size={12} /> View Bank
              </button>
              <span className="bg-slate-100 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">{vendor.filteredSales.length} ACTIVE ORDERS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total to Settle</p>
            <p className="text-3xl font-black text-black italic">₹{vendor.revenue.toLocaleString()}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black border-black text-yellow-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            <ChevronDown size={24} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-t-2 border-slate-100"
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.filteredSales.map((sale: any, i: number) => (
                <div key={i} className="bg-white border-2 border-slate-100 p-5 rounded-[2.5rem] flex flex-col gap-4 hover:border-black transition-all group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={sale.currentItem.product.product_image?.split("|||")[0]}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                        alt="product"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase truncate text-black tracking-tight">{sale.currentItem.product.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={10} className="text-slate-400" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(sale.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-black text-black mt-1 italic tracking-tighter">₹{(sale.currentItem.product.price * sale.currentItem.quantity).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${sale.vStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {sale.vStatus}
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-black flex items-center gap-1">
                      Details <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}