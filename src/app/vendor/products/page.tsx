"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";

type Product = {
    id: string;
    vendor_id: string;
    product_name: string;
    price: number;
    description: string | null;
    product_image: string | null;
    is_active: boolean;
    created_at: string;
};

export default function VendorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [vendorId, setVendorId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        product_name: "",
        price: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    /* GET VENDOR ID */
    useEffect(() => {
        const stored = localStorage.getItem("vendorData");
        if (!stored) return;

        const vendor = JSON.parse(stored);

        supabase
            .from("vendor_register")
            .select("id")
            .eq("email", vendor.email)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error("Vendor fetch error:", error);
                }
                if (data) {
                    setVendorId(data.id);
                    fetchProducts(data.id);
                }
            });
    }, []);

    /* FETCH PRODUCTS */
    const fetchProducts = async (vendorId: string) => {
        const { data, error } = await supabase
            .from("vendor_products")
            .select("*")
            .eq("vendor_id", vendorId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch products error:", error);
            return;
        }

        if (data) setProducts(data);
    };

    /* IMAGE UPLOAD */
    const uploadImage = async (): Promise<string | null> => {
        if (!file || !vendorId) return null;

        const fileExt = file.name.split(".").pop();
        const fileName = `${vendorId}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
            .from("product-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type,
            });

        if (error) {
            console.error("Image upload error:", error);
            alert(error.message);
            return null;
        }

        const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);

        return data.publicUrl;
    };


    /* VALIDATION */
    const validateForm = () => {
        if (!form.product_name.trim()) {
            alert("Product name is required");
            return false;
        }
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
            alert("Enter a valid price");
            return false;
        }
        if (!form.description.trim()) {
            alert("Description is required");
            return false;
        }
        return true;
    };

    /* ADD PRODUCT */
    const addProduct = async () => {
        if (!vendorId) return;
        if (!validateForm()) return;

        setLoading(true);

        const imageUrl = await uploadImage();
        console.log("IMAGE URL:", imageUrl);

        if (!imageUrl) {
            setLoading(false);
            alert("Image upload failed. Product not saved.");
            return;
        }

        const { data, error } = await supabase
            .from("vendor_products")
            .insert({
                vendor_id: vendorId,
                product_name: form.product_name,
                price: Number(form.price),
                description: form.description,
                product_image: imageUrl,
            })
            .select();

        console.log("INSERT RESULT:", data, error);

        setLoading(false);

        if (error) {
            console.error("Insert product error:", error);
            alert(error.message);
        } else {
            setForm({ product_name: "", price: "", description: "" });
            setFile(null);
            fetchProducts(vendorId);
        }
    };


    /* DELETE PRODUCT */
    const deleteProduct = async (id: string) => {
        const confirm = window.confirm("Are you sure you want to delete this product?");
        if (!confirm) return;

        const { error } = await supabase.from("vendor_products").delete().eq("id", id);
        if (error) {
            console.error("Delete product error:", error);
            alert("Failed to delete product");
            return;
        }

        setProducts(products.filter((p) => p.id !== id));
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Products</h1>

                {/* ADD PRODUCT */}
                <div className="bg-white p-6 rounded-xl shadow mb-10">
                    <h2 className="font-semibold mb-4">Add Product</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            placeholder="Product name"
                            className="border p-3 rounded-lg"
                            value={form.product_name}
                            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                        />

                        <input
                            placeholder="Price"
                            className="border p-3 rounded-lg"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />

                        <textarea
                            placeholder="Description"
                            className="border p-3 rounded-lg md:col-span-2"
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />

                        <label className="flex items-center gap-3 border p-3 rounded-lg cursor-pointer">
                            <Upload />
                            <span>{file ? file.name : "Upload image"}</span>
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />

                        </label>
                    </div>

                    <button
                        onClick={addProduct}
                        disabled={loading}
                        className="mt-4 px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Add Product"}
                    </button>
                </div>

                {/* PRODUCT LIST */}
                <div className="grid md:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden">
                            <img
                                src={p.product_image || "/placeholder.png"}
                                className="h-48 w-full object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-bold">{p.product_name}</h3>
                                <p className="text-gray-600">₹{p.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1">{p.description}</p>

                                <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="mt-3 flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
