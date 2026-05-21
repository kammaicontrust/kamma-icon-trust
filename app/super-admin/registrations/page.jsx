"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { 
  Users, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  EyeOff,
  History,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";
import { useSuperAdminAuth } from "@/app/context/SuperAdminAuthContext";
import { logAdminAction } from "@/app/lib/auditLogger";

const ITEMS_PER_PAGE = 10;

export default function RegistrationsList() {
  const { adminUser } = useSuperAdminAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All"); // 'All', 'Approved', 'Pending', 'Hidden'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Button Loading states
  const [loadingAction, setLoadingAction] = useState({}); // { [docId_actionType]: boolean }

  useEffect(() => {
    setMounted(true);
    // Realtime sync of all registrations sorted by submittedAt
    const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          // Filter out raw tokens and soft-deleted profiles
          .filter(d => !d.isTokenOnly && d.deleted !== true);
        setData(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore subscription error:", error);
        toast.error("Failed to sync registration data in real-time.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  // Handle Search & Filter logic
  const filteredData = useMemo(() => {
    return data.filter(p => {
      const name = p.name || "";
      const mobile = p.mobile || "";
      const token = p.token || "";
      const village = p.profile?.village || p.profile?.placeOfBirth || "";
      const gothram = p.profile?.gothram || p.profile?.gotra || "";

      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mobile.includes(searchTerm) ||
        token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gothram.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = filterGender === "All" || p.profile?.gender === filterGender;
      
      let matchesStatus = true;
      const isApproved = p.approved === true && p.profileCompleted === true && p.visible === true;
      
      if (filterStatus === "Approved") {
        matchesStatus = isApproved;
      } else if (filterStatus === "Pending") {
        // Pending approval if it is not approved or incomplete
        matchesStatus = !isApproved && p.visible !== false;
      } else if (filterStatus === "Hidden") {
        matchesStatus = p.visible === false;
      }

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [data, searchTerm, filterGender, filterStatus]);

  // Statistics counters
  const stats = useMemo(() => {
    let total = data.length;
    let approved = 0;
    let pending = 0;
    let hidden = 0;

    data.forEach(p => {
      const isApproved = p.approved === true && p.profileCompleted === true && p.visible === true;
      if (isApproved) {
        approved++;
      } else if (p.visible === false) {
        hidden++;
      } else {
        pending++;
      }
    });

    return { total, approved, pending, hidden };
  }, [data]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGender, filterStatus]);

  const startAction = (id, action) => {
    setLoadingAction(prev => ({ ...prev, [`${id}_${action}`]: true }));
  };

  const endAction = (id, action) => {
    setLoadingAction(prev => ({ ...prev, [`${id}_${action}`]: false }));
  };

  const isActionLoading = (id, action) => {
    return !!loadingAction[`${id}_${action}`];
  };

  // Actions
  const handleApprove = async (p) => {
    const actionKey = "approve";
    if (isActionLoading(p.id, actionKey)) return;
    
    startAction(p.id, actionKey);
    try {
      const docRef = doc(db, "registrations", p.id);
      await updateDoc(docRef, {
        approved: true,
        profileCompleted: true,
        visible: true,
        approvedAt: new Date(),
        approvedBy: adminUser?.email || "system"
      });
      
      await logAdminAction(
        adminUser?.email,
        "approve",
        p.id,
        p.name,
        { details: "Approved, completed, and set to visible" }
      );
      
      toast.success(`Profile of "${p.name}" has been approved and is now live.`);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(`Failed to approve profile: ${error.message}`);
    } finally {
      endAction(p.id, actionKey);
    }
  };

  const handleReject = async (p) => {
    const actionKey = "reject";
    if (isActionLoading(p.id, actionKey)) return;
    
    startAction(p.id, actionKey);
    try {
      const docRef = doc(db, "registrations", p.id);
      await updateDoc(docRef, {
        approved: false,
        profileCompleted: false,
        visible: false,
        rejectedAt: new Date(),
        rejectedBy: adminUser?.email || "system"
      });

      await logAdminAction(
        adminUser?.email,
        "reject",
        p.id,
        p.name,
        { details: "Rejected/unapproved and hidden from public search" }
      );
      
      toast.success(`Profile of "${p.name}" has been rejected/unapproved.`);
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(`Failed to unapprove profile: ${error.message}`);
    } finally {
      endAction(p.id, actionKey);
    }
  };

  const handleHide = async (p) => {
    const actionKey = "hide";
    if (isActionLoading(p.id, actionKey)) return;
    
    startAction(p.id, actionKey);
    try {
      const docRef = doc(db, "registrations", p.id);
      await updateDoc(docRef, {
        visible: false,
        hiddenAt: new Date(),
        hiddenBy: adminUser?.email || "system"
      });

      await logAdminAction(
        adminUser?.email,
        "hide",
        p.id,
        p.name,
        { details: "Temporarily hid the profile from public search" }
      );
      
      toast.success(`Profile of "${p.name}" is now hidden from public view.`);
    } catch (error) {
      console.error("Hide error:", error);
      toast.error(`Failed to hide profile: ${error.message}`);
    } finally {
      endAction(p.id, actionKey);
    }
  };

  const handleSoftDelete = async (p) => {
    const actionKey = "delete";
    if (isActionLoading(p.id, actionKey)) return;
    
    if (!confirm(`Are you sure you want to soft delete the profile of "${p.name}"? This removes them from listings but keeps their data record.`)) {
      return;
    }

    startAction(p.id, actionKey);
    try {
      const docRef = doc(db, "registrations", p.id);
      await updateDoc(docRef, {
        deleted: true,
        approved: false,
        profileCompleted: false,
        visible: false,
        deletedAt: new Date(),
        deletedBy: adminUser?.email || "system"
      });

      await logAdminAction(
        adminUser?.email,
        "soft_delete",
        p.id,
        p.name,
        { details: "Soft deleted profile (removed from dashboard and search)" }
      );
      
      toast.success(`Profile of "${p.name}" soft deleted successfully.`);
    } catch (error) {
      console.error("Soft delete error:", error);
      toast.error(`Failed to delete profile: ${error.message}`);
    } finally {
      endAction(p.id, actionKey);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Database</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0A1F44] tracking-tight">Matrimonial Database</h1>
          <p className="text-gray-500 font-medium mt-1">Review registrations, manage profile status, and view logs.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats.total, icon: Users, color: "text-[#0A1F44] bg-[#0A1F44]/5" },
          { label: "Approved & Live", value: stats.approved, icon: UserCheck, color: "text-emerald-500 bg-emerald-50" },
          { label: "Pending Review", value: stats.pending, icon: History, color: "text-amber-500 bg-amber-50" },
          { label: "Hidden Profiles", value: stats.hidden, icon: EyeOff, color: "text-gray-500 bg-gray-100" }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-[#0A1F44] mt-0.5">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, token, mobile, village, gothram..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-[#FFD700]/10 focus:bg-white transition-all font-bold text-sm text-[#0A1F44] placeholder-gray-400"
          />
        </div>
        {/* Dropdown filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative min-w-[160px]">
            <select 
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-black text-xs uppercase tracking-widest text-[#0A1F44] appearance-none cursor-pointer hover:bg-gray-100/50 transition-colors"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-black text-xs uppercase tracking-widest text-[#0A1F44] appearance-none cursor-pointer hover:bg-gray-100/50 transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved / Live</option>
              <option value="Pending">Pending Review</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive Card Grid (Mobile) / Compact Grid Table (Desktop) */}
      <div>
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-[#0A1F44]">No matching records</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Career & Education</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {paginatedData.map((p) => {
                        const isApproved = p.approved === true && p.profileCompleted === true && p.visible === true;
                        const isHidden = p.visible === false;
                        
                        return (
                          <motion.tr 
                            layout 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            key={p.id} 
                            className="group hover:bg-gray-50/30 transition-all"
                          >
                            {/* User details */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shadow-inner shrink-0 relative border border-gray-100">
                                  {p.profileImageUrl ? (
                                    <img src={p.profileImageUrl} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-[#0A1F44]/15 text-xl">
                                      {p.name?.[0]?.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link href={`/super-admin/registrations/${p.id}`} className="font-black text-[#0A1F44] hover:text-[#FFD700] transition-colors tracking-tight text-base block">
                                    {p.name || "Unnamed Profile"}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <span className="text-[#FFD700] font-black">{p.token}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-gray-300" />{p.profile?.village || p.profile?.placeOfBirth || "Unknown"}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Career & Ed */}
                            <td className="px-8 py-6">
                              <p className="font-black text-sm text-[#0A1F44] tracking-tight">{p.profile?.occupation || "Not Specified"}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                <GraduationCap className="w-3 h-3 text-gray-300" />
                                {p.profile?.education || "---"}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-8 py-6">
                              {isApproved ? (
                                <span className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Approved & Live</span>
                              ) : isHidden ? (
                                <span className="inline-flex px-4 py-1.5 rounded-full bg-gray-50 text-gray-600 text-[9px] font-black uppercase tracking-widest border border-gray-200">Hidden</span>
                              ) : (
                                <span className="inline-flex px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100">Pending Review</span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link 
                                  href={`/super-admin/registrations/${p.id}`} 
                                  title="View Full Profile"
                                  className="p-2.5 rounded-xl bg-gray-50 text-[#0A1F44] border border-gray-100 hover:bg-gray-100 transition-all"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>

                                {isApproved ? (
                                  <>
                                    <button 
                                      onClick={() => handleHide(p)}
                                      title="Hide Profile"
                                      disabled={isActionLoading(p.id, "hide")}
                                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center min-w-[38px] min-h-[38px]"
                                    >
                                      {isActionLoading(p.id, "hide") ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                      ) : (
                                        <EyeOff className="w-4 h-4" />
                                      )}
                                    </button>
                                    <button 
                                      onClick={() => handleReject(p)}
                                      title="Reject/Unapprove"
                                      disabled={isActionLoading(p.id, "reject")}
                                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[38px] min-h-[38px]"
                                    >
                                      {isActionLoading(p.id, "reject") ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <UserX className="w-4 h-4" />
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    onClick={() => handleApprove(p)}
                                    title="Approve & Publish"
                                    disabled={isActionLoading(p.id, "approve")}
                                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center min-w-[38px] min-h-[38px]"
                                  >
                                    {isActionLoading(p.id, "approve") ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <UserCheck className="w-4 h-4" />
                                    )}
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleSoftDelete(p)}
                                  title="Delete Profile"
                                  disabled={isActionLoading(p.id, "delete")}
                                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-rose-400 hover:bg-rose-50 hover:text-white transition-all flex items-center justify-center min-w-[38px] min-h-[38px]"
                                >
                                  {isActionLoading(p.id, "delete") ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedData.map((p) => {
                  const isApproved = p.approved === true && p.profileCompleted === true && p.visible === true;
                  const isHidden = p.visible === false;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      key={p.id}
                      className="bg-white rounded-3xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] p-6 space-y-5"
                    >
                      {/* Top section: Avatar and basic details */}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shadow-inner shrink-0 relative border border-gray-100">
                          {p.profileImageUrl ? (
                            <img src={p.profileImageUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-[#0A1F44]/15 text-xl">
                              {p.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/super-admin/registrations/${p.id}`} className="font-black text-[#0A1F44] tracking-tight text-base truncate block">
                            {p.name || "Unnamed Profile"}
                          </Link>
                          <p className="text-[10px] font-black text-[#FFD700] uppercase mt-0.5 tracking-wider">{p.token}</p>
                          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-gray-400 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                            {p.profile?.village || p.profile?.placeOfBirth || "Unknown Location"}
                          </div>
                        </div>
                      </div>

                      {/* Middle section: Career & Status */}
                      <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 text-xs">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Occupation</p>
                          <p className="font-bold text-[#0A1F44] truncate">{p.profile?.occupation || "Not Specified"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                          {isApproved ? (
                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                          ) : isHidden ? (
                            <span className="inline-flex px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-[8px] font-black uppercase tracking-widest border border-gray-200">Hidden</span>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Bottom section: Action button bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link 
                          href={`/super-admin/registrations/${p.id}`} 
                          className="flex-1 py-3 px-4 rounded-xl bg-gray-50 text-[#0A1F44] border border-gray-100 hover:bg-gray-100 transition-all font-black text-[10px] tracking-wider uppercase text-center flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </Link>

                        {isApproved ? (
                          <>
                            <button 
                              onClick={() => handleHide(p)}
                              disabled={isActionLoading(p.id, "hide")}
                              className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center min-w-[42px] min-h-[42px]"
                              title="Hide from website"
                            >
                              {isActionLoading(p.id, "hide") ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleReject(p)}
                              disabled={isActionLoading(p.id, "reject")}
                              className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[42px] min-h-[42px]"
                              title="Reject profile"
                            >
                              {isActionLoading(p.id, "reject") ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleApprove(p)}
                            disabled={isActionLoading(p.id, "approve")}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all font-black text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5"
                          >
                            {isActionLoading(p.id, "approve") ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            Approve Live
                          </button>
                        )}

                        <button 
                          onClick={() => handleSoftDelete(p)}
                          disabled={isActionLoading(p.id, "delete")}
                          className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[42px] min-h-[42px]"
                          title="Delete profile"
                        >
                          {isActionLoading(p.id, "delete") ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                <p className="text-xs font-bold text-gray-400">
                  Showing Page <span className="text-[#0A1F44] font-black">{currentPage}</span> of <span className="text-[#0A1F44] font-black">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-[#0A1F44] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 text-[#0A1F44] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
