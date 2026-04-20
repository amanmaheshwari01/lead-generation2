import { cookies } from "next/headers";

/**
 * Server-side helper to securely fetch data from the Node.js API.
 * This function should ONLY be called from Next.js Server Components.
 */
export async function serverFetch(endpoint, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, message: "No authentication token found. Please log in again.", status: 401 };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  try {
    const res = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      // Default to no-store so CRM data is always perfectly fresh
      cache: options.cache || 'no-store' 
    });

    const data = await res.json();
    return { ...data, status: res.status };
  } catch (error) {
    console.error(`Server Fetch Error to ${endpoint}:`, error);
    return { success: false, message: "Could not connect to the backend server.", status: 500 };
  }
}
