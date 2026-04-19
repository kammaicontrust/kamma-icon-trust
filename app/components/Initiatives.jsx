"use client";

import { motion } from "framer-motion";
import {
  Scale, Award, HeartHandshake, Stethoscope, GraduationCap, Home,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardFade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } };

export default function Initiatives() {
  const initiatives = [
    { icon: <Home size={22} />, title: "Old Age Homes Support", description: "Providing shelter, medical assistance, and emotional support to ensure dignity and care for senior citizens." },
    { icon: <HeartHandshake size={22} />, title: "Marriage Counseling & Legal Support", description: "Professional marriage counseling and legal guidance to strengthen families, resolve conflicts peacefully, and promote emotional and legal awareness." },
    { icon: <Award size={22} />, title: "Legendary Awards Function", description: "An annual recognition initiative honoring individuals who have rendered selfless service across various professions, inspiring leadership and excellence." },
    { icon: <Scale size={22} />, title: "Free Marriage Introduction Platform", description: "A transparent and dignified annual platform supporting poor and middle-class families in finding suitable alliances within the community." },
    { icon: <Stethoscope size={22} />, title: "Health Camps", description: "Free medical checkups, health screenings, and awareness programs conducted in rural and urban areas without discrimination." },
    { icon: <GraduationCap size={22} />, title: "Educational Scholarships", description: "Financial assistance for children from economically weaker families to encourage education and long-term social upliftment." },
  ];

  return (
    <section id="initiatives" className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mx-auto mb-16 max-w-2xl text-center" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Making a Difference</p>
          <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">Our Initiatives</h2>
          <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          <p className="mt-6 text-[15px] leading-[1.7] text-[#0A1F44]/42">Kamma Icon Trust is committed to empowering society through structured initiatives focused on welfare, education, healthcare, and community development.</p>
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          {initiatives.map((item, i) => (
            <motion.div key={item.title} variants={cardFade} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="rounded-2xl border border-[#0A1F44]/[0.04] bg-[#F7F8FA] p-8 shadow-[0_1px_2px_rgba(10,31,68,0.03)] transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(10,31,68,0.05),0_8px_28px_rgba(10,31,68,0.04)]">
              <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${i % 2 === 0 ? "bg-[#D4882F]/[0.07] text-[#D4882F]" : "bg-[#2A7B3A]/[0.07] text-[#2A7B3A]"}`}>
                {item.icon}
              </div>
              <h3 className="text-[15.5px] font-bold tracking-[-0.01em] text-[#0A1F44]">{item.title}</h3>
              <p className="mt-3 text-[13.5px] leading-[1.7] text-[#0A1F44]/42">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
