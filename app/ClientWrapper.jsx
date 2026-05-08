"use client";

import useCursor from "./styles/useCursor";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { GuideProvider } from "./context/GuideContext";
import OnboardingOverlay from "./components/OnboardingOverlay";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <AdminAuthProvider>
      <GuideProvider>
        {children}
        <OnboardingOverlay />
      </GuideProvider>
    </AdminAuthProvider>
  );
}