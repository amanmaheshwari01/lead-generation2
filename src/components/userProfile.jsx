"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Shield, Store, Pencil, Save, X, Loader2, TrendingUp, LogOut, CheckCircle2, Plus, Users } from "lucide-react";
import { userAPI, authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UserProfile({ initialProfile }) {
  const router = useRouter();
  const [user, setUser] = useState(initialProfile || null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: initialProfile?.name || "", 
    email: initialProfile?.email || "" 
  });
  const [errors, setErrors] = useState({});

  const validateName = (name) => {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) return "Name is required";
    if (trimmed.length < 2 || trimmed.length > 50) return "Name must be between 2 and 50 characters";
    if (!/^[a-zA-Z\s\-\']+$/.test(trimmed)) return "Only letters, spaces, hyphens and apostrophes allowed";
    return null;
  };

  const validateEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return "Email is required";
    if (trimmed.length > 90) return "Email must be under 100 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
    return null;
  };

  const handleSave = async () => {
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);

    if (nameError || emailError) {
      setErrors({
        name: nameError,
        email: emailError
      });
      return;
    }

    setSaving(true);
    const cleanedForm = {
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim().toLowerCase()
    };

    try {
      const { data } = await userAPI.updateProfile(cleanedForm);
      if (data.success) {
        setUser(data.user);
        setEditing(false);
        setErrors({});
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to server");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email });
    setErrors({});
    setEditing(false);
  };

  const handleLogout = () => {
    authAPI.logout();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    return (
      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest border border-slate-200 bg-white shadow-sm">
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Authenticating profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-red-500 text-lg font-medium">Profile data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-12 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        
        {/* Executive Header Section */}
        <header className="mb-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 px-2">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-slate-200 flex items-center justify-center text-slate-800 text-3xl font-bold shadow-xl shadow-slate-200/40 transition-transform duration-500 group-hover:scale-105">
                {getInitials(user.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-sm">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <p className="text-slate-500 font-semibold text-sm">{user.email}</p>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Account</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {getRoleBadge(user.role)}
          </div>
        </header>

        {/* Main Command & Info Hub */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Universal Action Bar - High Accessibility */}
          {!editing && (
            <div className="grid grid-cols-2 md:flex items-center gap-2 p-3 bg-slate-50/50 border-b border-slate-100">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 border border-slate-200/60 hover:bg-slate-100 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>

              {user.role === "Shop Admin" && (
                <>
                  <button
                    onClick={() => router.push("/admin/manage_employees")}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 border border-slate-200/60 hover:bg-slate-100 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Staff
                  </button>
                  <button
                    onClick={() => router.push("/admin/products")}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 border border-slate-200/60 hover:bg-slate-100 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Products
                  </button>
                </>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50/50 text-red-500 border border-red-100/50 hover:bg-red-50 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-wider cursor-pointer shadow-sm ml-auto col-span-2 md:col-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}

          <div className="p-8 md:p-12 space-y-10">
            
            {/* Information Grid - Linear & Professional */}
            <div className="space-y-8">
              {[
                { label: "Full Legal Name", value: user.name, field: "name", icon: User },
                { label: "Business Email Address", value: user.email, field: "email", icon: Mail },
                { label: "Division / Shop Location", value: user.shop || "Global Headquarters", icon: Store },
                { label: "Account Activity", value: `${user.leadCount || 0} Leads Managed`, icon: TrendingUp },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 opacity-60">
                      <item.icon size={12} className="text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                    </div>
                    
                    {editing && item.field ? (
                      <div className="relative max-w-lg">
                        <input
                          type="text"
                          value={form[item.field]}
                          onChange={(e) => setForm({ ...form, [item.field]: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors[item.field] ? "border-red-400" : "border-slate-200 focus:border-slate-400"
                          } font-bold text-slate-800 outline-none transition-all bg-slate-50/30`}
                        />
                        {errors[item.field] && (
                          <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{errors[item.field]}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-slate-800 tracking-tight">{item.value}</p>
                    )}
                  </div>
                  {!editing && <div className="h-px sm:h-auto sm:w-px bg-slate-100 sm:mx-8"></div>}
                </div>
              ))}
            </div>

            {editing && (
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-widest hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-10 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold text-[11px] tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )}

            {!editing && (
              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">
                  <Shield size={14} />
                  Enterprise Data Protection Enabled
                </div>
                <div className="text-[10px] font-bold text-slate-300">ID: {user._id?.slice(-8).toUpperCase()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
