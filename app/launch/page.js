"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LaunchPage() {
  const router = useRouter();
  const [count, setCount] = useState(null);

  const startLaunch = () => {
    let counter = 3;
    setCount(counter);

    const interval = setInterval(() => {
      counter--;
      if (counter === 0) {
        clearInterval(interval);
        setCount("🚀");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setCount(counter);
      }
    }, 1000);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "#d4af37",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>

      <h1 style={{fontSize:"48px", marginBottom:"10px"}}>
        KAMMA ICON TRUST
      </h1>

      <p style={{opacity:0.8, marginBottom:"40px"}}>
        Official Website Launch
      </p>

      {count === null && (
        <button
          onClick={startLaunch}
          style={{
            padding:"16px 40px",
            borderRadius:"40px",
            border:"2px solid #d4af37",
            background:"transparent",
            color:"#d4af37",
            fontSize:"20px",
            cursor:"pointer"
          }}
        >
          Launch Website
        </button>
      )}

      {count !== null && (
        <div style={{
          fontSize:"120px",
          marginTop:"40px",
          fontWeight:"bold"
        }}>
          {count}
        </div>
      )}

      <p style={{marginTop:"60px", opacity:0.6}}>
        Kamma Icon Trust – Empowering Communities
      </p>

    </div>
  );
}