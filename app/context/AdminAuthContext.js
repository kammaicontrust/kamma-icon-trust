"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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
        // Check if user is an admin in Firestore
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.email));
          if (adminDoc.exists()) {
            setAdminUser({ ...user, role: adminDoc.data().role || "admin" });
          } else {
            // Not an admin - do NOT sign out globally, just don't set local state
            setAdminUser(null);
            if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
              router.push("/admin-login?error=unauthorized");
            }
          }
        } catch (error) {
          console.error("Admin check error:", error);
          setAdminUser(null);
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
