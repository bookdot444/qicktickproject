"use client";

import { useState, useEffect } from "react";
import {
    Upload,
    MapPin,
    User,
    Building,
    Phone,
    Mail,
    Globe,
    Hash,
    CornerDownRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Example data for India states and cities
const indiaStatesCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawajda", "Guntur"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
};

const allStates = Object.keys(indiaStatesCities);

// 🔥 Fetch Live Location → Convert lat/lng into state/city/pincode
async function fetchLocationDetails(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    return {
        country: data.address.country || "",
        state: data.address.state || "",
        city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
        pincode: data.address.postcode || "",
    };
}

// 🔥 Reusable Input Component
const FormInput = ({
    label,
    value,
    onChange,
    error,
    placeholder,
    Icon,
    type = "text",
    required = true,
    disabled = false,
    isSelect = false,
    options = [],
    className = "",
    rows = 1,
    id, // 🔥 added ID for auto-scroll
}) => (
    <div className={`flex flex-col ${className}`} id={id}>
        <label className="font-semibold text-sm text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
            {Icon && (
                <Icon
                    size={20}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${error ? "text-red-500" : "text-yellow-300"
                        }`}
                />
            )}

            {isSelect ? (
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full border-2 rounded-lg px-4 py-2 appearance-none text-gray-800 transition duration-150 ease-in-out ${Icon ? "pl-10" : "pl-4"
                        } ${error
                            ? "border-red-500 bg-red-50"
                            : disabled
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                : "border-gray-300 bg-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        }`}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : rows > 1 ? (
                <textarea
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full border-2 rounded-lg px-4 py-2 text-gray-800 resize-none transition duration-150 ease-in-out ${Icon ? "pl-10" : "pl-4"
                        } ${error
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        }`}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full border-2 rounded-lg px-4 py-2 text-gray-800 transition duration-150 ease-in-out ${Icon ? "pl-10" : "pl-4"
                        } ${error
                            ? "border-red-500 bg-red-50"
                            : disabled
                                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                : "border-gray-300 bg-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        }`}
                />
            )}
        </div>

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function AddBusinessPage() {
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        phone: "",
        email: "",
        altPhone: "",
        website: "",
        country: "India",
        state: "",
        city: "",
        pinCode: "",
        preferredAddress: "",
        businessDetails: "",
    });

    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});

    // Update city options
    useEffect(() => {
        if (formData.state && indiaStatesCities[formData.state]) {
            setCities(indiaStatesCities[formData.state]);
        } else {
            setCities([]);
            setFormData((prev) => ({ ...prev, city: "" }));
        }
    }, [formData.state]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const isValidIndianPhone = (phone) =>
        /^[6-9]\d{9}$/.test(phone.trim());

    // 🔥 Validation with auto-scroll support
    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim())
            newErrors.name = "Your full name is required.";

        if (!formData.company.trim())
            newErrors.company = "Company/Shop Name is required.";

        if (!formData.phone.trim())
            newErrors.phone = "Primary Phone is required.";
        else if (!isValidIndianPhone(formData.phone))
            newErrors.phone = "Enter a valid 10-digit Indian phone number.";

        if (formData.altPhone.trim() && !isValidIndianPhone(formData.altPhone))
            newErrors.altPhone = "Enter a valid 10-digit number.";

        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Enter a valid email.";

        if (!formData.state.trim())
            newErrors.state = "Please select a valid state.";

        if (!formData.city.trim())
            newErrors.city = "Please select a valid city.";

        if (
            formData.pinCode.trim() &&
            !/^\d{6}$/.test(formData.pinCode)
        )
            newErrors.pinCode = "Enter a valid 6-digit pincode.";

        if (!formData.preferredAddress.trim())
            newErrors.preferredAddress =
                "Preferred address is required.";

        if (!formData.businessDetails.trim())
            newErrors.businessDetails =
                "Business details are required.";

        setErrors(newErrors);

        // 🔥 AUTO-SCROLL TO FIRST ERROR
        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
            const firstError = errorKeys[0];
            const element = document.getElementById(firstError);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }

        return errorKeys.length === 0;
    };

    // ⭐ Use My Location (Chrome Permission Trigger)
    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const details = await fetchLocationDetails(
                    latitude,
                    longitude
                );

                setFormData((prev) => ({
                    ...prev,
                    state: details.state,
                    city: details.city,
                    pinCode: details.pincode,
                }));

                alert("Location detected successfully!");
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Please allow location permission in Chrome.");
                } else {
                    alert("Unable to fetch location.");
                }
            }
        );
    };

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) submitToSupabase();
    };

    const submitToSupabase = async () => {
        const { error } = await supabase.from("businesses").insert([
            {
                ...formData,
                alt_phone: formData.altPhone,
                pin_code: formData.pinCode,
                preferred_address: formData.preferredAddress,
                business_details: formData.businessDetails,
            },
        ]);

        if (error) {
            console.error(error);
            alert("Failed to submit");
        } else {
            alert("Business submitted!");
        }
    };

    const getCityOptions = () => {
        const options = [{ value: "", label: "Select City" }];
        cities.forEach((c) => options.push({ value: c, label: c }));
        return options;
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto space-y-10 px-4">
                {/* HEADER */}
                <header className="text-center pb-4">
                    <h1 className="text-4xl font-extrabold text-yellow-500">
                        List Your Business
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Provide your details below to get your business
                        listed.
                    </p>
                </header>

                {/* BASIC INFO */}
                <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <h2 className="text-xl font-bold bg-yellow-400 text-white px-6 py-4">
                        1. Basic Contact Information
                    </h2>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            id="name"
                            label="Your Name"
                            value={formData.name}
                            onChange={handleChange("name")}
                            error={errors.name}
                            placeholder="e.g. John Doe"
                            Icon={User}
                        />

                        <FormInput
                            id="company"
                            label="Company/Shop Name"
                            value={formData.company}
                            onChange={handleChange("company")}
                            error={errors.company}
                            placeholder="e.g. ABC Services"
                            Icon={Building}
                        />

                        <FormInput
                            id="phone"
                            label="Primary Phone Number"
                            value={formData.phone}
                            onChange={handleChange("phone")}
                            error={errors.phone}
                            placeholder="9876543210"
                            Icon={Phone}
                            type="tel"
                        />

                        <FormInput
                            id="altPhone"
                            label="Alternate Phone (Optional)"
                            value={formData.altPhone}
                            onChange={handleChange("altPhone")}
                            error={errors.altPhone}
                            placeholder="Optional"
                            Icon={Phone}
                            required={false}
                            type="tel"
                        />

                        <FormInput
                            id="email"
                            label="Email (Optional)"
                            value={formData.email}
                            onChange={handleChange("email")}
                            error={errors.email}
                            placeholder="example@mail.com"
                            Icon={Mail}
                            required={false}
                        />

                        <FormInput
                            id="website"
                            label="Website URL (Optional)"
                            value={formData.website}
                            onChange={handleChange("website")}
                            error={errors.website}
                            placeholder="https://"
                            Icon={Globe}
                            required={false}
                        />
                    </div>
                </section>

                {/* LOCATION */}
                <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <h2 className="text-xl font-bold bg-yellow-400 text-white px-6 py-4">
                        2. Business Location
                    </h2>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            id="country"
                            label="Country"
                            value={formData.country}
                            onChange={handleChange("country")}
                            Icon={Globe}
                            disabled={true}
                        />

                        <FormInput
                            id="state"
                            label="State"
                            value={formData.state}
                            onChange={handleChange("state")}
                            error={errors.state}
                            isSelect={true}
                            options={[
                                { value: "", label: "Select State" },
                                ...allStates.map((s) => ({
                                    value: s,
                                    label: s,
                                })),
                            ]}
                            Icon={MapPin}
                        />

                        <FormInput
                            id="city"
                            label="City"
                            value={formData.city}
                            onChange={handleChange("city")}
                            error={errors.city}
                            isSelect={true}
                            options={getCityOptions()}
                            disabled={!formData.state}
                            Icon={MapPin}
                        />

                        <FormInput
                            id="pinCode"
                            label="Pin Code"
                            value={formData.pinCode}
                            onChange={handleChange("pinCode")}
                            error={errors.pinCode}
                            placeholder="500001"
                            Icon={Hash}
                            required={false}
                        />

                        <div className="flex items-end">
                            <button
                                onClick={handleUseLocation}
                                type="button"
                                className="px-4 py-2 flex items-center gap-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
                            >
                                <MapPin size={16} />
                                Use My Location
                            </button>
                        </div>
                    </div>
                </section>

                {/* BUSINESS DETAILS */}
                <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <h2 className="text-xl font-bold bg-yellow-400 text-white px-6 py-4">
                        3. Business Details & Address
                    </h2>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            id="preferredAddress"
                            label="Preferred Address"
                            value={formData.preferredAddress}
                            onChange={handleChange("preferredAddress")}
                            error={errors.preferredAddress}
                            rows={5}
                            placeholder="Full address"
                            Icon={CornerDownRight}
                            className="md:col-span-1"
                        />

                        <FormInput
                            id="businessDetails"
                            label="Business Details"
                            value={formData.businessDetails}
                            onChange={handleChange("businessDetails")}
                            error={errors.businessDetails}
                            rows={5}
                            placeholder="Describe your services"
                            Icon={CornerDownRight}
                            className="md:col-span-1"
                        />

                        <div className="flex flex-col md:col-span-1">
                            <label className="font-semibold text-sm text-gray-700 mb-1">
                                Upload Business Logo / Document
                            </label>
                            <div className="mt-1 border-2 border-dashed border-teal-400 bg-teal-50 rounded-lg min-h-[140px] flex flex-col items-center justify-center text-teal-600 hover:bg-teal-100 cursor-pointer transition duration-200">
                                <Upload
                                    size={32}
                                    className="text-teal-500"
                                />
                                <p className="text-sm mt-2 font-medium">
                                    Click to browse or drag file here
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Max file size: 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 p-6 flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                            onClick={() => window.history.back()}
                        >
                            Cancel / Back
                        </button>

                        <button
                            type="submit"
                            className="px-8 py-3 rounded-lg font-bold bg-yellow-500 text-white hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/50"
                        >
                            Submit Business Details
                        </button>
                    </div>
                </section>
            </div>
        </form>
    );
}
