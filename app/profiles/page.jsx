"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ProfilesPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    village: "",
    gothram: "",
    occupation: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    (filters.name === "" || u.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.village === "" || u.village?.toLowerCase().includes(filters.village.toLowerCase())) &&
    (filters.gothram === "" || u.gothram?.toLowerCase().includes(filters.gothram.toLowerCase())) &&
    (filters.occupation === "" || u.occupation?.toLowerCase().includes(filters.occupation.toLowerCase()))
  );

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Matrimonial Profiles</h1>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by Name"
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Search by Village"
              value={filters.village}
              onChange={(e) => handleFilterChange("village", e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Search by Gothram"
              value={filters.gothram}
              onChange={(e) => handleFilterChange("gothram", e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Search by Occupation"
              value={filters.occupation}
              onChange={(e) => handleFilterChange("occupation", e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <img
                  src={u.photoUrl}
                  alt={u.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-pink-200"
                />
                <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">{u.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Village:</strong> {u.village}</p>
                  <p><strong>Gothram:</strong> {u.gothram}</p>
                  <p><strong>Occupation:</strong> {u.occupation}</p>
                  <p><strong>Age:</strong> {u.age} years</p>
                </div>
                <Link href={`/profile/${u.id}`}>
                  <button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors duration-300">
                    View Profile
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No profiles match your search criteria.</p>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          color: #374151;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
        }
      `}</style>
    </div>
  );
}