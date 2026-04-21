"use client";

import { useState } from "react";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Briefcase, 
  Plus, 
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";
import ClientPortal from "./clientPortal";

const InputWrapper = ({ label, fieldName, icon: Icon, touched, errors, formData, children }) => (
  <div className="space-y-1.5 flex-1">
    <div className="flex justify-between items-center px-1">
      <label className="block text-[10px] font-bold text-theme-slate/60 uppercase tracking-widest">{label}</label>
      {touched[fieldName] && (
        <span className="flex items-center">
          {errors[fieldName] ? (
            <AlertCircle size={14} className="text-theme-error" />
          ) : formData[fieldName] ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : null}
        </span>
      )}
    </div>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
        errors[fieldName] && touched[fieldName] ? "text-theme-error" : "text-theme-slate/40 group-focus-within:text-theme-accent"
      }`}>
        <Icon size={18} />
      </div>
      {children}
    </div>
    {errors[fieldName] && touched[fieldName] && (
      <p className="text-theme-error text-[10px] font-semibold px-1 animate-in slide-in-from-top-1">{errors[fieldName]}</p>
    )}
  </div>
);

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.length < 2 ? "Name is too short" : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email address" : "";
      case "password":
        return value.length < 4 ? "Password must be at least 4 characters" : "";
      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : "";
      case "role":
        return !value ? "Role is required" : "";
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
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Cross-field validation: If password changes, re-validate confirmPassword
    if (name === "password") {
      const error = validateField("password", value);
      const confirmError = value !== formData.confirmPassword && formData.confirmPassword ? "Passwords do not match" : "";
      setErrors(prev => ({ 
        ...prev, 
        password: error,
        confirmPassword: formData.confirmPassword ? confirmError : prev.confirmPassword
      }));
    } else if (touched[name]) {
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
      setTouched({ name: true, email: true, password: true, confirmPassword: true, role: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        toast.success(`${formData.role} registered successfully!`);
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "Employee" });
        setTouched({});
        setErrors({});
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
    return `w-full pl-12 pr-4 py-4 bg-theme-navy/5 border-2 transition-all font-semibold text-theme-navy outline-none rounded-2xl ${
      hasError 
        ? "border-theme-error/20 focus:border-theme-error bg-theme-error/[0.02]" 
        : "border-transparent focus:border-theme-accent focus:bg-white shadow-sm"
    }`;
  };

  return (
    <ClientPortal selector="body">
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-16 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-theme-navy/40 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-theme-navy/30 overflow-hidden border border-white/40"
          >
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-theme-accent via-theme-navy to-theme-accent" />
            
            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-theme-accent/10 flex items-center justify-center text-theme-accent shadow-sm border border-theme-accent/10">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-theme-navy tracking-tight">Onboard Staff</h2>
                    <p className="text-theme-slate text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Admin Management Portal</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-theme-navy/5 rounded-2xl transition-all active:scale-90 text-theme-slate/40 hover:text-theme-navy"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <InputWrapper label="Full Name" fieldName="name" icon={User} touched={touched} errors={errors} formData={formData}>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
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
                      placeholder="john@store.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      className={inputClass("email")}
                    />
                  </InputWrapper>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputWrapper label="Password" fieldName="password" icon={Lock} touched={touched} errors={errors} formData={formData}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur("password")}
                        className={inputClass("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-slate/40 hover:text-theme-accent transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </InputWrapper>
                    <InputWrapper label="Verify Password" fieldName="confirmPassword" icon={Lock} touched={touched} errors={errors} formData={formData}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur("confirmPassword")}
                        className={inputClass("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-slate/40 hover:text-theme-accent transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </InputWrapper>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <Shield size={16} className="text-theme-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-slate">Assign Access Level</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'Employee', label: 'Staff Access', icon: Briefcase, desc: 'Lead Entry Only' },
                      { id: 'Shop Admin', label: 'Admin Access', icon: Shield, desc: 'Full Management' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 active:scale-95 text-left ${
                          formData.role === role.id 
                            ? "border-theme-accent bg-theme-accent/[0.03] shadow-sm shadow-theme-accent/5" 
                            : "border-theme-navy/5 bg-theme-navy/[0.01] hover:border-theme-navy/10"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${
                          formData.role === role.id ? "bg-theme-accent text-white shadow-md shadow-theme-accent/20" : "bg-white text-theme-slate shadow-sm"
                        }`}>
                          <role.icon size={20} />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${
                          formData.role === role.id ? "text-theme-navy" : "text-theme-slate/60"
                        }`}>
                          {role.label}
                        </span>
                        <span className="text-[9px] font-bold text-theme-slate/40 uppercase tracking-tighter">
                          {role.desc}
                        </span>
                        {/* Role selection indicator point removed as per user request */}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4.5 px-6 rounded-2xl border-2 border-theme-navy/5 text-theme-slate font-black text-xs uppercase tracking-widest hover:bg-theme-navy/5 hover:border-theme-navy/10 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4.5 px-6 bg-theme-navy hover:bg-theme-navy/90 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-theme-navy/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>Onboard Staff</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </ClientPortal>
  );
}
