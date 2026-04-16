"use client";

import { motion } from "framer-motion";

export default function ProfileCard({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-yellow-500/20 shadow-xl hover:shadow-yellow-500/30 transition"
    >
      {/* Profile Image */}
      <div className="w-full h-48 bg-gray-800 rounded-xl mb-4 overflow-hidden">
        <img
          src={user.photo || "/default.jpg"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <h2 className="text-xl text-yellow-400 font-bold">
        {user.name || "No Name"}
      </h2>

      <p className="text-gray-300 mt-1">
        {user.village || "Village"}
      </p>

      <p className="text-gray-400 text-sm">
        {user.occupation || "Occupation"}
      </p>

      {/* Button */}
      <button className="mt-4 w-full bg-yellow-500 text-black py-2 rounded-full font-semibold hover:bg-yellow-400 transition">
        View Profile
      </button>
    </motion.div>
  );
}