"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Trash2,
  Edit2,
  Plus,
  X,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

// -------------------- Types --------------------
type Category = {
  id: string;
  name: string;
  description?: string | null;
  locations?: string[] | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  service_count?: number;
};

// -------------------- UI Helpers --------------------
const StatusPill = ({ active }: { active?: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
      active
        ? "bg-white/90 text-emerald-700 ring-1 ring-white/50"
        : "bg-black/60 text-white"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const Tag = ({ text }: { text: string }) => (
  <span className="text-xs px-3 py-1 rounded-full bg-white/90 text-gray-800 font-medium shadow-sm">
    {text}
  </span>
);

// -------------------- Component --------------------
export default function AdminCategoriesUC() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const ITEMS_PER_PAGE = 9;
  const [page, setPage] = useState(1);

  // Search + filter
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Form states (all fully controlled)
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [locationsInput, setLocationsInput] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // -------------------- Load Categories --------------------
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*, services(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((c: any) => ({
        ...c,
        service_count: c.services?.[0]?.count ?? 0,
      }));

      setCategories(mapped);
      setFiltered(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // -------------------- Filters --------------------
  useEffect(() => {
    let list = categories;
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    if (onlyActive) list = list.filter((c) => c.is_active);
    setFiltered(list);
    setPage(1);
  }, [search, onlyActive, categories]);

  // -------------------- Image --------------------
  function handleImageChange(file: File) {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: any) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  }

  // -------------------- Modal Open --------------------
  function openAddModal() {
    setEditing(null);
    setName("");
    setDescription("");
    setLocationsInput("");
    setIsActive(true);
    setPreview(null);
    setImageFile(null);
    setShowModal(true);
  }

  function openEditModal(cat: Category) {
    setEditing(cat);
    setName(cat.name ?? "");
    setDescription(cat.description ?? "");
    setLocationsInput((cat.locations || []).join(", "));
    setIsActive(!!cat.is_active);
    setPreview(cat.image_url ? String(cat.image_url) : null);
    setImageFile(null);
    setShowModal(true);
  }

  // -------------------- Save Category --------------------
  function parseLocations(text: string) {
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  }

  async function uploadImage(catId: string) {
    if (!imageFile) return preview;

    const ext = imageFile.name.split(".").pop();
    const filePath = `${catId}.${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("category-images")
      .upload(filePath, imageFile, { upsert: true });

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = supabase.storage
      .from("category-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveCategory() {
    if (!name.trim()) return alert("Category name required.");
    setSaving(true);

    const payloadBase = {
      name,
      description,
      locations: parseLocations(locationsInput),
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    try {
      let catId = editing?.id;

      if (!editing) {
        const { data, error } = await supabase
          .from("categories")
          .insert([payloadBase])
          .select("id")
          .single();

        if (error) throw error;
        catId = data.id;
      }

      const imageUrl = imageFile ? await uploadImage(catId!) : preview;

      const payload = { ...payloadBase, image_url: imageUrl };

      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", catId!);

      if (error) throw error;

      await fetchCategories();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  // -------------------- Delete --------------------
  async function deleteCategory(id: string) {
    if (!confirm("Delete this category permanently?")) return;
    setDeletingId(id);
    try {
      await supabase.from("categories").delete().eq("id", id);
      fetchCategories();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  }

  // -------------------- Pagination --------------------
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <div className="rounded-2xl overflow-hidden mb-8 relative">
          <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-8 sm:p-12 text-white">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold">
                  Categories Management
                </h1>
                <p className="mt-1 text-sm opacity-90 max-w-xl">
                  Manage categories, images, locations & status.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 shadow-sm">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-gray-800"  // Already has text-gray-800, so this one is fine
                  />
                </div>

                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-white text-pink-600 font-semibold px-4 py-2 rounded-full shadow hover:scale-[1.02] transition-transform"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>
            </div>
          </div>

          {/* FILTER ROW */}
          <div className="bg-white px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!onlyActive}
                onChange={() => setOnlyActive((s) => !s)}
              />
              Only Active
            </label>
            <div className="text-sm text-gray-600">
              Showing <b>{filtered.length}</b>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full p-12 text-center text-gray-500">
              Loading...
            </div>
          ) : paginated.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500">
              No categories found.
            </div>
          ) : (
            paginated.map((cat) => (
              <article
                key={cat.id}
                className="rounded-2xl overflow-hidden bg-white shadow-lg hover:-translate-y-2 transition-all"
              >
                <div className="relative h-56 bg-gray-100">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={50} />
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <StatusPill active={cat.is_active} />
                  </div>

                  {/* ACTIONS */}
                  <div className="absolute right-4 top-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      disabled={deletingId === cat.id}
                      className="bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold">{cat.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {cat.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {(cat.locations || []).slice(0, 3).map((l) => (
                        <Tag key={l} text={l} />
                      ))}
                      {(cat.locations || []).length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          Global
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Services</div>
                      <div className="text-lg font-bold">
                        {cat.service_count ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 text-sm text-gray-500">
                  Created:{" "}
                  {cat.created_at
                    ? new Date(cat.created_at).toLocaleDateString()
                    : "—"}
                </div>
              </article>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-full text-sm font-semibold ${
                  page === i + 1
                    ? "bg-gray-900 text-white"
                    : "bg-white border hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* -------------------- MODAL -------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 to-yellow-400 text-white">
              <h3>{editing ? "Edit Category" : "Create Category"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-white/20 p-1 rounded-full"
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCategory();
              }}
              className="p-6 space-y-4"
            >
              {/* IMAGE UPLOAD */}
              <label className="text-sm text-gray-700 font-semibold">
                Image
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("fileInput")?.click()
                }
                className="h-44 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={36} className="mx-auto" />
                    <p className="text-sm mt-2">Click or drop image</p>
                  </div>
                )}

                {/* FILE INPUT (always uncontrolled = correct) */}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleImageChange(e.target.files[0])
                  }
                />
              </div>

              {/* NAME */}
              <div>
                <label className="font-semibold text-sm text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name ?? ""}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-200 text-gray-900"  // Added text-gray-900
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="font-semibold text-sm text-gray-700">
                  Description
                </label>
                <textarea
                  value={description ?? ""}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-200 resize-none text-gray-900"  // Added text-gray-900
                />
              </div>

              {/* LOCATIONS */}
              <div>
                <label className="font-semibold text-sm text-gray-700">
                  Locations
                </label>
                <input
                  value={locationsInput ?? ""}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  placeholder="Bangalore, Delhi"
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-200 text-gray-900"  // Added text-gray-900
                />
              </div>

                          {/* IS ACTIVE */}
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={!!isActive}
                  onChange={() => setIsActive((s) => !s)}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active Category
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-1.5 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-lg shadow"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
