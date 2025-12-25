import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `${API}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [API, userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {profile.fullname}
            </h1>
            <p className="text-gray-500">@{profile.username}</p>
          </div>

          <span className="px-5 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold">
            {profile.tier} Tier
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow">
            <p className="text-gray-500">XP</p>
            <p className="text-2xl font-bold text-gray-800">{profile.xp}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow">
            <p className="text-gray-500">Coins</p>
            <p className="text-2xl font-bold text-gray-800">{profile.coins}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-center shadow">
            <p className="text-gray-500">Friends</p>
            <p className="text-2xl font-bold text-gray-800">
              {profile.friends.length}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-6 text-lg">

          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-semibold">{profile.email}</p>
          </div>

          <div>
            <p className="text-gray-500">Last Active</p>
            <p className="font-semibold">
              {new Date(profile.lastActive).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Joined On</p>
            <p className="font-semibold">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Updated At</p>
            <p className="font-semibold">
              {new Date(profile.updatedAt).toLocaleString()}
            </p>
          </div>

        </div>

        {/* Logout */}
        <div className="mt-12 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-orange-500 text-white rounded-xl
                       font-bold hover:bg-orange-600 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
