"use client";

import { useState, useMemo } from "react";
import { Search, FilterX, SearchX, Inbox, ListFilter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger,
  SheetFooter
} from "./ui/sheet";
import { cn } from "@/lib/utils";

export default function DataTable({
  data = [],
  columns = [],
  title,
  subtitle,
  statsLabel,
  statsValue,
  searchPlaceholder = "Search...",
  searchFields = [], // Fields to search in
  filters, // Extra filter components
  activeFilterCount = 0,
  onClearFilters,
  isLoading = false,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = "No data found",
  emptySubtitle = "Items will appear here once added.",
  rowClickable = false,
  onRowClick,
  forceFilterVisible = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(forceFilterVisible);

  // Filter based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((item) => {
      return searchFields.some((field) => {
        const val = item[field];
        if (typeof val === "string") return val.toLowerCase().includes(lowerQuery);
        if (Array.isArray(val)) return val.join(" ").toLowerCase().includes(lowerQuery);
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  const displayData = filteredData;

  return (
    <div className="w-full p-2 md:p-4 animate-fadeIn">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
        <div className="flex-1">
          {title && <h1 className="text-4xl font-bold text-theme-navy tracking-tight">{title}</h1>}
          {subtitle && <p className="text-theme-slate/80 text-base mt-2 font-semibold">{subtitle}</p>}
        </div>
        
        <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
          {statsLabel && (
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold bg-theme-accent/5 text-theme-accent px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-theme-accent/10 whitespace-nowrap">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-theme-accent"></span>
              {statsLabel}: {statsValue ?? data.length}
            </div>
          )}

          {/* Sheet Trigger for Mobile Filters */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95",
                    activeFilterCount > 0 || searchQuery
                      ? "bg-theme-navy text-white shadow-theme-navy/20"
                      : "bg-white text-theme-navy border border-theme-slate/10"
                  )}
                >
                  <ListFilter size={16} />
                  <span>Filters</span>
                  {(activeFilterCount > 0 || searchQuery) && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-theme-accent text-[9px] text-white animate-in zoom-in">
                      {activeFilterCount + (searchQuery ? 1 : 0)}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <SheetHeader>
                  <SheetTitle>Filter Database</SheetTitle>
                  <SheetDescription>Refine your results by searching or applying filters.</SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                  {/* Global Search in Mobile Sheet */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-theme-slate uppercase tracking-widest ml-1">Search Keyword</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-slate/40 group-focus-within:text-theme-accent transition-colors">
                        <Search size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-theme-slate/10 focus:border-theme-accent bg-theme-light/50 font-bold text-sm text-theme-navy outline-none transition-all shadow-sm shadow-theme-navy/[0.02]"
                      />
                    </div>
                  </div>
                  
                  {/* Category Filters */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-theme-slate uppercase tracking-widest ml-1">Properties</label>
                     <div className="flex flex-col gap-4">
                        {filters}
                     </div>
                  </div>
                </div>

                <SheetFooter className="p-6">
                  {/* Clear All Option inside Sheet */}
                  {(activeFilterCount > 0 || searchQuery) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        onClearFilters?.();
                      }}
                      className="w-full py-4 text-theme-error font-bold text-xs uppercase tracking-widest border-2 border-theme-error/5 rounded-2xl hover:bg-theme-error/5 transition-all mb-2"
                    >
                      Reset All Filters
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      // We use the Escape key event to trigger the Sheet internal setOpen(false) 
                      // as a simple way to close the custom sheet component.
                      const event = new KeyboardEvent('keyup', { key: 'Escape' });
                      window.dispatchEvent(event);
                    }}
                    className="w-full py-5 bg-theme-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-theme-navy/30 active:scale-[0.98] transition-all"
                  >
                    Apply & Close
                  </button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {!forceFilterVisible && (
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 ${
                isFilterVisible 
                  ? "bg-theme-navy text-white shadow-theme-navy/20" 
                  : "bg-white text-theme-navy border border-theme-slate/10 hover:border-theme-accent hover:text-theme-accent"
              }`}
            >
              {isFilterVisible ? <X size={16} /> : <ListFilter size={16} />}
              <span>{isFilterVisible ? "Close Filters" : "Filters"}</span>
              {(activeFilterCount > 0 || searchQuery) && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-theme-accent text-[9px] text-white animate-in zoom-in">
                  {activeFilterCount + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {(!isLoading && (data.length > 0 || searchQuery || activeFilterCount > 0) && (isFilterVisible || forceFilterVisible)) && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "hidden md:block glass-panel overflow-hidden rounded-2xl shadow-sm border border-theme-accent/5",
              forceFilterVisible ? 'p-3 sm:p-4' : 'p-4'
            )}
          >
            <div className={cn(
              "flex items-stretch gap-3",
              forceFilterVisible ? 'flex-row items-center' : 'flex-col md:flex-row md:items-center md:gap-4'
            )}>
              
              {/* Global Search */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-theme-slate/40 group-focus-within:text-theme-accent transition-colors">
                  <Search size={forceFilterVisible ? 14 : 16} />
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pr-4 rounded-xl border border-theme-slate/10 focus:border-theme-accent bg-white/70 font-medium text-theme-navy outline-none transition-all shadow-sm",
                    forceFilterVisible ? 'pl-8 py-2 text-[11px]' : 'pl-10 py-2.5 text-sm'
                  )}
                />
              </div>

              {/* Injected Filters */}
              {filters}

              {/* Clear Filters Button */}
              {(activeFilterCount > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    onClearFilters?.();
                  }}
                  className={cn(
                    "flex items-center gap-2 shrink-0 bg-theme-error/10 text-theme-error hover:bg-theme-error hover:text-white rounded-xl transition-all cursor-pointer font-bold",
                    forceFilterVisible ? 'p-2 text-[10px]' : 'p-2.5 text-xs'
                  )}
                  title="Clear all filters"
                >
                  <FilterX size={forceFilterVisible ? 14 : 16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Content */}
      <div className="glass-panel rounded-3xl overflow-hidden animate-fadeIn [animation-delay:200ms] shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-theme-accent/20 border-t-theme-accent rounded-full animate-spin"></div>
            <p className="text-theme-slate text-sm animate-pulse font-medium">Syncing database...</p>
          </div>
        ) : (data.length === 0 && activeFilterCount === 0 && !searchQuery) ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <EmptyIcon className="w-16 h-16 text-theme-slate/20 mb-4" />
            <p className="text-theme-navy font-bold text-lg">{emptyTitle}</p>
            <p className="text-theme-slate text-sm mt-1">{emptySubtitle}</p>
          </div>
        ) : (displayData.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-theme-light/30">
            <SearchX className="w-12 h-12 text-theme-slate/30 mb-3" />
            <p className="text-theme-navy font-bold">No results match your criteria.</p>
            <p className="text-theme-slate text-sm mt-1">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => { setSearchQuery(""); onClearFilters?.(); }} 
              className="mt-4 text-xs font-bold text-theme-accent hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-theme-navy/5 border-b border-theme-slate/10 text-xs text-theme-slate/50 font-bold uppercase tracking-[0.2em]">
                  {columns.map((col) => (
                    <th key={col.key} className={`p-6 ${col.align === 'center' ? 'text-center' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-slate/5">
                <AnimatePresence mode="popLayout">
                  {displayData.map((item, index) => (
                    <motion.tr 
                      key={item._id || index} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => rowClickable && onRowClick?.(item)}
                      className={`${rowClickable ? 'cursor-pointer' : ''} hover:bg-theme-navy/[0.02] transition-colors group`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`p-6.5 align-top ${col.align === 'center' ? 'text-center' : ''}`}>
                          {col.render ? col.render(item) : <span className="text-base font-medium text-theme-navy">{item[col.key] || "-"}</span>}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
