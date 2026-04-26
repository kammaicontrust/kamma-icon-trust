"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-black tracking-tight text-[#0A1F44] sm:text-5xl mb-6">
              Who We Are
            </h2>
            <div className="h-1.5 w-20 bg-[#D4882F] mb-8" />
            <p className="text-lg leading-relaxed text-[#0A1F44]/70 mb-6">
              Kamma Icon Trust is a registered charitable organization dedicated to 
              community welfare and social development. Our mission is to uplift 
              the needy while preserving our cultural roots.
            </p>
            <p className="text-lg leading-relaxed text-[#0A1F44]/70">
              Through various initiatives in education, healthcare, and women 
              empowerment, we strive to create a meaningful impact in society.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-video rounded-3xl bg-gradient-to-br from-[#D4882F]/10 to-[#2A7B3A]/10 border border-white/40 shadow-2xl backdrop-blur-sm flex items-center justify-center p-12"
          >
            <div className="text-center">
              <span className="text-6xl font-black text-[#D4882F]/20 block mb-4 italic">Vision</span>
              <p className="text-xl font-bold text-[#0A1F44]">
                "Empowering lives through collective growth and tradition."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
