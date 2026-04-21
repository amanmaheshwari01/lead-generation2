"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [type, setType] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Cleanup any legacy 'token' entries before starting
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    try {
      const { data } = await authAPI.login(email, password);

      if (!data.success) throw new Error(data.message || "Login failed");

      if (data.role === "Employee") {
        router.push("/employee/dashboard");
      } else if (data.role === "Shop Admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "Super Admin") {
        router.push("/superAdmin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };
  return (
    <>
    <div className="flex xl:h-screen min-h-[100dvh] items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-96 p-8 glass-panel rounded-3xl animate-fadeIn">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-theme-accent to-theme-navy rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <div className="w-6 h-6 border-[3px] border-white rounded" />
          </div>
          <h2 className="text-3xl font-bold text-theme-navy tracking-tight">Shop Portal</h2>
          <p className="text-theme-slate/80 text-sm mt-1 font-medium">Log in to manage your pipeline</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-theme-slate uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input
              type="email"
              placeholder="name@shop.com"
              className="w-full px-4 py-2.5 border border-theme-slate/20 rounded-lg focus:border-theme-navy focus:ring-1 focus:ring-theme-navy outline-none text-theme-navy text-sm font-medium transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-theme-slate uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={type?"text":"password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-theme-slate/20 rounded-lg focus:border-theme-navy focus:ring-1 focus:ring-theme-navy outline-none text-theme-navy text-sm font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button onClick={(e)=>{
                e.preventDefault();
                setType(!type);
              }} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-slate hover:text-theme-navy transition-colors cursor-pointer">
                {type ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-theme-error mt-4 text-xs font-medium bg-theme-error/5 p-2 rounded border border-theme-error/10">{error}</p>}
        
        <button type="submit" className="w-full mt-8 bg-theme-navy text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-theme-navy/90 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer">
          Sign In
        </button>
      </form>
    </div>
    </>
  );
}
