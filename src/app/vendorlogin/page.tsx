"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabaseClient";
import {
  Check, ChevronRight, ChevronLeft, ShieldCheck,
  X, Upload, Film, Image as ImageIcon, Trash2, Plus, User, AlertCircle
} from "lucide-react";

export default function VendorRegister({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ADDED: Track if the user has tried to move forward or touched the form
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
        if (!formData.business_keywords.trim()) return "Business keywords are required";
        if (formData.gst_number.length !== 15) return "GST Number must be exactly 15 characters";
        if (!formData.sector.trim()) return "Business sector is required";
        if (!formData.profile_info.trim()) return "Business description is required";
        return null;
      case 4:
        if (!formData.address.trim()) return "Address is required";
        if (!formData.city.trim()) return "City is required";
        if (!formData.state.trim()) return "State is required";
        if (!formData.pincode.trim()) return "Pincode is required";
        return null;
      case 5:
        if (formData.media_files.length === 0) return "At least one image is required in Media Assets";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      setError(errorMsg);
      setIsDirty(true); // Show error if they try to skip
      return;
    }
    setError(null);
    setIsDirty(false); // Reset dirty state for the new step
    setStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setError(null);
    setIsDirty(false); // Reset dirty state when going back
    setStep((s) => Math.max(s - 1, 1));
  };

  const handlePayment = async () => {
    if (!(window as any).Razorpay) {
      alert("Payment gateway not loaded. Please refresh.");
      return;
    }

    const selectedPlan = plans.find(p => p.name === formData.subscription_plan);
    const amount = (Number(selectedPlan.base_price) + (Number(selectedPlan.base_price) * (Number(selectedPlan.tax_percent) / 100))) * 100;

    const options = {
      key: "rzp_test_RpvE2nM5XUTYN7",
      amount: Math.round(amount),
      currency: "INR",
      name: "VendorPro",
      description: `Subscription for ${formData.subscription_plan}`,
      handler: function (response: any) {
        finalizeRegistration(response.razorpay_payment_id);
      },
      prefill: {
        name: formData.owner_name,
        email: formData.email,
        contact: formData.mobile_number,
      },
      theme: { color: "#EAB308" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ... inside your VendorRegister component

  const finalizeRegistration = async (paymentId: string | null = null) => {
    setLoading(true);
    try {
      // STEP 1: Create the User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("User creation failed.");

      // STEP 2: Prepare the data including the new user.id
      const now = new Date();
      const expiry = new Date();
      expiry.setFullYear(now.getFullYear() + 1);

      // We exclude 'password' from the public table insert for security
      const { password, ...restOfData } = formData;

      const submissionData = {
        ...restOfData,
        user_id: user.id, // <--- THIS IS THE FIX
        video_files: videoFilesList,
        status: formData.subscription_plan ? 'active' : 'pending',
        payment_id: paymentId,
        subscription_expiry: expiry.toISOString().split('T')[0],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      // STEP 3: Insert into your public vendor_register table
      const { error: dbError } = await supabase
        .from("vendor_register")
        .insert([submissionData]);

      if (dbError) throw dbError;

      alert("Registration Successful! Please check your email for verification.");
      router.push("/user/feed");
    } catch (err: any) {
      setError("Error: " + err.message);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 focus:bg-white outline-none transition-all text-slate-800 text-sm font-bold";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]";

  return (
    <>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* NEW: Fixed Overlay Wrapper */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">

        {/* The Main Modal Container */}
        <div className="relative max-w-6xl w-full grid md:grid-cols-[280px_1fr] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 h-full max-h-[95vh]">
          <button 
  type="button" // <--- CRITICAL: Prevents form submission
  onClick={onClose}
  className="absolute top-6 right-8 z-50 p-2 text-slate-400 hover:text-slate-900 transition-colors"
>
  <X size={24} strokeWidth={3} />
</button>
          <div className="bg-slate-50 p-10 border-r border-slate-100 overflow-y-auto hidden md:block">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <h1 className="text-slate-900 font-black text-xl uppercase tracking-tighter">Vendor<span className="text-yellow-500">Pro</span></h1>
            </div>
            <nav className="space-y-1">
              {["Security", "Personal", "Business", "Location", "Media", "Plan"].map((label, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step === i + 1 ? 'bg-white shadow-sm' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${step >= i + 1 ? 'bg-yellow-500 text-white' : 'bg-slate-200'}`}>
                    {step > i + 1 ? <Check size={14} strokeWidth={4} /> : i + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="p-8 md:p-16 flex flex-col bg-white overflow-y-auto relative">
            <div className="flex-1 max-w-2xl mx-auto w-full">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">01. Access <span className="text-yellow-500">Control</span></h2>
                  <div className="grid gap-4">
                    <input type="email" name="email" placeholder="Email (Required)" value={formData.email} onChange={handleChange} className={inputClass} required />
                    <input type="password" name="password" placeholder="Password (Min 6 chars)" value={formData.password} onChange={handleChange} className={inputClass} />
                    <select name="user_type" value={formData.user_type} onChange={handleChange} className={inputClass}>
                      <option value="" disabled>Select Sector</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="industrial">Industrial</option>
                      <option value="distributor">Distributor</option>
                      <option value="retailer">Retailer</option>
                      <option value="service">Service Provider</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">02. Personal <span className="text-yellow-500">Identity</span></h2>
                  {/* Step 2: Profile Image Section */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {formData.profile_image ? (
                          <>
                            <img src={formData.profile_image} className="w-full h-full object-cover" />
                            {/* REMOVE BUTTON */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData({ ...formData, profile_image: "" });
                              }}
                              className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <User className="text-slate-300" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'profile_image')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <label className={labelClass}>Profile Photo</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className={inputClass} />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className={inputClass} />
                  </div>
                  <input type="text" name="owner_name" placeholder="Owner Name" value={formData.owner_name} onChange={handleChange} className={inputClass} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" name="mobile_number" placeholder="Mobile (10 Digits)" value={formData.mobile_number} onChange={handleChange} className={inputClass} maxLength={10} />
                    <input type="tel" name="alternate_number" placeholder="Alt Mobile (Optional)" value={formData.alternate_number} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">03. Business <span className="text-yellow-500">Profile</span></h2>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    {/* Step 3: Company Logo Section */}
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="relative group w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-100">
                        {formData.company_logo ? (
                          <>
                            <img src={formData.company_logo} className="w-full h-full object-contain p-2" />
                            {/* REMOVE BUTTON */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData({ ...formData, company_logo: "" });
                              }}
                              className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-300" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'company_logo')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                      <label className={labelClass}>Company Logo</label>
                    </div>
                  </div>
                  <input type="text" name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleChange} className={inputClass} />
                  <input type="text" name="business_keywords" placeholder="Keywords (Textiles, Tech, etc.)" value={formData.business_keywords} onChange={handleChange} className={inputClass} />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="gst_number"
                      placeholder="GSTIN (15 Chars)"
                      value={formData.gst_number}
                      onChange={handleChange}
                      className={inputClass}
                      maxLength={15}
                    />

                    {/* UPDATED: Business Legal Structure Dropdown */}
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="" disabled>Legal Structure</option>
                      <option value="proprietorship">Individual / Proprietorship</option>
                      <option value="partnership">Partnership Firm</option>
                      <option value="llp">Limited Liability Partnership (LLP)</option>
                      <option value="private_ltd">Private Limited Company</option>
                      <option value="public_ltd">Public Limited Company</option>
                      <option value="trust_society">Trust / Society</option>
                    </select>
                  </div>
                  <textarea name="profile_info" placeholder="About business..." rows={3} value={formData.profile_info} onChange={handleChange} className={`${inputClass} resize-none`} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">04. Location & <span className="text-yellow-500">Reach</span></h2>
                  <input type="url" name="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} className={inputClass} />
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={inputClass} />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClass} />
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className={inputClass} />
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">05. Media <span className="text-yellow-500">Assets</span></h2>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {mediaPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={src} className="w-full h-full object-cover" />
                        <button onClick={() => removeMedia(i)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-yellow-500">
                      <Plus size={24} /><input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, '', true)} className="hidden" />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="YouTube URL (Optional)" className={inputClass} />
                    <button onClick={addVideoUrl} className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-yellow-500 transition-colors"><Plus size={20} /></button>
                  </div>
                  {videoFilesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {videoFilesList.map((v, i) => (
                        <div key={i} className="bg-slate-100 text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-2">
                          <Film size={10} /> Video {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {!showPlans && !formData.subscription_plan ? (
                    <div className="py-8 text-center">
                      <button
                        onClick={() => setShowPlans(true)}
                        className="group relative inline-flex items-center justify-center px-12 py-8 font-black uppercase tracking-tighter text-white bg-slate-900 rounded-[2.5rem] shadow-2xl hover:bg-yellow-500 transition-all duration-300 active:scale-95"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl italic">View Membership <span className="text-yellow-500 group-hover:text-white">Plans</span></span>
                          <span className="text-[10px] tracking-[0.3em] opacity-60">Optional: Choose to Upgrade</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                          <ChevronRight size={16} strokeWidth={4} />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Choose your <span className="text-yellow-500">Growth Plan</span></h2>
                        <button onClick={() => { setShowPlans(false); setFormData({ ...formData, subscription_plan: "" }) }} className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 transition-all">Skip / Reset</button>
                      </div>
                      <div className="space-y-3">
                        {plans.map((p) => {
                          const isSelected = formData.subscription_plan === p.name;
                          const totalPrice = Number(p.base_price) + (Number(p.base_price) * (Number(p.tax_percent) / 100));
                          return (
                            <div key={p.id} onClick={() => setFormData({ ...formData, subscription_plan: p.name })} className={`group relative overflow-hidden rounded-[2rem] transition-all duration-500 cursor-pointer border-2 ${isSelected ? "bg-white border-yellow-500 shadow-2xl shadow-yellow-500/10 -translate-y-1" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-300"}`}>
                              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? "bg-slate-900 text-white" : "bg-white text-slate-300"}`}>
                                    <Check size={28} className={isSelected ? "text-yellow-500" : "text-slate-100"} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black uppercase">{p.name}</h3>
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md mt-1 inline-block">{p.duration_months} Months</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-2xl font-black italic ${isSelected ? "text-yellow-500" : "text-slate-900"}`}>₹{totalPrice.toLocaleString()}</p>
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Inc. GST</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-col gap-4">
              {/* MODIFIED: Show error only if error exists AND user has tried to proceed (isDirty) */}
              {error && isDirty && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
                  <AlertCircle className="text-red-500" size={18} />
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{error}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                {step > 1 ? (
                  <button onClick={handleBack} className="flex items-center gap-2 font-black text-[10px] uppercase text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft size={16} /> Back</button>
                ) : <div />}

                {step < 6 ? (
                  <button
                    onClick={handleNext}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (formData.subscription_plan) {
                        handlePayment();
                      } else {
                        finalizeRegistration(null);
                      }
                    }}
                    disabled={loading || !formData.email}
                    className="bg-yellow-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all"
                  >
                    {loading ? "Processing..." : formData.subscription_plan ? "Pay & Register" : "Free Registration"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}