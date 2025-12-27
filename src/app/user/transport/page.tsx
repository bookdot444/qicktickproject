"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Package,
  Send,
  Loader,
  ArrowRight,
  Lock,
  ShieldAlert,
  Weight,
  History,
  Sparkles,
  ChevronRight,
  Circle,
} from "lucide-react";

interface TransportRequest {
  id: number;
  name: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  travel_date: string;
  goods_description?: string;
  purpose?: string;
  weight_kg?: string;
  created_at: string;
}

export default function TransportPage() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requests, setRequests] = useState<TransportRequest[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    pickup: "",
    drop: "",
    date: "",
    goods: "",
    weight: "",
  });

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    fetchRequests();
    checkUser();
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

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("travel_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setListLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop || !formData.date) {
      setError("Please fill required fields marked with *");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: submitError } = await supabase.from("travel_requests").insert([
      {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose || null,
        pickup_location: formData.pickup,
        drop_location: formData.drop,
        travel_date: formData.date,
        goods_description: formData.goods || null,
        weight_kg: formData.weight || null,
      },
    ]);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSuccess("Booking submitted successfully!");
      setFormData({ name: "", phone: "", purpose: "", pickup: "", drop: "", date: "", goods: "", weight: "" });
      fetchRequests();
    }
    setLoading(false);
  };

  const handleViewContact = (phone: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!hasSubscription) {
      router.push("/user/subscription-plans");
      return;
    }
    alert(`Contact Number: ${phone}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-20 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D80000; border-radius: 10px; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <div className="bg-[#D80000] pt-24 pb-44 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-[100px] opacity-20 -ml-20 -mb-20" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
              <Truck size={42} className="text-[#FFD700]" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">
            Smart <span className="text-[#FFD700]">Logistics</span>
          </motion.h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
            Connect with verified heavy-load carriers and streamline your business transport instantly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* --- BOOKING FORM --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-100"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#D80000]/5 rounded-2xl flex items-center justify-center">
                  <Send className="text-[#D80000]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Request</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Post your load for carriers</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-[#D80000] p-5 rounded-2xl text-sm font-bold mb-8 border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={20} /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl text-sm font-bold mb-8 border border-emerald-100 flex items-center gap-3">
                    <Sparkles size={20} /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Full Name *" name="name" icon={<UserIcon size={16}/>} value={formData.name} onChange={handleChange} placeholder="Owner Name" />
                  <FormInput label="Contact Phone *" name="phone" icon={<Phone size={16}/>} value={formData.phone} onChange={handleChange} placeholder="+91" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                    <ArrowRight className="text-slate-300" />
                  </div>
                  <FormInput label="Pickup Point *" name="pickup" icon={<MapPin size={16} className="text-[#D80000]"/>} value={formData.pickup} onChange={handleChange} placeholder="Source City" />
                  <FormInput label="Drop Point *" name="drop" icon={<MapPin size={16} className="text-emerald-500"/>} value={formData.drop} onChange={handleChange} placeholder="Destination" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Transport Date *" name="date" type="date" icon={<Calendar size={16}/>} value={formData.date} onChange={handleChange} />
                  <FormInput label="Total Weight (KG)" name="weight" icon={<Weight size={16}/>} value={formData.weight} onChange={handleChange} placeholder="Optional" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 ml-1">
                    <Package size={14} className="text-[#FFD700]"/> Material / Goods Details
                  </label>
                  <textarea
                    name="goods"
                    value={formData.goods}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 focus:ring-2 focus:ring-[#D80000]/20 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                    placeholder="e.g. Industrial Machinery, Raw Materials..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-[#FFD700] py-6 rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98] text-lg"
                >
                  {loading ? <Loader className="animate-spin" size={24} /> : "Post Transport Request"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* --- LIVE FEED --- */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                <History className="text-[#D80000]" size={22} />
                Live Inquiries
              </h2>
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">Verified Feed</span>
              </div>
            </div>

            <div className="space-y-5 max-h-[900px] overflow-y-auto pr-3 custom-scrollbar">
              {listLoading ? (
                [1, 2, 3, 4].map((n) => <div key={n} className="h-44 w-full bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)
              ) : requests.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold">No Active Inquiries</div>
              ) : (
                requests.map((r, idx) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
                  >
                    {/* Progress Track */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D80000] opacity-10 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 bg-[#D80000]/5 px-3 py-1 rounded-full">
                        <Calendar size={12} className="text-[#D80000]" />
                        <span className="text-[9px] font-black text-[#D80000] uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 tracking-tighter">ID: #QT-{r.id}</span>
                    </div>

                    <div className="relative pl-6 mb-6">
                      <div className="absolute left-0 top-1 bottom-1 w-[2px] border-l-2 border-dashed border-slate-200" />
                      <div className="mb-4 relative">
                        <Circle className="absolute -left-[27.5px] top-0.5 text-[#D80000] fill-[#D80000]" size={8} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pickup</p>
                        <p className="text-sm font-bold text-slate-800">{r.pickup_location}</p>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute -left-[31px] -top-0.5 text-emerald-500" size={15} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                        <p className="text-sm font-bold text-slate-800">{r.drop_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-5 border-t border-slate-50 mb-6">
                      <div className="flex items-center gap-2">
                        <Weight size={14} className="text-[#FFD700]" />
                        <span className="text-xs font-black text-slate-600">{r.weight_kg ? `${r.weight_kg}kg` : "Open Weight"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-[#FFD700]" />
                        <span className="text-xs font-black text-slate-600">Verified Carrier</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-6">
                      <div className={`flex items-center gap-2 ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
                        <UserIcon size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-600">{r.name}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-600">{r.phone}</span>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => handleViewContact(r.phone)}
                      className="w-full bg-slate-50 hover:bg-slate-900 group/btn py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-slate-100 shadow-sm"
                    >
                      {hasSubscription ? (
                        <>
                          <Phone size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            View Contact
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} className="text-[#FFD700]" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Take Subscription to View Details
                          </span>
                          <ChevronRight size={14} className="text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
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