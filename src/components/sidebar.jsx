import { LogOut } from "lucide-react";
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
    <>
      {/* =========================================
          1. DESKTOP SIDEBAR (Hidden on Mobile)
          ========================================= */}
      <aside className="hidden md:flex w-64 m-4 rounded-3xl glass-panel flex-col z-10 sticky top-4 h-[calc(100vh-2rem)] transition-all duration-300">
        <div className="p-8 pb-6">
          <h1 className="text-theme-navy text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-theme-slate/80 text-sm mt-1 font-medium">{subtitle}</p>}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3 font-semibold text-sm ${
                  isActive
                    ? "bg-theme-accent text-white shadow-lg shadow-theme-accent/20 translate-x-1" 
                    : "text-theme-slate hover:bg-theme-accent/5 hover:text-theme-accent hover:translate-x-1"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-theme-slate/70 group-hover:text-theme-accent"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-2xl text-theme-slate hover:bg-theme-error/5 hover:text-theme-error transition-all duration-200 flex items-center gap-3 font-semibold text-sm cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          2. MOBILE FACEBOOK-STYLE BOTTOM TAB BAR
          ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-theme-slate/10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-50 flex items-end justify-around px-2 pb-safe h-16">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href.includes("new_lead");
          const Icon = item.icon;

          if (isCreate) {
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className="flex flex-col items-center justify-center relative -top-3 group"
               >
                 <div className="flex items-center justify-center w-14 h-14 rounded-full bg-theme-accent text-white shadow-xl shadow-theme-accent/30 border-4 border-white transition-transform duration-300 active:scale-95">
                   <Icon size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                 </div>
                 <span className="text-[10px] mt-1 font-bold text-theme-accent translate-y-[2px]">Create</span>
               </Link>
             )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 mb-1 relative group w-16"
            >
              <div 
                className={`flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-theme-accent/10" : "bg-transparent group-hover:bg-theme-slate/5"
                }`}
              >
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-theme-accent" : "text-theme-slate/50 group-hover:text-theme-slate"
                  }`} 
                />
              </div>
              
              <span 
                className={`text-[9px] mt-1 font-bold ${
                  isActive ? "text-theme-accent" : "text-theme-slate/50"
                }`}
              >
                {item.label.split(' ')[0]} {/* Shorthand label */}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}