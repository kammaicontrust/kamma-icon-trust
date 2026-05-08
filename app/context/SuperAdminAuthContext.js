"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/app/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

const SuperAdminAuthContext = createContext({});

const ALLOWED_ADMIN_EMAIL = "kammaicontrust@gmail.com";

export const SuperAdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Super Admin Auth - Authenticated Email:", user.email);
        if (user.email === ALLOWED_ADMIN_EMAIL) {
          setAdminUser(user);
        } else {
          // Not the super admin
          const email = user.email;
          signOut(auth);
          setAdminUser(null);
          if (pathname.startsWith("/super-admin") && pathname !== "/super-admin/login") {
            router.push(`/super-admin/login?error=denied&email=${encodeURIComponent(email)}`);
          }
        }
      } else {
        setAdminUser(null);
        if (pathname.startsWith("/super-admin") && pathname !== "/super-admin/login") {
          router.push("/super-admin/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ALLOWED_ADMIN_EMAIL) {
        await signOut(auth);
        throw new Error("Unauthorized access. Super Admin only.");
      }
      router.push("/super-admin");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/super-admin/login");
  };

  return (
    <SuperAdminAuthContext.Provider value={{ adminUser, loading, loginWithGoogle, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
};

export const useSuperAdminAuth = () => useContext(SuperAdminAuthContext);
