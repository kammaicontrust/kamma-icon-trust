"use client";
import { useSyncExternalStore } from "react";

export default function ClientOnly({ children }) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClient) return null;
  return <>{children}</>;
}
