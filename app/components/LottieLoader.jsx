"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function LottieLoader({ children }) {

  const canvasRef = useRef(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    new DotLottie({
      autoplay:true,
      loop:true,
      canvas:canvasRef.current,
      src:"https://lottie.host/ec31ea4d-78c9-4650-8274-7aa9cfe05cfb/vkRocbFKRe.lottie"
    });

    setTimeout(()=>{
      setLoading(false);
    },3000);

  },[]);

  if(loading){
    return(
      <div className="loader-screen">
        <canvas ref={canvasRef} style={{width:"320px",height:"320px"}}/>
      </div>
    )
  }

  return children;
}