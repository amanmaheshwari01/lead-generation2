"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Shield, Store, Pencil, Save, X, Loader2, TrendingUp, LogOut } from "lucide-react";
import { userAPI } from "@/lib/api";
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      router.push("/");
    }
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
    const styles = {
      "Super Admin": { bg: "bg-theme-navy", text: "text-white" },
      "Shop Admin": { bg: "bg-theme-slate", text: "text-white" },
      Employee: { bg: "bg-theme-accent", text: "text-white" },
    };
    const s = styles[role] || styles.Employee;
    return (
      <span className={`${s.bg} ${s.text} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-theme-accent animate-spin" />
          <p className="text-theme-slate text-sm animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-theme-error text-lg">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fadeIn">
      {/* Profile Card */}
      <div className="glass-panel rounded-3xl animate-fadeIn">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Top Identity Section */}
          <div className="flex items-center gap-5">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-accent to-theme-navy flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-theme-navy truncate tracking-tight">{user.name}</h2>
                <div className="hidden sm:block">{getRoleBadge(user.role)}</div>
              </div>
              <p className="text-theme-slate/70 text-sm font-medium">{user.email}</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-theme-navy/5 text-theme-navy hover:bg-theme-navy/10 rounded-xl transition-all font-semibold text-xs cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="sm:hidden">{getRoleBadge(user.role)}</div>

          <hr className="border-theme-slate/5" />

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-[0.2em] mb-2.5">Full Legal Name</p>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-theme-accent/20 focus:border-theme-accent font-semibold text-theme-navy outline-none transition-all shadow-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-theme-navy">{user.name}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-[0.2em] mb-2.5">Registered Email</p>
              {editing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-theme-accent/20 focus:border-theme-accent font-semibold text-theme-navy outline-none transition-all shadow-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-theme-navy">{user.email}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-[0.2em] mb-2.5">Assigned Shop</p>
              <p className="text-sm font-semibold text-theme-navy">{user.shop || "Main Headquarters"}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-[0.2em] mb-2.5">Member Since</p>
              <p className="text-sm font-semibold text-theme-navy">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : "April 2024"}
              </p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-[0.2em] mb-2.5">Account Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-theme-accent opacity-50" />
                <p className="text-sm font-semibold text-theme-navy">Verified Active</p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-theme-accent text-white rounded-xl font-black text-xs shadow-lg shadow-theme-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? "UPDATING..." : "SAVE CHANGES"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-theme-slate/10 text-theme-slate rounded-xl font-black text-xs hover:bg-theme-slate/20 transition-all cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <div className="pt-6 border-t border-theme-slate/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-theme-accent/5 text-theme-accent flex items-center justify-center border border-theme-accent/10">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-theme-slate/40 uppercase tracking-widest">Performance Stat</p>
                  <p className="text-theme-navy font-bold text-lg leading-tight">
                    {user.leadCount || 0} <span className="text-theme-slate text-[10px] font-semibold">Leads Saved</span>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="md:hidden flex items-center justify-center gap-2 px-6 py-2.5 bg-theme-error/10 text-theme-error hover:bg-theme-error hover:text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
