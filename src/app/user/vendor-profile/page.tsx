"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function VendorRegister() {
  const [step, setStep] = useState(1);

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [profileInfo, setProfileInfo] = useState("");

  // Subscription
  const [showPlans, setShowPlans] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

  // Step 3: Company Info
  const [companyName, setCompanyName] = useState("");
  const [userType, setUserType] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Step 4: Media Upload
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sample subscription plans with duration in days
  const plans = [
    { title: "Basic", price: "$10", duration: "1 Month", durationDays: 30, features: ["Basic listing", "Email support"] },
    { title: "Standard", price: "$25", duration: "3 Months", durationDays: 90, features: ["Standard listing", "Priority support", "Analytics"] },
    { title: "Premium", price: "$80", duration: "12 Months", durationDays: 365, features: ["Premium listing", "Dedicated support", "Advanced analytics", "Custom branding"] },
  ];

  // Convert file to base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Step 1 Validation
  const validateStep1 = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (email) {
      const { data: existing } = await supabase
        .from("vendor_register")
        .select("email")
        .eq("email", email)
        .single();
      if (existing) newErrors.email = "Email already registered";
    }

    if (!password) newErrors.password = "Password is required";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName) newErrors.firstName = "First Name is required";
    if (!lastName) newErrors.lastName = "Last Name is required";
    if (!location) newErrors.location = "Location is required";
    if (!mobileNumber) newErrors.mobileNumber = "Mobile Number is required";
    else if (!/^\d{10}$/.test(mobileNumber)) newErrors.mobileNumber = "Mobile Number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!companyName) newErrors.companyName = "Company Name is required";
    if (!userType) newErrors.userType = "Please select User Type";
    if (!businessType) newErrors.businessType = "Please select Business Type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && !(await validateStep1())) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setErrors({});
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const profileBase64 = profileImage ? await toBase64(profileImage) : null;
      const mediaBase64 =
        mediaFiles.length > 0
          ? await Promise.all(mediaFiles.map((f) => toBase64(f)))
          : null;

      // 1️⃣ Get selected plan object
      const selectedPlan = plans.find((p) => p.title === subscriptionPlan);

      // 2️⃣ Calculate expiry date
      const expiryDate = selectedPlan
        ? new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000)
        : null;

      // 3️⃣ Insert into Supabase
      const { error } = await supabase.from("vendor_register").insert([
        {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          location,
          mobile_number: mobileNumber,
          alternate_number: alternateNumber || null,
          profile_info: profileInfo || null,
          company_name: companyName,
          user_type: userType,
          business_type: businessType,
          profile_image: profileBase64,
          media_files: mediaBase64 || null,
          subscription_plan: subscriptionPlan || null,
          subscription_expiry: expiryDate ? expiryDate.toISOString() : null,
        },
      ]);

      if (error) throw error;

      alert("Vendor registered successfully!");

      // Reset fields
      setStep(1);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setLocation("");
      setMobileNumber("");
      setAlternateNumber("");
      setProfileInfo("");
      setCompanyName("");
      setUserType("");
      setBusinessType("");
      setProfileImage(null);
      setMediaFiles([]);
      setSubscriptionPlan("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputLabel = (label: string) => (
    <label className="block font-semibold text-gray-700 mb-2">{label}</label>
  );

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-black bg-white transition duration-200";

  const steps = [
    { id: 1, name: "Account" },
    { id: 2, name: "Personal" },
    { id: 3, name: "Company" },
    { id: 4, name: "Media" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6 md:px-12">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        Vendor Registration
      </h1>

      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-8 space-y-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition duration-300 ${
                    step >= s.id
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s.id}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {s.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 transition duration-300 ${
                      step > s.id ? "bg-yellow-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
              <p className="text-gray-600">Enter your email and password to get started.</p>
            </div>
            {inputLabel("Email")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email}</p>
            )}

            {inputLabel("Password")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password}</p>
            )}

            {inputLabel("Confirm Password")}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition duration-200"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              <p className="text-gray-600">Tell us a bit about yourself.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {inputLabel("First Name")}
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm">{errors.firstName}</p>
                )}
              </div>
              <div>
                {inputLabel("Last Name")}
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            {inputLabel("Location")}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="Enter your location"
            />
            {errors.location && (
              <p className="text-red-600 text-sm">{errors.location}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {inputLabel("Mobile Number")}
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter mobile number"
                />
                {errors.mobileNumber && (
                  <p className="text-red-600 text-sm">{errors.mobileNumber}</p>
                )}
              </div>
              <div>
                {inputLabel("Alternate Number")}
                <input
                  type="text"
                  value={alternateNumber}
                  onChange={(e) => setAlternateNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter alternate number (optional)"
                />
              </div>
            </div>

            {inputLabel("Profile Bio")}
            <textarea
              value={profileInfo}
              onChange={(e) => setProfileInfo(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Tell us about yourself..."
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
              <p className="text-gray-600">Provide details about your business.</p>
            </div>
            {/* Logo Upload */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 border-2 border-dashed border-yellow-500 rounded-full flex items-center justify-center relative cursor-pointer hover:bg-gray-50 transition duration-200">
                {profileImage ? (
                  <Image
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-center px-4">
                    Click to upload logo
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setProfileImage(e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {inputLabel("Company Name")}
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              placeholder="Enter company name"
            />
            {errors.companyName && (
              <p className="text-red-600 text-sm">{errors.companyName}</p>
            )}

            {inputLabel("User Type")}
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={inputClass}
            >
              <option value="">Select who you are</option>
              <option value="Distributer">Distributer</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Retailers">Retailers</option>
              <option value="Service Sector">Service Sector</option>
              <option value="Wholesaler">Wholesaler</option>
            </select>
            {errors.userType && (
              <p className="text-red-600 text-sm">{errors.userType}</p>
            )}

            {inputLabel("Business Type")}
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Business Type</option>
              <option value="Ltd Liability">Ltd Liability</option>
              <option value="Not Mentioned">Not Mentioned</option>
              <option value="Partnership">Partnership</option>
              <option value="Proprietorship">Proprietorship</option>
            </select>
            {errors.businessType && (
              <p className="text-red-600 text-sm">{errors.businessType}</p>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Media Upload & Subscription</h2>
              <p className="text-gray-600">Upload media and choose a plan.</p>
            </div>
            {inputLabel("Upload Images/Videos")}
            <label className="flex items-center justify-center p-8 border-2 border-dashed border-yellow-500 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200">
              <span className="text-gray-500">Click to select files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) =>
                  e.target.files &&
                  setMediaFiles(Array.from(e.target.files))
                }
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {mediaFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="w-full h-32 relative border rounded-lg overflow-hidden"
                >
                  {file.type.startsWith("image") ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Media ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video className="w-full h-full object-cover" controls>
                      <source src={URL.createObjectURL(file)} />
                    </video>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPlans(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Choose Subscription Plan
            </button>

            {subscriptionPlan && (
              <p className="mt-2 text-green-600 font-semibold">
                Selected Plan: {subscriptionPlan}
              </p>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Plan Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-5xl p-6 overflow-y-auto max-h-[85vh]">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Choose Subscription Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-5 cursor-pointer hover:shadow-xl transition duration-300 ${
                    subscriptionPlan === plan.title
                      ? "border-yellow-500 shadow-xl"
                      : ""
                  }`}
                  onClick={() => setSubscriptionPlan(plan.title)}
                >
                  <h3 className="text-2xl font-bold text-center mb-3">
                    {plan.title}
                  </h3>
                  <p className="text-center text-xl font-extrabold">
                    {plan.price}
                  </p>
                  <p className="text-center text-gray-500 text-sm">
                    {plan.duration}
                  </p>
                  <ul className="mt-3 text-sm text-gray-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setShowPlans(false)}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
              <button
                onClick={() => setShowPlans(false)}
                disabled={!subscriptionPlan}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition duration-200"
              >
                Confirm Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
