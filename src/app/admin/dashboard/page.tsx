"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);

  const fetchCounts = async () => {
    // ✅ 1. GET USER COUNT FROM API ROUTE  
    const res = await fetch("/api/admin/count-users");
    const userData = await res.json();
    setTotalCustomers(userData.totalCustomers);

    // ✅ 2. COUNT VENDORS
    const { count: vendors } = await supabase
      .from("vendor_register")
      .select("*", { count: "exact", head: true });

    setTotalVendors(vendors || 0);

    // ✅ 3. COUNT TRANSPORT REQUESTS
    const { count: transport } = await supabase
      .from("travel_requests")
      .select("*", { count: "exact", head: true });

    setTotalTransport(transport || 0);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-black mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold text-black">Total Customers</h2>
          <p className="text-3xl font-bold text-black mt-3">{totalCustomers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold text-black">Total Vendors</h2>
          <p className="text-3xl font-bold text-black mt-3">{totalVendors}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold text-black">Transport Requests</h2>
          <p className="text-3xl font-bold text-black mt-3">{totalTransport}</p>
        </div>
      </div>
    </div>
  );
}
