"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { leadsAPI } from "@/lib/api";
     
export default function NewLeadForm({ redirectPath }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    budget: "",
    productInterest: [],
    area: "",
    city: "",
    district: "",
    state: "",
    gpsCoordinates: "",
  });

  const productOptions = [
    "Cricket Kit",
    "Running Shoes",
    "Badminton Racket",
    "Football",
    "Basketball",
    "Gym Equipment",
    "Sports Wear",
    "Yoga Mat",
    "Other",
  ];

  const [otherProductName, setOtherProductName] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Per-field validation rules
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "customerName":
        if (value.trim().length < 2) return "Name must be at least 2 characters long.";
        return "";
      case "phoneNumber": {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) return "Phone number must be exactly 10 digits.";
        return "";
      }
      case "budget":
        return "";
      case "productInterest":
        return "";
      case "area":
        return "";
      default:
        return "";
    }
  };

  // Checkbox toggle logic
  const handleProductToggle = (product) => {
    setFormData((prev) => {
      const current = prev.productInterest;
      const updated = current.includes(product)
        ? current.filter((p) => p !== product)
        : [...current, product];
      return { ...prev, productInterest: updated };
    });
  };

  // Blur handler — validates the individual field
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[fieldName] = errorMsg;
      } else {
        delete updated[fieldName];
      }
      return updated;
    });
  };

  // Full-form validation (used on submit)
  const validateForm = () => {
    const fields = ["customerName", "phoneNumber"];
    let newErrors = {};
    fields.forEach((field) => {
      const msg = validateField(field, formData[field]);
      if (msg) newErrors[field] = msg;
    });
    setErrors(newErrors);
    // Mark all as touched so errors show
    const allTouched = {};
    fields.forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    return Object.keys(newErrors).length === 0;
  };

  // GPS location handler
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        try {
          // Reverse-geocode using OpenStreetMap Nominatim (free, no API key)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();

          const addr = data.address || {};

          // Extract individual location fields
          const area = addr.neighbourhood || addr.suburb || addr.village || addr.town || "";
          const city = addr.city || addr.town || addr.village || "";
          const district = addr.city_district || addr.county || "";
          const state = addr.state || "";

          // Area shown to user: just the neighbourhood/suburb
          const areaString = area || city || district || data.display_name || gpsString;

          setFormData((prev) => ({
            ...prev,
            area: areaString,
            city,
            district,
            state,
            gpsCoordinates: gpsString,
          }));

          // Clear area error if it was set
          setErrors((prev) => {
            const updated = { ...prev };
            delete updated.area;
            return updated;
          });

          toast.success("Location fetched successfully!");
        } catch {
          // If reverse-geocoding fails, just use coordinates
          setFormData((prev) => ({
            ...prev,
            area: gpsString,
            gpsCoordinates: gpsString,
          }));
          toast.info("Got coordinates but couldn't resolve address.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateForm()) return; 

    setIsSubmitting(true);

    try {
      // Create a copy of the payload to modify productInterest if "Other" is selected
      let finalProductInterest = [...formData.productInterest];
      if (finalProductInterest.includes("Other") && otherProductName.trim()) {
        // Replace "Other" with the actual custom product name, or just add it
        finalProductInterest = finalProductInterest.map(p => p === "Other" ? otherProductName.trim() : p);
      } else if (finalProductInterest.includes("Other")) {
        // If "Other" is checked but no text entered, maybe remove it or keep it? 
        // Let's remove it if it's empty to keep data clean
        finalProductInterest = finalProductInterest.filter(p => p !== "Other");
      }

      const submissionData = {
        ...formData,
        productInterest: finalProductInterest
      };

      const { data } = await leadsAPI.createLead(submissionData);

      if (!data.success) {
        throw new Error(data.message || "Something went wrong saving the lead.");
      }

      toast.success("Lead Saved Successfully!");
      router.push(redirectPath);

    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save lead.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  // Helper: input class based on error state
  const inputClass = (fieldName) =>
    `w-full p-3 border rounded-lg outline-none transition-colors text-theme-navy ${
      errors[fieldName] && touched[fieldName]
        ? "border-red-500 bg-red-50"
        : "border-theme-slate/30 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent"
    }`;

  return (
    <div className="flex flex-col max-w-4xl mx-auto">
      
      <header className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-theme-navy">Log a Walk-In</h1>
        <p className="text-theme-slate mt-1">Quickly capture customer details to build your pipeline.</p>
      </header>

      <div className="bg-theme-light p-8 rounded-xl shadow-sm border border-theme-slate/20 max-w-5xl">
        <h2 className="text-xl font-bold text-theme-navy mb-6 border-b border-theme-slate/20 pb-4">
          Customer Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Name Field */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Customer Name *</label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              onBlur={() => handleBlur("customerName")}
              className={inputClass("customerName")}
            />
            {errors.customerName && touched.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Phone Number *</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              onBlur={() => handleBlur("phoneNumber")}
              className={inputClass("phoneNumber")}
            />
            {errors.phoneNumber && touched.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Area Field (with GPS button) */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Area</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Koramangala, Bangalore"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                onBlur={() => handleBlur("area")}
                className={`${inputClass("area")} pr-12`}
              />
              {/* GPS Map Pin Button */}
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isFetchingLocation}
                title="Use my current location"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-theme-accent hover:bg-theme-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isFetchingLocation ? (
                  /* Spinner */
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  /* Map Pin Icon */
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.area && touched.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
          </div>

          {/* City, District, State Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-slate mb-1">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={inputClass("city")}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-slate mb-1">District</label>
              <input
                type="text"
                placeholder="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={inputClass("district")}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-theme-slate mb-1">State</label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={inputClass("state")}
              />
            </div>
          </div>

          {/* Budget Field */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Estimated Budget (Rs.)</label>
            <input
              type="number"
              placeholder="500"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              onBlur={() => handleBlur("budget")}
              className={inputClass("budget")}
            />
            {errors.budget && touched.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
          </div>

          {/* Product Interest Checkboxes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-sm font-medium text-theme-slate">Product Interest</label>
              {formData.productInterest.length > 0 && (
                <span className="flex items-center justify-center bg-theme-accent text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full animate-in zoom-in duration-300">
                  {formData.productInterest.length}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {productOptions.map((product) => {
                const isChecked = formData.productInterest.includes(product);
                return (
                  <label
                    key={product}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isChecked
                        ? "border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent"
                        : "border-theme-slate/20 hover:border-theme-slate/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-theme-accent rounded focus:ring-theme-accent cursor-pointer"
                      checked={isChecked}
                      onChange={() => handleProductToggle(product)}
                    />
                    <span className={`text-sm ${isChecked ? "text-theme-navy font-semibold" : "text-theme-slate"}`}>
                      {product}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Custom Product Input (shown when 'Other' is checked) */}
            {formData.productInterest.includes("Other") && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-theme-slate mb-1">Specify Product</label>
                <input
                  type="text"
                  placeholder="Enter product name..."
                  value={otherProductName}
                  onChange={(e) => setOtherProductName(e.target.value)}
                  className={inputClass("otherProduct")}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 cursor-pointer text-white font-bold py-3 px-4 rounded-lg transition-all ${
              isSubmitting 
                ? "bg-theme-accent/70 cursor-not-allowed" 
                : "bg-theme-accent hover:bg-theme-accent/90 shadow-md"
            }`}
          >
            {isSubmitting ? "Saving to Database..." : "Save Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}