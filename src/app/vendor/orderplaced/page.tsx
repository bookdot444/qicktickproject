"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronDown,
  Truck,
  Printer,
  Store,
  CheckCircle2,
  Clock,
  Send,
  Wallet,
  ArrowUpRight,
  History
} from "lucide-react";
import Link from "next/link"; // Assuming you use Next.js for routing

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Financial States
  const [pendingPayout, setPendingPayout] = useState(0);
  const [receivedPayout, setReceivedPayout] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!vendor) return;
      setVendorProfile(vendor);

      const { data: allOrders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let unpaidAcc = 0;
      let paidAcc = 0;

      const filtered = (allOrders || [])
        .map((order: any) => {
          let items = order.items;
          if (typeof items === "string") {
            try { items = JSON.parse(items); } catch { items = []; }
          }

          const vendorItems = items
            .filter((item: any) => item?.product?.vendor_id?.toString() === vendor.id.toString())
            .map((item: any) => {
              const imageString = item.product?.product_image || "";
              let firstPath = imageString.split("|||")[0]?.trim();
              let publicUrl = null;

              if (firstPath) {
                if (firstPath.startsWith('http')) {
                  publicUrl = firstPath;
                } else {
                  const { data } = supabase.storage.from("products").getPublicUrl(firstPath);
                  publicUrl = data.publicUrl;
                }
              }
              return { ...item, display_image: publicUrl };
            });

          if (vendorItems.length > 0) {
            // Calculate vendor's share for this specific order
            const vendorOrderTotal = vendorItems.reduce((sum: number, item: any) => sum + (item.quantity * item.product?.price), 0);
            
            // Financial tracking based on vendor_amount_status
            if (order.vendor_amount_status === 'paid') {
              paidAcc += vendorOrderTotal;
            } else {
              unpaidAcc += vendorOrderTotal;
            }

            return {
              ...order,
              items: vendorItems,
              vendor_share: vendorOrderTotal, // store the specific share
              address: typeof order.address === "string" ? JSON.parse(order.address) : order.address,
            };
          }
          return null;
        })
        .filter(Boolean);

      setOrders(filtered);
      setPendingPayout(unpaidAcc);
      setReceivedPayout(paidAcc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (order: any) => {
    const confirmShip = confirm("Push to Shiprocket?");
    if (!confirmShip) return;

    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, orderData: order }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Order shipped successfully!");
        loadData();
      } else {
        alert("ERROR: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("❌ Request failed");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const status = order.order_status?.toLowerCase() || "pending";
    if (activeTab === "pending") return status === "pending" || status === "confirmed";
    return status === activeTab;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase animate-pulse">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 font-sans">
      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 5mm; }
          .no-print { display: none !important; }
          #printable-invoice { visibility: visible !important; width: 100%; }
        }
      `}</style>

      {/* VENDOR HEADER */}
      <header className="bg-white border-b-2 border-slate-100 pt-12 pb-8 px-6 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400 p-4 rounded-2xl"><Store size={28} /></div>
              <div>
                <h1 className="text-4xl font-black uppercase italic leading-none mb-1">{vendorProfile?.company_name}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor Dashboard</p>
              </div>
            </div>

            {/* FINANCIAL SUMMARY CARD */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-black text-white p-6 rounded-[2rem] flex-1 md:min-w-[240px] relative overflow-hidden group">
                <Wallet className="absolute -right-2 -bottom-2 text-white/10 w-24 h-24" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-1">To be Received</p>
                <h2 className="text-3xl font-black italic">₹{pendingPayout.toLocaleString()}</h2>
                
                {/* NAVIGATION BUTTON TO PAYOUTS PAGE */}
                <Link href="/vendor/payouts">
                  <button className="mt-4 flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase hover:scale-105 transition-transform">
                    View Details <ArrowUpRight size={14} />
                  </button>
                </Link>
              </div>

              <div className="bg-slate-100 p-6 rounded-[2rem] flex-1 md:min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Settled</p>
                <h2 className="text-3xl font-black italic text-slate-400">₹{receivedPayout.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase">
                  <CheckCircle2 size={12} /> Payment History
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex justify-center mt-10">
            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] no-print">
              {[
                { id: "pending", label: "Pending", icon: <Clock size={14} /> },
                { id: "shipped", label: "Shipped", icon: <Send size={14} /> },
                { id: "delivered", label: "Delivered", icon: <CheckCircle2 size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-black text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid gap-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
              No orders in {activeTab}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={`bg-white rounded-[2.5rem] border-2 transition-all overflow-hidden ${openOrder === order.id ? 'border-yellow-400 shadow-xl' : 'border-slate-100'}`}>
                
                {/* Row Header */}
                <div className="p-6 cursor-pointer flex items-center justify-between no-print" onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}>
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center text-slate-400"><Package size={20} /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-lg italic uppercase">ORD-{order.id.slice(0, 8)}</p>
                        {order.vendor_amount_status === 'paid' ? (
                          <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Settled</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Unpaid</span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 italic">Order Total: ₹{order.vendor_share}</p>
                    </div>
                  </div>
                  <ChevronDown size={20} className={openOrder === order.id ? "rotate-180 text-yellow-500" : ""} />
                </div>

                {/* Expanded Invoice */}
                {openOrder === order.id && (
                  <div id="printable-invoice" className="p-8 md:p-10">
                    <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Packing Slip</p>
                      <div className="text-right">
                        <p className="text-xl font-black italic">#{order.id.slice(0, 10).toUpperCase()}</p>
                        <p className="text-[10px] font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                      <div className="border-2 border-black p-6 rounded-xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Deliver To:</p>
                        <h4 className="text-xl font-black uppercase mb-2">{order.address?.name}</h4>
                        <p className="text-sm font-bold leading-relaxed text-slate-700 uppercase">
                          {order.address?.address}<br />
                          {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                        </p>
                        <p className="mt-4 text-sm font-black italic">Ph: {order.address?.phone}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center">
                         <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment Info:</p>
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase">Settlement Status:</span>
                            <span className={`text-xs font-black uppercase ${order.vendor_amount_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {order.vendor_amount_status}
                            </span>
                         </div>
                      </div>
                    </div>

                    <table className="w-full mb-8">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-4 text-[10px] font-black uppercase w-16">Preview</th>
                          <th className="text-left py-4 text-[10px] font-black uppercase">Product</th>
                          <th className="text-center py-4 text-[10px] font-black uppercase">Qty</th>
                          <th className="text-right py-4 text-[10px] font-black uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-4">
                              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border-2 border-slate-50 relative">
                                <img src={item.display_image || "https://placehold.co/100"} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="py-4 text-sm font-black uppercase">{item.product?.product_name}</td>
                            <td className="py-4 text-center font-bold">{item.quantity}</td>
                            <td className="py-4 text-right font-black">₹{item.quantity * item.product?.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-end border-t-4 border-black pt-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Order Status</p>
                        <p className="text-sm font-black uppercase italic">{order.order_status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Vendor Total Share</p>
                        <p className="text-4xl font-black italic">₹{order.vendor_share}</p>
                      </div>
                    </div>

                    <div className="mt-12 flex gap-4 no-print">
                      <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-black py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-slate-50">
                        <Printer size={20} /> Print Slip
                      </button>
                      {activeTab === "pending" && (
                        <button onClick={() => handleShipOrder(order)} className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all">
                          <Truck size={20} /> Ship Now
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}