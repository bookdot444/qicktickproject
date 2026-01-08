"use client";

import React, { useEffect, useState, ChangeEvent, useMemo, useRef } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UploadCloud, Link, Film, Package, PlusCircle,
  PackagePlus, Trash2, Pencil, ExternalLink,
  Loader, LayoutGrid, Share2, ArrowLeft, Zap,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  product_name: string;
  price: number;
  description: string;
  category_id: string;
  is_active: boolean;
  product_image: string;
  product_video?: string;
  created_at: string;
}

type ProductImageSliderProps = {
  images: string[];
  isActive: boolean;
};

const ProductImageSlider: React.FC<ProductImageSliderProps> = ({ images, isActive }) => {
  const [index, setIndex] = useState(0);

  // --- FIX: Guard against empty or invalid image arrays ---
  if (!images || images.length === 0 || images[0] === "") {
    return (
      <div className="relative bg-gray-200 aspect-[4/3] flex items-center justify-center">
        <Package className="text-gray-400" size={40} />
        <div className={`absolute top-5 left-5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-30 shadow-lg ${isActive ? "bg-yellow-400 text-black" : "bg-red-500 text-white"}`}>
          {isActive ? "Active" : "Draft"}
        </div>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
      <img 
        src={images[index]} 
        className="w-full h-full object-cover transition-all duration-500" 
        alt="Product preview" 
      />
      
      <div className={`absolute top-5 left-5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-30 shadow-lg ${isActive ? "bg-yellow-400 text-black" : "bg-red-500 text-white"}`}>
        {isActive ? "Active" : "Draft"}
      </div>

      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-yellow-400 hover:scale-110 transition-all text-black">
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <button type="button" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-yellow-400 hover:scale-110 transition-all text-black">
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
};
export default function VendorInventoryStudio() {
  // --- States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingProductNames, setExistingProductNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Media States
  const [images, setImages] = useState<string[]>([]); // This holds preview URLs or existing HTTP URLs
  const [fileObjects, setFileObjects] = useState<File[]>([]); // NEW: Holds the actual files for upload
  const [videoData, setVideoData] = useState<string>("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    product_name: '',
    price: '',
    description: '',
    category_id: '',
    is_active: true
  });

  const mediaScrollRef = useRef<HTMLDivElement | null>(null);

  const isDuplicateProduct = useMemo(() => {
    if (!formData.product_name.trim() || editingId) return false;
    return existingProductNames.includes(formData.product_name.trim().toLowerCase());
  }, [formData.product_name, existingProductNames, editingId]);

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    setFetching(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setFetching(false);
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name', { ascending: true });
    if (data) setCategories(data);
  }

  async function fetchProducts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('vendor_products').select('*').order('created_at', { ascending: false });
    if (data) {
      setProducts(data);
      setExistingProductNames(data.map((p: any) => p.product_name.toLowerCase()));
    }
  }

  // --- HANDLERS ---

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Store the actual file objects for later uploading
      setFileObjects(prev => [...prev, ...filesArray]);

      // Create temporary preview URLs for the UI
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...previewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // If it's a blob (newly added), we should ideally track its index in fileObjects too
    // For simplicity, we just filter the images state. 
    // Logic: if index corresponds to a fileObject, remove it there too.
    const imageToRemove = images[index];
    if (imageToRemove.startsWith('blob:')) {
      // Find which file object this blob belongs to (based on order added)
      const blobCountBefore = images.slice(0, index).filter(img => img.startsWith('blob:')).length;
      setFileObjects(prev => prev.filter((_, i) => i !== blobCountBefore));
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const scrollMedia = (direction: "left" | "right") => {
    if (!mediaScrollRef.current) return;
    mediaScrollRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ product_name: '', price: '', description: '', category_id: '', is_active: true });
    setImages([]);
    setFileObjects([]);
    setVideoData("");
    setNewCategoryName("");
    setIsOtherSelected(false);
  };

  const startEdit = (item: Product) => {
    setEditingId(item.id);
    setFormData({
      product_name: item.product_name,
      price: item.price.toString(),
      description: item.description || '',
      category_id: item.category_id,
      is_active: item.is_active
    });
    setImages(item.product_image ? item.product_image.split('|||') : []);
    setFileObjects([]); // Clear new files since we are starting from existing data
    setVideoData(item.product_video || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this product from inventory permanently?")) return;
    const { error } = await supabase.from('vendor_products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const handleShare = async (item: Product) => {
    const shareUrl = `${window.location.origin}/product/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.product_name, text: `Check out ${item.product_name}!`, url: shareUrl });
      } catch (err) { console.log("Share failed", err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicateProduct || loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendorRecord } = await supabase.from('vendor_register').select('id').eq('user_id', user?.id).single();

      if (!vendorRecord) throw new Error("Vendor profile not found");

      // --- STEP 1: UPLOAD NEW FILES TO STORAGE ---
      const uploadedUrls = await Promise.all(
        fileObjects.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${vendorRecord.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          return data.publicUrl;
        })
      );

      // Combine existing HTTP images (keep them) with newly uploaded URLs
      const existingUrls = images.filter(img => img.startsWith('http'));
      const finalImageString = [...existingUrls, ...uploadedUrls].join('|||');

      // --- STEP 2: CATEGORY LOGIC ---
      let finalCatId = formData.category_id;
      if (isOtherSelected) {
        const { data: newCat } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), is_active: true }]).select().single();
        if (newCat) finalCatId = newCat.id;
      }

      // --- STEP 3: PAYLOAD & DB ACTION ---
      const productPayload = {
        product_name: formData.product_name.trim(),
        price: parseFloat(formData.price),
        description: formData.description,
        category_id: finalCatId,
        is_active: formData.is_active,
        product_image: finalImageString,
        product_video: videoData,
        vendor_id: vendorRecord.id
      };

      if (editingId) {
        const { error } = await supabase.from('vendor_products').update(productPayload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vendor_products').insert([productPayload]);
        if (error) throw error;
      }

      resetForm();
      fetchInitialData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pb-20 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-20 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase">
              Inventory <br /> <span className="text-red-600 italic">Studio</span>
            </motion.h1>
          </div>
          <motion.div initial={{ opacity: 0, rotate: 0, scale: 0.9 }} animate={{ opacity: 1, rotate: 3, scale: 1 }} className="hidden lg:block bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-yellow-100 relative">
            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="text-yellow-600">
              <PackagePlus size={60} strokeWidth={2.5} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- CREATE / EDIT FORM --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-200">
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    {editingId ? <Pencil size={24} /> : <PlusCircle size={24} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black">{editingId ? 'Edit Listing' : 'New Listing'}</h2>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Product Details & Media</p>
                  </div>
                </div>
                {editingId && <button onClick={resetForm} className="text-xs font-black text-red-400 bg-red-100 px-3 py-1 rounded-full">Cancel</button>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Product Title *</label>
                  <input required className={`w-full bg-gray-50 border ${isDuplicateProduct ? 'border-red-400' : 'border-gray-300'} rounded-2xl p-4 font-bold outline-none text-black`} value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} placeholder="e.g. Rolex Datejust 41" />
                  {isDuplicateProduct && <p className="text-[10px] text-red-400 font-bold italic">Title already exists</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Price (₹) *</label>
                    <input type="number" required className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 font-black outline-none text-black" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Category *</label>
                    <select required className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-4 font-bold text-black" value={formData.category_id} onChange={(e) => { setFormData({ ...formData, category_id: e.target.value }); setIsOtherSelected(e.target.value === "other"); }}>
                      <option value="">Select...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      <option value="other" className="text-red-400 font-black">+ Create New</option>
                    </select>
                  </div>
                </div>

                {isOtherSelected && (
                  <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full bg-yellow-100 border border-yellow-400 rounded-2xl p-4 font-bold text-black" placeholder="New category name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Description</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-5 font-bold outline-none text-sm text-black resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Features, condition, etc..." />
                </div>

                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Media Assets</span>
                    {images.length > 2 && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => scrollMedia("left")} className="w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition text-black"><ChevronLeft size={14} /></button>
                        <button type="button" onClick={() => scrollMedia("right")} className="w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition text-black"><ChevronRight size={14} /></button>
                      </div>
                    )}
                  </div>
                  <div className="w-full overflow-hidden">
                    <div ref={mediaScrollRef} className="flex flex-nowrap gap-3 overflow-x-auto pb-3 scroll-smooth custom-scrollbar">
                      {images.map((img, i) => (
                        <div key={i} className="min-w-[80px] h-[80px] rounded-2xl relative overflow-hidden ring-2 ring-gray-200 shadow">
                          <img src={img} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={10} /></button>
                        </div>
                      ))}
                      <label className="min-w-[80px] h-[80px] bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:border-red-500 cursor-pointer transition">
                        <UploadCloud size={20} />
                        <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <button disabled={loading || isDuplicateProduct} className={`w-full ${editingId ? 'bg-yellow-400' : 'bg-red-500'} hover:opacity-90 disabled:bg-gray-200 text-white py-6 rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] text-lg mt-4`}>
                  {loading ? <Loader className="animate-spin" /> : editingId ? "Update Listing" : "Publish to Catalog"}
                </button>
              </form>
            </div>
          </motion.div>

          {/* --- LIVE INVENTORY LIST --- */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black flex items-center gap-3 text-black">
                <LayoutGrid className="text-red-400" size={24} /> Live Catalog
              </h2>
              <div className="bg-white border border-gray-300 px-5 py-2 rounded-full shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-black font-black uppercase tracking-widest">{products.length} Items</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode='popLayout'>
                {fetching ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-gray-200" />)
                ) : products.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-300">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-black font-bold">Your inventory is empty</p>
                  </div>
                ) : (
                  products.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="group bg-white rounded-[2.5rem] border border-gray-200 shadow-sm hover:shadow-2xl transition-all overflow-hidden relative flex flex-col">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                        <ProductImageSlider images={item.product_image.split("|||")} isActive={item.is_active} />
                        <div className="absolute inset-0 bg-red-500/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 z-20">
                          <button onClick={() => startEdit(item)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-yellow-400 transition-all shadow-xl"><Pencil size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-red-500 hover:text-white transition-all shadow-xl"><Trash2 size={18} /></button>
                          <button onClick={() => handleShare(item)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:bg-red-500 hover:text-white transition-all shadow-xl"><Share2 size={18} /></button>
                        </div>
                      </div>
                      <div className="p-7">
                        <h4 className="font-black text-xl text-black truncate mb-4">{item.product_name}</h4>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Price</span>
                            <span className="text-2xl font-black text-red-400">₹{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}