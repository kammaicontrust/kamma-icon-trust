"use client";

import { useAdminAuth } from "../context/AdminAuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  PieChart, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/admin" },
  { name: "Registrations", icon: Users, href: "/admin/registrations" },
  { name: "Tokens", icon: Ticket, href: "/admin/tokens" },
  { name: "Analytics", icon: PieChart, href: "/admin/analytics" },
];

export default function AdminLayout({ children }) {
  const { adminUser, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !adminUser && pathname !== "/admin-login") {
      router.push("/admin-login");
    }
  }, [adminUser, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F44] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD700]/10">
          <ShieldCheck className="w-6 h-6 text-[#0A1F44]" />
        </div>
        <div>
          <h1 className="text-white font-black tracking-tight text-lg leading-none">KIT ADMIN</h1>
          <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? "bg-[#FFD700] text-[#0A1F44] shadow-lg shadow-[#FFD700]/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#0A1F44]" : "text-inherit"}`} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <UserIcon className="w-5 h-5 text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-xs truncate uppercase tracking-wider">{adminUser.email.split('@')[0]}</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">{adminUser.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all font-bold text-sm tracking-tight"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-[#0A1F44] fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-[#0A1F44] hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-black text-[#0A1F44] tracking-tight">KIT ADMIN</h2>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-xl font-black text-[#0A1F44] tracking-tight">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#0A1F44]/40 uppercase tracking-widest">Logged in as</p>
              <p className="text-sm font-black text-[#0A1F44] tracking-tight uppercase">{adminUser.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#E5C100] p-0.5 shadow-lg shadow-[#FFD700]/10">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[#0A1F44] text-xs">
                {adminUser.email[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 flex-1">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0A1F44] z-[70] lg:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white"
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
