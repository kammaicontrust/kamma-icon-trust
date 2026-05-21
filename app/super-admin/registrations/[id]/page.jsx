"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Users as UsersIcon,
  Moon,
  MessageCircle,
  Download,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Heart,
  Copy,
  Layout,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/app/context/ToastContext";
import { useSuperAdminAuth } from "@/app/context/SuperAdminAuthContext";
import { logAdminAction } from "@/app/lib/auditLogger";

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all">
    <div className="flex items-center gap-4 mb-8 md:mb-10">
      <div className="p-3.5 rounded-2xl bg-[#FFD700]/10 text-[#FFD700] shrink-0">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <h3 className="text-lg md:text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.15em]">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-[#0A1F44]/20 uppercase tracking-[0.2em]">{label}</p>
    <p className="text-sm md:text-base font-black text-[#0A1F44] tracking-tight break-words">{value || "---"}</p>
  </div>
);

export default function SuperAdminProfileDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const toast = useToast();
  const { adminUser } = useSuperAdminAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docSnap = await getDoc(doc(db, "registrations", id));
        if (docSnap.exists()) {
          const uData = docSnap.id ? { id: docSnap.id, ...docSnap.data() } : docSnap.data();
          if (uData.deleted === true) {
            toast.warning("This profile has been soft-deleted.");
            router.push("/super-admin/registrations");
          } else {
            setUser(uData);
          }
        } else {
          toast.error("Profile not found.");
          router.push("/super-admin/registrations");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router, toast]);

  const handleApprove = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const docRef = doc(db, "registrations", id);
      await updateDoc(docRef, {
        approved: true,
        profileCompleted: true,
        visible: true,
        approvedAt: new Date(),
        approvedBy: adminUser?.email || "system"
      });

      setUser(prev => ({ 
        ...prev, 
        approved: true,
        profileCompleted: true,
        visible: true 
      }));

      await logAdminAction(
        adminUser?.email,
        "approve",
        id,
        user.name,
        { details: "Approved, completed, and set to visible from profile detail view" }
      );

      toast.success("Profile has been successfully approved and is now live.");
    } catch (error) {
      console.error(error);
      toast.error(`Approval failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const docRef = doc(db, "registrations", id);
      await updateDoc(docRef, {
        approved: false,
        profileCompleted: false,
        visible: false,
        rejectedAt: new Date(),
        rejectedBy: adminUser?.email || "system"
      });

      setUser(prev => ({ 
        ...prev, 
        approved: false,
        profileCompleted: false,
        visible: false 
      }));

      await logAdminAction(
        adminUser?.email,
        "reject",
        id,
        user.name,
        { details: "Rejected/unapproved and hidden from public search from profile detail view" }
      );

      toast.success("Profile unapproved and hidden from website listing.");
    } catch (error) {
      console.error(error);
      toast.error(`Reject operation failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleHide = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const docRef = doc(db, "registrations", id);
      await updateDoc(docRef, {
        visible: false,
        hiddenAt: new Date(),
        hiddenBy: adminUser?.email || "system"
      });

      setUser(prev => ({ 
        ...prev, 
        visible: false 
      }));

      await logAdminAction(
        adminUser?.email,
        "hide",
        id,
        user.name,
        { details: "Hid profile from search listing from profile detail view" }
      );

      toast.success("Profile is now hidden from public listings.");
    } catch (error) {
      console.error(error);
      toast.error(`Hide operation failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSoftDelete = async () => {
    if (deleting) return;
    if (!confirm(`Are you sure you want to soft delete the profile of "${user.name}"? This removes them from listings but keeps their data record.`)) {
      return;
    }
    setDeleting(true);
    try {
      const docRef = doc(db, "registrations", id);
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
        id,
        user.name,
        { details: "Soft deleted profile from profile detail view" }
      );

      toast.success("Profile has been soft-deleted successfully.");
      router.push("/super-admin/registrations");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete profile: ${error.message}`);
      setDeleting(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(user.token);
    toast.success("Registration Token copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Member Details</p>
      </div>
    );
  }

  const profile = user.profile || {};
  
  // Helper: check nested profile first, then root-level (for migrated users)
  const get = (key, ...altKeys) => {
    const val = profile[key] || user[key];
    if (val !== undefined && val !== null && val !== "") return val;
    for (const alt of altKeys) {
      const altVal = profile[alt] || user[alt];
      if (altVal !== undefined && altVal !== null && altVal !== "") return altVal;
    }
    return null;
  };

  const isApproved = user.approved === true && user.profileCompleted === true && user.visible === true;
  const isHidden = user.visible === false;

  return (
    <div className="space-y-12 pb-32">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-[#0A1F44]/40 hover:text-[#0A1F44] transition-all font-black uppercase text-[10px] tracking-[0.25em]"
        >
          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Return to Registry
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={copyToken}
            className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-3.5 rounded-xl font-black text-[10px] tracking-widest text-[#0A1F44] hover:bg-gray-50 transition-all shadow-sm"
          >
            <Copy className="w-4 h-4 text-[#FFD700]" />
            TOKEN: {user.token}
          </button>
          
          <button 
            onClick={handleSoftDelete}
            disabled={deleting || updating}
            className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-5 py-3.5 rounded-xl font-black text-[10px] tracking-widest text-rose-600 hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-all shadow-sm"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            DELETE
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-[#0A1F44] rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-[#FFD700]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-tr from-[#FFD700] to-[#E5C100] p-1 shadow-2xl shadow-[#FFD700]/10 shrink-0">
            <div className="w-full h-full rounded-[2.3rem] md:rounded-[3.2rem] overflow-hidden bg-white">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#0A1F44]/15 font-black text-5xl md:text-6xl">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.15em] text-[#FFD700]">
                ID: {user.id.slice(-8).toUpperCase()}
              </span>
              <span className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-[0.15em] ${
                isApproved 
                  ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" 
                  : isHidden
                  ? "bg-gray-500/20 border-gray-500/20 text-gray-400"
                  : "bg-orange-500/20 border-orange-500/20 text-orange-400"
              }`}>
                {isApproved ? "Approved & Live" : isHidden ? "Hidden / Inactive" : "Pending Approval"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight break-words">{user.name || "Unnamed Profile"}</h1>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 sm:gap-8 mt-2">
              <a href={`tel:${user.mobile}`} className="flex items-center justify-center md:justify-start gap-2.5 group">
                <Phone className="w-4 h-4 text-[#FFD700] group-hover:scale-110 transition-transform" />
                <span className="text-base font-black tracking-tight opacity-90 group-hover:text-[#FFD700] transition-colors">{user.mobile}</span>
              </a>
              <a href={`mailto:${user.email || ""}`} className="flex items-center justify-center md:justify-start gap-2.5 group">
                <Mail className="w-4 h-4 text-[#FFD700] group-hover:scale-110 transition-transform" />
                <span className="text-base font-black tracking-tight opacity-90 group-hover:text-[#FFD700] transition-colors break-all">{user.email || "No Email"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          <DetailSection title="Personal Details" icon={Heart}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12">
              <InfoField label="Biological Gender" value={get("gender")} />
              <InfoField label="Age / DOB" value={get("age") ? `${get("age")} Years (${get("dateOfBirth") || "---"})` : get("dateOfBirth")} />
              <InfoField label="Civil Status" value={get("maritalStatus")} />
              <InfoField label="Height" value={get("height")} />
              <InfoField label="Weight" value={get("weight")} />
              <InfoField label="Blood Group" value={get("bloodGroup")} />
              <InfoField label="Complexion" value={get("complexion")} />
              <InfoField label="Religion" value={get("religion")} />
            </div>
          </DetailSection>

          <DetailSection title="Family & Lineage" icon={UsersIcon}>
            <div className="grid grid-cols-2 gap-6 md:gap-12">
              <InfoField label="Father's Identity" value={get("fatherName")} />
              <InfoField label="Paternal Profession" value={get("fatherOccupation")} />
              <InfoField label="Mother's Identity" value={get("motherName")} />
              <InfoField label="Maternal Profession" value={get("motherOccupation")} />
              <InfoField label="Sibling Details" value={get("siblings", "siblingDetails")} />
              <InfoField label="Native Village/Place" value={get("placeOfBirth", "village")} />
            </div>
          </DetailSection>

          <DetailSection title="Horoscope & Astrological" icon={Moon}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12">
              <InfoField label="Gotra / Gothram" value={get("gotra", "gothram")} />
              <InfoField label="Birth Nakshatra" value={get("nakshatra")} />
              <InfoField label="Birth Rashi" value={get("rashi")} />
              <InfoField label="Manglik Status" value={get("manglik")} />
              <InfoField label="Coordinates of Birth" value={get("placeOfBirth")} />
              <InfoField label="Exact Time of Birth" value={get("timeOfBirth")} />
            </div>
          </DetailSection>
        </div>

        <div className="space-y-8 md:space-y-12">
          <DetailSection title="Career & Worth" icon={Briefcase}>
            <div className="space-y-8">
              <InfoField label="Academic Qualification" value={get("education", "qualification")} />
              <InfoField label="Current Designation" value={get("occupation", "job")} />
              <InfoField label="Annual Compensation" value={get("income", "annualIncome")} />
              
              <div className="pt-4 space-y-3">
                <a 
                  href={`https://wa.me/91${user.mobile}`} 
                  target="_blank"
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-xl shadow-[#25D366]/10 hover:scale-[1.02] transition-all text-xs tracking-wider"
                >
                  <MessageCircle className="w-5 h-5" />
                  WHATSAPP CHAT
                </a>
                <a 
                  href={`tel:${user.mobile}`}
                  className="flex items-center justify-center gap-2.5 w-full py-4 bg-white border-2 border-gray-100 text-[#0A1F44] font-black rounded-2xl hover:bg-gray-50 transition-all text-xs tracking-wider"
                >
                  <Phone className="w-5 h-5 text-gray-400" />
                  CALL DIRECTLY
                </a>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Sensitive Attachments" icon={ShieldCheck}>
            {user.resumeUrl ? (
              <a 
                href={user.resumeUrl} 
                target="_blank"
                className="flex items-center justify-between p-5 bg-[#0A1F44] text-white rounded-2xl group transition-all shadow-xl shadow-[#0A1F44]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Download className="w-4 h-4 text-[#FFD700]" />
                  </div>
                  <span className="font-black text-xs tracking-tight">Access Bio-Data / CV</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              <div className="p-10 border-4 border-dashed border-gray-50 rounded-2xl text-center">
                <Layout className="w-7 h-7 text-gray-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Documents Found</p>
              </div>
            )}
          </DetailSection>
        </div>
      </div>

      {/* Action Bar (Sticky at the bottom on mobile/small screens, fixed bar on desktop) */}
      <div className="fixed bottom-0 left-0 right-0 xl:left-80 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-4 md:px-12 flex justify-between items-center z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
        <div className="hidden sm:block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Currently reviewing</p>
          <h5 className="text-sm font-black text-[#0A1F44] truncate max-w-[200px]">{user.name}</h5>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isApproved ? (
            <>
              <button 
                onClick={handleHide}
                disabled={updating || deleting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-6 py-3.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-gray-200 transition-all"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                Hide Listing
              </button>
              <button 
                onClick={handleReject}
                disabled={updating || deleting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 px-6 py-3.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Unapprove
              </button>
            </>
          ) : (
            <button 
              onClick={handleApprove}
              disabled={updating || deleting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-white px-10 py-3.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve & Go Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
