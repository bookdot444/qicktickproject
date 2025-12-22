"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient, User } from "@supabase/supabase-js";
import { CreditCard, CheckCircle, DollarSign, User as UserIcon, Phone, Mail, Users, Hash } from "lucide-react";

// Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Razorpay key (PUBLIC)
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

export default function HelpAndEarn() {
    const [user, setUser] = useState<User | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [paymentData, setPaymentData] = useState({
        amount: "",
        name: "",
        phone: "",
        email: "",
        referralName: "",
        referralId: "",
        category: "",
        giveAmount: "",
        referralNumber: "",
    });

    // Get logged-in user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null)
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("Please login first");
            return;
        }

        if (!(window as any).Razorpay) {
            alert("Razorpay SDK not loaded. Please refresh.");
            return;
        }

        setPaymentLoading(true);

        try {
            // 1️⃣ Create order
            const res = await fetch("/api/create-razorpay-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Number(paymentData.amount) * 100,
                    receipt: `receipt_${Date.now()}`,
                }),
            });

            const order = await res.json();
            if (!order.id) throw new Error("Order creation failed");

            // 2️⃣ Razorpay options
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "QickTick Help & Earn",
                description: "Referral Support Payment",
                order_id: order.id,

                handler: async (response: any) => {
                    const { error } = await supabase.from("help_payments").insert([
                        {
                            user_id: user.id,
                            amount: Number(paymentData.amount),
                            name: paymentData.name,
                            phone: paymentData.phone,
                            email: paymentData.email,
                            referral_name: paymentData.referralName,
                            referral_id: paymentData.referralId,
                            category: paymentData.category,
                            give_amount: paymentData.giveAmount,
                            referral_number: paymentData.referralNumber,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                    ]);

                    if (error) {
                        alert("Payment done but saving failed");
                        console.error(error);
                        return;
                    }

                    setPaymentSuccess(true);
                    setPaymentData({
                        amount: "",
                        name: "",
                        phone: "",
                        email: "",
                        referralName: "",
                        referralId: "",
                        category: "",
                        giveAmount: "",
                        referralNumber: "",
                    });
                },

                prefill: {
                    name: paymentData.name,
                    email: paymentData.email,
                    contact: paymentData.phone,
                },

                theme: { color: "#F59E0B" },

                modal: {
                    ondismiss: () => setPaymentLoading(false),
                },
            };

            // 3️⃣ Open Razorpay
            const rzp = new (window as any).Razorpay(options);

            rzp.on("payment.failed", (response: any) => {
                console.error("Payment failed", response.error);
                alert(response.error.description);
                setPaymentLoading(false);
            });

            rzp.open();
        } catch (err) {
            console.error(err);
            alert("Payment failed. Try again.");
            setPaymentLoading(false);
        }
    };

    return (
        <>
            {/* Razorpay Script */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
                <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-8 text-center">
                        <h1 className="text-4xl font-bold mb-2">Help & Earn</h1>
                        <p className="text-lg opacity-90">
                            Support others through our referral program and earn rewards. Fill in the details below to make a payment.
                        </p>
                    </div>

                    {/* Success Message */}
                    {paymentSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 m-8 flex items-center">
                            <CheckCircle size={24} className="text-green-600 mr-4" />
                            <div>
                                <h3 className="text-green-800 font-semibold">Payment Successful!</h3>
                                <p className="text-green-600">Your contribution has been recorded. Thank you for helping!</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Amount */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <DollarSign size={18} className="mr-2 text-yellow-600" />
                                        Amount
                                    </label>
                                    <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-yellow-500">
                                        <span className="text-gray-500 px-3">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="Enter Amount"
                                            required
                                            value={paymentData.amount}
                                            onChange={handleChange}
                                            className="w-full p-3 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <UserIcon size={18} className="mr-2 text-yellow-600" />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter Name"
                                        required
                                        value={paymentData.name}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <Phone size={18} className="mr-2 text-yellow-600" />
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter Phone"
                                        required
                                        value={paymentData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <Mail size={18} className="mr-2 text-yellow-600" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        required
                                        value={paymentData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Referral Name */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <Users size={18} className="mr-2 text-yellow-600" />
                                        Referral Name
                                    </label>
                                    <input
                                        type="text"
                                        name="referralName"
                                        placeholder="Enter Referral Name"
                                        required
                                        value={paymentData.referralName}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Referral ID */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                        <Hash size={18} className="mr-2 text-yellow-600" />
                                        Referral ID
                                    </label>
                                    <input
                                        type="text"
                                        name="referralId"
                                        placeholder="Enter Referral ID"
                                        required
                                        value={paymentData.referralId}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Which Category do you want to help</label>
                                    <select
                                        name="category"
                                        required
                                        value={paymentData.category}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">--Select--</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="transport">Transport</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Give Amount */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">How much amount do you want to give</label>
                                    <select
                                        name="giveAmount"
                                        required
                                        value={paymentData.giveAmount}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">--Select--</option>
                                        <option value="100">₹100</option>
                                        <option value="500">₹500</option>
                                        <option value="1000">₹1000</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Referral Number */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                                    <Hash size={18} className="mr-2 text-yellow-600" />
                                    Referral Number
                                </label>
                                <input
                                    type="text"
                                    name="referralNumber"
                                    placeholder="Enter Referral Number"
                                    required
                                    value={paymentData.referralNumber}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={paymentLoading}
                                    className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50 flex items-center justify-center mx-auto shadow-lg"
                                >
                                    <CreditCard size={20} className="mr-2" />
                                    {paymentLoading ? "Processing..." : `Pay ₹${paymentData.amount || "0.00"}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
