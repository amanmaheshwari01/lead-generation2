import UserProfile from "@/components/userProfile";
import { serverFetch } from "@/lib/server-fetch";

export default async function AdminProfilePage() {
  const data = await serverFetch("/user/profile");

  if (!data.success) {
    return (
      <div className="flex justify-center items-center h-full p-10">
        <div className="bg-theme-error/5 border border-theme-error/20 p-6 rounded-2xl w-full max-w-md text-center">
             <h3 className="text-theme-error font-bold text-lg mb-2">Profile Load Error</h3>
             <p className="text-theme-navy text-sm font-medium">{data.message}</p>
         </div>
      </div>
    );
  }

  return <UserProfile initialProfile={data.user} />;
}
