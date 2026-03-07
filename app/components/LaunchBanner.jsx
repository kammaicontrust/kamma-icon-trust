"use client";

import { useEffect, useState } from "react";

export default function LaunchBanner() {

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 120000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (

    <div className="launch-overlay">

      <div className="launch-content">

        <h1 className="launch-title">
          OFFICIAL LAUNCH OF THE KAMMA ICON TRUST WEBSITE
        </h1>

        <img
          src="/sridhar.jpg"
          className="launch-photo"
          alt="Chief Guest"
        />

        <h2 className="launch-name">
          Sri Sridhar Patibandla Garu
        </h2>

        <p className="launch-role">
          Co-Founder, Kastech
        </p>

        <p className="launch-desc">
          A successful entrepreneur in the IT and real estate sectors with a strong global business presence.
        </p>

      </div>

    </div>

  );
}