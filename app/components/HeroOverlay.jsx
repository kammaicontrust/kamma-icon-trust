"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Heart, HandCoins } from "lucide-react";

const heroButtons = [
  {
    id: "hero-btn-register",
    label: "Register",
    href: "/register",
    icon: UserPlus,
    variant: "saffron",
    pulse: true,
  },
  {
    id: "hero-btn-profiles",
    label: "Matrimonial Profiles",
    href: "/profiles",
    icon: Heart,
    variant: "green",
    pulse: false,
  },
  {
    id: "hero-btn-donate",
    label: "Donate",
    href: "/#contact",
    icon: HandCoins,
    variant: "navy",
    pulse: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 1.2,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function HeroOverlay({ onRegisterClick, isNavigating }) {
  return (
    <motion.div
      className="flex w-full max-w-[720px] flex-col items-center px-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Buttons: stacked on mobile, horizontal on sm+ */}
      <div className="flex w-full flex-col items-center gap-3.5 sm:flex-row sm:justify-center sm:gap-5 sm:flex-wrap">
        {heroButtons.map((btn) => {
          const Icon = btn.icon;
          const classes = [
            "glass-btn",
            `glass-btn--${btn.variant}`,
            btn.pulse ? "glass-btn--pulse" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const buttonContent = (
            <motion.button
              key={btn.id}
              id={btn.id}
              variants={buttonVariants}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className={classes}
              disabled={btn.id === "hero-btn-register" && isNavigating}
              onClick={
                btn.id === "hero-btn-register" && onRegisterClick
                  ? onRegisterClick
                  : undefined
              }
              style={{ pointerEvents: "auto" }}
            >
              <span className="btn-icon">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              {btn.label}
            </motion.button>
          );

          // Register uses onClick handler for premium transition; others use Link
          if (btn.id === "hero-btn-register") {
            return buttonContent;
          }

          return (
            <Link
              key={btn.id}
              href={btn.href}
              style={{ pointerEvents: "auto", textDecoration: "none" }}
            >
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

