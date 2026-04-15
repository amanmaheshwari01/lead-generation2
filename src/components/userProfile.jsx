"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Shield, Store, Pencil, Save, X, Loader2 } from "lucide-react";
import { userAPI } from "@/lib/api";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      if (data.success) {
        setUser(data.user);
        setForm({ name: data.user.name, email: data.user.email });
      } else {
        toast.error(data.message || "Failed to load profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

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
      "Super Admin": { bg: "bg-gradient-to-r from-amber-500 to-orange-500", text: "text-white" },
      "Shop Admin": { bg: "bg-gradient-to-r from-violet-500 to-purple-600", text: "text-white" },
      Employee: { bg: "bg-gradient-to-r from-cyan-500 to-blue-500", text: "text-white" },
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
        <p className="text-red-400 text-lg">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-navy tracking-tight">My Profile</h1>
        <p className="text-theme-slate mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Gradient Banner */}
        <div className="h-36 bg-gradient-to-br from-theme-accent via-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="bg-white px-6 md:px-10 pb-8 pt-0 relative">
          {/* Avatar */}
          <div className="flex items-end gap-5 -mt-14 mb-6">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white shrink-0 select-none">
              {getInitials(user.name)}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-theme-navy truncate">{user.name}</h2>
                {getRoleBadge(user.role)}
              </div>
              <p className="text-theme-slate text-sm mt-1 truncate">{user.email}</p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100 mb-6" />

          {/* Info Fields */}
          <div className="space-y-5">
            {/* Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-semibold text-theme-slate uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              {editing ? (
                <input
                  id="profile-name-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-theme-accent/30 focus:border-theme-accent focus:outline-none text-theme-navy font-medium transition-colors bg-blue-50/50"
                />
              ) : (
                <p className="px-4 py-3 rounded-xl bg-gray-50 text-theme-navy font-medium border-2 border-transparent">
                  {user.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-semibold text-theme-slate uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              {editing ? (
                <input
                  id="profile-email-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-theme-accent/30 focus:border-theme-accent focus:outline-none text-theme-navy font-medium transition-colors bg-blue-50/50"
                />
              ) : (
                <p className="px-4 py-3 rounded-xl bg-gray-50 text-theme-navy font-medium border-2 border-transparent">
                  {user.email}
                </p>
              )}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-theme-slate uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" /> Role
              </label>
              <p className="px-4 py-3 rounded-xl bg-gray-50 text-theme-navy font-medium border-2 border-transparent">
                {user.role}
              </p>
            </div>

            {/* Shop (read-only) */}
            {user.shop && (
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-theme-slate uppercase tracking-wider mb-2">
                  <Store className="w-3.5 h-3.5" /> Shop
                </label>
                <p className="px-4 py-3 rounded-xl bg-gray-50 text-theme-navy font-medium border-2 border-transparent">
                  {user.shop}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-3">
            {editing ? (
              <>
                <button
                  id="profile-save-btn"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.email.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-theme-accent to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  id="profile-cancel-btn"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-theme-slate rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                id="profile-edit-btn"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-theme-accent to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
