"use client";

import { useEffect, useState, useCallback } from "react";
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
  Hash,
  MapPin,
  Briefcase
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VendorProductsPage() {
  // 1. Local UI States for Inputs
  const [findInput, setFindInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Optimized Fetch Logic
  // This function is called on initial load AND when the "Update Search" button is clicked
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Start the query with a join to vendor_register to allow filtering by city/type
      let query = supabase
        .from("vendor_products")
        .select(`
          id,
          product_name,
          description,
          price,
          product_image,
          vendor_id,
          created_at,
          vendor:vendor_register!inner(company_name, city, user_type)
        `)
        .eq("is_active", true);

      // Apply Filter: Product Name (Search)
      if (findInput) {
        query = query.ilike("product_name", `%${findInput}%`);
      }

      // Apply Filter: City
      if (cityInput) {
        query = query.ilike("vendor_register.city", `%${cityInput}%`);
      }

      // Apply Filter: User Type (Manufacturer/Retailer etc)
      if (typeInput) {
        query = query.contains("vendor_register.user_type", [typeInput]);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Image Path Processing
      const processedProducts = (data || []).map((p) => {
        let imageUrl: string | null = null;
        if (p.product_image) {
          const firstPath = p.product_image.split("|||")[0];
          if (firstPath.startsWith("http") || firstPath.startsWith("data:")) {
            imageUrl = firstPath;
          } else {
            const { data: urlData } = supabase.storage
              .from("products")
              .getPublicUrl(firstPath);
            imageUrl = urlData?.publicUrl || null;
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
  }, [findInput, cityInput, typeInput]);

  // Initial Load
  useEffect(() => {
    fetchProducts();
  }, []); // Run once on mount

  // 3. Button Handler
  const handleUpdateSearch = () => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans selection:bg-yellow-200">
      
      {/* --- HEADER --- */}
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
          <div className="hidden lg:block bg-white p-10 rounded-[3rem] rotate-3 shadow-2xl border-2 border-yellow-100">
            <Package size={80} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        
        {/* --- DYNAMIC FILTER BAR --- */}
        <div className="bg-black shadow-2xl p-4 md:p-6 rounded-[2.5rem] border border-yellow-500/30 mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            
            {/* Input: Name */}
            <div className="flex-[1.5] w-full flex items-center px-6 py-3 bg-white/10 rounded-2xl border border-white/10 focus-within:border-yellow-500 transition-all">
              <Search size={18} className="text-yellow-500 mr-4" />
              <div className="flex flex-col flex-1">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Product</span>
                <input 
                  value={findInput}
                  onChange={(e) => setFindInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-sm placeholder:text-gray-600"
                  placeholder="What are you looking for?"
                />
              </div>
            </div>

            {/* Input: City */}
            <div className="flex-1 w-full flex items-center px-6 py-3 bg-white/10 rounded-2xl border border-white/10 focus-within:border-red-500 transition-all">
              <MapPin size={18} className="text-red-500 mr-4" />
              <div className="flex flex-col flex-1">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Location</span>
                <input 
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-sm placeholder:text-gray-600"
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>

            {/* Input: Type */}
            <div className="flex-1 w-full flex items-center px-6 py-3 bg-white/10 rounded-2xl border border-white/10 focus-within:border-yellow-500 transition-all">
              <Briefcase size={18} className="text-yellow-500 mr-4" />
              <div className="flex flex-col flex-1">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Vendor Category</span>
                <select 
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="text-black">All Sectors</option>
                  <option value="Manufacturer" className="text-black">Manufacturer</option>
                  <option value="Distributer" className="text-black">Distributor</option>
                  <option value="Retailers" className="text-black">Retailers</option>
                  <option value="Service Sector" className="text-black">Service Sector</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleUpdateSearch}
              className="w-full lg:w-auto bg-yellow-500 hover:bg-white text-black font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              Update Search
            </button>
          </div>
        </div>

        {/* --- GRID & LOADING STATE --- */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-600 mb-4" />
              <p className="font-black uppercase tracking-[0.2em] text-[10px] text-yellow-800">Filtering Inventory...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-8">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-[400px] bg-white rounded-[3rem] border-2 border-transparent hover:border-yellow-400 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group"
                    >
                      <div className="relative h-64 bg-[#FEF3C7]/20 overflow-hidden">
                        {product.product_image ? (
                          <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-yellow-600/30"><Package size={64} /></div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-yellow-100">
                            {product.vendor?.company_name}
                          </span>
                          <span className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest self-start">
                            {product.vendor?.city}
                          </span>
                        </div>
                      </div>

                      <div className="p-10 flex flex-col flex-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-3 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {product.product_name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                          {product.description || "Premium quality catalog item available for immediate order."}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Market Price</span>
                            <p className="text-3xl font-black tracking-tighter text-gray-900">₹{Number(product.price).toLocaleString()}</p>
                          </div>
                          <button className="bg-gray-900 hover:bg-red-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:-rotate-12">
                            <ArrowRight size={24} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {products.length === 0 && (
                <div className="bg-white p-20 rounded-[4rem] border-4 border-dashed border-yellow-100 text-center">
                  <Package size={64} className="text-yellow-200 mx-auto mb-6" />
                  <h2 className="text-4xl font-black tracking-tighter text-yellow-800/40 uppercase">No Items Match</h2>
                  <p className="font-bold text-yellow-700/30 mt-2 uppercase text-xs tracking-[0.3em]">Try broadening your search or location</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- FOOTER --- */}
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
  );
}