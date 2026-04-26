"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Register", href: "/register" },
  { label: "Login", href: "/my-profile-login" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((o) => !o);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Sticky Navbar ── */}
      <nav
        className={`fixed left-0 top-0 z-[100] w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/20 bg-white/70 py-3 shadow-sm backdrop-blur-md"
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3" onClick={closeMenu}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img
                src="/gallery/logo.png"
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#0A1F44]">
              Kamma Icon Trust
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-semibold uppercase tracking-wider text-[#0A1F44]/70 transition-colors hover:text-[#D4882F]"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/register">
              <button className="rounded-full bg-[#0A1F44] px-6 py-2.5 text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#D4882F] hover:shadow-lg hover:shadow-[#D4882F]/20">
                Register
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMenu}
            className="relative z-[110] p-2 text-[#0A1F44] md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[99] flex flex-col bg-white px-8 pt-24 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-xl font-bold tracking-tight text-[#0A1F44]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-8">
                <Link href="/register" onClick={closeMenu}>
                  <button className="w-full rounded-full bg-[#0A1F44] py-4 text-sm font-bold uppercase tracking-widest text-white">
                    Register Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
