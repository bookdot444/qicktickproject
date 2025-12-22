"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Truck, User as UserIcon, Phone, MapPin, Calendar, Package, Send, Loader } from "lucide-react";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TransportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    pickup: "",
    drop: "",
    date: "",
    goods: "",
    weight: "",
  });

  // Form change
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Transport Submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop || !formData.date) {
      setError("Please fill required fields");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const travelDate = new Date(formData.date);
    const { error: supabaseError } = await supabase.from("travel_requests").insert([
      {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose || null,
        pickup_location: formData.pickup,
        drop_location: formData.drop,
        travel_date: travelDate.toISOString().split("T")[0],
        goods_description: formData.goods || null,
        weight_kg: formData.weight || null,
      },
    ]);

    if (supabaseError) setError(supabaseError.message);
    else {
      setSuccess("Booking submitted successfully!");
      setFormData({ name: "", phone: "", purpose: "", pickup: "", drop: "", date: "", goods: "", weight: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Transport Booking</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book your transport needs with ease. Fill in the details below to get started.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <UserIcon size={18} className="mr-2 text-yellow-600" />
                  Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Phone size={18} className="mr-2 text-yellow-600" />
                  Phone *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pickup and Drop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <MapPin size={18} className="mr-2 text-yellow-600" />
                  Pickup Location *
                </label>
                <input
                  name="pickup"
                  value={formData.pickup}
                  placeholder="Enter pickup location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <MapPin size={18} className="mr-2 text-yellow-600" />
                  Drop Location *
                </label>
                <input
                  name="drop"
                  value={formData.drop}
                  placeholder="Enter drop location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <Calendar size={18} className="mr-2 text-yellow-600" />
                Date to Pickup *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                onChange={handleChange}
              />
            </div>

            {/* Goods Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <Package size={18} className="mr-2 text-yellow-600" />
                Goods Description
              </label>
              <textarea
                name="goods"
                value={formData.goods}
                placeholder="Describe your goods (optional)"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                onChange={handleChange}
              />
            </div>

            {/* Purpose and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Truck size={18} className="mr-2 text-yellow-600" />
                  Purpose
                </label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  placeholder="e.g., House Shifting, Delivery"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Package size={18} className="mr-2 text-yellow-600" />
                  Weight (KG)
                </label>
                <input
                  name="weight"
                  value={formData.weight}
                  placeholder="Approx weight in KG"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50 flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Submit Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
