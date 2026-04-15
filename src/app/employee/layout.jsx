"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar.jsx";

export default function EmployeeLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const employeeMenu = [
    { href: "/employee/dashboard", label: "My Leads", icon: "📋" },
    { href: "/employee/new_lead", label: "Create New Lead", icon: "➕" },
    { href: "/employee/profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* 2. The Reusable Sidebar on the left */}
      <Sidebar 
        title="Shop Portal"
        subtitle="Employee View"
        menuItems={employeeMenu}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}