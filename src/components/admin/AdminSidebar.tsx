"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Added for active state
import { useEffect, useState } from "react";
import {
  HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineClipboardList,
  HiOutlineLogout, HiOutlinePhotograph, HiOutlineTemplate, HiOutlineShieldCheck
} from "react-icons/hi";
import { FaUserTie, FaUserFriends, FaTruckMoving, FaMoneyCheckAlt, FaPodcast } from "react-icons/fa";

export default function AdminSidebar() {
  // 1. Change the initial state to include a 'loading' or default value
  const [role, setRole] = useState<"admin" | "subadmin" | "loading">("loading");
  const pathname = usePathname();

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    // 2. Fallback to 'admin' for now if you just want to see it while coding
    setRole((savedRole as any) || "admin"); 
  }, []);

  // 3. Remove this or change it to a loader
  if (role === "loading") {
    return <aside className="w-72 h-screen bg-[#0F172A] animate-pulse" />;
  }

  if (!role) return null;

  // Helper for active link styling
  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, icon: Icon, children }: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(href)
        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <Icon size={22} className={isActive(href) ? "text-white" : "group-hover:text-red-500"} />
      <span className="font-medium text-sm">{children}</span>
    </Link>
  );

  return (
    <aside className="w-72 h-screen bg-[#0F172A] flex flex-col text-white sticky top-0 overflow-y-auto no-scrollbar border-r border-slate-800">

      {/* Profile/Logo Section */}
      {/* Profile/Logo Section */}
      <div className="p-6 flex flex-col items-center border-b border-slate-800/50 mb-4">
        {/* Adjusted width to w-full (up to 200px) and height to h-24 */}
        <div className="relative w-full max-w-[200px] h-24 mb-4">
          <Image
            src="/logo.jpg"
            fill
            alt="Logo"
            // Changed object-cover to object-contain to prevent cropping on wider logos
            className="rounded-xl object-contain p-1"
            priority
          />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight text-white">
            {role === "admin" ? "Master Admin" : "Staff Panel"}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase font-bold tracking-widest border border-slate-700">
            {role}
          </span>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mt-4 mb-2">Main Menu</p>

        {role === "admin" && <NavLink href="/admin/dashboard" icon={HiOutlineHome}>Dashboard</NavLink>}
        <NavLink href="/admin/category" icon={HiOutlineOfficeBuilding}>Categories</NavLink>
        {/* Plan Management - Restricted to Admin */}
        {role === "admin" && (
          <NavLink href="/admin/plans" icon={HiOutlineClipboardList}>
            Subscription Plans
          </NavLink>
        )}
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mt-8 mb-2">Content Manager</p>
        <div className="space-y-1 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50">
          <NavLink href="/admin/site-home/digital-branding" icon={HiOutlineTemplate}>Branding Reels</NavLink>
          <NavLink href="/admin/site-home/digital-banner" icon={HiOutlinePhotograph}>Site Banners</NavLink>
          <NavLink href="/admin/site-home/help-and-earn" icon={HiOutlineShieldCheck}>Help & Earn</NavLink>
          <NavLink href="/admin/site-home/certificates" icon={HiOutlinePhotograph}>Certificates</NavLink>
        </div>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mt-8 mb-2">Media</p>
        <NavLink href="/admin/site-home/podcast" icon={FaPodcast}>Podcasts</NavLink>
        <NavLink href="/admin/site-home/influencers" icon={FaUserFriends}>Influencers</NavLink>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mt-8 mb-2">Users & Operations</p>
        {role === "admin" && <NavLink href="/admin/customers" icon={FaUserFriends}>Customers</NavLink>}
        <NavLink href="/admin/vendors" icon={FaUserTie}>Vendors</NavLink>
        <NavLink href="/admin/transportation" icon={FaTruckMoving}>Transportation</NavLink>

        {role === "admin" && (
          <>
        {/* <NavLink href="/admin/payment-tracking" icon={FaMoneyCheckAlt}>Payments</NavLink> */}
            <NavLink href="/admin/subadmins" icon={FaUserTie}>Staff Access</NavLink>
          </>
        )}
      </nav>

      {/* Logout Area */}
      <div className="p-4 mt-10">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/adminlogin";
          }}
          className="w-full group flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-red-600/10 text-slate-300 hover:text-red-500 p-3 rounded-xl transition-all border border-slate-700 hover:border-red-600/30"
        >
          <HiOutlineLogout size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}