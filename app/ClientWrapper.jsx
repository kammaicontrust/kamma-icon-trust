"use client";

import useCursor from "./styles/useCursor";
import { GuideProvider } from "./context/GuideContext";
import AssistantPanel from "./components/AssistantPanel";

export default function ClientWrapper({ children }) {
  useCursor();
  return (
    <GuideProvider>
      {children}
      <AssistantPanel />
    </GuideProvider>
  );
}