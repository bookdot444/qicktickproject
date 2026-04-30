"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Download,
  Search,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function VendorPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({ pending: 0, settled: 0 });

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Vendor Profile
      const { data: vendorData } = await supabase
        .from("vendor_register")
        .select("id, company_name")
        .eq("user_id", user.id)
        .single();

      if (!vendorData) return;
      setVendor(vendorData);

      // 2. Fetch all orders containing this vendor's products
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let pendingAcc = 0;
      let settledAcc = 0;

      // 3. Process orders to extract vendor-specific share
      const vendorTx = (orders || []).map((order: any) => {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        // Calculate only this vendor's items in the order
        const vendorShare = items
          .filter((item: any) => item?.product?.vendor_id?.toString() === vendorData.id.toString())
          .reduce((sum: number, item: any) => sum + (item.quantity * item.product?.price), 0);

        if (vendorShare > 0) {
          if (order.vendor_amount_status === 'paid') {
            settledAcc += vendorShare;
          } else {
            pendingAcc += vendorShare;
          }

          return {
            id: order.id,
            date: order.created_at,
            amount: vendorShare,
            status: order.vendor_amount_status || 'unpaid',
            order_status: order.order_status
          };
        }
        return null;
      }).filter(Boolean);

      setTransactions(vendorTx);
      setStats({ pending: pendingAcc, settled: settledAcc });
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter(tx => 
    filterStatus === "all" ? true : tx.status === filterStatus
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase animate-pulse">Loading Ledger...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-20 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b-2 border-slate-100 pt-10 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/vendor/orderplaced" className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6 hover:text-black transition-colors">
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase italic leading-none mb-2">Payout Ledger</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Overview for {vendor?.company_name}</p>
            </div>

            <div className="flex gap-3">
              <div className="bg-black text-white p-5 rounded-3xl min-w-[180px]">
                <p className="text-[9px] font-black uppercase text-yellow-400 mb-1">Total Pending</p>
                <h3 className="text-2xl font-black italic">₹{stats.pending.toLocaleString()}</h3>
              </div>
              <div className="bg-slate-100 p-5 rounded-3xl min-w-[180px]">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Total Settled</p>
                <h3 className="text-2xl font-black italic">₹{stats.settled.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE SECTION */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
          
          {/* TOOLBAR */}
          <div className="p-6 border-b-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              {['all', 'unpaid', 'paid'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white shadow-md text-black' : 'text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition-all">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-slate-400">Order ID</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-slate-400">Date</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-slate-400">Your Share</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-slate-400">Payout Status</th>
                  <th className="text-right py-5 px-8 text-[10px] font-black uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase text-xs">No transactions found</td>
                  </tr>
                ) : (
                  filteredTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8">
                        <p className="font-black text-sm italic uppercase">ORD-{tx.id.slice(0, 8)}</p>
                      </td>
                      <td className="py-5 px-8">
                        <p className="text-xs font-bold text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </td>
                      <td className="py-5 px-8">
                        <p className="text-lg font-black italic">₹{tx.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-5 px-8">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {tx.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span className="text-[9px] font-black uppercase tracking-wider">{tx.status}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <Link href={`/vendor/orders?id=${tx.id}`} className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-black">
                          View Details <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}