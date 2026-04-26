import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Register", href: "/register" },
  { label: "Login", href: "/my-profile-login" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#0A1F44]/5 bg-white/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/gallery/logo.png"
              alt="Logo"
              className="h-8 w-auto grayscale opacity-50"
            />
            <span className="text-[12px] font-bold uppercase tracking-widest text-[#0A1F44]/40">
              Kamma Icon Trust
            </span>
          </div>

          <nav className="flex gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-[#0A1F44]/40 transition-colors hover:text-[#D4882F]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-[#0A1F44]/5 pt-8 text-center">
          <p className="text-[13px] text-[#0A1F44]/30">
            &copy; {new Date().getFullYear()} Kamma Icon Trust. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
