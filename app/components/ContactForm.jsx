"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sendEmail = async (e) => {
    e.preventDefault(); // 🔴 Prevent refresh

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

  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-3xl mx-auto px-6">

        <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
          Contact Us
        </h2>

        <form onSubmit={sendEmail} className="space-y-6">

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full p-4 rounded-lg bg-black border border-yellow-500 focus:outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full p-4 rounded-lg bg-black border border-yellow-500 focus:outline-none"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            required
            className="w-full p-4 rounded-lg bg-black border border-yellow-500 focus:outline-none"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows="4"
            className="w-full p-4 rounded-lg bg-black border border-yellow-500 focus:outline-none"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-lg transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <p className="text-green-400 text-center">
              ✅ Message sent successfully!
            </p>
          )}

          {status === "error" && (
            <p className="text-red-400 text-center">
              ❌ Something went wrong. Check console.
            </p>
          )}

        </form>
      </div>
    </section>
  );
}
