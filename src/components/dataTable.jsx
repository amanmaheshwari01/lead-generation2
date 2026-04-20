"use client";

import { useState, useMemo } from "react";
import { Search, FilterX, SearchX, Inbox } from "lucide-react";

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
}) {
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fadeIn">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {title && <h1 className="text-3xl font-bold text-theme-navy tracking-tight">{title}</h1>}
          {subtitle && <p className="text-theme-slate/80 text-sm mt-2">{subtitle}</p>}
        </div>
        {statsLabel && (
          <div className="flex items-center gap-2 text-xs font-bold bg-theme-accent/5 text-theme-accent px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
            {statsLabel}: {statsValue ?? data.length}
          </div>
        )}
      </header>

      {/* Filter & Search Bar */}
      {(!isLoading && data.length > 0) && (
        <div className="glass-panel p-4 mb-8 rounded-2xl animate-fadeIn [animation-delay:100ms] shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* Global Search */}
            <div className="relative w-full md:flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-slate/40">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-theme-slate/10 focus:border-theme-accent bg-white/70 font-medium text-sm text-theme-navy outline-none transition-all shadow-sm"
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
                className="flex items-center gap-2 p-2.5 shrink-0 bg-theme-error/10 text-theme-error hover:bg-theme-error hover:text-white rounded-xl transition-all cursor-pointer font-bold text-xs"
                title="Clear all filters"
              >
                <FilterX size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="glass-panel rounded-3xl overflow-hidden animate-fadeIn [animation-delay:200ms] shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-theme-accent/20 border-t-theme-accent rounded-full animate-spin"></div>
            <p className="text-theme-slate text-sm animate-pulse font-medium">Syncing database...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <EmptyIcon className="w-16 h-16 text-theme-slate/20 mb-4" />
            <p className="text-theme-navy font-bold text-lg">{emptyTitle}</p>
            <p className="text-theme-slate text-sm mt-1">{emptySubtitle}</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-theme-light/30">
            <SearchX className="w-12 h-12 text-theme-slate/30 mb-3" />
            <p className="text-theme-navy font-bold">No matches found.</p>
            <p className="text-theme-slate text-sm mt-1">Try expanding your search parameters.</p>
            <button 
              onClick={() => { setSearchQuery(""); onClearFilters?.(); }} 
              className="mt-4 text-xs font-bold text-theme-accent hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-theme-navy/5 border-b border-theme-slate/10 text-[10px] text-theme-slate/50 font-bold uppercase tracking-[0.15em]">
                  {columns.map((col) => (
                    <th key={col.key} className={`p-5 ${col.align === 'center' ? 'text-center' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-slate/5">
                {displayData.map((item, index) => (
                  <tr 
                    key={item._id || index} 
                    onClick={() => rowClickable && onRowClick?.(item)}
                    className={`${rowClickable ? 'cursor-pointer' : ''} hover:bg-theme-navy/[0.02] transition-colors group`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`p-5 align-top ${col.align === 'center' ? 'text-center' : ''}`}>
                        {col.render ? col.render(item) : <span className="text-sm font-medium text-theme-navy">{item[col.key] || "-"}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
