"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
  ShieldAlert,
  Loader2,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 rounded-2xl bg-[#FFD700]/10 text-[#FFD700]">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.1em]">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-[#0A1F44]">{value || "Not provided"}</p>
  </div>
);

export default function ProfileDetailView({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "registrations", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/admin/registrations");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "registrations", id), {
        profileCompleted: status
      });
      setUser(prev => ({ ...prev, profileCompleted: status }));
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Permanently delete this profile?")) {
      setActionLoading(true);
      try {
        await deleteDoc(doc(db, "registrations", id));
        router.push("/admin/registrations");
      } catch (error) {
        alert("Delete failed");
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  const profile = user.profile || {};

  return (
    <div className="space-y-8 pb-32">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[#0A1F44]/40 hover:text-[#0A1F44] transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 bg-rose-50 text-rose-500 px-6 py-3 rounded-2xl font-bold text-xs hover:bg-rose-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Profile
          </button>
          {user.profileCompleted ? (
            <button 
              onClick={() => handleStatusUpdate(false)}
              className="flex items-center gap-2 bg-orange-50 text-orange-500 px-6 py-3 rounded-2xl font-bold text-xs hover:bg-orange-100 transition-all"
            >
              <XCircle className="w-4 h-4" />
              Hide Profile
            </button>
          ) : (
            <button 
              onClick={() => handleStatusUpdate(true)}
              className="flex items-center gap-2 bg-[#0A1F44] text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-[#0A1F44]/10 hover:scale-[1.02] transition-all"
            >
              <CheckCircle className="w-4 h-4 text-[#FFD700]" />
              Approve Profile
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-tr from-[#0A1F44] to-[#1A3A72] rounded-[3rem] overflow-hidden">
          <div className="absolute inset-0 bg-[#FFD700]/5 backdrop-blur-[2px]" />
          <div className="absolute top-10 right-10 flex gap-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Registration Token</p>
                <p className="text-xl font-black tracking-tight">{user.token || "UNSET"}</p>
             </div>
             <div className={`px-6 py-3 rounded-2xl backdrop-blur-md border ${
               user.profileCompleted 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-orange-500/10 border-orange-500/20 text-orange-400"
             }`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Public Status</p>
                <p className="text-xl font-black tracking-tight uppercase">{user.profileCompleted ? "Live" : "Pending"}</p>
             </div>
          </div>
        </div>
        
        <div className="px-12 -mt-20 flex flex-col md:flex-row items-end gap-10">
          <div className="w-48 h-48 rounded-[3rem] bg-white p-2 shadow-2xl border border-gray-100 group relative">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#0A1F44]/20 font-black text-4xl">
                  {user.name?.[0]}
                </div>
              )}
            </div>
            {user.profileImageUrl && (
              <a 
                href={user.profileImageUrl} 
                target="_blank"
                className="absolute bottom-4 right-4 p-3 bg-[#FFD700] rounded-2xl text-[#0A1F44] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
          <div className="pb-4">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{user.name || "Unnamed User"}</h1>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
                <Calendar className="w-4 h-4 text-[#FFD700]" />
                {profile.gender} • {profile.age} Years
              </div>
              <div className="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
                <MapPin className="w-4 h-4 text-[#FFD700]" />
                {profile.village || profile.placeOfBirth || "Location not set"}
              </div>
              <div className="flex items-center gap-2 text-white/60 font-bold uppercase text-[10px] tracking-widest">
                <Briefcase className="w-4 h-4 text-[#FFD700]" />
                {profile.occupation || "Career not set"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal & Physical */}
          <DetailSection title="Personal & Physical Details" icon={Heart}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
              <InfoField label="Gender" value={profile.gender} />
              <InfoField label="Date of Birth" value={profile.dateOfBirth} />
              <InfoField label="Marital Status" value={profile.maritalStatus} />
              <InfoField label="Height" value={profile.height} />
              <InfoField label="Weight" value={profile.weight} />
              <InfoField label="Blood Group" value={profile.bloodGroup} />
              <InfoField label="Complexion" value={profile.complexion} />
              <InfoField label="Religion" value={profile.religion} />
              <InfoField label="Caste" value={profile.caste} />
            </div>
          </DetailSection>

          {/* Education & Career */}
          <DetailSection title="Education & Career" icon={GraduationCap}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
              <InfoField label="Qualification" value={profile.education} />
              <InfoField label="Current Occupation" value={profile.occupation} />
              <InfoField label="Annual Income" value={profile.income || profile.annualIncome} />
            </div>
          </DetailSection>

          {/* Family Details */}
          <DetailSection title="Family Background" icon={UsersIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
              <InfoField label="Father's Name" value={profile.fatherName} />
              <InfoField label="Father's Occupation" value={profile.fatherOccupation} />
              <InfoField label="Mother's Name" value={profile.motherName} />
              <InfoField label="Mother's Occupation" value={profile.motherOccupation} />
              <InfoField label="Siblings" value={profile.siblings} />
              <InfoField label="Village / Native" value={profile.village} />
            </div>
          </DetailSection>

          {/* Horoscope */}
          <DetailSection title="Horoscope Details" icon={Moon}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4">
              <InfoField label="Gothram" value={profile.gotra || profile.gothram} />
              <InfoField label="Nakshatra" value={profile.nakshatra} />
              <InfoField label="Rashi" value={profile.rashi} />
              <InfoField label="Manglik" value={profile.manglik} />
              <InfoField label="Place of Birth" value={profile.placeOfBirth} />
              <InfoField label="Time of Birth" value={profile.timeOfBirth} />
            </div>
          </DetailSection>
        </div>

        <div className="space-y-8">
          {/* Contact Details */}
          <DetailSection title="Contact Info" icon={Phone}>
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-black text-[#0A1F44]">{user.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-black text-[#0A1F44] truncate">{user.email || profile.emailId}</p>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <a 
                  href={`https://wa.me/91${user.mobile}`} 
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-xl shadow-[#25D366]/10 hover:scale-[1.02] transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  WHATSAPP CHAT
                </a>
                <button className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-gray-100 text-[#0A1F44] font-black rounded-2xl hover:bg-gray-50 transition-all">
                  <Download className="w-5 h-5" />
                  GENERATE PDF
                </button>
              </div>
            </div>
          </DetailSection>

          {/* Documents */}
          <DetailSection title="Documents" icon={ShieldAlert}>
            <div className="space-y-4">
              {user.resumeUrl ? (
                <a 
                  href={user.resumeUrl} 
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-[#0A1F44] text-white rounded-2xl group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-[#FFD700]" />
                    <span className="font-bold text-sm tracking-tight">Bio-data / Resume</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </a>
              ) : (
                <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No documents uploaded</p>
                </div>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
