"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LaunchPage() {
  const router = useRouter();
  const [count, setCount] = useState(null);
  const [launch, setLaunch] = useState(false);

  const startLaunch = () => {
    let counter = 3;
    setCount(counter);

    const interval = setInterval(() => {
      counter--;

      if (counter === 0) {
        clearInterval(interval);
        setLaunch(true);

        setTimeout(() => {
          router.push("/");
        }, 2000);
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

      {/* TITLE */}
      <h1 style={{
        fontSize:"60px",
        letterSpacing:"4px",
        textShadow:"0 0 20px #d4af37"
      }}>
        KAMMA ICON TRUST
      </h1>

      <p style={{marginTop:"10px",opacity:0.8}}>
        Official Website Launch
      </p>

      {/* BUTTON */}
      {count === null && !launch && (
        <button
          onClick={startLaunch}
          style={{
            marginTop:"40px",
            padding:"16px 40px",
            borderRadius:"40px",
            border:"2px solid #d4af37",
            background:"transparent",
            color:"#d4af37",
            fontSize:"20px",
            cursor:"pointer",
            transition:"0.3s"
          }}
        >
          Launch Website
        </button>
      )}

      {/* COUNTDOWN */}
      {count !== null && !launch && (
        <div style={{
          fontSize:"140px",
          marginTop:"30px",
          fontWeight:"bold",
          textShadow:"0 0 30px #d4af37"
        }}>
          {count}
        </div>
      )}

      {/* ROCKET */}
      {launch && (
        <div style={{
          fontSize:"120px",
          marginTop:"40px",
          animation:"rocketMove 2s forwards"
        }}>
          🚀
        </div>
      )}

      <p style={{marginTop:"60px",opacity:0.6}}>
        Empowering Communities Across India
      </p>

      <style jsx>{`
        @keyframes rocketMove {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-600px);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
}