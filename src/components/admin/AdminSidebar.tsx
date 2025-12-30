"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineClipboardList,
  HiOutlineLogout, HiOutlinePhotograph, HiOutlineTemplate, HiOutlineShieldCheck
} from "react-icons/hi";
import { FaUserTie, FaUserFriends, FaTruckMoving, FaPodcast } from "react-icons/fa";

export default function AdminSidebar() {
  const [role, setRole] = useState<"admin" | "subadmin" | "loading">("loading");
  const pathname = usePathname();

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    setRole((savedRole as any) || "admin");
  }, []);

  if (role === "loading") {
    return <aside className="w-72 h-screen bg-[#0F172A] border-r border-slate-800 animate-pulse" />;
  }

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, icon: Icon, children }: any) => {
    const active = isActive(href);
    return (
      <Link href={href} className="block group px-3">
        <div className={`
          flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300
          ${active
            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" // Yellow Background when active
            : "text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-500"} // Yellow Border/Text on hover
        `}>
          <div className="flex items-center gap-3">
            <Icon size={20} className={`${active ? "text-black" : "group-hover:text-yellow-500"}`} />
            <span className="font-semibold text-[13px] tracking-wide">{children}</span>
          </div>
          {/* Dot indicator is now black when active to contrast against yellow bg */}
          {active && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-72 h-screen bg-[#0F172A] flex flex-col text-white sticky top-0 border-r border-slate-800 shadow-2xl">

      {/* 1. STICKY HEADER */}
      <div className="flex-none p-6 flex flex-col items-center bg-[#0F172A] border-b border-slate-800/50">
        <div className="flex justify-center mb-6">
          <Image
            src="/navbar_logo.png"
            alt="QickTick Logo"
            width={160}
            height={50}
            priority
            className="object-contain"
          />
        </div>

        <div className="mt-4 text-center">
          {/* Changed status badge to yellow theme */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
              {role} control
            </span>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE MIDDLE SECTION */}
      <div className="flex-1 overflow-y-auto py-6 space-y-8 no-scrollbar scroll-smooth">

        {/* Main Menu */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-8 mb-3">Main</p>
          <NavLink href="/admin/dashboard" icon={HiOutlineHome}>Overview</NavLink>
          <NavLink href="/admin/category" icon={HiOutlineOfficeBuilding}>Categories</NavLink>
          {role === "admin" && (
            <NavLink href="/admin/plans" icon={HiOutlineClipboardList}>Subscription Plans</NavLink>
          )}
        </div>

        {/* Content Manager */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-8 mb-3">Marketing</p>
          <NavLink href="/admin/site-home/digital-branding" icon={HiOutlineTemplate}>Branding Reels</NavLink>
          <NavLink href="/admin/site-home/digital-banner" icon={HiOutlinePhotograph}>Site Banners</NavLink>
          <NavLink href="/admin/site-home/help-and-earn" icon={HiOutlineShieldCheck}>Help & Earn</NavLink>
          <NavLink href="/admin/site-home/certificates" icon={HiOutlinePhotograph}>Certificates</NavLink>
        </div>

        {/* Media */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-8 mb-3">Media</p>
          <NavLink href="/admin/site-home/podcast" icon={FaPodcast}>Podcasts</NavLink>
          <NavLink href="/admin/site-home/influencers" icon={FaUserFriends}>Influencers</NavLink>
        </div>

        {/* Operations */}
        <div className="space-y-1 pb-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-8 mb-3">Operations</p>
          {role === "admin" && <NavLink href="/admin/customers" icon={FaUserFriends}>Customers</NavLink>}
          <NavLink href="/admin/vendors" icon={FaUserTie}>Vendors</NavLink>
          <NavLink href="/admin/transportation" icon={FaTruckMoving}>Transportation</NavLink>
          {role === "admin" && (
            <NavLink href="/admin/subadmins" icon={FaUserTie}>Staff Access</NavLink>
          )}
        </div>
      </div>

      {/* 3. STICKY FOOTER */}
      <div className="flex-none p-6 bg-[#0B1222] border-t border-slate-800/50 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/adminlogin";
          }}
          className="w-full flex items-center justify-center gap-3 bg-red-500/5 hover:bg-red-600 text-red-500 hover:text-white h-12 rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-600"
        >
          <HiOutlineLogout size={18} />
          <span className="font-bold text-xs uppercase tracking-widest">Logout System</span>
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}