"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VendorLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await fetch("/api/vendor/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if (!res.ok) {
                setErrorMsg(result.error || "Login failed");
                return;
            }

            localStorage.setItem("vendorData", JSON.stringify(result.vendor));
            router.push("/vendor/editprofile");
        } catch (err) {
            console.error(err);
            setErrorMsg("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">

                {/* LOGO */}
                <div className="flex justify-center mb-4">
                    <Image
                        src="/logo.jpg"
                        alt="QickTick Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                        priority
                    />
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Vendor Login
                </h2>
                <p className="text-center text-gray-500 text-sm mt-1 mb-6">
                    Access your vendor dashboard
                </p>

                {errorMsg && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                {/* FORM */}
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-800"
                    />

                    {/* PASSWORD WITH EYE */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition text-gray-800 pr-11"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>

                 {/* INFO TEXT */}
                <p className="text-center text-sm text-gray-500 mt-5">
                    New vendors must be approved by admin before accessing the dashboard.
                </p>

                {/* FOOTER */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} QickTick. All rights reserved.
                </p>
            </div>
        </div>
    );
}
