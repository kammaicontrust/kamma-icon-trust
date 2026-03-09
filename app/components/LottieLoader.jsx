"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function LottieLoader({ children }) {

  const canvasRef = useRef(null);

  const [loading,setLoading] = useState(true);
  const [fade,setFade] = useState(false);

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
        setLoading(false);
      },600);

    },3000);

  },[]);


  if(loading){

    return(

      <div className={`loader-screen ${fade ? "fade-out" : ""}`}>

        <div className="loader-content">

          <canvas
            ref={canvasRef}
            className="loader-animation"
          />

          <h2 className="loader-title">
            KAMMA ICON TRUST
          </h2>

        </div>

      </div>

    )

  }

  return children;

}