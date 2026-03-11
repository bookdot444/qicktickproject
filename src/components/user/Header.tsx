"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import {
  LogOut, PlusCircle, UserPlus,
  UserCircle,
  ChevronDown,
  User as UserIcon,
  Briefcase,
  Menu,
  X,
  Home,
  PlayCircle,
  MessageSquare,
  Package,
  MoreHorizontal,
  X as CloseIcon,
} from "lucide-react";
import VendorRegister from "@/components/user/vendorreg";
import { supabase } from "@/lib/supabaseClient";

export default function UserFeed() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) =>
    pathname === route ? "text-yellow-600 font-bold" : "text-black";

  // UI states
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false); // New state for "More" menu

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
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [otpTimer, setOtpTimer] = useState<string | null>(null);
  const [profileMedal, setProfileMedal] = useState("");
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);
  const [openRegisterMenu, setOpenRegisterMenu] = useState(false);
  const [openVendor, setOpenVendor] = useState(false);
  const [profileColor, setProfileColor] = useState("#FFD700");

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to check if email exists in users or vendor_register
  const checkEmailExists = async (email: string) => {
    // Check users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;
    if (userData) return true; // Exists in users

    // Check vendor_register table
    const { data: vendorData, error: vendorError } = await supabase
      .from("vendor_register")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (vendorError) throw vendorError;
    return !!vendorData; // Return true if exists in vendor_register
  };

  // ✅ MOVED HERE: Define loadUserAndRole before useEffect
  const loadUserAndRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setUserRole(null);
        setProfileColor("#FFD700");
        setProfileMedal("");
        return;
      }

      // ✅ IMPROVED: Determine role from database tables first, then fallback to metadata
      let role = user.user_metadata?.role || "user";

      // Check tables to override if needed
      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: vendorProfile } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (vendorProfile) {
        role = "vendor";
        // Update metadata if it doesn't match
        if (user.user_metadata?.role !== "vendor") {
          await supabase.auth.updateUser({ data: { role: "vendor" } });
        }
      } else if (userProfile) {
        role = "user";
        if (user.user_metadata?.role !== "user") {
          await supabase.auth.updateUser({ data: { role: "user" } });
        }
      }

      setUserRole(role);

      // ✅ 2. ONLY IF VENDOR → LOAD EXTRA DETAILS
      if (role === "vendor") {
        const { data: vendor } = await supabase
          .from("vendor_register")
          .select("subscription_plan_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (vendor?.subscription_plan_id) {
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("color, medals")
            .eq("id", vendor.subscription_plan_id)
            .maybeSingle();

          setProfileColor(plan?.color || "#FFD700");
          setProfileMedal(plan?.medals || "");
        }
      } else {
        setProfileColor("#FFD700");
        setProfileMedal("");
      }
    } catch (err) {
      console.error("loadUserAndRole error:", err);
    }
  };

  useEffect(() => {
    loadUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndRole();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  // Close dropdown on pathname change or outside click
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setMobileProfileOpen(false);
    }
  }, [isMobileMenuOpen]);

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
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const sendLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      if (!loginData.email) {
        setLoginError("Email is required");
        return;
      }

      // ✅ CHECK IF EMAIL EXISTS
      const exists = await checkEmailExists(loginData.email);
      if (!exists) {
        setLoginError("Email not registered. Please sign up first.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: loginData.email,
      });

      if (error) throw error;

      setLoginSuccess("OTP sent! It is valid for 5 minutes.");
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
      const { error } = await supabase.auth.verifyOtp({
        email: loginData.email,
        token: loginData.otp,
        type: "email",
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth failed");

      // ✅ CHECK PROFILE TABLES
      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: vendorProfile } = await supabase
        .from("vendor_register")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Debug: userProfile", userProfile, "vendorProfile", vendorProfile); // DEBUG: Remove in production

      if (!userProfile && !vendorProfile) {
        // ✅ IMPROVED: Check for ANY vendor entry with matching email
        const { data: anyVendor } = await supabase
          .from("vendor_register")
          .select("id, status")
          .eq("email", loginData.email)
          .maybeSingle();

        if (anyVendor) {
          if (anyVendor.status === "approved") {
            // ✅ LINK AND PROCEED FOR APPROVED ONLY
            const { error: updateError } = await supabase
              .from("vendor_register")
              .update({ user_id: user.id })
              .eq("email", loginData.email);

            if (updateError) {
              console.error("Error linking vendor entry:", updateError);
              setLoginError("Failed to link vendor account. Please try again.");
              return;
            }

            await supabase.auth.updateUser({ data: { role: "vendor" } });
            setShowLoginPopup(false);
            router.push("/user");
            loadUserAndRole();
            return;
          } else {
            // ✅ BLOCK PENDING, REJECTED, OR OTHER STATUSES
            await supabase.auth.signOut();
            setLoginError("Your account is not approved yet. Please wait for 24hrs or contact support.");
            return;
          }
        }

        // No entry found
        await supabase.auth.signOut();
        setLoginError("Account not registered. Please sign up.");
        return;
      }

      // ✅ If vendorProfile exists, CHECK STATUS BEFORE PROCEEDING
      if (vendorProfile) {
        if (vendorProfile.status !== "approved") {
          // ✅ BLOCK IF NOT APPROVED (e.g., pending, rejected)
          await supabase.auth.signOut();
          setLoginError("Your vendor account is not approved yet. Please contact support.");
          return;
        }
        // If approved, proceed
        await supabase.auth.updateUser({ data: { role: "vendor" } });
      } else if (userProfile) {
        // Ensure role is "user" for regular users
        await supabase.auth.updateUser({ data: { role: "user" } });
      }

      setShowLoginPopup(false);
      router.push("/user");

      // ✅ CLEAR INPUTS AND STATES AFTER SUCCESS
      setLoginData({ email: "", otp: "" });
      setLoginError(null);
      setLoginSuccess(null);
      setOtpTimer(null);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };



  const handleRegisterChange = (e: any) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // UPDATED: Add email existence check before sending OTP
  const sendRegisterOtp = async () => {
    if (!registerData.name || !registerData.email) {
      setRegisterError("Fill all fields");
      return;
    }

    setRegisterLoading(true);
    setRegisterError(null);

    try {
      // Check if email already exists in users or vendor_register
      const exists = await checkEmailExists(registerData.email);
      if (exists) {
        setRegisterError("This email is already registered. Please login.");
        return;
      }

      // Proceed to send OTP with role set to "user"
      const { error } = await supabase.auth.signInWithOtp({
        email: registerData.email,
        options: {
          data: {
            name: registerData.name,
            role: "user"  // ✅ Explicitly set role to "user" for user registrations
          }
        },
      });

      if (error) throw error;

      setRegisterStep("otp");
      setRegisterSuccess("OTP sent!");
    } catch (err: any) {
      setRegisterError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const verifyRegisterOtp = async () => {
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      if (!registerData.email || !registerData.otp) {
        setRegisterError("Please enter OTP");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: registerData.email,
        token: registerData.otp,
        type: "email",
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Registration failed. User not found.");

      // ✅ Insert into users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          user_id: user.id,
          name: registerData.name,
          email: registerData.email,
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("User profile creation failed.");
      }

      // ✅ Ensure role is user
      await supabase.auth.updateUser({
        data: { role: "user" },
      });

      setRegisterSuccess("Registration successful!");
      setShowRegisterPopup(false);
      router.push("/user");

      // reset fields
      setRegisterData({ name: "", email: "", otp: "" });
      setRegisterStep("form");
    } catch (err: any) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };


  const navLinks = [
    { name: "Home", href: "/user" },
    { name: "Plans", href: "/user/subscription-plans" },
    { name: "Products", href: "/user/listing" },
    { name: "Video", href: "/user/video" },
    { name: "Transport", href: "/user/transport" },
    { name: "Enquiry", href: "/user/enquiry" },
    { name: "Help & Earn", href: "/user/help" },
  ];

  // Bottom nav items (subset of navLinks + Profile conditionally)
  const bottomNavItems = [
    { name: "Home", href: "/user", icon: Home },
    { name: "Video", href: "/user/video", icon: PlayCircle },
    { name: "Enquiry", href: "/user/enquiry", icon: MessageSquare },
    { name: "Products", href: "/user/listing", icon: Package },
    ...(user ? [{ name: "Profile", href: userRole === "vendor" ? "/user/vendor-profile" : "/user/profile", icon: UserIcon }] : []),
  ];

  return (

    <div className="pt-16 bg-black">
      {/* ---------------- HEADER ---------------- */}
      <header
        className={`fixed top-0 pt-[20px] left-0 right-0 z-[9999] h-[84px] bg-black border-b border-red-50 shadow-sm transition-all duration-300
${showLoginPopup || showRegisterPopup || openVendor ? "lg:hidden" : "block"}`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          {/* 1. Logo Section: Optimized sizing */}
          <Link href="/user" className="flex-shrink-0 transition-transform hover:scale-105">
            <Image
              src="/navbar_logo.png"
              alt="QickTick"
              width={120}
              height={60}
              className="object-contain h-10 w-auto sm:h-12"
              priority
            />
          </Link>
          {/* MOBILE ACTIONS (NO HAMBURGER) */}
          <div className="flex lg:hidden items-center gap-2">
            {!user && (
              <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-xl">
                {/* Add Business - Subtle Border Style */}
                <button
                  onClick={() => setOpenVendor(true)}
                  className="px-3 py-2 text-[10px] font-black uppercase tracking-tight border border-yellow-500 text-yellow-600 rounded-lg active:scale-95 transition-transform"
                >
                  + Add Business
                </button>

                {/* Register Button - Icon Style */}
                <button
                  onClick={() => { setShowRegisterPopup(true); setOpenRegisterMenu(false); }}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors flex items-center justify-center border border-transparent"
                  title="Register"
                >
                  <UserPlus size={18} strokeWidth={2.5} />
                </button>

                {/* Login Button - High Visibility */}
                <button
                  onClick={() => setShowLoginPopup(true)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-tight bg-yellow-400 text-black rounded-lg shadow-sm shadow-yellow-200 active:scale-95 transition-all"
                >
                  Login
                </button>
              </div>
            )}

            {user && (
              <button
                onClick={() => setShowMoreMenu(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-90"
                style={{ backgroundColor: profileColor }}
              >
                <UserCircle size={22} className="text-white" />
              </button>
            )}
          </div>

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

          {/* 3. Actions Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Primary Action Button */}
            {!user && (
              <button
                onClick={() => setOpenVendor(true)}
                className="px-6 py-3 border-2 border-red-500 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-red-500/10 transition-all"
              >
                +  Add Business
              </button>
            )}

            <div className="h-6 w-[1px] bg-gray-200" />

            {/* AUTH SECTION */}
            <div className="flex items-center space-x-3">
              {!user ? (
                <>
                  <button
                    onClick={() => setShowLoginPopup(true)}
                    className="px-4 py-2 text-sm font-bold text-white hover:text-white transition"
                  >
                    Login
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenRegisterMenu((prev) => !prev)}
                      className="px-5 py-2.5 bg-yellow-400 text-black text-sm rounded-full font-bold shadow-sm hover:bg-yellow-500 transition-all flex items-center"
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
                    className="flex items-center space-x-3 p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-inner"
                  >
                    <div className="relative flex-shrink-0">
                      {/* Vendor Medal as Avatar */}
                      {userRole === "vendor" && profileMedal ? (
                        <div
                          className="relative flex items-center justify-center 
                     rounded-full shadow-lg border-2 border-white
                     animate-in zoom-in duration-500
                     hover:scale-110 transition-transform
                     px-3 py-2 min-w-[2.5rem] max-w-[5rem]"
                          style={{
                            backgroundColor: '#000000', // black background for medal
                            boxShadow: `0 0 15px ${profileColor}60`,
                          }}
                          title="Vendor Rank"
                        >
                          <span
                            className={`text-sm font-bold text-white select-none drop-shadow-md ${profileMedal.length > 2 ? 'text-[10px]' : 'text-sm'
                              }`}
                          >
                            {profileMedal}
                          </span>
                          {/* Glow Ring */}
                          <div className="absolute inset-0 rounded-full border border-yellow-400 opacity-40 animate-pulse" />
                        </div>
                      ) : (
                        /* Regular User Avatar */
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-105 overflow-hidden"
                          style={{
                            backgroundColor: profileColor,
                            borderColor: 'rgba(255,255,255,0.9)',
                            boxShadow: `0 0 20px ${profileColor}60`,
                          }}
                        >
                          <UserCircle size={28} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex flex-col items-start pr-4">
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">
                        {userRole === "vendor" ? "Premium Vendor" : "Member"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white tracking-tight">Account</span>
                        <ChevronDown
                          size={14}
                          className={`text-yellow-400 transition-transform duration-300 ${openMenu === "profile" ? 'rotate-180' : ''
                            }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* DROPDOWN MENU */}
                  {openMenu === "profile" && (
                    <div className="absolute right-0 mt-3 bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200 shadow-2xl rounded-2xl py-2 w-60 text-sm z-50 animate-in fade-in slide-in-from-top-2">
                      {/* Header */}
                      <div className="px-4 py-2 mb-1 border-b border-yellow-200">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Account</p>
                      </div>

                      {/* My Profile - Always shown */}
                      <Link
                        href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                        className="flex items-center px-4 py-2.5 hover:bg-yellow-200 hover:text-gray-900 font-medium text-gray-800 transition-colors duration-200"
                      >
                        My Profile
                      </Link>

                      {userRole === "vendor" && (
                        <>
                          <Link
                            href="/vendor/products"
                            className="flex items-center px-4 py-2.5 hover:bg-yellow-200 hover:text-gray-900 font-medium text-gray-800 transition-colors duration-200"
                          >
                            Products
                          </Link>
                          <Link
                            href="/vendor/enquiry"
                            className="flex items-center px-4 py-2.5 hover:bg-yellow-200 hover:text-gray-900 font-medium text-gray-800 transition-colors duration-200"
                          >
                            Enquiries
                          </Link>
                        </>
                      )}

                      {/* Logout - Always shown */}
                      <button
                        onClick={logout}
                        className="flex w-full px-4 py-2.5 hover:bg-red-100 text-left text-red-600 font-bold mt-1 rounded-b-2xl transition-colors duration-200"
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
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 top-16 z-[9998] bg-white lg:hidden overflow-y-auto"
        >
          {/* Mobile Nav Links */}
          <div className="px-6 py-6 space-y-4 border-b">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-bold text-gray-800"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Auth Section */}
          <div className="px-6 py-6">
            {!user ? (
              <div className="space-y-4">
                <button
                  onClick={() => { setShowLoginPopup(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-wide"
                >
                  Login
                </button>
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowRegisterPopup(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold text-sm uppercase tracking-wide"
                  >
                    User Register
                  </button>
                  <button
                    onClick={() => { setOpenVendor(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide"
                  >
                    Vendor Register
                  </button>
                </div>
              </div>
            ) : (
              /* MOBILE PROFILE DROPDOWN */
              <div>
                <button
                  onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                  className="w-full flex items-center justify-between bg-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: profileColor }}
                    >
                      <UserCircle size={26} className="text-white" />
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-black text-gray-800">
                        {userRole === "vendor" ? "Vendor Account" : "User Account"}
                      </p>
                      <p className="text-xs text-gray-500">Tap to manage</p>
                    </div>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${mobileProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mobileProfileOpen && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {/* My Profile - Always shown */}
                    <Link
                      href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                      className="block px-5 py-4 text-sm font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>

                    {userRole === "vendor" && (
                      <>
                        <Link href="/vendor/products" className="block px-5 py-4 text-sm font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                          Products
                        </Link>
                        <Link href="/vendor/enquiry" className="block px-5 py-4 text-sm font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                          Enquiries
                        </Link>
                      </>
                    )}

                    {/* Logout - Always shown */}
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-5 py-4 text-sm font-bold text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- BOTTOM NAVIGATION (Mobile Only) -------------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-black border-t border-gray-700 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive ? "bg-yellow-500 text-black" : "text-white hover:bg-gray-800"
                  }`}
              >
                <item.icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-white hover:bg-gray-800 transition-all duration-200"
          >
            <MoreHorizontal size={20} className="mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* -------------------- MORE MENU OVERLAY (Mobile Only) -------------------- */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-[10000] flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowMoreMenu(false)}
          />
          {/* Menu */}
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">

              {/* PROFILE OPTIONS */}
              {user && (
                <div className="border rounded-xl p-3">
                  <p className="text-xs font-bold text-black uppercase mb-2">
                    Account
                  </p>

                  <Link
                    href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
                    onClick={() => setShowMoreMenu(false)}
                    className="block py-2 px-3 text-black rounded-lg hover:bg-gray-100 font-semibold"
                  >
                    My Profile
                  </Link>

                  {userRole === "vendor" && (
                    <>
                      <Link
                        href="/vendor/products"
                        onClick={() => setShowMoreMenu(false)}
                        className="block py-2 px-3 text-black  rounded-lg hover:bg-gray-100 font-semibold"
                      >
                        Products
                      </Link>

                      <Link
                        href="/vendor/enquiry"
                        onClick={() => setShowMoreMenu(false)}
                        className="block py-2 px-3 text-black rounded-lg hover:bg-gray-100 font-semibold"
                      >
                        Enquiries
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-red-600 font-bold hover:bg-red-50 mt-2"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* REMAINING NAV LINKS */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">
                  Navigation
                </p>

                {navLinks
                  .filter((link) => !bottomNavItems.some((item) => item.href === link.href))
                  .map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setShowMoreMenu(false)}
                      className="block py-3 px-4 text-gray-800 font-medium hover:bg-gray-100 rounded-lg"
                    >
                      {link.name}
                    </Link>
                  ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- LOGIN POPUP (Mobile-Friendly) ------------------------ */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLoginPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

            <div className="p-6 md:p-10">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 font-medium text-sm md:text-base">Enter your email to access your account</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {loginSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">One-Time Password</label>
                    {otpTimer && <span className="text-xs font-bold text-yellow-600 mb-1">{otpTimer} remaining</span>}
                  </div>
                  <input
                    name="otp"
                    value={loginData.otp}
                    onChange={handleLoginChange}
                    placeholder="Enter OTP"
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-center text-lg tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={sendLoginOtp}
                    disabled={loginLoading}
                    className="py-3 bg-black text-slate">
                    {loginLoading ? "Sending..." : "Send OTP"}
                  </button>
                  <button
                    onClick={verifyLoginOtp}
                    disabled={loginLoading}
                    className="py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {loginLoading ? "Verifying..." : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REGISTER POPUP (Mobile-Friendly) ------------------------ */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowRegisterPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-yellow-500 to-yellow-300" />

            <div className="p-6 md:p-10">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium text-sm md:text-base">Join QickTick today and get started</p>
              </div>

              {registerError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {registerSuccess}
                </div>
              )}

              <div className="space-y-4">
                {registerStep === 'form' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                      />
                    </div>

                    <button
                      onClick={sendRegisterOtp}
                      disabled={registerLoading}
                      className="w-full py-3 bg-slate-900 text-yellow-500 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:bg-black hover:scale-105 active:scale-95 mt-4 disabled:opacity-50"
                    >
                      {registerLoading ? "Sending OTP..." : "Get Verification Code"}
                    </button>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 mb-4">
                        <p className="text-xs text-yellow-800 font-bold text-center">
                          We've sent a code to <span className="underline">{registerData.email}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Code</label>
                        <input
                          name="otp"
                          value={registerData.otp}
                          onChange={handleRegisterChange}
                          placeholder="Enter Code"
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-center text-xl tracking-widest"
                        />
                      </div>

                      <button
                        onClick={verifyRegisterOtp}
                        disabled={registerLoading}
                        className="w-full py-3 bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:bg-yellow-400 hover:scale-105 active:scale-95 mt-4 disabled:opacity-50"
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

      {/* Vendor Register Popup */}
      {openVendor && (
        <VendorRegister
          onClose={() => setOpenVendor(false)}
          onSuccess={() => loadUserAndRole()} // Force reload after registration
        />
      )}

    </div>
  );
}