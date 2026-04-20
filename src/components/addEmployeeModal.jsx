"use client";

import { useState } from "react";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { 
  Lock, 
  User, 
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

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

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!isOpen) return null;

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.length < 2 ? "Name is too short" : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email address" : "";
      case "password":
        return value.length < 6 ? "Password must be at least 6 characters" : "";
      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : "";
      default:
        return "";
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "Employee"
      });

      if (response.data.success) {
        toast.success("Employee registered successfully!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-navy/20 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-theme-slate/10 flex items-center justify-between bg-white/50">
          <div>
            <h2 className="text-xl font-bold text-theme-navy flex items-center gap-2">
              <User size={20} className="text-theme-accent" />
              Register Employee
            </h2>
            <p className="text-theme-slate/70 text-[11px] font-medium uppercase tracking-wider mt-0.5">Shop Admin Portal</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-theme-error/10 text-theme-slate hover:text-theme-error rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <InputWrapper label="Full Name" fieldName="name" icon={User} touched={touched} errors={errors} formData={formData}>
            <input
              type="text"
              name="name"
              placeholder="Ex: John Doe"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              className={inputClass("name")}
            />
          </InputWrapper>

          <InputWrapper label="Email Address" fieldName="email" icon={Mail} touched={touched} errors={errors} formData={formData}>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={inputClass("email")}
            />
          </InputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWrapper label="Password" fieldName="password" icon={Lock} touched={touched} errors={errors} formData={formData}>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                className={inputClass("password")}
              />
            </InputWrapper>

            <InputWrapper label="Confirm" fieldName="confirmPassword" icon={Lock} touched={touched} errors={errors} formData={formData}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                className={inputClass("confirmPassword")}
              />
            </InputWrapper>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-6 rounded-2xl border border-theme-slate/20 text-theme-slate font-bold text-sm hover:bg-theme-slate/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-[2] group relative overflow-hidden text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                isSubmitting 
                  ? "bg-theme-slate/30 cursor-not-allowed" 
                  : "bg-theme-navy hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              {!isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-theme-accent to-theme-navy opacity-0 group-hover:opacity-20 transition-opacity" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
