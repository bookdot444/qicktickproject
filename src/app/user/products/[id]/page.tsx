"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
    ArrowLeft, ShoppingCart, Heart, ShieldCheck,
    Truck, Zap, Check, Store, Package, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [otherProducts, setOtherProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [user, setUser] = useState<any>(null);

    // ✅ IMPORTANT STATES (FIXED)
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [cartIds, setCartIds] = useState<string[]>([]);

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Product
            const { data: mainProduct } = await supabase
                .from("vendor_products")
                .select(`*, vendor:vendor_register(*)`)
                .eq("id", id)
                .single();

            if (mainProduct) {
                const images = mainProduct.product_image?.split("|||").map((path: string) => {
                    if (path.startsWith("http")) return path;
                    return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
                }) || [];

                setProduct({ ...mainProduct, images });

                // Other products
                const { data: others } = await supabase
                    .from("vendor_products")
                    .select("*")
                    .eq("vendor_id", mainProduct.vendor_id)
                    .neq("id", id)
                    .limit(5);

                setOtherProducts(others || []);
            }

            // Wishlist + Cart (ALL)
            if (user) {
                const { data: wishlistAll } = await supabase
                    .from("user_wishlist")
                    .select("product_id")
                    .eq("user_id", user.id);

                setWishlistIds(wishlistAll?.map(i => i.product_id) || []);

                const { data: cartAll } = await supabase
                    .from("user_cart")
                    .select("product_id")
                    .eq("user_id", user.id);

                setCartIds(cartAll?.map(i => i.product_id) || []);
            }

            setLoading(false);
        };

        initPage();
    }, [id]);

    // ✅ DERIVED STATES (AUTO FIX)
    const isWishlisted = wishlistIds.includes(id as string);
    const isInCart = cartIds.includes(id as string);

    // ================= ACTIONS =================

    const handleWishlist = async () => {
        if (!user) return alert("Please login first");

        if (isWishlisted) {
            await supabase
                .from("user_wishlist")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", id);

            setWishlistIds(prev => prev.filter(pid => pid !== id));
        } else {
            await supabase
                .from("user_wishlist")
                .insert({ user_id: user.id, product_id: id });

            setWishlistIds(prev => [...prev, id as string]);
        }
    };

    const handleAddToCart = async () => {
        if (!user) return alert("Please login first");

        if (isInCart) return;

        await supabase.from("user_cart").upsert({
            user_id: user.id,
            product_id: id,
        });

        setCartIds(prev => [...prev, id as string]);
    };

    // ================= UI =================

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Item Expired</div>;


    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-20 font-sans">

            {/* PREMIUM TOP BAR */}
            <div className="sticky top-0 z-50 p-6 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-md">
                <button onClick={() => router.back()} className="p-4 bg-white rounded-2xl shadow-xl border border-yellow-100 hover:bg-yellow-50 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <Link href={`/vendor/view/${product.vendor_id}`} className="flex items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl hover:bg-red-600 transition-all group">
                    <Store size={16} className="text-yellow-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Visit Business Profile</span>
                </Link>
            </div>

            {/* MAIN CONTENT CONTAINER - Increased gap to 24 for better spacing */}
            <div className="max-w-8xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 mt-12 pb-20">

                {/* LEFT */}
                <div className="space-y-8 pr-6 lg:pr-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="aspect-square rounded-[4rem] overflow-hidden border border-yellow-100 bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] relative"
                    >
                        <img src={product.images[activeImage]} className="w-full h-full object-cover" alt="" />

                    </motion.div>

                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                        {product.images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-24 h-24 rounded-[1.8rem] overflow-hidden border-4 transition-all shrink-0 ${activeImage === idx ? 'border-yellow-500 scale-105 shadow-lg' : 'border-white opacity-40 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col justify-center pl-6 lg:pl-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-[2px] bg-red-600" />
                        <span className="text-red-600 font-black text-[11px] uppercase tracking-[0.25em]">
                            {product.vendor?.company_name} • {product.vendor?.city}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-gray-900 mb-8 uppercase leading-[0.85]">
                        {product.product_name}
                    </h1>

                    <div className="flex items-center gap-8 mb-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Market Price</span>
                            <span className="text-5xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                        </div>
                        <div className="h-12 w-px bg-gray-200" />
                        <div className="px-5 py-3 bg-green-50 text-green-600 text-[11px] font-black rounded-2xl uppercase border border-green-100 flex items-center gap-2 shadow-sm">
                            <Zap size={14} fill="currentColor" /> Verified Stock
                        </div>
                    </div>

                    <div className="p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 mb-12 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] rotate-12">
                            <Package size={120} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                            <ArrowRight size={16} className="text-yellow-500" /> Technical Details
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base font-medium relative z-10">
                            {product.description || "High-grade commercial specification. This product meets all quality control standards for professional procurement."}
                        </p>
                    </div>

                    <div className="space-y-10">

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center justify-between gap-6">

                            {/* BUY NOW (BIG + DOMINANT) */}
                            <button className="flex-1 h-14 bg-yellow-400 hover:bg-black text-black hover:text-white rounded-2xl text-sm font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-md">
                                Buy Now
                            </button>

                            {/* CART + WISHLIST */}
                            <div className="flex items-center gap-4">

                                {/* ADD TO CART */}
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${isInCart
                                        ? "bg-green-500 text-white border-green-500"
                                        : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {isInCart ? (
                                        <>
                                            Added
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={16} /> Add
                                        </>
                                    )}
                                </button>

                                {/* WISHLIST */}
                                <button
                                    onClick={handleWishlist}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 border shadow-sm ${isWishlisted
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-gray-400 border-gray-200 hover:text-red-500"
                                        }`}
                                >
                                    <Heart
                                        size={20}
                                        fill={isWishlisted ? "currentColor" : "none"}
                                        strokeWidth={2.5}
                                    />
                                </button>

                            </div>
                        </div>

                        {/* TRUST BADGES */}
                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="flex items-center gap-4 p-6 bg-white border border-yellow-50 rounded-[2rem] shadow-sm">
                                <div className="p-3 bg-yellow-50 rounded-xl">
                                    <ShieldCheck className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-gray-900">Protected</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Secure Payment</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-6 bg-white border border-yellow-50 rounded-[2rem] shadow-sm">
                                <div className="p-3 bg-yellow-50 rounded-xl">
                                    <Truck className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-gray-900">Fast Track</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Express Delivery</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* "MORE FROM VENDOR" SECTION */}
            <div className="max-w-8xl mx-auto px-6 mt-2 relative">

                {/* HEADER */}
                <div className="flex items-center gap-6 mb-10">
                    <h3 className="text-2xl font-black tracking-tight uppercase whitespace-nowrap">
                        More from <span className="text-red-600">this business</span>
                    </h3>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>


                <div
                    id="scrollRow"
                    className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-2"
                >
                    {otherProducts.map((item) => {
                        const images = item.product_image?.split("|||") || [];

                        const isWishlistedItem = wishlistIds.includes(item.id);
                        const isInCartItem = cartIds.includes(item.id);

                        return (
                            <motion.div layout className="group bg-white rounded-2xl border border-yellow-100 hover:border-yellow-400 shadow-md transition-all overflow-hidden flex flex-col relative">

                                {/* WISHLIST BUTTON */}
                                <button
                                    onClick={async () => {
                                        if (!user) return alert("Login first");

                                        if (isWishlistedItem) {
                                            await supabase
                                                .from("user_wishlist")
                                                .delete()
                                                .eq("user_id", user.id)
                                                .eq("product_id", item.id);

                                            setWishlistIds(prev => prev.filter(pid => pid !== item.id));
                                        } else {
                                            await supabase
                                                .from("user_wishlist")
                                                .insert({ user_id: user.id, product_id: item.id });

                                            setWishlistIds(prev => [...prev, item.id]);
                                        }
                                    }}
                                    className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full border shadow-sm
    ${isWishlistedItem
                                            ? "bg-red-500 text-white border-red-500"
                                            : "bg-white/80 text-gray-400 border-gray-200 hover:text-red-500"
                                        }`}
                                >
                                    <Heart size={16} fill={isWishlistedItem ? "currentColor" : "none"} />
                                </button>

                                {/* IMAGE SLIDER */}
                                <div className="relative h-44 overflow-hidden bg-gray-50">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[0]}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package size={40} />
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">{product.vendor?.company_name}</span>
                                        <span className="text-[9px] font-medium text-gray-400">{product.vendor?.city}</span>
                                    </div>

                                    <h3 className="text-sm font-black text-gray-900 mb-1 line-clamp-1">{product.product_name}</h3>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Price</p>
                                            <p className="text-lg font-black text-gray-900">₹{Number(product.price).toLocaleString()}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* CART */}
                                            <button
                                                onClick={async () => {
                                                    if (!user) return alert("Login first");
                                                    if (isInCartItem) return;

                                                    await supabase.from("user_cart").upsert({
                                                        user_id: user.id,
                                                        product_id: item.id,
                                                    });

                                                    setCartIds(prev => [...prev, item.id]);
                                                }}
                                                className={`h-8 w-[70px] text-[11px] font-bold rounded-lg border flex items-center justify-center
          ${isInCartItem
                                                        ? "bg-green-500 text-white border-green-500"
                                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {isInCart ? (
                                                    <>
                                                        ✓ Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={16} /> Add
                                                    </>
                                                )}
                                            </button>

                                            {/* GO TO DETAILS ARROW --> */}
                                            <Link href={`/user/products/${product.id}`} className="bg-gray-900 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all hover:translate-x-1 shadow-md">
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TrustBox({ icon, title, subtitle }: any) {
    return (
        <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-yellow-50">
            <div className="p-3 bg-yellow-50 rounded-2xl">{icon}</div>
            <div>
                <p className="text-[10px] font-black uppercase text-gray-900">{title}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );
}