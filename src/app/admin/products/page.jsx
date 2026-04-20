import { cookies } from "next/headers";
import ProductsClient from "./ProductsClient";
import { Loader2 } from "lucide-react";

export default async function ProductsPage() {
  // 1. Next.js Best Practice: Server Component fetches data securely
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let initialProducts = [];
  let errorMsg = null;

  try {
    // 2. Fetch directly from the Node.js Backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    if (!token) {
        throw new Error("No authentication token found. Please log in again.");
    }

    const res = await fetch(`${apiUrl}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Ensure we don't aggressively cache if the products update frequently
      cache: 'no-store' 
    });

    const data = await res.json();

    if (res.ok && data.success) {
      initialProducts = data.user.shopProducts || [];
    } else {
      errorMsg = data.message || "Failed to load products from server.";
    }
  } catch (err) {
    errorMsg = err.message || "Could not connect to the backend server.";
  }

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
         <div className="bg-theme-error/5 border border-theme-error/20 p-6 rounded-2xl max-w-md text-center">
             <h3 className="text-theme-error font-bold text-lg mb-2">Error Loading Data</h3>
             <p className="text-theme-navy text-sm font-medium">{errorMsg}</p>
         </div>
      </div>
    );
  }

  // 3. Pass data down to the Client Component for interactivity
  return <ProductsClient initialProducts={initialProducts} />;
}
