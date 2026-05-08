"use client";

import { useSuperAdminAuth } from "@/app/context/SuperAdminAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ShieldAlert,
  Menu,
  X,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/super-admin" },
  { name: "Registrations", icon: Users, href: "/super-admin/registrations" },
  { name: "Tokens", icon: Ticket, href: "/super-admin/tokens" },
];

export default function SuperAdminLayout({ children }) {
  const { adminUser, loading, logout } = useSuperAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !adminUser && pathname !== "/super-admin/login") {
      router.push("/super-admin/login");
    }
  }, [adminUser, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F44] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.5em]">Authenticating</p>
        </div>
      </div>
    );
  }

  // If we're on the login page, just render the children without the sidebar/header
  if (pathname === "/super-admin/login") {
    return <>{children}</>;
  }

  if (!adminUser) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-10 px-8">
      {/* Brand */}
      <div className="flex items-center gap-4 px-2 mb-16">
        <div className="w-12 h-12 bg-[#FFD700] rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-[#FFD700]/20">
          <ShieldAlert className="w-6 h-6 text-[#0A1F44]" />
        </div>
        <div>
          <h1 className="text-white font-black tracking-tight text-xl leading-none">SUPER</h1>
          <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest mt-1">OWNER PANEL</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all group ${
                isActive 
                  ? "bg-gradient-to-tr from-[#FFD700] to-[#E5C100] text-[#0A1F44] shadow-xl shadow-[#FFD700]/10" 
                  : "text-white/30 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#0A1F44]" : "text-inherit"}`} />
              <span className="font-black text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t border-white/5">
        <div className="bg-white/5 rounded-[2rem] p-5 mb-8 border border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] font-black">
              {adminUser.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-xs truncate tracking-tight">{adminUser.displayName || "Owner"}</p>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest truncate">{adminUser.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[1.2rem] text-rose-400 bg-rose-400/5 hover:bg-rose-400/10 transition-all font-black text-xs tracking-[0.1em]"
          >
            <LogOut className="w-4 h-4" />
            SECURE LOGOUT
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden xl:block w-80 bg-[#0A1F44] fixed inset-y-0 left-0 z-50 shadow-[20px_0_60px_-20px_rgba(0,0,0,0.1)]">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 xl:pl-80 flex flex-col">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 xl:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6 xl:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 bg-[#0A1F44] rounded-2xl text-white shadow-xl shadow-[#0A1F44]/20"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-[#FFD700]" />
               <h2 className="font-black text-[#0A1F44] tracking-tight uppercase text-sm">Super Admin</h2>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Zap className="w-5 h-5 text-[#FFD700]" />
            </div>
            <h2 className="text-xl font-black text-[#0A1F44] tracking-tight">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-[#0A1F44]/30 uppercase tracking-[0.2em] mb-1">System Operator</p>
              <p className="text-sm font-black text-[#0A1F44] tracking-tight uppercase">{adminUser.displayName}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFD700] via-[#E5C100] to-[#FFD700] p-[3px] shadow-2xl shadow-[#FFD700]/20">
              <div className="w-full h-full rounded-[0.8rem] overflow-hidden">
                <img src={adminUser.photoURL} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 xl:p-12 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] xl:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#0A1F44] z-[70] xl:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-3 text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
