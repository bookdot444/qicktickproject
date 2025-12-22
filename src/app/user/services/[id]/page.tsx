"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ServicesPage() {
    const { id } = useParams(); // category id
    const [services, setServices] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch category details
                const { data: cat, error: catError } = await supabase
                    .from("categories")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (catError || !cat) {
                    setError("Category Not Found 😞 The service category you are looking for does not exist.");
                    setLoading(false);
                    return;
                }

                setCategory(cat);

                // Fetch services under that category
                const { data: servicesData } = await supabase
                    .from("services")
                    .select("*")
                    .eq("category_id", id)
                    .order("name");

                setServices(servicesData || []);
            } catch (err) {
                setError("An error occurred while loading the data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{error}</h1>
                    <p className="text-gray-600">Please check the URL or go back to the categories page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* IMPROVED HERO SECTION - Increased Height */}
            <div className="relative w-full h-[600px] overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                {category?.image_url ? (
                    <Image
                        src={category.image_url}
                        fill
                        alt={category.name}
                        className="object-cover object-center"
                    />
                ) : (
                    // Fallback gradient if no image
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
                )}

                {/* Dark Gradient Overlay for Better Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Content Container - Centered */}
                <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center items-center text-center px-6">
                    {/* Category Badge */}
                    <div className="mb-4">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                            Category
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-4">
                        {category?.name}
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-white/90 max-w-2xl leading-relaxed mb-6">
                        {category?.description
                            ? category.description
                            : `Discover top-rated professionals and services in ${category?.name}. Get the best quality and expertise tailored to your needs.`}
                    </p>

                    {/* Call-to-Action or Stats */}
                    <div className="flex items-center gap-6 text-white/80">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            <span className="text-sm">
                                {(category?.locations && category.locations.length > 0)
                                    ? category.locations.join(", ")
                                    : "Available Worldwide"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-sm">
                                {services.length} Services Available
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ----------------------------------------------------------
          SERVICES GRID
      ---------------------------------------------------------- */}
            <div className="max-w-7xl mx-auto px-6 py-14">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Services</h2>

                {loading && <p className="text-gray-600">Loading...</p>}

                {!loading && services.length === 0 && (
                    <p className="text-gray-600">No services available for this category.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <h3 className="text-xl font-semibold text-gray-900">
                                {service.name}
                            </h3>

                            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                                {service.description || "No description available."}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}