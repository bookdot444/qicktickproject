"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser,
    FaEnvelope,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCreditCard,
    FaRedo,
    FaCrown,
    FaShieldAlt,
    FaArrowRight,
    FaGem
} from "react-icons/fa";

type Vendor = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    subscription_plan: string | null;
    subscription_expiry: string | null;
};

export default function VendorSubscriptionPage() {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const vendorData = localStorage.getItem("vendorData");
        if (vendorData) {
            setVendor(JSON.parse(vendorData));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F9F9F9]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D80000] mx-auto"></div>
                    <p className="mt-4 font-black uppercase tracking-widest text-slate-400 text-xs">Syncing Tiers...</p>
                </div>
            </div>
        );
    }

    const isExpired =
        vendor?.subscription_expiry &&
        new Date(vendor.subscription_expiry) < new Date();

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-20 font-sans">
            {/* --- HERO SECTION --- */}
            <div className="bg-[#D80000] pt-20 pb-44 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black rounded-full blur-[100px] opacity-20 -ml-24 -mb-24" />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex justify-center mb-6">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                            <FaCrown size={32} className="text-[#FFD700]" />
                        </div>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white">
                        Billing <span className="text-[#FFD700]">& Tier</span>
                    </motion.h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto font-medium">
                        Your gateway to premium listing features and 
                        <span className="text-white font-bold italic ml-1 underline decoration-[#FFD700] underline-offset-4">priority vendor status.</span>
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-20">
                {!vendor ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
                        <FaExclamationTriangle className="text-[#D80000] text-6xl mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Session Expired</h2>
                        <p className="text-slate-500 font-bold mb-8">We couldn't locate your vendor profile credentials.</p>
                        <button className="px-10 py-4 bg-slate-900 text-[#FFD700] rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                            Return to Login
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* MAIN CARD */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-7 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            {/* STATUS HEADER */}
                            <div className={`px-10 py-8 flex items-center justify-between ${isExpired ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isExpired ? 'bg-red-100 text-[#D80000]' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isExpired ? <FaExclamationTriangle size={24}/> : <FaShieldAlt size={24}/>}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Status</p>
                                        <h3 className={`text-xl font-black ${isExpired ? 'text-[#D80000]' : 'text-emerald-700'}`}>
                                            {isExpired ? "Subscription Expired" : "Partner Verified"}
                                        </h3>
                                    </div>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isExpired ? 'bg-[#D80000] text-white' : 'bg-emerald-500 text-white'}`}>
                                    {isExpired ? "Inactive" : "Active"}
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* INFO GRID */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <InfoCard icon={<FaUser />} label="Vendor Identity" value={`${vendor.first_name} ${vendor.last_name}`} />
                                    <InfoCard icon={<FaEnvelope />} label="Registered Email" value={vendor.email || ""} />
                                    <InfoCard icon={<FaGem />} label="Current Plan" value={vendor.subscription_plan || "Free Tier"} highlight />
                                    <InfoCard 
                                        icon={<FaCalendarAlt />} 
                                        label="Cycle Ends On" 
                                        value={vendor.subscription_expiry ? new Date(vendor.subscription_expiry).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "No Expiry"} 
                                    />
                                </div>

                                {/* ACTIONS */}
                                <div className="flex flex-col gap-4">
                                    <button className="w-full py-6 rounded-[2rem] bg-[#D80000] text-white font-black text-lg hover:bg-black transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-3 group active:scale-[0.98]">
                                        <FaCreditCard /> Upgrade To Premium <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {vendor.subscription_plan && (
                                        <button className="w-full py-5 rounded-[2rem] bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                            <FaRedo /> Extend Current Plan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* SIDEBAR FEATURES */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-5 space-y-6"
                        >
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl opacity-10 -mr-10 -mt-10" />
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-[#FFD700]">
                                    <FaCrown /> Premium Benefits
                                </h3>
                                <ul className="space-y-4">
                                    <BenefitItem text="Priority Search Ranking" />
                                    <BenefitItem text="Verified Partner Badge" />
                                    <BenefitItem text="Unlimited Product Listings" />
                                    <BenefitItem text="Direct Customer Analytics" />
                                </ul>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center gap-5 shadow-sm">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                    <FaCheckCircle size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Next Billing</p>
                                    <p className="text-sm font-black text-slate-800 leading-tight">Auto-renewal is currently disabled.</p>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value, highlight = false }: { icon: any, label: string, value: string, highlight?: boolean }) {
    return (
        <div className={`p-6 rounded-3xl border transition-all ${highlight ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className={`mb-3 ${highlight ? 'text-[#D80000]' : 'text-[#FFD700]'}`}>{icon}</div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-black text-slate-800 break-words">{value}</p>
        </div>
    );
}

function BenefitItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
            <FaCheckCircle className="text-emerald-500 shrink-0" /> {text}
        </li>
    );
}