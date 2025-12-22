"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Package, DollarSign, Calendar, Eye, Loader } from "lucide-react";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VendorProduct {
  id: string;
  vendor_id: string;
  product_name: string;
  price: number;
  description: string | null;
  product_image: string | null;
  is_active: boolean;
  created_at: string;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("vendor_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Vendor Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse all vendor products with detailed information.
          </p>
        </div>

        {/* Loading/Error States */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available.</p>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition duration-300"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Package size={48} />
                    </div>
                  )}
                  {/* Active Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                    product.is_active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.product_name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{product.description || "No description available."}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <DollarSign size={16} className="mr-2 text-green-600" />
                      <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={16} className="mr-2" />
                      <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center">
                    <Eye size={16} className="mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
