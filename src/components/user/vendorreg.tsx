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

export default function VendorRegister({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState(""); // For the input field

  // ADDED: Track if the user has tried to move forward or touched the form
  const [isDirty, setIsDirty] = useState(false);

  const [videoFilesList, setVideoFilesList] = useState<{ url: string, added_at: string }[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]); // NEW: For certificates
  const [showPlans, setShowPlans] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // OTP related states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [otpTimer, setOtpTimer] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
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
    subscription_plan_id: "",
    profile_image: "",
    company_logo: "",
    media_files: [] as string[],
    video_files: [] as any,
    categories: [] as string[], // Added for categories
    certificates: [] as string[], // NEW: For certificate images
  });

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("base_price", { ascending: true });
      if (!error && data) setPlans(data);
    }

    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      setCategories(data || []);
    }

    fetchPlans();
    fetchCategories();
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

  // Upload to Supabase Storage - Improved error handling
  const uploadToBucket = async (file: File, bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('uploadToBucket error:', err);
      throw err;
    }
  };

  type UploadField = "media_files" | "certificates" | "company_logo";

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: UploadField,
    isMultiple = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      if (isMultiple) {
        const urls: string[] = [];
        // Removed maxFiles limit for unlimited uploads
        for (const file of Array.from(files)) {
          // Validate file size (e.g., max 5MB per file)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
          }
          const subPath = field === 'media_files' ? 'media' : 'certificates';
          const path = `vendor/${subPath}/${Date.now()}-${file.name}`;
          const url = await uploadToBucket(file, 'media', path); // Use 'media' bucket
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
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
        }
        const path = `vendor/logos/${Date.now()}-${file.name}`;
        const url = await uploadToBucket(file, 'media', path); // Use 'media' bucket
        setFormData(prev => ({
          ...prev,
          [field]: url
        }));
      }
      toast.success('File uploaded successfully!');
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || "File upload failed. Please try again.");
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Video File Uploads (upload to bucket)
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) { // Max 50MB for videos
          throw new Error(`File ${file.name} is too large. Max size is 50MB.`);
        }
        const path = `vendor/videos/${Date.now()}-${file.name}`;
        const url = await uploadToBucket(file, 'media', path);
        const newVideo = {
          url: url,
          added_at: new Date().toISOString()
        };
        const newList = [...videoFilesList, newVideo];
        setVideoFilesList(newList);
        setFormData(prev => ({ ...prev, video_files: newList }));
      }
      toast.success('Videos uploaded successfully!');
    } catch (err: any) {
      console.error('Video upload error:', err);
      setError(err.message || "Video upload failed. Please try again.");
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
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

  const removeCertificate = (index: number) => { // NEW: Remove certificate
    const filtered = formData.certificates.filter((_, i) => i !== index);
    setCertificatePreviews(filtered);
    setFormData({ ...formData, certificates: filtered });
  };

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept": "application/json",
                "User-Agent": "VendorPro/1.0 (contact@vendorpro.com)"
              }
            }
          );

          const data = await res.json();

          const address = data.address || {};

          setFormData((prev) => ({
            ...prev,
            area:
              address.suburb ||
              address.neighbourhood ||
              address.village ||
              "",
            city:
              address.city ||
              address.town ||
              address.village ||
              "",
            state: address.state || "",
            pincode: address.postcode || "",
            landmark: address.road || "",
            address: data.display_name || "",
          }));

          toast.success("Location detected successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch location details");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Permission denied or location unavailable");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const validateStep = (currentStep: number) => {
    const mobileRegex = /^[0-9]{10}$/;

    switch (currentStep) {
      case 1:
        if (!formData.email.includes("@")) return "A valid Email is required";
        if (!otpSent) return "Please send OTP first";
        if (!otp) return "OTP is required";
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
        // Make GST optional:
        if (formData.gst_number && formData.gst_number.length !== 15) return "GST Number must be exactly 15 characters if provided";
        if (!formData.sector.trim()) return "Business sector is required";
        if (!formData.profile_info.trim()) return "Business description is required";
        return null;
      case 4:
        // Categories step - no validation required, but can add if needed
        return null;
      case 5:
        if (!formData.building.trim()) return "Building/Project name is required";
        if (!formData.street.trim()) return "Street/Road is required";
        if (!formData.area.trim()) return "Area/Locality is required";
        if (!formData.city.trim()) return "City is required";
        if (!formData.state.trim()) return "State is required";
        if (!formData.pincode.trim()) return "Pincode is required";
        return null;
      case 6:
        if (formData.media_files.length === 0) return "At least one image is required in Media Assets";
        return null;
      default:
        return null;
    }
  };

  const sendOtp = async () => {
    if (!formData.email.includes("@")) {
      setError("Valid email required");
      setIsDirty(true);
      return;
    }

    // Check if email already exists before sending OTP
    try {
      const { data: existingUser } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        setError("This email is already registered. Please login instead.");
        setIsDirty(true);
        return;
      }
    } catch (err) {
      // If error (e.g., no row found), proceed
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
      });
      if (error) throw error;
      setOtpSent(true);
      setError("OTP sent! Check your email.");
      const expiryTime = Date.now() + 5 * 60 * 1000;
      setOtpExpiry(expiryTime);
      const timer = setInterval(() => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
          setOtpTimer("00:00");
          clearInterval(timer);
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setOtpTimer(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      setIsDirty(true);
      return;
    }
    if (otpExpiry && Date.now() > otpExpiry) {
      setError("OTP expired");
      setIsDirty(true);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // ✅ FORCE SESSION REFRESH
      await supabase.auth.refreshSession();

      // ✅ OPTIONAL: store user id immediately
      if (!data.session?.user) {
        throw new Error("Authentication failed");
      }

      setStep(2);

      if (error) throw error;
      setStep(2);
      setError(null);
      setIsDirty(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      setError(errorMsg);
      setIsDirty(true);
      return;
    }
    setError(null);
    setIsDirty(false);
    setStep((s) => Math.min(s + 1, 7));
  };

  const handleBack = () => {
    setError(null);
    setIsDirty(false);
    setStep((s) => Math.max(s - 1, 1));
  };

  const saveVendorData = async (paymentId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    const submissionData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      owner_name: formData.owner_name,
      mobile_number: formData.mobile_number,
      alternate_number: formData.alternate_number,
      profile_info: formData.profile_info,
      company_name: formData.company_name,
      user_type: formData.user_type,
      gst_number: formData.gst_number,
      websites: formData.websites,
      flat_no: formData.flat_no,
      floor: formData.floor,
      building: formData.building,
      street: formData.street,
      area: formData.area,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      business_keywords: formData.business_keywords,
      sector: formData.sector,
      address: formData.address,
      subscription_plan_id: formData.subscription_plan_id ? parseInt(formData.subscription_plan_id) : null,
      company_logo: formData.company_logo,
      media_files: formData.media_files,
      video_files: videoFilesList,
      certificates: formData.certificates, // NEW: Include certificates
      payment_id: paymentId,
      status: formData.subscription_plan_id ? 'active' : 'pending',
      subscription_expiry: expiry.toISOString().split('T')[0],
      user_id: user.id,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // Check if vendor already exists
    const { data: existingVendor } = await supabase
      .from("vendor_register")
      .select("id")
      .eq("email", formData.email)
      .single();

    let vendorId;
    if (existingVendor) {
      // Update existing
      const { error: updateError } = await supabase
        .from("vendor_register")
        .update(submissionData)
        .eq("id", existingVendor.id);
      if (updateError) throw updateError;
      vendorId = existingVendor.id;

      // Delete old categories
      await supabase
        .from("vendor_categories")
        .delete()
        .eq("vendor_id", vendorId);
    } else {
      // Insert new
      const { data: vendor, error: insertError } = await supabase
        .from("vendor_register")
        .insert([submissionData])
        .select("id")
        .single();
      if (insertError) throw insertError;
      vendorId = vendor.id;
    }

    // Insert new categories
    if (formData.categories.length > 0) {
      const categoryRows = formData.categories.map((catId) => ({
        vendor_id: vendorId,
        category_id: catId,
      }));
      const { error: catError } = await supabase
        .from("vendor_categories")
        .insert(categoryRows);
      if (catError) throw catError;
    }

    return vendorId;
  };

  const finalizeRegistration = async (paymentId: string | null = null) => {
    setLoading(true);
    try {
      await saveVendorData(paymentId);

      toast.success("Registration successful! Welcome onboard.");
      await supabase.auth.refreshSession();

      // 🔥 IMPORTANT
      onSuccess();   // refresh header, user role, profile
      onClose();     // close modal

      router.refresh(); // re-render header server components

    } catch (err: any) {
      setError("Error: " + err.message);
      setIsDirty(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!(window as any).Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh.");
      return;
    }

    // FIND THE PLAN
    const selectedPlan = plans.find(p => p.id.toString() === formData.subscription_plan_id.toString());

    // BUG FIX: Check if plan exists before accessing properties
    if (!selectedPlan) {
      toast.error("Please select a subscription plan first.");
      setStep(7); // Redirect user to the plan selection step
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const basePrice = Number(selectedPlan.base_price) || 0;
      const taxPercent = Number(selectedPlan.tax_percent) || 0;

      // Calculate total: (Base + Tax) * 100 (for paise)
      const amount = (basePrice + (basePrice * (taxPercent / 100))) * 100;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_S4UlMPLi86BSmc", // Use env var, fallback to your live key
        amount: Math.round(amount),
        currency: "INR",
        name: "VendorPro",
        description: `Subscription for ${selectedPlan.name}`,
        handler: async function (response: any) {
          const paymentId = response.razorpay_payment_id;
          // Save vendor data first, then update with payment
          await saveVendorData(paymentId);

          toast.success("Payment successful! Subscription activated.");
          onSuccess();
          onClose();
          router.refresh();
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
    } catch (err) {
      console.error("Payment calculation error:", err);
      toast.error("There was an error processing the plan details.");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800 text-sm font-medium";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide";
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300 p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-300 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg">VendorPro</h1>
                <p className="text-xs text-gray-500 font-medium">Official Partner</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Setup Progress</span>
              <span className="text-xs font-semibold text-yellow-300 bg-blue-50 px-2 py-1 rounded-md">
                Step {step} of 7
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">

              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Control</h2>
                    <p className="text-sm text-gray-600">Enter your email to get started</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>
                    {!otpSent ? (
                      <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass}>One-Time Password</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className={`${inputClass} text-center text-lg tracking-widest`}
                          />
                          {otpTimer && (
                            <p className="text-xs text-gray-500 mt-1 text-center">{otpTimer} remaining</p>
                          )}
                        </div>
                        <button
                          onClick={verifyOtp}
                          disabled={loading}
                          className="w-full py-3 bg-yellow-300 hover:bg-yellow-300 text-white rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg transition-all disabled:opacity-50"
                        >
                          {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </>
                    )}
                    <div>
                      <label className={labelClass}>Business Sector (Multiple allowed)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Manufacturer", value: "manufacturer" },
                          { label: "Industrial", value: "industrial" },
                          { label: "Distributor", value: "distributor" },
                          { label: "Retailer", value: "retailer" },
                          { label: "Service Provider", value: "service" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.user_type.includes(option.value)
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
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
                              className="accent-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Identity</h2>
                    <p className="text-sm text-gray-600">Tell us about yourself</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Legal Owner Name</label>
                    <input
                      type="text"
                      name="owner_name"
                      placeholder="Full Legal Name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Primary Mobile (WhatsApp Number)</label>
                      <input
                        type="tel"
                        name="mobile_number"
                        placeholder="10-digit number"
                        value={formData.mobile_number}
                        onChange={handleChange}
                        className={inputClass}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Backup Mobile (Optional)</label>
                      <input
                        type="tel"
                        name="alternate_number"
                        placeholder="Alternate number"
                        value={formData.alternate_number}
                        onChange={handleChange}
                        className={inputClass} maxLength={15}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Profile</h2>
                    <p className="text-sm text-gray-600">Details about your company</p>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="relative w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-200 transition-all hover:scale-105">
                      {formData.company_logo ? (
                        <>
                          <img src={formData.company_logo} className="w-full h-full object-contain p-2" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, company_logo: "" });
                            }}
                            className="absolute inset-0 bg-red-500/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="text-yellow-300" />
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
                      <label className="text-sm font-semibold text-gray-900">Company Logo</label>
                      <p className="text-xs text-gray-500">SVG, PNG or JPG preferred.</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Registered Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      placeholder="Company Name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Business Keywords</label>
                    <input
                      type="text"
                      name="business_keywords"
                      placeholder="e.g. Chemicals, Steel, Logistics"
                      value={formData.business_keywords}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>GSTIN Number</label>
                      <input
                        type="text"
                        name="gst_number"
                        placeholder="15-character GSTIN"
                        value={formData.gst_number}
                        onChange={handleChange}
                        className={inputClass}
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Legal Structure</label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className={inputClass}
                      >
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
                    <label className={labelClass}>Business Description</label>
                    <textarea
                      name="profile_info"
                      placeholder="Detailed description..."
                      rows={4}
                      value={formData.profile_info}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Business Categories
                    </h2>
                    <p className="text-sm text-gray-600">
                      Select all that apply
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Business Categories (Alphabetical)
                    </label>

                    <div className="mt-3 border border-gray-300 rounded-xl bg-white max-h-72 overflow-y-auto">
                      {sortedCategories.map(cat => {
                        const selected = formData.categories.includes(cat.id);

                        return (
                          <label
                            key={cat.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b last:border-b-0
                ${selected ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: selected
                                    ? prev.categories.filter(c => c !== cat.id)
                                    : [...prev.categories, cat.id],
                                }));
                              }}
                              className="h-4 w-4 accent-yellow-500"
                            />

                            <span className="text-sm text-gray-800">
                              {cat.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Presence</h2>
                    <p className="text-sm text-gray-600">Your business location and online presence</p>
                  </div>
                  <div>
                    <label className={labelClass}>Digital Assets</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={websiteInput}
                        onChange={(e) => setWebsiteInput(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        onClick={addWebsite}
                        type="button"
                        className="bg-yellow-300 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.websites.map((url, i) => (
                        <div key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2 border border-blue-200">
                          <Globe size={12} />
                          <span className="truncate max-w-32">{url}</span>
                          <button onClick={() => removeWebsite(i)} className="text-red-500 hover:scale-110 transition-transform">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={loading}
                    className="flex items-center gap-2 mb-4 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-yellow-300 transition-all disabled:opacity-50"
                  >
                    <Globe size={16} />
                    {loading ? "Detecting Location..." : "Use My Location"}
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Office / Shop No.</label>
                      <input
                        type="text"
                        name="flat_no"
                        placeholder="Office No."
                        value={formData.flat_no}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Floor</label>
                      <input
                        type="text"
                        name="floor"
                        placeholder="Floor"
                        value={formData.floor}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Building / Business Park</label>
                    <input
                      type="text"
                      name="building"
                      placeholder="Building Name"
                      value={formData.building}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      type="text"
                      name="street"
                      placeholder="Street / Road"
                      value={formData.street}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Locality</label>
                      <input
                        type="text"
                        name="area"
                        placeholder="Area"
                        value={formData.area}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Landmark</label>
                      <input
                        type="text"
                        name="landmark"
                        placeholder="Nearby Landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Showcase</h2>
                    <p className="text-sm text-gray-600">Upload images and videos to showcase your business</p>
                  </div>
                  <div>
                    <label className={labelClass}>Photo Gallery (Max 6)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {mediaPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-gray-200">
                          <img src={src} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      {mediaPreviews.length < 6 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-yellow-300 group-hover:text-white transition-colors">
                            <Plus size={20} strokeWidth={2} />
                          </div>
                          <span className="text-xs font-medium mt-2 uppercase tracking-wide">Add Photo</span>
                          <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'media_files', true)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Video Experience (Optional)</label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all group">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-yellow-300 group-hover:text-white transition-colors">
                        <Upload size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Drop video files here</span>
                      <input type="file" multiple accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                    </label>
                    <div className="space-y-2 mt-4">
                      {videoFilesList.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl text-white group animate-fade-in">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Film size={16} className="text-blue-400" />
                          </div>
                          <div className="flex-1 ml-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Video File</p>
                            <p className="text-sm font-medium truncate max-w-48">{v.url.split('/').pop()}</p>
                          </div>
                          <button
                            onClick={() => removeVideo(i)}
                            className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Certificates (Optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {certificatePreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-gray-200">
                          <img src={src} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <button
                            onClick={() => removeCertificate(i)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-yellow-300 group-hover:text-white transition-colors">
                          <Plus size={20} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-medium mt-2 uppercase tracking-wide">Add Certificate</span>
                        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'certificates', true)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6 animate-fade-in">
                  {!showPlans && !formData.subscription_plan_id ? (
                    <div className="text-center py-12">
                      <button
                        onClick={() => setShowPlans(true)}
                        className="group relative inline-flex items-center justify-center px-12 py-6 font-bold uppercase tracking-wide text-white bg-gray-900 rounded-2xl shadow-xl hover:bg-yellow-300 transition-all duration-300 active:scale-95"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-lg tracking-tight">VIP Membership <span className="text-blue-400 group-hover:text-white">Access</span></span>
                          <span className="text-xs tracking-widest opacity-70">Scale your business today</span>
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                          <ChevronRight size={20} strokeWidth={3} />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">Growth Plans</h2>
                          <p className="text-sm text-gray-600">Select your professional tier</p>
                        </div>
                        <button
                          onClick={() => { setShowPlans(false); setFormData({ ...formData, subscription_plan_id: "" }) }}
                          className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold uppercase text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          Clear Choice
                        </button>
                      </div>
                      <div className="grid gap-4">
                        {plans.map((p) => {
                          const isSelected = formData.subscription_plan_id === p.id.toString();
                          const totalPrice = Number(p.base_price) + (Number(p.base_price) * (Number(p.tax_percent) / 100));
                          return (
                            <div
                              key={p.id}
                              onClick={() => setFormData({ ...formData, subscription_plan_id: p.id.toString() })}
                              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer border-2 ${isSelected ? "bg-blue-50 border-blue-600 shadow-lg -translate-y-1" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                                }`}
                            >
                              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected ? "bg-gray-900 text-yellow-300 rotate-6" : "bg-gray-200 text-gray-500"
                                    }`}>
                                    <Check size={24} strokeWidth={isSelected ? 3 : 2} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{p.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-xs font-semibold px-2 py-1 bg-yellow-300 text-white rounded-md uppercase tracking-wide">{p.duration_months} Months</span>
                                      {isSelected && <span className="text-xs font-semibold px-2 py-1 bg-gray-900 text-white rounded-md uppercase tracking-wide animate-pulse">Selected</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-2xl font-bold tracking-tight ${isSelected ? "text-yellow-300" : "text-gray-900"}`}>₹{totalPrice.toLocaleString()}</p>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Inclusive of GST</p>
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
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {error && isDirty && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 animate-fade-in">
                <AlertCircle className="text-red-500" size={16} />
                <span className="text-sm font-medium text-red-700 uppercase tracking-wide">{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 font-semibold text-sm uppercase text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : <div />}
              {step < 7 ? (
                <button
                  onClick={handleNext}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                >
                  Continue
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
                  className="bg-yellow-300 text-white px-8 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg disabled:opacity-50 active:scale-95 transition-all"
                >
                  {loading ? "Processing..." : formData.subscription_plan_id ? "Pay & Register" : "Free Registration"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}