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
  ShieldCheck,
  Loader2,
  Heart,
  Copy,
  Layout
} from "lucide-react";
import { motion } from "framer-motion";

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all">
    <div className="flex items-center gap-4 mb-10">
      <div className="p-4 rounded-3xl bg-[#FFD700]/10 text-[#FFD700]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-[0.15em]">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="space-y-2">
    <p className="text-[11px] font-black text-[#0A1F44]/20 uppercase tracking-[0.25em]">{label}</p>
    <p className="text-base font-black text-[#0A1F44] tracking-tight">{value || "---"}</p>
  </div>
);

export default function SuperAdminProfileDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docSnap = await getDoc(doc(db, "registrations", id));
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/super-admin");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleStatusUpdate = async (status) => {
    await updateDoc(doc(db, "registrations", id), { profileCompleted: status });
    setUser(prev => ({ ...prev, profileCompleted: status }));
  };

  const copyToken = () => {
    navigator.clipboard.writeText(user.token);
    alert("Token copied!");
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" /></div>;

  const profile = user.profile || {};
  // Helper: check nested profile first, then root-level (for migrated users)
  const get = (key, ...altKeys) => {
    const val = profile[key] || user[key];
    if (val) return val;
    for (const alt of altKeys) {
      const altVal = profile[alt] || user[alt];
      if (altVal) return altVal;
    }
    return null;
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-[#0A1F44]/30 hover:text-[#0A1F44] transition-all font-black uppercase text-[11px] tracking-[0.3em]"
        >
          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Return to Registry
        </button>

        <div className="flex items-center gap-4">
           <button 
             onClick={copyToken}
             className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest text-[#0A1F44] hover:bg-gray-50 transition-all shadow-sm"
           >
             <Copy className="w-4 h-4 text-[#FFD700]" />
             TOKEN: {user.token}
           </button>
           <button 
             onClick={() => handleStatusUpdate(!user.profileCompleted)}
             className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest transition-all shadow-xl ${
               user.profileCompleted 
                ? "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600" 
                : "bg-[#0A1F44] text-white shadow-[#0A1F44]/20 hover:scale-105"
             }`}
           >
             {user.profileCompleted ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-[#FFD700]" />}
             {user.profileCompleted ? "UNAPPROVE PROFILE" : "APPROVE PROFILE"}
           </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-[#0A1F44] rounded-[4rem] p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-[#FFD700]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
           <div className="w-64 h-64 rounded-[3.5rem] bg-gradient-to-tr from-[#FFD700] to-[#E5C100] p-1.5 shadow-2xl shadow-[#FFD700]/20">
              <div className="w-full h-full rounded-[3.2rem] overflow-hidden bg-white">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0A1F44]/10 font-black text-6xl">
                    {user.name?.[0]}
                  </div>
                )}
              </div>
           </div>
           <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                 <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                    Member Registry ID: {user.id.slice(-8).toUpperCase()}
                 </span>
                 <span className={`px-5 py-2 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-[0.2em] ${
                   user.profileCompleted ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" : "bg-orange-500/20 border-orange-500/20 text-orange-400"
                 }`}>
                   {user.profileCompleted ? "Publicly Verified" : "Verification Pending"}
                 </span>
              </div>
              <h1 className="text-6xl font-black tracking-tight mb-6 leading-tight">{user.name || "Unnamed Profile"}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-10">
                 <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-lg font-black tracking-tight opacity-80">{user.mobile}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-lg font-black tracking-tight opacity-80">{user.email || "No Email"}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <DetailSection title="Personal Narrative" icon={Heart}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                 <InfoField label="Biological Gender" value={get("gender")} />
                 <InfoField label="Age of Maturity" value={get("age") ? `${get("age")} Years` : null} />
                 <InfoField label="Date of Birth" value={get("dateOfBirth")} />
                 <InfoField label="Civil Status" value={get("maritalStatus")} />
                 <InfoField label="Vertical Height" value={get("height")} />
                 <InfoField label="Body Weight" value={get("weight")} />
                 <InfoField label="Blood Group" value={get("bloodGroup")} />
                 <InfoField label="Physical Complexion" value={get("complexion")} />
                 <InfoField label="Religious Belief" value={get("religion")} />
              </div>
           </DetailSection>

           <DetailSection title="Family & Lineage" icon={UsersIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                 <InfoField label="Father's Identity" value={get("fatherName")} />
                 <InfoField label="Paternal Profession" value={get("fatherOccupation")} />
                 <InfoField label="Mother's Identity" value={get("motherName")} />
                 <InfoField label="Maternal Profession" value={get("motherOccupation")} />
                 <InfoField label="Sibling Count" value={get("siblings")} />
                 <InfoField label="Native Residence" value={get("placeOfBirth", "village")} />
              </div>
           </DetailSection>

           <DetailSection title="Celestial / Horoscope" icon={Moon}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                 <InfoField label="Gotra / Gothram" value={get("gotra", "gothram")} />
                 <InfoField label="Birth Nakshatra" value={get("nakshatra")} />
                 <InfoField label="Birth Rashi" value={get("rashi")} />
                 <InfoField label="Manglik Status" value={get("manglik")} />
                 <InfoField label="Coordinates of Birth" value={get("placeOfBirth")} />
                 <InfoField label="Exact Time of Birth" value={get("timeOfBirth")} />
              </div>
           </DetailSection>
        </div>

        <div className="space-y-12">
           <DetailSection title="Career & Worth" icon={Briefcase}>
              <div className="space-y-10">
                 <InfoField label="Academic Qualification" value={get("education")} />
                 <InfoField label="Current Designation" value={get("occupation")} />
                 <InfoField label="Annual Compensation" value={get("income", "annualIncome")} />
                 
                 <div className="pt-6 space-y-4">
                    <a 
                      href={`https://wa.me/91${user.mobile}`} 
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white font-black rounded-3xl shadow-2xl shadow-[#25D366]/20 hover:scale-105 transition-all"
                    >
                      <MessageCircle className="w-6 h-6" />
                      SECURE WHATSAPP
                    </a>
                    <button className="flex items-center justify-center gap-3 w-full py-5 bg-white border-2 border-gray-100 text-[#0A1F44] font-black rounded-3xl hover:bg-gray-50 transition-all">
                      <Download className="w-6 h-6" />
                      DOWNLOAD ARCHIVE
                    </button>
                 </div>
              </div>
           </DetailSection>

           <DetailSection title="Sensitive Attachments" icon={ShieldCheck}>
              {user.resumeUrl ? (
                <a 
                  href={user.resumeUrl} 
                  target="_blank"
                  className="flex items-center justify-between p-6 bg-[#0A1F44] text-white rounded-3xl group transition-all shadow-2xl shadow-[#0A1F44]/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Download className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <span className="font-black text-sm tracking-tight">Access Bio-Data</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </a>
              ) : (
                <div className="p-12 border-4 border-dashed border-gray-50 rounded-[3rem] text-center">
                  <Layout className="w-8 h-8 text-gray-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Documents Found</p>
                </div>
              )}
           </DetailSection>
        </div>
      </div>
    </div>
  );
}
