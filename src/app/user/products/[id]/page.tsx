"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ShoppingCart, Heart, ShieldCheck,
    Truck, Zap, Check, Store, Package, ArrowRight,
    PlayCircle, Info, FileText, MapPin, BadgeCheck
} from "lucide-react";
import Link from "next/link";

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

            // Fetch Product with Vendor Details
            const { data: mainProduct } = await supabase
                .from("vendor_products")
                .select(`*, vendor:vendor_register(*)`)
                .eq("id", id)
                .single();

            if (mainProduct) {


                // Parse Video
                // Parse Images + Detect Video Automatically
                const rawMedia = mainProduct.product_image?.split("|||") || [];

                const images: string[] = [];
                let videoUrl: string | null = null;

                rawMedia.forEach((path: string) => {
                    const fullUrl = path.startsWith("http")
                        ? path
                        : supabase.storage.from("products").getPublicUrl(path).data.publicUrl;

                    // Detect video formats
                    if (fullUrl.match(/\.(mp4|webm|ogg)$/i)) {
                        videoUrl = fullUrl;
                    } else {
                        images.push(fullUrl);
                    }
                });

                // fallback if no images
                if (images.length === 0 && videoUrl) {
                    images.push(videoUrl);
                }
                setProduct({ ...mainProduct, images, videoUrl });
                setActiveMedia({
                    type: images.length > 0 ? 'image' : 'video',
                    url: images.length > 0 ? images[0] : (videoUrl || ''),
                    index: 0
                });

                // Fetch Recommendations from same vendor
                const { data: others } = await supabase
                    .from("vendor_products")
                    .select("*")
                    .eq("vendor_id", mainProduct.vendor_id)
                    .neq("id", id)
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

    // Derived States for Main Product
    const isMainWishlisted = wishlistIds.includes(id as string);
    const isMainInCart = cartIds.includes(id as string);

    // ================= ACTIONS =================

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

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-yellow-600">LOADING PREMIUM CONTENT...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center">Product Not Found</div>;

    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans text-gray-900">
            {/* TOP NAVIGATION */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-2 font-bold text-sm uppercase tracking-tighter">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <Link href={`/vendor/view/${product.vendor_id}`} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg">
                            <Store size={14} className="text-yellow-400" /> {product.vendor?.company_name}
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-12">

                {/* LEFT: MEDIA SECTION */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-yellow-100">
                        <AnimatePresence mode="wait">
                            {activeMedia.type === 'video' ? (
                                <motion.video
                                    key="video-player"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    src={activeMedia.url}
                                    controls className="w-full h-full object-cover"
                                    autoPlay
                                />
                            ) : (
                                <motion.img
                                    key={activeMedia.url}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    src={activeMedia.url}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* THUMBNAILS (Images + Video) */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
                        {product.images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveMedia({ type: 'image', url: img, index: idx })}
                                className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeMedia.type === 'image' && activeMedia.index === idx ? 'border-yellow-500 scale-110 shadow-md' : 'border-white opacity-60'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                        {product.videoUrl && (
                            <button
                                onClick={() => setActiveMedia({ type: 'video', url: product.videoUrl, index: -1 })}
                                className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeMedia.type === 'video'
                                        ? 'border-yellow-500 scale-110 shadow-lg'
                                        : 'border-white opacity-70 hover:opacity-100'
                                    }`}
                            >
                                {/* The Live Video Preview */}
                                <video
                                    src={product.videoUrl}
                                    muted
                                    playsInline
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover"
                                />

                                {/* Optional: A small play overlay so users know it's clickable */}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <PlayCircle className="text-white/80" size={24} />
                                </div>

                                <span className="absolute bottom-1 w-full text-center text-[7px] text-white font-black uppercase tracking-widest drop-shadow-md">
                                    Preview
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT: INFO SECTION */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-red-600 mb-4">
                            <MapPin size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{product.category} • {product.vendor?.city}</span>
                        </div>
                        <h1 className="text-5xl font-black leading-[0.9] uppercase tracking-tighter mb-6">{product.product_name}</h1>

                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">In Stock</div>
                        </div>
                    </div>

                    {/* DESCRIPTION BOX */}
                    <div className="p-8 bg-white rounded-[2.5rem] border border-yellow-50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={80} />
                        </div>
                        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">
                            <FileText size={14} className="text-yellow-500" /> Description
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            {product.description || "No detailed description provided for this premium item."}
                        </p>
                    </div>

                    {/* DYNAMIC SPECIFICATIONS */}
                    <div className="grid grid-cols-2 gap-4">
                        <SpecItem label="Brand" value={product.brand || "Original"} />
                        <SpecItem label="Category" value={product.category || "General"} />
                        <SpecItem label="Condition" value="New / Verified" />
                        <SpecItem label="Warranty" value={product.warranty || "Vendor Standard"} />
                    </div>

                    {/* MAIN ACTIONS */}
                    <div className="flex gap-4 pt-4">
                        <button className="flex-[3] h-16 bg-yellow-400 hover:bg-black hover:text-white transition-all rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-yellow-100 active:scale-95">
                            Buy it Now
                        </button>
                        <button
                            onClick={() => handleAddToCart(id as string, isMainInCart)}
                            className={`flex-1 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm ${isMainInCart ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                        >
                            <ShoppingCart size={24} />
                        </button>
                        <button
                            onClick={() => handleWishlist(id as string, isMainWishlisted)}
                            className={`flex-1 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm ${isMainWishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                        >
                            <Heart size={24} fill={isMainWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* TRUST CARDS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-yellow-50 shadow-sm">
                            <ShieldCheck size={20} className="text-green-600" />
                            <span className="text-[10px] font-black uppercase">Verified Vendor</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-yellow-50 shadow-sm">
                            <Truck size={20} className="text-blue-600" />
                            <span className="text-[10px] font-black uppercase">Fast Shipping</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* MORE FROM VENDOR SECTION */}
            <section className="max-w-7xl mx-auto px-6 mt-32">
                <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-3xl font-black tracking-tighter uppercase">More from <span className="text-red-600">this vendor</span></h3>
                    <div className="flex-1 h-[2px] bg-yellow-100" />
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8">
                    {otherProducts.map((item) => {
                        const images = item.product_image?.split("|||") || [];
                        const firstImage = images[0]?.startsWith("http") ? images[0] : supabase.storage.from("products").getPublicUrl(images[0]).data.publicUrl;
                        const isThisWishlisted = wishlistIds.includes(item.id);
                        const isThisInCart = cartIds.includes(item.id);

                        return (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -10 }}
                                className="min-w-[280px] bg-white rounded-[2rem] border border-yellow-50 shadow-lg overflow-hidden flex flex-col relative group"
                            >
                                {/* Mini Actions */}
                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleWishlist(item.id, isThisWishlisted)}
                                        className={`p-2 rounded-full shadow-md ${isThisWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
                                    >
                                        <Heart size={16} fill={isThisWishlisted ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img src={firstImage} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{item.category}</span>
                                        <span className="text-[9px] font-bold text-gray-400">{product.vendor?.city}</span>
                                    </div>
                                    <h4 className="font-black text-gray-900 uppercase text-sm mb-2 line-clamp-1">{item.product_name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{item.description}</p>

                                    <div className="mt-auto flex items-center justify-between border-t border-yellow-50 pt-4">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">Price</p>
                                            <p className="text-lg font-black text-gray-900">₹{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(item.id, isThisInCart)}
                                                className={`p-2.5 rounded-xl border transition-all ${isThisInCart ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 hover:bg-yellow-50'}`}
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                            <Link href={`/user/products/${item.id}`} className="p-2.5 bg-black text-white rounded-xl hover:bg-red-600 transition-colors">
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

// Helper Components
function SpecItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-4 bg-white border border-yellow-50 rounded-2xl shadow-sm hover:border-yellow-200 transition-colors">
            <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-tighter">{label}</p>
            <p className="text-xs font-bold text-gray-900 line-clamp-1">{value}</p>
        </div>
    );
}