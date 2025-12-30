"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"; // Combined imports
import { useEffect, useState, useRef } from "react";
import {
  LogOut, PlusCircle,
  UserCircle,
  ChevronDown,
  User as UserIcon,
  Briefcase
} from "lucide-react";
import VendorRegisterForm from "@/components/user/vendorreg";
import { createClient, type User } from "@supabase/supabase-js";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserFeed() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) =>
    pathname === route ? "text-yellow-600 font-bold" : "text-black";

  // UI states
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // Login / Register states
  const [loginData, setLoginData] = useState({ email: "", otp: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", otp: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null); // timestamp when OTP expires
  const [otpTimer, setOtpTimer] = useState<string | null>(null); // "mm:ss" display

  // Existing states...
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);
  const [openRegisterMenu, setOpenRegisterMenu] = useState(false);
  const [showVendorPopup, setShowVendorPopup] = useState(false);

  // NEW: State for dynamic profile icon color (default to yellow)
  const [profileColor, setProfileColor] = useState("#FFD700");

  // Ref for dropdown to handle outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current logged-in user on load
  useEffect(() => {
    const loadUserAndRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user?.id) {  // Use user.id instead of email for accuracy
        setUserRole(null);
        setProfileColor("#FFD700");  // Reset to default
        return;
      }

      // Check if logged-in user is a vendor
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("user_id", user.id)  // Use user_id FK for precision
        .single();

      if (vendor) {
        setUserRole("vendor");

        // NEW: Fetch subscription plan and color for vendors
        const { data: vendorData } = await supabase
          .from("vendor_register")
          .select("subscription_plan")
          .eq("user_id", user.id)
          .single();

        if (vendorData?.subscription_plan) {
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("color")
            .eq("name", vendorData.subscription_plan)
            .single();

          if (plan?.color) {
            setProfileColor(plan.color);
          } else {
            setProfileColor("#FFD700");  // Fallback if no color found
          }
        } else {
          setProfileColor("#FFD700");  // Fallback if no subscription
        }
      } else {
        setUserRole("user");
        setProfileColor("#FFD700");  // Default for non-vendors
      }
    };

    loadUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndRole();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on pathname change or outside click
  useEffect(() => {
    setOpenMenu(null); // Close on navigation
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Login handler
  const sendLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      if (!loginData.email) {
        setLoginError("Email is required");
        return;
      }

      // Optional: allow only registered vendors/users
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", loginData.email)
        .single();

      // If you want to restrict login ONLY to vendors + existing users
      // then keep this check. Otherwise REMOVE it.
      if (!vendor) {
        setLoginError("Email not registered.");
        return;
      }

      // ✅ Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email: loginData.email,
      });

      if (error) throw error;

      setLoginSuccess("OTP sent! It is valid for 5 minutes.");

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
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };



  const verifyLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      if (otpExpiry && Date.now() > otpExpiry) {
        setLoginError("OTP expired.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: loginData.email,
        token: loginData.otp,
        type: "email",
      });

      if (error) throw error;

      // 🔍 Determine role AFTER login
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", loginData.email)
        .single();

      setShowLoginPopup(false);

      if (vendor) {
        router.push("/user");
      } else {
        router.push("/user");
      }
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };




  // Register
  const handleRegisterChange = (e: any) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  const sendRegisterOtp = async () => {
    if (!registerData.name || !registerData.email) {
      setRegisterError("Fill all fields");
      return;
    }
    setRegisterLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: registerData.email,
      options: { data: { name: registerData.name } },
    });
    if (error) setRegisterError(error.message);
    else {
      setRegisterStep("otp");
      setRegisterSuccess("OTP sent!");
    }
    setRegisterLoading(false);
  };
  const verifyRegisterOtp = async () => {
    setRegisterLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: registerData.email,
      token: registerData.otp,
      type: "email",
    });
    if (error) setRegisterError(error.message);
    else {
      setRegisterSuccess("Registration successful!");
      setTimeout(() => setShowRegisterPopup(false), 1500);
    }
    setRegisterLoading(false);
  };

  return (
    <div className="pt-[60px]">
      {/* ---------------- HEADER ---------------- */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-100 border-b border-red-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 ">

          {/* 1. Logo Section: Optimized sizing */}
          <Link href="/user/feed" className="flex-shrink-0 transition-transform hover:scale-105">
            <Image
              src="/navbar_logo.png"
              alt="QickTick"
              width={150}
              height={90}
              className="object-contain"
              priority
            />
          </Link>

          {/* 2. Nav Section: Modern typography and tighter spacing */}
          {/* 2. Nav Section: Modern typography and interactive links */}
          <nav className="hidden lg:flex items-center space-x-2 font-semibold text-sm">
            {[
              { name: "Home", href: "/user" },
              { name: "Plans", href: "/user/subscription-plans" },
              { name: "Listing", href: "/user/listing" },
              { name: "Video", href: "/user/video" },
              { name: "Transport", href: "/user/transport" },
              { name: "Enquiry", href: "/user/enquiry" },
              { name: "Help & Earn", href: "/user/help" },
            ].map((link) => {
              const isLinkActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
          relative px-4 py-2 rounded-full transition-all duration-300 group
          ${isLinkActive
                      ? "text-black bg-yellow-400/10 shadow-[inset_0_0_0_1px_rgba(255,215,0,0.4)]"
                      : "text-gray-500 hover:text-black hover:bg-gray-50"}
        `}
                >
                  {link.name}

                  {/* Animated underline indicator for active link */}
                  {isLinkActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
                  )}

                  {/* Subtle hover line for non-active links */}
                  {!isLinkActive && (
                    <span className="absolute bottom-2 left-1/2 w-0 h-[1.5px] bg-gray-300 transition-all duration-300 group-hover:w-1/2 group-hover:-translate-x-1/2" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Actions Section */}
          <div className="flex items-center space-x-4">
            {/* Primary Action Button */}
            <Link
              href="/user/add-business"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              <PlusCircle size={16} /> Add Business
            </Link>

            <div className="h-6 w-[1px] bg-gray-200 hidden md:block" />

            {/* AUTH SECTION */}
            <div className="flex items-center space-x-3">
              {!user ? (
                <>
                  <button
                    onClick={() => setShowLoginPopup(true)}
                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-black transition"
                  >
                    Login
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenRegisterMenu((prev) => !prev)}
                      className="px-5 py-2.5 bg-[#FFD700] text-black text-sm rounded-full font-bold shadow-sm hover:bg-[#f2cc00] transition-all flex items-center"
                    >
                      Register
                      <ChevronDown size={14} className={`ml-1 transition-transform ${openRegisterMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {openRegisterMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <button
                          onClick={() => { setShowRegisterPopup(true); setOpenRegisterMenu(false); }}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 text-sm font-semibold flex items-center space-x-2"
                        >
                          <UserIcon size={16} /> <span>User Registration</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push("/vendorlogin");
                            setOpenRegisterMenu(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 text-sm font-semibold 
             border-t border-gray-50 flex items-center space-x-2"
                        >
                          <Briefcase size={16} />
                          <span>Vendor Registration</span>
                        </button>

                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
                    className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                  >
                    {/* Enhanced Profile Icon: Better design with gradient, ring, and shadow */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-white shadow-lg ring-2 ring-yellow-300"
                      style={{ backgroundColor: profileColor }}
                    >
                      <UserCircle size={24} className="text-white drop-shadow-md" />
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {openMenu === "profile" && (
                    <div className="absolute right-0 mt-3 bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200 shadow-2xl rounded-2xl py-2 w-56 text-sm z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 mb-1 border-b border-yellow-200">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Account</p>
                      </div>

                      <Link
                        href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                        className="flex items-center px-4 py-2.5 hover:bg-yellow-200 font-medium text-gray-800"
                      >
                        My Profile
                      </Link>

                      {userRole === "vendor" && (
                        <>
                          <Link href="/vendor/products" className="flex items-center px-4 py-2.5 hover:bg-yellow-200 font-medium text-gray-800">Products</Link>
                          <Link href="/vendor/enquiry" className="flex items-center px-4 py-2.5 hover:bg-yellow-200 font-medium text-gray-800">Enquiries</Link>
                          <Link href="/vendor/subscription" className="flex items-center px-4 py-2.5 hover:bg-yellow-200 font-medium text-gray-800 border-b border-yellow-200">Subscription</Link>
                        </>
                      )}

                      <button
                        onClick={logout}
                        className="flex w-full px-4 py-2.5 hover:bg-red-100 text-left text-red-600 font-bold mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* -------------------- LOGIN POPUP ------------------------ */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLoginPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

            <div className="p-10">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>

                        <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 font-medium">Enter your email to access your account</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {loginSuccess}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="name@company.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">One-Time Password</label>
                    {otpTimer && <span className="text-xs font-bold text-yellow-600 mb-1">{otpTimer} remaining</span>}
                  </div>
                  <input
                    name="otp"
                    value={loginData.otp}
                    onChange={handleLoginChange}
                    placeholder="8-digit code"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold tracking-[0.2em] text-center text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={sendLoginOtp}
                    disabled={loginLoading}
                    className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {loginLoading ? "Sending..." : "Send OTP"}
                  </button>
                  <button
                    onClick={verifyLoginOtp}
                    disabled={loginLoading}
                    className="py-4 bg-[#FFD700] hover:bg-yellow-400 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loginLoading ? "Verifying..." : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* -------------------- REGISTER POPUP ------------------------ */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowRegisterPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-[#FFD700] to-yellow-300" />

            <div className="p-10">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium">Join QickTick today and get started</p>
              </div>

              {registerError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {registerSuccess}
                </div>
              )}

              <div className="space-y-5">
                {registerStep === 'form' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="john@example.com"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-slate-900"
                      />
                    </div>

                    <button
                      onClick={sendRegisterOtp}
                      disabled={registerLoading}
                      className="w-full py-4 bg-slate-900 text-[#FFD700] rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-200 transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50"
                    >
                      {registerLoading ? "Sending OTP..." : "Get Verification Code"}
                    </button>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 mb-6">
                        <p className="text-xs text-yellow-800 font-bold text-center">
                          We've sent a code to <span className="underline">{registerData.email}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Code</label>
                        <input
                          name="otp"
                          value={registerData.otp}
                          onChange={handleRegisterChange}
                          placeholder="Enter Code"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 outline-none transition-all font-bold text-center text-2xl tracking-[0.5em]"
                        />
                      </div>

                      <button
                        onClick={verifyRegisterOtp}
                        disabled={registerLoading}
                        className="w-full py-4 bg-[#FFD700] text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50"
                      >
                        {registerLoading ? "Verifying..." : "Complete Registration"}
                      </button>

                      <button
                        onClick={() => setRegisterStep('form')}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter"
                      >
                        ← Back to details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      )}
      {showVendorPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">

          {/* Dark background */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVendorPopup(false)}
          />

          {/* Form only (no white box) */}
          <div className="relative z-10 w-full max-w-lg px-4">
            <VendorRegisterForm onSuccess={() => setShowVendorPopup(false)} />
          </div>

        </div>
      )}


    </div>
  );
}