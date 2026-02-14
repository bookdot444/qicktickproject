"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2, RefreshCw, Search, X, Mail, Phone, MapPin, Tag,
  Briefcase, Globe, FileText, CheckCircle2, AlertCircle,
  Building2, Hash, ExternalLink, Calendar, ShieldCheck, Activity,
  Plus, Upload, Trash2
} from "lucide-react";
import toast from "react-hot-toast";  // Toast for notifications

// --- Types ---
type Vendor = {
  id: string;
  email: string;
  role?: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  mobile_number: string | null;
  alternate_number: string | null;
  profile_info: string | null;
  company_name: string | null;
  business_type: string | null;
  media_files: string[] | null;
  status: string;
  subscription_plan: string | null;
  subscription_expiry: string | null;
  owner_name: string | null;
  gst_number: string | null;
  website: string | null;
  business_keywords: string | null;
  sector: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  company_logo: string | null;
  payment_id: string | null;
  categories?: { id: string; name: string }[];  // Updated to array of objects
  certificates: string[] | null;  // NEW: For certificate images
};

type SubscriptionPlan = {
  id: number;
  name: string;
  base_price: number;
  tax_percent: number;
  duration_months: number;
  benefits: string[];
  color: string | null;
  medals: string | null;
};

// --- Custom Hook ---
const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const { data: vendorsData, error } = await supabase
      .from("vendor_register")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && vendorsData) {
      // Parse categories and certificates from JSON strings
      const vendorsWithParsed = vendorsData.map(v => ({
        ...v,
        categories: v.categories ? JSON.parse(v.categories) : [],
        certificates: (v.certificates && typeof v.certificates === 'string') ? JSON.parse(v.certificates) : (Array.isArray(v.certificates) ? v.certificates : []),
      }));

      setVendors(vendorsWithParsed);
    }
    setLoading(false);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("vendor_register").update({ status: newStatus }).eq("id", id);
    if (!error) setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  const deleteVendor = async (id: string) => {
    const { error } = await supabase.from("vendor_register").delete().eq("id", id);
    if (!error) setVendors(prev => prev.filter(v => v.id !== id));
  };

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  return { vendors, loading, fetchVendors, updateStatus, deleteVendor };
};

// --- Simplified Add Vendor Form Component ---
function AddVendorForm({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]);  // NEW: For certificates
  const [videoFilesList, setVideoFilesList] = useState<{ url: string, added_at: string }[]>([]);
  const [websiteInput, setWebsiteInput] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    owner_name: "",
    mobile_number: "",
    alternate_number: "",
    profile_info: "",
    company_name: "",
    user_type: [] as string[],
    gst_number: "",
    websites: [] as string[],
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
    company_logo: "",
    media_files: [] as string[],
    video_files: [] as any,
    status: "approved", // Default to approved for admin adds
    categories: [] as { id: string; name: string }[],  // Updated to array of objects
    certificates: [] as string[],  // NEW: For certificate images
    role: "admin",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      setCategories(data || []);
    };

    const fetchSubscriptionPlans = async () => {
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("base_price");

      setSubscriptionPlans(data || []);
    };

    fetchCategories();
    fetchSubscriptionPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      user_type: prev.user_type.includes(value)
        ? prev.user_type.filter(v => v !== value)
        : [...prev.user_type, value]
    }));
  };

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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "media_files" | "certificates" | "company_logo",
    isMultiple = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const uploadToBucket = async (file: File, bucket: string, path: string) => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return urlData.publicUrl;
      };

      if (isMultiple) {
        const urls: string[] = [];
        const maxFiles = field === 'media_files' || field === 'certificates' ? 6 : Infinity;  // Max 6 for photos and certificates
        const currentCount = field === 'media_files' ? mediaPreviews.length : certificatePreviews.length;
        if (currentCount + files.length > maxFiles) {
          throw new Error(`Maximum ${maxFiles} ${field === 'media_files' ? 'photos' : 'certificates'} allowed.`);
        }
        for (const file of Array.from(files)) {
          if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
          const subPath = field === 'media_files' ? 'media' : 'certificates';
          const path = `vendor/${subPath}/${Date.now()}-${file.name}`;
          const url = await uploadToBucket(file, 'media', path);
          urls.push(url);
          if (field === 'media_files') {
            setMediaPreviews(prev => [...prev, url]);
          } else {
            setCertificatePreviews(prev => [...prev, url]);
          }
        }
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field] as string[]), ...urls]
        }));
      } else {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
        const path = `vendor/logos/${Date.now()}-${file.name}`;
        const url = await uploadToBucket(file, 'media', path);
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 50MB.`);
      const path = `vendor/videos/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('media').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      const newVideo = { url: urlData.publicUrl, added_at: new Date().toISOString() };
      setVideoFilesList(prev => [...prev, newVideo]);
      setFormData(prev => ({ ...prev, video_files: [...prev.video_files, newVideo] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    const filtered = formData.media_files.filter((_, i) => i !== index);
    setMediaPreviews(filtered);
    setFormData({ ...formData, media_files: filtered });
  };

  const removeCertificate = (index: number) => {  // NEW: Remove certificate
    const filtered = formData.certificates.filter((_, i) => i !== index);
    setCertificatePreviews(filtered);
    setFormData({ ...formData, certificates: filtered });
  };

  const removeVideo = (index: number) => {
    const newList = videoFilesList.filter((_, i) => i !== index);
    setVideoFilesList(newList);
    setFormData(prev => ({ ...prev, video_files: newList }));
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) return "Valid email is required";
    if (!formData.first_name.trim()) return "First name is required";
    if (!formData.company_name.trim()) return "Company name is required";
    if (!formData.business_keywords.trim()) return "Business keywords are required";
    if (!formData.sector.trim()) return "Business sector is required";
    if (!formData.profile_info.trim()) return "Business description is required";
    if (!formData.building.trim()) return "Building/Project name is required";
    if (!formData.street.trim()) return "Street/Road is required";
    if (!formData.area.trim()) return "Area/Locality is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.pincode.trim()) return "Pincode is required";
    if (formData.media_files.length === 0) return "At least one image is required";
    if (formData.certificates.length === 0) return "At least one certificate is required";  // NEW: Optional, but added for consistency
    if (formData.gst_number && formData.gst_number.length !== 15) return "GST Number must be 15 characters if provided";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) { setError(errorMsg); return; }
    setLoading(true);
    try {
      // Check if email already exists (prevent duplicates)
      const { data: existingVendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", formData.email)
        .single();
      if (existingVendor) {
        setError("This email is already registered.");
        return;
      }

      // Get current user for user_id (if needed, but admin adds don't create auth users)
      const { data: { user } } = await supabase.auth.getUser();

      const now = new Date();
      const { categories, ...vendorData } = formData;

      // Calculate subscription_expiry if a plan is selected
      let subscriptionExpiry = null;
      if (selectedPlanId) {
        const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (selectedPlan) {
          const expiryDate = new Date(now);
          expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.duration_months);
          subscriptionExpiry = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }

      const submissionData = {
        ...vendorData,
        role: "vendor",
        status: "pending",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        subscription_plan_id: selectedPlanId,
        subscription_expiry: subscriptionExpiry,
        categories: JSON.stringify(formData.categories),  // Save as JSON string
        certificates: formData.certificates,  // Save as array (consistent with VendorRegister)
      };

      // Check if an existing vendor entry exists with the same email and status "pending" (admin-added)
      const { data: pendingVendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", formData.email)
        .eq("status", "pending")
        .maybeSingle();

      let vendor;
      if (pendingVendor) {
        // Update the existing entry with user_id and other data (though admin adds don't set user_id yet)
        const { data, error } = await supabase
          .from("vendor_register")
          .update({
            ...submissionData,
            user_id: user?.id || null,  // Admin adds don't create auth users, so this might be null
            status: "pending",  // Keep as pending until vendor registers
          })
          .eq("id", pendingVendor.id)
          .select("id")
          .single();
        vendor = data;
        if (error) throw error;
      } else {
        // Insert new entry if no existing pending entry
        const { data, error } = await supabase
          .from("vendor_register")
          .insert([{
            ...submissionData,
            user_id: user?.id || null,
          }])
          .select("id")
          .single();
        vendor = data;
        if (error) throw error;
      }

      // Notify admin that vendor needs to register
      toast.success("Vendor added successfully! They must register via the public form to activate their account and gain access.");

      onAdd();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 focus:bg-white outline-none transition-all text-slate-800 text-sm font-bold";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]";



  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col relative shadow-2xl">
        <button onClick={onClose} className="absolute right-8 top-8 z-20 p-3 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
          <X size={24} />
        </button>
        <div className="p-12 overflow-y-auto">
          <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">Add New Vendor</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Sector */}
            <div>
              <label className={labelClass}>Business Sector (Multiple allowed)</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Manufacturer", value: "manufacturer" },
                  { label: "Industrial", value: "industrial" },
                  { label: "Distributor", value: "distributor" },
                  { label: "Retailer", value: "retailer" },
                  { label: "Service Provider", value: "service" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.user_type.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subscription Plan Selection */}
            <div>
              <label className={labelClass}>Subscription Plan</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                {subscriptionPlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition
        ${selectedPlanId === plan.id
                        ? "border-yellow-500 bg-yellow-50 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="subscription_plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="mt-1 accent-yellow-500"
                    />

                    <div className="flex-1">
                      <h3 className="text-base font-extrabold text-slate-900 uppercase">
                        {plan.name}
                      </h3>

                      {plan.base_price > 0 && (
                        <p className="text-sm text-slate-600 mt-1">
                          ₹{plan.base_price} / month
                        </p>
                      )}

                    </div>
                  </label>
                ))}

                {/* No Plan Option */}
                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition
      ${selectedPlanId === null
                      ? "border-yellow-500 bg-yellow-50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="subscription_plan"
                    value=""
                    checked={selectedPlanId === null}
                    onChange={() => setSelectedPlanId(null)}
                    className="mt-1 accent-yellow-500"
                  />

                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-slate-900 uppercase">
                      No Plan
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Free tier or assign later
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Personal Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Legal Owner Name</label>
                <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Primary Mobile (WhatsApp Number)</label>
                <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} maxLength={15} />
              </div>
              <div>
                <label className={labelClass}>Backup Mobile</label>
                <input type="tel" name="alternate_number" value={formData.alternate_number} onChange={handleChange} className={inputClass} maxLength={15} />
              </div>
            </div>

            {/* Business Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Registered Company Name *</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>GSTIN Number</label>
                <input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className={inputClass} maxLength={15} />
              </div>
              <div>
                <label className={labelClass}>Business Keywords *</label>
                <input type="text" name="business_keywords" value={formData.business_keywords} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Legal Structure *</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className={inputClass} required>
                  <option value="" disabled>Select Structure</option>
                  <option value="proprietorship">Individual / Proprietorship</option>
                  <option value="partnership">Partnership Firm</option>
                  <option value="llp">LLP</option>
                  <option value="private_ltd">Private Limited</option>
                  <option value="public_ltd">Public Limited</option>
                  <option value="trust_society">Trust / Society</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Business Description *</label>
              <textarea name="profile_info" value={formData.profile_info} onChange={handleChange} className={inputClass} rows={3} required />
            </div>

            {/* Digital Assets */}
            <div>
              <label className={labelClass}>Digital Assets</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={inputClass}
                />
                <button type="button" onClick={addWebsite} className="bg-yellow-300 text-white px-4 py-3 rounded-2xl">
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.websites.map((url, i) => (
                  <div key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                    <Globe size={12} />
                    <span>{url}</span>
                    <button onClick={() => removeWebsite(i)} className="text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Office / Shop No.</label>
                <input type="text" name="flat_no" value={formData.flat_no} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Floor</label>
                <input type="text" name="floor" value={formData.floor} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Building / Business Park *</label>
                <input type="text" name="building" value={formData.building} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Street Address *</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Locality *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Landmark</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            {/* Vendor Categories */}
            <div>
              <div className="relative w-full">
                <label className={labelClass}>Business Categories (Select multiple)</label>

                {/* Dropdown Box */}
                <div
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer flex flex-wrap gap-2"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  {formData.categories.length === 0 ? (
                    <span className="text-slate-400 text-sm">Select categories...</span>
                  ) : (
                    formData.categories.map(cat => (
                      <span
                        key={cat.id}
                        className="bg-yellow-300 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      >
                        {cat.name}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c.id !== cat.id),
                            }));
                          }}
                        />
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Options */}
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-lg">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`p-3 cursor-pointer hover:bg-yellow-100 ${formData.categories.some(c => c.id === cat.id) ? "bg-yellow-50" : ""
                          }`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.some(c => c.id === cat.id)
                              ? prev.categories.filter(c => c.id !== cat.id)
                              : [...prev.categories, { id: cat.id, name: cat.name }],
                          }));
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Company Logo */}
            <div>
              <label className={labelClass}>Company Logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'company_logo')} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
                <Upload size={20} /> Upload Logo
              </label>
              {formData.company_logo && <img src={formData.company_logo} alt="Logo" className="mt-4 w-20 h-20 rounded-xl object-cover" />}
            </div>

            {/* Media Files */}
            <div>
              <label className={labelClass}>Photo Gallery *</label>
              <div className="grid grid-cols-4 gap-4">
                {mediaPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeMedia(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer rounded-xl">
                  <Plus size={24} />
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'media_files', true)} className="hidden" />
                </label>
              </div>
            </div>

            {/* Certificates */}
            <div>
              <label className={labelClass}>Certificates (Max 6, Optional)</label>
              <div className="grid grid-cols-4 gap-4">
                {certificatePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeCertificate(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {certificatePreviews.length < 6 && (
                  <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer rounded-xl">
                    <Plus size={24} />
                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'certificates', true)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Video Files */}
            <div>
              <label className={labelClass}>Video Experience</label>
              <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" id="video-upload" />
              <label htmlFor="video-upload" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
                <Upload size={20} /> Upload Video
              </label>
              <div className="space-y-2 mt-4">
                {videoFilesList.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                    <span className="text-sm font-medium">{v.url.split('/').pop()}</span>
                    <button onClick={() => removeVideo(i)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-bold uppercase">{error}</div>}
            <button type="submit" className="w-full py-5 bg-black text-[#facc15] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95" disabled={loading}>
              {loading ? "Adding..." : "Add Vendor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { vendors, loading, fetchVendors, updateStatus, deleteVendor } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = useMemo(() => {
    let filteredVendors = vendors.filter(v =>
      `${v.company_name} ${v.email} ${v.gst_number} ${v.city}`.toLowerCase().includes(query.toLowerCase())
    );
    if (roleFilter !== "all") {
      filteredVendors = filteredVendors.filter(v => v.role === roleFilter);
    }
    return filteredVendors;
  }, [vendors, query, roleFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">

      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Administrative Portal</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase  tracking-tighter leading-none">
                Vendor <span className="text-[#e11d48]">Database</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed ">
                Strategic partner oversight. Auditing business compliance and marketplace integration.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 min-w-[140px] text-center shadow-sm">
                <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Partners</p>
                <p className="text-3xl font-black text-[#e11d48]">{vendors.length}</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <Plus size={24} />
              </button>
              <button
                onClick={fetchVendors}
                className="bg-black hover:bg-red-600 text-white p-5 rounded-2xl transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">

        {/* SEARCH BAR AND FILTER */}
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="SEARCH BY COMPANY, GST, OR REGION..."
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-red-600 outline-none shadow-xl shadow-slate-200/50 font-black text-xs uppercase tracking-[0.2em] transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-red-600 outline-none shadow-xl shadow-slate-200/50 font-black text-xs uppercase tracking-[0.2em] transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Syncing database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-black rounded-2xl overflow-hidden relative border-4 border-slate-50 shadow-lg group-hover:scale-110 transition-transform">
                    <Image
                      src={vendor.company_logo || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBMb2dvPC90ZXh0Pgo8L3N2Zz4="}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${vendor.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {vendor.status}
                  </div>
                </div>

                <h3 className="font-black text-slate-900 uppercase  tracking-tighter text-xl mb-1 truncate">
                  {vendor.company_name || "Unidentified Corp"}
                </h3>

                <div className="flex items-center gap-2 mb-6">
                  <div className="h-1 w-1 rounded-full bg-red-600" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {vendor.sector || "General Sector"}
                  </p>
                </div>

                <div className="space-y-3 mb-8 text-slate-500 font-bold text-[11px] uppercase tracking-wide">
                  <div className="flex items-center gap-2 ">
                    <MapPin size={14} className="text-slate-300" /> {vendor.city || 'GLOBAL'}, {vendor.state || 'IN'}
                  </div>
                  <div className="flex items-center gap-2 ">
                    <Hash size={14} className="text-slate-300" /> {vendor.gst_number || 'GST NOT FILED'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVendor(vendor)}
                  className="mt-auto w-full py-4 bg-slate-900 text-[#facc15] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  View Full Dossier
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INSPECTION MODAL */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in duration-300">
              <button
                onClick={() => setSelectedVendor(null)}
                className="absolute right-8 top-8 z-20 p-3 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
              >
                <X size={24} />
              </button>

              {/* SIDE PANEL: IDENTITY */}
              <div className="md:w-1/3 bg-yellow-300 p-12 flex flex-col items-center border-r border-black/5 overflow-y-auto">
                <div className="w-40 h-40 bg-white rounded-[3rem] shadow-2xl overflow-hidden mb-8 border-[6px] border-white relative">
                  <Image
                    src={selectedVendor.company_logo || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBMb2dvPC90ZXh0Pgo8L3N2Zz4="}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />                </div>
                <h2 className="text-3xl font-black text-black uppercase  text-center leading-[0.9] mb-4 tracking-tighter">
                  {selectedVendor.company_name}
                </h2>
                <div className="px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-xl">
                  {selectedVendor.status}
                </div>

                <div className="w-full space-y-6 pt-10 border-t border-black/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Authorized Head</span>
                    <p className="text-sm font-black text-black uppercase  tracking-tight">
                      {selectedVendor.first_name} {selectedVendor.last_name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Secure Email</span>
                    <p className="text-sm font-black text-black flex items-center gap-2">
                      <Mail size={14} className="text-red-600" /> {selectedVendor.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">Verified Digital Presence</span>
                    <a href={selectedVendor.website || '#'} target="_blank" className="text-sm font-black text-red-600 flex items-center gap-2 hover:underline ">
                      <Globe size={14} /> {selectedVendor.website || "OFFLINE"}
                    </a>
                  </div>
                </div>
              </div>

              {/* MAIN PANEL: DETAILS */}
              <div className="md:w-2/3 p-12 overflow-y-auto bg-white flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-red-600" /> Compliance Registry
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Tax Identification (GST)</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter ">
                          {selectedVendor.gst_number || "PENDING"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Industry Vertical</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter ">
                          {selectedVendor.sector || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <MapPin size={16} className="text-red-600" /> Headquarters
                    </h4>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed mb-3 ">{selectedVendor.address}</p>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {selectedVendor.city}, {selectedVendor.state} <span className="text-red-600 ml-2"># {selectedVendor.pincode}</span>
                    </p>
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 ">Intellectual Tags</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedVendor.business_keywords?.split(',').map((kw, i) => (
                      <span key={i} className="px-5 py-2.5 bg-black text-[#facc15] text-[10px] font-black uppercase rounded-2xl border border-black ">
                        {kw.trim()}
                      </span>
                    )) || <span className="text-slate-300 text-xs font-bold">NO KEYWORDS FILED</span>}
                  </div>
                </div>

                {/* NEW: Business Categories Section */}
                <div className="mb-12">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 ">Business Categories</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedVendor.categories && selectedVendor.categories.length > 0 ? (
                      selectedVendor.categories.map((cat) => (
                        <span key={cat.id} className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-2xl border border-red-600">
                          {cat.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-300 text-xs font-bold">NO CATEGORIES ASSIGNED</span>
                    )}
                  </div>
                </div>

                <div className="mb-12 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 ">Asset Portfolio</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVendor.media_files?.map((img, i) => (
                      <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:scale-105 transition-transform duration-500 bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="Portfolio Asset" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* NEW: Certificates Section */}
                <div className="mb-12 flex-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-3 ">Certificates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedVendor.certificates && selectedVendor.certificates.length > 0 ? (
                      selectedVendor.certificates.map((img, i) => (
                        <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:scale-105 transition-transform duration-500 bg-slate-100">
                          <img src={img} className="w-full h-full object-cover" alt="Certificate" />
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-300 text-xs font-bold">NO CERTIFICATES UPLOADED</span>
                    )}
                  </div>
                </div>

                {/* STICKY ACTIONS */}
                <div className="flex gap-4 sticky bottom-0 bg-white/90 backdrop-blur-sm pt-8 border-t border-slate-100">
                  <button
                    onClick={() => { deleteVendor(selectedVendor.id); setSelectedVendor(null); }}
                    className="flex-1 py-5 bg-red-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 "
                  >
                    Delete Vendor
                  </button>

                  <button
                    onClick={() => { updateStatus(selectedVendor.id, 'rejected'); setSelectedVendor(null); }}
                    className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 "
                  >
                    Decline Partner
                  </button>
                  <button
                    onClick={() => { updateStatus(selectedVendor.id, 'approved'); setSelectedVendor(null); }}
                    className="flex-1 py-5 bg-black text-[#facc15] rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 "
                  >
                    <CheckCircle2 size={18} /> Authorize Partnership
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ADD VENDOR FORM MODAL */}
        {showAddForm && (
          <AddVendorForm onClose={() => setShowAddForm(false)} onAdd={fetchVendors} />
        )}
      </div>
    </div>
  );
}