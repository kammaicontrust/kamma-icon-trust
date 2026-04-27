"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import Link from "next/link";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ── Token Generator ──
// Format: KIT-XXXXXX (6 random alphanumeric uppercase chars)
function generateTokenCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "KIT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function GetTokenPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");

  // State
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  const [copied, setCopied] = useState(false);

  const successRef = useRef(null);
  const tokenBoxRef = useRef(null);

  // ── GSAP Success Animations ──
  useEffect(() => {
    if (generatedToken && successRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.from(".gsap-checkmark", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)", delay: 0.2 })
          .from(".gsap-title", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.2")
          .from(".token-box", { opacity: 0, scale: 0.8, duration: 0.6, ease: "power3.out" }, "-=0.2")
          .from(".gsap-instruction", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.3")
          .from(".gsap-continue-btn", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.3");
      }, successRef);

      return () => ctx.revert();
    }
  }, [generatedToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setAuthReady(true);
      if (authUser) {
        setEmail(authUser.email || "");
        setName(authUser.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    } finally {
      setSigningIn(false);
    }
  };

  // ── Send token email (fire-and-forget) ──
  const sendTokenEmail = async (toEmail, toName, tokenCode, mobileNumber) => {
    try {
      await fetch("/api/send-token-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: toEmail,
          name: toName,
          token: tokenCode,
          mobile: mobileNumber,
        }),
      });
    } catch (err) {
      console.error("Email send failed (non-blocking):", err);
    }
  };

  const handleSubmit = async () => {
    // Validate
    const cleanMobile = mobile.trim();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!/^\d{10}$/.test(cleanMobile)) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (aadhaarLast4 && !/^\d{4}$/.test(aadhaarLast4.trim())) {
      setFormError("Aadhaar last 4 digits must be exactly 4 numbers.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      // Step 1: Check if mobile already has a token
      const existingQuery = query(
        collection(db, "users"),
        where("mobile", "==", cleanMobile)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Mobile already has a token — return it and resend email
        const existingToken = existingSnapshot.docs[0].data().token;
        sendTokenEmail(cleanEmail, cleanName, existingToken, cleanMobile);
        setGeneratedToken(existingToken);
        setIsExisting(true);
        return;
      }

      // Step 2: Generate a unique token
      let tokenCode = generateTokenCode();
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const dupeCheck = query(
          collection(db, "users"),
          where("token", "==", tokenCode)
        );
        const dupeSnap = await getDocs(dupeCheck);
        if (dupeSnap.empty) break; // Token is unique
        tokenCode = generateTokenCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        setFormError("Could not generate a unique token. Please try again.");
        return;
      }

      // Step 3: Save/update user data with token in users collection
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          aadhaarLast4: aadhaarLast4.trim() || null,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          authProvider: "google",
          token: tokenCode,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Step 5: Send token via email (non-blocking)
      sendTokenEmail(cleanEmail, cleanName, tokenCode, cleanMobile);

      setGeneratedToken(tokenCode);
      setIsExisting(false);
    } catch (error) {
      console.error("Token generation error:", error);
      setFormError(error.message || "Failed to generate token. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading State ──
  if (!authReady) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
        </div>
      </main>
    );
  }

  // ── Google Sign-In Screen ──
  if (!user) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,227,197,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(253,225,223,0.75),_transparent_28%),linear-gradient(180deg,_#fff9f4_0%,_#fff2e9_45%,_#fff8f1_100%)]" />
        <div className="mandala absolute inset-0 opacity-60" />
        <div className="floral absolute inset-x-0 top-0 h-28" />
        <div className="floral absolute inset-x-0 bottom-0 h-28 rotate-180" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-lg"
          >
            <div className="rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-10 text-center shadow-[0_24px_80px_rgba(162,89,62,0.10)] backdrop-blur-xl sm:px-10 sm:py-14">
              <div className="mb-5 flex items-center justify-center gap-4 text-4xl text-amber-500">
                <span className="bell">۞</span>
                <span>✿</span>
                <span className="bell" style={{ animationDelay: "0.2s" }}>۞</span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-700/80">Get Your Token</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-rose-950 sm:text-4xl">
                Sign in to generate your registration token.
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-stone-500">
                You&apos;ll need a Google account to verify your identity and receive your unique token.
              </p>

              <button
                type="button"
                onClick={handleLogin}
                disabled={signingIn}
                className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-stone-700 shadow-md ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.13-1.43.36-2.09V7.07H2.18A11.97 11.97 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77-.01-.54Z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
                </svg>
                {signingIn ? "Signing in..." : "Sign in with Google"}
              </button>

              <p className="mt-6 text-sm text-stone-500">
                Already have a token?{" "}
                <Link href="/register" className="font-semibold text-amber-700 transition hover:text-rose-700 hover:underline">
                  Access Form
                </Link>
              </p>
            </div>
          </motion.div>
        </section>

        <style jsx>{`
          .mandala {
            background-image:
              radial-gradient(circle at center, rgba(210, 161, 108, 0.11) 0, rgba(210, 161, 108, 0.11) 1px, transparent 1px),
              radial-gradient(circle at center, rgba(232, 150, 165, 0.1) 0, rgba(232, 150, 165, 0.1) 1px, transparent 1px);
            background-size: 36px 36px, 120px 120px;
            background-position: 0 0, 18px 18px;
            mask-image: radial-gradient(circle at center, black 36%, transparent 92%);
          }
          .floral {
            background:
              linear-gradient(90deg, transparent, rgba(250, 225, 184, 0.9), transparent),
              repeating-linear-gradient(90deg, transparent 0 28px, rgba(233, 176, 130, 0.18) 28px 40px, transparent 40px 68px);
          }
          .bell {
            animation: bell 2.6s ease-in-out infinite;
            display: inline-block;
            transform-origin: top center;
          }
          @keyframes bell {
            0%, 100% { transform: rotate(0deg); }
            15% { transform: rotate(7deg); }
            30% { transform: rotate(-6deg); }
            45% { transform: rotate(4deg); }
            60% { transform: rotate(-3deg); }
          }
        `}</style>
      </main>
    );
  }

  // ── Success: Token Generated/Retrieved ──
  if (generatedToken) {
    return (
      <AnimatePresence mode="wait">
        <motion.main 
          key="success-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900"
        >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,227,197,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(253,225,223,0.75),_transparent_28%),linear-gradient(180deg,_#fff9f4_0%,_#fff2e9_45%,_#fff8f1_100%)]" />
        <div className="mandala absolute inset-0 opacity-60" />
        <div className="floral absolute inset-x-0 top-0 h-28" />
        <div className="floral absolute inset-x-0 bottom-0 h-28 rotate-180" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-lg"
            ref={successRef}
          >
            <div className="rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-10 text-center shadow-[0_24px_80px_rgba(162,89,62,0.10)] backdrop-blur-xl sm:px-10 sm:py-14">
              {/* Animated checkmark */}
              <div className="gsap-checkmark mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-lg shadow-emerald-100/50">
                <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              {/* Heading */}
              <div className="gsap-title">
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">
                  {isExisting ? "Token Retrieved" : "Success"}
                </p>
                <h2 className="mt-4 font-serif text-2xl leading-tight text-rose-950 sm:text-3xl">
                  Token Generated Successfully
                </h2>
              </div>

              {/* Token Display Card */}
              <div
                ref={tokenBoxRef}
                className="token-box relative mx-auto mt-8 max-w-md overflow-hidden rounded-[2rem] border-2 border-amber-200/60 bg-white/90 px-6 py-8 shadow-[0_0_40px_rgba(251,191,36,0.25)] backdrop-blur-md"
              >
                {/* Subtle animated gradient background inside token box */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(252,211,77,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite_linear]" />
                
                <div className="relative z-10">
                  <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-amber-500 drop-shadow-sm">Your Token</p>
                  <p className="mt-4 select-all font-mono text-5xl font-black tracking-widest text-rose-950 sm:text-6xl drop-shadow-sm">
                    {generatedToken}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedToken);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);

                      if (tokenBoxRef.current) {
                        gsap.fromTo(
                          tokenBoxRef.current,
                          { scale: 1, boxShadow: "0 0 40px rgba(251,191,36,0.25)" },
                          { scale: 1.03, boxShadow: "0 0 60px rgba(251,191,36,0.6)", duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }
                        );
                      }
                    }}
                    className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-6 py-3 text-sm font-semibold text-amber-700 shadow-sm transition-all hover:scale-105 hover:bg-amber-100 hover:shadow-md active:scale-95"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2"
                        >
                          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Copied!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                          Copy Token
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Instruction */}
              <div className="gsap-instruction mx-auto mt-8 max-w-[280px] rounded-2xl border border-rose-100 bg-rose-50/60 px-5 py-4 shadow-sm">
                <p className="text-[13px] leading-relaxed text-rose-900/80">
                  <span className="font-semibold text-rose-700">Please copy and save this token.</span><br/>
                  Use it with your mobile number to access the form.
                </p>
              </div>

              {/* Continue to Login Button */}
              <div className="gsap-continue-btn">
                <Link
                  href="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-10 py-4.5 text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(232,141,176,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(232,141,176,0.4)] active:scale-[0.98]"
                >
                  Continue to Login
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <style jsx>{`
          .mandala {
            background-image:
              radial-gradient(circle at center, rgba(210, 161, 108, 0.11) 0, rgba(210, 161, 108, 0.11) 1px, transparent 1px),
              radial-gradient(circle at center, rgba(232, 150, 165, 0.1) 0, rgba(232, 150, 165, 0.1) 1px, transparent 1px);
            background-size: 36px 36px, 120px 120px;
            background-position: 0 0, 18px 18px;
            mask-image: radial-gradient(circle at center, black 36%, transparent 92%);
          }
          .floral {
            background:
              linear-gradient(90deg, transparent, rgba(250, 225, 184, 0.9), transparent),
              repeating-linear-gradient(90deg, transparent 0 28px, rgba(233, 176, 130, 0.18) 28px 40px, transparent 40px 68px);
          }
        `}</style>
        </motion.main>
      </AnimatePresence>
    );
  }

  // ── Token Request Form (after Google sign-in) ──
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,227,197,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(253,225,223,0.75),_transparent_28%),linear-gradient(180deg,_#fff9f4_0%,_#fff2e9_45%,_#fff8f1_100%)]" />
      <div className="mandala absolute inset-0 opacity-60" />
      <div className="floral absolute inset-x-0 top-0 h-28" />
      <div className="floral absolute inset-x-0 bottom-0 h-28 rotate-180" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-xl"
        >
          <div className="rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-10 shadow-[0_24px_80px_rgba(162,89,62,0.10)] backdrop-blur-xl sm:px-10 sm:py-14">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-5 flex items-center justify-center gap-4 text-4xl text-amber-500">
                <span className="bell">۞</span>
                <span>✿</span>
                <span className="bell" style={{ animationDelay: "0.2s" }}>۞</span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-700/80">Generate Token</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-rose-950 sm:text-4xl">
                Fill in your details to get your token.
              </h2>
            </div>

            {/* Signed-in indicator */}
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-emerald-800">{user.displayName}</p>
                <p className="truncate text-xs text-emerald-600">{user.email}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">✓ Verified</span>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Full Name <span className="text-rose-400">*</span></span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Mobile Number <span className="text-rose-400">*</span></span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Email <span className="text-rose-400">*</span></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">
                  Aadhaar Last 4 Digits <span className="text-stone-400 normal-case">(optional)</span>
                </span>
                <input
                  type="text"
                  value={aadhaarLast4}
                  onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="e.g. 1234"
                  className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>
            </div>

            {/* Error */}
            {formError && (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{formError}</p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full rounded-full bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Generating Token..." : "Get My Token"}
            </button>

            {/* Back Link */}
            <p className="mt-6 text-center text-sm text-stone-500">
              Already have a token?{" "}
              <Link href="/register" className="font-semibold text-amber-700 transition hover:text-rose-700 hover:underline">
                Access Form
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        .mandala {
          background-image:
            radial-gradient(circle at center, rgba(210, 161, 108, 0.11) 0, rgba(210, 161, 108, 0.11) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(232, 150, 165, 0.1) 0, rgba(232, 150, 165, 0.1) 1px, transparent 1px);
          background-size: 36px 36px, 120px 120px;
          background-position: 0 0, 18px 18px;
          mask-image: radial-gradient(circle at center, black 36%, transparent 92%);
        }
        .floral {
          background:
            linear-gradient(90deg, transparent, rgba(250, 225, 184, 0.9), transparent),
            repeating-linear-gradient(90deg, transparent 0 28px, rgba(233, 176, 130, 0.18) 28px 40px, transparent 40px 68px);
        }
        .bell {
          animation: bell 2.6s ease-in-out infinite;
          display: inline-block;
          transform-origin: top center;
        }
        @keyframes bell {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(7deg); }
          30% { transform: rotate(-6deg); }
          45% { transform: rotate(4deg); }
          60% { transform: rotate(-3deg); }
        }
      `}</style>
    </main>
  );
}
