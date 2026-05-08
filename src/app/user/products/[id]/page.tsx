"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ShoppingCart, Heart, ShieldCheck,
    Truck, Zap, Check, Store, ArrowRight,
    PlayCircle, FileText, MapPin, Sparkles
} from "lucide-react";
import Link from "next/link";

// Prevents "Objects are not valid as a React child" crash
const safeRender = (data: any): string => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
        return data.description || data.header || data.text || JSON.stringify(data);
    }
    return String(data);
};

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [otherProducts, setOtherProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState({ type: 'image', url: '', index: 0 });
    const [user, setUser] = useState<any>(null);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [cartIds, setCartIds] = useState<string[]>([]);

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data: mainProduct } = await supabase
                .from("vendor_products")
                .select(`*, vendor:vendor_register(*)`)
                .eq("id", id)
                .single();

            if (mainProduct) {
                // Parse media paths
                const rawMedia = mainProduct.product_image?.split("|||") || [];
                const images: string[] = [];
                let videoUrl: string | null = null;

                rawMedia.forEach((path: string) => {
                    const fullUrl = path.startsWith("http") 
                        ? path 
                        : supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
                    if (fullUrl.match(/\.(mp4|webm|ogg)$/i)) videoUrl = fullUrl;
                    else images.push(fullUrl);
                });

                if (images.length === 0 && videoUrl) images.push(videoUrl);
                
                setProduct({ ...mainProduct, images, videoUrl });
                setActiveMedia({
                    type: images.length > 0 ? 'image' : 'video',
                    url: images.length > 0 ? images[0] : (videoUrl || ''),
                    index: 0
                });

                // Fetch other products from same vendor
             // This part fetches the data
const { data: others } = await supabase
    .from("vendor_products")
    .select("*")
    .eq("vendor_id", mainProduct.vendor_id) // Matches the same vendor
    .neq("id", id) // Excludes the current product being viewed
    .limit(8);
setOtherProducts(others || []);
            }

            if (user) {
                const { data: wish } = await supabase.from("user_wishlist").select("product_id").eq("user_id", user.id);
                setWishlistIds(wish?.map(i => i.product_id) || []);
                const { data: cart } = await supabase.from("user_cart").select("product_id").eq("user_id", user.id);
                setCartIds(cart?.map(i => i.product_id) || []);
            }
            setLoading(false);
        };
        initPage();
    }, [id]);

    const handleWishlist = async (targetId: string, currentStatus: boolean) => {
        if (!user) return alert("Please login first");
        if (currentStatus) {
            await supabase.from("user_wishlist").delete().eq("user_id", user.id).eq("product_id", targetId);
            setWishlistIds(prev => prev.filter(pid => pid !== targetId));
        } else {
            await supabase.from("user_wishlist").insert({ user_id: user.id, product_id: targetId });
            setWishlistIds(prev => [...prev, targetId]);
        }
    };

    const handleAddToCart = async (targetId: string, currentStatus: boolean) => {
        if (!user) return alert("Please login first");
        if (currentStatus) return;
        await supabase.from("user_cart").upsert({ user_id: user.id, product_id: targetId });
        setCartIds(prev => [...prev, targetId]);
    };

    const isMainWishlisted = wishlistIds.includes(id as string);
    const isMainInCart = cartIds.includes(id as string);

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-yellow-600 uppercase tracking-widest">Loading Premium Collection...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center font-bold">Product not found.</div>;

    // Logic to handle JSON feature objects safely
    let featureList = [];
    try {
        featureList = typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || []);
    } catch (e) {
        featureList = [];
    }

    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans text-gray-900 selection:bg-yellow-200">
            {/* STICKY NAV */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-yellow-100/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                    </button>
                    <Link href={`/vendor/view/${product.vendor_id}`} className="flex items-center gap-3 px-5 py-2.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-black/10">
                        <Store size={14} className="text-yellow-400" /> {product.vendor?.company_name}
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mt-8">
                
                {/* LEFT SIDE: MEDIA GALLERY */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="relative aspect-[4/5] md:aspect-square bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-yellow-100 group">
                        <AnimatePresence mode="wait">
                            {activeMedia.type === 'video' ? (
                                <motion.video 
                                    key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    src={activeMedia.url} controls className="w-full h-full object-cover" autoPlay 
                                />
                            ) : (
                                <motion.img 
                                    key={activeMedia.url} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    src={activeMedia.url} className="w-full h-full object-cover" 
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {product.images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveMedia({ type: 'image', url: img, index: idx })}
                                className={`relative shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 ${activeMedia.type === 'image' && activeMedia.index === idx ? 'border-yellow-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                        {product.videoUrl && (
                            <button
                                onClick={() => setActiveMedia({ type: 'video', url: product.videoUrl, index: -1 })}
                                className={`relative shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 transition-all ${activeMedia.type === 'video' ? 'border-yellow-500 scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                            >
                                <video src={product.videoUrl} muted className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <PlayCircle className="text-white" size={28} />
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: PRODUCT INFO */}
                <div className="lg:col-span-5 space-y-10">
                    <div>
                        <div className="flex items-center gap-2 text-red-600 mb-6">
                            <MapPin size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{product.vendor?.city || "Authentic Source"}</span>
                        </div>
                        <h1 className="text-6xl font-black leading-[0.85] uppercase tracking-tighter mb-8 break-words">
                            {safeRender(product.product_name)}
                        </h1>
                        <div className="flex items-end gap-5">
                            <span className="text-6xl font-black text-gray-900 tracking-tighter">₹{Number(product.price).toLocaleString()}</span>
                            <div className="mb-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} /> Quality Verified
                            </div>
                        </div>
                    </div>

                    {/* Description Box */}
                    <div className="p-10 bg-white rounded-[3rem] border border-yellow-50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText size={80} />
                        </div>
                        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-6 tracking-[0.2em]">
                            Product Narrative
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-semibold text-lg italic">
                            "{safeRender(product.description)}"
                        </p>
                    </div>

                    {/* DYNAMIC FEATURES GRID (HEADER + DESC) */}
                    {featureList.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" /> Specifications & Features
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {featureList.map((item: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 bg-white border border-yellow-100/50 rounded-[2rem] hover:border-yellow-400 transition-all group"
                                    >
                                        <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest group-hover:text-black transition-colors">
                                            {safeRender(item.header)}
                                        </p>
                                        <p className="text-sm font-bold text-gray-800 leading-snug">
                                            {safeRender(item.description)}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4 pt-6">
                      <button 
    onClick={async () => {
        // 1. Ensure item is in cart first
        await handleAddToCart(id as string, isMainInCart);
        // 2. Navigate straight to checkout
        router.push("/user/checkout");
    }}
    className="flex-[3] h-20 bg-yellow-400 hover:bg-black hover:text-white transition-all duration-500 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-yellow-200 active:scale-95"
>
    Buy Now
</button>
                        <button
                            onClick={() => handleAddToCart(id as string, isMainInCart)}
                            className={`flex-1 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 ${isMainInCart ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-white hover:border-black'}`}
                        >
                            <ShoppingCart size={28} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => handleWishlist(id as string, isMainWishlisted)}
                            className={`flex-1 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500 ${isMainWishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 bg-white hover:border-black'}`}
                        >
                            <Heart size={28} strokeWidth={2.5} fill={isMainWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* TRUST BADGES */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-5 bg-white/50 rounded-[2rem] border border-dashed border-gray-200">
                            <ShieldCheck size={24} className="text-gray-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Buyer Protection</span>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-white/50 rounded-[2rem] border border-dashed border-gray-200">
                            <Truck size={24} className="text-gray-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Fast Shipping</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* RELATED PRODUCTS */}
            {otherProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-40">
                    <div className="flex items-center gap-8 mb-16">
                        <h3 className="text-4xl font-black tracking-tighter uppercase">Vendor <span className="text-red-600">Showcase</span></h3>
                        <div className="flex-1 h-[2px] bg-yellow-100" />
                    </div>

                    <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 px-2">
                        {otherProducts.map((item) => {
                            const imgs = item.product_image?.split("|||") || [];
                            const firstImg = imgs[0]?.startsWith("http") ? imgs[0] : supabase.storage.from("products").getPublicUrl(imgs[0]).data.publicUrl;
                            const isThisWishlisted = wishlistIds.includes(item.id);
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ y: -12 }}
                                    className="min-w-[320px] bg-white rounded-[3rem] border border-yellow-50 shadow-xl overflow-hidden flex flex-col relative group"
                                >
                                    <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleWishlist(item.id, isThisWishlisted)}
                                            className={`p-3 rounded-2xl shadow-xl backdrop-blur-md ${isThisWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400'}`}
                                        >
                                            <Heart size={20} fill={isThisWishlisted ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    <div className="h-64 overflow-hidden bg-gray-50">
                                        <img src={firstImg} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <h4 className="font-black text-gray-900 uppercase text-lg mb-3 line-clamp-1 tracking-tighter">
                                            {safeRender(item.product_name)}
                                        </h4>
                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-yellow-50">
                                            <p className="text-2xl font-black text-gray-900">₹{Number(item.price).toLocaleString()}</p>
                                            <Link href={`/user/products/${item.id}`} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors">
                                                <ArrowRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}