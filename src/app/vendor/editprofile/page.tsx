"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Camera } from "lucide-react";

export default function ProfileEditing() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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

  const handleChange = (key: string, value: any) => {
    setVendor((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!vendor) return;
    setLoading(true);

    let profileImageUrl = vendor.profile_image;

    if (file) {
      // ✅ DELETE OLD IMAGE PROPERLY
      if (vendor.profile_image) {
        const oldPath = vendor.profile_image.split("/vendor-files/")[1];
        if (oldPath) {
          await supabase.storage
            .from("vendor-files")
            .remove([oldPath]);
        }
      }

      // ✅ UPLOAD NEW IMAGE
      const filePath = `profile-pictures/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("vendor-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        alert("Image upload failed");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("vendor-files")
        .getPublicUrl(filePath);

      // ✅ ADD CACHE BUSTER
      profileImageUrl = `${data.publicUrl}?t=${Date.now()}`;
    }

    // ✅ UPDATE DB
    const { error } = await supabase
      .from("vendor_register")
      .update({
        first_name: vendor.first_name,
        last_name: vendor.last_name,
        mobile_number: vendor.mobile_number,
        alternate_number: vendor.alternate_number,
        company_name: vendor.company_name,
        location: vendor.location,
        business_type: vendor.business_type,
        profile_info: vendor.profile_info,
        profile_image: profileImageUrl,
      })
      .eq("email", vendor.email);

    setLoading(false);

    if (!error) {
      setVendor((prev: any) => ({
        ...prev,
        profile_image: profileImageUrl,
      }));
      alert("Profile updated successfully!");
    } else {
      alert("Update failed");
    }
  };


  if (!vendor)
    return <p className="p-10 text-center text-gray-500">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
          <h2 className="text-2xl font-bold text-white">Edit Vendor Profile</h2>
          <p className="text-yellow-100 text-sm">
            Keep your business information up to date
          </p>
        </div>

        <div className="p-8 space-y-8">

          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={
                  vendor.profile_image
                    ? `${vendor.profile_image}`
                    : "/placeholder-user.png"
                }
                key={vendor.profile_image} // 🔥 forces rerender
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />

              <label className="absolute bottom-0 right-0 bg-yellow-500 p-2 rounded-full cursor-pointer hover:bg-yellow-600 transition">
                <Camera className="text-white w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click camera icon to change photo
            </p>
          </div>

          {/* Personal Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["mobile_number", "Mobile Number"],
                ["alternate_number", "Alternate Number"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    value={vendor[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Business Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Business Details
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                ["company_name", "Company Name"],
                ["location", "Location"],
                ["business_type", "Business Type"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    value={vendor[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              About Business
            </h3>
            <textarea
              rows={5}
              value={vendor.profile_info || ""}
              onChange={(e) => handleChange("profile_info", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              placeholder="Tell customers about your business..."
            />
          </section>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
