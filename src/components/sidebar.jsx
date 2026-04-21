import { LogOut, Plus } from "lucide-react";
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
          1. DESKTOP SIDEBAR (Cloud Minimalism)
          ========================================= */}
      <aside className="hidden md:flex w-64 m-4 rounded-[2rem] bg-white border border-slate-200 flex-col z-10 sticky top-4 h-[calc(100vh-2rem)] transition-all duration-300 shadow-sm shadow-slate-200/40">
        <div className="p-8 pb-10">
          <h1 className="text-slate-800 text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">{subtitle}</p>}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-200 flex items-center gap-4 font-medium text-[13px] tracking-tight ${
                  isActive
                    ? "bg-slate-200 text-slate-800 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={18} className={isActive ? "text-slate-800" : "text-slate-500"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-6 py-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex items-center gap-4 font-bold text-[10px] uppercase tracking-widest cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          2. MOBILE NAVIGATION (Minimalist Floating)
          ========================================= */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 flex items-center justify-around px-2 h-16 animate-fadeIn transition-all">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href.includes("new_lead");
          const Icon = item.icon;

          if (isCreate) {
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className="flex flex-col items-center justify-center relative -top-6 group"
               >
                 <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 text-white shadow-2xl shadow-slate-800/20 border-4 border-white transition-all duration-300 active:scale-95">
                   <Plus size={24} strokeWidth={2.5} />
                 </div>
               </Link>
             )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 relative group w-14 transition-all duration-300"
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-all duration-300 ${
                  isActive ? "text-slate-800 scale-110" : "text-slate-400 group-hover:text-slate-600"
                }`} 
              />
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-800 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
