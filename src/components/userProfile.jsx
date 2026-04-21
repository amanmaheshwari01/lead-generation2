"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Shield, Store, Pencil, Save, X, Loader2, TrendingUp, LogOut, CheckCircle2, Plus } from "lucide-react";
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      if (data.success) {
        setUser(data.user);
        setEditing(false);
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
    <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-10 animate-fadeIn">
      {/* Cloud Minimalism Card with requested Gray-to-White Gradient */}
      <div className="bg-gradient-to-br from-slate-200 to-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Executive Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 text-4xl font-semibold shadow-sm transition-transform hover:scale-105 duration-500">
                {getInitials(user.name)}
              </div>
            </div>
            <div className="min-w-0 flex-1 w-full space-y-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{user.name}</h2>
                  <p className="text-slate-500 font-medium text-lg">{user.email}</p>
                </div>
                <div className="flex shrink-0">{getRoleBadge(user.role)}</div>
              </div>
              
              {!editing && (
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2.5 px-6 py-3 bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all font-semibold text-xs uppercase tracking-widest active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    Modify Details
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-6 py-3 bg-white text-red-500 border border-red-100 hover:bg-red-50 rounded-2xl transition-all font-semibold text-xs uppercase tracking-widest active:scale-95 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Secure Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
            {[
              { label: "Legal Full Name", value: user.name, field: "name", icon: User },
              { label: "Business Email", value: user.email, field: "email", icon: Mail },
              { label: "Assigned Division", value: user.shop || "Main Headquarters", icon: Store },
              { label: "Authentication Date", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : "April 2024", icon: Shield }
            ].map((item, idx) => (
              <div key={idx} className="space-y-3 group">
                <div className="flex items-center gap-2.5">
                  <div className="text-slate-500">
                    {item.icon && <item.icon size={14} />}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                </div>
                {editing && item.field ? (
                  <input
                    type="text"
                    value={form[item.field]}
                    onChange={(e) => setForm({ ...form, [item.field]: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-slate-400 font-medium text-slate-800 outline-none transition-all bg-white"
                  />
                ) : (
                  <p className="text-xl font-medium text-slate-800 tracking-tight">{item.value}</p>
                )}
              </div>
            ))}
            
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="text-slate-500">
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Status</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                <p className="text-xl font-medium text-slate-800 tracking-tight">Active Connection</p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="flex items-center gap-5 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4.5 bg-slate-800 text-white rounded-2xl font-semibold text-xs tracking-widest hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-slate-800/10"
              >
                <Save className="w-4 h-4" />
                {saving ? "SAVING..." : "COMMIT CHANGES"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-4.5 bg-slate-50 text-slate-500 rounded-2xl font-semibold text-xs tracking-widest hover:bg-slate-100 transition-all cursor-pointer"
              >
                DISCARD
              </button>
            </div>
          ) : (
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Lead Management</p>
                  <p className="text-slate-800 font-semibold text-4xl tracking-tighter">
                    {user.leadCount || 0} <span className="text-slate-500 text-sm font-medium tracking-normal ml-2">Total Managed</span>
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-white rounded-2xl border border-slate-50 shadow-sm flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Optimized Access</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
