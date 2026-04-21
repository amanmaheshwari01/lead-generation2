"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar.jsx";
import { BarChart3, PlusCircle, User, Store, Users } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    authAPI.logout();
  };

  const adminMenu = [
    { href: "/admin/dashboard", label: "All Shop Leads", icon: BarChart3 },
    { href: "/admin/products", label: "Products Catalog", icon: Store },
    { href: "/admin/new_lead", label: "Create Lead  ", icon: PlusCircle },
    { href: "/admin/manage_employees", label: "Staff Directory", icon: Users },
    { href: "/admin/profile", label: "My Profile", icon: User }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0">
      
      <Sidebar 
        title="Manager Portal"
        subtitle="Shop Admin View"
        menuItems={adminMenu}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}