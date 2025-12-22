"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { MessageSquare, User as UserIcon, Mail, Phone, Send, Loader } from "lucide-react";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Assuming enquiries table has: id, name, email, phone, message, created_at, etc.

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Fetch enquiries
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data, error } = await supabase
      .from("enquiries") // Assuming table name
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching enquiries:", error);
      setFormError("Failed to load enquiries. Please try again.");
    } else {
      setEnquiries(data || []);
    }
    setLoading(false);
  };

  const handleFormChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Please fill in name, email, and message.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("enquiries").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      },
    ]);

    if (error) {
      console.error("Error submitting enquiry:", error);
      setFormError("Failed to submit enquiry. Please try again.");
    } else {
      setFormSuccess("Enquiry submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      fetchEnquiries(); // Refresh the list
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Customer Enquiries</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? Submit your enquiry below or browse existing ones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enquiry Form */}
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 flex items-center">
              <MessageSquare size={28} className="mr-3 text-yellow-600" />
              Submit Your Enquiry
            </h2>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                {formSuccess}
              </div>
            )}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center">
                    <UserIcon size={18} className="mr-2 text-yellow-600" />
                    Your Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    placeholder="Enter your name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center">
                    <Mail size={18} className="mr-2 text-yellow-600" />
                    Your Email *
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Phone size={18} className="mr-2 text-yellow-600" />
                  Your Phone (optional)
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-yellow-600" />
                  Your Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  placeholder="Describe your enquiry..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  onChange={handleFormChange}
                />
              </div>
              <button
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {formLoading ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2" />
                    Submit Enquiry
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enquiries List */}
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 flex items-center">
              <MessageSquare size={28} className="mr-3 text-yellow-600" />
              Recent Enquiries
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-yellow-600" />
                <span className="ml-3 text-gray-600">Loading enquiries...</span>
              </div>
            ) : enquiries.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No enquiries yet.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                    <p className="font-medium text-gray-900 mb-2">{enquiry.message}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      Submitted on: {new Date(enquiry.created_at).toLocaleDateString()}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center">
                        <UserIcon size={16} className="mr-2 text-gray-600" />
                        <strong>Name:</strong> {enquiry.name}
                      </p>
                      <p className="flex items-center">
                        <Mail size={16} className="mr-2 text-gray-600" />
                        <strong>Email:</strong> {enquiry.email}
                      </p>
                      {enquiry.phone && (
                        <p className="flex items-center">
                          <Phone size={16} className="mr-2 text-gray-600" />
                          <strong>Phone:</strong> {enquiry.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}