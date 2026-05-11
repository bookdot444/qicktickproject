"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Percent
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("user_cart")
        .select(`
          id,
          quantity,
          product:vendor_products (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setCart(data || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from("user_cart").update({ quantity: qty }).eq("id", id);
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeItem = async (id: string) => {
    await supabase.from("user_cart").delete().eq("id", id);
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // --- CALCULATION LOGIC ---
  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  {/*  const taxRate = 0.18; // 18% Tax
  const taxAmount = subtotal * taxRate;
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  // const grandTotal = subtotal + taxAmount + shipping;  */}
  const grandTotal = subtotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ">Calculating total...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 selection:bg-yellow-200">

      <header className="bg-gradient-to-b from-yellow-100/60 to-[#FFFDF5] pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/user/listing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all mb-8">
            <ChevronLeft size={14} /> Back to browsing
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 w-10 bg-yellow-400 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 ">Secure Checkout</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Shopping <span className="text-yellow-500">Bag</span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-8">
        {cart.length === 0 ? (
          <div className="bg-white border border-yellow-100 rounded-[2rem] py-24 text-center shadow-sm">
            {/* Empty state content remains same */}
            <ShoppingBag size={32} className="mx-auto text-yellow-200 mb-4" />
            <h3 className="text-xl font-black uppercase">Your bag is empty</h3>
            <Link href="/user/listing" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Shop Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-gray-100 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-6 group hover:border-yellow-200 transition-all shadow-sm"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                      <img src={item.product?.product_image?.split("|||")[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-lg font-black uppercase tracking-tight  leading-tight">{item.product?.product_name}</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{Number(item.product?.price).toLocaleString()}</p>

                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Minus size={12} /></button>
                          <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block pr-4">
                      <p className="text-xl font-black ">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* SUMMARY SIDEBAR WITH 18% TAX */}
            <aside className="lg:sticky lg:top-24">
              <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-yellow-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Percent size={80} strokeWidth={3} />
                </div>

                <h3 className="text-xl font-black uppercase tracking-tighter  mb-6">Summary</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {/*
                  <div className="flex justify-between text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                    <span className="flex items-center gap-1">Tax <span className="text-[8px] bg-yellow-100 px-1 rounded text-yellow-700">18%</span></span>
                    <span>₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div> */}
                  {/* 
                  <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>  */}

                  <div className="h-px bg-slate-100 my-4" />

                  <div>
                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                    <p className="text-4xl font-black tracking-tighter ">
                      ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <Link
                  href="/user/checkout"
                  className="w-full flex items-center justify-center gap-3 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 group"
                >
                  Checkout Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-8 flex items-center gap-3 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Secure SSL Checkout
                </div>
              </div>
             
            </aside>

          </div>
        )}
      </main>
    </div>
  );
}