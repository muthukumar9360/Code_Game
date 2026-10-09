import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaMedal,
  FaBolt,
  FaCheckCircle,
  FaCalendarCheck,
  FaCode,
  FaShieldAlt,
  FaUserNinja,
  FaLayerGroup,
  FaFilter,
  FaGamepad,
  FaHandshake,
  FaClock
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import LeetCodeActivityModule from "../Components/LeetCodeActivityModule.jsx";
import SolvedHistoryViewer from "../Components/SolvedHistoryViewer.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [topicStats, setTopicStats] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState({ solvedProblems: [], recentSubmissions: [] });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeProfileTab, setActiveProfileTab] = useState("overview"); // 'overview' | 'solved' | 'contests'
  const [contestFilter, setContestFilter] = useState("all"); // 'all' | 'ranked' | 'contest' | 'friendly'

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userId) return navigate("/login");

        // Fetch user, battle history, topic progress stats, and submission history concurrently
        const [userRes, historyRes, topicRes, subsRes] = await Promise.allSettled([
          axios.get(`${API}/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/api/battles/my-history`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/api/users/${userId}/topic-progress`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/api/users/${userId}/submissions-history`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (userRes.status === "fulfilled") {
          setUser(userRes.value.data);
        }
        if (historyRes.status === "fulfilled") {
          setHistory(historyRes.value.data.history || []);
        }
        if (topicRes.status === "fulfilled") {
          setTopicStats(topicRes.value.data);
        }
        if (subsRes.status === "fulfilled" && subsRes.value.data?.success) {
          setSubmissionHistory(subsRes.value.data);
        }
      } catch (err) {
        console.error("Profile load failed", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    };

    fetchProfileAndHistory();
  }, [API, navigate, userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b10] text-white">
        Loading profile telemetry...
      </div>
    );
  }

  // Active Days count directly from topic stats or user active days
  const activeDaysCount = topicStats?.activeDaysCount ?? user.activeDays?.length ?? 1;
  const totalDailySolved = topicStats?.totalDailySolved ?? user.dailyChallengeSolvedDates?.length ?? 0;
  const totalSolvedCount = submissionHistory.solvedProblems?.length || 0;
  const battleWinsCount = history.filter((h) => h.result === "win").length;
  const winRate = history.length > 0 ? Math.round((battleWinsCount / history.length) * 100) : 0;

  // Separate XP & Points Breakdown
  const practiceXp = user.practiceXp || 0;
  const rankedBattleXp = user.rankedBattleXp || 0;
  const contestXp = user.contestXp || 0;
  const friendRoomPoints = user.friendRoomPoints || 0;
  const tournamentPoints = user.tournamentPoints || 0;
  const totalXp = user.xp || (practiceXp + rankedBattleXp + contestXp);

  // Separate Match Types: Ranked 1v1, Official Contests, Friendly Exhibitions
  const rankedMatches = history.filter(
    (h) => Boolean(h.isRanked) || (h.roomId && h.roomId.startsWith("RNK"))
  );
  const officialTournaments = history.filter(
    (h) => !rankedMatches.includes(h) && (h.isTournament || h.battleType === "contest" || (h.roomId && (h.roomId.startsWith("TOURN") || h.roomId.startsWith("CONTEST"))) || h.tournamentMode === "real") && h.tournamentMode !== "friendly"
  );
  const friendlyMatches = history.filter(
    (h) => !rankedMatches.includes(h) && !officialTournaments.includes(h)
  );

  const rankedWins = rankedMatches.filter((h) => h.result === "win").length;
  const rankedWinRate = rankedMatches.length > 0 ? Math.round((rankedWins / rankedMatches.length) * 100) : 0;

  const tourneyWins = officialTournaments.filter((h) => h.result === "win").length;
  const tourneyWinRate = officialTournaments.length > 0 ? Math.round((tourneyWins / officialTournaments.length) * 100) : 0;

  const friendlyWins = friendlyMatches.filter((h) => h.result === "win").length;
  const friendlyWinRate = friendlyMatches.length > 0 ? Math.round((friendlyWins / friendlyMatches.length) * 100) : 0;

  const displayedMatches =
    contestFilter === "ranked"
      ? rankedMatches
      : contestFilter === "contest"
      ? officialTournaments
      : contestFilter === "friendly"
      ? friendlyMatches
      : history;

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16">
      <div className="w-full max-w-[99%] mx-auto">
        {/* TOP BAR WITH BACK BUTTON */}
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/" label="Dashboard" />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-xl font-bold transition text-xs uppercase"
          >
            Logout
          </button>
        </div>

        {/* USER PROFILE CARD WITH WHITE BORDER */}
        <div className="bg-[#0a1118] border-2 border-white/40 rounded-3xl p-6 mb-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_25px_rgba(249,115,22,0.35)] shrink-0 border border-white/30">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  {user.username}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-white/30 font-bold">
                  {activeDaysCount} Total Active Days
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/40 border border-white/30 rounded-2xl font-mono text-xs">
              <span className="text-gray-500">Total Solved: </span>
              <strong className="text-white font-bold">{totalSolvedCount} Problems</strong>
            </div>
            <div className="px-4 py-2 bg-black/40 border border-white/30 rounded-2xl font-mono text-xs">
              <span className="text-gray-500">Battle Record: </span>
              <strong className="text-emerald-400 font-bold">{battleWinsCount}W</strong>
              <span className="text-gray-500"> / {history.length} Matches</span>
            </div>
          </div>
        </div>

        {/* DEDICATED SEPARATE XP & POINTS TELEMETRY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <StatCard title="Practice XP" value={`${practiceXp} XP`} highlight="emerald" subtitle="Solo & Daily Challenges" />
          <StatCard title="Ranked Battle XP" value={`${rankedBattleXp} XP`} highlight="orange" subtitle={`Tier: ${user.tier || "Bronze"}`} />
          <StatCard title="Friendly Points" value={`${friendRoomPoints} Pts`} highlight="purple" subtitle="Casual Duel Sparring" />
          <StatCard title="Contest XP" value={`${contestXp} XP`} highlight="cyan" subtitle={`${tournamentPoints} Tourney Pts`} />
          <StatCard title="Total XP" value={`${totalXp} XP`} highlight="yellow" subtitle="Global Progression Rank" />
        </div>

        {/* PROFILE NAVIGATION TABS WITH WHITE BORDER */}
        <div className="flex items-center gap-2 p-1.5 bg-black/60 rounded-2xl mb-8 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveProfileTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeProfileTab === "overview"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaTrophy />
            <span>Overview & Activity</span>
          </button>

          <button
            onClick={() => setActiveProfileTab("solved")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeProfileTab === "solved"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaCode />
            <span>Practice Submissions & Code ({(submissionHistory.recentSubmissions || []).filter(s => !s.isBattle && !s.isDailyChallenge && s.source !== "competitive" && s.source !== "daily").length})</span>
          </button>

          <button
            onClick={() => setActiveProfileTab("contests")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeProfileTab === "contests"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaMedal />
            <span>Competitive Match Archives ({history.length})</span>
          </button>

          <button
            onClick={() => navigate("/contest-management")}
            className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 cursor-pointer"
            title="Manage created contests, edit timings, start, and stop"
          >
            <FaClock />
            <span>Manage Deployed Contests</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CADENCE (LEETCODE DUAL MODULE WITH WHITE BORDER) */}
        {activeProfileTab === "overview" && (
          <LeetCodeActivityModule
            userId={user._id || userId}
            dailySolvedDates={topicStats?.dailyChallengeSolvedDates || user.dailyChallengeSolvedDates || []}
            totalDailySolved={totalDailySolved}
            activeDaysCount={activeDaysCount}
          />
        )}

        {/* TAB 2: PRACTICE QUESTIONS & SUBMISSION CODE HISTORY */}
        {activeProfileTab === "solved" && (
          <div>
            <SolvedHistoryViewer
              solvedProblems={submissionHistory.solvedProblems || []}
              attemptedProblems={submissionHistory.attemptedProblems || []}
              recentSubmissions={submissionHistory.recentSubmissions || []}
              loading={historyLoading}
            />
          </div>
        )}

        {/* TAB 3: SEPARATED MATCHES (RANKED VS FRIENDLY VS CONTEST) */}
        {activeProfileTab === "contests" && (
          <div className="bg-[#0a1118] border-2 border-white/40 rounded-3xl p-6 shadow-2xl">
            {/* CONTESTS HEADER */}
            <div className="mb-6 border-b border-white/20 pb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h2 className="text-xl font-black tracking-widest uppercase text-white flex items-center gap-2">
                  <FaMedal className="text-orange-400" /> Competitive Match & Contest Records
                </h2>
                <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Total Battles: {history.length}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Cleanly separated telemetry for <strong className="text-orange-400">Ranked 1v1</strong>, <strong className="text-purple-400">Friendly Exhibitions</strong>, and <strong className="text-cyan-400">Contest & Tournament Arenas</strong>.
              </p>
            </div>

            {/* THREE PROMINENT DEDICATED TELEMETRY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 1. RANKED 1v1 DETAILS CARD */}
              <div
                onClick={() => setContestFilter("ranked")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  contestFilter === "ranked"
                    ? "bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/20"
                    : "bg-[#050b10] border-orange-500/30 hover:border-orange-500/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase font-black text-orange-400 flex items-center gap-1.5">
                    <FaShieldAlt size={12} /> Ranked 1v1 Details
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 border border-orange-500/40 text-orange-300">
                    Tier: {user.tier || "Bronze"}
                  </span>
                </div>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Ranked Battle XP:</span>
                    <strong className="text-orange-400 font-black text-sm">{rankedBattleXp} XP</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">1v1 Record:</span>
                    <strong className="text-white font-bold">{rankedWins}W / {rankedMatches.length} ({rankedWinRate}%)</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-gray-500 pt-1 border-t border-white/10">
                    <span>Stakes:</span>
                    <span className="text-orange-300/80">+25 Win / -15 Loss</span>
                  </div>
                </div>
              </div>

              {/* 2. FRIENDLY DETAILS CARD */}
              <div
                onClick={() => setContestFilter("friendly")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  contestFilter === "friendly"
                    ? "bg-purple-500/15 border-purple-500 shadow-lg shadow-purple-500/20"
                    : "bg-[#050b10] border-purple-500/30 hover:border-purple-500/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase font-black text-purple-400 flex items-center gap-1.5">
                    <FaHandshake size={12} /> Friendly Match Details
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                    0 XP Risk
                  </span>
                </div>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Friend Room Points:</span>
                    <strong className="text-purple-400 font-black text-sm">{friendRoomPoints} Pts</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Friendly Record:</span>
                    <strong className="text-white font-bold">{friendlyWins}W / {friendlyMatches.length} ({friendlyWinRate}%)</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-gray-500 pt-1 border-t border-white/10">
                    <span>Stakes:</span>
                    <span className="text-purple-300/80">Casual Safe Sparring</span>
                  </div>
                </div>
              </div>

              {/* 3. CONTEST & TOURNAMENT DETAILS CARD */}
              <div
                onClick={() => setContestFilter("contest")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  contestFilter === "contest"
                    ? "bg-cyan-500/15 border-cyan-500 shadow-lg shadow-cyan-500/20"
                    : "bg-[#050b10] border-cyan-500/30 hover:border-cyan-500/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase font-black text-cyan-400 flex items-center gap-1.5">
                    <FaTrophy size={12} /> Contest Arena Details
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                    Tournaments
                  </span>
                </div>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Contest XP / Pts:</span>
                    <strong className="text-cyan-400 font-black text-sm">{contestXp} XP ({tournamentPoints} Pts)</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Contest Record:</span>
                    <strong className="text-white font-bold">{tourneyWins}W / {officialTournaments.length} ({tourneyWinRate}%)</strong>
                  </div>
                  <div className="flex justify-between items-baseline text-[11px] text-gray-500 pt-1 border-t border-white/10">
                    <span>Format:</span>
                    <span className="text-cyan-300/80">Timed Multi-Problem</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR SUB-TABS */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setContestFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer ${
                  contestFilter === "all"
                    ? "bg-white text-black font-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/30"
                }`}
              >
                All Match Archives ({history.length})
              </button>
              <button
                onClick={() => setContestFilter("ranked")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  contestFilter === "ranked"
                    ? "bg-orange-500 text-black font-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-orange-400 hover:text-orange-300 border border-white/30"
                }`}
              >
                <FaShieldAlt size={11} /> ⚔️ Ranked Details ({rankedMatches.length})
              </button>
              <button
                onClick={() => setContestFilter("friendly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  contestFilter === "friendly"
                    ? "bg-purple-500 text-black font-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-purple-400 hover:text-purple-300 border border-white/30"
                }`}
              >
                <FaHandshake size={11} /> 🤝 Friendly Details ({friendlyMatches.length})
              </button>
              <button
                onClick={() => setContestFilter("contest")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                  contestFilter === "contest"
                    ? "bg-cyan-500 text-black font-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 border border-white/30"
                }`}
              >
                <FaTrophy size={11} /> 🏆 Contest Details ({officialTournaments.length})
              </button>
            </div>

            {/* MATCHES LIST */}
            {displayedMatches.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-mono text-xs">
                {contestFilter === "ranked"
                  ? "No 1v1 Live Ranked matches recorded yet. Jump into the ranked queue to earn Ranked Battle XP!"
                  : contestFilter === "contest"
                  ? "No tournament contests recorded yet. Deploy or participate in contest rooms to build your record!"
                  : contestFilter === "friendly"
                  ? "No friendly exhibitions recorded yet. Play casual matches with friends with 0 XP loss risk!"
                  : "No competitive battle matches recorded yet."}
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedMatches.map((battle, i) => {
                  const isRanked = Boolean(battle.isRanked) || (battle.roomId && battle.roomId.startsWith("RNK"));
                  const isOfficial = !isRanked && (battle.isTournament || battle.battleType === "contest" || (battle.roomId && (battle.roomId.startsWith("TOURN") || battle.roomId.startsWith("CONTEST"))) || battle.tournamentMode === "real") && battle.tournamentMode !== "friendly";
                  const isFriendly = !isRanked && !isOfficial;

                  return (
                    <div
                      key={battle.battleId || i}
                      className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-black/40 border-2 p-5 rounded-2xl transition hover:shadow-xl ${
                        isRanked
                          ? "border-orange-500/30 hover:border-orange-500/70"
                          : isFriendly
                          ? "border-purple-500/30 hover:border-purple-500/70"
                          : "border-cyan-500/30 hover:border-cyan-500/70"
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-bold text-white text-base">
                            {battle.problemTitle || "Battle Arena"}
                          </span>

                          {/* CATEGORY BADGE */}
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                              isRanked
                                ? "bg-orange-500/15 text-orange-400 border-orange-500/40"
                                : isFriendly
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                                : "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                            }`}
                          >
                            {isRanked ? "⚔️ Ranked 1v1 (+25/-15 XP)" : isFriendly ? "🤝 Friendly Duel (0 XP Risk)" : "🏆 Contest Arena (+25/-15 XP)"}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 bg-white/5 border border-white/20 uppercase">
                            {battle.battleType}
                          </span>

                          {battle.roomId && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10">
                              Room: {battle.roomId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-mono mt-1.5">
                          <span>Opponents: {battle.opponents?.join(", ") || "Solo Duel"}</span>
                          {battle.duration && (
                            <span className="text-gray-500">Duration: {battle.duration}m</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {new Date(battle.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end shrink-0">
                        <span
                          className={`font-black uppercase text-xs tracking-wider px-3.5 py-1 rounded-full border ${
                            battle.result === "win"
                              ? "bg-green-500/20 text-green-400 border-green-500/40"
                              : battle.result === "lose"
                              ? "bg-red-500/20 text-red-400 border-red-500/40"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                          }`}
                        >
                          {battle.result === "win" ? "🏆 Victory" : battle.result === "lose" ? "Defeat" : battle.result}
                        </span>
                        <p className="text-xs text-gray-300 font-mono mt-1.5 font-bold">
                          Score: {battle.bestScore || 0}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, highlight, subtitle }) => {
  const colorClass =
    highlight === "emerald"
      ? "text-emerald-400"
      : highlight === "cyan"
      ? "text-cyan-400"
      : highlight === "orange"
      ? "text-orange-400"
      : highlight === "yellow"
      ? "text-yellow-400"
      : highlight === "purple"
      ? "text-purple-400"
      : "text-white";

  return (
    <div className="bg-[#0a1118]/90 border-2 border-white/30 rounded-2xl p-4 text-center flex flex-col justify-between shadow-lg">
      <p className="text-white text-[10px] uppercase tracking-widest font-mono font-bold">{title}</p>
      <p className={`text-2xl font-black my-1 font-mono ${colorClass}`}>{value}</p>
      {subtitle && <p className="text-[9px] text-gray-400 font-mono truncate">{subtitle}</p>}
    </div>
  );
};

export default Profile;
