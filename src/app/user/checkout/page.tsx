"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ChevronLeft,
  Truck,
  ReceiptIndianRupee
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_cart")
        .select(`id, quantity, product:vendor_products (*)`)
        .eq("user_id", user.id);
      setCart(data || []);
    }
    setLoading(false);
  };

  // ---------------- TOTALS & SHIPPING ----------------
  const subTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = subTotal * 0.18;
  
  // Shipping: ₹100 if subtotal < 1000, else Free
  const shipping = subTotal > 0 && subTotal < 1000 ? 100 : 0;
  
  const grandTotal = subTotal + tax + shipping;

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err: any = {};
    if (!address.name) err.name = "Full name is required";
    if (!address.phone || address.phone.length !== 10) err.phone = "Enter a valid 10-digit number";
    if (!address.address) err.address = "Street address is required";
    if (!address.city) err.city = "City is required";
    if (!address.pincode || address.pincode.length !== 6) err.pincode = "6-digit pincode required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------------- PAYMENT ----------------
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validate()) return;
    const loaded = await loadRazorpay();
    if (!loaded) return alert("Razorpay failed to load");

    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(grandTotal) }),
    });

    const order = await res.json();
    if (!order?.id) return alert("Order creation failed");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "The Vault",
      order_id: order.id,
      handler: async (response: any) => {
        const { data: userData } = await supabase.auth.getUser();
        const orderPayload = {
          user_id: userData.user?.id,
          total_amount: grandTotal,
          sub_total: subTotal,
          tax: tax,
          shipping: shipping,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          payment_status: "paid",
          address,
          items: cart,
        };

        const { error } = await supabase.from("orders").insert([orderPayload]);
        if (error) return alert("Order save failed");
        router.push("/user/orders");
      },
      theme: { color: "#EAB308" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 selection:bg-yellow-200">
      
      {/* HEADER */}
      <header className="bg-gradient-to-b from-yellow-100/60 to-[#FFFDF5] pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/user/cart" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all mb-8">
            <ChevronLeft size={14} /> Review Cart
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[1px] w-8 bg-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 italic">Final Step</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                Checkout
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-white border border-yellow-100 px-5 py-3 rounded-2xl shadow-sm">
              <ShieldCheck size={18} className="text-emerald-500" />
              <div className="leading-none">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Encrypted By</p>
                <p className="text-[11px] font-black uppercase">Razorpay Secure</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: SHIPPING FORM */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-yellow-600" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight italic">Shipping Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                  <InputLabel label="Recipient Full Name" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full p-4 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.name}</p>}
                </div>

                <div>
                  <InputLabel label="Mobile Number" />
                  <input
                    type="tel"
                    placeholder="99999 00000"
                    className={`w-full p-4 bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.phone}</p>}
                </div>

                <div>
                  <InputLabel label="Pincode" />
                  <input
                    type="text"
                    placeholder="600001"
                    className={`w-full p-4 bg-slate-50 border ${errors.pincode ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  />
                  {errors.pincode && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.pincode}</p>}
                </div>

                <div className="md:col-span-2">
                  <InputLabel label="Complete Address" />
                  <textarea
                    rows={3}
                    placeholder="Flat, House no., Building, Apartment name"
                    className={`w-full p-4 bg-slate-50 border ${errors.address ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  />
                  {errors.address && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.address}</p>}
                </div>

                <div className="md:col-span-2">
                  <InputLabel label="Town / City" />
                  <input
                    type="text"
                    placeholder="Mumbai"
                    className={`w-full p-4 bg-slate-50 border ${errors.city ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  {errors.city && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.city}</p>}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <section className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-yellow-100/50">
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white">
                      <img src={item.product.product_image?.split("|||")[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black uppercase text-slate-800 leading-tight line-clamp-1">{item.product.product_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black italic">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-dashed border-slate-200 pt-6">
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <span>Items Subtotal</span>
                  <span>₹{subTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Truck size={14} className="text-yellow-600" /> Shipping
                  </div>
                  <span className={shipping === 0 ? "text-emerald-500" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <ReceiptIndianRupee size={14} className="text-yellow-600" /> GST (18%)
                  </div>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                <div className="pt-4 mt-2 border-t-2 border-slate-900">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className="text-4xl font-black tracking-tighter italic leading-none">₹{grandTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full mt-8 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 group"
              >
                <CreditCard size={18} className="group-hover:-rotate-12 transition-transform" /> 
                Complete Payment
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6 py-3 border-t border-slate-50">
                <ShieldCheck size={14} className="text-slate-300" />
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                  100% Refundable Policy applies
                </p>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

function InputLabel({ label }: { label: string }) {
  return (
    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">
      {label}
    </label>
  );
}