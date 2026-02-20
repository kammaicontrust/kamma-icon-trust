"use client";

import "./globals.css";
import useCursor from "./styles/useCursor";

export const metadata = {
  metadataBase: new URL("https://kammaicontrust.org"),

  title: {
    default: "Kamma Icon Trust | Charitable Trust in India",
    template: "%s | Kamma Icon Trust",
  },

  description:
    "Kamma Icon Trust is a charitable organization empowering communities through education, healthcare, women empowerment, and sustainable development across India.",

  keywords: [
    "Kamma Icon Trust",
    "Charitable Trust India",
    "NGO Hyderabad",
    "Social Service Organization",
    "Education Support NGO",
    "Healthcare NGO India",
    "Women Empowerment Trust",
  ],

  authors: [{ name: "Kamma Icon Trust" }],
  creator: "Kamma Icon Trust",
  publisher: "Kamma Icon Trust",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Kamma Icon Trust | Charitable Trust in India",
    description:
      "Empowering communities through education, healthcare, and sustainable development across India.",
    url: "https://kammaicontrust.org",
    siteName: "Kamma Icon Trust",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kamma Icon Trust",
    description:
      "Empowering communities through education and sustainable development.",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}