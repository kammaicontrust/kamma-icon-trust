"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
//import useCursor from "./styles/useCursor";
import "./styles/animations.css";
import Divider from "./styles/Divider";
import ClientOnly from "./styles/ClientOnly";
import useScrollAnimations from "./styles/scroll-animations";
import useScrollSpy from "./styles/scrollspy";
import useParallax from "./styles/useParallax";
import useNavbar from "./styles/useNavbar";
import { GALLERY_ITEMS } from "./data/gallery";
import ContactForm from "./components/ContactForm";
import GallerySection from "./components/GallerySection";
import VideosSection from "./components/VideosSection";
import Initiatives from "./components/Initiatives";
import Link from "next/link";




export default function Home() {
  // Hooks
  //useCursor()
  useParallax();
  useScrollSpy();
  useScrollAnimations();
  const { scrolled } = useNavbar();

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);




  return (
    <main className="min-h-screen bg-black text-white relative">

 {/* CUSTOM CURSOR - MUST BE THE FIRST ELEMENT */}
{/* <div id="cursor-dot"></div> */}
{/* <div id="cursor-ring"></div> */}




 <ClientOnly>
  {/* animations / particles / cursor */}
</ClientOnly>


  



      {/* NAVBAR */}
      


<nav
  className={`
    w-full flex justify-between items-center px-10 fixed top-0 left-0 z-50 transition-all duration-300
    ${scrolled ? "bg-black/40 backdrop-blur-xl py-4 shadow-lg" : "bg-transparent py-6"}
  `}
>






  {/* LOGO */}
  <div className="flex items-center">
    <img 
      src="/gallery/logo.png"
      alt="Kamma Icon Trust Logo"
      className="h-12 w-auto object-contain"
    />
  </div>


  {/* MENU */}

<div className="hidden md:flex gap-8 text-gray-300 font-medium">
  <Link href="/#hero" className="nav-link">Home</Link>
  <Link href="/#about" className="nav-link">About</Link>
  <a href="#initiatives" className="nav-link">
  Initiatives
</a>

  <Link href="/#gallery" className="nav-link">Gallery</Link>
  <Link href="/#contact" className="nav-link">Support</Link>
</div>



  {/* MOBILE MENU BUTTON */}
  <button
  className="md:hidden text-yellow-500 text-3xl"
  onClick={toggleMenu}
>
  ☰
</button>


</nav>

{/* MOBILE MENU OVERLAY */}
<div
  id="mobileMenu"
  className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center gap-10 text-2xl 
  ${menuOpen ? "flex" : "hidden"}`}
>
  <a href="#hero" onClick={toggleMenu} className="nav-link text-yellow-500">Home</a>
  <a href="#about" onClick={toggleMenu} className="nav-link text-yellow-500">About</a>
  <a href="#initiatives" onClick={toggleMenu} className="nav-link text-yellow-500">Initiatives</a>
  <a href="#activities" onClick={toggleMenu} className="nav-link text-yellow-500">Activities</a>
  <a href="#contact" onClick={toggleMenu} className="nav-link text-yellow-500">Support</a>
</div>



  {/* Close Button */}
  <button
  id="closeMenu"
  onClick={toggleMenu}
  className="absolute top-6 right-6 text-yellow-500 text-4xl"
>
  ✕
</button>




{/* HERO SECTION */}
<ClientOnly>
  <section
  id="hero"
  className="relative h-[100vh] w-full text-center flex flex-col justify-center items-center 
  fade-up bg-cover bg-center bg-no-repeat overflow-hidden parallax"
  data-speed="0.35"
  style={{ backgroundImage: "url('/hero-bg.jpg')" }}
>

 


    {/* GOLD PARTICLES */}
   <img src="/particles.png" className="absolute top-0 left-0 w-full opacity-40 parallax" data-speed="0.2" />

   <img src="/light-glow.png" className="absolute top-0 right-0 w-full opacity-30 parallax" data-speed="0.6" />


  
    {/* CONTENT */}
    <div className="relative z-10 mt-10">
      <p className="text-yellow-500 tracking-[0.35em] text-sm fade-up delay-1">
        A CHARITABLE TRUST
      </p>

      <h1 className="text-6xl font-bold mb-6 fade-up delay-2">
        KAMMA <span className="text-yellow-500">ICON</span> TRUST
      </h1>

      <p className="text-gray-300 max-w-2xl mx-auto fade-up delay-3 text-lg leading-relaxed">
        Empowering communities through education, healthcare, women empowerment,
        and sustainable development across India.
      </p>

      <div className="mt-10 flex justify-center gap-6 fade-up delay-4">




  
  <button className="btn-gold border border-yellow-600 px-8 py-3 rounded-md hover:bg-yellow-600 hover:text-black transition">
    EXPLORE MORE
  </button>

  <button
  onClick={() => document.getElementById("donate").scrollIntoView({ behavior: "smooth" })}
  className="btn-gold border border-yellow-600 px-8 py-3 rounded-md hover:bg-yellow-600 hover:text-black transition">
  DONATE NOW
</button>



      </div>
    </div>

  </section>
</ClientOnly>

{/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider />





     {/* ABOUT SECTION */}
<section id="about" className="mt-32 fade-up about-section max-w-4xl mx-auto px-6">


  <div className="about-content">

    {/* TITLE */}
    <h2 className="text-3xl font-bold mb-6 text-yellow-500 text-center">
      ABOUT KAMMA ICON TRUST
    </h2>

    {/* INTRO */}
    <p className="text-gray-300 leading-relaxed mb-6">
      <span className="text-yellow-400 font-semibold">Kamma Icon Trust</span> 
      is a registered charitable organization (Reg No: <b>159/2025</b>) dedicated to  
      community welfare, cultural preservation, and social development.  
      Our mission is to blend tradition with modern progress — ensuring that our  
      cultural roots remain strong while uplifting the needy with care and support.
    </p>

    {/* OUR VISION */}
    <h3 className="text-2xl font-semibold text-yellow-400 mt-10 mb-3">
      Our Vision: Be a Partner in Progress
    </h3>
    <p className="text-gray-400 leading-relaxed mb-6">
      We believe that true development is a collective journey.  
      Through our <span className="text-yellow-300 font-semibold">Maharaja Patron Initiative</span>,  
      we invite community leaders and philanthropists to join us as permanent members  
      and help drive our mission forward.
    </p>

    {/* CORE PILLARS */}
    <h3 className="text-2xl font-semibold text-yellow-400 mt-10 mb-4">
      Our Core Pillars
    </h3>

    <ul className="text-gray-400 leading-relaxed space-y-3">

      <li>
        <span className="text-yellow-400 font-medium">1. Cultural & Heritage Preservation:</span>
        <br />
        We celebrate and protect our rich heritage through programs that honor  
        Sanatana Dharma, Kamma history, and community values.
      </li>

      <li>
        <span className="text-yellow-400 font-medium">2. Education Support & Scholarships:</span>
        <br />
        From school kits to scholarships, we support students with academic needs  
        and enable holistic development.
      </li>

      <li>
        <span className="text-yellow-400 font-medium">3. Healthcare & Medical Assistance:</span>
        <br />
        We conduct free medical camps, provide emergency support, and help  
        families access essential treatments.
      </li>

      <li>
        <span className="text-yellow-400 font-medium">4. Women Empowerment:</span>
        <br />
        Skill development, financial independence, safety awareness, and  
        employment support for women in our community.
      </li>

      <li>
        <span className="text-yellow-400 font-medium">5. Community Development:</span>
        <br />
        Large-scale activities, welfare programs, environmental support, and  
        rural upliftment initiatives carried out across multiple districts.
      </li>

    </ul>

  </div>
</section>


      {/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider />




{/* INITIATIVES CARDS */}

<Initiatives />

{/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider />



<VideosSection />

{/* SMOOTH DIVIDER (Videos → Gallery) */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20"></div>

<Divider />




<GallerySection />





      {/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider />


      {/* TIMELINE SECTION */}
      <section className="mt-32 fade-up max-w-4xl mx-auto px-6" id="timeline">
        <h2 className="text-3xl font-bold mb-10 text-center text-yellow-500">OUR JOURNEY</h2>

        <div className="border-l border-yellow-600 ml-6 space-y-10">

          <div className="relative pl-6 fade-up delay-1">
            <span className="absolute -left-3 top-1 w-4 h-4 bg-yellow-500 rounded-full shadow-yellow-400 shadow-md"></span>
            <h3 className="text-xl font-semibold">2020</h3>
            <p className="text-gray-400">Kamma Icon Trust was founded with the mission to serve society.</p>
          </div>

          <div className="relative pl-6 fade-up delay-2">
            <span className="absolute -left-3 top-1 w-4 h-4 bg-yellow-500 rounded-full shadow-yellow-400 shadow-md"></span>
            <h3 className="text-xl font-semibold">2021</h3>
            <p className="text-gray-400">Started education support & food programs.</p>
          </div>

          <div className="relative pl-6 fade-up delay-3">
            <span className="absolute -left-3 top-1 w-4 h-4 bg-yellow-500 rounded-full shadow-yellow-400 shadow-md"></span>
            <h3 className="text-xl font-semibold">2022</h3>
            <p className="text-gray-400">Expanded healthcare and women empowerment activities.</p>
          </div>

          <div className="relative pl-6 fade-up delay-4">
            <span className="absolute -left-3 top-1 w-4 h-4 bg-yellow-500 rounded-full shadow-yellow-400 shadow-md"></span>
            <h3 className="text-xl font-semibold">2023 - 2024</h3>
            <p className="text-gray-400">Large-scale community development programs launched.</p>
          </div>

        </div>
      </section>

     {/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider /> 

 <section id="contact" className="contact-section">
  <div className="contact-grid">

    {/* LEFT SIDE */}
    <div className="contact-left">
      <p className="contact-intro">
        Reach out to us for support, partnerships, volunteering, or donations.
      </p>

      <div className="contact-item">
        <span>📍 Address</span>
        <p>
          1-118, Vasanth Nagar Colony,<br />
          Nizampet, Hyderabad,<br />
          Telangana 500090, India
        </p>
      </div>

      <div className="contact-item">
        <span>📞 Phone</span>
        <p>+91 94945 02759</p>
      </div>

      <div className="contact-item">
        <span>✉️ Email</span>
        <p>kammaicontrust@email.com</p>
      </div>

      {/* MAP CARD */}
      <div className="map-card">
        <iframe
          src="https://www.google.com/maps?q=1-118%20Vasanth%20Nagar%20Colony%20Nizampet%20Hyderabad%20500090&output=embed"
          loading="lazy"
        ></iframe>

        <a
          href="https://www.google.com/maps?q=1-118+Vasanth+Nagar+Colony+Nizampet+Hyderabad+500090"
          target="_blank"
          className="map-btn"
        >
          📍 Open in Google Maps
        </a>
      </div>
    </div>

    {/* RIGHT SIDE – FORM */}
    <ContactForm />

  </div>
</section>

{/* SMOOTH DIVIDER */}
<div className="w-full h-20 bg-gradient-to-b from-black/0 to-black relative z-20 -mt-5"></div>

<Divider />

<section id="donate" className="mt-32 text-center">

  {/* QR */}
  <img src="/gallery/donation-qr.png" className="mx-auto w-72 rounded-xl" />

  <p className="text-gray-400 mt-4">
    After payment, send screenshot on WhatsApp
  </p>

  <p className="text-yellow-400 font-bold mt-2">
    📞 +91 94945 02759
  </p>

  <a
    href="https://wa.me/919494502759?text=Hello%20I%20have%20donated.%20Here%20is%20the%20payment%20screenshot."
    target="_blank"
    className="inline-block mt-4 bg-green-500 px-6 py-3 rounded-full text-white font-semibold"
  >
    📤 Send Screenshot on WhatsApp
  </a>

</section>





     <footer className="footer-glass py-10 text-center text-gray-400 mt-32">

  {/* Floating dots */}
  <span className="footer-dot" style={{ top: "20px", left: "10%" }}></span>
  <span className="footer-dot" style={{ top: "40px", left: "70%" }}></span>
  <span className="footer-dot" style={{ top: "80px", left: "40%" }}></span>

  <p className="text-sm">© 2024 Kamma Icon Trust. All rights reserved.</p>
  <p className="text-xs mt-1 text-yellow-500">
    Designed with ❤️ for community service.
  </p>
</footer>
    </main>
  );
}
