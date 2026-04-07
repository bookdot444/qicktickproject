"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Zap, ArrowRight, Loader2, HeartHandshake,
  Sparkles, CreditCard, Mail, Phone, ShieldCheck, Activity, Award
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

export default function HelpAndEarn() {
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isOtherAmount, setIsOtherAmount] = useState(false);

  const initialFormState = {
    amount: "",
    name: "",
    phone: "",
    email: "",
    referralName: "",
    referralId: "",
    referralNumber: "",
    category: "",
    giveAmount: "",
  };

  const [paymentData, setPaymentData] = useState(initialFormState);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("help_and_earn").select("*");
    setCategories(data || []);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
    if (name === "amount") {
      setPaymentData(prev => ({ ...prev, giveAmount: value, amount: value }));
    }
  };

  const handleQuickAmt = (amt: string) => {
    setIsOtherAmount(false);
    setPaymentData(prev => ({ ...prev, giveAmount: amt, amount: amt }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.amount || Number(paymentData.amount) <= 0) return toast.error("Enter a valid amount");
    if (!paymentData.phone || !paymentData.email) return toast.error("Phone and Email are required");

    setPaymentLoading(true);

    const paymentPromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(paymentData.amount) }),
        });

        const order = await res.json();
        if (!order.id) throw new Error("Could not initialize payment.");

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "QickTick India",
          description: `Contribution: ${paymentData.category}`,
          order_id: order.id,
          handler: async (response: any) => {
            const { error } = await supabase.from("help_payments").insert([{
              amount: Number(paymentData.amount),
              name: paymentData.name,
              phone: paymentData.phone,
              email: paymentData.email,
              referral_name: paymentData.referralName,
              referral_id: paymentData.referralId,
              referral_number: paymentData.referralNumber,
              category: paymentData.category,
              give_amount: paymentData.giveAmount,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }]);

            if (error) reject("Database sync failed.");
            else {
              setPaymentData(initialFormState);
              setIsOtherAmount(false);
              resolve("Payment Verified Successfully!");
            }
          },
          prefill: { name: paymentData.name, email: paymentData.email, contact: paymentData.phone },
          theme: { color: "#E31E24" },
          modal: { ondismiss: () => setPaymentLoading(false) }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        reject(err.message || "Initialization failed");
      } finally {
        setPaymentLoading(false);
      }
    });

    toast.promise(paymentPromise, {
      loading: 'Securely processing...',
      success: (data) => `${data}`,
      error: (err) => `Error: ${err}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-10 font-sans selection:bg-yellow-200">
      <Toaster position="top-right" richColors closeButton />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- HEADER (Reduced Height) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full mb-4 shadow-sm border border-yellow-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-800">Support Protocol v2.0</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">
             SAMRUDHI COIN   <br />
              <span className="text-4xl underline decoration-yellow-400 decoration-4 underline-offset-4">Help And Earn Rewards</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-6 rounded-[2.5rem] -rotate-3 shadow-xl border border-yellow-100">
            <HeartHandshake size={50} className="text-yellow-600" />
          </div>
        </div>
      </div>

      {/* --- FORM CONTAINER --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-yellow-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* LEFT COLUMN: INFO */}
            <div className="lg:col-span-7">
              <div className="mb-8">
                <h3 className="text-xl font-black tracking-tighter uppercase  text-gray-900">
                  1. Contributor Info
                </h3>
                <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">
                  Details for reward tracking
                </p>

                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <BlackInput label="Full Name" name="name" value={paymentData.name} onChange={handleChange} />
                    <BlackInput label="Mobile" name="phone" value={paymentData.phone} onChange={handleChange} />
                  </div>
                  <BlackInput label="Email Address" name="email" type="email" value={paymentData.email} onChange={handleChange} />
                </div>
              </div>

              {/* Referral Info (Compact) */}
              <div className="pt-8 border-t border-dashed border-yellow-100">
                <h3 className="text-sm font-black tracking-widest uppercase  text-gray-900 mb-4">
                  2. Referral <span className="text-gray-400 font-normal">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BlackInput label="Ref. Name" name="referralName" value={paymentData.referralName} onChange={handleChange} />
                  <BlackInput label="Ref. ID" name="referralId" value={paymentData.referralId} onChange={handleChange} />
                  <BlackInput label="Ref. Phone" name="referralNumber" value={paymentData.referralNumber} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PAYMENT */}
            <div className="lg:col-span-5 bg-gray-50/50 p-6 rounded-[2rem] border border-yellow-50">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="text-yellow-500" size={20} />
                <h3 className="text-lg font-black  uppercase tracking-tighter text-gray-900">
                  3. Select Impact
                </h3>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["100", "500", "1000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmt(amt)}
                    className={`py-3 rounded-xl font-black text-sm transition-all border
                    ${paymentData.giveAmount === amt && !isOtherAmount
                        ? "bg-yellow-400 border-yellow-400 text-black shadow-md"
                        : "bg-white border-gray-200 text-gray-700 hover:border-yellow-400"
                      }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOtherAmount(true);
                  setPaymentData(p => ({ ...p, amount: "" }));
                }}
                className={`w-full py-2 text-[8px] font-black uppercase tracking-widest border border-dashed rounded-lg mb-4
                ${isOtherAmount ? "border-yellow-400 text-yellow-500" : "border-gray-300 text-gray-400"}`}
              >
                {isOtherAmount ? "Custom Input Enabled" : "Enter Other Amount"}
              </button>

              <AnimatePresence>
                {isOtherAmount && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <BlackInput label="Amount (₹)" name="amount" type="number" value={paymentData.amount} onChange={handleChange} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400  ml-1">Benefit Category</label>
                <select
                  name="category" value={paymentData.category} onChange={handleChange} required
                  className="w-full mt-1.5 p-3.5 bg-white border border-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-widest text-gray-700 focus:border-yellow-400 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Total Display */}
              <div className="bg-yellow-400 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Grand Total</span>
                <span className="text-2xl font-black  text-black">₹{paymentData.amount || "0"}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={paymentLoading || !paymentData.amount}
                className="w-full mt-4 bg-gray-900 hover:bg-red-600 text-white py-4 rounded-xl font-black text-base  uppercase transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
              >
                {paymentLoading ? <Loader2 className="animate-spin" size={18} /> : <>Pay Now <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- HOW IT WORKS (Compact) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-20 mb-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden border border-yellow-100 shadow-xl">
          <div className="relative z-10 flex flex-col items-center mb-12">
            <div className="bg-gray-900 text-yellow-400 text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Protocol</div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900  uppercase tracking-tighter text-center">
              The <span className="text-black">Ecosystem</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            <StepCard num="01" icon={<HeartHandshake size={24} />} title="Direct Support" desc="Contributions are mapped directly to community pools." />
            <StepCard num="02" icon={<Activity size={24} />} title="Impact Pulse" desc="Our engine verifies and unlocks tokens instantly." />
            <StepCard num="03" icon={<Award size={24} />} title="Claim Rewards" desc="Contributors receive priority network benefits." />
          </div>
        </div>
      </div>
    </div>
  );
}

function BlackInput({ label, name, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black ml-2 ">
        {label}
      </label>
      <input
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="w-full p-3.5 bg-black/5 border border-black/10 rounded-xl focus:border-black focus:bg-white outline-none transition-all font-bold uppercase text-[10px] tracking-widest text-black placeholder:text-black/20"
      />
    </div>
  );
}

function StepCard({ num, icon, title, desc }: any) {
  return (
    <div className="relative group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow-md rotate-3 group-hover:rotate-6 transition-transform">
          {icon}
        </div>
        <span className="text-3xl font-black text-black ">{num}</span>
      </div>
      <h4 className="text-gray-900 font-black  uppercase tracking-widest text-sm mb-2">{title}</h4>
      <p className="text-gray-400 text-[9px] font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
    </div>
  );
}