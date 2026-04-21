import { serverFetch } from "@/lib/server-fetch";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const data = await serverFetch("/user/profile");

  if (!data.success) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
         <div className="bg-theme-error/5 border border-theme-error/20 p-6 rounded-2xl max-w-md text-center">
             <h3 className="text-theme-error font-bold text-lg mb-2">Error Loading Data</h3>
             <p className="text-theme-navy text-sm font-medium">{data.message}</p>
         </div>
      </div>
    );
  }

  const initialProducts = data.user.shopProducts || [];

  // 3. Pass data down to the Client Component for interactivity
  return <ProductsClient initialProducts={initialProducts} />;

  // 3. Pass data down to the Client Component for interactivity
  return <ProductsClient initialProducts={initialProducts} />;
}
