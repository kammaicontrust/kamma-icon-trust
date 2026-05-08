"use client";

import useCursor from "./styles/useCursor";
import useTracking from "./hooks/useTracking";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SuperAdminAuthProvider } from "./context/SuperAdminAuthContext";
import { GuideProvider } from "./context/GuideContext";
import OnboardingOverlay from "./components/OnboardingOverlay";

export default function ClientWrapper({ children }) {
  useCursor();
  useTracking();
  return (
    <SuperAdminAuthProvider>
      <AdminAuthProvider>
        <GuideProvider>
          {children}
          <OnboardingOverlay />
        </GuideProvider>
      </AdminAuthProvider>
    </SuperAdminAuthProvider>
  );
}