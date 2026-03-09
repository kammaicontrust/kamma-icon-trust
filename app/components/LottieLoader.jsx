"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default function LottieLoader() {

  const canvasRef = useRef(null);

  useEffect(() => {

    const dotLottie = new DotLottie({
      autoplay: true,
      loop: true,
      canvas: canvasRef.current,
      src: "https://lottie.host/ec31ea4d-78c9-4650-8274-7aa9cfe05cfb/vkRocbFKRe.lottie"
    });

  }, []);

  return (
    <div className="loader-screen">
      <canvas
        ref={canvasRef}
        style={{ width: "300px", height: "300px" }}
      ></canvas>
    </div>
  );

}