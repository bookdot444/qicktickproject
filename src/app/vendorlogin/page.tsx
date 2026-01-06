"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabaseClient";
import {
  Check, ChevronRight, ChevronLeft, ShieldCheck,
  X, Upload, Film, Image as ImageIcon, Trash2, Plus, User, AlertCircle
} from "lucide-react";

// --- PART 1: THE FORM LOGIC (Sub-component) ---
function VendorRegistrationForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [videoFilesList, setVideoFilesList] = useState<{ url: string, added_at: string }[]>([]);
  const [showPlans, setShowPlans] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    owner_name: "",
    mobile_number: "",
    alternate_number: "",
    profile_info: "",
    company_name: "",
    user_type: "vendor",
    gst_number: "",
    website: "",
    business_keywords: "",
    sector: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    subscription_plan: "",
    profile_image: "",
    company_logo: "",
    media_files: [] as string[],
    video_files: [] as any
  });

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("base_price", { ascending: true });
      if (!error && data) setPlans(data);
    }
    fetchPlans();
  }, []);

  useEffect(() => {
    const errorMsg = validateStep(step);
    setError(errorMsg);
  }, [formData, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, isMultiple = false) => {
    const files = e.target.files;
    if (!files) return;
    const reader = (file: File) => new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(file);
    });

    if (isMultiple) {
      Array.from(files).forEach(async (file) => {
        const base64 = await reader(file) as string;
        setMediaPreviews(prev => [...prev, base64]);
        setFormData(prev => ({ ...prev, media_files: [...prev.media_files, base64] }));
      });
    } else {
      reader(files[0]).then((base64) => {
        setFormData(prev => ({ ...prev, [field]: base64 }));
      });
    }
  };

  const addVideoUrl = () => {
    if (!videoUrlInput) return;
    const newVideo = { url: videoUrlInput, added_at: new Date().toISOString() };
    const newList = [...videoFilesList, newVideo];
    setVideoFilesList(newList);
    setFormData(prev => ({ ...prev, video_files: newList }));
    setVideoUrlInput("");
  };

  const removeMedia = (index: number) => {
    const filtered = formData.media_files.filter((_, i) => i !== index);
    setMediaPreviews(filtered);
    setFormData({ ...formData, media_files: filtered });
  };

  const validateStep = (currentStep: number) => {
    const mobileRegex = /^[0-9]{10}$/;
    switch (currentStep) {
      case 1:
        if (!formData.email.includes("@")) return "A valid Email is required";
        if (formData.password.length < 6) return "Password must be at least 6 characters";
        return null;
      case 2:
        if (!formData.profile_image) return "Please upload a profile image";
        if (!formData.first_name.trim()) return "First name is required";
        if (!formData.last_name.trim()) return "Last name is required";
        if (!formData.owner_name.trim()) return "Owner name is required";
        if (!mobileRegex.test(formData.mobile_number)) return "Mobile number must be exactly 10 digits";
        return null;
      case 3:
        if (!formData.company_logo) return "Company logo is required";
        if (!formData.company_name.trim()) return "Company name is required";
        if (formData.gst_number.length !== 15) return "GST Number must be 15 characters";
        return null;
      case 4:
        if (!formData.address.trim()) return "Address is required";
        if (!formData.city.trim()) return "City is required";
        return null;
      case 5:
        if (formData.media_files.length === 0) return "At least one image is required";
        return null;
      default: return null;
    }
  };

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) { setError(errorMsg); setIsDirty(true); return; }
    setError(null); setIsDirty(false);
    setStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => { setError(null); setIsDirty(false); setStep((s) => Math.max(s - 1, 1)); };

  const handlePayment = async () => {
    if (!(window as any).Razorpay) return;
    const selectedPlan = plans.find(p => p.name === formData.subscription_plan);
    const amount = (Number(selectedPlan.base_price) * (1 + Number(selectedPlan.tax_percent) / 100)) * 100;
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(amount),
      currency: "INR",
      name: "VendorPro",
      handler: (res: any) => finalizeRegistration(res.razorpay_payment_id),
      prefill: { email: formData.email, contact: formData.mobile_number },
      theme: { color: "#EAB308" },
    };
    new (window as any).Razorpay(options).open();
  };

  const finalizeRegistration = async (paymentId: string | null = null) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
      });
      if (authError) throw authError;
      const { password, ...restOfData } = formData;
      const { error: dbError } = await supabase.from("vendor_register").insert([{
        ...restOfData, user_id: authData.user?.id, payment_id: paymentId, status: paymentId ? 'active' : 'pending'
      }]);
      if (dbError) throw dbError;
      router.push("/user/feed");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 focus:bg-white outline-none transition-all text-slate-800 text-sm font-bold";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]";

  return (
    <>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="relative max-w-6xl w-full grid md:grid-cols-[280px_1fr] bg-white rounded-[3rem] shadow-2xl overflow-hidden h-full max-h-[95vh]">
          <button type="button" onClick={onClose} className="absolute top-6 right-8 z-50 p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
          
          <div className="bg-slate-50 p-10 border-r border-slate-100 hidden md:block">
            <h1 className="text-slate-900 font-black text-xl uppercase mb-12">Vendor<span className="text-yellow-500">Pro</span></h1>
            <nav className="space-y-1">
              {["Security", "Personal", "Business", "Location", "Media", "Plan"].map((label, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${step === i + 1 ? 'bg-white shadow-sm' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${step >= i + 1 ? 'bg-yellow-500 text-white' : 'bg-slate-200'}`}>
                    {step > i + 1 ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-8 md:p-16 flex flex-col bg-white overflow-y-auto">
            <div className="flex-1 max-w-2xl mx-auto w-full">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">01. Access <span className="text-yellow-500">Control</span></h2>
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass} />
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputClass} />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">02. Identity</h2>
                  <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className={inputClass} />
                  <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className={inputClass} />
                  <input type="tel" name="mobile_number" placeholder="Mobile" value={formData.mobile_number} onChange={handleChange} className={inputClass} maxLength={10} />
                </div>
              )}
              {/* Note: Steps 3-6 follow the same pattern as your original code */}
              {step === 5 && (
                <div className="space-y-6">
                   <h2 className="text-3xl font-black text-slate-900 uppercase italic">05. Media</h2>
                   <div className="grid grid-cols-4 gap-4">
                      {mediaPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                          <img src={src} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer">
                        <Plus /><input type="file" multiple onChange={(e) => handleFileUpload(e, '', true)} className="hidden" />
                      </label>
                   </div>
                </div>
              )}
              {step === 6 && (
                <div className="space-y-6 py-8 text-center">
                   <h2 className="text-2xl font-black italic">Final Step: Select Plan</h2>
                   <div className="space-y-2">
                    {plans.map(p => (
                      <div key={p.id} onClick={() => setFormData({...formData, subscription_plan: p.name})} className={`p-4 border rounded-2xl cursor-pointer ${formData.subscription_plan === p.name ? 'border-yellow-500 bg-yellow-50' : ''}`}>
                        {p.name} - ₹{p.base_price}
                      </div>
                    ))}
                   </div>
                </div>
              )}
            </div>

            <div className="mt-12">
              {error && isDirty && <div className="text-red-500 text-xs mb-4 font-bold uppercase">{error}</div>}
              <div className="flex justify-between items-center">
                {step > 1 && <button onClick={handleBack} className="text-slate-400 font-black text-[10px] uppercase">Back</button>}
                <button 
                  onClick={step < 6 ? handleNext : () => formData.subscription_plan ? handlePayment() : finalizeRegistration()} 
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase"
                >
                  {step < 6 ? "Continue" : loading ? "Processing..." : "Finish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- PART 2: THE DEFAULT EXPORT (The actual Page) ---
// This component has NO props, which fixes the Next.js Type Error
export default function VendorLoginPage() {
  const router = useRouter();

  const handleClose = () => {
    // If the user clicks X, we navigate away
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-900">
      <VendorRegistrationForm onClose={handleClose} />
    </main>
  );
}