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
  Zap,
  Award,
  Hash
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
        .select(`
        id,
        product_name,
        description,
        price,
        product_image,
        vendor_id,
        created_at,
        vendor:vendor_id ( company_name )  -- fetch related vendor
      `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedProducts = (data || []).map((p) => {
        let imageUrl: string | null = null;
        if (p.product_image) {
          const firstPath = p.product_image.split("|||")[0];
          if (firstPath.startsWith("http") || firstPath.startsWith("data:")) {
            imageUrl = firstPath;
          } else {
            const { data: urlData, error } = supabase.storage
              .from("products")
              .getPublicUrl(firstPath);
            if (!error && urlData) imageUrl = urlData.publicUrl;
          }
        }
        return { ...p, product_image: imageUrl };
      });

      setProducts(processedProducts);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };


  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF5]">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mb-4" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-yellow-800">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">

      {/* --- HEADER (Cream/Amber Gradient) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <span className="inline-block px-4 py-1.5 mb-4 bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-sm">
              Marketplace Inventory
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              VENDOR <br />
              <span className="text-red-600">INVENTORY</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-10 rounded-[3rem] rotate-3 shadow-2xl border-2 border-yellow-100 relative">
            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-3 rounded-2xl animate-bounce">
              <Zap size={24} fill="currentColor" />
            </div>
            <Package size={80} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">

        {/* --- SEARCH BAR --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-2xl rounded-[2.5rem] p-4 mb-16 flex flex-col md:flex-row gap-4 border border-yellow-100"
        >
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-600" size={20} />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-[#FEF3C7]/30 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all font-black uppercase text-sm tracking-widest placeholder:text-yellow-800/40"
            />
          </div>
          <div className="bg-gray-900 text-white px-10 py-5 rounded-2xl flex items-center justify-center gap-4">
            <TrendingUp size={20} className="text-yellow-400" />
            <span className="font-black uppercase tracking-widest text-sm">
              {filteredProducts.length} Live Items
            </span>
          </div>
        </motion.div>

        {/* --- PRODUCTS GRID (Centered for 2 items) --- */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-[400px] bg-white rounded-[3rem] border-2 border-transparent hover:border-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group"
              >
                {/* Image Holder */}
                <div className="relative h-64 bg-[#FEF3C7]/20 overflow-hidden">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-yellow-600/30">
                      <Package size={64} />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-yellow-100">
                      {product.vendor?.company_name || "Verified SKU"}
                    </span>

                  </div>
                </div>

                {/* Content */}
                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-3 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {product.product_name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-4 text-black border-t border-gray-100">
                    {product.description || "Premium quality catalog item available for immediate order."}
                  </div>


                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Market Price</span>
                      <p className="text-3xl font-black tracking-tighter text-gray-900">
                        ₹{Number(product.price).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/vendor/view/${product.vendor_id}`)}
                      className="bg-gray-900 hover:bg-red-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:-rotate-12"
                    >
                      <ArrowRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty Result State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-yellow-100 text-center shadow-inner">
            <Package size={64} className="text-yellow-200 mx-auto mb-6" />
            <h2 className="text-4xl font-black tracking-tighter text-yellow-800/40 uppercase">No Items Found</h2>
            <p className="font-bold text-yellow-700/30 mt-2 uppercase text-xs tracking-[0.3em]">Try adjusting your search filters</p>
          </div>
        )}

        {/* --- TRUST FOOTER --- */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
          <TrustCard icon={<ShieldCheck size={20} />} label="Secure" />
          <TrustCard icon={<Hash size={20} />} label="Tracked" />
          <TrustCard icon={<Award size={20} />} label="Verified" />
          <TrustCard icon={<TrendingUp size={20} />} label="Popular" />
        </div>
      </div>
    </div>
  );
}

function TrustCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
      <div className="text-yellow-600">{icon}</div>
      <span className="font-black uppercase tracking-[0.2em] text-[10px]">{label}</span>
    </div>
  )
}