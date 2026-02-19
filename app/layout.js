"use client";

import "./globals.css";
import useCursor from "./styles/useCursor";

export default function RootLayout({ children }) {
  useCursor();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
