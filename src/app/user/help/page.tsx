"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient, User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  User as UserIcon,
  Phone,
  Mail,
  Users,
  Hash,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

interface HelpCategory {
  id: number;
  name: string;
}

export default function HelpAndEarn() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    name: "",
    phone: "",
    email: "",
    referralName: "",
    referralId: "",
    category: "",
    giveAmount: "",
    referralNumber: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("help_and_earn").select("*");
    if (!error) setCategories(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "giveAmount" && value !== "other") {
      setPaymentData(prev => ({ ...prev, giveAmount: value, amount: value }));
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to continue");
    
    setPaymentLoading(true);

    // Using a promise-based toast for the entire payment flow
    const paymentPromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(paymentData.amount) * 100,
            receipt: `rcpt_${Date.now()}`,
          }),
        });

        if (!res.ok) throw new Error("Order creation failed");
        const order = await res.json();
        
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "QuickTick",
          description: "Help & Earn Contribution",
          order_id: order.id,
          handler: async (response: any) => {
            const { error } = await supabase.from("help_payments").insert([{
              user_id: user.id,
              ...paymentData,
              amount: Number(paymentData.amount),
              razorpay_payment_id: response.razorpay_payment_id,
            }]);

            if (!error) {
              setPaymentSuccess(true);
              resolve("Payment Successful");
            } else {
              reject("Failed to save transaction");
            }
          },
          "modal.on_dismiss": () => {
            setPaymentLoading(false);
          },
          prefill: { name: paymentData.name, email: paymentData.email },
          theme: { color: "#D80000" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        setPaymentLoading(false);
        reject(err);
      }
    });

    toast.promise(paymentPromise, {
      loading: 'Initializing secure gateway...',
      success: 'Contribution recorded successfully!',
      error: (data) => `Error: ${data}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 font-sans">
      <Toaster position="top-center" richColors closeButton />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* --- HERO HEADER --- */}
      <div className="bg-[#D80000] pt-20 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-20 -mt-20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex mb-6">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
              <HeartHandshake size={42} className="text-[#FFD700]" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
            Help & <span className="text-[#FFD700]">Earn</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto font-medium">
            Contribute to the community and unlock referral rewards instantly.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
        <AnimatePresence mode="wait">
          {paymentSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-4">Transaction Confirmed!</h2>
              <p className="text-slate-500 font-medium mb-8">
                Thank you for your contribution. Your dashboard has been updated with your new referral status.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 text-[#FFD700] py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Return to Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-50"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Form: Personal & Referral */}
                <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#D80000]/5 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-[#D80000]" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Personal Details</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField name="name" label="Full Name" value={paymentData.name} onChange={handleChange} icon={<UserIcon size={16} />} />
                      <InputField name="phone" label="Phone Number" value={paymentData.phone} onChange={handleChange} icon={<Phone size={16} />} />
                    </div>
                    <InputField name="email" label="Email Address" value={paymentData.email} onChange={handleChange} icon={<Mail size={16} />} type="email" />
                    
                    <div className="pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                        <Users size={14} /> Referral Verification
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField name="referralName" label="Referrer Name" value={paymentData.referralName} onChange={handleChange} icon={<Users size={16} />} />
                        <InputField name="referralId" label="Referral ID" value={paymentData.referralId} onChange={handleChange} icon={<Hash size={16} />} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form: Payment Select */}
                <div className="lg:col-span-5 p-8 md:p-12 bg-slate-50/50">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} className="text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Contribution</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cause Category</label>
                      <select
                        name="category"
                        value={paymentData.category}
                        onChange={handleChange}
                        required
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#D80000] outline-none transition font-bold text-sm"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Choose Amount (INR)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["100", "500", "1000"].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setPaymentData(prev => ({ ...prev, giveAmount: amt, amount: amt }));
                              toast.info(`Selected ₹${amt}`);
                            }}
                            className={`py-3 rounded-xl font-black text-sm transition-all border ${
                              paymentData.giveAmount === amt 
                                ? "bg-[#D80000] text-white border-[#D80000] shadow-lg shadow-red-100" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentData(prev => ({ ...prev, giveAmount: "other", amount: "" }))}
                        className={`w-full py-3 rounded-xl font-black text-sm transition-all border mt-2 ${
                          paymentData.giveAmount === "other" 
                            ? "bg-[#D80000] text-white border-[#D80000]" 
                            : "bg-white text-slate-600 border-slate-200"
                        }`}
                      >
                        Custom Amount
                      </button>
                    </div>

                    <AnimatePresence>
                      {paymentData.giveAmount === "other" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <InputField 
                            name="amount" 
                            label="Amount to Pay" 
                            value={paymentData.amount} 
                            onChange={handleChange} 
                            icon={<Sparkles size={16} />} 
                            type="number" 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4 space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                        <span className="text-2xl font-black text-slate-900">₹{paymentData.amount || "0"}</span>
                      </div>

                      <button
                        type="submit"
                        disabled={paymentLoading || !paymentData.amount}
                        className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-[#FFD700] py-6 rounded-2xl font-black transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] text-lg"
                      >
                        {paymentLoading ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <>
                            <ShieldCheck size={22} />
                            Pay Securely
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust Badges */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrustCard icon={<ShieldCheck className="text-[#D80000]" />} title="Encrypted" desc="Secure 256-bit SSL transaction." />
        <TrustCard icon={<CheckCircle className="text-emerald-500" />} title="Verified" desc="Instant confirmation on successful pay." />
        <TrustCard icon={<Users className="text-[#FFD700]" />} title="Support" desc="24/7 assistance for referral queries." />
      </div>
    </div>
  );
}

function InputField({ name, label, value, onChange, icon, type = "text", disabled = false }: any) {
  return (
    <div className="space-y-3 group">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1 group-focus-within:text-[#D80000] transition-colors">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`Enter ${label.toLowerCase()}`}
        required
        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#D80000]/20 outline-none transition font-bold text-sm placeholder:text-slate-300 disabled:opacity-50"
      />
    </div>
  );
}

function TrustCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}