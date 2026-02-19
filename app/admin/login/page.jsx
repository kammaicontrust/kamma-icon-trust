"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded w-96"
      >
        <h2 className="text-2xl text-yellow-400 mb-6">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 bg-black border border-yellow-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 bg-black border border-yellow-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
