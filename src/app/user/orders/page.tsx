"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CheckCircle,
  Clock,
  ChevronDown,
  MapPin,
  Receipt,
  ShoppingBag,
  Calendar,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        const parsed = (data || []).map((order: any) => ({
          ...order,
          address: typeof order.address === "string" ? JSON.parse(order.address) : order.address,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
        }));
        setOrders(parsed);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Fetching your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 selection:bg-yellow-200">
      
      {/* --- PREMIUM HEADER --- */}
      <header className="bg-gradient-to-b from-yellow-100/80 to-[#FFFDF5] pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
                My <span className="text-yellow-500">Orders</span>
              </h1>
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mt-4 font-bold">
                History & Real-time Tracking
              </p>
            </div>
            <div className="hidden md:block bg-white border border-yellow-200 p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
              <p className="text-2xl font-black">₹{orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- ORDERS LIST --- */}
      <main className="max-w-5xl mx-auto px-6 -mt-8">
        {orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-yellow-100 rounded-[2.5rem] py-32 text-center">
            <ShoppingBag size={48} className="mx-auto text-yellow-200 mb-6" />
            <h3 className="text-2xl font-black uppercase">No orders yet</h3>
            <p className="text-gray-400 mt-2 font-medium">Your shopping bag is waiting to be filled!</p>
            <Link href="/shop" className="inline-block mt-8 bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              const isOpen = openOrder === order.id;
              
              return (
                <motion.div
                  key={order.id}
                  layout
                  className={`bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
                    isOpen ? "border-yellow-400 shadow-xl" : "border-gray-100 hover:border-yellow-200 shadow-sm"
                  }`}
                >
                  {/* SUMMARY ROW */}
                  <div 
                    className="p-6 md:p-8 cursor-pointer flex flex-wrap items-center justify-between gap-6"
                    onClick={() => setOpenOrder(isOpen ? null : order.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${isOpen ? 'bg-yellow-400 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <Package size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Ref</p>
                        <h3 className="font-black text-xl leading-none  uppercase">#{order.id.slice(0, 8)}</h3>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 ">
                             <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border mb-2 ${
                          order.payment_status === "paid" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {order.payment_status === "paid" ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {order.payment_status}
                        </div>
                        <p className="text-2xl font-black text-slate-900 block tracking-tight">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full transition-transform duration-500 ${isOpen ? "rotate-180 bg-slate-900 text-white" : "bg-gray-50 text-gray-400"}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED CONTENT */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 border-t border-gray-50"
                      >
                        <div className="p-6 md:p-8 grid md:grid-cols-5 gap-8">
                          
                          {/* LEFT: PRODUCTS (3 Cols) */}
                          <div className="md:col-span-3 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                              Your Items
                            </h4>
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.product?.product_image?.split("|||")[0]}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={item.product?.product_name}
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-black uppercase  leading-tight">{item.product?.product_name}</p>
                                  <p className="text-xs text-gray-400 mt-1 font-bold">QTY: {item.quantity}</p>
                                </div>
                                <p className="font-black text-sm">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          {/* RIGHT: DETAILS (2 Cols) */}
                          <div className="md:col-span-2 space-y-6">
                            {/* SHIPPING */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                <MapPin size={14} className="text-yellow-500" /> Shipping To
                              </h4>
                              <p className="text-sm font-black uppercase tracking-tight">{order.address?.name}</p>
                              <p className="text-xs text-gray-500 leading-relaxed mt-2 font-medium">
                                {order.address?.address}, {order.address?.city} <br />
                                {order.address?.pincode} | {order.address?.phone}
                              </p>
                            </div>

                            {/* BILLING */}
                            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                                <Receipt size={14} /> Price Details
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                  <span>SUBTOTAL</span>
                                  <span>₹{Number(order.sub_total || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400">
                                  <span>TAX / GST</span>
                                  <span>₹{Number(order.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-800 my-2" />
                                <div className="flex justify-between items-center font-black">
                                  <span className="text-xs tracking-widest">GRAND TOTAL</span>
                                  <span className="text-xl text-yellow-400">₹{Number(order.total_amount).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}