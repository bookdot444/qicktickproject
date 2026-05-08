"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ChevronLeft,
  Truck,
  ReceiptIndianRupee,
  Navigation,
  History // Added for the UI
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Fetch Cart
      const { data: cartData } = await supabase
        .from("user_cart")
        .select(`id, quantity, product:vendor_products (*)`)
        .eq("user_id", user.id);
      setCart(cartData || []);

      // 2. Fetch Previous Order Address
      const { data: lastOrder, error: orderError } = await supabase
        .from("orders")
        .select("address")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastOrder && lastOrder.address) {
        // Map the saved address JSON back to our state
        setAddress({
          name: lastOrder.address.name || "",
          phone: lastOrder.address.phone || "",
          building: lastOrder.address.building || "",
          street: lastOrder.address.street || "",
          area: lastOrder.address.area || "",
          landmark: lastOrder.address.landmark || "",
          city: lastOrder.address.city || "",
          state: lastOrder.address.state || "",
          pincode: lastOrder.address.pincode || "",
        });
      }
    }
    setLoading(false);
  };

  // ---------------- AUTO FETCH LOCATION ----------------
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser");
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const addr = data.address;

        setAddress((prev) => ({
          ...prev,
          street: addr.road || addr.suburb || "",
          area: addr.neighbourhood || addr.city_district || "",
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
        }));
      } catch (error) {
        console.error("Error fetching address:", error);
        alert("Could not fetch address details automatically.");
      } finally {
        setLocating(false);
      }
    }, (error) => {
      setLocating(false);
      alert("Location access denied. Please enter manually.");
    });
  };

  // ---------------- TOTALS & SHIPPING ----------------
  const subTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = subTotal * 0.18;
  const shipping = subTotal > 0 && subTotal < 1000 ? 100 : 0;
  const grandTotal = subTotal + tax;

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err: any = {};
    if (!address.name) err.name = "Full name is required";
    if (!address.phone || address.phone.length !== 10) err.phone = "Enter a valid 10-digit number";
    if (!address.building) err.building = "Building name is required";
    if (!address.street) err.street = "Street/Locality is required";
    if (!address.area) err.area = "Area/Zone is required";
    if (!address.city) err.city = "City is required";
    if (!address.state) err.state = "State is required";
    if (!address.pincode || address.pincode.length !== 6) err.pincode = "6-digit pincode required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------------- PAYMENT ----------------
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validate()) return;
    const loaded = await loadRazorpay();
    if (!loaded) return alert("Razorpay failed to load");

    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(grandTotal) }),
    });

    const order = await res.json();
    if (!order?.id) return alert("Order creation failed");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "The Vault",
      order_id: order.id,
      handler: async (response: any) => {
        const { data: userData } = await supabase.auth.getUser();

        const orderPayload = {
          user_id: userData.user?.id,
          total_amount: grandTotal,
          sub_total: subTotal,
          tax: tax,
          shipping: shipping,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          payment_status: "paid",
          address: address, 
          items: cart,
        };

        const { error } = await supabase.from("orders").insert([orderPayload]);
        
        if (error) {
          console.error("Insert Error:", error);
          return alert("Order save failed: " + error.message);
        }
        
        router.push("/user/orders");
      },
      theme: { color: "#EAB308" }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 selection:bg-yellow-200">
      
      {/* HEADER */}
      <header className="bg-gradient-to-b from-yellow-100/60 to-[#FFFDF5] pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/user/cart" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all mb-8">
            <ChevronLeft size={14} /> Review Cart
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[1px] w-8 bg-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 italic">Final Step</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                Checkout
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-white border border-yellow-100 px-5 py-3 rounded-2xl shadow-sm">
              <ShieldCheck size={18} className="text-emerald-500" />
              <div className="leading-none">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Encrypted By</p>
                <p className="text-[11px] font-black uppercase">Razorpay Secure</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: SHIPPING FORM */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight italic">Shipping Details</h2>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pre-filled from your last order</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                    onClick={fetchCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-100 disabled:text-gray-400 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-yellow-200"
                    >
                    <Navigation size={14} className={locating ? "animate-pulse" : ""} />
                    {locating ? "Locating..." : "Use GPS"}
                    </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="md:col-span-2">
                  <InputLabel label="Recipient Full Name *" />
                  <input
                    type="text"
                    value={address.name}
                    placeholder="John Doe"
                    className={`w-full p-4 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.name}</p>}
                </div>

                <div>
                  <InputLabel label="Mobile Number *" />
                  <input
                    type="tel"
                    value={address.phone}
                    placeholder="99999 00000"
                    className={`w-full p-4 bg-slate-50 border ${errors.phone ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.phone}</p>}
                </div>

                <div>
                  <InputLabel label="Pincode *" />
                  <input
                    type="text"
                    value={address.pincode}
                    placeholder="600001"
                    className={`w-full p-4 bg-slate-50 border ${errors.pincode ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  />
                  {errors.pincode && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.pincode}</p>}
                </div>

                <div className="md:col-span-2">
                  <InputLabel label="Building / Apartment Name *" />
                  <input
                    type="text"
                    value={address.building}
                    placeholder="E.g. Sunshine Apartments, Flat 402"
                    className={`w-full p-4 bg-slate-50 border ${errors.building ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, building: e.target.value })}
                  />
                  {errors.building && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.building}</p>}
                </div>

                <div>
                  <InputLabel label="Street / Locality *" />
                  <input
                    type="text"
                    value={address.street}
                    placeholder="Main Road, 5th Cross"
                    className={`w-full p-4 bg-slate-50 border ${errors.street ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                  {errors.street && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.street}</p>}
                </div>

                <div>
                  <InputLabel label="Area / Zone *" />
                  <input
                    type="text"
                    value={address.area}
                    placeholder="Andheri West"
                    className={`w-full p-4 bg-slate-50 border ${errors.area ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  />
                  {errors.area && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.area}</p>}
                </div>

                <div className="md:col-span-2">
                  <InputLabel label="Landmark (Optional)" />
                  <input
                    type="text"
                    value={address.landmark}
                    placeholder="Near City Bank ATM"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm"
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  />
                </div>

                <div>
                  <InputLabel label="City / Town *" />
                  <input
                    type="text"
                    value={address.city}
                    placeholder="Mumbai"
                    className={`w-full p-4 bg-slate-50 border ${errors.city ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  {errors.city && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.city}</p>}
                </div>

                <div>
                  <InputLabel label="State *" />
                  <input
                    type="text"
                    value={address.state}
                    placeholder="Maharashtra"
                    className={`w-full p-4 bg-slate-50 border ${errors.state ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:outline-none focus:border-yellow-400 transition-all font-bold text-sm`}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  />
                  {errors.state && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-2">{errors.state}</p>}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <section className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-yellow-100/50">
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white">
                      <img src={item.product.product_image?.split("|||")[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black uppercase text-slate-800 leading-tight line-clamp-1">{item.product.product_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black italic">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-dashed border-slate-200 pt-6">
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <span>Items Subtotal</span>
                  <span>₹{subTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Truck size={14} className="text-yellow-600" /> Shipping
                  </div>
                  <span className={shipping === 0 ? "text-emerald-500" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <ReceiptIndianRupee size={14} className="text-yellow-600" /> GST (18%)
                  </div>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                <div className="pt-4 mt-2 border-t-2 border-slate-900">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Total Payable</p>
                      <p className="text-4xl font-black tracking-tighter italic leading-none">₹{grandTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full mt-8 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 group"
              >
                <CreditCard size={18} className="group-hover:-rotate-12 transition-transform" /> 
                Complete Payment
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6 py-3 border-t border-slate-50">
                <ShieldCheck size={14} className="text-slate-300" />
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                  100% Refundable Policy applies
                </p>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

function InputLabel({ label }: { label: string }) {
  return (
    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">
      {label}
    </label>
  );
}