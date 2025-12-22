"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: string;
  name: string;
  description: string | null;
  locations: string[] | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
};

export default function CategoryListing() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data as Category[]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-900">
        Category Listing
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-transform transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          >
            {cat.image_url ? (
              <div className="relative w-full h-60">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            <div className="p-5">
              <h2 className="text-2xl font-semibold text-gray-800 hover:text-yellow-600 transition">
                {cat.name}
              </h2>

              {cat.description && (
                <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                  {cat.description}
                </p>
              )}

              {cat.locations && cat.locations.length > 0 && (
                <p className="text-gray-500 mt-3 text-xs">
                  <span className="font-medium">Locations:</span> {cat.locations.join(", ")}
                </p>
              )}

              {cat.is_active === false && (
                <span className="inline-block mt-3 px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-semibold">
                  Inactive
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
