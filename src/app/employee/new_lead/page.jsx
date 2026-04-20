import NewLeadForm from "@/components/newLeadForm";
import { serverFetch } from "@/lib/server-fetch";

export default async function EmployeeNewLeadPage() {
  const data = await serverFetch("/user/profile");
  
  // Safely extract shop products to pass downstream. If networking fails, fallback to empty array.
  const products = data.success && data.user && data.user.shopProducts ? data.user.shopProducts : [];

  return (
    <NewLeadForm 
      redirectPath="/employee/dashboard" 
      initialProducts={products}
    />
  );
}