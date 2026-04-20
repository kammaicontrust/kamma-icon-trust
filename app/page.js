"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardFade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } } };
import {
  BookOpen, Building2, HeartPulse, Mail, MapPin, Menu,
  Phone, ShieldCheck, Sparkles, Sprout, Users, X, ExternalLink,
} from "lucide-react";
import useNavbar from "./styles/useNavbar";
import ContactForm from "./components/ContactForm";
import GallerySection from "./components/GallerySection";
import Initiatives from "./components/Initiatives";
import VideosSection from "./components/VideosSection";

const navItems = [
  { label: "Home", href: "/#hero" },
  { label: "About", href: "/#about" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Support", href: "/#contact" },
];

const mobileNavItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Activities", href: "#activities" },
  { label: "Support", href: "#contact" },
  { label: "Register", href: "#register" },
];

const pillars = [
  { icon: <ShieldCheck size={24} />, title: "Cultural & Heritage Preservation", description: "We celebrate and protect our rich heritage through programs that honor Sanatana Dharma, Kamma history, and community values." },
  { icon: <BookOpen size={24} />, title: "Education Support & Scholarships", description: "From school kits to scholarships, we support students with academic needs and enable holistic development." },
  { icon: <HeartPulse size={24} />, title: "Healthcare & Medical Assistance", description: "We conduct free medical camps, provide emergency support, and help families access essential treatments." },
  { icon: <Users size={24} />, title: "Women Empowerment", description: "Skill development, financial independence, safety awareness, and employment support for women in our community." },
  { icon: <Sprout size={24} />, title: "Community Development", description: "Large-scale activities, welfare programs, environmental support, and rural upliftment initiatives carried out across multiple districts." },
];

const timelineItems = [
  { year: "2020", text: "Kamma Icon Trust was founded with the mission to serve society." },
  { year: "2021", text: "Started education support & food programs." },
  { year: "2022", text: "Expanded healthcare and women empowerment activities." },
  { year: "2023 - 2024", text: "Large-scale community development programs launched." },
];

export default function Home() {
  const { scrolled } = useNavbar();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((o) => !o);

  return (
    <main className="min-h-screen bg-[#F7F8FA] font-['Inter',system-ui,sans-serif] text-[#0A1F44] antialiased">

      {/* ──── NAVBAR ──── */}
      <nav className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/95 py-3.5 shadow-[0_1px_0_rgba(10,31,68,0.04),0_4px_16px_rgba(10,31,68,0.03)] backdrop-blur-xl" : "bg-transparent py-5"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link href="/#hero" className="flex items-center">
            <img src="/gallery/logo.png" alt="Kamma Icon Trust Logo" className="h-10 w-auto object-contain sm:h-11" />
          </Link>

          <div className="hidden items-center gap-10 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#0A1F44]/45 md:flex">
            {navItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.label} href={item.href} className="transition-colors duration-200 hover:text-[#D4882F]">{item.label}</Link>
              ) : (
                <a key={item.label} href={item.href} className="transition-colors duration-200 hover:text-[#D4882F]">{item.label}</a>
              )
            )}
          </div>

          <button type="button" aria-label="Open menu" onClick={toggleMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#0A1F44]/8 text-[#0A1F44]/45 transition-colors hover:text-[#D4882F] md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* ──── MOBILE MENU ──── */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#0A1F44]/10 backdrop-blur-sm md:hidden" onClick={toggleMenu}>
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="ml-auto flex h-full w-[80%] max-w-xs flex-col bg-white p-8 shadow-[-4px_0_24px_rgba(10,31,68,0.06)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <img src="/gallery/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
              <button onClick={toggleMenu} className="text-[#0A1F44]/30 transition-colors hover:text-[#D4882F]"><X size={22} /></button>
            </div>
            <div className="mt-12 flex flex-col gap-7">
              {mobileNavItems.map((item) => (
                <a key={item.label} href={item.href} onClick={toggleMenu} className="text-[15px] font-semibold tracking-wide text-[#0A1F44]/55 transition-colors hover:text-[#D4882F]">
                  {item.label}
                </a>
              ))}
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* ──── HERO ──── */}
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.97] via-white/90 to-[#F7F8FA]" />

        <motion.div initial="hidden" animate="show" variants={stagger} className="relative z-10 mx-auto max-w-4xl">
          <motion.p variants={cardFade} className="mb-6 text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4882F]/70">
            A CHARITABLE TRUST
          </motion.p>

          <div className="relative">
            <img
              src="/gallery/logo.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.06] sm:h-[600px] sm:w-[600px] lg:h-[700px] lg:w-[700px]"
            />
            <motion.h1 variants={cardFade} className="relative text-[3.2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-[#0A1F44] sm:text-7xl lg:text-[5.5rem]">
              KAMMA{" "}
              <span className="bg-gradient-to-r from-[#D4882F] to-[#B87025] bg-clip-text text-transparent">ICON</span>{" "}
              TRUST
            </motion.h1>
          </div>

          <motion.p variants={cardFade} className="mx-auto mt-8 max-w-lg text-[17px] leading-[1.75] text-[#0A1F44]/45">
            Empowering communities through education, healthcare, women empowerment, and sustainable development across India.
          </motion.p>

          <motion.div variants={cardFade} className="mt-12 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
            <Link href="/register">
              <button className="min-w-[172px] rounded-full bg-gradient-to-b from-[#D4882F] to-[#BE7A28] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_2px_8px_rgba(212,136,47,0.2),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(212,136,47,0.25)]">
                Register
              </button>
            </Link>
            <Link href="/profiles">
              <button className="min-w-[172px] rounded-full border border-[#0A1F44]/10 px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-[#0A1F44]/55 transition-all duration-200 hover:border-[#D4882F]/30 hover:text-[#D4882F]">
                View Profiles
              </button>
            </Link>
            <button onClick={() => document.getElementById("donate").scrollIntoView({ behavior: "smooth" })} className="min-w-[172px] rounded-full bg-gradient-to-b from-[#2A7B3A] to-[#236B31] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_2px_8px_rgba(42,123,58,0.18),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(42,123,58,0.22)]">
              DONATE NOW
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── ABOUT ──── */}
      <motion.section id="about" className="px-6 py-32 lg:px-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Who We Are</p>
            <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">About Kamma Icon Trust</h2>
            <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          </div>

          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div className="space-y-7">
              <p className="text-[16.5px] leading-[1.75] text-[#0A1F44]/50">
                <span className="font-semibold text-[#0A1F44]">Kamma Icon Trust</span>{" "}
                is a registered charitable organization (Reg No: <b className="text-[#0A1F44]">159/2025</b>) dedicated to community welfare, cultural preservation, and social development. Our mission is to blend tradition with modern progress {"\u2014"} ensuring that our cultural roots remain strong while uplifting the needy with care and support.
              </p>

              <div className="rounded-2xl border border-[#0A1F44]/[0.04] bg-white p-8 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_6px_24px_rgba(10,31,68,0.03)]">
                <h3 className="text-[1.15rem] font-bold tracking-[-0.01em] text-[#0A1F44]">Our Vision: Be a Partner in Progress</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-[#0A1F44]/42">
                  We believe that true development is a collective journey. Through our{" "}
                  <span className="font-semibold text-[#D4882F]">Maharaja Patron Initiative</span>, we invite community leaders and philanthropists to join us as permanent members and help drive our mission forward.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[#0A1F44]/[0.04] bg-gradient-to-br from-[#D4882F]/[0.03] via-white to-[#2A7B3A]/[0.02] p-10 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_8px_32px_rgba(10,31,68,0.04)]">
              <div className="flex h-full min-h-[380px] flex-col justify-between">
                <Sparkles className="text-[#D4882F]/50" size={34} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#2A7B3A]/50">Community Welfare</p>
                  <p className="mt-4 text-[2.3rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#0A1F44] sm:text-[2.8rem]">Tradition with modern progress.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[13px] text-[#0A1F44]/50">
                  <div className="rounded-xl border border-[#0A1F44]/[0.04] bg-white p-5 shadow-[0_1px_4px_rgba(10,31,68,0.03)]">
                    <Building2 className="mb-3 text-[#D4882F]/60" size={20} />Cultural roots
                  </div>
                  <div className="rounded-xl border border-[#0A1F44]/[0.04] bg-white p-5 shadow-[0_1px_4px_rgba(10,31,68,0.03)]">
                    <HeartPulse className="mb-3 text-[#2A7B3A]/60" size={20} />Care and support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ──── CORE PILLARS ──── */}
      <section className="bg-white px-6 py-32 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">What We Stand For</p>
            <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">Our Core Pillars</h2>
            <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          </div>

          <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
            {pillars.map((pillar) =>
            (
              <motion.div key={pillar.title} variants={cardFade} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="rounded-2xl border border-[#0A1F44]/[0.04] bg-[#F7F8FA] p-8 shadow-[0_1px_2px_rgba(10,31,68,0.03)] transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(10,31,68,0.05),0_8px_28px_rgba(10,31,68,0.04)]">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4882F]/[0.07] text-[#D4882F]">{pillar.icon}</div>
                <h4 className="text-[15.5px] font-bold tracking-[-0.01em] text-[#0A1F44]">{pillar.title}</h4>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-[#0A1F44]/42">{pillar.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Initiatives />
      <VideosSection />
      <GallerySection />

      {/* ──── TIMELINE ──── */}
      <section id="timeline" className="bg-white px-6 py-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Our Story</p>
            <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">OUR JOURNEY</h2>
            <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          </div>

          <div className="relative space-y-10 pl-10">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-[#D4882F]/35 via-[#D4882F]/15 to-transparent" />
            {timelineItems.map((item, i) => (
              <motion.div key={item.year} className="relative" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <span className="absolute -left-10 top-2 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#D4882F] bg-white" />
                <div className="rounded-2xl border border-[#0A1F44]/[0.04] bg-[#F7F8FA] p-7 shadow-[0_1px_2px_rgba(10,31,68,0.03)]">
                  <h3 className="text-[1.4rem] font-extrabold tracking-[-0.01em] text-[#0A1F44]">{item.year}</h3>
                  <p className="mt-2 text-[15px] leading-[1.7] text-[#0A1F44]/42">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CONTACT ──── */}
      <motion.section id="contact" className="px-6 py-32 lg:px-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={fadeUp}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Get in Touch</p>
            <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">Contact Us</h2>
            <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          </div>

          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-[16.5px] leading-[1.7] text-[#0A1F44]/45">Reach out to us for support, partnerships, volunteering, or donations.</p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#0A1F44]/[0.04] bg-white p-6 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_6px_24px_rgba(10,31,68,0.03)]">
                  <div className="flex gap-4">
                    <MapPin className="mt-0.5 shrink-0 text-[#D4882F]/60" size={20} />
                    <div>
                      <span className="text-[14px] font-semibold text-[#0A1F44]">Address</span>
                      <p className="mt-1.5 text-[14px] leading-[1.7] text-[#0A1F44]/42">1-118, Vasanth Nagar Colony,<br />Nizampet, Hyderabad,<br />Telangana 500090, India</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#0A1F44]/[0.04] bg-white p-6 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_6px_24px_rgba(10,31,68,0.03)]">
                    <div className="flex gap-4">
                      <Phone className="mt-0.5 shrink-0 text-[#D4882F]/60" size={20} />
                      <div>
                        <span className="text-[14px] font-semibold text-[#0A1F44]">Phone</span>
                        <p className="mt-1.5 text-[14px] text-[#0A1F44]/42">+91 94945 02759</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#0A1F44]/[0.04] bg-white p-6 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_6px_24px_rgba(10,31,68,0.03)]">
                    <div className="flex gap-4">
                      <Mail className="mt-0.5 shrink-0 text-[#2A7B3A]/60" size={20} />
                      <div>
                        <span className="text-[14px] font-semibold text-[#0A1F44]">Email</span>
                        <p className="mt-1.5 text-[14px] text-[#0A1F44]/42">kammaicontrust@email.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#0A1F44]/[0.04] shadow-[0_1px_3px_rgba(10,31,68,0.04),0_4px_16px_rgba(10,31,68,0.03)]">
                <iframe src="https://www.google.com/maps?q=1-118%20Vasanth%20Nagar%20Colony%20Nizampet%20Hyderabad%20500090&output=embed" loading="lazy" className="h-60 w-full border-0"></iframe>
              </div>

              <a href="https://www.google.com/maps?q=1-118+Vasanth+Nagar+Colony+Nizampet+Hyderabad+500090" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#D4882F] to-[#BE7A28] px-6 py-3 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(212,136,47,0.18)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(212,136,47,0.22)]">
                <MapPin size={15} />Open in Google Maps<ExternalLink size={13} />
              </a>
            </div>

            <ContactForm />
          </div>
        </div>
      </motion.section>

      {/* ──── DONATE ──── */}
      <motion.section id="donate" className="bg-white px-6 py-32 lg:px-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4882F]/60">Support Our Mission</p>
            <h2 className="mt-3 text-[2.1rem] font-extrabold tracking-[-0.015em] text-[#0A1F44] sm:text-[2.8rem]">Donate</h2>
            <div className="mx-auto mt-6 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#D4882F] to-[#D4882F]/40" />
          </div>

          <div className="rounded-3xl border border-[#0A1F44]/[0.04] bg-[#F7F8FA] p-12 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_8px_32px_rgba(10,31,68,0.04)]">
            <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(10,31,68,0.04),0_4px_16px_rgba(10,31,68,0.03)]">
              <img src="/gallery/donation-qr.png" alt="Donation QR" className="w-56 rounded-xl sm:w-64" />
            </div>

            <p className="mt-8 text-[15px] text-[#0A1F44]/40">After payment, send screenshot on WhatsApp</p>
            <p className="mt-2 text-[17px] font-bold text-[#0A1F44]">+91 94945 02759</p>

            <a href="https://wa.me/919494502759?text=Hello%20I%20have%20donated.%20Here%20is%20the%20payment%20screenshot." target="_blank" className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#2A7B3A] to-[#236B31] px-8 py-3.5 text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(42,123,58,0.16)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(42,123,58,0.2)]">
              Send Screenshot on WhatsApp
            </a>
          </div>
        </div>
      </motion.section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-[#0A1F44]/[0.04] bg-white px-6 py-14 text-center">
        <p className="text-[13px] text-[#0A1F44]/35">&copy; 2024 Kamma Icon Trust. All rights reserved.</p>
        <p className="mt-2 text-[12px] text-[#0A1F44]/25">Designed with care for community service.</p>
      </footer>
    </main>
  );
}
