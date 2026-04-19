"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE,
        e.target,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      e.target.reset();
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-xl border border-[#0A1F44]/[0.06] bg-[#F7F8FA] px-5 py-4 text-[15px] text-[#0A1F44] placeholder:text-[#0A1F44]/25 outline-none transition-all duration-200 focus:border-[#D4882F]/35 focus:shadow-[0_0_0_3px_rgba(212,136,47,0.06)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-3xl border border-[#0A1F44]/[0.04] bg-white p-8 shadow-[0_1px_3px_rgba(10,31,68,0.04),0_8px_32px_rgba(10,31,68,0.04)] sm:p-10"
    >
      <h2 className="mb-8 text-[1.35rem] font-bold tracking-[-0.01em] text-[#0A1F44]">Send us a message</h2>

      <form onSubmit={sendEmail} className="space-y-4">
        <input type="text" name="name" placeholder="Your Name" required className={inputClass} />
        <input type="email" name="email" placeholder="Your Email" required className={inputClass} />
        <input type="text" name="phone" placeholder="Phone Number" required className={inputClass} />
        <textarea name="message" placeholder="Your Message" required rows="4" className={`${inputClass} resize-none`}></textarea>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="w-full rounded-full bg-gradient-to-b from-[#D4882F] to-[#BE7A28] py-4 text-[13px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_2px_8px_rgba(212,136,47,0.18)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(212,136,47,0.22)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Sending..." : "Send Message"}
        </motion.button>

        {status === "success" && <p className="text-center text-[14px] font-medium text-[#2A7B3A]">Message sent successfully!</p>}
        {status === "error" && <p className="text-center text-[14px] font-medium text-red-500">Something went wrong. Please try again.</p>}
      </form>
    </motion.div>
  );
}
