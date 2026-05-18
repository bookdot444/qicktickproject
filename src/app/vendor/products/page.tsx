"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UploadCloud, Package, PlusCircle,
  Trash2, Pencil, Loader, LayoutGrid, Eye,
  ChevronLeft, ChevronRight, Film,
  Building2, User, Landmark, CreditCard, Wallet, Hash,
  Tag, Info, Shirt, ShoppingBag, Calendar, ListPlus, Sparkles
} from "lucide-react";

// --- Interfaces ---
interface Category { id: string; name: string; }
interface ProductFeature {
  header: string;
  description: string;
}

interface Product {
  id: string;
  product_name: string;
  price: number;
  description: string;
  category_id: string;
  is_active: boolean;
  product_image: string;
  material?: string;
  care_instructions?: string;
  tags?: string;
  features: ProductFeature[];
  created_at: string;
}

const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext) || url.startsWith('data:video') || url.startsWith('blob:video'));
};

// --- Components ---

const ProductMediaSlider: React.FC<{ urls: string[]; isActive?: boolean; className?: string }> = ({ urls, className }) => {
  const [index, setIndex] = useState(0);
  if (!urls || urls.length === 0 || urls[0] === "") {
    return (
      <div className={`relative bg-gray-100 flex items-center justify-center ${className || 'aspect-square'}`}>
        <Package className="text-gray-300" size={48} />
      </div>
    );
  }
  const currentUrl = urls[index];
  const currentIsVideo = isVideo(currentUrl);

  return (
    <div className={`relative overflow-hidden bg-black flex items-center justify-center ${className || 'aspect-square'}`}>
      {currentIsVideo ? (
        <video src={currentUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <img src={currentUrl} className="w-full h-full object-cover" alt="Product" />
      )}
      {currentIsVideo && (
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md p-1.5 rounded-lg z-10">
          <Film size={14} className="text-white" />
        </div>
      )}
      {urls.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none z-20">
          <button type="button" onClick={(e) => { e.stopPropagation(); setIndex(i => i === 0 ? urls.length - 1 : i - 1); }} className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"><ChevronLeft size={20} className="text-black" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIndex(i => i === urls.length - 1 ? 0 : i + 1); }} className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"><ChevronRight size={20} className="text-black" /></button>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {urls.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
};

export default function VendorInventoryStudio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bank_name: '', holder_name: '', account_number: '', ifsc_code: '', branch: '', upi_id: ''
  });

  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [productFeatures, setProductFeatures] = useState<ProductFeature[]>([]);
  const [currentFeature, setCurrentFeature] = useState({ header: '', description: '' });

  const [formData, setFormData] = useState({
    product_name: '', price: '', description: '', category_id: '',
    is_active: true, material: '', care_instructions: '', tags: ''
  });

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    setFetching(true);
    const { data: catData } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name');
    if (catData) setCategories(catData);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: vendorRecord } = await supabase.from('vendor_register').select('id').eq('user_id', user.id).single();
      if (vendorRecord) {
        const { data: bankData } = await supabase.from('vendor_bank').select('*').eq('vendor_id', vendorRecord.id).single();
        if (bankData) setBankDetails(bankData);

        const { data: prodData } = await supabase.from('vendor_products').select('*').eq('vendor_id', vendorRecord.id).order('created_at', { ascending: false });
        if (prodData) setProducts(prodData);
      }
    }
    setFetching(false);
  }

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFileObjects(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setFileObjects(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (currentFeature.header.trim() && currentFeature.description.trim()) {
      setProductFeatures([...productFeatures, currentFeature]);
      setCurrentFeature({ header: '', description: '' });
    }
  };

  const removeFeature = (index: number) => {
    setProductFeatures(productFeatures.filter((_, i) => i !== index));
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendorRecord } = await supabase.from('vendor_register').select('id').eq('user_id', user?.id).single();
      const { error } = await supabase.from('vendor_bank').upsert({ vendor_id: vendorRecord?.id, ...bankDetails, updated_at: new Date().toISOString() }, { onConflict: 'vendor_id' });
      if (error) throw error;
      setShowBankModal(false);
      fetchInitialData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendorRecord } = await supabase.from('vendor_register').select('id').eq('user_id', user?.id).single();

      const uploadedUrls = await Promise.all(
        fileObjects.map(async (file) => {
          const filePath = `${vendorRecord?.id}/${Date.now()}-${file.name}`;
          await supabase.storage.from('product-images').upload(filePath, file);
          return supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
        })
      );

      const finalMediaString = [...mediaPreviews.filter(url => url.startsWith('http')), ...uploadedUrls].join('|||');
      let catId = formData.category_id;
      if (isOtherSelected) {
        const { data: newCat } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), is_active: true }]).select().single();
        catId = newCat?.id;
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        product_image: finalMediaString,
        vendor_id: vendorRecord?.id,
        category_id: catId,
        features: productFeatures
      };

      if (editingId) await supabase.from('vendor_products').update(payload).eq('id', editingId);
      else await supabase.from('vendor_products').insert([payload]);

      setFormData({ product_name: '', price: '', description: '', category_id: '', is_active: true, material: '', care_instructions: '', tags: '' });
      setProductFeatures([]);
      setMediaPreviews([]);
      setFileObjects([]);
      setEditingId(null);
      fetchInitialData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const startEdit = (item: Product) => {
    setEditingId(item.id);
    setFormData({
      product_name: item.product_name,
      price: item.price.toString(),
      description: item.description || '',
      category_id: item.category_id,
      is_active: item.is_active,
      material: item.material || '',
      care_instructions: item.care_instructions || '',
      tags: item.tags || ''
    });
    setProductFeatures(item.features || []);
    setMediaPreviews(item.product_image ? item.product_image.split('|||') : []);
    setFileObjects([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // FORCED LIGHT MODE: Added "bg-white text-gray-900" to the main wrapper
    <div className="min-h-screen bg-white text-gray-900 pb-12 font-sans selection:bg-yellow-200">

      {/* BANK MODAL */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
              <button onClick={() => setShowBankModal(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20} className="text-black" /></button>
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Bank <span className="text-red-600">Details</span></h2>
                <p className="text-gray-400 text-sm font-bold mt-1">For receiving your payments</p>
              </div>
              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div className="relative"><Building2 className="absolute left-4 top-4 text-gray-400" size={18} /><input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="Bank Name" value={bankDetails.bank_name} onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })} /></div>
                <div className="relative"><User className="absolute left-4 top-4 text-gray-400" size={18} /><input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="Account Holder Name" value={bankDetails.holder_name} onChange={e => setBankDetails({ ...bankDetails, holder_name: e.target.value })} /></div>
                <div className="relative"><Hash className="absolute left-4 top-4 text-gray-400" size={18} /><input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="Account Number" value={bankDetails.account_number} onChange={e => setBankDetails({ ...bankDetails, account_number: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="IFSC Code" value={bankDetails.ifsc_code} onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })} />
                  <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="Branch Name" value={bankDetails.branch} onChange={e => setBankDetails({ ...bankDetails, branch: e.target.value })} />
                </div>
                <div className="relative"><Wallet className="absolute left-4 top-4 text-gray-400" size={18} /><input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" placeholder="UPI ID" value={bankDetails.upi_id} onChange={e => setBankDetails({ ...bankDetails, upi_id: e.target.value })} /></div>
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 disabled:bg-gray-300 transition-transform">
                  {loading ? <Loader className="animate-spin mx-auto" size={20} /> : "Save Bank Details"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT VIEW MODAL */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
              <button onClick={() => setViewingProduct(null)} className="absolute top-6 right-6 z-30 p-3 bg-white/90 backdrop-blur shadow-lg rounded-full hover:scale-110 transition-transform"><X size={24} className="text-black" /></button>

              <div className="w-full md:w-1/2 bg-gray-100">
                <ProductMediaSlider urls={viewingProduct.product_image.split('|||')} className="h-full aspect-auto min-h-[400px]" />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white text-black">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {categories.find(c => c.id === viewingProduct.category_id)?.name || 'Product'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${viewingProduct.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {viewingProduct.is_active ? 'In Stock' : 'Inactive'}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter text-gray-900">{viewingProduct.product_name}</h2>
                  <p className="text-5xl font-black text-red-600">₹{viewingProduct.price.toLocaleString()}</p>

                  <div className="h-px bg-gray-100 w-full" />

                  <div className="space-y-4">
                    <p className="text-gray-500 font-medium leading-relaxed">{viewingProduct.description}</p>

                    {viewingProduct.features && viewingProduct.features.length > 0 && (
                      <div className="pt-4 space-y-4">
                        <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 tracking-widest"><Sparkles size={14} className="text-yellow-500" /> Key Features</p>
                        <div className="grid grid-cols-1 gap-3">
                          {viewingProduct.features.map((f, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <h4 className="font-black text-xs uppercase text-gray-900 mb-1">{f.header}</h4>
                              <p className="text-sm text-red-600 font-bold">{f.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {viewingProduct.tags && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {viewingProduct.tags.split(',').map((tag, i) => (
                        <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 italic">#{tag.trim()}</span>
                      ))}
                    </div>
                  )}

                  <div className="pt-8">
                    <button onClick={() => { setViewingProduct(null); startEdit(viewingProduct); }} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
                      <Pencil size={18} /> Edit this listing
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <div className="bg-[#FEF3C7] pt-10 pb-32 px-6 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto flex justify-end mb-8">
          <button onClick={() => setShowBankModal(true)} className="flex items-center gap-3 bg-white border border-yellow-200 px-6 py-3 rounded-full font-black text-xs uppercase text-black hover:bg-yellow-400 transition-all shadow-sm">
            <Landmark size={16} className="text-yellow-600" />
            {bankDetails.bank_name ? "Edit Bank Details" : "Add Bank Details"}
          </button>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black">
            Inventory <span className="text-red-600">Studio</span>
          </h1>

          {bankDetails.bank_name && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { label: 'Bank', val: bankDetails.bank_name, icon: <Building2 size={12} /> },
                { label: 'A/C No', val: bankDetails.account_number, icon: <Hash size={12} /> },
                { label: 'IFSC', val: bankDetails.ifsc_code, icon: <CreditCard size={12} /> },
                { label: 'UPI', val: bankDetails.upi_id, icon: <Wallet size={12} /> }
              ].map((item, idx) => (
                <div key={idx} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-yellow-100 flex items-center gap-2">
                  <span className="text-yellow-600">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase text-gray-400">{item.label}:</span>
                  <span className="text-xs font-bold text-gray-900">{item.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 space-y-6">
              <h2 className="font-black text-xl flex items-center gap-3 uppercase tracking-tight text-black">
                {editingId ? <Pencil className="text-yellow-500" size={24} /> : <PlusCircle className="text-red-500" size={24} />}
                {editingId ? 'Edit Product' : 'New Listing'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-2">General Info</p>
                  <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} placeholder="Product Name" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none focus:ring-2 ring-yellow-400" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price (₹)" />
                    <select required className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none" value={formData.category_id} onChange={(e) => { setFormData({ ...formData, category_id: e.target.value }); setIsOtherSelected(e.target.value === "other"); }}>
                      <option value="">Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      <option value="other">+ New Category</option>
                    </select>
                  </div>
                  {isOtherSelected && <input className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 font-bold text-black" placeholder="New Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />}
                  <textarea rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-black outline-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description..." />
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-2">Product Features (JSON)</p>
                  <div className="p-4 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-3">
                    <div className="space-y-2">
                      <input className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-black" placeholder="Feature Header (e.g. Color)" value={currentFeature.header} onChange={e => setCurrentFeature({ ...currentFeature, header: e.target.value })} />
                      <input className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-red-600" placeholder="Short Description (e.g. Crimson Red)" value={currentFeature.description} onChange={e => setCurrentFeature({ ...currentFeature, description: e.target.value })} />
                      <button type="button" onClick={addFeature} className="w-full py-2 bg-yellow-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <ListPlus size={14} /> Add Feature
                      </button>
                    </div>

                    {productFeatures.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {productFeatures.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-400">{f.header}</p>
                              <p className="text-xs font-bold text-red-600">{f.description}</p>
                            </div>
                            <button type="button" onClick={() => removeFeature(i)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>


                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center ml-2">
                    <p className="text-[10px] font-black uppercase text-gray-400">Media</p>
                    <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-500">{mediaPreviews.length} Files</span>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-yellow-400 transition-colors">
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <UploadCloud size={32} className="text-gray-400 mb-2" />
                      <span className="text-[10px] font-black uppercase text-gray-500">Add Photos/Videos</span>
                      <input type="file" multiple className="hidden" onChange={handleMediaChange} accept="image/*,video/*" />
                    </label>
                  </div>

                  <AnimatePresence>
                    {mediaPreviews.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mt-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        {mediaPreviews.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
                            {isVideo(url) ? <video src={url} className="w-full h-full object-cover" muted /> : <img src={url} className="w-full h-full object-cover" alt="Preview" />}
                            <button type="button" onClick={() => removeMedia(idx)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button disabled={loading} className="w-full py-5 rounded-[1.5rem] font-black text-white bg-black shadow-xl active:scale-95 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader className="animate-spin" /> : editingId ? "Save Changes" : "Publish to Store"}
                </button>
              </form>
            </div>
          </div>

          {/* Catalog */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between py-4">
              <h2 className="font-black text-2xl flex items-center gap-3 tracking-tighter uppercase text-black"><LayoutGrid size={24} className="text-red-500" /> My Collection</h2>
              <span className="bg-black text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-lg uppercase tracking-widest">{products.length} Items</span>
            </div>

            {fetching ? (
              <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center border border-gray-100">
                <Loader className="animate-spin text-red-500 mb-4" size={40} />
                <p className="font-black uppercase tracking-widest text-gray-400 text-xs">Loading Catalog...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((item) => (
  <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
    <div className={`relative ${!item.is_active ? "opacity-40 grayscale" : ""}`}>
      <ProductMediaSlider urls={item.product_image.split("|||")} isActive={item.is_active} />

      {!item.is_active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-widest">
            Disabled
          </span>
        </div>
      )}

      {/* CHANGED: Removed opacity-0 and group-hover:opacity-100 so buttons are always visible */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={() => setViewingProduct(item)} className="p-3 bg-white text-black rounded-full shadow-xl hover:bg-black hover:text-white transition-colors">
          <Eye size={18} />
        </button>

        <button onClick={() => startEdit(item)} className="p-3 bg-white text-yellow-600 rounded-full shadow-xl hover:bg-yellow-500 hover:text-white transition-colors">
          <Pencil size={18} />
        </button>

        <button onClick={() => {
          if (confirm("Delete this listing?"))
            supabase.from('vendor_products').delete().eq('id', item.id).then(() => fetchInitialData())
        }} className="p-3 bg-white text-red-600 rounded-full shadow-xl hover:bg-red-600 hover:text-white transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
    <div className="p-7 text-black">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{categories.find(c => c.id === item.category_id)?.name || 'Default'}</p>
          <h3 className="font-black text-xl truncate uppercase tracking-tight text-gray-900">{item.product_name}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{item.price.toLocaleString()}</p>
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
          {item.is_active ? 'Active' : 'Hidden'}
        </div>
      </div>
    </div>
  </div>
))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}