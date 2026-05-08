"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Zap, ArrowRight, Loader2, Search, ShieldCheck,
  TrendingUp, Award, Hash, MapPin, Briefcase, ArrowUpDown,
  Heart, ShoppingCart
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VendorProductsPage() {
  const [findInput, setFindInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  // Pagination
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 40;

  // Check Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("vendor_products")
      .select(`
        id, product_name, description, price, product_image, vendor_id, created_at,
        vendor:vendor_register!inner(company_name, city, user_type)
      `, { count: "exact" })
      .eq("is_active", true);

    if (findInput) query = query.ilike("product_name", `%${findInput}%`);
    if (cityInput) query = query.ilike("vendor.city", `%${cityInput}%`);
    if (typeInput) query = query.contains("vendor.user_type", [typeInput.toLowerCase()]);

    if (sortOrder === "price_low") query = query.order("price", { ascending: true });
    else if (sortOrder === "price_high") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    if (count !== null) setTotalCount(count);

    const processed = (data || []).map((p) => {
      // 1. Split the string into an array of paths
      const allPaths = p.product_image?.split("|||") || [];
      
      // 2. FILTER: Only keep files that are NOT videos
      const imageOnlyPaths = allPaths.filter((path: string) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(path);
        return !isVideo;
      });

      // 3. Convert remaining paths to Public URLs
      const images = imageOnlyPaths.map((path: string) => {
        if (path.startsWith("http")) return path;
        return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
      });

      return { ...p, product_image: images };
    });

    setProducts(processed);
  } finally {
    setLoading(false);
  }
}, [findInput, cityInput, typeInput, sortOrder, page]);


  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ACTION HANDLERS
const handleWishlist = async (productId: string) => {
    if (!user) return alert("Please login!");

    const isAlreadyWishlisted = wishlistIds.includes(productId);

    if (isAlreadyWishlisted) {
      // REMOVE FROM WISHLIST
      const { error } = await supabase
        .from("user_wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (!error) {
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        console.error("Error removing from wishlist:", error);
      }
    } else {
      // ADD TO WISHLIST
      const { error } = await supabase
        .from("user_wishlist")
        .insert({ user_id: user.id, product_id: productId });

      if (!error) {
        setWishlistIds(prev => [...prev, productId]);
      } else {
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) return alert("Please login!");

    const { error } = await supabase
      .from("user_cart")
      .upsert({ user_id: user.id, product_id: productId });

    if (!error) {
      setCartIds(prev => [...prev, productId]);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      // WISHLIST
      const { data: wishlist } = await supabase
        .from("user_wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (wishlist) {
        setWishlistIds(wishlist.map(item => item.product_id));
      }

      // CART
      const { data: cart } = await supabase
        .from("user_cart")
        .select("product_id")
        .eq("user_id", user.id);

      if (cart) {
        setCartIds(cart.map(item => item.product_id));
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-16 font-sans">
      {/* Hero omitted for brevity, keep your original Hero code here */}
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-800 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
              <Zap size={10} fill="currentColor" /> Marketplace Inventory
            </span>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
              VENDOR <span className="text-red-600">INVENTORY</span>
            </h3>
          </div>
          <div className="hidden lg:block bg-white p-8 rounded-[2.5rem] rotate-3 shadow-xl border border-yellow-100">
            <Package size={50} className="text-yellow-600" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <FilterBar
          findInput={findInput} setFindInput={setFindInput}
          cityInput={cityInput} setCityInput={setCityInput}
          typeInput={typeInput} setTypeInput={setTypeInput}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          fetchProducts={() => { setPage(0); fetchProducts(); }}
        />

        {/* Change grid-cols-1 to grid-cols-2 */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWishlist={() => handleWishlist(product.id)}
                onCart={() => handleAddToCart(product.id)}
                isWishlisted={wishlistIds.includes(product.id)}
                isInCart={cartIds.includes(product.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        <Pagination currentPage={page} totalItems={totalCount} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </div>
  );
}
function ProductCard({ product, onWishlist, onCart, isWishlisted, isInCart }: any) {
  return (
    <motion.div layout className="group bg-white rounded-2xl border border-yellow-100 hover:border-yellow-400 shadow-md transition-all overflow-hidden flex flex-col relative">

      {/* WISHLIST BUTTON - TOGGLE DESIGN */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.preventDefault();
          onWishlist();
        }}
        className={`absolute top-3 right-3 z-30 p-2 rounded-full shadow-md border transition-all 
          ${isWishlisted 
            ? "bg-red-500 text-white border-red-500" 
            : "bg-white/90 text-gray-400 hover:text-red-500 border-slate-100"
          }`}
      >
        <Heart 
          size={16} 
          fill={isWishlisted ? "currentColor" : "none"} 
          strokeWidth={isWishlisted ? 0 : 2}
        />
      </motion.button>

      {/* IMAGE SLIDER */}
      <div className="relative h-44 overflow-hidden bg-gray-50">
        {product.product_image?.length > 0 ? (
          <ImageSlider images={product.product_image} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-yellow-200">
            <Package size={40} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">
            {product.vendor?.company_name}
          </span>
          <span className="text-[9px] font-medium text-gray-400">
            {product.vendor?.city}
          </span>
        </div>

        <h3 className="text-sm font-black text-gray-900 mb-1 line-clamp-1">
          {product.product_name}
        </h3>
        <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase">Price</p>
            <p className="text-lg font-black text-gray-900">
              ₹{Number(product.price).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCart}
              className={`px-3 py-2 rounded-xl transition-all active:scale-90 shadow-sm flex items-center gap-1 text-xs font-bold
                ${isInCart ? "bg-green-500 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-black"}`}
            >
              {isInCart ? "✓ Added" : <><ShoppingCart size={16} /> Add</>}
            </button>

            <Link 
              href={`/user/products/${product.id}`} 
              className="bg-gray-900 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all hover:translate-x-1 shadow-md"
            >
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ... Keep existing ImageSlider, FilterBar, LoadingState, Pagination components from previous response ...

function Pagination({ currentPage, totalItems, pageSize, onPageChange }: any) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-12 pb-10">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 bg-white border border-yellow-200 rounded-xl disabled:opacity-20 hover:bg-yellow-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
      >
        <ArrowRight size={14} className="rotate-180" /> Prev
      </button>

      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Page <span className="text-gray-900">{currentPage + 1}</span> of {totalPages}
      </span>

      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 bg-white border border-yellow-200 rounded-xl disabled:opacity-20 hover:bg-yellow-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
      >
        Next <ArrowRight size={14} />
      </button>
    </div>
  );
}

// --- SUB-COMPONENTS (Kept from original) ---

function FilterBar({ findInput, setFindInput, cityInput, setCityInput, typeInput, setTypeInput, sortOrder, setSortOrder, fetchProducts }: any) {
  return (
    <div className="bg-gray-900 shadow-2xl p-3 md:p-4 rounded-[2rem] border border-white/10 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-yellow-500/50 transition-all">
          <Search size={16} className="text-yellow-500 mr-3" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Identify Item</span>
            <input
              value={findInput}
              onChange={(e) => setFindInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-gray-600"
              placeholder="SKU or Name..."
            />
          </div>
        </div>

        <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-red-500/50 transition-all">
          <MapPin size={16} className="text-red-500 mr-3" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Region</span>
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-gray-600"
              placeholder="City search..."
            />
          </div>
        </div>

        <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-yellow-500/50 transition-all">
          <Briefcase size={16} className="text-yellow-500 mr-3" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Category</span>
            <select
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold text-xs appearance-none cursor-pointer"
            >
              <option value="" className="text-black">All Sectors</option>
              <option value="manufacturer" className="text-black">Manufacturer</option>
              <option value="distributer" className="text-black">Distributor</option>
              <option value="retailer" className="text-black">Retailers</option>
              <option value="service_sector" className="text-black">Service Sector</option>
            </select>
          </div>
        </div>

        <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all">
          <ArrowUpDown size={16} className="text-blue-400 mr-3" />
          <div className="flex flex-col flex-1">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Sort By</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold text-xs appearance-none cursor-pointer"
            >
              <option value="newest" className="text-black">Recently Added</option>
              <option value="price_low" className="text-black">Price: Low to High</option>
              <option value="price_high" className="text-black">Price: High to Low</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchProducts}
          className="bg-yellow-500 hover:bg-white text-black font-black uppercase tracking-widest text-[9px] px-8 py-4 rounded-xl transition-all active:scale-95"
        >
          Update Feed
        </button>
      </div>
    </div>
  );
}

function ImageSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  // Safety Check: If no images remain after filtering, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-yellow-200">
        <Package size={40} />
      </div>
    );
  }

  useEffect(() => {
    // Only start the slider if there is more than one image
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 300);
    }, 1500);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <img
      src={images[current]}
      alt="Product"
      className={`w-full h-full object-cover transition-opacity duration-300 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mb-3" />
      <p className="font-black uppercase tracking-widest text-[9px] text-yellow-800">Syncing Catalog...</p>
    </div>
  );
}

function NoDataFound() {
  return (
    <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-yellow-100 text-center">
      <Package size={48} className="text-yellow-200 mx-auto mb-4" />
      <h2 className="text-2xl font-black tracking-tighter text-yellow-800/40 uppercase">No Data Found</h2>
    </div>
  );
}

function TrustCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
      <div className="text-yellow-600">{icon}</div>
      <span className="font-black uppercase tracking-widest text-[8px]">{label}</span>
    </div>
  );
}