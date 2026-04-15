"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner"; 
import { leadsAPI } from "@/lib/api";

export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await leadsAPI.getMyLeads();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch leads");
        }

        setLeads(data.leads);
      } catch (error) {
        console.error("Error fetching leads:", error);
        toast.error(error.response?.data?.message || "Could not load your leads.");
      } finally {
        setIsLoading(false); 
      }
    };

    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const { data } = await leadsAPI.updateStatus(leadId, newStatus);

      if (data.success) {
        toast.success("Status updated!");
        
        setLeads((prevLeads) => 
          prevLeads.map((lead) => 
            lead._id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-theme-navy">My Pipeline</h1>
        <p className="text-theme-slate mt-1">Manage and track your active leads.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-theme-slate">
          Loading your leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
          <p className="text-gray-500 mb-4">You haven't logged any leads yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-theme-slate uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Customer Name</th>
                  <th className="p-4 font-semibold">Phone</th>
                  <th className="p-4 font-semibold">Area</th>
                  <th className="p-4 font-semibold">Interest</th>
                  <th className="p-4 font-semibold">Budget</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors text-sm text-theme-navy">
                    <td className="p-4 whitespace-nowrap text-theme-slate">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="p-4 font-medium">{lead.customerName}</td>
                    <td className="p-4">{lead.phoneNumber}</td>
                    <td className="p-4">{lead.location}</td>
                    <td className="p-4">{lead.productInterest}</td>
                    <td className="p-4 font-medium text-green-600">
                      Rs. {lead.budget.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                          lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium outline-none cursor-pointer border border-transparent hover:border-gray-300 transition-all focus:ring-2 focus:ring-offset-1 focus:ring-theme-accent
                          ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                            lead.status === 'Contacted' ? 'bg-purple-100 text-purple-700' :
                            lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                            lead.status === 'Closed Won' ? 'bg-green-100 text-green-700' : 
                            lead.status === 'Closed Lost' ? 'bg-red-100 text-red-700' : 
                            'bg-gray-100 text-gray-700'}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}