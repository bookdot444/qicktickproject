// app/admin/services/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Trash2,
  Edit2,
  Plus,
  X,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Admin Services Page
 * - List services (with category name)
 * - Create / Edit / Delete single service
 * - Bulk select & Delete
 * - Small modal popup for create/edit
 * - Search + pagination
 *
 * Notes:
 * - services table expected columns: id (uuid), category_id (uuid), name (text), description (text), created_at, updated_at
 * - categories table expected columns: id (uuid), name (text)
 */

type Service = {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  category?: { id: string; name: string } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Category = { id: string; name: string };

export default function AdminServicesPage() {
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // UI: search, pagination
  const [search, setSearch] = useState("");
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Selection & bulk
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedCount = Object.values(selected).filter(Boolean).length;

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState<string | "">("");

  // UI states
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // Fetch categories (for dropdown)
  async function fetchCategories() {
    const { data, error } = await supabase
      .from<Category>("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error);
      return;
    }
    setCategories(data || []);
  }

  // Fetch services (join category to show name)
  async function fetchServices() {
    setLoading(true);
    // Select service fields + category (via foreign key join)
    const { data, error } = await supabase
      .from("services")
      .select("id, name, description, category_id, created_at, updated_at, categories(id, name)")
      .order("created_at", { ascending: false });

    setLoading(false);
    if (error) {
      console.error("Failed to fetch services:", error);
      return;
    }

    // Map category from returned `categories` property (if present)
    const mapped: Service[] = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category_id: s.category_id,
      category: s.categories ? { id: s.categories.id, name: s.categories.name } : null,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    setServices(mapped);
    // reset page & selection
    setPage(1);
    setSelected({});
  }

  // --- Helpers for selection ---
  function toggleSelect(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function selectAllOnPage(currentPageServices: Service[]) {
    const newSel: Record<string, boolean> = { ...selected };
    currentPageServices.forEach((s) => (newSel[s.id] = true));
    setSelected(newSel);
  }
  function clearSelection() {
    setSelected({});
  }

  // --- Filtering & pagination ---
  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  // --- Modal: open add/edit ---
  function openAddModal() {
    setEditing(null);
    setFormName("");
    setFormDesc("");
    setFormCategory("");
    setShowModal(true);
    // smaller modal is handled via styling
  }
  function openEditModal(service: Service) {
    setEditing(service);
    setFormName(service.name);
    setFormDesc(service.description || "");
    setFormCategory(service.category_id || "");
    setShowModal(true);
  }

  // --- Save service (create or update) ---
  async function saveService(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!formName.trim()) {
      alert("Service name is required.");
      return;
    }
    setSaving(true);

    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || null,
      category_id: formCategory || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("services").insert([payload]).select("id").single();
        if (error) throw error;
      }

      await fetchServices();
      setShowModal(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  }

  // --- Delete single service ---
  async function deleteService(id: string) {
    if (!confirm("Delete this service? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      await fetchServices();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check console.");
    } finally {
      setDeletingId(null);
    }
  }

  // --- Bulk delete ---
  async function bulkDelete() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([id]) => id);
    if (ids.length === 0) {
      alert("No services selected.");
      return;
    }
    if (!confirm(`Delete ${ids.length} selected service(s)? This cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      const { error } = await supabase.from("services").delete().in("id", ids);
      if (error) throw error;
      // clear selection and refresh list
      clearSelection();
      await fetchServices();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Bulk delete failed — check console.");
    } finally {
      setBulkDeleting(false);
    }
  }

  // --- Small helper to get category name quickly ---
  function catName(catId?: string | null) {
    if (!catId) return "—";
    const c = categories.find((x) => x.id === catId);
    return c ? c.name : "Unknown";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Services</h1>
            <p className="text-sm text-gray-500 mt-1">Manage services offered in categories.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAllOnPage(paginated)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-100"
                title="Select all on this page"
              >
                Select page
              </button>

              <button
                onClick={clearSelection}
                className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-100"
                title="Clear selection"
              >
                Clear
              </button>

              <button
                disabled={selectedCount === 0 || bulkDeleting}
                onClick={bulkDelete}
                className={`px-3 py-2 rounded-md text-sm font-semibold ${
                  selectedCount === 0
                    ? "bg-red-200 text-red-700 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title="Delete selected"
              >
                {bulkDeleting ? "Deleting..." : `Delete (${selectedCount})`}
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="ml-2 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md shadow"
            >
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md w-full sm:max-w-md">
            <Search size={18} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, descriptions or categories…"
              className="w-full outline-none text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Table / Cards */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={
                        paginated.length > 0 &&
                        paginated.every((s) => selected[s.id])
                      }
                      onChange={(e) =>
                        e.target.checked
                          ? selectAllOnPage(paginated)
                          : clearSelection()
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[s.id]}
                          onChange={() => toggleSelect(s.id)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">{s.category?.name ?? catName(s.category_id)}</div>
                      </td>

                      <td className="px-4 py-3 max-w-[40ch]">
                        <div className="text-sm text-gray-600 truncate">{s.description ?? "—"}</div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                      </td>

                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 bg-yellow-100 rounded-md hover:bg-yellow-200"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => deleteService(s.id)}
                          disabled={deletingId === s.id}
                          className={`p-2 rounded-md ${
                            deletingId === s.id ? "bg-red-200 text-red-700" : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 bg-white">
            <div className="text-sm text-gray-600">
              Showing {(start + 1)}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-md border border-gray-200 bg-white disabled:opacity-50"
                title="Previous"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-sm text-gray-700 px-3">{page} / {totalPages}</div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-md border border-gray-200 bg-white disabled:opacity-50"
                title="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Small modal popup (compact) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-900 text-white">
              <h3 className="text-lg font-semibold">{editing ? "Edit Service" : "Create Service"}</h3>
              <button onClick={() => setShowModal(false)} aria-label="Close" className="p-1 rounded hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveService(); }} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                  placeholder="e.g., AC Repair"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none text-gray-900"
                >
                  <option value="">-- Select category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none resize-none text-gray-900"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  {saving ? "Saving..." : (editing ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
