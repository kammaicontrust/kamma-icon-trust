"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <img
                src={user.photoUrl || user.profileImageUrl || "/default-avatar.png"}
                alt={user.name || "Profile"}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-pink-200"
              />
              <h1 className="text-3xl font-bold text-gray-800">{user.name || "Not provided"}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Village</label>
                  <p className="text-gray-900">{user.village || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gothram</label>
                  <p className="text-gray-900">{user.gothram || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <p className="text-gray-900">{user.occupation || "Not provided"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="text-gray-900">{user.mobile || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="text-gray-900">{user.age ? `${user.age} years` : "Not provided"}</p>
                </div>
              </div>
            </div>

            {user.resumeUrl && (
              <div className="mt-8 text-center">
                <a
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors duration-300"
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