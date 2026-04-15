import NewLeadForm from "@/components/newLeadForm";

export default function AdminNewLeadPage() {
  return (
    <NewLeadForm 
      redirectPath="/admin/dashboard" 
    />
  );
}