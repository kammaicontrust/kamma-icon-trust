"use client";

import { useEffect, Suspense } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { usePathname, useSearchParams } from "next/navigation";

function TrackingLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Prevent tracking on admin routes
    if (pathname.startsWith("/super-admin") || pathname.startsWith("/admin")) return;

    const trackPageView = async () => {
      try {
        const sessionID = sessionStorage.getItem("sessionID") || Math.random().toString(36).substring(7);
        sessionStorage.setItem("sessionID", sessionID);

        const visitorData = {
          url: pathname,
          search: searchParams.toString(),
          referrer: document.referrer || "direct",
          device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
          browser: navigator.userAgent.includes("Chrome") ? "Chrome" : "Other",
          timestamp: serverTimestamp(),
          sessionID
        };

        // 1. Log Page View
        await addDoc(collection(db, "analytics_views"), visitorData);

        // 2. Increment Daily Stats (Atomic)
        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(db, "analytics_summary", today);
        
        await setDoc(statsRef, { 
          date: today,
          views: increment(1),
          lastUpdate: serverTimestamp()
        }, { merge: true });

      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackingLogic />
    </Suspense>
  );
}
