"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/dataTable";
import AddEmployeeModal from "@/components/addEmployeeModal";
import DeleteConfirmationModal from "@/components/deleteConfirmationModal";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { Users, Mail, Trash2, UserPlus, Shield } from "lucide-react";

export default function ManageEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getEmployees();
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await userAPI.deleteEmployee(deleteTarget._id);
      if (response.data.success) {
        toast.success(`${deleteTarget.name} removed successfully`);
        setEmployees(employees.filter(e => e._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove employee");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Employee Name",
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-theme-accent/10 text-theme-accent flex items-center justify-center font-bold text-sm">
            {emp.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-theme-navy text-sm">{emp.name}</p>
            <p className="text-theme-slate/60 text-[10px] font-medium uppercase tracking-wider">Level 1 Staff</p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email Address",
      render: (emp) => (
        <div className="flex items-center gap-2 text-theme-slate/80 font-medium text-sm">
          <Mail size={14} className="text-theme-slate/40" />
          {emp.email}
        </div>
      )
    },
    {
      key: "role",
      label: "Role",
      align: "center",
      render: (emp) => (
        <span className="px-3 py-1 bg-theme-navy/5 text-theme-navy text-[10px] font-bold rounded-full uppercase tracking-tighter">
          {emp.role}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (emp) => (
        <button
          onClick={() => setDeleteTarget(emp)}
          className="p-2.5 rounded-xl text-theme-slate/40 hover:text-theme-error hover:bg-theme-error/10 transition-all cursor-pointer group"
          title="Remove Employee"
        >
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      )
    }
  ];

  const adminActions = (
    <button
      onClick={() => setIsAddModalOpen(true)}
      className="flex items-center gap-2 px-5 py-2.5 bg-theme-navy text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-theme-navy/20 hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
    >
      <UserPlus size={18} />
      <span>Add New Employee</span>
    </button>
  );

  return (
    <>
      <DataTable
        data={employees}
        columns={columns}
        title="Manage Employees"
        subtitle="View and manage your store staff accounts."
        statsLabel="Active Staff"
        searchPlaceholder="Search by name or email..."
        searchFields={["name", "email"]}
        isLoading={isLoading}
        filters={adminActions}
        emptyIcon={Users}
        emptyTitle="No staff members yet"
        emptySubtitle="Start building your team by adding your first employee."
      />

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchEmployees}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Remove Staff"
        message={`Are you sure you want to remove ${deleteTarget?.name}? They will no longer be able to access the portal.`}
      />
    </>
  );
}
