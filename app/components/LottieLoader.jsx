"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function LottieLoader({ children }) {

  const canvasRef = useRef(null);

  const [loading,setLoading] = useState(true);
  const [fade,setFade] = useState(false);
  const [showLogo,setShowLogo] = useState(false);

  useEffect(()=>{

    new DotLottie({
      autoplay:true,
      loop:true,
      canvas:canvasRef.current,
      src:"https://lottie.host/ec31ea4d-78c9-4650-8274-7aa9cfe05cfb/vkRocbFKRe.lottie"
    });

    setTimeout(()=>{

      setFade(true);

      setTimeout(()=>{
        setShowLogo(true);
      },600);

      setTimeout(()=>{
        setLoading(false);
      },2000);

    },3000);

  },[]);

  if(loading){

    return(

      <div className={`loader-screen ${fade ? "fade-out" : ""}`}>

        {!showLogo ? (

          <div className="loader-content">

            <canvas
              ref={canvasRef}
              className="loader-animation"
            />

            <h2 className="loader-title">
              KAMMA ICON TRUST
            </h2>

          </div>

        ) : (

          <div className="logo-reveal">

            <img src="public\logo.png" className="reveal-logo"/>

            <h1>KAMMA ICON TRUST</h1>

          </div>

        )}

      </div>

    )

  }

  return children;

}