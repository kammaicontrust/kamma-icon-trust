"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../context/GuideContext";

export default function OnboardingOverlay() {
  const { content, currentStep } = useGuide();
  const [dismissed, setDismissed] = useState(false);
  const [lastStep, setLastStep] = useState(null);

  // Reset dismissed state when step changes
  useEffect(() => {
    if (currentStep && currentStep !== lastStep) {
      setDismissed(false);
      setLastStep(currentStep);
    }
  }, [currentStep, lastStep]);

  const show = content && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fff7ef]"
        >
          <div className="w-full max-w-md mx-auto px-6 text-center">
            {/* Step pill */}
            <span className="inline-block rounded-full bg-amber-100/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700 mb-8">
              Step {content.stepNumber} of 6
            </span>

            {/* One clear instruction */}
            <h1 className="font-serif text-[2rem] sm:text-4xl leading-[1.3] text-rose-950 mb-10">
              {content.message}
            </h1>

            {/* One main button */}
            <button
              onClick={() => setDismissed(true)}
              className="w-full max-w-[280px] rounded-2xl bg-[linear-gradient(135deg,#f2d188,#e88db0)] px-8 py-5 text-[17px] font-semibold text-white shadow-[0_8px_30px_rgba(232,141,176,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,141,176,0.35)] active:scale-[0.98]"
            >
              {content.buttonText}
            </button>

            {/* Skip link */}
            <button
              onClick={() => setDismissed(true)}
              className="mt-6 block mx-auto text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
