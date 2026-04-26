"use client";

import HeroPremium from "./sections/HeroPremium";
import About from "./sections/About";
import Initiatives from "./components/Initiatives";
import GallerySection from "./components/GallerySection";
import VideosSection from "./components/VideosSection";
import ContactForm from "./components/ContactForm";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Premium Hero Section with Intro */}
      <HeroPremium />

      {/* About Section */}
      <About />

      {/* Initiatives / Pillars */}
      <section className="py-24 bg-white/30 backdrop-blur-sm">
        <Initiatives />
      </section>

      {/* Media Sections */}
      <VideosSection />
      <GallerySection />

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#0A1F44] mb-4">Get in Touch</h2>
            <p className="text-[#0A1F44]/50">We'd love to hear from you. Reach out for any inquiries.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-white/50 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Our Office</h3>
                <p className="text-[#0A1F44]/60 leading-relaxed">
                  1-118, Vasanth Nagar Colony,<br />
                  Nizampet, Hyderabad,<br />
                  Telangana 500090, India
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/50 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-[#0A1F44] mb-4">Contact Info</h3>
                <p className="text-[#0A1F44]/60">
                  Phone: +91 94945 02759<br />
                  Email: kammaicontrust@email.com
                </p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
