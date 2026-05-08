"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast, Toaster } from "sonner"; // Using sonner for high-quality toasts
import {
  Share2, Phone, MapPin, ShieldCheck, Building2,
  User, ArrowLeft, Info, Smartphone, Mail,
  ChevronDown, Image as ImageIcon, ShoppingBag,
  Play, X, Maximize2, Briefcase, Award, Heart,
  ShoppingCart, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  // ... existing states
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Add this
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Add this
  const [openSection, setOpenSection] = useState<string | null>("media");
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [cartIds, setCartIds] = useState<string[]>([]);
  // --- POPUP STATE ---
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchVendorAndUser = async () => {
      setLoading(true);

      // 1. Get the current user session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 2. Fetch vendor and products
      const [vendorRes, productsRes] = await Promise.all([
        supabase.from("vendor_register").select("*").eq("id", id).single(),
        supabase.from("vendor_products").select("*").eq("vendor_id", id).eq("is_active", true)
      ]);

      if (vendorRes.data) setVendor(vendorRes.data);
      if (productsRes.data) setProducts(productsRes.data);

      // 3. Fetch Wishlist and Cart (ONLY if user is logged in)
      // This was previously floating outside, causing your error
      if (currentUser) {
        const [wishRes, cartRes] = await Promise.all([
          supabase.from("user_wishlist").select("product_id").eq("user_id", currentUser.id),
          supabase.from("user_cart").select("product_id").eq("user_id", currentUser.id)
        ]);

        if (wishRes.data) setWishlistedIds(wishRes.data.map(item => item.product_id));
        if (cartRes.data) setCartIds(cartRes.data.map(item => item.product_id));
      }

      setLoading(false);
    };

    if (id) fetchVendorAndUser();
  }, [id]);



  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      const [vendorRes, productsRes] = await Promise.all([
        supabase.from("vendor_register").select("*").eq("id", id).single(),
        supabase.from("vendor_products").select("*").eq("vendor_id", id).eq("is_active", true)
      ]);

      if (vendorRes.data) setVendor(vendorRes.data);
      if (productsRes.data) setProducts(productsRes.data);

      setLoading(false);
    };

    if (id) fetchVendorData();
  }, [id]);

  if (loading || !vendor) return <LoadingSpinner />;

  // --- PRODUCT IMAGE URL HANDLER ---
  const getProductImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data?.publicUrl || "";
  };

  function ImageSlider({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
      if (images.length <= 1) return;

      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setCurrent((prev) => (prev + 1) % images.length);
          setFade(true);
        }, 300);
      }, 3000);

      return () => clearInterval(interval);
    }, [images]);

    return (
      <img
        src={images[current]}
        alt="Product Image"
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
          }`}
      />
    );
  }

  // --- VENDOR VIDEOS ---
  const getVideos = () => {
    if (!vendor.video_files) return [];
    return Array.isArray(vendor.video_files) ? vendor.video_files : [];
  };

  // --- SERVICE PHOTOS ---
  const getServicePhotos = () => {
    if (!vendor.service_photos) return [];
    return Array.isArray(vendor.service_photos) ? vendor.service_photos : [];
  };

  // --- CERTIFICATE PHOTOS ---
  const getCertificates = () => {
    if (!vendor.certificates) return [];
    return Array.isArray(vendor.certificates) ? vendor.certificates : [];
  };

  const mediaList = [
    ...(vendor.media_files?.map((url: string) => ({ url, type: "image" })) || []),

    ...getVideos().map((vid: any) => ({
      url: typeof vid === "string" ? vid : vid.url,
      type: "video",
    })),

    ...getCertificates().map((url: string) => ({
      url,
      type: "image",
    })),

    ...products.flatMap((p) =>
      (p.product_image?.split("|||") || []).map((img: string) => ({
        url: getProductImageUrl(img),
        type: "image",
      }))
    ),
  ];

  // helper: find index in mediaList
  const openMediaByUrl = (url: string) => {
    const index = mediaList.findIndex((m) => m.url === url);
    if (index !== -1) setActiveIndex(index);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: vendor.company_name,
        text: `Check out this vendor: ${vendor.company_name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setShowLoginPopup(true);

    const isWishlisted = wishlistedIds.includes(productId);

    if (isWishlisted) {
      // Optional: Logic to REMOVE from wishlist
      const { error } = await supabase.from("user_wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      if (!error) {
        setWishlistedIds(prev => prev.filter(id => id !== productId));
        toast.info("Removed from Wishlist");
      }
    } else {
      const { error } = await supabase.from("user_wishlist").insert([{ user_id: user.id, product_id: productId }]);
      if (!error) {
        setWishlistedIds(prev => [...prev, productId]);
        toast.success("Added to Wishlist!");
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setShowLoginPopup(true);

    const isInCart = cartIds.includes(productId);
    if (isInCart) return toast.info("Already in your cart");

    const { error } = await supabase.from("user_cart").insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
    if (!error) {
      setCartIds(prev => [...prev, productId]);
      toast.success("Added to Cart!");
    }
  };

  return (
    <div className="w-full bg-white font-sans selection:bg-yellow-100">
      <Toaster position="top-center" richColors /> {/* Add this line */}

      <AnimatePresence>
        {showLoginPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={30} />
              </div>
              <h3 className="text-2xl font-black mb-2">Member Only</h3>
              <p className="text-slate-500 mb-6 font-medium">Please login to save products or add them to your cart.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-4 rounded-2xl font-bold">Login Now</button>
                <button onClick={() => setShowLoginPopup(false)} className="w-full py-2 text-slate-400 font-bold">Maybe Later</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MEDIA LIGHTBOX (MODAL) --- */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
            >
              {/* CLOSE */}
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-red-600 text-white rounded-full"
              >
                <X size={24} />
              </button>

              {/* LEFT */}
              <button
                onClick={() =>
                  setActiveIndex(
                    (activeIndex - 1 + mediaList.length) % mediaList.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-yellow-400 text-white p-3 rounded-full z-20"
              >
                ‹
              </button>

              {/* RIGHT */}
              <button
                onClick={() =>
                  setActiveIndex((activeIndex + 1) % mediaList.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-yellow-400 text-white p-3 rounded-full z-20"
              >
                ›
              </button>

              {/* MEDIA */}
              {mediaList[activeIndex].type === "image" ? (
                <motion.img
                  src={mediaList[activeIndex].url}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  className="w-screen h-screen object-contain cursor-grab active:cursor-grabbing"
                />
              ) : (
                <video
                  src={mediaList[activeIndex].url}
                  autoPlay
                  controls
                  className="max-w-full max-h-full"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-32 px-6 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-800 hover:text-black transition"
          >
            <div className="p-2 rounded-full border border-yellow-300 bg-white/50">
              <ArrowLeft size={14} />
            </div>
            Back to Search
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 bg-white p-4 rounded-[2.5rem] shadow-lg border border-yellow-100 flex items-center justify-center">
              {vendor.company_logo ? (
                <img
                  src={vendor.company_logo}
                  className="max-w-full max-h-full object-contain"
                  alt="Logo"
                />
              ) : (
                <Building2 size={40} className="text-yellow-200" />
              )}
            </div>

            <div className="text-center md:text-left">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-tighter">
                {vendor.sector || "General Business"}
              </span>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[0.9] tracking-tighter">
                  {vendor.company_name}
                </h1>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition w-fit"
                >
                  <Share2 size={18} />
                  Share Profile
                </button>
              </div>


              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 font-bold text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-yellow-600" />
                  {vendor.city}, {vendor.state}
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={16} className="text-red-600" />
                  GST: {vendor.gst_number || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        <div className="lg:col-span-8 space-y-6">

          {/* GALLERY & MEDIA SECTION */}
          <AccordionSection
            title="Gallery & Media"
            icon={<ImageIcon size={20} />}
            isOpen={openSection === "media"}
            onToggle={() => setOpenSection(openSection === "media" ? null : "media")}
          >
            {(() => {
              const mediaImages = vendor.media_files || [];
              const mediaVideos = getVideos();

              const combinedMedia = [
                ...mediaImages.map((img: string) => ({ type: "image", url: img })),
                ...mediaVideos.map((vid: any) => ({
                  type: "video",
                  url: typeof vid === "string" ? vid : vid.url,
                })),
              ];

              const visibleMedia = showAllMedia ? combinedMedia : combinedMedia.slice(0, 6);

              return combinedMedia.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visibleMedia.map((item: any, i: number) =>
                      item.type === "image" ? (
                        <div
                          key={i}
                          onClick={() => openMediaByUrl(item.url)}
                          className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in group relative bg-slate-50 border border-slate-100 shadow-sm"
                        >
                          <img
                            src={item.url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div
                          key={i}
                          onClick={() => openMediaByUrl(item.url)}
                          className="aspect-square rounded-2xl bg-black overflow-hidden cursor-pointer group relative border border-slate-200 shadow-sm"
                        >
                          <video
                            src={item.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Play className="text-white ml-1" fill="white" size={30} />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* VIEW MORE BUTTON */}
                  {combinedMedia.length > 6 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => setShowAllMedia(!showAllMedia)}
                        className="bg-black text-yellow-400 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                      >
                        {showAllMedia ? "View Less" : "View More"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm font-bold py-10 text-center">
                  No media uploaded by this vendor.
                </p>
              );
            })()}
          </AccordionSection>


          {/* CERTIFICATES SECTION */}
          <AccordionSection
            title="Certificates"
            icon={<Award size={20} />}
            isOpen={openSection === "certificates"}
            onToggle={() =>
              setOpenSection(openSection === "certificates" ? null : "certificates")
            }
          >
            {getCertificates().length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(showAllCertificates
                    ? getCertificates()
                    : getCertificates().slice(0, 6)
                  ).map((img: string, i: number) => (
                    <div
                      key={i}
                      onClick={() => openMediaByUrl(img)}
                      className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in group relative bg-slate-50 border border-slate-100 shadow-sm"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* VIEW MORE BUTTON */}
                {getCertificates().length > 6 && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setShowAllCertificates(!showAllCertificates)}
                      className="bg-yellow-400 text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                    >
                      {showAllCertificates ? "View Less" : "View More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm font-bold py-10 text-center">
                No certificates uploaded by this vendor.
              </p>
            )}
          </AccordionSection>



          {/* BUSINESS OVERVIEW */}
          <AccordionSection
            title="Business Overview"
            icon={<Info size={20} />}
            isOpen={openSection === "overview"}
            onToggle={() => setOpenSection(openSection === "overview" ? null : "overview")}
          >
            <div className="space-y-6">
              <p className="text-slate-700 text-lg leading-relaxed font-medium">
                {vendor.profile_info || "No description provided."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
                    Office Address
                  </h4>

                  <p className="text-sm font-bold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                    {vendor.flat_no} {vendor.floor && `${vendor.floor} Floor,`}{" "}
                    {vendor.building}
                    <br />
                    {vendor.street}, {vendor.area}
                    <br />
                    {vendor.city}, {vendor.state} - {vendor.pincode}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
                    Keywords
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {vendor.business_keywords?.split(",").map((k: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-yellow-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-yellow-800 uppercase border border-yellow-200"
                      >
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* PRODUCT CATALOG */}
          {/* PRODUCT CATALOG */}
          <AccordionSection
            title="Product Catalog"
            icon={<ShoppingBag size={20} />}
            isOpen={openSection === "products"}
            onToggle={() => setOpenSection(openSection === "products" ? null : "products")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((p) => {
                  const isWishlisted = wishlistedIds.includes(p.id);
                  const isInCart = cartIds.includes(p.id);

                  // Split images by separator or default to empty array
                  const productImages = p.product_image
                    ? p.product_image.split("|||").map((img: string) => getProductImageUrl(img))
                    : [];

                  return (
                    <div key={p.id} className="group relative bg-white border-2 border-slate-50 rounded-[2.5rem] p-3 hover:shadow-2xl hover:border-yellow-400 transition-all duration-500 cursor-pointer">

                      {/* --- IMAGE CONTAINER --- */}
                      <div className="aspect-square w-full rounded-[2rem] overflow-hidden mb-4 bg-slate-100 relative">
                        {productImages.length > 0 ? (
                          <ImageSlider images={productImages} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={48} />
                          </div>
                        )}

                        {/* --- WISHLIST BUTTON (Top Right of Image) --- */}
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <button
                            onClick={(e) => handleWishlist(e, p.id)}
                            className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all ${isWishlisted
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-slate-400 hover:text-red-500'
                              }`}
                          >
                            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>
                        </div>

                        {/* --- QUICK VIEW OVERLAY --- */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>

                      {/* --- PRODUCT DETAILS --- */}
                      <div className="px-3 pb-2">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight flex-1">
                            {p.product_name}
                          </h5>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                            <p className="text-xl font-black text-black">₹{p.price}</p>
                          </div>

                          {/* --- CART BUTTON --- */}
                          <button
                            onClick={(e) => handleAddToCart(e, p.id)}
                            className={`p-4 rounded-2xl transition-all duration-300 ${isInCart
                                ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-200'
                                : 'bg-yellow-400 text-black hover:bg-black hover:text-white shadow-md'
                              }`}
                          >
                            <ShoppingCart size={20} fill={isInCart ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ShoppingBag size={30} />
                  </div>
                  <p className="text-slate-400 text-sm font-bold">No products listed by this vendor.</p>
                </div>
              )}
            </div>
          </AccordionSection>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-8 shadow-2xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-xl text-black">
                <Briefcase size={20} />
              </div>
              Contact Info
            </h3>

            <div className="space-y-6">
              <ContactRow label="Primary Contact" value={vendor.owner_name} icon={<User size={18} />} />
              <ContactRow label="Mobile Number" value={vendor.mobile_number} icon={<Smartphone size={18} />} />
              <ContactRow label="Official Email" value={vendor.email} icon={<Mail size={18} />} />
            </div>

            <div className="mt-10">
              <a
                href={`tel:${vendor.mobile_number}`}
                className="flex items-center justify-center gap-3 bg-yellow-400 text-black font-black py-5 rounded-2xl hover:bg-yellow-300 transition-all w-full shadow-lg shadow-yellow-400/20"
              >
                <Phone size={20} /> Call Vendor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-yellow-400 mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-100">
          {value || "Not Provided"}
        </p>
      </div>
    </div>
  );
}

function AccordionSection({ title, icon, children, isOpen, onToggle }: any) {
  return (
    <div
      className={`bg-white rounded-[2.5rem] border-2 transition-all duration-300 ${isOpen ? "border-yellow-400 shadow-xl" : "border-slate-50"
        }`}
    >
      <button onClick={onToggle} className="w-full flex items-center justify-between p-7">
        <div className="flex items-center gap-4">
          <div
            className={`p-3.5 rounded-2xl transition-all ${isOpen
              ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/30"
              : "bg-slate-50 text-slate-400"
              }`}
          >
            {icon}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <div className="px-8 pb-10 overflow-hidden">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFFDF5]">
      <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-6" />
      <p className="font-black text-[10px] uppercase tracking-[0.4em] text-yellow-800">
        Fetching Business Profile...
      </p>
    </div>
  );
}
