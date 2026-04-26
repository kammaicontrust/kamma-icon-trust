"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
};

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 pt-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[#D4882F]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[#2A7B3A]/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 text-[12px] font-bold uppercase tracking-[0.4em] text-[#D4882F]"
          >
            Empowering Community
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-[#0A1F44] sm:text-7xl lg:text-8xl"
          >
            Kamma Icon <br />
            <span className="text-[#D4882F]">Trust</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[#0A1F44]/60"
          >
            A dedicated platform for social welfare, education support, and 
            heritage preservation. Join us in building a stronger tomorrow.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/register">
              <button className="min-w-[180px] rounded-full bg-[#0A1F44] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#D4882F] hover:shadow-xl hover:shadow-[#D4882F]/20">
                Register Now
              </button>
            </Link>
            <Link href="/#about">
              <button className="min-w-[180px] rounded-full border border-[#0A1F44]/10 px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#0A1F44] transition-all hover:border-[#D4882F] hover:text-[#D4882F]">
                Learn More
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
