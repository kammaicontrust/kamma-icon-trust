"use client";

import useCursor from "./styles/useCursor";
import AnalyticsTracker from "./hooks/useTracking";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SuperAdminAuthProvider } from "./context/SuperAdminAuthContext";
import { GuideProvider } from "./context/GuideContext";
import OnboardingOverlay from "./components/OnboardingOverlay";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <SuperAdminAuthProvider>
      <AdminAuthProvider>
        <GuideProvider>
          <AnalyticsTracker />
          {children}
          <OnboardingOverlay />
        </GuideProvider>
      </AdminAuthProvider>
    </SuperAdminAuthProvider>
  );
}