"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2,
  Upload,
  Trash2,
  ImageIcon,
  AlertCircle,
  CloudUpload
} from "lucide-react";

export default function VendorMediaPage() {
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  /* ============================
     LOAD VENDOR FROM LOCALSTORAGE
  ============================ */
  useEffect(() => {
    const stored = localStorage.getItem("vendorData");

    if (!stored) {
      setError("Please log in to access media.");
      setLoading(false);
      return;
    }

    try {
      const vendor = JSON.parse(stored);
      if (!vendor.email) throw new Error();

      setVendorEmail(vendor.email);
      fetchMedia(vendor.email);
    } catch {
      setError("Invalid session. Please log in again.");
      setLoading(false);
    }
  }, []);

  /* ============================
     FETCH MEDIA FILES
  ============================ */
  const fetchMedia = async (email: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("vendor_register")
      .select("media_files")
      .eq("email", email)
      .single();

    if (error) {
      console.error(error);
      setError("Failed to load media files.");
      setLoading(false);
      return;
    }

    setMediaFiles(data?.media_files || []);
    setLoading(false);
  };

  /* ============================
     UPLOAD IMAGE
  ============================ */
  const handleUpload = async () => {
    if (files.length === 0 || !vendorEmail) return;

    setUploading(true);
    setError(null);

    let uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const filePath = `vendor-media/${vendorEmail}/${Date.now()}-${Math.random()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setError("One of the uploads failed.");
        setUploading(false);
        return;
      }

      const publicUrl = supabase.storage
        .from("vendor-files")
        .getPublicUrl(filePath).data.publicUrl;

      uploadedUrls.push(publicUrl);
    }

    const updatedMedia = [...mediaFiles, ...uploadedUrls];

    const { error: dbError } = await supabase
      .from("vendor_register")
      .update({ media_files: updatedMedia })
      .eq("email", vendorEmail);

    if (dbError) {
      console.error(dbError);
      setError("Failed to save images.");
      setUploading(false);
      return;
    }

    setMediaFiles(updatedMedia);
    setFiles([]);
    setUploading(false);
  };

  /* ============================
     DELETE IMAGE
  ============================ */
  const handleDelete = async (url: string) => {
    if (!vendorEmail) return;

    const updated = mediaFiles.filter((f) => f !== url);

    const { error } = await supabase
      .from("vendor_register")
      .update({ media_files: updated })
      .eq("email", vendorEmail);

    if (error) {
      console.error(error);
      setError("Failed to delete image.");
      return;
    }

    setMediaFiles(updated);
  };

  /* ============================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-yellow-500" />
            Media Library
          </h1>
          <p className="text-gray-500 mt-1">
            Upload and manage your service images
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border">
            <AlertCircle />
            {error}
          </div>
        )}

        {/* UPLOAD CARD */}
        <div className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Upload Media
          </h2>

          <div className="border-2 border-dashed rounded-xl p-8 text-center bg-gray-50">
            <CloudUpload className="mx-auto text-gray-400 mb-4" size={40} />

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="mx-auto block text-sm"
            />


            {files.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                {files.length} images selected
              </p>
            )}


            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="mt-6 px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>

        {/* MEDIA GRID */}
        <div className="bg-white rounded-2xl border shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Your Images
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-3" />
              No media uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaFiles.map((url, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden shadow hover:shadow-xl transition"
                >
                  <img
                    src={url}
                    className="w-full h-44 object-cover"
                    alt="Media"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(url)}
                      className="bg-red-600 p-3 rounded-full text-white hover:bg-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
