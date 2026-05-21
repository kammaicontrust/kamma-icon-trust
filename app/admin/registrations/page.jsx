"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "registrations"), orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = registrations.filter(reg => {
    const matchesSearch = 
      (reg.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.mobile?.includes(searchTerm)) ||
      (reg.token?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.profile?.village?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.profile?.gothram?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = filterGender === "All" || reg.profile?.gender === filterGender;
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Completed" ? reg.profileCompleted : !reg.profileCompleted);

    return matchesSearch && matchesGender && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "registrations", id));
        setRegistrations(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        alert("Failed to delete registration");
      }
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const updateData = newStatus
        ? { approved: true, profileCompleted: true, visible: true }
        : { approved: false, profileCompleted: false, visible: false };
      await updateDoc(doc(db, "registrations", id), updateData);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...updateData } : r));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0A1F44] tracking-tight">Profile Moderation</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and review matrimonial registrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gray-50 text-[#0A1F44] px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name, mobile, token, village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/5 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-4 outline-none focus:border-[#FFD700] text-sm font-bold text-[#0A1F44]"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-4 outline-none focus:border-[#FFD700] text-sm font-bold text-[#0A1F44]"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location / Bio</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-gray-400 font-bold text-sm">No registrations found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          {reg.profileImageUrl ? (
                            <img src={reg.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#0A1F44] tracking-tight truncate max-w-[150px]">{reg.name || "Untitled"}</p>
                          <p className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest">{reg.token || "No Token"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0A1F44]/60">
                          <Phone className="w-3 h-3 text-[#FFD700]" />
                          {reg.mobile}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0A1F44]/60">
                          <Calendar className="w-3 h-3 text-[#FFD700]" />
                          {reg.profile?.gender || "Not set"} • {reg.profile?.age || "N/A"} yrs
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0A1F44]/60">
                          <MapPin className="w-3 h-3 text-[#FFD700]" />
                          {reg.profile?.village || reg.profile?.placeOfBirth || "Unknown"}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">
                          {reg.profile?.education || reg.profile?.occupation || "No details provided"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {reg.profileCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/registrations/${reg.id}`}
                          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-[#0A1F44] transition-all"
                          title="View Profile"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => toggleApproval(reg.id, reg.profileCompleted)}
                          className={`p-2 rounded-xl transition-all ${
                            reg.profileCompleted 
                              ? "text-rose-400 hover:bg-rose-50" 
                              : "text-emerald-400 hover:bg-emerald-50"
                          }`}
                          title={reg.profileCompleted ? "Reject/Hide" : "Approve/Show"}
                        >
                          {reg.profileCompleted ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(reg.id)}
                          className="p-2 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-6 py-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {filteredData.length} of {registrations.length} profiles
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 rounded-xl bg-white border border-gray-100 text-gray-300 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button disabled className="p-2 rounded-xl bg-white border border-gray-100 text-gray-300 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
