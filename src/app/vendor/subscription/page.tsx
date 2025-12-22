"use client";

import { useEffect, useState } from "react";
import {
    FaUser,
    FaEnvelope,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCreditCard,
    FaRedo
} from "react-icons/fa";

type Vendor = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    subscription_plan: string | null;
    subscription_expiry: string | null;
};

export default function VendorSubscriptionPage() {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const vendorData = localStorage.getItem("vendorData");
        if (vendorData) {
            setVendor(JSON.parse(vendorData));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    const isExpired =
        vendor?.subscription_expiry &&
        new Date(vendor.subscription_expiry) < new Date();

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-3xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Subscription
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage your vendor subscription plan
                    </p>
                </div>

                {!vendor ? (
                    <div className="bg-white p-8 rounded-2xl shadow border text-center">
                        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                        <p className="text-gray-700 font-medium">
                            Vendor not found. Please log in again.
                        </p>
                        <button className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">

                        {/* STATUS BAR */}
                        <div className="px-8 py-6 bg-gradient-to-r from-yellow-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {vendor.first_name} {vendor.last_name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {vendor.email}
                                </p>
                            </div>

                            {vendor.subscription_plan ? (
                                <span
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                                        isExpired
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                    }`}
                                >
                                    {isExpired ? "Expired" : "Active"}
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
                                    No Plan
                                </span>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="p-8 space-y-8">

                            {/* INFO GRID */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={<FaUser />}
                                    label="Vendor Name"
                                    value={`${vendor.first_name || "N/A"} ${vendor.last_name || ""}`}
                                />
                                <InfoCard
                                    icon={<FaEnvelope />}
                                    label="Email"
                                    value={vendor.email || "N/A"}
                                />
                                <InfoCard
                                    icon={<FaCreditCard />}
                                    label="Plan"
                                    value={vendor.subscription_plan || "Not Subscribed"}
                                />
                                <InfoCard
                                    icon={<FaCalendarAlt />}
                                    label="Expiry Date"
                                    value={
                                        vendor.subscription_expiry
                                            ? new Date(vendor.subscription_expiry).toLocaleDateString()
                                            : "N/A"
                                    }
                                />
                            </div>

                            {/* MESSAGE */}
                            {vendor.subscription_plan && (
                                <div
                                    className={`flex items-center gap-2 p-4 rounded-lg ${
                                        isExpired
                                            ? "bg-red-50 text-red-700"
                                            : "bg-green-50 text-green-700"
                                    }`}
                                >
                                    {isExpired ? (
                                        <FaExclamationTriangle />
                                    ) : (
                                        <FaCheckCircle />
                                    )}
                                    {isExpired
                                        ? "Your subscription has expired. Please renew."
                                        : "Your subscription is currently active."}
                                </div>
                            )}

                            {!vendor.subscription_plan && (
                                <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 text-gray-700">
                                    <FaExclamationTriangle />
                                    You do not have an active subscription.
                                </div>
                            )}

                            {/* ACTIONS */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex-1 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-600 transition flex items-center justify-center gap-2">
                                    <FaCreditCard />
                                    Buy Subscription
                                </button>

                                {vendor.subscription_plan && (
                                    <button className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition flex items-center justify-center gap-2">
                                        <FaRedo />
                                        Renew
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* INFO CARD COMPONENT */
function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="border rounded-xl p-4 flex items-start gap-3 bg-gray-50">
            <div className="text-yellow-600 text-lg">{icon}</div>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
