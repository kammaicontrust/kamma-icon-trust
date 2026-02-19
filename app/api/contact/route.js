"use client";

import { useRef } from "react";
import emailjs from "@emailjs/browser";

export default function ContactForm() {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          alert("Message Sent Successfully ✅");
          form.current.reset();
        },
        (error) => {
          console.error(error);
          alert("Failed to send message ❌");
        }
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send Message</button>
    </form>
  );
}
