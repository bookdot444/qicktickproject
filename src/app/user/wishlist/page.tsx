"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Tag, 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("user_wishlist")
        .select(`
          id,
          product:vendor_products (*)
        `)
        .eq("user_id", user.id);

      setWishlist(data || []);
    }
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("user_wishlist")
      .delete()
      .eq("id", id);

    if (!error) {
      setWishlist((prev) => prev.filter((i) => i.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ">Syncing Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 selection:bg-yellow-200">
      
      {/* --- REFINED HEADER --- */}
      <header className="bg-gradient-to-b from-yellow-100/60 to-[#FFFDF5] pt-20 pb-16 px-6">
        <div className="max-w-8xl mx-auto">
          <Link href="/user/listing" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all mb-8">
            <ArrowLeft size={14} /> Continue Browsing
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[1px] w-8 bg-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600">Private Collection</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none ">
                Wishlist <span className="text-yellow-500 ">Vault</span>
              </h1>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                {wishlist.length} Items curated for your style
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-md border border-yellow-100 px-6 py-4 rounded-2xl hidden md:block shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Collection Value</p>
              <p className="text-xl font-black">₹{wishlist.reduce((acc, curr) => acc + Number(curr.product?.price || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENT SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 -mt-6">
        
        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-yellow-100 rounded-[2rem] py-24 text-center"
          >
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={24} className="text-yellow-300" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Your vault is empty</h3>
            <p className="text-gray-400 mt-2 text-xs font-bold uppercase tracking-widest">Add items to see them here</p>
            <Link href="/user/listing" className="mt-8 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all">
              Discover Products <ChevronRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center gap-5 hover:shadow-xl hover:border-yellow-200 transition-all duration-500 group"
                >
                  {/* IMAGE - Sleeker Ratio */}
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                    <img
                      src={item.product?.product_image?.split("|||")[0]}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                  </div>

                  {/* INFO - Cleaner Typography */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={10} className="text-yellow-500" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">
                        {item.product?.category || "Essential"}
                      </span>
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-tight leading-tight truncate">
                      {item.product?.product_name}
                    </h2>
                    <p className="text-xl font-black mt-2 text-slate-900">
                      ₹{Number(item.product?.price).toLocaleString()}
                    </p>
                  </div>

                  {/* ACTION CONTROLS - Minimalist */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/user/products/${item.product?.id}`}
                      className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl hover:bg-yellow-500 transition-all active:scale-90"
                      title="View Product"
                    >
                      <ArrowRight size={18} />
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 border border-gray-100 text-gray-300 flex items-center justify-center rounded-xl hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 mt-16 text-center">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-100 to-transparent mb-8" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-300">
          Curated with intent • Secure Vault
        </p>
      </footer>
    </div>
  );
}