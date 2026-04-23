"use client";

import { useState, useMemo } from "react";
import DataTable from "./dataTable.jsx";
import { MapPin, Map as MapIcon, Wallet, User, Phone } from "lucide-react";

export default function LeadsTable({ initialLeads = [] }) {
  const [leads] = useState(initialLeads);
  
  // Filters State
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // 1. Derive unique dynamic areas from the 'location' field
  const uniqueAreas = useMemo(() => {
    const areas = leads.map(l => l.location).filter(Boolean);
    return ["All", ...new Set(areas)];
  }, [leads]);

  // 2. Filter computation engine
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Area/Location Match
      const matchesArea = selectedArea === "All" || lead.location === selectedArea;

      // Budget Range Match
      let matchesBudget = true;
      if (selectedBudget !== "All") {
        const budget = Number(lead.budget) || 0;
        if (selectedBudget === "under1k") matchesBudget = budget > 0 && budget < 1000;
        else if (selectedBudget === "1kTo5k") matchesBudget = budget >= 1000 && budget <= 5000;
        else if (selectedBudget === "5kTo15k") matchesBudget = budget > 5000 && budget <= 15000;
        else if (selectedBudget === "above15k") matchesBudget = budget > 15000;
      }

      return matchesArea && matchesBudget;
    });
  }, [leads, selectedArea, selectedBudget]);

  const activeFilterCount = (selectedArea !== "All" ? 1 : 0) + (selectedBudget !== "All" ? 1 : 0);

  const clearFilters = () => {
    setSelectedArea("All");
    setSelectedBudget("All");
  };

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (lead) => (
        <span suppressHydrationWarning className="text-sm font-semibold text-theme-slate/80">
          {formatDate(lead.createdAt)}
        </span>
      )
    },
    {
      key: "customerName",
      label: "Customer",
      render: (lead) => (
        <div className="flex flex-col gap-1 min-w-[160px]">
          <span className="text-base font-bold text-theme-navy leading-tight">
            {lead.customerName?.trim() ? lead.customerName : "-"}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-theme-slate/80 font-semibold">
            <Phone size={13} className="text-theme-slate/50" />
            {lead.phoneNumber?.trim() ? lead.phoneNumber : "-"}
          </div>
        </div>
      )
    },
    {
      key: "productInterest",
      label: "Product",
      align: "center",
      render: (lead) => (
        <div className="flex flex-wrap gap-1 max-w-[150px] justify-center">
          {Array.isArray(lead.productInterest) && lead.productInterest.filter(p => p?.trim()).length > 0 ? (
            lead.productInterest.filter(p => p?.trim()).map((p, idx) => (
              <span key={idx} className="text-xs font-bold text-theme-accent bg-theme-accent/10 px-3 py-1 rounded-lg truncate">
                {p}
              </span>
            ))
          ) : (
            "-"
          )}
        </div>
      )
    },
    {
      key: "location",
      label: "Area / Location",
      render: (lead) => (
        <div className="flex flex-col gap-0.5">
          {lead.location?.trim() ? (
            <div className="flex items-center gap-1.5 text-sm text-theme-navy font-bold">
              {lead.location}
            </div>
          ) : (
            <span className="text-theme-slate/40">-</span>
          )}
          {(lead.city?.trim() || lead.state?.trim()) && (
            <div className="text-[10px] text-theme-slate font-semibold uppercase tracking-wider">
              {[lead.city?.trim(), lead.state?.trim()].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      )
    },
    {
      key: "budget",
      label: "Budget",
      align: "center",
      render: (lead) => (
        lead.budget ? (
          <span className="text-lg font-black text-theme-navy">
            ₹{Number(lead.budget).toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-theme-slate/40">-</span>
        )
      )
    },
    {
      key: "createdBy",
      label: "By",
      align: "center",
      render: (lead) => (
        <div className="flex items-center gap-2 justify-center" title={lead.createdBy?.name || "Unknown"}>
          {lead.createdBy?.name?.trim() ? (
            <>
              <div className="w-6 h-6 rounded-full bg-theme-navy/5 flex items-center justify-center text-[10px] font-bold text-theme-navy shrink-0">
                {lead.createdBy.name[0].toUpperCase()}
              </div>
              <span className="text-[10px] font-medium text-theme-navy/70 truncate hidden lg:inline">
                {lead.createdBy.name.split(' ')[0]}
              </span>
            </>
          ) : (
            "-"
          )}
        </div>
      )
    }
  ];

  const leadFilters = (
    <>
      <div className="relative w-48 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-slate/40 group-focus-within:text-theme-accent transition-colors">
          <MapPin size={14} />
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full pl-9 pr-6 py-2.5 rounded-xl border border-theme-slate/10 focus:border-theme-accent bg-white/70 font-bold text-xs text-theme-navy outline-none transition-all shadow-sm appearance-none cursor-pointer"
        >
          {uniqueAreas.map(area => (
            <option key={area} value={area}>
              {area === "All" ? "Locations" : area}
            </option>
          ))}
        </select>
      </div>

      <div className="relative w-48 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-slate/40 group-focus-within:text-theme-accent transition-colors">
          <Wallet size={14} />
        </div>
        <select
          value={selectedBudget}
          onChange={(e) => setSelectedBudget(e.target.value)}
          className="w-full pl-9 pr-6 py-2.5 rounded-xl border border-theme-slate/10 focus:border-theme-accent bg-white/70 font-bold text-xs text-theme-navy outline-none transition-all shadow-sm appearance-none cursor-pointer"
        >
          <option value="All">Budget Range</option>
          <option value="under1k">{"< ₹1,000"}</option>
          <option value="1kTo5k">{"₹1,000 - ₹5,000"}</option>
          <option value="5kTo15k">{"₹5,000 - ₹15,000"}</option>
          <option value="above15k">{"> ₹15,000"}</option>
        </select>
      </div>
    </>
  );

  return (
    <DataTable
      data={filteredLeads}
      columns={columns}
      title="Walk-In Database"
      subtitle="Search and filter your store walk-ins."
      statsLabel="Total Walk-ins"
      searchPlaceholder="Search by name, phone, or product..."
      searchFields={["customerName", "phoneNumber", "productInterest", "location"]}
      filters={leadFilters}
      forceFilterVisible={true}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      emptyIcon={User}
      emptyTitle="No walk-ins logged yet."
      emptySubtitle="Walk-ins created by your staff will appear here."
    />
  );
}