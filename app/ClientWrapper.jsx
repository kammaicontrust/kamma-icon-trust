"use client";

import useCursor from "./styles/useCursor";
import AnalyticsTracker from "./hooks/useTracking";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SuperAdminAuthProvider } from "./context/SuperAdminAuthContext";
import { GuideProvider } from "./context/GuideContext";
import { ToastProvider } from "./context/ToastContext";
import OnboardingOverlay from "./components/OnboardingOverlay";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <SuperAdminAuthProvider>
      <AdminAuthProvider>
        <ToastProvider>
          <GuideProvider>
            <AnalyticsTracker />
            {children}
            <OnboardingOverlay />
          </GuideProvider>
        </ToastProvider>
      </AdminAuthProvider>
    </SuperAdminAuthProvider>
  );
}