import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ 
  title, 
  subtitle,     
  menuItems, 
  handleLogout,
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up (towards top), hide when scrolling down (towards bottom)
      // Also show if at the very top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
      <AnimatePresence>
        {isVisible && (
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 flex items-center justify-around px-6 h-16 border-b-0"
          >
            {menuItems
              .filter(item => {
                const href = item.href.toLowerCase();
                return href.includes('dashboard') || href.includes('new_lead') || href.includes('profile');
              })
              .map((item) => {
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
                       <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 border-[3px] border-white transition-all duration-300 active:scale-95 group-hover:bg-slate-800">
                         <Plus size={22} strokeWidth={2.5} />
                       </div>
                     </Link>
                   )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-1.5 relative group transition-all duration-300"
                  >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-slate-100/80" : "group-hover:bg-slate-50"}`}>
                      <Icon 
                        size={20} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-all duration-300 ${
                          isActive ? "text-slate-900" : "text-slate-400"
                        }`} 
                      />
                    </div>
                    {isActive && (
                      <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-slate-900 shadow-sm" />
                    )}
                  </Link>
                );
              })}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
