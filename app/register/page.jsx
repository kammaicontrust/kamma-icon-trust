
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/app/lib/firebase";
import { useGuide, GUIDE_STEPS } from "../context/GuideContext";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const steps = [
  ["Birth Details", ["name", "gender", "dateOfBirth", "timeOfBirth", "placeOfBirth"]],
  ["Tradition & Roots", ["maritalStatus", "religion", "gotra", "rashi", "nakshatra"]],
  ["Personal Profile", ["complexion", "bloodGroup", "height", "weight"]],
  ["Education & Career", ["education", "occupation", "income", "propertyShare"]],
  ["Family Details", ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "siblings"]],
  ["Contact & Finish", ["address", "contactNumber", "emailId"]],
];

const fields = {
  name: { label: "Name", type: "text", placeholder: "Enter full name" },
  gender: { label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  dateOfBirth: { label: "Date of Birth", type: "date" },
  timeOfBirth: { label: "Time of Birth", type: "time" },
  placeOfBirth: { label: "Place of Birth", type: "text", placeholder: "Town / City / Village" },
  maritalStatus: { label: "Marital Status", type: "select", options: ["Never Married", "Divorced", "Widowed", "Late Marriage"] },
  religion: { label: "Religion", type: "text", placeholder: "Religion" },
  gotra: { label: "Gotra", type: "text", placeholder: "Gotra" },
  rashi: { label: "Rashi", type: "text", placeholder: "Rashi" },
  nakshatra: { label: "Nakshatra", type: "text", placeholder: "Nakshatra" },
  complexion: { label: "Complexion", type: "text", placeholder: "Complexion" },
  bloodGroup: { label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  height: { label: "Height", type: "text", placeholder: "e.g. 5 ft 8 in" },
  weight: { label: "Weight", type: "text", placeholder: "e.g. 62 kg" },
  education: { label: "Education", type: "text", placeholder: "Highest qualification" },
  occupation: { label: "Occupation", type: "text", placeholder: "Occupation" },
  income: { label: "Income", type: "text", placeholder: "Annual income" },
  propertyShare: { label: "Property Share", type: "text", placeholder: "Property / assets details" },
  fatherName: { label: "Father's Name", type: "text", placeholder: "Father's name" },
  fatherOccupation: { label: "Father's Occupation", type: "text", placeholder: "Father's occupation" },
  motherName: { label: "Mother's Name", type: "text", placeholder: "Mother's name" },
  motherOccupation: { label: "Mother's Occupation", type: "text", placeholder: "Mother's occupation" },
  siblings: { label: "Siblings (Brother / Sister)", type: "text", placeholder: "e.g. 1 Brother, 2 Sisters" },
  address: { label: "Address", type: "textarea", placeholder: "Complete residential address" },
  contactNumber: { label: "Contact Number", type: "tel", placeholder: "10-digit phone number" },
  emailId: { label: "Email ID", type: "email", placeholder: "Email address" },
};

const initialForm = Object.fromEntries(Object.keys(fields).map((key) => [key, ""]));

function validate(name, value) {
  const clean = typeof value === "string" ? value.trim() : value;
  if (!clean) return "This field is required.";
  if (name === "contactNumber" && !/^\d{10}$/.test(String(clean))) return "Enter a valid 10-digit phone number.";
  if (name === "emailId" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(clean))) return "Enter a valid email address.";
  return "";
}

function stepErrors(stepIndex, formData) {
  return steps[stepIndex][1].reduce((acc, name) => {
    const error = validate(name, formData[name]);
    if (error) acc[name] = error;
    return acc;
  }, {});
}

function InputField({ name, value, error, onChange, onBlur }) {
  const field = fields[name];
  const base = "w-full rounded-[1.2rem] border bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300";
  const state = error
    ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    : "border-amber-100 focus:border-amber-300 focus:ring-4 focus:ring-amber-100";

  return (
    <label className={`flex flex-col gap-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">{field.label}</span>
      {field.type === "select" ? (
        <select value={value} onChange={(event) => onChange(name, event.target.value)} onBlur={() => onBlur(name)} className={`${base} ${state}`}>
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(name, event.target.value)} onBlur={() => onBlur(name)} placeholder={field.placeholder} className={`${base} ${state} resize-none`} />
      ) : (
        <input type={field.type} value={value} onChange={(event) => onChange(name, event.target.value)} onBlur={() => onBlur(name)} placeholder={field.placeholder} className={`${base} ${state}`} />
      )}
      <span className={`min-h-5 text-sm ${error ? "text-rose-600" : "text-transparent"}`}>{error || "."}</span>
    </label>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [burst, setBurst] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [tokenVerified, setTokenVerified] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [verifiedTokenId, setVerifiedTokenId] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({});
  const canvasRef = useRef(null);

  // ── Token Gate State ──
  const [gateVerified, setGateVerified] = useState(false);
  const [gateMobile, setGateMobile] = useState("");
  const [gateToken, setGateToken] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [gateEmptyError, setGateEmptyError] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // ── Auto-fill from localStorage (coming from get-token page) ──
  useEffect(() => {
    const savedToken = localStorage.getItem("kit_gen_token");
    const savedMobile = localStorage.getItem("kit_gen_mobile");
    if (savedToken && savedMobile) {
      setGateToken(savedToken);
      setGateMobile(savedMobile);
      setShowIntro(false); // Skip intro, go straight to login
    }
  }, []);

  const { setStep: setGuideStep } = useGuide();

  const totalSteps = steps.length;
  const [stepTitle, stepFields] = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;
  const chips = useMemo(
    () => [formData.name || "Profile in progress", formData.education || "Education pending", formData.occupation || "Occupation pending"],
    [formData.education, formData.name, formData.occupation]
  );

  // Guide Steps effect
  useEffect(() => {
    if (!gateVerified) {
      setGuideStep(GUIDE_STEPS.LOGIN);
    } else if (gateVerified && user && tokenVerified && !success) {
      if (step === totalSteps - 1) {
        setGuideStep(GUIDE_STEPS.FINAL_SUBMIT);
      } else {
        setGuideStep(GUIDE_STEPS.FORM_FILLING);
      }
    }
  }, [gateVerified, user, tokenVerified, success, step, totalSteps, setGuideStep]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setAuthReady(true);

      if (!authUser) {
        setTokenVerified(false);
        setVerifiedTokenId("");
        setTokenValue("");
        return;
      }

      setFormData((current) => ({ ...current, emailId: current.emailId || authUser.email || "" }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let dotLottieInstance = null;
    if (submitting && canvasRef.current) {
      import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
        dotLottieInstance = new DotLottie({
          autoplay: true,
          loop: true,
          canvas: canvasRef.current,
          src: "https://lottie.host/bcc64836-d5f2-4b3d-89f8-22261c93a970/f9Tx2HLyHb.lottie",
        });
      }).catch(err => console.error("Failed to load Lottie:", err));
    }
    return () => {
      if (dotLottieInstance) {
        dotLottieInstance.destroy();
      }
    };
  }, [submitting]);

  const handleLogin = async () => {
    setSigningIn(true);
    setSubmitError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      setSubmitError(error.message || "Google sign-in failed.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStep(0);
    setErrors({});
    setSuccess(false);
    setSubmitError("");
    setTokenError("");
    setTokenVerified(false);
    setVerifiedTokenId("");
    setTokenValue("");
    setProfileImage(null);
    setResumeFile(null);
    setFileErrors({});
    setFormData(initialForm);
  };

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: validate(name, value) }));
  };

  const blurField = (name) => {
    setErrors((current) => ({ ...current, [name]: validate(name, formData[name]) }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileErrors((current) => ({ ...current, profileImage: "Please upload a valid image file." }));
      return;
    }
    setProfileImage(file);
    setFileErrors((current) => ({ ...current, profileImage: "" }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileErrors((current) => ({ ...current, resume: "Please upload a PDF resume." }));
      return;
    }
    setResumeFile(file);
    setFileErrors((current) => ({ ...current, resume: "" }));
  };

  const verifyToken = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setTokenError(`Too many failed attempts. Please try again in ${remaining} seconds.`);
      return;
    }

    const cleanToken = tokenValue.trim().toUpperCase();
    if (!user) {
      setTokenError("Please sign in with Google first.");
      return;
    }
    if (!cleanToken) {
      setTokenError("Please enter your token.");
      return;
    }

    setVerifyingToken(true);
    setTokenError("");

    try {
      console.log("Token verification input:", cleanToken);

      const tokenFieldQuery = query(
        collection(db, "users"),
        where("token", "==", cleanToken)
      );

      const tokenSnapshot = await getDocs(tokenFieldQuery);
      const snapshot = tokenSnapshot;

      console.log(
        "Token verification query result:",
        {
          tokenFieldMatches: tokenSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        }
      );

      if (snapshot.empty) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 30000);
          setTokenError("Too many failed attempts. Please try again in 30 seconds.");
        } else {
          setTokenError("Invalid token");
        }
        return;
      }

      const tokenDoc = snapshot.docs[0];

      setFailedAttempts(0);
      setLockoutUntil(null);
      setTokenValue(cleanToken);
      setVerifiedTokenId(tokenDoc.id);
      setTokenVerified(true);
    } catch (error) {
      console.error(error);
      setTokenError(error.message || "Token verification failed. Please try again.");
    } finally {
      setVerifyingToken(false);
    }
  };

  const nextStep = () => {
    const currentErrors = stepErrors(step, formData);
    if (Object.keys(currentErrors).length) {
      setErrors((current) => ({ ...current, ...currentErrors }));
      return;
    }
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const uploadFileToStorage = async (folder, file) => {
    const currentUser = auth.currentUser;
    console.log("auth.currentUser before upload:", currentUser);
    console.log("storage bucket before upload:", storage.app.options.storageBucket);

    if (!currentUser) {
      throw new Error("Please sign in before uploading files.");
    }

    const filePath = `${folder}/${currentUser.uid}/${Date.now()}-${file.name}`;
    console.log(`Uploading ${folder} to:`, filePath);

    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const submit = async () => {
    const allErrors = steps.reduce((acc, _, index) => ({ ...acc, ...stepErrors(index, formData) }), {});
    const nextFileErrors = {
      profileImage: profileImage ? "" : "Profile image is required.",
      resume: resumeFile ? "" : "Resume PDF is required.",
    };

    if (Object.keys(allErrors).length || nextFileErrors.profileImage || nextFileErrors.resume) {
      setErrors(allErrors);
      setFileErrors(nextFileErrors);
      const firstBadStep = steps.findIndex((entry) => entry[1].some((name) => allErrors[name]));
      if (firstBadStep >= 0) setStep(firstBadStep);
      return;
    }

    if (!user) {
      setSubmitError("Please sign in with Google to continue.");
      return;
    }
    if (!tokenVerified || !verifiedTokenId) {
      setSubmitError("Please verify your token before accessing the form.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setBurst(true);

    try {
      const profile = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
      );

      console.log("Current user before upload:", user);

      if (!authReady || !user) {
        throw new Error("Please wait for login to complete before submitting.");
      }

      const [profileImageUrl, resumeUrl] = await Promise.all([
        uploadFileToStorage("images", profileImage),
        uploadFileToStorage("resumes", resumeFile),
      ]);

      await setDoc(
        doc(db, "registrations", user.uid),
        {
          uid: user.uid,
          email: user.email || "",
          registrationEmail: profile.emailId,
          authProvider: "google",
          tokenId: verifiedTokenId,
          tokenValue: tokenValue.trim(),
          token: tokenValue.trim().toUpperCase(),
          mobile: profile.contactNumber,
          name: profile.name,
          profileCompleted: true,
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profileImageUrl,
          resumeUrl,
          profile,
        },
        { merge: true }
      );

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setSubmitError(error.message || "Could not submit registration.");
      setBurst(false);
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setBurst(false), 1200);
    }
  };

  // ── Gate Verification Handler ──
  const handleGateVerify = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setGateError(`Too many failed attempts. Please try again in ${remaining} seconds.`);
      return;
    }

    const cleanMobile = gateMobile.trim();
    const cleanToken = gateToken.trim().toUpperCase();

    if (!cleanMobile || !cleanToken) {
      setGateEmptyError(true);
      setGateError("Please enter mobile number and token");
      setTimeout(() => setGateEmptyError(false), 500);
      return;
    }
    if (!/^\d{10}$/.test(cleanMobile)) {
      setGateError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setGateLoading(true);
    setGateError("");

    try {
      // Check users collection for matching mobile + token
      const tokenQuery = query(
        collection(db, "users"),
        where("token", "==", cleanToken),
        where("mobile", "==", cleanMobile)
      );

      const snapshot = await getDocs(tokenQuery);

      if (snapshot.empty) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 30000);
          setGateError("Too many failed attempts. Please try again in 30 seconds.");
        } else {
          setGateError("Invalid mobile number or token. Please check and try again.");
        }
        return;
      }

      const tokenDoc = snapshot.docs[0];
      const tokenData = tokenDoc.data();

      // Gate passed — pre-fill token for the inner verification step
      setFailedAttempts(0);
      setLockoutUntil(null);
      setTokenValue(cleanToken);
      setGateVerified(true);

      // Clean up localStorage after successful gate pass
      localStorage.removeItem("kit_gen_token");
      localStorage.removeItem("kit_gen_mobile");
    } catch (error) {
      console.error("Gate verification error:", error);
      setGateError("Verification failed. Please try again.");
    } finally {
      setGateLoading(false);
    }
  };

  // ── Step 1: Get Token Intro Screen ──
  if (!gateVerified && showIntro) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,227,197,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(253,225,223,0.75),_transparent_28%),linear-gradient(180deg,_#fff9f4_0%,_#fff2e9_45%,_#fff8f1_100%)]" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-md text-center"
          >
            <div className="rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-12 shadow-[0_24px_80px_rgba(162,89,62,0.10)] backdrop-blur-xl sm:px-10 sm:py-16">
              {/* Step indicator */}
              <span className="inline-block rounded-full bg-amber-100/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700 mb-6">
                Step 1
              </span>

              <h2 className="font-serif text-3xl leading-tight text-rose-950 sm:text-4xl">
                To start registration, generate your token
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-base text-stone-500">
                You&apos;ll need a unique token to access the registration form.
              </p>

              <a
                href="/get-token"
                className="mt-10 inline-block w-full max-w-[280px] rounded-2xl bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-8 py-5 text-[17px] font-semibold text-white shadow-[0_8px_30px_rgba(232,141,176,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,141,176,0.35)] active:scale-[0.98]"
              >
                Get Token
              </a>

              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="mt-6 block mx-auto text-sm font-semibold text-amber-700 transition hover:text-rose-700 hover:underline"
              >
                I already have a token
              </button>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  // ── Step 4: Token Gate / Login Screen ──
  if (!gateVerified) {
    return (
      <AnimatePresence mode="wait">
        <motion.main 
          key="gate-screen"
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-xl"
          >
            <div className="rounded-[2.5rem] border border-white/70 bg-white/75 px-6 py-10 shadow-[0_24px_80px_rgba(162,89,62,0.10)] backdrop-blur-xl sm:px-10 sm:py-14">
              {/* Header */}
              <div className="mb-10 text-center">
                <div className="mb-5 flex items-center justify-center gap-4 text-4xl text-amber-500">
                  <span className="bell">۞</span>
                  <span>✿</span>
                  <span className="bell" style={{ animationDelay: "0.2s" }}>۞</span>
                </div>
                <span className="inline-block rounded-full bg-amber-100/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700 mb-4">
                  Step 2
                </span>
                <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-rose-950 sm:text-4xl">
                  Login to continue
                </h2>
                <p className="mx-auto mt-3 max-w-md text-base text-stone-500">
                  Enter your mobile number and token to access the form
                </p>
              </div>

              {/* Mobile Input */}
              <div data-guide="login-form" className={`space-y-6 transition-opacity duration-300 relative rounded-2xl ${gateLoading ? 'pointer-events-none opacity-50' : ''}`}>
                <label className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-900/70 ml-1">Mobile Number</span>
                  <input
                    type="tel"
                    value={gateMobile}
                    onChange={(e) => setGateMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className={`w-full rounded-2xl border ${gateEmptyError && !gateMobile.trim() ? 'border-red-400 bg-red-50/50 animate-[shake_0.4s_ease-in-out]' : 'border-rose-100 bg-white/90'} px-5 py-4 text-[16px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-rose-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,113,133,0.15)]`}
                  />
                </label>

                {/* Token Input */}
                <label className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-900/70 ml-1">Token Code</span>
                  <input
                    type="text"
                    value={gateToken}
                    onChange={(e) => setGateToken(e.target.value)}
                    placeholder="Enter your token (e.g. KIT-XXXXXX)"
                    className={`w-full rounded-2xl border ${gateEmptyError && !gateToken.trim() ? 'border-red-400 bg-red-50/50 animate-[shake_0.4s_ease-in-out]' : 'border-rose-100 bg-white/90'} px-5 py-4 text-[16px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-rose-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,113,133,0.15)] uppercase`}
                  />
                </label>
              </div>

              {/* Error */}
              <AnimatePresence>
                {gateError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 rounded-2xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-center text-[14px] font-medium text-rose-600 shadow-sm backdrop-blur-sm"
                  >
                    {gateError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Access Form Button */}
              <button
                type="button"
                onClick={handleGateVerify}
                disabled={gateLoading}
                className="mt-8 w-full rounded-2xl bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-8 py-4.5 text-[16px] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(232,141,176,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {gateLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Access Form"
                )}
              </button>

              {/* Get Token Link */}
              <p className="mt-6 text-center text-sm text-stone-500">
                Don&apos;t have a token?{" "}
                <a href="/get-token" className="font-semibold text-amber-700 transition hover:text-rose-700 hover:underline">
                  Get Token
                </a>
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
        </motion.main>
      </AnimatePresence>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7ef] text-stone-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,227,197,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(253,225,223,0.75),_transparent_28%),linear-gradient(180deg,_#fff9f4_0%,_#fff2e9_45%,_#fff8f1_100%)]" />
      <div className="mandala absolute inset-0 opacity-60" />
      <div className="floral absolute inset-x-0 top-0 h-28" />
      <div className="floral absolute inset-x-0 bottom-0 h-28 rotate-180" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8 lg:py-10">
        <aside className="w-full lg:sticky lg:top-8 lg:max-w-md">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_80px_rgba(155,92,63,0.12)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between text-amber-700">
              <span className="rounded-full border border-amber-200 bg-amber-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">Telugu Wedding</span>
              <span className="bell text-2xl">۞</span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-700/80">Matrimonial Registration</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-rose-950 sm:text-5xl">A form that feels like a wedding invitation.</h1>

            <div className="mt-8 rounded-[1.75rem] border border-amber-100 bg-gradient-to-br from-[#fff8ef] via-[#fff2e9] to-[#ffe8ea] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-800/80">Progress</p>
                <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-rose-700">{step + 1}/{totalSteps}</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#e0b65c,#f18ca8,#e0b65c)] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid gap-3">
                {steps.map(([title], index) => (
                  <div key={title} className={`rounded-[1.1rem] border px-4 py-3 ${index === step ? "border-rose-200 bg-white/85 shadow-md" : index < step ? "border-amber-100 bg-amber-50/70" : "border-transparent bg-white/45"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-rose-950">{title}</p>
                      <span className="text-sm font-semibold text-amber-700">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-stone-600">{chip}</span>
              ))}
            </div>
          </div>
        </aside>
        <section className="w-full flex-1">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_24px_90px_rgba(139,78,48,0.12)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-6 pt-4 text-emerald-600/80 sm:px-8">
              <span className="leaf">❦❦❦</span>
              <span className="leaf">❦❦❦</span>
            </div>

            {!authReady ? (
              <div className="flex min-h-[720px] items-center justify-center p-8">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-amber-200 border-t-rose-400" />
              </div>
            ) : !user ? (
              <div className="flex min-h-[720px] items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-2xl rounded-[2rem] border border-amber-100 bg-[linear-gradient(145deg,rgba(255,249,242,0.96),rgba(255,240,236,0.94))] px-6 py-10 text-center shadow-[0_24px_80px_rgba(162,89,62,0.10)]">
                  <div className="mb-6 flex items-center justify-center gap-4 text-4xl text-amber-500">
                    <span className="bell">۞</span>
                    <span>✿</span>
                    <span className="bell" style={{ animationDelay: "0.2s" }}>۞</span>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-700/80">Google Sign-In Required</p>
                  <h2 className="mt-4 font-serif text-4xl leading-tight text-rose-950 sm:text-5xl">Enter before the form opens.</h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-600">
                    Sign in with Google first. Token verification happens immediately after sign-in before the registration form unlocks.
                  </p>

                  <button type="button" onClick={handleLogin} disabled={signingIn} className="mt-10 inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-amber-200 bg-white px-8 py-4 text-base font-semibold text-stone-700 shadow-[0_18px_40px_rgba(170,102,70,0.12)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm">G</span>
                    {signingIn ? "Signing in..." : "Continue with Google"}
                  </button>

                  {submitError ? <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</p> : null}
                </div>
              </div>
            ) : !tokenVerified ? (
              <div className="flex min-h-[720px] items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-2xl rounded-[2rem] border border-amber-100 bg-[linear-gradient(145deg,rgba(255,249,242,0.96),rgba(255,240,236,0.94))] px-6 py-10 text-center shadow-[0_24px_80px_rgba(162,89,62,0.10)]">
                  <div className="mb-6 flex items-center justify-center gap-4 text-4xl text-amber-500">
                    <span className="bell">۞</span>
                    <span>✿</span>
                    <span className="bell" style={{ animationDelay: "0.2s" }}>۞</span>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-700/80">Token Verification</p>
                  <h2 className="mt-4 font-serif text-4xl leading-tight text-rose-950 sm:text-5xl">Enter your invitation token.</h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-600">
                    Only valid unused tokens can unlock the matrimonial form. The token is marked as used immediately after successful verification.
                  </p>

                  <div className="mx-auto mt-8 max-w-md text-left">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Registration Token</span>
                      <input type="text" value={tokenValue} onChange={(event) => setTokenValue(event.target.value)} placeholder="Enter your token" className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition placeholder:text-rose-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                    </label>
                    {tokenError ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{tokenError}</p> : null}
                  </div>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <button type="button" onClick={verifyToken} disabled={verifyingToken} className="rounded-full bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-8 py-3.5 font-semibold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70">
                      {verifyingToken ? "Verifying..." : "Verify Token"}
                    </button>
                    <button type="button" onClick={handleLogout} className="rounded-full border border-amber-200 bg-white px-6 py-3.5 font-semibold text-stone-700 transition hover:-translate-y-1">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : success ? (
              <div className="flex min-h-[720px] items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-2xl rounded-[2rem] border border-amber-100 bg-[linear-gradient(145deg,rgba(255,251,245,0.98),rgba(255,239,235,0.96))] px-6 py-12 text-center shadow-[0_24px_80px_rgba(162,89,62,0.12)]">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-rose-200 to-white text-5xl shadow-lg">❤</div>
                  <h2 className="mt-8 font-serif text-4xl text-rose-950 sm:text-5xl">Registration Successful ❤️</h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-600">
                    Your full registration, profile image, and resume have been saved securely.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <button type="button" onClick={() => setSuccess(false)} className="rounded-full border border-amber-200 bg-white px-6 py-3.5 font-semibold text-stone-700 transition hover:-translate-y-1">
                      Review Submission
                    </button>
                    <button type="button" onClick={handleLogout} className="rounded-full bg-[linear-gradient(135deg,#e0b65c,#f18ca8)] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-1">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="mb-8 flex flex-col gap-5 border-b border-amber-100/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-700/80">Signed in with Google</p>
                    <h2 className="mt-3 font-serif text-3xl text-rose-950 sm:text-4xl">{stepTitle}</h2>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-stone-600">Complete every field in this step before continuing.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-amber-100 bg-white/85 px-4 py-4">
                    <p className="text-sm font-medium text-stone-500">Authenticated as</p>
                    <p className="mt-1 font-semibold text-rose-900">{user.email}</p>
                    <p className="mt-1 text-sm text-stone-500">Token verified</p>
                    <button type="button" onClick={handleLogout} className="mt-3 text-sm font-semibold text-amber-700 hover:text-rose-700">Sign out</button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div data-guide="form-fields" key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.3, ease: "easeOut" }} className="grid gap-5 md:grid-cols-2 relative rounded-2xl">
                    {stepFields.map((name) => (
                      <InputField key={name} name={name} value={formData[name]} error={errors[name]} onChange={updateField} onBlur={blurField} />
                    ))}
                    {step === totalSteps - 1 ? (
                      <>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Profile Image</span>
                          <input type="file" accept="image/*" onChange={handleProfileImageChange} className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[linear-gradient(135deg,#f2d188,#e88db0)] file:px-4 file:py-2 file:font-semibold file:text-white" />
                          <span className={`min-h-5 text-sm ${fileErrors.profileImage ? "text-rose-600" : "text-stone-500"}`}>{fileErrors.profileImage || profileImage?.name || "Upload your profile image"}</span>
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-sm font-medium uppercase tracking-[0.08em] text-rose-900/80">Resume (PDF)</span>
                          <input type="file" accept="application/pdf,.pdf" onChange={handleResumeChange} className="w-full rounded-[1.2rem] border border-amber-100 bg-white/85 px-4 py-3.5 text-[15px] text-stone-800 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[linear-gradient(135deg,#f2d188,#e88db0)] file:px-4 file:py-2 file:font-semibold file:text-white" />
                          <span className={`min-h-5 text-sm ${fileErrors.resume ? "text-rose-600" : "text-stone-500"}`}>{fileErrors.resume || resumeFile?.name || "Upload your PDF resume"}</span>
                        </label>
                      </>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {submitError ? <p className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{submitError}</p> : null}

                <div className="mt-8 flex flex-col gap-4 border-t border-amber-100/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    {step > 0 ? (
                      <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className="rounded-full border border-amber-200 bg-white px-5 py-3 font-semibold text-stone-700 transition hover:-translate-y-1">
                        Previous
                      </button>
                    ) : null}
                    <span className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step {step + 1} of {totalSteps}</span>
                  </div>

                  {step < totalSteps - 1 ? (
                    <button type="button" onClick={nextStep} className="rounded-full bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-1">
                      Save and Continue
                    </button>
                  ) : (
                    <div data-guide="submit-btn" className="relative rounded-full">
                      <div className="pointer-events-none absolute -top-7 left-1/2 flex -translate-x-1/2 gap-1.5 text-sm text-emerald-600">
                        {["❦", "❦", "❦", "❦", "❦", "❦"].map((leafChar, index) => (
                          <span key={`${leafChar}-${index}`} className="leaf" style={{ animationDelay: `${index * 0.12}s` }}>{leafChar}</span>
                        ))}
                      </div>
                      <button type="button" onClick={submit} disabled={submitting} className="submit-btn relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full px-8 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(186,128,73,0.34)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-75">
                        <span className="relative z-10 flex items-center justify-center">
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <canvas ref={canvasRef} style={{ width: "40px", height: "40px" }}></canvas>
                            </div>
                          ) : (
                            "Submit Registration"
                          )}
                        </span>
                        {!submitting && (
                          <span className={`burst ${burst ? "active" : ""}`} aria-hidden="true">
                            {Array.from({ length: 10 }).map((_, index) => (
                              <span key={index} className="burst-item" style={{ "--x": `${Math.cos((index / 10) * Math.PI * 2) * 64}px`, "--y": `${Math.sin((index / 10) * Math.PI * 2) * 64}px`, animationDelay: `${index * 0.03}s` }}>
                                {index % 2 === 0 ? "❤" : "✿"}
                              </span>
                            ))}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
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
        .leaf {
          animation: leaf 2.4s ease-in-out infinite;
          display: inline-block;
        }
        .submit-btn {
          background: linear-gradient(135deg, #d8aa4e, #ef92a7 55%, #e6be65);
        }
        .submit-btn::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), transparent 55%);
        }
        .burst {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .burst-item {
          position: absolute;
          left: 50%;
          top: 50%;
          font-size: 1rem;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.2);
        }
        .burst.active .burst-item {
          animation: burst 0.95s ease-out forwards;
        }
        @keyframes bell {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(7deg); }
          30% { transform: rotate(-6deg); }
          45% { transform: rotate(4deg); }
          60% { transform: rotate(-3deg); }
        }
        @keyframes leaf {
          0%, 100% { transform: translateY(0px); opacity: 0.95; }
          50% { transform: translateY(-4px); opacity: 0.65; }
        }
        @keyframes burst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2); }
        }
      `}</style>
    </main>
  );
}
