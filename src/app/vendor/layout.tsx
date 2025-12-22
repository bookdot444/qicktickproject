"use client";

import VendorHeader from "@/components/vendor/VendorHeader";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar / Header */}
      <aside className="w-64 bg-white shadow-md">
        <VendorHeader />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
