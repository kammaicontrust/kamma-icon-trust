"use client";

import { useGuide } from "../context/GuideContext";
import { motion, AnimatePresence } from "framer-motion";

export default function StepGuide() {
  const { content } = useGuide();

  if (!content) return null;

  const barSteps = [
    { id: 1, label: "Get Token" },
    { id: 2, label: "Login" },
    { id: 3, label: "Fill Details" },
    { id: 4, label: "Submit" },
  ];

  return (
    <div className="fixed top-[88px] left-0 right-0 z-[50] flex flex-col items-center px-4 pointer-events-none">
      {/* Top Progress Bar */}
      <div className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-sm border border-stone-200/60 rounded-full px-5 sm:px-6 py-3.5 flex items-center justify-center gap-2 sm:gap-4 mb-4 max-w-md w-full">
        {barSteps.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-1 sm:gap-2">
            <span 
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors ${
                content.barStep === s.id 
                  ? "text-rose-600" 
                  : content.barStep > s.id
                  ? "text-amber-500"
                  : "text-stone-400"
              }`}
            >
              {s.label}
            </span>
            {idx < barSteps.length - 1 && (
              <span className="text-stone-300 text-xs sm:text-sm">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Step Instruction Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={content.stepLabel}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(155,92,63,0.12)] border border-amber-200/50 rounded-[1.5rem] px-6 py-4.5 w-full max-w-[320px] text-center"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-1.5 block">
            {content.stepLabel}
          </span>
          <p className="text-stone-800 font-medium text-[15px] leading-snug">
            {content.message}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
