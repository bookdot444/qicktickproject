"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserFeed() {
  const pathname = usePathname();
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

  // Get current logged-in user on load
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Login handler
  const handleLoginChange = (e: any) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const sendLoginOtp = async () => {
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: loginData.email });
    if (error) setLoginError(error.message);
    else setLoginSuccess("OTP sent!");
    setLoginLoading(false);
  };
  const verifyLoginOtp = async () => {
    setLoginLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: loginData.email,
      token: loginData.otp,
      type: "email",
    });
    if (error) setLoginError(error.message);
    else {
      setLoginSuccess("Login successful!");
      setTimeout(() => setShowLoginPopup(false), 1500);
    }
    setLoginLoading(false);
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
    <div>
      {/* ---------------- HEADER ---------------- */}
      <header className="bg-white border-b sticky top-0 z-50 shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-28">
          <Link href="/user/feed">
            <Image src="/logo.jpg" alt="QickTick" width={150} height={60} />
          </Link>

          <nav className="hidden md:flex items-center space-x-6 font-semibold text-black">
            <Link href="/user/feed" className={isActive("/user/feed")}>Home</Link>
            <Link href="/user/subscription-plans" className={isActive("/user/subscription-plans")}>Plans</Link>
            <Link href="/user/listing" className={isActive("/user/listing")}>Listing</Link>
              <Link href="/user/video" className={isActive("/user/video")}>Video</Link>
            <Link href="/user/transport" className={isActive("/user/transport")}>Transport</Link>
            <Link href="/user/enquiry" className={isActive("/user/enquiry")}>Enquiry</Link>
            <Link href="/user/help" className={isActive("/user/help")}>Help And Earn</Link>
            {/* <Link href="/user/vendor-profile" className={isActive("/user/vendor-profile")}>Vendor</Link> */}
            <Link href="/user/add-business" className="px-4 py-2 bg-black text-white rounded-md">Add Business</Link>

            {/* ▼ BEFORE login - show LOGIN + REGISTER */}
            {!user && (
              <div className="flex space-x-3">
                <button onClick={() => setShowLoginPopup(true)} className="border px-3 py-2 rounded">
                  Login
                </button>
                <button onClick={() => setShowRegisterPopup(true)} className="bg-yellow-600 px-4 py-2 rounded text-white">
                  Register
                </button>
              </div>
            )}

            {/* ▼ AFTER login - show PROFILE ICON */}
            {user && (
              <div className="relative">
                <button onClick={() => setOpenMenu(openMenu ? null : "profile")}>
                  <UserCircle size={36} className="text-black" />
                </button>

                {openMenu === "profile" && (
                  <div className="absolute right-0 bg-white shadow-xl rounded-md py-2 w-44 text-sm">
                    <Link href="/user/profile" className="flex px-4 py-2 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <button onClick={logout} className="flex w-full px-4 py-2 hover:bg-gray-100 text-left">
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* -------------------- LOGIN POPUP ------------------------ */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowLoginPopup(false);
                setLoginData({ email: "", otp: "" });
                setLoginError(null);
                setLoginSuccess(null);
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg font-bold"
            >
              ✕
            </button>

            {/* Heading */}
            <h2 className="text-3xl font-bold mb-6 text-center text-black">
              Login
            </h2>

            {/* Error/Success Messages */}
            {loginError && <p className="text-red-600 mb-4 text-center">{loginError}</p>}
            {loginSuccess && <p className="text-green-600 mb-4 text-center">{loginSuccess}</p>}

            {/* Form (Single-Step: Email + OTP Always Visible) */}
            <div className="space-y-5">
              <div className="flex flex-col">
                <label className="font-semibold text-black mb-1">Email *</label>
                <input
                  name="email"
                  value={loginData.email}
                  placeholder="john@example.com"
                  className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  onChange={handleLoginChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-black mb-1">OTP *</label>
                <input
                  name="otp"
                  value={loginData.otp}
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  onChange={handleLoginChange}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={sendLoginOtp}
                  disabled={loginLoading}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {loginLoading ? "Sending..." : "Send OTP"}
                </button>
                <button
                  onClick={verifyLoginOtp}
                  disabled={loginLoading}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50"
                >
                  {loginLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REGISTER POPUP ------------------------ */}
      {showRegisterPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowRegisterPopup(false);
                setRegisterStep('form');
                setRegisterData({ name: "", email: "", otp: "" });
                setRegisterError(null);
                setRegisterSuccess(null);
              }}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg font-bold"
            >
              ✕
            </button>

            {/* Heading */}
            <h2 className="text-3xl font-bold mb-6 text-center text-black">
              Register
            </h2>

            {/* Error/Success Messages */}
            {registerError && <p className="text-red-600 mb-4 text-center">{registerError}</p>}
            {registerSuccess && <p className="text-green-600 mb-4 text-center">{registerSuccess}</p>}

            {/* Form */}
            <div className="space-y-5">
              {registerStep === 'form' && (
                <>
                  <div className="flex flex-col">
                    <label className="font-semibold text-black mb-1">Name *</label>
                    <input
                      name="name"
                      value={registerData.name}
                      placeholder="John Doe"
                      className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-black mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      placeholder="john@example.com"
                      className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <button
                    onClick={sendRegisterOtp}
                    disabled={registerLoading}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    {registerLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}
              {registerStep === 'otp' && (
                <>
                  <div className="flex flex-col">
                    <label className="font-semibold text-black mb-1">Enter OTP *</label>
                    <input
                      name="otp"
                      value={registerData.otp}
                      placeholder="Enter 6-digit OTP"
                      className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <button
                    onClick={verifyRegisterOtp}
                    disabled={registerLoading}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    {registerLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
