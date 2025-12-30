import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userId) return navigate("/login");

        // ✅ Fetch user
        const userRes = await axios.get(`${API}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Fetch contest history
        const historyRes = await axios.get(
          `${API}/api/battles/my-history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(userRes.data); // 🔥 FIX HERE
        setHistory(historyRes.data.history || []);
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, [API, navigate, userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ SAFETY GUARD
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b10] text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b10] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {user.username}
            </h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          <span className="px-6 py-2 bg-orange-500/20 text-orange-400 
                           rounded-full font-bold uppercase text-sm">
            {user.tier} Tier
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="XP" value={user.xp || 0} />
          <StatCard title="Coins" value={user.coins || 0} />
          <StatCard title="Battles" value={history.length} />
          <StatCard
            title="Wins"
            value={history.filter(h => h.result === "win").length}
          />
        </div>

        {/* CONTEST HISTORY */}
        <div className="bg-[#0a1118] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black mb-6 tracking-widest uppercase text-orange-400">
            Contest History
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-400">No battles yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((battle, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-black/40 
                             border border-white/10 p-4 rounded-xl"
                >
                  <div>
                    <p className="font-bold text-white">
                      {battle.problemTitle}
                    </p>
                    <p className="text-xs text-gray-400">
                      {battle.battleType} • {battle.opponents.join(", ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(battle.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black uppercase ${
                        battle.result === "win"
                          ? "text-green-400"
                          : battle.result === "lose"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {battle.result}
                    </p>
                    <p className="text-xs text-gray-400">
                      Score: {battle.bestScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="mt-12 text-right">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-red-500/80 hover:bg-red-600 
                       rounded-xl font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-[#0a1118] border border-white/10 rounded-xl p-5 text-center">
    <p className="text-gray-400 text-xs uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-black text-white mt-2">{value}</p>
  </div>
);

export default Profile;
