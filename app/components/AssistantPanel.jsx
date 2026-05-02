"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../context/GuideContext";

export default function AssistantPanel() {
  const { isActive, isDismissed, currentStep, content, startGuide, dismissGuide } = useGuide();
  const [targetRect, setTargetRect] = useState(null);

  // Position highlighting spotlight
  useEffect(() => {
    if (!isActive || !content?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateTarget = () => {
      const el = document.querySelector(content.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Auto scroll to element if not in viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setTargetRect(null);
      }
    };

    updateTarget();
    
    // Setup observers to track element position
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, { passive: true });
    
    // Mutation observer in case element gets added dynamically
    const observer = new MutationObserver(() => updateTarget());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget);
      observer.disconnect();
    };
  }, [isActive, content?.targetSelector]);

  if (isDismissed || !isActive || !content) return null;

  return (
    <>
      {/* Target Element Highlighter */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed z-[9998] rounded-xl border-[3px] border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              transition: "top 0.3s ease-out, left 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out",
            }}
          />
        )}
      </AnimatePresence>

      {/* Assistant Floating Panel */}
      <AnimatePresence>
        <motion.div
          key="assistant-panel"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-[9999] w-80 sm:w-96"
        >
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 p-5 shadow-[0_20px_40px_rgba(155,92,63,0.15)] backdrop-blur-xl">
            {/* Soft decorative background */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-rose-200/40 blur-2xl" />
            
            <div className="relative z-10 flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-200 shadow-inner">
                <span className="text-2xl">✨</span>
              </div>
              
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold text-rose-950">KIT Guide</h3>
                  {content.progress && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {content.progress}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-stone-600">
                  {content.message}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={dismissGuide}
                    className="text-xs font-semibold text-stone-400 transition hover:text-stone-600"
                  >
                    Dismiss
                  </button>
                  
                  {content.actionText && (
                    <button
                      onClick={startGuide}
                      className="rounded-full bg-[linear-gradient(135deg,#e0b65c,#f18ca8)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {content.actionText}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pulse ring for avatar */}
            <div className="absolute left-5 top-5 h-12 w-12 animate-ping rounded-full bg-amber-400/20" />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
