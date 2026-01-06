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
  Briefcase,
  Menu,
  X
} from "lucide-react";
import VendorRegister from "@/components/user/vendorreg";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

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
  const [profileMedal, setProfileMedal] = useState(""); // Add this line
  // Existing states...
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);
  const [openRegisterMenu, setOpenRegisterMenu] = useState(false);
  const [openVendor, setOpenVendor] = useState(false);
  // NEW: State for dynamic profile icon color (default to yellow)
  const [profileColor, setProfileColor] = useState("#FFD700");

  // Ref for dropdown to handle outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);
  // New ref for mobile menu
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserAndRole = async () => {
      try {
        // 1️⃣ Get current logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (!user?.id) {
          setUserRole(null);
          setProfileColor("#FFD700"); // default color
          return;
        }

        // 2️⃣ Fetch vendor info along with subscription plan color
        // 2️⃣ Fetch vendor info along with subscription plan color AND medals
        const { data: vendor, error } = await supabase
          .from("vendor_register")
          .select(`
    id,
    subscription_plan_id,
    subscription_plans!left(color, medals)
  `)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching vendor:", error);
          setUserRole("user");
          setProfileColor("#FFD700");
          setProfileMedal(""); // Clear medal
          return;
        }

        // 3️⃣ Set role, profile color, and medal
        if (vendor) {
          setUserRole("vendor");

          const plan = vendor.subscription_plans?.[0];

          setProfileColor(plan?.color ?? "#FFD700");
          setProfileMedal(plan?.medals ?? "");
        } else {
          setUserRole("user");
          setProfileColor("#FFD700");
          setProfileMedal("");
        }



      } catch (err) {
        console.error("Error loading user and role:", err);
        setUserRole("user");
        setProfileColor("#FFD700");
      }
    };

    loadUserAndRole();

    // 4️⃣ Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        loadUserAndRole();
      } else {
        setUser(null);
        setUserRole(null);
        setProfileColor("#FFD700");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on pathname change or outside click
  useEffect(() => {
    setOpenMenu(null); // Close on navigation
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
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
    router.push("/user");
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

  const navLinks = [
    { name: "Home", href: "/user" },
    { name: "Plans", href: "/user/subscription-plans" },
    { name: "Listing", href: "/user/listing" },
    { name: "Video", href: "/user/video" },
    { name: "Transport", href: "/user/transport" },
    { name: "Enquiry", href: "/user/enquiry" },
    { name: "Help & Earn", href: "/user/help" },
  ];

  return (
    <div className="pt-[60px] bg-black">
      {/* ---------------- HEADER ---------------- */}
      <header className="fixed top-0 left-0 right-0 z-[9999] h-16 bg-black border-b border-red-50 shadow-sm">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">

          {/* 1. Logo Section: Optimized sizing */}
          <Link href="/user" className="flex-shrink-0 transition-transform hover:scale-105">
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
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-2 font-semibold text-sm">
            {navLinks.map((link) => {
              const isLinkActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
                    relative px-4 py-2 rounded-full transition-all duration-300 group
                    ${isLinkActive
                      ? "text-white bg-red-400/10 shadow-[inset_0_0_0_1px_rgba(255,215,0,0.4)]"
                      : "text-white hover:text-black hover:bg-yellow-50"}
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

          {/* Mobile Menu Button - Three Lines (Hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 3. Actions Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Primary Action Button */}
            <Link
              href="/user/add-business"
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all shadow-lg"
            >
              <PlusCircle size={16} /> Add Business
            </Link>

            <div className="h-6 w-[1px] bg-gray-200" />

            {/* AUTH SECTION */}
            <div className="flex items-center space-x-3">
              {!user ? (
                <>
                  <button
                    onClick={() => setShowLoginPopup(true)}
                    className="px-4 py-2 text-sm font-bold text-white hover:text-black transition"
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
                      <div className="absolute right-0 mt-3 w-56 bg-yellow-100 text-black border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <button
                          onClick={() => { setShowRegisterPopup(true); setOpenRegisterMenu(false); }}
                          className="w-full text-left px-5 py-3 hover:bg-yellow-100 text-sm font-semibold flex items-center space-x-2"
                        >
                          <UserIcon size={16} /> <span>User Registration</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenVendor(true); // Open the popup
                            setOpenRegisterMenu(false); // Close the dropdown menu
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-yellow-100 text-sm font-semibold border-t border-gray-50 flex items-center space-x-2"
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
                    className="flex items-center space-x-2 p-1.5 pr-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="relative group">
                      {/* Main Avatar Circle */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-2xl transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: profileColor,
                          borderColor: 'rgba(255,255,255,0.8)',
                          boxShadow: `0 0 15px ${profileColor}40`
                        }}
                      >
                        <UserCircle size={26} className="text-white drop-shadow-md" />
                      </div>

                      {/* DYNAMIC MEDAL BADGE FROM DATABASE */}
                      {userRole === "vendor" && profileMedal && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-gray-100 animate-in zoom-in duration-500">
                          <span className="text-[10px] leading-none">{profileMedal}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start ml-2">
                      <span className="text-xs font-black text-white uppercase tracking-tighter leading-none">
                        {userRole === "vendor" ? "Pro" : "User"}
                      </span>
                      <ChevronDown size={12} className={`text-gray-400 transition-transform ${openMenu === "profile" ? 'rotate-180' : ''}`} />
                    </div>
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

        {/* Mobile Menu Overlay - Full Screen */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div ref={mobileMenuRef} className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
              <div className="flex flex-col h-full">
                {/* Close Button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>



                {/* Auth Section */}
                <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                  {!user ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShowLoginPopup(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm font-bold text-gray-700 hover:text-black transition border border-gray-300 rounded-lg"
                      >
                        Login
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setOpenRegisterMenu((prev) => !prev)}
                          className="w-full px-4 py-3 bg-[#FFD700] text-black text-sm rounded-lg font-bold shadow-sm hover:bg-[#f2cc00] transition-all flex items-center justify-center"
                        >
                          Register
                          <ChevronDown size={14} className={`ml-1 transition-transform ${openRegisterMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {openRegisterMenu && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 bg-yellow-100 text-black border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                            <button
                              onClick={() => {
                                setShowRegisterPopup(true);
                                setOpenRegisterMenu(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-yellow-100 text-sm font-semibold flex items-center space-x-2"
                            >
                              <UserIcon size={16} /> <span>User Registration</span>
                            </button>

                            <button
                              onClick={() => {
                                setOpenVendor(true);
                                setOpenRegisterMenu(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-yellow-100 text-sm font-semibold border-t border-gray-50 flex items-center space-x-2"
                            >
                              <Briefcase size={16} />
                              <span>Vendor Registration</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-yellow-300"
                          style={{ backgroundColor: profileColor }}
                        >
                          <UserCircle size={24} className="text-white drop-shadow-md" />
                        </div>

                        {/* Mobile Medal */}
                        {userRole === "vendor" && profileMedal && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-gray-200 text-[10px]">
                            {profileMedal}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Profile</p>
                        <p className="text-xs text-gray-500">{userRole === "vendor" ? "Vendor" : "User"}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Add Business Button */}
                <div className="px-6 pb-4">
                  <Link
                    href="/user/add-business"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-lg w-full"
                  >
                    <PlusCircle size={16} /> Add Business
                  </Link>
                </div>
                {/* Navigation Links */}
                <nav className="flex-1 px-6 py-4">
                  <ul className="space-y-4">
                    {navLinks.map((link) => {
                      const isLinkActive = pathname === link.href;
                      return (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className={`block px-4 py-3 rounded-lg font-semibold text-sm transition ${isLinkActive
                              ? "text-red-400 bg-red-50"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            {link.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

              </div>
            </div>
          </div>
        )}
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
                    placeholder="Enter OTP"
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl
             text-slate-900 placeholder-slate-400
             focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500
             outline-none transition-all font-bold tracking-[0.2em]
             text-center text-lg"
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
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          className="
    w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl
    text-slate-900 placeholder-slate-400
    focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500
    outline-none transition-all font-bold text-center
    text-2xl tracking-[0.5em]
  "
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
      {openVendor && (
        <VendorRegister onClose={() => setOpenVendor(false)} />
      )}
    </div>
  );
}