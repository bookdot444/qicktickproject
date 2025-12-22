"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
    LogOut,
    CreditCard,
    ImageIcon,
    Package,
    User,
    MessageSquare,
} from "lucide-react";

type Vendor = {
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    email: string | null;
};

export default function VendorSidebar() {
    const [vendor, setVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("vendorData");
        if (!stored) return;

        const vendorObj = JSON.parse(stored);

        supabase
            .from("vendor_register")
            .select("*")
            .eq("email", vendorObj.email)
            .single()
            .then(({ data }) => {
                if (data) setVendor(data);
            });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/vendorlogin";
    };

    return (
        <aside className="w-64 h-screen bg-white border-r shadow-md flex flex-col sticky top-0">

            {/* LOGO */}
            <div className="px-6 py-8 border-b bg-gradient-to-b from-yellow-50 to-white flex flex-col items-center">
                <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={110}
                    height={110}
                    className="object-contain mb-3 drop-shadow"
                    priority
                />
                <h1 className="text-xl font-extrabold text-gray-900 tracking-wide">
                    Vendor Panel
                </h1>
            </div>

            {/* PROFILE PREVIEW (TOP) */}
            {vendor && (
                <div className="px-6 py-5 border-b bg-white">
                    <div className="flex items-center gap-3">
                        <Image
                            src={vendor.profile_image || "/placeholder-user.png"}
                            alt="Vendor"
                            width={48}
                            height={48}
                            className="rounded-full object-cover border"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">
                                {vendor.first_name} {vendor.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                                Vendor Account
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN NAVIGATION */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <SidebarItem
                    href="/vendor/products"
                    icon={<Package size={18} />}
                    label="Products"
                />
                <SidebarItem
                    href="/vendor/enquiry"
                    icon={<MessageSquare size={18} />}
                    label="Enquiries"
                />
                <SidebarItem
                    href="/vendor/subscription"
                    icon={<CreditCard size={18} />}
                    label="Subscription"
                />
                <SidebarItem
                    href="/vendor/media"
                    icon={<ImageIcon size={18} />}
                    label="Media"
                />
            </nav>

            {/* PROFILE + LOGOUT (BOTTOM) */}
            <div className="border-t px-4 py-4 bg-gray-50 space-y-2">
                <SidebarItem
                    href="/vendor/editprofile"
                    icon={<User size={18} />}
                    label="Profile"
                />

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

/* SIDEBAR ITEM */
function SidebarItem({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-yellow-100 hover:text-yellow-700 transition"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
