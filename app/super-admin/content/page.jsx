"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Save, Layout, Type, Image as ImageIcon, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ContentCMS() {
  const [config, setConfig] = useState({
    heroTitle: "Empowering the Kamma Community",
    heroSubtitle: "Dedicated to social welfare, education, and heritage preservation.",
    announcement: "Registration for the 2026 Matrimonial Meet is now open!",
    contactEmail: "kammaicontrust@email.com",
    contactPhone: "+91 94945 02759"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, "website_config", "general"));
        if (docSnap.exists()) {
          setConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "website_config", "general"), {
        ...config,
        updatedAt: serverTimestamp()
      });
      alert("Website content updated successfully! 🔥");
    } catch (error) {
      alert("Failed to update content.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0A1F44] tracking-tight">Content Control</h1>
          <p className="text-gray-500 font-medium">Update homepage text and announcements without code.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-[#0A1F44] text-white px-10 py-4 rounded-2xl font-black text-xs shadow-xl shadow-[#0A1F44]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-[#FFD700]" />}
          PUBLISH CHANGES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Hero Section Edit */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-widest">Hero Section</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Heading</label>
              <input 
                type="text" 
                value={config.heroTitle}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub-heading / Description</label>
              <textarea 
                rows="4"
                value={config.heroSubtitle}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Global Components Edit */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-[#FFD700]" />
            <h2 className="text-xl font-black text-[#0A1F44] tracking-tight uppercase tracking-widest">Announcements & Contact</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Announcement Banner</label>
              <input 
                type="text" 
                value={config.announcement}
                onChange={(e) => handleChange("announcement", e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                <input 
                  type="text" 
                  value={config.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Phone</label>
                <input 
                  type="text" 
                  value={config.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 outline-none focus:bg-white focus:ring-4 focus:ring-[#FFD700]/10 transition-all font-bold text-[#0A1F44]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-[#0A1F44] rounded-[4rem] p-20 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 flex items-center gap-2 text-[#FFD700]/40 text-[10px] font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Live Preview
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-5xl font-black tracking-tight leading-tight">{config.heroTitle}</h2>
          <p className="text-xl font-bold text-white/50 leading-relaxed">{config.heroSubtitle}</p>
          <div className="pt-8">
            <div className="bg-[#FFD700] text-[#0A1F44] px-10 py-5 rounded-full inline-block font-black text-sm tracking-widest cursor-not-allowed opacity-80">
              SAMPLE CALL TO ACTION
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
