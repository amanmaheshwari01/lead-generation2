"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect Page
 * This route has been moved to /admin/manage_employees
 * We redirect for backward compatibility.
 */
export default function AddEmployeeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/manage_employees");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-theme-accent/20 border-t-theme-accent rounded-full animate-spin"></div>
        <p className="text-theme-slate font-medium animate-pulse">Redirecting to Manage Employees...</p>
      </div>
    </div>
  );
}
