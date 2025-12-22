"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from "react-icons/hi";

import {
  FaUserTie,
  FaUserFriends,
  FaTruckMoving,
  FaMoneyCheckAlt,
} from "react-icons/fa";

export default function AdminSidebar() {
  const [role, setRole] = useState<"admin" | "subadmin" | null>(null);

  // Load saved role from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    setRole(savedRole as any);
  }, []);

  if (!role) return null; // prevents flashing

  return (
    <aside className="w-64 h-screen bg-gray-200 shadow-xl flex flex-col text-black">
      
      {/* Logo Section */}
      <div className="flex flex-col items-center p-6 border-b border-gray-300">
        <Image
          src="/logo.jpg"
          width={150}
          height={150}
          alt="Logo"
          className="rounded-lg border border-gray-300"
        />
        <h2 className="text-xl font-bold mt-4">
          {role === "admin" ? "Admin Panel" : "Sub Admin Panel"}
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-5 py-6 space-y-2">

        {/* Dashboard only for ADMIN */}
        {role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
          >
            <HiOutlineHome size={24} />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Categories */}
        <Link
          href="/admin/category"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
        >
          <HiOutlineOfficeBuilding size={24} />
          <span>Categories</span>
        </Link>

        {/* Services */}
        <Link
          href="/admin/services"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
        >
          <HiOutlineClipboardList size={24} />
          <span>Services</span>
        </Link>

        {/* Customer Listing only ADMIN */}
        {role === "admin" && (
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
          >
            <FaUserFriends size={24} />
            <span>Customer Listing</span>
          </Link>
        )}

        {/* Vendor Listing */}
        <Link
          href="/admin/vendors"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
        >
          <FaUserTie size={24} />
          <span>Vendor Listing</span>
        </Link>

        {/* Transportation */}
        <Link
          href="/admin/transportation"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
        >
          <FaTruckMoving size={24} />
          <span>Transportation</span>
        </Link>

        {/* Payment Tracking only ADMIN */}
        {role === "admin" && (
          <Link
            href="/admin/payment-tracking"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
          >
            <FaMoneyCheckAlt size={24} />
            <span>Payment Tracking</span>
          </Link>
        )}

        {/* Sub Admin Management only ADMIN */}
        {role === "admin" && (
          <Link
            href="/admin/subadmins"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-300"
          >
            <FaUserTie size={24} />
            <span>Manage Sub Admins</span>
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-gray-300">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/adminlogin";
          }}
          className="w-full bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
        >
          <HiOutlineLogout size={22} />
          Logout
        </button>
      </div>
    </aside>
  );
}
