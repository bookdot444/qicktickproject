"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Send, 
  Loader, 
  Lock, 
  ShieldAlert, 
  History,
  Calendar,
  Sparkles,
  ChevronRight,
  Quote
} from "lucide-react";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  is_subscribed: boolean;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchEnquiries();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);

    if (!data.user) return;

    // Check if user is a vendor
    const { data: vendor } = await supabase
      .from("vendor_register")
      .select("subscription_plan, subscription_expiry")
      .eq("user_id", data.user.id)
      .single();

    if (vendor) {
      // For vendors, check if subscription_plan exists and subscription_expiry is in future
      const hasActiveVendorSub = vendor.subscription_plan && vendor.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
      setHasSubscription(!!hasActiveVendorSub);
    } else {
      // For regular users, check user_subscriptions
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("status", "active")
        .single();

      setHasSubscription(!!sub);
    }
  };

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setEnquiries(data || []);
    setLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Please fill in required fields marked with *");
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("enquiries").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
        user_id: user?.id ?? null,
        is_subscribed: false,
      },
    ]);

    if (error) {
      setFormError("Failed to submit enquiry.");
    } else {
      setFormSuccess("Your enquiry has been sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      fetchEnquiries();
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-20 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D80000; border-radius: 10px; }
      `}</style>

      {/* --- BRAND HERO SECTION --- */}
      <div className="bg-[#D80000] pt-24 pb-44 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black rounded-full blur-[100px] opacity-20 -ml-24 -mb-24" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex justify-center mb-8">
            <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-2xl">
              <MessageSquare size={44} className="text-[#FFD700]" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">
            Support <span className="text-[#FFD700]">Center</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
            Have questions about our verified listings or services? Our team is 
            <span className="text-white font-bold italic ml-1 underline decoration-[#FFD700] underline-offset-4">standing by.</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- ENQUIRY FORM --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#D80000]/5 rounded-2xl flex items-center justify-center">
                   <Send className="text-[#D80000]" size={22} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Direct Message</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Response within 24 hours</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-[#D80000] p-5 rounded-2xl text-sm font-bold mb-8 border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={20} /> {formError}
                  </motion.div>
                )}
                {formSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl text-sm font-bold mb-8 border border-emerald-100 flex items-center gap-3">
                    <Sparkles size={20} className="text-emerald-500" /> {formSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label="Full Name *" name="name" icon={<UserIcon size={16}/>} value={formData.name} onChange={handleFormChange} placeholder="John Doe" />
                  <FormInput label="Email Address *" name="email" type="email" icon={<Mail size={16}/>} value={formData.email} onChange={handleFormChange} placeholder="john@qicktick.com" />
                </div>

                <FormInput label="Phone Number" name="phone" icon={<Phone size={16}/>} value={formData.phone} onChange={handleFormChange} placeholder="+91" />

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
                    <MessageSquare size={14} className="text-[#D80000]"/> Inquiry Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 focus:ring-2 focus:ring-[#D80000]/20 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                    placeholder="Describe your requirement or question..."
                  />
                </div>

                <button
                  onClick={handleFormSubmit}
                  disabled={formLoading}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-[#FFD700] py-6 rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] text-lg"
                >
                  {formLoading ? <Loader className="animate-spin" size={24} /> : "Send My Inquiry"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* --- SIDE FEED --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                <History className="text-[#D80000]" size={22} />
                Recent Inquiries
              </h2>
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">Verified Community</span>
              </div>
            </div>

            <div className="space-y-5 max-h-[850px] overflow-y-auto pr-3 custom-scrollbar">
              {loading ? (
                [1, 2, 3].map((n) => <div key={n} className="h-44 w-full bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)
              ) : enquiries.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold tracking-widest uppercase text-xs">No active records</div>
              ) : (
                enquiries.map((enq, idx) => (
                  <motion.div
                    key={enq.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFD700] opacity-30 group-hover:bg-[#D80000] group-hover:opacity-100 transition-all" />

                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 bg-[#D80000]/5 px-3 py-1 rounded-full">
                        <Calendar size={12} className="text-[#D80000]" />
                        <span className="text-[9px] font-black text-[#D80000] uppercase tracking-widest">{new Date(enq.created_at).toLocaleDateString("en-GB")}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 tracking-tighter">QT-ENQ-{enq.id}</span>
                    </div>

                    <div className="mb-6 relative">
                      <Quote className="absolute -top-2 -left-2 text-[#D80000]/5" size={40} />
                      <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10 line-clamp-3 italic">
                        "{enq.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-[#FFD700]">
                        {enq.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted By</p>
                        <p className="text-xs font-bold text-slate-900">{enq.name}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-600">{enq.email}</span>
                      </div>
                      {enq.phone && (
                        <div className={`flex items-center gap-3 ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
                          <Phone size={14} className="text-slate-400" />
                          <span className="text-xs font-black text-slate-600">{enq.phone}</span>
                        </div>
                      )}
                    </div>

                    {!hasSubscription && (
                      <button 
                        onClick={() => window.location.href='/user/subscription-plans'}
                        className="w-full mt-4 bg-slate-50 hover:bg-slate-900 group/btn py-3 rounded-2xl flex items-center justify-center gap-3 transition-all border border-slate-100 shadow-sm"
                      >
                        <Lock size={14} className="text-[#FFD700]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Take Subscription to View Details
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, placeholder, name, type = "text" }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-[1.2rem] p-4.5 p-4 focus:ring-2 focus:ring-[#D80000]/20 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
      />
    </div>
  );
}