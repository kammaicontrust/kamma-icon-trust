"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <p className="text-gray-900">{value || "Not provided"}</p>
  </div>
);

const ProfileSection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-[#FF9933] border-b border-pink-100 pb-2 mb-4">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "registrations", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const rootData = docSnap.data();
          const data = rootData.profile || {};
          
          // Calculate age from dateOfBirth if available
          let calculatedAge = null;
          if (data.dateOfBirth) {
            const dob = new Date(data.dateOfBirth);
            const diffMs = Date.now() - dob.getTime();
            const ageDt = new Date(diffMs);
            calculatedAge = Math.abs(ageDt.getUTCFullYear() - 1970);
          }
          
          setUser({ 
            id: docSnap.id, 
            ...data,
            name: rootData.name || data.name,
            village: data.placeOfBirth || data.village,
            gothram: data.gotra || data.gothram,
            age: calculatedAge || data.age,
            photoUrl: rootData.profileImageUrl || data.photoUrl,
            resumeUrl: rootData.resumeUrl || data.resumeUrl,
            email: rootData.email || data.emailId || data.email,
            mobile: rootData.mobile || data.contactNumber || data.mobile
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || "Profile Not Found"}</h1>
          <p className="text-gray-600">
            {error ? "There was an error loading the profile. It may be private or deleted." : "The profile you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <img
                src={user.photoUrl || user.profileImageUrl || "/default-avatar.png"}
                alt={user.name || "Profile"}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-pink-200"
              />
              <h1 className="text-3xl font-bold text-gray-800">{user.name || "Not provided"}</h1>
              <p className="text-gray-500 mt-2">{user.occupation || "No occupation provided"}</p>
            </div>

            <ProfileSection title="Personal Info">
              <InfoField label="Email" value={user.email} />
              <InfoField label="Mobile" value={user.mobile} />
              <InfoField label="Age" value={user.age ? `${user.age} years` : null} />
              <InfoField label="Date of Birth" value={user.dateOfBirth} />
              <InfoField label="Gender" value={user.gender} />
              <InfoField label="Marital Status" value={user.maritalStatus} />
              <InfoField label="Height" value={user.height} />
              <InfoField label="Weight" value={user.weight} />
              <InfoField label="Blood Group" value={user.bloodGroup} />
              <InfoField label="Complexion" value={user.complexion} />
              <InfoField label="Religion" value={user.religion} />
              <InfoField label="Caste" value={user.caste} />
              <InfoField label="Education" value={user.education} />
              <InfoField label="Income" value={user.income} />
            </ProfileSection>

            <ProfileSection title="Family Details">
              <InfoField label="Father's Name" value={user.fatherName} />
              <InfoField label="Father's Occupation" value={user.fatherOccupation} />
              <InfoField label="Mother's Name" value={user.motherName} />
              <InfoField label="Mother's Occupation" value={user.motherOccupation} />
              <InfoField label="Siblings" value={user.siblings} />
              <InfoField label="Village" value={user.village} />
            </ProfileSection>

            <ProfileSection title="Horoscope Details">
              <InfoField label="Gothram / Gotra" value={user.gothram} />
              <InfoField label="Nakshatra" value={user.nakshatra} />
              <InfoField label="Rashi" value={user.rashi} />
              <InfoField label="Manglik" value={user.manglik} />
              <InfoField label="Place of Birth" value={user.placeOfBirth} />
              <InfoField label="Time of Birth" value={user.timeOfBirth} />
            </ProfileSection>

            {user.resumeUrl && (
              <div className="mt-10 text-center">
                <a
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  Download Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}