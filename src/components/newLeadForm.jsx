"use client";

import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { leadsAPI, userAPI } from "@/lib/api";
import pluralize from "pluralize";
import { 
  User, 
  Phone, 
  MapPin, 
  Map, 
  Globe, 
  Wallet, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Activity,
  ChevronRight
} from "lucide-react";
     
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-theme-slate/10">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-theme-accent/10 rounded-lg text-theme-accent">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-theme-navy leading-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-theme-slate/70">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="animate-fadeIn">{action}</div>}
  </div>
);

const InputWrapper = ({ label, fieldName, icon: Icon, touched, errors, formData, children }) => (
  <div className="space-y-1.5 flex-1">
    <div className="flex justify-between items-center">
      <label className="block text-[10px] font-semibold text-theme-slate/60 uppercase tracking-widest">{label}</label>
      {touched[fieldName] && (
        <span className="animate-in zoom-in duration-300">
          {errors[fieldName] ? (
            <AlertCircle size={14} className="text-theme-error" />
          ) : formData[fieldName] ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : null}
        </span>
      )}
    </div>
    <div className="relative group">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
        errors[fieldName] && touched[fieldName] ? "text-theme-error" : "text-theme-slate/50 group-focus-within:text-theme-accent"
      }`}>
        <Icon size={18} />
      </div>
      {children}
    </div>
    {errors[fieldName] && touched[fieldName] && (
      <p className="text-theme-error text-[10px] font-medium animate-in slide-in-from-top-1">{errors[fieldName]}</p>
    )}
  </div>
);
     
export default function NewLeadForm({ redirectPath, initialProducts = [] }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    budget: "",
    productInterest: [],
    area: "",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    gpsCoordinates: "",
  });

  // Automatically parse initial products passed down from Server Route
  // Map logic safely handles if they are string arrays or object arrays { productName: "Bat" }
  const uniqueProductNames = [...new Set(initialProducts.map(p => typeof p === 'string' ? p : p.productName))].filter(Boolean);
  const [productOptions] = useState(uniqueProductNames.length > 0 ? [...uniqueProductNames, "Other"] : ["Other"]);
  
  const [otherProductName, setOtherProductName] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Phone number formatter (Indian format: XXXXX XXXXX)
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  };

  // Per-field validation rules
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "customerName":
        if (value.trim().length < 2) return "Name must be at least 2 characters long.";
        return "";
      case "phoneNumber": {
        const cleaned = value.replace(/\D/g, "");
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(cleaned)) return "Phone number must be exactly 10 digits.";
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
        const normalizedOther = pluralize.plural(otherProductName.trim());
        finalProductInterest = finalProductInterest.map(p => p === "Other" ? normalizedOther : p);
      } else if (finalProductInterest.includes("Other")) {
        finalProductInterest = finalProductInterest.filter(p => p !== "Other");
      }

      const submissionData = {
        ...formData,
        phoneNumber: formData.phoneNumber.replace(/\s/g, ""), // Remove spaces for DB
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
  const inputClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const isSuccess = !errors[fieldName] && touched[fieldName] && formData[fieldName];

    return `w-full p-2.5 pl-10 border rounded-lg outline-none transition-all text-theme-navy text-sm ${
      hasError
        ? "border-theme-error bg-theme-error/5 ring-1 ring-theme-error/10"
        : isSuccess
        ? "border-green-500/50 bg-green-50/20"
        : "border-theme-slate/20 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent bg-white shadow-sm"
    }`;
  };



  return (
    <div className="flex flex-col max-w-4xl mx-auto px-4 py-6">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/5 text-theme-accent text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">
          <Activity size={12} /> New Walk-In
        </div>
        <h1 className="text-3xl font-bold text-theme-navy tracking-tight">Log New Walk-In</h1>
        <p className="text-theme-slate/80 mt-2 text-sm max-w-sm mx-auto">Enter walk-in details to save them for future festival offers and WhatsApp updates.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Customer Profile */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl animate-fadeIn">
          <SectionHeader 
            icon={User} 
            title="Walk-In Details" 
            subtitle="Basic contact info for WhatsApp messaging"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<InputWrapper label="Customer Name *" fieldName="customerName" icon={User} touched={touched} errors={errors} formData={formData}>
              <input
                type="text"
                placeholder="Jane Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                onBlur={() => handleBlur("customerName")}
                className={inputClass("customerName")}
              />
            </InputWrapper>

            <InputWrapper label="Phone Number *" fieldName="phoneNumber" icon={Phone} touched={touched} errors={errors} formData={formData}>
              <input
                type="tel"
                placeholder="98765 43210"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData({ ...formData, phoneNumber: formatted });
                }}
                onBlur={() => handleBlur("phoneNumber")}
                className={inputClass("phoneNumber")}
              />
            </InputWrapper>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl animate-fadeIn [animation-delay:100ms]">
          <SectionHeader 
            icon={MapPin} 
            title="Address / Area" 
            subtitle="Where is the walk-in from?"
            action={
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isFetchingLocation}
                className={`p-2 rounded-full transition-all ${
                  isFetchingLocation 
                    ? "text-theme-accent animate-pulse cursor-not-allowed" 
                    : "text-theme-accent hover:bg-theme-accent/10 cursor-pointer active:scale-90"
                }`}
                title="Use GPS Location"
              >
                {isFetchingLocation ? (
                  <div className="h-5 w-5 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Globe size={22} className={formData.gpsCoordinates ? "animate-pulse" : ""} />
                )}
              </button>
            }
          />
          
          <div className="space-y-6">
            <div className="space-y-1.5 flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[10px] font-semibold text-theme-slate/60 uppercase tracking-widest">Area / Locality</label>
                {touched.area && (
                  <div className="animate-in zoom-in duration-300">
                    {errors.area ? (
                      <AlertCircle size={14} className="text-theme-error" />
                    ) : formData.area ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              <div className="relative group">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.area && touched.area ? "text-theme-error" : "text-theme-slate/50 group-focus-within:text-theme-accent"
                }`}>
                  <Map size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Koramangala"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  onBlur={() => handleBlur("area")}
                  className={inputClass("area")}
                />
              </div>
              {errors.area && touched.area && (
                <p className="text-theme-error text-[10px] font-medium animate-in slide-in-from-top-1">{errors.area}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWrapper label="City" fieldName="city" icon={MapPin} touched={touched} errors={errors} formData={formData}>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={inputClass("city")}
                />
              </InputWrapper>
              <InputWrapper label="District" fieldName="district" icon={MapPin} touched={touched} errors={errors} formData={formData}>
                <input
                  type="text"
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className={inputClass("district")}
                />
              </InputWrapper>
              <InputWrapper label="State" fieldName="state" icon={MapPin} touched={touched} errors={errors} formData={formData}>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={inputClass("state")}
                />
              </InputWrapper>
            </div>
          </div>
        </div>

        {/* Section 3: Lead Requirements */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl animate-fadeIn [animation-delay:200ms]">
          <SectionHeader 
            icon={Package} 
            title="What are they looking for?" 
            subtitle="Products and budget"
          />

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-semibold text-theme-slate/60 uppercase tracking-widest">Budget (₹)</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-slate/50 group-focus-within:text-theme-accent">
                  <Wallet size={18} />
                </div>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  onBlur={() => handleBlur("budget")}
                  className={inputClass("budget")}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["500", "1500", "5000", "10000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData({ ...formData, budget: amt })}
                    className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      formData.budget === amt 
                        ? "bg-theme-navy text-white border-theme-navy shadow-md" 
                        : "bg-white text-theme-slate border-theme-slate/10 hover:border-theme-accent hover:text-theme-accent shadow-sm"
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-semibold text-theme-slate/60 uppercase tracking-widest">Product They Want</label>
                {formData.productInterest.length > 0 && (
                  <span className="bg-theme-accent text-white text-[9px] font-bold h-4 px-2 rounded-full flex items-center shadow-sm animate-in zoom-in">
                    {formData.productInterest.length} Selected
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {productOptions.length > 0 ? (
                  productOptions.map((product) => {
                    const isChecked = formData.productInterest.includes(product);
                    return (
                      <label
                        key={product}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? "border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent shadow-sm"
                            : "border-theme-slate/10 hover:border-theme-slate/30 bg-theme-light/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => handleProductToggle(product)}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked ? "bg-theme-accent border-theme-accent" : "bg-white border-theme-slate/30"
                        }`}>
                          {isChecked && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-xs ${isChecked ? "text-theme-navy font-semibold" : "text-theme-slate font-normal"}`}>
                          {product}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="col-span-full py-6 text-center rounded-xl bg-theme-light/50 border border-dashed border-theme-slate/20">
                     <p className="text-xs text-theme-slate">No products available. Please have the Shop Admin add products to the catalog first.</p>
                  </div>
                )}
              </div>

              {formData.productInterest.includes("Other") && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <InputWrapper label="Type Product Name" fieldName="otherProduct" icon={ChevronRight} touched={touched} errors={errors} formData={formData}>
                    <input
                      type="text"
                      placeholder="e.g. Swimming Goggles"
                      value={otherProductName}
                      onChange={(e) => setOtherProductName(e.target.value)}
                      className={inputClass("otherProduct")}
                      autoFocus
                    />
                  </InputWrapper>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full group relative overflow-hidden text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
              isSubmitting 
                ? "bg-theme-slate/30 cursor-not-allowed" 
                : "bg-theme-navy hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Walk-In</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
            {!isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-theme-accent to-theme-navy opacity-0 group-hover:opacity-20 transition-opacity" />
            )}
          </button>
          <p className="text-center text-[10px] text-theme-slate mt-4 uppercase tracking-tighter">
            Saved securely for store owners
          </p>
        </div>
      </form>
    </div>
  );
}