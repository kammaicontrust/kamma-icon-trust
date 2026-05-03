"use client";

import useCursor from "./styles/useCursor";
import { GuideProvider } from "./context/GuideContext";
import StepGuide from "./components/StepGuide";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <GuideProvider>
      {children}
      <StepGuide />
    </GuideProvider>
  );
}