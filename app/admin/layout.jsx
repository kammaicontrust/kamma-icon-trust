"use client";

import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen bg-black text-white px-8 py-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-yellow-400">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full transition"
        >
          Logout
        </button>
      </div>

      {children}
    </div>
  );
}
