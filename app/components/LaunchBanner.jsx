"use client";

import { useEffect, useState } from "react";

export default function LaunchBanner() {

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="launch-overlay">

      <div className="launch-content">

        <h1 className="launch-title">
          Official Launch of the Kamma Icon Trust Website
        </h1>

        <img
          src="/donor.jpg"
          className="launch-photo"
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