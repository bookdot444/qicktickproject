"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Upload, MapPin, User, Building, Phone, Mail,
  CheckCircle2, Loader, Briefcase, Sparkles,
  Globe, ShieldCheck, ArrowRight, AlertCircle, X, Image as ImageIcon, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Type for form data
type FormData = {
    name: string;
    company: string;
    phone: string;
    email: string;
    state: string;
    city: string;
    address: string;
};

// Props type for YellowInput
type YellowInputProps = {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
};

export default function AddBusinessPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "", company: "", phone: "", email: "", state: "", city: "", address: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isLoggedIn = true;
    const [toastData, setToastData] = useState<{
        title: string;
        subtitle: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from("businesses")
            .insert([
                {
                    name: formData.name,
                    company: formData.company,
                    phone: formData.phone,
                    email: formData.email || null,
                    country: "India",
                    state: formData.state,
                    city: formData.city,
                    preferred_address: formData.address,
                    business_details: "Submitted via add business form",
                },
            ]);

        setIsSubmitting(false);

      if (error) {
  setToastData({
    title: "Submission Failed",
    subtitle: error.message,
  });
  setShowToast(true);
  return;
}

setToastData({
  title: "Submitted Successfully",
  subtitle: "Your business has been saved",
});
setShowToast(true);


        setToastData({
            title: "Submitted Successfully",
            subtitle: "Your business has been saved",
        });
        setShowToast(true);
    };



    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">

            {/* --- SUCCESS TOAST --- */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: -40, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
                    >
                        <div className="bg-gray-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
                            <div className="bg-yellow-400 p-2 rounded-full">
                                <Zap className="text-black" size={18} fill="currentColor" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="font-black italic uppercase tracking-widest text-xs">
                                    {toastData?.title}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                                    {toastData?.subtitle}
                                </span>

                            </div>
                            <button onClick={() => setShowToast(false)} className="text-white/40 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-44 px-6 relative overflow-hidden border-b border-yellow-100">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Global Vendor Onboarding</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
                            LIST YOUR <br />
                            <span className="text-red-600 italic">BUSINESS</span>
                        </h1>
                    </div>
                    <div className="hidden lg:block bg-white p-10 rounded-[3.5rem] -rotate-3 shadow-2xl border-2 border-yellow-100 relative">
                        <div className="absolute -top-3 -right-3 bg-gray-900 text-yellow-400 p-4 rounded-3xl animate-pulse">
                            <Building size={32} />
                        </div>
                        <Briefcase size={70} className="text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* --- FORM --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* --- SECTION 1: IDENTITY --- */}
                    <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">1. Identity & Brand</h3>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Foundational credentials for verification</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <YellowInput label="Full Name" placeholder="OWNER IDENTITY..." value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                            <YellowInput label="Business Name" placeholder="TRADING NAME..." value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} />
                            <YellowInput label="WhatsApp Number" placeholder="CONTACT NO..." value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                            <YellowInput label="Email Address" placeholder="OFFICIAL EMAIL..." value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                        </div>

                        {/* File Upload */}
                        <div className="mt-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic mb-3 block">Branding Assets (Logo/Store)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative border-2 border-dashed border-yellow-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-[#FEF3C7]/10 hover:bg-[#FEF3C7]/30 hover:border-yellow-400 transition-all cursor-pointer overflow-hidden"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 text-yellow-500">
                                    {file ? <CheckCircle2 size={32} className="text-green-500" /> : <ImageIcon size={32} />}
                                </div>
                                <span className="text-[11px] font-black italic uppercase tracking-widest text-gray-700">
                                    {file ? file.name : "UPLOADING PROTOCOL: CLICK TO SELECT FILE"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- SECTION 2: LOCATION --- */}
                    <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-yellow-100">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic text-gray-900">2. Operational Hub</h3>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Geographical deployment details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <YellowInput label="State" placeholder="REGION..." value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} />
                            <YellowInput label="City" placeholder="SECTOR/CITY..." value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic">Physical Deployment Address</label>
                            <textarea
                                rows={4}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-6 bg-[#FEF3C7]/20 border-2 border-transparent rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30"
                                placeholder="PLOT NO, STREET, LANDMARK, ZIP..."
                            />
                        </div>
                    </div>

                    {/* --- SUBMIT --- */}
                    <div className="flex flex-col items-center gap-6 pt-10 pb-20">
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full max-w-xl bg-gray-900 hover:bg-red-600 text-white py-8 rounded-[2.5rem] font-black text-2xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader className="animate-spin" /> : <>Register Business <Sparkles size={24} /></>}
                        </button>

                        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-yellow-100 shadow-sm text-[10px] font-black italic uppercase text-gray-400 tracking-widest">
                            <ShieldCheck size={16} className="text-yellow-500" /> Secure Encryption Verified
                        </div>
                    </div>
                </form>
            </div>

            {/* --- FOOTER --- */}
            <div className="max-w-7xl mx-auto px-6 mb-20">
                <div className="bg-gray-900 rounded-[4rem] p-12 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                    <h4 className="relative z-10 text-white font-black italic uppercase tracking-widest text-xl">Ready to join the ecosystem?</h4>
                    <p className="relative z-10 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Verified businesses receive 24/7 pulse feed access</p>
                </div>
            </div>
        </div>
    );
}

// --- REUSABLE COMPONENT ---
function YellowInput({ label, value, onChange, placeholder, type = "text" }: YellowInputProps) {
    return (
        <div className="space-y-3 w-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-800/60 ml-2 italic">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-6 bg-[#FEF3C7]/20 border-2 border-transparent rounded-[2rem] focus:border-yellow-400 focus:bg-white outline-none transition-all font-black uppercase text-xs tracking-widest text-gray-700 placeholder:text-yellow-800/30"
            />
        </div>
    );
}
