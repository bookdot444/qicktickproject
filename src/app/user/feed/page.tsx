"use client";

import { useEffect, useState } from "react";
import { Search, ListPlus, Send } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name");

            if (!error) setCategories(data);
            setLoading(false);
        };
        loadCategories();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black">

            {/* HERO SECTION */}
            <div className="relative w-full h-[480px] overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    className="absolute w-full h-full object-cover opacity-30"
                >
                    <source src="/home_video.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-white/20"></div>

                <div className="relative z-10 text-center pt-24 px-4">
                    <h1 className="text-black text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
                        Find Trusted Local Services Instantly
                    </h1>
                    <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                        Search from AC Repair, Plumbing, Transport, Interiors, Electrical & More.
                    </p>

                    {/* SEARCH BAR */}
                    <div className="mt-10 max-w-4xl mx-auto bg-white shadow-xl p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-5">

                        <div className="flex flex-col w-full">
                            <label className="font-semibold">Find</label>
                            <input
                                className="p-3 border rounded-md border-gray-300 focus:border-yellow-500"
                                placeholder="AC, Plumbing, Transport..."
                                value={find}
                                onChange={(e) => setFind(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="font-semibold">Near</label>
                            <select
                                className="p-3 border rounded-md border-gray-300 focus:border-yellow-500"
                                value={near}
                                onChange={(e) => setNear(e.target.value)}
                            >
                                <option value="">Select City</option>
                                <option>Delhi</option>
                                <option>Mumbai</option>
                                <option>Bangalore</option>
                            </select>
                        </div>

                        <button className="bg-yellow-500 text-black font-bold px-10 py-3 rounded-md hover:bg-yellow-600 transition">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <section className="py-20 bg-gray-50">
                <h2 className="text-center text-4xl font-bold text-gray-900">
                    How QickTick Works
                </h2>
                <p className="text-center text-gray-600 mt-3 mb-12">
                    Simple, fast & reliable service discovery.
                </p>

                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">

                    <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
                        <Search className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-center">Search Services</h3>
                        <p className="text-center text-gray-600 mt-2">
                            Quickly find services across all categories.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
                        <ListPlus className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-center">Compare Providers</h3>
                        <p className="text-center text-gray-600 mt-2">
                            Compare vendors & view reviews instantly.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
                        <Send className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-center">Connect & Hire</h3>
                        <p className="text-center text-gray-600 mt-2">
                            Contact vendors directly & get service fast.
                        </p>
                    </div>

                </div>
            </section>

            {/* CATEGORIES */}
            <section className="py-20 bg-white">
                <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-6">
                    Popular Categories
                </h2>
                <p className="text-center text-gray-600 mb-14">
                    Explore the most demanded services around you.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10 max-w-7xl mx-auto px-6">

                    {loading && <p className="col-span-full text-center">Loading...</p>}

                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => window.location.href = `/user/services/${cat.id}`}
                            className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:border-yellow-400 transition-all cursor-pointer hover:-translate-y-2"
                        >

                            {cat.hot && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-md shadow">
                                    HOT
                                </span>
                            )}

                            <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden bg-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                {cat.image_url ? (
                                    <Image
                                        src={cat.image_url}
                                        width={150}
                                        height={150}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <p className="text-xs text-gray-400 mt-10 text-center">No Image</p>
                                )}
                            </div>

                            <p className="text-center font-semibold text-gray-900 mt-4 group-hover:text-yellow-600 transition">
                                {cat.name}
                            </p>
                        </div>
                    ))}

                </div>
            </section>
        </div>
    );
}
