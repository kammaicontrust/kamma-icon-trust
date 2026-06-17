"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/app/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, AlertCircle, Loader2, ShieldAlert } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const errorType = searchParams.get("error");
    if (errorType === "denied") {
      setError("Access Denied: Only the website owner (kammaicontrust@gmail.com) can access the Admin Control Center.");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.email === "kammaicontrust@gmail.com") {
        router.push("/admin");
      } else {
        // Automatically sign out unauthorized accounts
        await signOut(auth);
        setError(`Access Denied: The Google account (${user.email}) is not authorized. Only the website owner can access this panel.`);
      }
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google authentication failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== "kammaicontrust@gmail.com") {
      setError("Access Denied: Only the website owner (kammaicontrust@gmail.com) is authorized to log in.");
      return;
    }

    setLoading(true);
    try {
      // 1. Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      // Double check role/email
      if (user.email === "kammaicontrust@gmail.com") {
        router.push("/admin");
      } else {
        await signOut(auth);
        setError("Access Denied: Unauthorized account.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address first.");
      return;
    }
    if (normalizedEmail !== "kammaicontrust@gmail.com") {
      setError("Password reset is only allowed for the website owner (kammaicontrust@gmail.com).");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
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
            <div className="text-center mb-8">
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
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 text-rose-200 text-sm">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                    <p className="leading-relaxed">{error}</p>
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

            {/* Google Login (Primary) */}
            <div className="mb-6">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full group relative bg-white hover:bg-slate-50 text-[#0A1F44] font-black py-4.5 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
              >
                <span className="flex items-center justify-center gap-3">
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                      SIGN IN WITH GOOGLE
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">OR SIGN IN WITH PASSWORD</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Password Form */}
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
                    placeholder="kammaicontrust@gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50 focus:bg-white/10 transition-all text-sm font-medium"
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50 focus:bg-white/10 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full group relative bg-[#FFD700] hover:bg-[#E5C100] text-[#0A1F44] font-black py-4.5 rounded-2xl shadow-xl shadow-[#FFD700]/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
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

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1F44] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
    </div>}>
      <LoginContent />
    </Suspense>
  );
}
