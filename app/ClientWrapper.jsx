"use client";

import useCursor from "./styles/useCursor";
import { GuideProvider } from "./context/GuideContext";
import OnboardingOverlay from "./components/OnboardingOverlay";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <GuideProvider>
      {children}
      <OnboardingOverlay />
    </GuideProvider>
  );
}