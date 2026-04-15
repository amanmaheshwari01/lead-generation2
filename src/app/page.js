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
    try {
      const { data } = await authAPI.login(email, password);

      if (!data.success) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);

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
    <div className="flex h-screen items-center justify-center bg-theme-light">
      <form onSubmit={handleLogin} className="w-96 p-8 bg-theme-navy rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Shop Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
          title="Please enter a valid email address (e.g., name@shop.com)"
        />
        <div className="relative mb-6">
          <input
            type={type?"text":"password"}
            placeholder="Password"
            className=" w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button onClick={(e)=>{
            e.preventDefault();
            setType(!type);
          }} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            {type?<EyeIcon />:<EyeOffIcon />}
          </button>
        </div>
        {error && <p className="text-theme-error mb-4 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded cursor-pointer">
          Login
        </button>
      </form>
    </div>
    </>
  );
}
