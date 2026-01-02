"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Check, ChevronRight, ChevronLeft, ShieldCheck,
  X, Upload, Film, Image as ImageIcon, Trash2, Plus, User, AlertCircle, Globe
} from "lucide-react";

export default function VendorRegister({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState(""); // For the input field

  // ADDED: Track if the user has tried to move forward or touched the form
  const [isDirty, setIsDirty] = useState(false);

  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [videoFilesList, setVideoFilesList] = useState<{ url: string, added_at: string }[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

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
    user_type: [] as string[], gst_number: "",
    websites: [] as string[], // Changed from website: ""
    flat_no: "",
    floor: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    business_keywords: "",
    sector: "",
    address: "",
    subscription_plan_id: null as number | null,
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

  const addWebsite = () => {
    if (!websiteInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      websites: [...prev.websites, websiteInput.trim()]
    }));
    setWebsiteInput("");
  };

  const removeWebsite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };

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

  // Function to handle Video File Uploads (converts to Base64 for preview/storage)
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newVideo = {
        type: 'file',
        url: reader.result as string,
        name: file.name,
        added_at: new Date().toISOString()
      };
      const newList = [...videoFilesList, newVideo];
      setVideoFilesList(newList);
      setFormData(prev => ({ ...prev, video_files: newList }));
    };
    reader.readAsDataURL(file);
  };

  // Function to handle Video URL (YouTube/Vimeo)
  const addVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    const newVideo = {
      type: 'url',
      url: videoUrlInput.trim(),
      added_at: new Date().toISOString()
    };
    const newList = [...videoFilesList, newVideo];
    setVideoFilesList(newList);
    setFormData(prev => ({ ...prev, video_files: newList }));
    setVideoUrlInput("");
  };

  // Function to remove any video
  const removeVideo = (index: number) => {
    const newList = videoFilesList.filter((_, i) => i !== index);
    setVideoFilesList(newList);
    setFormData(prev => ({ ...prev, video_files: newList }));
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
        if (formData.user_type.length === 0)return "Please select at least one business sector";
        return null;
      case 2:
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
        return null;
      case 4:
        if (!formData.building.trim()) return "Building/Project name is required";
        if (!formData.street.trim()) return "Street/Road is required";
        if (!formData.area.trim()) return "Area/Locality is required";
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

  const handleNext = async () => {
    const errorMsg = validateStep(step);

    if (errorMsg) {
      setError(errorMsg);
      setIsDirty(true);
      return;
    }

    // 🔴 EMAIL CHECK ONLY ON STEP 1
    if (step === 1) {
      try {
        setCheckingEmail(true);

        const exists = await checkEmailExists(formData.email);

        if (exists) {
          setError("This email is already registered. Please login.");
          setIsDirty(true);
          return;
        }
      } catch (err: any) {
        setError("Unable to verify email. Please try again.");
        setIsDirty(true);
        return;
      } finally {
        setCheckingEmail(false);
      }
    }

    setError(null);
    setIsDirty(false);
    setStep((s) => Math.min(s + 1, 6));
  };
  const checkEmailExists = async (email: string) => {
    const { data, error } = await supabase
      .from("vendor_register")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  };


  const handleBack = () => {
    setError(null);
    setIsDirty(false); // Reset dirty state when going back
    setStep((s) => Math.max(s - 1, 1));
  };

  const handlePayment = async () => {
    if (!formData.subscription_plan_id) {
      toast.error("Please select a subscription plan");
      return;
    }

    const selectedPlan = plans.find(
      p => Number(p.id) === Number(formData.subscription_plan_id)
    );

    if (!selectedPlan) {
      toast.error("Invalid subscription plan selected");
      return;
    }

    const basePrice = Number(selectedPlan.base_price);
    const taxPercent = Number(selectedPlan.tax_percent);

    const amount = (basePrice + (basePrice * taxPercent) / 100) * 100;

    const options = {
      key: "rzp_test_RpvE2nM5XUTYN7",
      amount: Math.round(amount),
      currency: "INR",
      name: "VendorPro",
      description: `Subscription for ${selectedPlan.name}`,
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
        subscription_plan_id: formData.subscription_plan_id,
        status: formData.subscription_plan_id ? 'active' : 'pending',
        payment_id: paymentId,
        subscription_expiry: expiry.toISOString().split('T')[0],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      // Check if vendor already exists
      const { data: existingVendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (existingVendor) {
        setError("This email is already registered. Please login.");
        setIsDirty(true);
        setLoading(false);
        return;
      }


      // STEP 3: Insert into your public vendor_register table
      const { error: dbError } = await supabase
        .from("vendor_register")
        .insert([submissionData]);

      if (dbError) throw dbError;

      toast.success("Registration successful! Welcome onboard.");
      router.push("/user");
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
      <Toaster position="top-right" reverseOrder={false} />
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* NEW: Fixed Overlay Wrapper */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 md:p-6">

        {/* The Main Modal Container */}
        <div className="relative max-w-6xl w-full grid md:grid-cols-[300px_1fr] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-yellow-600 h-full max-h-[92vh]">

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-8 z-50 p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
          >
            <X size={26} strokeWidth={2.5} />
          </button>

          <div className="bg-slate-50/50 p-10 flex flex-col hidden md:flex border-r border-slate-100">

            {/* BRANDING: Minimal & Strong */}
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-600/20">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-slate-900 font-black text-xl uppercase tracking-tighter leading-none">
                  Vendor<span className="text-yellow-600">Pro</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Official Partner</p>
              </div>
            </div>

            {/* NAVIGATION: Clean White Cards for Active State */}
            <nav className="flex-1 space-y-1">
              {["Security", "Personal", "Business", "Location", "Media", "Plan"].map((label, i) => {
                const isActive = step === i + 1;
                const isCompleted = step > i + 1;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive
                      ? 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100'
                      : 'opacity-40 hover:opacity-100'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${isActive
                      ? 'bg-yellow-600 text-white rotate-6 scale-110'
                      : isCompleted
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500'
                      }`}>
                      {isCompleted ? <Check size={14} strokeWidth={4} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </nav>

            {/* PROGRESS: Subtle & Integrated */}
            <div className="mt-auto pt-10">
              <div className="px-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setup Status</span>
                  <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">
                    Step {step}/6
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-600 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                    style={{ width: `${(step / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="p-8 md:p-14 flex flex-col bg-white overflow-y-auto relative">
            <div className="flex-1 max-w-2xl mx-auto w-full">

              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-2">
                    <span className="text-yellow-600 font-black text-sm tracking-[.4em] uppercase">Step 01</span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Access <span className="text-yellow-600">Control</span></h2>
                  </div>
                  <div className="grid gap-5">
                    <div className="group">
                      <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={`${inputClass} focus:ring-yellow-600 focus:border-yellow-600 py-4 px-6 text-lg rounded-2xl shadow-sm border-slate-200 transition-all`} required />
                    </div>
                    <input type="password" name="password" placeholder="Secure Password" value={formData.password} onChange={handleChange} className={`${inputClass} py-4 px-6 text-lg rounded-2xl shadow-sm border-slate-200 transition-all`} />
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700">
                        Select Business Sector (Multiple allowed)
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Manufacturer", value: "manufacturer" },
                          { label: "Industrial", value: "industrial" },
                          { label: "Distributor", value: "distributor" },
                          { label: "Retailer", value: "retailer" },
                          { label: "Service Provider", value: "service" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all
          ${formData.user_type.includes(option.value)
                                ? "border-yellow-600 bg-yellow-50"
                                : "border-slate-200 hover:border-slate-300"
                              }
        `}
                          >
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={formData.user_type.includes(option.value)}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  user_type: prev.user_type.includes(value)
                                    ? prev.user_type.filter((v) => v !== value)
                                    : [...prev.user_type, value],
                                }));
                              }}
                              className="accent-yellow-600"
                            />
                            <span className="font-medium text-slate-300">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-2">
                    <span className="text-yellow-600 font-black text-sm tracking-[.4em] uppercase">Step 02</span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Personal <span className="text-yellow-600">Identity</span></h2>
                  </div>



                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                    <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  </div>
                  <input type="text" name="owner_name" placeholder="Legal Owner Name" value={formData.owner_name} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="tel" name="mobile_number" placeholder="Primary Mobile" value={formData.mobile_number} onChange={handleChange} className={`${inputClass} rounded-2xl`} maxLength={10} />
                    <input type="tel" name="alternate_number" placeholder="Backup (Optional)" value={formData.alternate_number} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-2">
                    <span className="text-yellow-600 font-black text-sm tracking-[.4em] uppercase">Step 03</span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Business <span className="text-yellow-600">Profile</span></h2>
                  </div>

                  <div className="flex items-center gap-6 p-6 bg-yellow-600/5 rounded-3xl border border-yellow-600/10">
                    <div className="relative group w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 transition-all hover:scale-105">
                      {formData.company_logo ? (
                        <>
                          <img src={formData.company_logo} className="w-full h-full object-contain p-2" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, company_logo: "" });
                            }}
                            className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-yellow-600" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'company_logo')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-black uppercase text-slate-900 tracking-tight">Company Branding</label>
                      <p className="text-[11px] text-slate-500 font-medium">SVG, PNG or JPG preferred.</p>
                    </div>
                  </div>

                  <input type="text" name="company_name" placeholder="Registered Company Name" value={formData.company_name} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  <input type="text" name="business_keywords" placeholder="Keywords (e.g. Chemicals, Steel, Logistics)" value={formData.business_keywords} onChange={handleChange} className={`${inputClass} rounded-2xl`} />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="gst_number"
                      placeholder="GSTIN Number"
                      value={formData.gst_number}
                      onChange={handleChange}
                      className={`${inputClass} rounded-2xl uppercase`}
                      maxLength={15}
                    />
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className={`${inputClass} rounded-2xl`}
                    >
                      <option value="" disabled>Legal Structure</option>
                      <option value="proprietorship">Individual / Proprietorship</option>
                      <option value="partnership">Partnership Firm</option>
                      <option value="llp">LLP</option>
                      <option value="private_ltd">Private Limited</option>
                      <option value="public_ltd">Public Limited</option>
                      <option value="trust_society">Trust / Society</option>
                    </select>
                  </div>
                  <textarea name="profile_info" placeholder="Detailed business description..." rows={4} value={formData.profile_info} onChange={handleChange} className={`${inputClass} resize-none rounded-2xl`} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-2">
                    <span className="text-yellow-600 font-black text-sm tracking-[.4em] uppercase">Step 04</span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Global <span className="text-yellow-600">Presence</span></h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Digital Assets</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={websiteInput}
                        onChange={(e) => setWebsiteInput(e.target.value)}
                        placeholder="Website URL (https://...)"
                        className={`${inputClass} rounded-2xl`}
                      />
                      <button
                        onClick={addWebsite}
                        type="button"
                        className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-yellow-600 transition-all shadow-lg active:scale-90"
                      >
                        <Plus size={24} strokeWidth={3} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.websites.map((url, i) => (
                        <div key={i} className="bg-yellow-600/5 text-yellow-700 text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-3 border border-yellow-600/10">
                          <Globe size={12} />
                          <span className="truncate max-w-[150px]">{url}</span>
                          <button onClick={() => removeWebsite(i)} className="text-red-500 hover:scale-125 transition-transform">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-1 bg-slate-100 rounded-2xl mb-2"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="flat_no" placeholder="Office / Shop No." value={formData.flat_no} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                    <input type="text" name="floor" placeholder="Floor" value={formData.floor} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  </div>
                  <input type="text" name="building" placeholder="Building / Business Park" value={formData.building} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} className={`${inputClass} rounded-2xl`} />

                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="area" placeholder="Locality" value={formData.area} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                    <input type="text" name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className={`${inputClass} rounded-2xl`} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-2">
                    <span className="text-yellow-600 font-black text-sm tracking-[.4em] uppercase">Step 05</span>
                    <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Media <span className="text-yellow-600">Showcase</span></h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Photo Gallery</label>
                    <div className="grid grid-cols-4 gap-4">
                      {mediaPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border-2 border-white">
                          <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <button onClick={() => removeMedia(i)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-yellow-600 hover:bg-yellow-600/5 transition-all group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                          <Plus size={24} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black uppercase mt-3 tracking-tighter">Add Photo</span>
                        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, '', true)} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-5 pt-4">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Video Experience</label>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <input
                        type="text"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="Paste YouTube or Vimeo URL"
                        className={`${inputClass} rounded-2xl`}
                      />
                      <button
                        type="button"
                        onClick={addVideoUrl}
                        className="bg-yellow-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all font-bold uppercase text-xs"
                      >
                        Link
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                      <div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-white px-4 text-slate-300">Or Upload File</span></div>
                    </div>

                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all hover:border-yellow-600 group">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                        <Upload size={24} />
                      </div>
                      <span className="text-xs font-black uppercase text-slate-600">Drop video file here</span>
                      <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                    </label>

                    <div className="grid gap-2">
                      {videoFilesList.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white group animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                              {v.type === 'url' ? <Film size={18} className="text-yellow-600" /> : <Upload size={18} className="text-yellow-600" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">{v.type}</p>
                              <p className="text-sm font-bold truncate max-w-[250px]">{v.name || v.url}</p>
                            </div>
                          </div>
                          <button onClick={() => removeVideo(i)} className="p-2 hover:bg-red-600 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">

                  {!showPlans && !formData.subscription_plan_id ? (
                    <div className="py-20 text-center">
                      <button
                        onClick={() => setShowPlans(true)}
                        className="group relative inline-flex items-center justify-center px-16 py-10 font-black uppercase tracking-tighter text-white bg-slate-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-yellow-600 transition-all duration-500 active:scale-95"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-3xl italic tracking-tight">
                            VIP Membership <span className="text-yellow-600 group-hover:text-white">Access</span>
                          </span>
                          <span className="text-[10px] tracking-[0.5em] opacity-50">
                            Scale your business today
                          </span>
                        </div>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center border-[6px] border-white shadow-xl animate-bounce">
                          <ChevronRight size={24} strokeWidth={4} />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">

                      <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                          <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">
                            Growth <span className="text-yellow-600">Plans</span>
                          </h2>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Select your professional tier
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setShowPlans(false);
                            setFormData(prev => ({
                              ...prev,
                              subscription_plan_id: null
                            }));
                          }}
                          className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          Clear Choice
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {plans.map((p) => {
                          const isSelected = formData.subscription_plan_id === p.id;
                          const totalPrice =
                            Number(p.base_price) +
                            (Number(p.base_price) * Number(p.tax_percent)) / 100;

                          return (
                            <div
                              key={p.id}
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  subscription_plan_id: p.id
                                }))
                              }
                              className={`group relative overflow-hidden rounded-[2.5rem] transition-all duration-500 cursor-pointer border-4 ${isSelected
                                ? "bg-white border-yellow-600 shadow-2xl -translate-y-1"
                                : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                                }`}
                            >
                              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                  <div
                                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isSelected
                                      ? "bg-slate-900 text-yellow-600 rotate-12"
                                      : "bg-white text-slate-200 shadow-sm"
                                      }`}
                                  >
                                    <Check size={32} strokeWidth={isSelected ? 4 : 2} />
                                  </div>

                                  <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                      {p.name}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] font-black px-3 py-1 bg-yellow-600 text-white rounded-full uppercase tracking-tighter">
                                        {p.duration_months} Months Access
                                      </span>
                                      {isSelected && (
                                        <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-white rounded-full uppercase tracking-tighter animate-pulse">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className={`text-4xl font-black italic tracking-tighter ${isSelected ? "text-yellow-600" : "text-slate-900"
                                    }`}>
                                    ₹{totalPrice.toLocaleString()}
                                  </p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Inclusive of GST
                                  </p>
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
                    disabled={checkingEmail}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-40"
                  >
                    {checkingEmail ? "Checking Email..." : "Continue"}
                  </button>

                ) : (
                  <button
                    onClick={() => {
                      if (formData.subscription_plan_id) {
                        handlePayment();
                      } else {
                        finalizeRegistration(null);
                      }
                    }}
                    disabled={loading || !formData.email}
                    className="bg-yellow-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all"
                  >
                    {loading
                      ? "Processing..."
                      : formData.subscription_plan_id
                        ? "Pay & Register"
                        : "Free Registration"}
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