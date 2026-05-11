"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  MapPin,
  ChevronLeft,
  Truck,
  ReceiptIndianRupee,
  Navigation,
  Plus,
  CheckCircle2,
  BookUser
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  // Address Management
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

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

      // 2. Fetch Unique Previous Addresses from Orders
      const { data: previousOrders } = await supabase
        .from("orders")
        .select("address")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (previousOrders && previousOrders.length > 0) {
        // Filter unique addresses based on building and pincode to avoid duplicates
        const uniqueAddresses: any[] = [];
        const seen = new Set();

        previousOrders.forEach(ord => {
          if (!ord.address) return;
          const identifier = `${ord.address.building}-${ord.address.pincode}`.toLowerCase();
          if (!seen.has(identifier)) {
            seen.add(identifier);
            uniqueAddresses.push(ord.address);
          }
        });

        setSavedAddresses(uniqueAddresses);

        // Default to the most recent address
        setSelectedAddressIndex(0);
        setAddress(uniqueAddresses[0]);
      } else {
        setShowNewAddressForm(true);
      }
    }
    setLoading(false);
  };

  const selectSavedAddress = (index: number) => {
    setSelectedAddressIndex(index);
    setAddress(savedAddresses[index]);
    setShowNewAddressForm(false);
    setErrors({});
  };

  const handleAddNewAddressClick = () => {
    setSelectedAddressIndex(null);
    setAddress({
      name: "", phone: "", building: "", street: "",
      area: "", landmark: "", city: "", state: "", pincode: ""
    });
    setShowNewAddressForm(true);
  };

  // ---------------- AUTO FETCH LOCATION ----------------
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
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
        alert("Could not fetch address details automatically.");
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocating(false);
      alert("Location access denied.");
    });
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  // const tax = subTotal * 0.18;
  //  const shipping = subTotal > 0 && subTotal < 1000 ? 100 : 0;
  const grandTotal = subTotal;

  const validate = () => {
    let err: any = {};
    if (!address.name) err.name = "Required";
    if (!address.phone || address.phone.length !== 10) err.phone = "Invalid Phone";
    if (!address.building) err.building = "Required";
    if (!address.street) err.street = "Required";
    if (!address.pincode || address.pincode.length !== 6) err.pincode = "Invalid Pin";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {

    if (!validate()) {
      console.log("Validation failed:", errors);
      alert("Please fill in all required fields: " + Object.keys(errors).join(", "));
      return;
    }

    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert("Razorpay SDK Failed to load");
      return;
    }

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(grandTotal),
        }),
      });

      const order = await res.json();

      console.log(order);

      if (!order.id) {
        alert("Order creation failed");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: "INR",

        name: "Qicktick",

        description: "Order Payment",

        order_id: order.id,

        handler: async function (response: any) {
          try {
            const { data: userData } = await supabase.auth.getUser();

            await supabase.from("orders").insert([
              {
                user_id: userData.user?.id,
                total_amount: grandTotal,
                sub_total: subTotal,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                payment_status: "paid",
                address,
                items: cart,
              },
            ]);

            router.push("/user/orders");
          } catch (err) {
            console.log(err);
            alert("Failed to save order");
          }
        },

        prefill: {
          name: address.name,
          contact: address.phone,
        },

        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.open();

    } catch (error) {
      console.log(error);
      alert("Payment Failed");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center font-black italic uppercase animate-pulse">Syncing Vault...</div>;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-900 pb-24 font-sans">

      {/* HEADER */}
      <header className="pt-16 pb-12 px-6 max-w-6xl mx-auto">
        <Link href="/user/cart" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-6">
          <ChevronLeft size={14} /> Review Cart
        </Link>
        <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter">Checkout</h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10">

        {/* LEFT: ADDRESS SELECTION */}
        <div className="lg:col-span-7 space-y-6">

          {/* Saved Addresses Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <BookUser size={20} className="text-yellow-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">Saved Addresses</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => selectSavedAddress(idx)}
                  className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all relative overflow-hidden ${selectedAddressIndex === idx && !showNewAddressForm ? 'border-black bg-white shadow-xl' : 'border-slate-100 bg-slate-50/50 opacity-70 hover:opacity-100'}`}
                >
                  {selectedAddressIndex === idx && !showNewAddressForm && (
                    <CheckCircle2 size={16} className="absolute top-4 right-4 text-black" />
                  )}
                  <p className="font-black text-xs uppercase mb-1">{addr.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    {addr.building}, {addr.street},<br />
                    {addr.city}, {addr.pincode}
                  </p>
                  <p className="text-[10px] font-black mt-2 italic">Ph: {addr.phone}</p>
                </div>
              ))}

              <button
                onClick={handleAddNewAddressClick}
                className={`p-5 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${showNewAddressForm ? 'border-yellow-500 bg-yellow-50/50' : 'border-slate-200 hover:border-slate-400 text-slate-400'}`}
              >
                <Plus size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Add New Address</span>
              </button>
            </div>
          </section>

          {/* New Address Form */}
          <AnimatePresence>
            {showNewAddressForm && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-yellow-400 rounded-[2.5rem] p-8 shadow-xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black uppercase italic">Delivery Details</h3>
                  <button onClick={fetchCurrentLocation} className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-600 bg-yellow-50 px-3 py-2 rounded-full">
                    <Navigation size={12} /> {locating ? 'Searching...' : 'Use GPS'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <InputLabel label="Full Name *" />
                    <input type="text" className="checkout-input" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} />
                  </div>
                  <div>
                    <InputLabel label="Phone *" />
                    <input type="tel" className="checkout-input" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} />
                  </div>
                  <div>
                    <InputLabel label="Pincode *" />
                    <input type="text" className="checkout-input" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <InputLabel label="Building / House *" />
                    <input type="text" className="checkout-input" value={address.building} onChange={e => setAddress({ ...address, building: e.target.value })} />
                  </div>
                  {/* Add this inside your "New Address Form" grid */}
                  <div className="md:col-span-2">
                    <InputLabel label="Street / Road *" />
                    <input
                      type="text"
                      className="checkout-input"
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputLabel label="Area / Locality *" />
                    <input type="text" className="checkout-input" value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} />
                  </div>
                  <div>
                    <InputLabel label="City *" />
                    <input type="text" className="checkout-input" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div>
                    <InputLabel label="State *" />
                    <input type="text" className="checkout-input" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: SUMMARY (UNCHANGED) */}
        <div className="lg:col-span-5">
          <div className="bg-black text-white rounded-[2.5rem] p-8 sticky top-10 shadow-2xl">
            <h2 className="text-xl font-black uppercase italic mb-8 border-b border-white/10 pb-4">Order Summary</h2>

            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <p className="text-[10px] font-bold uppercase truncate flex-1">{item.product.product_name} x {item.quantity}</p>
                  <p className="text-xs font-black italic">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/10">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                <span>Subtotal</span>
                <span>₹{subTotal.toLocaleString()}</span>
              </div>
              {/* 
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-yellow-400" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div> */}
              <div className="flex justify-between pt-4 border-t border-white/20">
                <p className="text-2xl font-black italic">₹{grandTotal.toLocaleString()}</p>
                <button onClick={handlePayment} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-transform">
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .checkout-input {
          width: 100%;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          outline: none;
          transition: all 0.2s;
        }
        .checkout-input:focus {
          border-color: #eab308;
          background: white;
        }
      `}</style>
    </div>
  );
}

function InputLabel({ label }: { label: string }) {
  return (
    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest block">
      {label}
    </label>
  );
}