"use client";

import { useRouter } from "next/navigation";

export default function LaunchPage() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "#d4af37",
      textAlign: "center"
    }}>
      <h1>Kamma Icon Trust</h1>
      <h2>Official Website Launch</h2>

      <a href="/" style={{
        marginTop:"40px",
        padding:"12px 25px",
        border:"2px solid #d4af37",
        borderRadius:"30px",
        textDecoration:"none",
        color:"#d4af37"
      }}>
        Enter Website
      </a>
    </div>
  );
}