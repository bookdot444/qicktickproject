"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import { supabase } from "@/lib/supabaseClient";
import { 
  CheckCircle, Video, Camera, Building2, X, Trash2, 
  Check, ArrowRight, ArrowLeft, UploadCloud, ShieldCheck, 
  Globe, MapPin, Briefcase, Star, ChevronRight, Info
} from "lucide-react";

// Razorpay global object
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  { name: "Bronze", price: "7080", duration: "3 MONTHS", calculation: "6000 + 18% GST", color: "bg-amber-50/50 border-amber-100", iconColor: "text-amber-600", benefits: ["Catalogue Website", "Photos and Videos", "Verified Badge", "Standard Visibility", "Unlimited Enquiries"] },
  { name: "Silver", price: "11800", duration: "8 MONTHS", calculation: "10000 + 18% GST", color: "bg-yellow-50 border-yellow-200", iconColor: "text-yellow-500", benefits: ["Catalogue Website", "Photos and Videos", "Verified Badge", "Silver Star (✫)", "Digital Banner", "Unlimited Leads"] },
  { name: "Gold", price: "21240", duration: "1 YEAR", popular: true, calculation: "18000 + 18% GST", color: "bg-yellow-100 border-yellow-300", iconColor: "text-amber-600", benefits: ["Everything in Silver", "Gold Stars (✫✫✫)", "ROI Analytics", "References", "SMPL (12 Videos)", "Dedicated Manager"] },
  { name: "Platinum", price: "30680", duration: "2 YEAR", calculation: "26000 + 18% GST", color: "bg-amber-50 border-amber-200", iconColor: "text-amber-600", benefits: ["Everything in Gold", "Priority Medal", "SMPL (36 Videos)", "Direct Account Manager", "Premium Placement"] },
  { name: "Diamond", price: "165200", duration: "Lifetime", calculation: "1.4L + 18% GST", color: "bg-yellow-50 border-yellow-200", iconColor: "text-yellow-600", benefits: ["Infinite Membership", "52 Brand Videos", "Global Expo Access", "Strategic Partnership", "Full SEO Support"] }
];

export default function VendorRegister() {
  const router = useRouter(); // Initialize router
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // --- REGISTRATION LOGIC ---
  const finalizeRegistration = async (paymentId: string) => {
    setLoading(true);
    try {
      // (Your existing file-to-base64 conversion would go here)
      const { error } = await supabase.from("vendor_register").insert([{
        email, 
        password, 
        owner_name: ownerName, 
        mobile_number: mobileNumber,
        company_name: companyName,
        subscription_plan: subscriptionPlan,
        payment_id: paymentId,
      }]);

      if (error) throw error;
      
      // SUCCESS: Navigate to feed
      alert("Registration Successful!");
      router.push("/user/feed"); 
      
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Logic for Razorpay (from your original code)
    // On Success: finalizeRegistration(res.razorpay_payment_id)
    // Mocking for demo:
    await finalizeRegistration("test_payment_id");
  };

  // Styles (Yellow Themed)
  const inputClass = "w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 focus:bg-white outline-none transition-all text-gray-800 text-sm placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#FBFAF4] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-[320px_1fr] bg-white rounded-[2.5rem] shadow-2xl shadow-yellow-900/5 overflow-hidden min-h-[800px] border border-yellow-100">

        {/* Content Area */}
        <div className="p-8 md:p-16 flex flex-col">
          <div className="flex-1 max-w-2xl mx-auto w-full">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Setup <span className="text-yellow-500">Access</span></h2>
                  <p className="text-slate-500 mt-2 text-lg">Create your corporate security credentials.</p>
                </header>
                <div className="grid gap-6">
                  <div className="space-y-1">
                    <label className={labelClass}>Work Email</label>
                    <input type="email" placeholder="ceo@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className={labelClass}>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Repeat</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 Section with Yellow Buttons */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Launch <span className="text-yellow-500">Plan</span></h2>
                  <p className="text-slate-500 mt-2">Choose how you want to reach your customers.</p>
                </header>

                <button 
                  onClick={() => setShowPlans(true)}
                  className={`w-full py-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center gap-3 ${subscriptionPlan ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 hover:border-yellow-400'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${subscriptionPlan ? 'bg-yellow-500 text-black' : 'bg-slate-100 text-slate-400'}`}>
                    {subscriptionPlan ? <CheckCircle size={24} /> : <Star size={24} />}
                  </div>
                  <span className="font-bold uppercase tracking-widest text-sm">
                    {subscriptionPlan ? `Plan Selected: ${subscriptionPlan}` : "Select Membership Tier"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-12 pt-8 flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <button onClick={handleBack} className="px-6 py-3 font-bold text-slate-400 hover:text-black transition-all">Back</button>
            ) : <div />}

            {step < 5 ? (
              <button onClick={handleNext} className="group flex items-center gap-3 bg-black hover:bg-yellow-500 hover:text-black text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95">
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="group flex items-center gap-3 bg-yellow-500 text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Finalize & Launch"} <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Modal (Yellow Theme) */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-7xl max-h-[90vh] overflow-y-auto p-12 relative shadow-2xl border border-yellow-100">
             <button onClick={() => setShowPlans(false)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-yellow-500 transition-all"><X size={20}/></button>
             
             <div className="text-center mb-12">
                <h3 className="text-4xl font-black mb-2">Membership <span className="text-yellow-500">Tiers</span></h3>
                <p className="text-slate-500">Select the fuel for your business growth.</p>
             </div>

             <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {PLANS.map((plan) => (
                  <div key={plan.name} className={`p-8 rounded-[2.5rem] border-2 flex flex-col transition-all hover:border-yellow-500 ${subscriptionPlan === plan.name ? 'border-yellow-500 bg-yellow-50/50' : 'border-slate-50 bg-white'}`}>
                    <div className="mb-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${plan.iconColor}`}>{plan.name}</span>
                      <h4 className="text-2xl font-black mt-1">₹{plan.price}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{plan.duration}</p>
                    </div>
                    <div className="flex-1 space-y-3 mb-8">
                      {plan.benefits.map((b, i) => (
                        <div key={i} className="flex gap-2 items-start text-[11px] font-bold text-slate-600">
                          <Check size={12} className="text-yellow-500 shrink-0 mt-0.5" strokeWidth={4} /> {b}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {setSubscriptionPlan(plan.name); setShowPlans(false);}}
                      className="w-full py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:bg-yellow-500 hover:text-black transition-all"
                    >Select Plan</button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}