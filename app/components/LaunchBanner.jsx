"use client";

import { useEffect, useState } from "react";

export default function LaunchBanner() {

  const [show, setShow] = useState(true);
  const [drop, setDrop] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {
      setDrop(true);

      setTimeout(()=>{
        setShow(false);
      },1500);

    },120000); // 2 minutes

    return ()=>clearTimeout(timer);

  },[]);

  if(!show) return null;

  return (

    <div className={`launch-wrapper ${drop ? "drop" : ""}`}>

      <div className="launch-banner">

        <h2 className="launch-title">
          Official Launch of the Kamma Icon Trust Website
        </h2>

        <img
          src="/donor.jpg"
          className="launch-photo"
          alt="SRIDHAR PATIBANDLA GARU"
        />

        <h3 className="launch-name">
          Sri SRIDHAR PATIBANDLA GARU
        </h3>

        <p className="launch-designation">
          Co-Founder, Kastech, a successful entrepreneur in the IT and real estate sectors with a strong global business presence
        </p>

      </div>

    </div>
  );
}