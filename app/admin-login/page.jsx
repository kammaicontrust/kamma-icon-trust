"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Role Check
      const adminDoc = await getDoc(doc(db, "admins", user.email));
      if (adminDoc.exists()) {
        router.push("/admin");
      } else {
        setError("Access denied. Authorized personnel only.");
        // Sign out if not an admin
        auth.signOut();
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("An error occurred. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err) {
      setError("Could not send reset email. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1F44] relative overflow-hidden font-sans selection:bg-[#FFD700]/30 selection:text-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#FFD700]/10 to-transparent blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#FFD700]/5 to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10 p-4"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-tr from-[#FFD700] to-[#E5C100] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#FFD700]/20"
              >
                <Lock className="w-10 h-10 text-[#0A1F44]" strokeWidth={2.5} />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                Admin <span className="text-[#FFD700]">Control</span>
              </h1>
              <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">
                Secure Portal
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-200 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
              {resetSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6"
                >
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-sm">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <p>Reset link sent to your email.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#FFD700] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#FFD700] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kammaicontrust.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#FFD700]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-white/40 hover:text-[#FFD700] transition-colors uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#FFD700] transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative bg-[#FFD700] hover:bg-[#E5C100] text-[#0A1F44] font-black py-5 rounded-2xl shadow-xl shadow-[#FFD700]/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      ENTER DASHBOARD
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-white/20 text-xs font-bold tracking-widest uppercase">
          &copy; 2026 Kamma Icon Trust &bull; Secure Environment
        </p>
      </motion.div>
    </div>
  );
}
