"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";


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
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);


  // Get current logged-in user on load
  useEffect(() => {
    const loadUserAndRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user?.email) {
        setUserRole(null);
        return;
      }

      // Check if logged-in user is a vendor
      const { data: vendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", user.email)
        .single();

      if (vendor) {
        setUserRole("vendor");
      } else {
        setUserRole("user");
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
        router.push("/user/feed");
      } else {
        router.push("/user/feed");
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
                {/* Register Button in Header */}
{/* Register Dropdown in Header */}
<div className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "register" ? null : "register")}
    className="bg-yellow-600 px-4 py-2 rounded text-white"
  >
    Register
  </button>

  {openMenu === "register" && (
    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
      {/* User Registration */}
      <button
        onClick={() => {
          setShowRegisterPopup(true);
          setOpenMenu(null);
        }}
        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        User Registration
      </button>

      {/* Vendor Registration */}
      <Link
        href="/vendorlogin"
        className="block px-4 py-2 hover:bg-gray-100"
        onClick={() => setOpenMenu(null)}
      >
        Vendor Registration
      </Link>
    </div>
  )}
</div>


              </div>
            )}

            {/* ▼ AFTER login - show PROFILE ICON */}
          {user && (
  <div className="relative">
    <button onClick={() => setOpenMenu(openMenu ? null : "profile")}>
      <UserCircle size={36} className="text-black" />
    </button>

    {openMenu === "profile" && (
      <div className="absolute right-0 bg-white shadow-xl rounded-md py-2 w-52 text-sm z-50">
        {/* My Profile link */}
        <Link
          href={userRole === "vendor" ? "/user/vendor-profile" : "/user/profile"}
          className="flex px-4 py-2 hover:bg-gray-100"
        >
          My Profile
        </Link>

        {/* ▼ Vendor-specific links (only visible for vendors) */}
        {userRole === "vendor" && (
          <>
            <Link
              href="/vendor/products"
              className="flex px-4 py-2 hover:bg-gray-100"
            >
              Products
            </Link>
            <Link
              href="/vendor/enquiry"
              className="flex px-4 py-2 hover:bg-gray-100"
            >
              Enquiries
            </Link>
            <Link
              href="/vendor/subscription"
              className="flex px-4 py-2 hover:bg-gray-100"
            >
              Subscription
            </Link>
          </>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex w-full px-4 py-2 hover:bg-gray-100 text-left"
        >
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
                {otpTimer && (
                  <p className="text-gray-600 text-sm text-center">
                    OTP expires in: <span className="font-bold">{otpTimer}</span>
                  </p>
                )}

                <label className="font-semibold text-black mb-1">OTP *</label>
                <input
                  name="otp"
                  value={loginData.otp}
                  placeholder="Enter 8-digit OTP"
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
                      placeholder="Enter 8-digit OTP"
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
