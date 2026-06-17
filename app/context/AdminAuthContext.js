"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === "kammaicontrust@gmail.com") {
          setAdminUser({ ...user, role: "admin" });
        } else {
          // Not authorized admin - sign out and redirect
          await signOut(auth);
          setAdminUser(null);
          if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
            router.push("/admin-login?error=denied");
          }
        }
      } else {
        setAdminUser(null);
        if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
          router.push("/admin-login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/admin-login");
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
