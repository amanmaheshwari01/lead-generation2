"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar.jsx"; // Using the reusable component!

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // 1. Define the specific menu buttons for the Admin
  // Notice these point to the /admin/ routes you just created
  const adminMenu = [
    { href: "/admin/dashboard", label: "All Shop Leads", icon: "📊" },
    { href: "/admin/new_lead", label: "Create Lead (Admin)", icon: "➕" },
    { href: "/admin/profile", label: "My Profile", icon: "👤" }
  ];

  return (
    <div className="flex min-h-screen bg-theme-light font-sans">
      
      {/* 2. Pass the admin details to your Sidebar */}
      <Sidebar 
        title="Manager Portal"
        subtitle="Shop Admin View"
        menuItems={adminMenu}
        handleLogout={handleLogout}
      />

      {/* 3. The Main Content Area */}
      {/* Next.js injects your admin/dashboard or admin/new-lead pages right here */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}