"use client";

import { useState, useEffect } from "react";
import { useSuperAdminAuth } from "@/app/context/SuperAdminAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogIn, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function SuperAdminLogin() {
  const { loginWithGoogle, adminUser, loading } = useSuperAdminAuth();
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Unauthorized access. This area is strictly for the website owner.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1F44] relative overflow-hidden font-sans selection:bg-[#FFD700]/30 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#FFD700]/10 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#FFD700]/5 to-transparent blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg relative z-10 p-6"
      >
        {/* Luxury Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="p-12 sm:p-16 text-center">
            {/* Logo/Icon */}
            <motion.div
              animate={{ 
                rotateY: isHovered ? 180 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-24 h-24 bg-gradient-to-tr from-[#FFD700] via-[#E5C100] to-[#FFD700] rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-[#FFD700]/20 cursor-pointer"
            >
              <ShieldCheck className="w-12 h-12 text-[#0A1F44]" strokeWidth={2.5} />
            </motion.div>

            <h1 className="text-4xl font-black tracking-tight text-white mb-4 leading-tight">
              Super <span className="text-[#FFD700]">Admin</span>
            </h1>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.4em] mb-12">
              Website Owner Control Panel
            </p>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-8"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-4 text-rose-200 text-sm text-left leading-relaxed">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full group relative bg-white hover:bg-white text-[#0A1F44] font-black py-6 rounded-2xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/10 to-[#FFD700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="flex items-center justify-center gap-4 relative z-10">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-6 h-6" alt="Google" />
                    SIGN IN WITH GOOGLE
                  </>
                )}
              </span>
            </button>

            <div className="mt-10 flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#FFD700]" />
              Secure Biometric Authentication Enabled
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-white/10 text-xs font-bold tracking-widest uppercase">
          &copy; 2026 Kamma Icon Trust &bull; Private Access Only
        </p>
      </motion.div>
    </div>
  );
}
