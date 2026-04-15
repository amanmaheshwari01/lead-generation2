"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ 
  title, 
  subtitle,     
  menuItems, 
  handleLogout,
}) {

  const pathname = usePathname();

  return (
    <aside className="w-64 bg-theme-navy flex flex-col shadow-xl z-10 min-h-screen">
      
      {/* 1. Dynamic Header */}
      <div className="p-6 border-b border-theme-slate/30">
        <h1 className="text-white text-xl font-bold tracking-wide">{title}</h1>
        {subtitle && <p className="text-theme-slate text-sm mt-1">{subtitle}</p>}
      </div>

      {/* 2. Dynamic Menu Items (UPGRADED TO LINKS) */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // Automatically checks if the current URL matches this button's link
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href} // Uses href instead of onClick
              className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center space-x-3 ${
                isActive
                  ? "bg-theme-accent text-white shadow-md" 
                  : "text-theme-slate hover:bg-theme-slate/20 hover:text-white"
              }`}
            >
               
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Static Logout Footer */}
      <div className="p-4 border-t border-theme-slate/30">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-theme-slate hover:text-red-400 transition-colors flex items-center space-x-3"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}