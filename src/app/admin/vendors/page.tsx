"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, RefreshCw, CheckCircle, XCircle, Search, X as CloseIcon } from "lucide-react";

// Types
type Vendor = {
  id: string;
  profile_image: string | null;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  mobile_number: string | null;
  alternate_number: string | null;
  profile_info: string | null;
  company_name: string | null;
  user_type: string | null;
  business_type: string | null;
  email: string | null;
  media_files: string[] | null;
  status?: string | null;
  created_at?: string;
  subscription_plan?: string | null;
  subscription_expiry?: string | null; // date as string
};


// Custom hook for vendors data management
const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("vendor_register")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendorStatus = useCallback(async (id: string, status: string) => {
    // Optimistic update
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id ? { ...vendor, status } : vendor
      )
    );

    try {
      const { error } = await supabase
        .from("vendor_register")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      // Revert on error
      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === id ? { ...vendor, status: vendor.status } : vendor
        )
      );
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return { vendors, loading, error, fetchVendors, updateVendorStatus };
};

// Vendor Card Component
const VendorCard = ({ vendor, onViewDetails }: { vendor: Vendor; onViewDetails: (vendor: Vendor) => void }) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const isExpired = vendor.subscription_expiry
    ? new Date(vendor.subscription_expiry) < new Date()
    : false;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border ${isExpired ? "border-red-400" : "border-gray-200"}`}>
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={vendor.profile_image || "/placeholder-user.png"}
          alt={`${vendor.first_name} ${vendor.last_name} profile`}
          width={70}
          height={70}
          className="rounded-full object-cover border-2 border-gray-300"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{vendor.first_name || "N/A"} {vendor.last_name || ""}</h3>
          <p className="text-sm text-gray-600 truncate">🏢 {vendor.company_name || "Not provided"}</p>
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
            {vendor.status || "pending"}
          </span>
        </div>
      </div>

      <div className="text-gray-700 text-sm space-y-1 mb-4">
        <p><span className="font-medium">📱 Mobile:</span> {vendor.mobile_number || "N/A"}</p>
        <p><span className="font-medium">📍 Location:</span> {vendor.location || "N/A"}</p>
        <p><span className="font-medium">💳 Plan:</span> {vendor.subscription_plan || "N/A"}</p>
        <p>
          <span className="font-medium">⏰ Expiry:</span>{" "}
          {vendor.subscription_expiry
            ? new Date(vendor.subscription_expiry).toLocaleDateString()
            : "N/A"}{" "}
          {isExpired && <span className="text-red-600 font-bold">(Expired)</span>}
        </p>
      </div>

      <button
        onClick={() => onViewDetails(vendor)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors font-medium"
      >
        View Details
      </button>
    </div>
  );
};


// Vendor Modal Component
const VendorModal = ({
  vendor,
  onClose,
  onUpdateStatus,
}: {
  vendor: Vendor;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) => {
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);

  const handleConfirm = () => {
    if (confirmAction) {
      onUpdateStatus(confirmAction.id, confirmAction.type);
      setConfirmAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fadeIn"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <Image
            src={vendor.profile_image || "/placeholder-user.png"}
            alt={`${vendor.first_name} ${vendor.last_name} profile`}
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-gray-200 mb-4"
          />
          <h2 id="modal-title" className="text-3xl font-bold text-gray-800">
            {vendor.first_name || "N/A"} {vendor.last_name || ""}
          </h2>
          <p className="text-gray-600 text-lg">{vendor.company_name || "No company"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 mb-6">
          <p><strong>Email:</strong> {vendor.email || "N/A"}</p>
          <p><strong>Mobile:</strong> {vendor.mobile_number || "N/A"}</p>
          <p><strong>Alternate No:</strong> {vendor.alternate_number || "N/A"}</p>
          <p><strong>Location:</strong> {vendor.location || "N/A"}</p>
          <p><strong>Business Type:</strong> {vendor.business_type || "N/A"}</p>
          <p><strong>User Type:</strong> {vendor.user_type || "N/A"}</p>
          <p><strong>Plan:</strong> {vendor.subscription_plan || "N/A"}</p>
          <p>
            <strong>Expiry:</strong>{" "}
            {vendor.subscription_expiry
              ? new Date(vendor.subscription_expiry).toLocaleDateString()
              : "N/A"}{" "}
            {vendor.subscription_expiry && new Date(vendor.subscription_expiry) < new Date() && (
              <span className="text-red-600 font-bold">(Expired)</span>
            )}
          </p>
        </div>


        {/* Profile Info Section - Always Visible with Enhanced Styling */}
        <div className="mb-6 border-t pt-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Profile Info</h3>
          <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg border">
            {vendor.profile_info || "No profile info provided."}
          </p>
        </div>

        {/* Media Files Section - Always Visible with Enhanced Styling */}
        <div className="mb-6 border-t pt-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Media Files</h3>
          {vendor.media_files && vendor.media_files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.media_files.map((file, index) => (
                <Image
                  key={index}
                  src={file}
                  alt={`Media ${index + 1}`}
                  width={400}
                  height={300}
                  className="rounded-lg border object-cover h-32 w-full hover:scale-105 transition-transform"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-gray-50 p-4 rounded-lg border">No media files uploaded.</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setConfirmAction({ type: "rejected", id: vendor.id })}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <XCircle size={18} />
            Reject
          </button>
          <button
            onClick={() => setConfirmAction({ type: "approved", id: vendor.id })}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <CheckCircle size={18} />
            Approve
          </button>
        </div>

        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <p className="text-center mb-4">
                Are you sure you want to {confirmAction.type} this vendor?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function VendorsPage() {
  const { vendors, loading, error, fetchVendors, updateVendorStatus } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered vendors based on search
  const filteredVendors = useMemo(() => {
    if (!debouncedQuery) return vendors;
    return vendors.filter((vendor) =>
      [
        vendor.first_name,
        vendor.last_name,
        vendor.company_name,
        vendor.email,
        vendor.location,
      ]
        .some((field) =>
          field?.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
    );
  }, [vendors, debouncedQuery]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Vendors List (Total: {filteredVendors.length})
          </h1>
          <div className="flex gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <CloseIcon size={18} />
                </button>
              )}
            </div>
            <button
              onClick={fetchVendors}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              aria-label="Refresh vendors list"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-20">
            {debouncedQuery ? "No vendors match your search." : "No vendors found."}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onViewDetails={setSelectedVendor}
              />
            ))}
          </div>
        )}

        {selectedVendor && (
          <VendorModal
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onUpdateStatus={updateVendorStatus}
          />
        )}
      </div>
    </div>
  );
}