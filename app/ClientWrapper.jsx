"use client";

import useCursor from "./styles/useCursor";

export default function ClientWrapper({ children }) {
  useCursor();
  return children;
}