"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function useWebsiteConfig() {
  const [config, setConfig] = useState({
    heroTitle: "Empowering the Kamma Community",
    heroSubtitle: "Dedicated to social welfare, education, and heritage preservation.",
    announcement: "Registration for the 2026 Matrimonial Meet is now open!",
    contactEmail: "kammaicontrust@email.com",
    contactPhone: "+91 94945 02759",
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "website_config", "general"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig({ ...snapshot.data(), loading: false });
      } else {
        setConfig(prev => ({ ...prev, loading: false }));
      }
    });
    return () => unsubscribe();
  }, []);

  return config;
}
