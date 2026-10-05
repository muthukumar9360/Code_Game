import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaCrown,
  FaMedal,
  FaBolt,
  FaSearch,
  FaCode,
  FaGamepad,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pointsFilter, setPointsFilter] = useState("all"); // 'all', 'practice', 'ranked', 'tournament'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Reset to page 1 whenever points filter or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pointsFilter, searchTerm]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API}/api/users/leaderboard`);
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort users according to selected filter points
  const sortedUsers = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      if (pointsFilter === "practice") {
        return (b.practicePoints || 0) - (a.practicePoints || 0);
      } else if (pointsFilter === "ranked") {
        return (b.rankedPoints || 0) - (a.rankedPoints || 0);
      } else if (pointsFilter === "tournament") {
        return (b.tournamentPoints || 0) - (a.tournamentPoints || 0);
      }
      return (b.xp || 0) - (a.xp || 0);
    });
  }, [leaderboard, pointsFilter]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.fullname && u.fullname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedUsers, searchTerm]);

  // Hall of Fame Top 3 based on current sorted criteria
  const top3 = sortedUsers.slice(0, 3);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const getPointsLabel = (user) => {
    if (pointsFilter === "practice") return `${user.practicePoints || 0} Practice Pts`;
    if (pointsFilter === "ranked") return `${user.rankedPoints || 0} Ranked Pts`;
    if (pointsFilter === "tournament") return `${user.tournamentPoints || 0} Tournament Pts`;
    return `${user.xp || 0} Total XP`;
  };

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16 relative font-sans">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[99%] mx-auto relative z-10">
        {/* NAV HEADER WITH BACK BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <BackButton to="/" label="Dashboard" />
          <h1 className="text-xl font-black italic tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            BATT<span className="text-orange-500">LIX</span>
          </h1>
        </div>

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic">
            HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500">LEGENDS</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.2em] mt-2 font-medium">
            Top Ranking Developers Ranked by Technical Points & Battle Supremacy
          </p>
        </div>

        {/* TOP FILTER OPTIONS & SEARCH BAR */}
        <div className="bg-[#0a1118]/90 border-2 border-white/40 p-4 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-2xl">
          {/* 4 FILTER TABS */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {[
              { id: "all", label: "Overall XP", icon: FaBolt },
              { id: "practice", label: "Practice Points", icon: FaCode },
              { id: "ranked", label: "Ranked Match Points", icon: FaGamepad },
              { id: "tournament", label: "Tournament Points", icon: FaTrophy }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = pointsFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPointsFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-orange-500 text-black border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)] font-black scale-105"
                      : "bg-white/5 border border-white/30 text-gray-300 hover:border-white hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search combatant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/30 focus:border-white rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none font-mono transition"
            />
          </div>
        </div>

        {/* HALL OF FAME: TOP 3 PODIUM */}
        {top3.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              <FaCrown className="text-yellow-400 text-sm" />
              <span>
                Hall of Fame // Elite Contenders ({
                  pointsFilter === "ranked"
                    ? "RANKED MATCH POINTS"
                    : pointsFilter === "practice"
                    ? "PRACTICE POINTS"
                    : pointsFilter === "tournament"
                    ? "TOURNAMENT POINTS"
                    : "OVERALL XP"
                })
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="bg-[#0a1118]/80 border-2 border-white/40 p-6 rounded-3xl text-center shadow-xl md:order-1 order-2 flex flex-col items-center backdrop-blur-md">
                  <FaMedal className="text-slate-300 text-4xl mb-2" />
                  <div className="text-xs uppercase font-bold text-slate-400 mb-1 font-mono">Rank #2</div>
                  <h3 className="text-2xl font-black text-white">{top3[1].username}</h3>
                  <div className="mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border border-white/30 text-slate-300 bg-slate-500/10">
                    Contender #2
                  </div>
                  <div className="mt-3 font-mono text-sm font-bold text-orange-400">
                    {getPointsLabel(top3[1])}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">
                    {top3[1].wins} Wins ({top3[1].winRate}%)
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="bg-[#0a1118]/90 border-2 border-white/60 p-8 rounded-3xl text-center shadow-[0_0_40px_rgba(255,255,255,0.15)] md:order-2 order-1 flex flex-col items-center scale-105 z-10 backdrop-blur-md">
                  <FaCrown className="text-yellow-400 text-5xl mb-2 animate-bounce" />
                  <div className="text-xs uppercase font-black text-yellow-400 mb-1 font-mono tracking-widest">
                    👑 Apex Grandmaster
                  </div>
                  <h3 className="text-3xl font-black text-white">{top3[0].username}</h3>
                  <div className="mt-2 px-4 py-1 rounded-full text-xs font-black uppercase border border-white/50 text-yellow-300 bg-yellow-500/20 shadow-md">
                    Champion #1
                  </div>
                  <div className="mt-4 font-mono text-base font-black text-orange-400">
                    {getPointsLabel(top3[0])}
                  </div>
                  <div className="text-xs text-gray-300 font-mono mt-1">
                    {top3[0].wins} Wins ({top3[0].winRate}%)
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="bg-[#0a1118]/80 border-2 border-white/40 p-6 rounded-3xl text-center shadow-xl md:order-3 order-3 flex flex-col items-center backdrop-blur-md">
                  <FaMedal className="text-amber-600 text-4xl mb-2" />
                  <div className="text-xs uppercase font-bold text-amber-500 mb-1 font-mono">Rank #3</div>
                  <h3 className="text-2xl font-black text-white">{top3[2].username}</h3>
                  <div className="mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border border-white/30 text-amber-400 bg-amber-500/10">
                    Contender #3
                  </div>
                  <div className="mt-3 font-mono text-sm font-bold text-orange-400">
                    {getPointsLabel(top3[2])}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">
                    {top3[2].wins} Wins ({top3[2].winRate}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FULL LEADERBOARD TABLE WITH PAGINATION */}
        <div className="bg-[#0a1118]/90 border-2 border-white/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {loading ? (
            <div className="py-20 text-center text-orange-400 font-mono text-sm animate-pulse">
              SYNCING_GLOBAL_LADDER...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-gray-500 font-mono text-sm">
              No combatants found matching query.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/20 text-[11px] uppercase tracking-widest text-gray-300 bg-white/5 font-mono font-bold">
                      <th className="py-4 px-6">Rank</th>
                      <th className="py-4 px-6">Combatant</th>
                      <th className={`py-4 px-6 ${pointsFilter === "all" ? "text-orange-400 font-black" : ""}`}>Overall XP</th>
                      <th className={`py-4 px-6 ${pointsFilter === "practice" ? "text-emerald-400 font-black" : ""}`}>Practice Pts</th>
                      <th className={`py-4 px-6 ${pointsFilter === "ranked" ? "text-amber-400 font-black" : ""}`}>Ranked Pts</th>
                      <th className={`py-4 px-6 ${pointsFilter === "tournament" ? "text-cyan-400 font-black" : ""}`}>Tournament Pts</th>
                      <th className="py-4 px-6 text-right">Wins (Rate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm font-mono">
                    {paginatedUsers.map((u, index) => {
                      const actualRank = startIndex + index + 1;
                      const isCurrent = u.username === currentUsername;
                      return (
                        <tr
                          key={u.id || actualRank}
                          className={`transition-colors hover:bg-white/5 ${
                            isCurrent ? "bg-orange-500/10 font-bold" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border border-white/20 ${
                              actualRank === 1 ? "bg-yellow-500 text-black font-extrabold border-yellow-400" :
                              actualRank === 2 ? "bg-slate-300 text-black border-slate-200" :
                              actualRank === 3 ? "bg-amber-600 text-white border-amber-500" :
                              "text-gray-300 bg-white/5"
                            }`}>
                              {actualRank}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{u.username}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded uppercase font-mono font-bold border border-orange-500/40">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`py-4 px-6 ${pointsFilter === "all" ? "text-orange-400 font-black text-base" : "text-gray-300"}`}>
                            {u.xp || 0} XP
                          </td>
                          <td className={`py-4 px-6 ${pointsFilter === "practice" ? "text-emerald-400 font-black text-base" : "text-emerald-400/80"}`}>
                            {u.practicePoints || 0}
                          </td>
                          <td className={`py-4 px-6 ${pointsFilter === "ranked" ? "text-amber-400 font-black text-base" : "text-amber-400/80"}`}>
                            {u.rankedPoints || 0}
                          </td>
                          <td className={`py-4 px-6 ${pointsFilter === "tournament" ? "text-cyan-400 font-black text-base" : "text-cyan-400/80"}`}>
                            {u.tournamentPoints || 0}
                          </td>
                          <td className="py-4 px-6 text-right text-gray-300">
                            {u.wins} <span className="text-gray-400 text-xs">({u.winRate}%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION BAR */}
              <div className="p-4 bg-black/40 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                <span className="text-gray-400 text-center sm:text-left">
                  Showing <strong className="text-white">{startIndex + 1}</strong> to{" "}
                  <strong className="text-white">{Math.min(startIndex + pageSize, totalItems)}</strong> of{" "}
                  <strong className="text-orange-400">{totalItems}</strong> combatants
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-white/30 hover:border-white bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
                  >
                    <FaChevronLeft size={10} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-gray-600">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-xl border text-xs font-bold transition ${
                              currentPage === page
                                ? "bg-orange-500 text-black border-orange-400 font-black shadow-md"
                                : "bg-white/5 border-white/30 hover:border-white text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-white/30 hover:border-white bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
                  >
                    <span>Next</span>
                    <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
