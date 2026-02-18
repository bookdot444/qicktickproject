"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ShieldCheck, RefreshCw, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");

  const sendOtp = async () => {
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast.success("Access code sent to your email!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error("Please enter the 6-digit code");
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      toast.success("Identity verified. Welcome!");
      router.push("/user");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 relative font-sans">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[440px]"
      >
        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100">

          {/* Top Yellow Accent Bar (Matched to Photo) */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFC107]" />

          <div className="p-8 md:p-12">
            {/* Close Icon (Design Decoration) */}
            <button
              onClick={() => router.push('/user/video')}  // 👈 Added: Navigate to VideoPage on click
              className="absolute top-6 right-6 p-1 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Header Section */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-[1000] text-slate-900 mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Enter your email to access your account
              </p>
            </div>

            <AnimatePresence mode="wait">
              <div className="space-y-6">
                {/* Email Field - Always Visible in the reference design flow */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A0AEC0] ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-[#F7FAFC] border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFC107]/20 focus:border-[#FFC107] transition-all font-medium text-slate-900 text-sm"
                    />
                  </div>
                </div>

                {/* OTP Field - Appears or Highlights during Step 2 */}
                <div className={`space-y-2 transition-opacity duration-300 ${step === 'otp' ? 'opacity-100' : 'opacity-50'}`}>
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A0AEC0] ml-1">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={step === 'email'}
                    className="w-full px-5 py-4 bg-[#F7FAFC] border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFC107]/20 focus:border-[#FFC107] transition-all font-medium text-center text-slate-900 text-sm"
                  />
                </div>

                {/* Action Buttons - Side by Side Grid as per Photo */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="py-4 bg-black hover:bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading && step === 'email' ? <RefreshCw className="animate-spin" size={16} /> : "Send OTP"}
                  </button>

                  <button
                    onClick={verifyOtp}
                    disabled={loading || step === 'email'}
                    className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center
                      ${step === 'otp'
                        ? 'bg-[#FFC107] text-black shadow-yellow-100 hover:bg-[#EBB106]'
                        : 'bg-slate-100 text-slate-400'}`}
                  >
                    {loading && step === 'otp' ? <RefreshCw className="animate-spin" size={16} /> : "Login"}
                  </button>
                </div>

                {/* Optional Back Button */}
                {step === "otp" && (
                  <button
                    onClick={() => setStep("email")}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors pt-2"
                  >
                    <ChevronLeft size={14} /> Use different email
                  </button>
                )}
              </div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Branding Footer */}
        <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
          Secured by <span className="text-white">Supabase Auth</span>
        </p>
      </motion.div>
    </div>
  );
}