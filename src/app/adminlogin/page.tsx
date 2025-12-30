"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (authError || !data) {
      setError("Unauthorized: Invalid Credentials");
      setLoading(false);
      return;
    }

    localStorage.setItem("user_role", data.role);
    window.location.href = data.role === "admin" ? "/admin/dashboard" : "/admin/subadmin-dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-[950px] gap-4"
      >
        
        {/* LEFT CONTAINER: BRANDING (Centered & Larger Logo) */}
        <div className="hidden md:flex w-5/12 bg-[#0F172A] rounded-[32px] p-8 flex-col items-center justify-center relative overflow-hidden shadow-xl border border-slate-800 h-[480px]">
          {/* Subtle Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 bg-white p-8 rounded-[32px] shadow-2xl shadow-black/40 flex items-center justify-center"
          >
            <Image 
              src="/logoBlacl.png" 
              alt="QickTick" 
              width={180} // Increased size
              height={60} 
              priority
              className="object-contain"
            />
          </motion.div>
          
          <div className="mt-8 text-center relative z-10">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em]">
              Admin Authority v2.0
            </p>
          </div>
        </div>

        {/* RIGHT CONTAINER: LOGIN FORM (Reduced Height) */}
        <div className="w-full md:w-7/12 bg-white rounded-[32px] p-8 md:p-12 flex flex-col justify-center shadow-lg border border-white h-[480px]">
          <div className="max-w-[340px] mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login</h1>
              <p className="text-slate-500 text-sm mt-1">Enter your console access keys.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-0 py-2.5 bg-transparent border-b border-slate-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                    placeholder="Enter Admin Email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="group relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-0 py-2.5 bg-transparent border-b border-slate-100 focus:border-indigo-600 outline-none transition-all text-sm text-slate-800"
                    placeholder="Enter the admin password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[11px] font-bold text-center italic">{error}</p>
              )}

              <button
                disabled={loading}
                className="group w-full h-12 bg-[#0F172A] hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* COMPACT DEMO CREDENTIALS */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
              <div className="flex items-center gap-2 text-indigo-600 text-[9px] font-black uppercase tracking-widest mb-2">
                <Terminal size={12} />
                Demo Credentials
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-400">User:</span>
                  <span className="font-mono text-slate-900 font-bold select-all">admin@qicktick.com</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-400">Key:</span>
                  <span className="font-mono text-slate-900 font-bold select-all">QickTick@123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}