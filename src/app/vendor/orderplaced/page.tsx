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
  Send
} from "lucide-react";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

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

      const filtered = (allOrders || [])
        .map((order: any) => {
          let items = order.items;
          if (typeof items === "string") {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          const vendorItems = items.filter(
            (item: any) => item?.product?.vendor_id?.toString() === vendor.id.toString()
          );

          if (vendorItems.length > 0) {
            return {
              ...order,
              items: vendorItems,
              address: typeof order.address === "string" ? JSON.parse(order.address) : order.address,
            };
          }
          return null;
        })
        .filter(Boolean);

      setOrders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleShipOrder = async (order: any) => {
    const confirmShip = confirm("Push to Shiprocket?");
    if (!confirmShip) return;

    console.log("SENDING ORDER:", order);

    // ❌ BLOCK if address missing
    if (!order.address || !order.address.address) {
      alert("Address missing!");
      console.log("BAD ADDRESS:", order.address);
      return;
    }

    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderData: order
        }),
      });

      const data = await res.json();

      console.log("API RESPONSE:", data);

      if (data.success) {
        alert("✅ Order shipped successfully!");
        window.location.reload();
      } else {
        console.log("FULL ERROR RESPONSE:", data);

        alert(
          "ERROR:\n" +
          JSON.stringify(data, null, 2)
        );
      }
    } catch (err) {
      console.error(err);
      alert("❌ Request failed");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const status = order.order_status?.toLowerCase() || "pending";
    if (activeTab === "pending") return status === "pending" || status === "confirmed";
    return status === activeTab;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 font-sans">

      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 5mm; }
          body { background: white !important; }
          /* Hide tabs and buttons during print */
          .tabs-container, .print-btn, .ship-btn, .no-print-action {
            display: none !important;
          }
          /* Ensure header address and invoice are visible */
          header { border-bottom: 2px solid black !important; padding-top: 10px !important; }
          #printable-invoice {
            width: 100%;
            visibility: visible !important;
            padding: 10px;
          }
          .order-card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* TOP HEADER WITH VENDOR NAME AND ADDRESS */}
      <header className="bg-white border-b-2 border-slate-100 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 p-4 rounded-2xl no-print-action"><Store size={28} /></div>
              <div>
                <h1 className="text-4xl font-black uppercase italic leading-none mb-2">
                  {vendorProfile?.company_name}
                </h1>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  {vendorProfile?.flat_no}, {vendorProfile?.building}, {vendorProfile?.street}<br />
                  {vendorProfile?.area}, {vendorProfile?.city}, {vendorProfile?.state} - {vendorProfile?.pincode}
                </p>
              </div>
            </div>

            {/* TABS (Hidden on Print) */}
            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] tabs-container no-print-action">
              {[
                { id: "pending", label: "Pending", icon: <Clock size={14} /> },
                { id: "shipped", label: "Shipped", icon: <Send size={14} /> },
                { id: "delivered", label: "Delivered", icon: <CheckCircle2 size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-black text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    }`}
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
              <div key={order.id} className={`bg-white rounded-[2.5rem] border-2 transition-all overflow-hidden order-card ${openOrder === order.id ? 'border-yellow-400 shadow-xl' : 'border-slate-100 no-print-action'}`}>

                {/* Order Selector (Hidden on Print) */}
                <div
                  className="p-6 cursor-pointer flex items-center justify-between no-print-action"
                  onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center text-slate-400"><Package size={20} /></div>
                    <div>
                      <p className="font-black text-lg italic uppercase">ORD-{order.id.slice(0, 8)}</p>
                      <p className="text-[10px] font-bold text-slate-400 italic">Click to view Invoice Details</p>
                    </div>
                  </div>
                  <ChevronDown size={20} className={openOrder === order.id ? "rotate-180 text-yellow-500" : ""} />
                </div>

                {openOrder === order.id && (
                  <div id="printable-invoice" className="p-8 md:p-10">

                    {/* INVOICE SUB-HEADER */}
                    <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Packing Slip</p>
                      <div className="text-right">
                        <p className="text-xl font-black italic">#{order.id.slice(0, 10).toUpperCase()}</p>
                        <p className="text-[10px] font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-8">
                      <div className="border-2 border-black p-6 rounded-xl">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Deliver To:</p>
                        <h4 className="text-xl font-black uppercase mb-2">{order.address?.name}</h4>
                        <p className="text-sm font-bold leading-relaxed text-slate-700 uppercase">
                          {order.address?.address}<br />
                          {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                        </p>
                        <p className="mt-4 text-sm font-black italic">Ph: {order.address?.phone}</p>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-300 text-center uppercase no-print-action">
                        Shipping Label Area
                      </div>
                    </div>

                    <table className="w-full mb-8">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-4 text-[10px] font-black uppercase">Product</th>
                          <th className="text-center py-4 text-[10px] font-black uppercase">Qty</th>
                          <th className="text-right py-4 text-[10px] font-black uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-4 text-sm font-black uppercase">{item.product?.product_name}</td>
                            <td className="py-4 text-center font-bold">{item.quantity}</td>
                            <td className="py-4 text-right font-black">₹{item.quantity * item.product?.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-end border-t-4 border-black pt-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                        <p className="text-sm font-black uppercase italic">{activeTab}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Total Amount</p>
                        <p className="text-4xl font-black italic">₹{order.total_amount}</p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-12 flex gap-4 no-print-action">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-white border-2 border-black py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-slate-50 print-btn"
                      >
                        <Printer size={20} /> Print Invoice
                      </button>

                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleShipOrder(order)}
                          className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all ship-btn"
                        >
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