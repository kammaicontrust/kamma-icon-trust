"use client";

import { motion, useMotionTemplate } from "framer-motion";
import { MapPin, Briefcase, Network, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useDepthCard } from "@/app/hooks/useDepth";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
    <div className="flex items-center gap-2 text-[#0A1F44]/40">
      <Icon className="w-[14px] h-[14px]" strokeWidth={2} />
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold text-[#0A1F44] text-right ml-2 truncate max-w-[120px]">
      {value || "—"}
    </span>
  </div>
);

export default function ProfileCard({ user }) {
  const { style, handlers, shadowX, shadowY } = useDepthCard({
    tiltDeg: 10,
    hoverScale: 1.04,
    perspective: 900,
  });

  // Dynamic shadow that follows tilt direction
  const boxShadow = useMotionTemplate`
    ${shadowX}px ${shadowY}px 40px -8px rgba(0,0,0,0.08),
    0 2px 8px rgba(0,0,0,0.03)
  `;

  return (
    <motion.div
      {...handlers}
      style={{ ...style, boxShadow }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative h-full w-full rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/40 p-6 transition-colors duration-500 hover:bg-white/60 hover:border-[#FF9933]/20"
    >
      <div
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        className="flex flex-col h-full items-center"
      >
        {/* Profile Image */}
        <div className="relative mb-6 transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933] to-[#138808] rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-200" />
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-black text-[#0A1F44] tracking-tight mb-6 text-center">
          {user.name || "Kamma Member"}
        </h3>

        {/* Details */}
        <div className="w-full space-y-3.5 mb-8">
          <InfoRow icon={MapPin} label="Village" value={user.village} />
          <InfoRow icon={Network} label="Gothram" value={user.gothram} />
          <InfoRow icon={Briefcase} label="Job" value={user.occupation} />
          <InfoRow icon={UserIcon} label="Age" value={user.age ? `${user.age} yrs` : null} />
        </div>

        {/* View Profile Button */}
        <Link href={`/profile/${user.id}`} className="w-full mt-auto">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(255,153,51,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#FFB266] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#FF9933]/20 transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">View Profile</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}