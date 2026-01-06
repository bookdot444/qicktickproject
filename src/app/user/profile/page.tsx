"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Loader2, Mail, Fingerprint,
  CalendarClock, ShieldCheck,
  ArrowLeft, Store, UserCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 mx-auto text-yellow-600 mb-4" />
          <p className="font-black uppercase tracking-widest text-xs text-slate-400">Loading Registry...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-100 text-slate-900">

      {/* --- HERO HEADER (Registry Style) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
        {/* Dot Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">

          <div className="text-center md:text-left flex-1">


            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase mb-4"
            >
              User <br />
              <span className="text-red-600 italic">Registry</span>
            </motion.h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">{user.email}</p>
          </div>

          {/* Icon Tilted Card */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -3, scale: 1 }}
            className="relative"
          >
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-yellow-100 flex items-center justify-center relative">
              <div className="text-yellow-500">
                <UserCircle2 size={120} strokeWidth={1} />
              </div>

              <div className="absolute -top-3 -right-3 bg-red-600 text-white p-3 rounded-2xl shadow-xl border-4 border-[#FEF3C7]">
                <ShieldCheck size={24} fill="currentColor" />
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
              Identity Verified
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 pb-20 relative z-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-yellow-100/50">
          <div className="flex items-center gap-3 mb-10 border-b border-yellow-100 pb-6">
            <div className="p-3 bg-yellow-400 rounded-2xl text-black">
              <Fingerprint size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic leading-none">Account Credentials</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Identity File</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow
              title="Email Address"
              value={user.email}
              icon={<Mail />}
            />
            <DetailRow
              title="Registry Date"
              value={new Date(user.created_at).toLocaleDateString()}
              icon={<CalendarClock />}
            />
          </div>

          {/* Bottom Banner */}
          <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Store className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-black uppercase tracking-tight">Active Studio Member</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mt-1">
                This user profile is officially registered within the Vendor Network Registry. All displayed credentials are securely verified through authenticated database protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ title, value, icon }: { title: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="group flex items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-yellow-200 hover:bg-[#FEF3C7]/20 transition-all">
      <div className="bg-white text-yellow-700 p-3 rounded-2xl shadow-sm border border-yellow-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</span>
        <span className="text-sm font-black text-gray-900 truncate">{value || "—"}</span>
      </div>
    </div>
  );
}