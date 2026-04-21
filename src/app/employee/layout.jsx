"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar.jsx";
import { LayoutDashboard, PlusCircle, User } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function EmployeeLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    authAPI.logout();
  };

  const employeeMenu = [
    { href: "/employee/dashboard", label: "My Leads", icon: LayoutDashboard },
    { href: "/employee/new_lead", label: "Create New Lead", icon: PlusCircle },
    { href: "/employee/profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0">
      
      {/* 2. The Reusable Sidebar on the left */}
      <Sidebar 
        title="Shop Portal"
        subtitle="Employee View"
        menuItems={employeeMenu}
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