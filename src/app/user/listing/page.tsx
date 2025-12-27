"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ArrowRight,
  Loader2,
  Search,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  useEffect(() => {
    fetchPublicProducts();
  }, []);

  const fetchPublicProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("vendor_products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedProducts = data.map((p) => {
        let imageUrl = null;

        if (p.product_image) {
          const firstPath = p.product_image.split("|||")[0];

          if (firstPath.startsWith("http") || firstPath.startsWith("data:")) {
            imageUrl = firstPath;
          } else {
            const { data: urlData } = supabase.storage
              .from("products")
              .getPublicUrl(firstPath);
            imageUrl = urlData.publicUrl;
          }
        }

        return { ...p, product_image: imageUrl };
      });

      setProducts(processedProducts);
    } catch (err: any) {
      console.error("Public fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };


  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-20 font-sans">
      {/* --- BRAND HERO SECTION --- */}
      <div className="bg-[#D80000] pt-24 pb-44 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700] rounded-full blur-[120px] opacity-10 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-[100px] opacity-20 -ml-24 -mb-24" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 mb-8"
          >
            <ShieldCheck size={16} className="text-[#FFD700]" />
            <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.2em]">Your Personal Catalog</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white"
          >
            Manage <span className="text-[#FFD700]">Inventory</span>
          </motion.h1>

          <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
            Review and manage all items you have currently listed on the marketplace.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        {/* --- SEARCH & STATUS BAR --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-slate-100 mb-16 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input
              type="text"
              placeholder="Filter your products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-4 px-8 py-4 bg-[#D80000]/5 rounded-[2rem] border border-[#D80000]/10 shrink-0">
            <TrendingUp size={20} className="text-[#D80000]" />
            <span className="text-sm font-black uppercase tracking-widest text-[#D80000]">
              {filteredProducts.length} Items Listed
            </span>
          </div>
        </motion.div>

        {/* --- PRODUCTS GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100">
            <Loader2 className="w-12 h-12 animate-spin text-[#D80000]" />
            <p className="mt-4 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Loading Your Items</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image Holder */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package size={40} />
                      </div>
                    )}

                    <div className="absolute top-5 left-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${product.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-slate-800 mb-2">{product.product_name}</h3>
                    <p className="text-slate-400 text-xs font-bold line-clamp-2 mb-6">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest block">Price</span>
                        <p className="text-xl font-black text-slate-900">₹{Number(product.price).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/vendor/view/${product.vendor_id}`)}
                        className="relative z-10 flex items-center justify-center
             w-11 h-11 rounded-xl
             bg-slate-200 text-slate-900
             shadow-md
             hover:bg-[#D80000] hover:text-white
             transition-all duration-300"
                      >
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                      </button>

                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty Result State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm">
            <Package size={40} className="text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800">No Items Found</h2>
            <p className="text-slate-400 mt-2">Start adding products to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}