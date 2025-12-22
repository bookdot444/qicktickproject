"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Send, MessageSquare } from "lucide-react";

export default function VendorEnquiryPage() {
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [vendorEmail, setVendorEmail] = useState<string | null>(null);

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    /* GET VENDOR DETAILS */
    useEffect(() => {
        const stored = localStorage.getItem("vendorData");
        if (!stored) return;

        const vendor = JSON.parse(stored);
        setVendorEmail(vendor.email);

        supabase
            .from("vendor_register")
            .select("id")
            .eq("email", vendor.email)
            .single()
            .then(({ data }) => {
                if (data) setVendorId(data.id);
            });
    }, []);

    /* SUBMIT ENQUIRY */
    const submitEnquiry = async () => {
        if (!subject.trim() || !message.trim()) {
            alert("All fields are required");
            return;
        }

        setLoading(true);

        const { error } = await supabase.from("vendor_enquiries").insert({
            vendor_id: vendorId,
            vendor_email: vendorEmail,
            subject,
            message,
        });

        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            alert("Enquiry sent to admin successfully");
            setSubject("");
            setMessage("");
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-800">
                        Vendor Enquiry
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Contact admin for support, issues or questions
                    </p>
                </div>

                {/* FORM CARD */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* TITLE */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <MessageSquare className="text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">
                                Send Enquiry to Admin
                            </h2>
                            <p className="text-sm text-gray-500">
                                Our team will respond shortly
                            </p>
                        </div>
                    </div>

                    {/* SUBJECT */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            placeholder="Eg: Subscription issue / Product approval"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                    </div>

                    {/* MESSAGE */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Message
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Explain your issue clearly..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                        />
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={submitEnquiry}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold transition"
                    >
                        {loading ? "Sending..." : (
                            <>
                                <Send size={18} />
                                Submit Enquiry
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
