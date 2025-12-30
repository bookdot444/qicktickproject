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
          name: "QuickTick India",
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

            if (error) reject("Payment done but database sync failed.");
            else {
              setPaymentData(initialFormState);
              setIsOtherAmount(false);
              resolve("Payment Verified & Data Recorded Successfully!");
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
    <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">
      <Toaster position="top-right" richColors closeButton />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- HEADER (Exactly like Enquiry Page) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-44 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Support Protocol v2.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              GIVE <span className="text-red-600 italic">&</span> <br/>
              <span className="underline decoration-yellow-400 decoration-8 underline-offset-4">EARN REWARDS</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-10 rounded-[3.5rem] -rotate-3 shadow-2xl border-2 border-yellow-100 relative">
              <div className="absolute -top-3 -right-3 bg-gray-900 text-yellow-400 p-4 rounded-3xl animate-bounce shadow-xl">
                <HeartHandshake size={32} />
              </div>
              <Sparkles size={70} className="text-yellow-600" />
          </div>
        </div>
      </div>
{/* --- FORM CONTAINER (Single Container, Two Columns) --- */}
<div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100"
  >
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

      {/* LEFT COLUMN */}
      <div className="lg:col-span-7">

        {/* Contributor Info */}
        <div className="mb-14">
          <h3 className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">
            1. Contributor Information
          </h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Details for receipt and reward tracking
          </p>

          <div className="mt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <YellowInput label="Full Name" name="name" value={paymentData.name} onChange={handleChange} />
              <YellowInput label="Mobile Number" name="phone" value={paymentData.phone} onChange={handleChange} />
            </div>

            <YellowInput label="Email Address" name="email" type="email" value={paymentData.email} onChange={handleChange} />
          </div>
        </div>

        {/* Referral Info */}
        <div className="pt-12 border-t-2 border-dashed border-yellow-100">
          <h3 className="text-xl font-black tracking-tighter uppercase italic text-gray-900 mb-6">
            2. Referral Details <span className="text-gray-400 text-sm">(Optional)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <YellowInput label="Referrer Name" name="referralName" value={paymentData.referralName} onChange={handleChange} />
            <YellowInput label="Referrer ID" name="referralId" value={paymentData.referralId} onChange={handleChange} />
            <YellowInput label="Referrer Mobile" name="referralNumber" value={paymentData.referralNumber} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      {/* RIGHT COLUMN */}
<div className="lg:col-span-5">

  {/* Section Header */}
  <div className="flex items-center gap-3 mb-10">
    <CreditCard className="text-yellow-400" size={26} />
    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-yellow-400">
      3. Select Impact
    </h3>
  </div>

  {/* Amounts */}
  <div className="grid grid-cols-3 gap-3 mb-6">
    {["100", "500", "1000"].map((amt) => (
      <button
        key={amt}
        type="button"
        onClick={() => handleQuickAmt(amt)}
        className={`py-4 rounded-2xl font-black text-lg transition-all border-2
        ${
          paymentData.giveAmount === amt && !isOtherAmount
            ? "bg-yellow-400 border-yellow-400 text-black scale-105 shadow-lg"
            : "bg-white border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-400"
        }`}
      >
        ₹{amt}
      </button>
    ))}
  </div>

  {/* Custom Amount */}
  <button
    type="button"
    onClick={() => {
      setIsOtherAmount(true);
      setPaymentData(p => ({ ...p, amount: "" }));
    }}
    className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.3em]
    border-2 border-dashed rounded-xl transition-all
    ${
      isOtherAmount
        ? "border-yellow-400 text-yellow-400"
        : "border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-400"
    }`}
  >
    {isOtherAmount ? "Manual Input Active" : "Input Custom Amount"}
  </button>

  {/* Manual Amount */}
  <AnimatePresence>
    {isOtherAmount && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-6"
      >
        <YellowInput
          label="Amount (₹)"
          name="amount"
          type="number"
          value={paymentData.amount}
          onChange={handleChange}
        />
      </motion.div>
    )}
  </AnimatePresence>

  {/* Category */}
  <div className="mt-8">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
      Benefit Category
    </label>
    <select
      name="category"
      value={paymentData.category}
      onChange={handleChange}
      required
      className="w-full mt-2 p-5 bg-white border-2 border-gray-200 rounded-2xl
      font-black uppercase text-xs tracking-widest text-gray-700
      focus:border-yellow-400 outline-none transition-all"
    >
      <option value="">Select Category</option>
      {categories.map(c => (
        <option key={c.id} value={c.name}>{c.name}</option>
      ))}
    </select>
  </div>

  {/* Total */}
  <div className="bg-yellow-50 p-6 rounded-[2rem] flex justify-between items-center shadow-lg mt-10">
    <div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        Grand Total
      </span>
      <p className="text-gray-400 text-xs">Secure Checkout</p>
    </div>
    <span className="text-4xl font-black italic text-yellow-500">
      ₹{paymentData.amount || "0"}
    </span>
  </div>

  {/* Submit */}
  <button
    onClick={handleSubmit}
    disabled={paymentLoading || !paymentData.amount}
    className="w-full mt-8 bg-yellow-400 hover:bg-yellow-500 text-black
    py-6 rounded-[2.5rem] font-black text-xl italic uppercase tracking-tighter
    transition-all flex items-center justify-center gap-4 shadow-xl
    active:scale-95 disabled:opacity-50"
  >
    {paymentLoading ? <Loader2 className="animate-spin" /> : <>Complete Payment <ArrowRight size={22} /></>}
  </button>

</div>


    </div>
  </motion.div>
</div>


      {/* --- HOW IT WORKS: PREMIUM WHITE CARD VERSION (Same as Enquiry Page) --- */}
      <div className="max-w-7xl mx-auto px-6 mt-32 mb-20">
        <div className="bg-white rounded-[4rem] p-12 md:p-24 relative overflow-hidden border border-yellow-100 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col items-center mb-20">
            <div className="bg-gray-900 text-yellow-400 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-6 shadow-xl">Protocol flow</div>
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 italic uppercase tracking-tighter text-center leading-none">
              How the <span className="text-red-600">Ecosystem</span> Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            <StepCard num="01" icon={<HeartHandshake size={40}/>} title="Direct Support" desc="Your contribution is directly mapped to active community programs and benefit pools." />
            <StepCard num="02" icon={<Activity size={40}/>} title="Impact Pulse" desc="Our automated pulse engine verifies your transaction and unlocks reward tokens instantly." />
            <StepCard num="03" icon={<Award size={40}/>} title="Claim Rewards" desc="Verified contributors receive ecosystem benefits and priority vendor network access." />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function YellowInput({ label, name, value, onChange, type = "text", placeholder, dark = false }: any) {
  return (
    <div className="space-y-3 w-full">
      <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 italic ${dark ? 'text-gray-500' : 'text-yellow-800/60'}`}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full p-6 border-2 rounded-[2rem] focus:border-yellow-400 outline-none transition-all font-black uppercase text-xs tracking-widest ${dark ? 'bg-white/5 border-gray-800 text-white placeholder:text-gray-700' : 'bg-[#FEF3C7]/20 border-transparent text-gray-700 placeholder:text-yellow-800/30 focus:bg-white'}`}
      />
    </div>
  );
}

function StepCard({ num, icon, title, desc }: any) {
  return (
    <div className="relative group">
      <div className="mb-8 relative">
        <span className="absolute -top-6 -left-4 text-8xl font-black text-yellow-100/80 italic z-0 select-none">{num}</span>
        <div className="w-24 h-24 rounded-3xl bg-yellow-400 flex items-center justify-center text-black shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-500">
          {icon}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-gray-900 font-black italic uppercase tracking-widest text-xl">{title}</h4>
        <p className="text-gray-400 text-[11px] font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}