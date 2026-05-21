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
  X,
  Bell,
  Search,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/admin" },
  { name: "Registrations", icon: Users, href: "/admin/registrations" },
  { name: "Tokens", icon: Ticket, href: "/admin/tokens" },
  { name: "Analytics", icon: PieChart, href: "/admin/analytics" },
];

function SidebarContent({ adminUser, pathname, logout, setIsMobileMenuOpen }) {
  return (
    <div className="flex flex-col h-full py-6 px-5">
      {/* Brand */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#FFD700] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFD700]/10">
            <ShieldCheck className="w-6 h-6 text-[#0A1F44]" />
          </div>
          <div>
            <h1 className="text-white font-black tracking-tight text-lg leading-none">KIT ADMIN</h1>
            <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-[0.28em] mt-1">Control Center</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-white/90">Review registrations, monitor activity, and keep approvals moving.</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-3 px-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">Navigation</p>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? "bg-[#FFD700] text-[#0A1F44] shadow-lg shadow-[#FFD700]/10" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#0A1F44]" : "text-inherit"}`} />
              <span className="font-bold text-sm tracking-tight flex-1">{item.name}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-[#0A1F44]" : "text-white/20 group-hover:translate-x-0.5"}`} />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <UserIcon className="w-5 h-5 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate uppercase tracking-wider">{adminUser.email.split('@')[0]}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">{adminUser.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-rose-300 bg-rose-400/10 hover:bg-rose-400/15 transition-all font-bold text-sm tracking-tight"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const activeItem = navItems.find((item) => item.href === pathname);
  const pageTitle = activeItem?.name || "Dashboard";
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-[#071935] fixed inset-y-0 left-0 z-50 border-r border-white/5">
        <SidebarContent adminUser={adminUser} pathname={pathname} logout={logout} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur border-b border-slate-200/70 px-5 py-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-4 lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 rounded-xl text-[#0A1F44] hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  <span>Admin</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{pageTitle}</span>
                </div>
                <h2 className="mt-2 text-2xl font-black text-[#0A1F44] tracking-tight">
                  {pageTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">{todayLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400 min-w-[240px]">
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Search pages and records</span>
              </div>
              <button className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#0A1F44]/40 uppercase tracking-widest">Logged in as</p>
                  <p className="text-sm font-black text-[#0A1F44] tracking-tight">{adminUser.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#E5C100] p-0.5 shadow-lg shadow-[#FFD700]/10">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[#0A1F44] text-xs">
                    {adminUser.email[0].toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-5 lg:p-8 flex-1">
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
              className="fixed inset-y-0 left-0 w-72 bg-[#071935] z-[70] lg:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <SidebarContent adminUser={adminUser} pathname={pathname} logout={logout} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
