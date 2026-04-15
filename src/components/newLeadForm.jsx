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
    productInterest: "",
    area: "",
    district: "",
    state: "",
    gpsCoordinates: "",
  });

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
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(value)) return "Please enter a valid phone number (min 10 digits).";
        return "";
      }
      case "budget":
        if (!value || Number(value) <= 0) return "Please enter a valid budget amount.";
        return "";
      case "productInterest":
        if (value.trim() === "") return "Please specify what they are interested in.";
        return "";
      case "area":
        if (value.trim() === "") return "Please enter an area.";
        return "";
      default:
        return "";
    }
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
    const fields = ["customerName", "phoneNumber", "budget", "productInterest", "area"];
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
          const district = addr.city_district || addr.county || addr.city || addr.town || "";
          const state = addr.state || "";

          // Area shown to user: just the neighbourhood/suburb
          const areaString = area || district || data.display_name || gpsString;

          setFormData((prev) => ({
            ...prev,
            area: areaString,
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
      const { data } = await leadsAPI.createLead(formData);

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
            <label className="block text-sm font-medium text-theme-slate mb-1">Area *</label>
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

          {/* Budget Field */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Estimated Budget (Rs.) *</label>
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

          {/* Product Interest Field */}
          <div>
            <label className="block text-sm font-medium text-theme-slate mb-1">Product Interest *</label>
            <input
              type="text"
              placeholder="e.g. Winter Jackets, Running Shoes"
              value={formData.productInterest}
              onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
              onBlur={() => handleBlur("productInterest")}
              className={inputClass("productInterest")}
            />
            {errors.productInterest && touched.productInterest && <p className="text-red-500 text-xs mt-1">{errors.productInterest}</p>}
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