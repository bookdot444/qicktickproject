"use client";

import { useState, useEffect, useRef } from "react";
import {
    Upload,
    MapPin,
    User,
    Building,
    Phone,
    Mail,
    CornerDownRight,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Briefcase,
    ShieldAlert,
    Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const indiaStatesCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
};

const allStates = Object.keys(indiaStatesCities);

// Updated FormInput to match the "Direct Message" styling
const FormInput = ({ label, value, onChange, error, placeholder, Icon, type = "text", required = true, disabled = false, isSelect = false, options = [], className = "", rows = 1 }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1 flex items-center gap-2">
            {Icon && <Icon size={14} className="text-[#D80000]" />}
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {isSelect ? (
                <select 
                    value={value} 
                    onChange={onChange} 
                    disabled={disabled} 
                    className={`w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 appearance-none text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#D80000]/20 focus:border-[#D80000] font-bold text-sm ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-slate-300"} ${error ? "border-red-500 bg-red-50" : ""}`}
                >
                    {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
            ) : rows > 1 ? (
                <textarea 
                    rows={rows} 
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange} 
                    className={`w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#D80000]/20 focus:border-[#D80000] font-bold text-sm placeholder:text-slate-300 resize-none ${error ? "border-red-500 bg-red-50" : "hover:border-slate-300"}`} 
                />
            ) : (
                <input 
                    type={type} 
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange} 
                    disabled={disabled} 
                    className={`w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#D80000]/20 focus:border-[#D80000] font-bold text-sm placeholder:text-slate-300 ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-slate-300"} ${error ? "border-red-500 bg-red-50" : ""}`} 
                />
            )}
        </div>
        {error && <p className="text-[#D80000] text-[11px] font-bold mt-1.5 ml-1">{error}</p>}
    </div>
);

export default function AddBusinessPage() {
    const initialState = {
        name: "", company: "", phone: "", email: "", altPhone: "", website: "",
        country: "India", state: "", city: "", pinCode: "", preferredAddress: "", businessDetails: "",
    };

    const [formData, setFormData] = useState(initialState);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [activeStep, setActiveStep] = useState(1);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (formData.state && indiaStatesCities[formData.state]) {
            setCities(indiaStatesCities[formData.state]);
        } else {
            setCities([]);
            setFormData(prev => ({ ...prev, city: "" }));
        }
    }, [formData.state]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 2 * 1024 * 1024) {
                toast.error("File too large", { description: "Please upload an image under 2MB." });
                return;
            }
            setFile(selectedFile);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = "Full name required.";
            if (!formData.company.trim()) newErrors.company = "Business name required.";
            if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Valid 10-digit phone required.";
        }
        if (step === 2) {
            if (!formData.state) newErrors.state = "State required.";
            if (!formData.city) newErrors.city = "City required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(activeStep)) setActiveStep(prev => prev + 1);
        else toast.warning("Please fill required fields.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.preferredAddress) {
            setErrors({ preferredAddress: "Address is required" });
            return;
        }
        setIsSubmitting(true);

        const submissionPromise = new Promise(async (resolve, reject) => {
            try {
                let logoUrl = "";
                if (file) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('business-logos').upload(fileName, file);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('business-logos').getPublicUrl(fileName);
                    logoUrl = publicUrl;
                }
                const { error: dbError } = await supabase.from("businesses").insert([{ ...formData, logo_url: logoUrl }]);
                if (dbError) throw dbError;
                setFormData(initialState);
                setFile(null);
                setActiveStep(1);
                resolve();
            } catch (error) { reject(error); }
        });

        toast.promise(submissionPromise, {
            loading: 'Listing your business...',
            success: '🎉 Business successfully listed!',
            error: (err) => `Error: ${err.message}`,
        });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-20 font-sans">
            <Toaster position="top-center" richColors closeButton />
            
            {/* --- BRAND HERO SECTION (Updated to Red/Gold) --- */}
            <div className="bg-[#D80000] pt-24 pb-44 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black rounded-full blur-[100px] opacity-20 -ml-24 -mb-24" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex justify-center mb-6">
                        <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/20 shadow-2xl">
                            <Sparkles size={32} className="text-[#FFD700]" />
                        </div>
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mt-4 tracking-tighter">
                        List Your <span className="text-[#FFD700]">Business</span>
                    </h1>
                    <p className="text-white/80 mt-4 text-lg font-medium max-w-lg mx-auto">
                        Join our <span className="underline decoration-[#FFD700] underline-offset-4">verified ecosystem</span> and grow your reach.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
                {/* Progress Tracker (Updated to Red Theme) */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2.5rem] p-4 mb-8 flex items-center justify-between">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${activeStep >= step ? "bg-slate-900 text-[#FFD700] shadow-xl scale-110" : "bg-slate-100 text-slate-400"}`}>
                                {activeStep > step ? <CheckCircle2 size={22} /> : <span className="text-sm">0{step}</span>}
                            </div>
                            {step < 3 && <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-700 ${activeStep > step ? "bg-slate-900" : "bg-slate-100"}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {activeStep === 1 && (
                            <motion.div 
                                key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-[#D80000]/5 rounded-2xl flex items-center justify-center">
                                        <Briefcase className="text-[#D80000]" size={22} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Basic Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormInput label="Full Name" value={formData.name} onChange={handleChange("name")} error={errors.name} Icon={User} placeholder="John Doe" />
                                    <FormInput label="Business Name" value={formData.company} onChange={handleChange("company")} error={errors.company} Icon={Building} placeholder="QickTick Solutions" />
                                    <FormInput label="Primary Phone" value={formData.phone} onChange={handleChange("phone")} error={errors.phone} Icon={Phone} type="tel" placeholder="+91" />
                                    <FormInput label="Email Address" value={formData.email} onChange={handleChange("email")} Icon={Mail} required={false} placeholder="business@email.com" />
                                </div>
                                <div className="mt-12 flex justify-end">
                                    <button type="button" onClick={nextStep} className="bg-slate-900 text-[#FFD700] px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 transition-all hover:bg-black active:scale-95 shadow-xl">
                                        Next Details <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {activeStep === 2 && (
                            <motion.div 
                                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-[#D80000]/5 rounded-2xl flex items-center justify-center">
                                        <MapPin className="text-[#D80000]" size={22} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Location Access</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormInput label="State" value={formData.state} onChange={handleChange("state")} error={errors.state} isSelect options={[{ value: "", label: "Select State" }, ...allStates.map(s => ({ value: s, label: s }))]} Icon={MapPin} />
                                    <FormInput label="City" value={formData.city} onChange={handleChange("city")} error={errors.city} isSelect options={[{ value: "", label: "Select City" }, ...cities.map(c => ({ value: c, label: c }))]} disabled={!formData.state} Icon={MapPin} />
                                </div>
                                <div className="mt-12 flex justify-between items-center">
                                    <button type="button" onClick={() => setActiveStep(1)} className="text-slate-400 font-black flex items-center gap-2 hover:text-[#D80000] transition-colors"><ArrowLeft size={20} /> Back</button>
                                    <button type="button" onClick={nextStep} className="bg-slate-900 text-[#FFD700] px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl hover:bg-black">
                                        Next Step <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 */}
                        {activeStep === 3 && (
                            <motion.div 
                                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-[#D80000]/5 rounded-2xl flex items-center justify-center">
                                        <CornerDownRight className="text-[#D80000]" size={22} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Final Verification</h2>
                                </div>
                                <div className="space-y-8">
                                    <FormInput label="Full Business Address" value={formData.preferredAddress} onChange={handleChange("preferredAddress")} error={errors.preferredAddress} rows={3} Icon={CornerDownRight} placeholder="Street, Building, Area details..." />
                                    
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Business Branding</label>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        <div 
                                            onClick={() => fileInputRef.current.click()}
                                            className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-300 ${file ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:border-[#D80000] hover:bg-red-50/30"} cursor-pointer`}
                                        >
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${file ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 shadow-sm"}`}>
                                                {file ? <CheckCircle2 /> : <Upload />}
                                            </div>
                                            <p className="font-black text-slate-700">{file ? file.name : "Upload Logo or Store Photo"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
                                    <button type="button" onClick={() => setActiveStep(2)} className="text-slate-400 font-black flex items-center gap-2 hover:text-[#D80000]"><ArrowLeft size={20} /> Back</button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-slate-900 text-[#FFD700] px-12 py-5 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : "List Business Now"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}