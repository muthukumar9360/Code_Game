import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaClock,
  FaPlay,
  FaStop,
  FaSlidersH,
  FaUsers,
  FaLock,
  FaUnlock,
  FaCalendarAlt,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaTrophy,
  FaHandshake
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";

const ContestManager = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'waiting' | 'active' | 'finished'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'point' | 'friendly'
  const [viewScope, setViewScope] = useState("mine"); // 'mine' | 'created' | 'participated' | 'all' (defaults to user's contests only)
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editingContest, setEditingContest] = useState(null);
  const [editDurationHours, setEditDurationHours] = useState(0);
  const [editDurationMinutes, setEditDurationMinutes] = useState(30);
  const [editScheduledStart, setEditScheduledStart] = useState("");
  const [editScheduledEnd, setEditScheduledEnd] = useState("");
  const [editRequiresApproval, setEditRequiresApproval] = useState(true);
  const [editPassword, setEditPassword] = useState("");
  const [editTier, setEditTier] = useState("Bronze");
  const [editProblemCount, setEditProblemCount] = useState(1);
  const [savingSettings, setSavingSettings] = useState(false);

  // Action Loading tracking (battleId -> boolean)
  const [actionLoading, setActionLoading] = useState({});

  const fetchContests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API}/api/battles/created-contests?all=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setContests(res.data.contests || []);
      }
    } catch (err) {
      console.error("Fetch contests error:", err);
      setError(err.response?.data?.error || "Failed to retrieve contests.");
    } finally {
      setLoading(false);
    }
  }, [API, navigate]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(""), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  // Start Contest handler
  const handleStartContest = async (battleId, force = true) => {
    try {
      const token = localStorage.getItem("token");
      setActionLoading(prev => ({ ...prev, [battleId]: "starting" }));

      const res = await axios.post(
        `${API}/api/battles/start/${battleId}?force=${force}&admin=true`,
        { force: true, admin: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showNotification("🚀 Contest launched into active combat arena!");
        fetchContests();
      }
    } catch (err) {
      console.error("Start contest error:", err);
      showNotification(err.response?.data?.error || "Failed to start contest.", true);
    } finally {
      setActionLoading(prev => ({ ...prev, [battleId]: false }));
    }
  };

  // Stop Contest handler
  const handleStopContest = async (battleId) => {
    if (!window.confirm("Are you sure you want to STOP this contest? Current scores will be finalized.")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      setActionLoading(prev => ({ ...prev, [battleId]: "stopping" }));

      const res = await axios.post(
        `${API}/api/battles/${battleId}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showNotification("⏹️ Contest stopped successfully. Telemetry finalized.");
        fetchContests();
      }
    } catch (err) {
      console.error("Stop contest error:", err);
      showNotification(err.response?.data?.error || "Failed to stop contest.", true);
    } finally {
      setActionLoading(prev => ({ ...prev, [battleId]: false }));
    }
  };

  // Open Edit Settings Modal
  const openEditModal = (c) => {
    if (!c || c.status === "finished") {
      showNotification("Finished contests cannot be edited. Contest standings and timings are permanently locked.", true);
      return;
    }
    setEditingContest(c);
    const dur = c.duration || 30;
    setEditDurationHours(Math.floor(dur / 60));
    setEditDurationMinutes(dur % 60);

    const formatForInput = (dStr) => {
      if (!dStr) return "";
      try {
        const d = new Date(dStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch (e) {
        return "";
      }
    };

    setEditScheduledStart(formatForInput(c.scheduledStartTime));
    setEditScheduledEnd(formatForInput(c.scheduledEndTime));
    setEditRequiresApproval(Boolean(c.requiresApproval));
    setEditPassword(c.accessPassword || "");
    setEditTier(c.tier || "Bronze");
    setEditProblemCount(c.problemCount || 1);
  };

  // Save Contest Settings handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editingContest) return;

    try {
      setSavingSettings(true);
      const token = localStorage.getItem("token");
      const totalMinutes = Math.max(1, (parseInt(editDurationHours) || 0) * 60 + (parseInt(editDurationMinutes) || 0));

      const payload = {
        duration: totalMinutes,
        scheduledStartTime: editScheduledStart ? new Date(editScheduledStart).toISOString() : null,
        scheduledEndTime: editScheduledEnd ? new Date(editScheduledEnd).toISOString() : null,
        requiresApproval: editRequiresApproval,
        accessPassword: editPassword.trim() || null,
        tier: editTier,
        problemCount: Math.max(1, parseInt(editProblemCount) || 1)
      };

      const res = await axios.put(
        `${API}/api/battles/${editingContest.battleId || editingContest.id}/settings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showNotification("✅ Contest timing and parameters successfully updated live!");
        setEditingContest(null);
        fetchContests();
      }
    } catch (err) {
      console.error("Save settings error:", err);
      showNotification(err.response?.data?.error || "Failed to update contest settings.", true);
    } finally {
      setSavingSettings(false);
    }
  };

  // Quick Extend Duration (by 15m, 30m, 1h) while active
  const handleQuickExtend = async (contest, addMinutes) => {
    try {
      const token = localStorage.getItem("token");
      const newDuration = (contest.duration || 30) + addMinutes;
      setActionLoading(prev => ({ ...prev, [contest.id]: "extending" }));

      const res = await axios.put(
        `${API}/api/battles/${contest.battleId || contest.id}/settings`,
        { duration: newDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showNotification(`⏱️ Extended contest duration by +${addMinutes} minutes (Now: ${newDuration}m)!`);
        fetchContests();
      }
    } catch (err) {
      console.error("Extend error:", err);
      showNotification(err.response?.data?.error || "Failed to extend contest duration.", true);
    } finally {
      setActionLoading(prev => ({ ...prev, [contest.id]: false }));
    }
  };

  const filteredContests = contests.filter((c) => {
    // 1. Status Filter
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;

    // 2. Contest Type Filter (Friendly vs Point / Ranked)
    const isFriendly = c.tournamentMode === "friendly";
    const isPoint = c.tournamentMode === "real" || Boolean(c.isRanked) || (!isFriendly && (c.isTournament || c.battleType === "contest"));
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "point" && isPoint) ||
      (typeFilter === "friendly" && isFriendly);

    // 3. Scope Filter (My Contests vs My Created vs Participated vs All)
    const matchesScope =
      viewScope === "mine"
        ? Boolean(c.isHost || c.isParticipant)
        : viewScope === "created"
        ? Boolean(c.isHost)
        : viewScope === "participated"
        ? Boolean(c.isParticipant)
        : true;

    // 4. Search Filter
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      c.roomId?.toLowerCase().includes(term) ||
      c.battleType?.toLowerCase().includes(term) ||
      c.problem?.title?.toLowerCase().includes(term);

    return matchesStatus && matchesType && matchesScope && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-3 sm:px-6 md:px-8 py-6 pb-20">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[550px] h-[550px] bg-orange-600/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      {/* TOP BAR */}
      <div className="w-full max-w-[99%] mx-auto flex flex-wrap items-center justify-between gap-3 mb-6 z-20">
        <div className="flex items-center gap-3">
          <BackButton to="/" label="Dashboard" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContests}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-xs font-mono transition text-gray-300 hover:text-white cursor-pointer"
            title="Refresh Contests"
          >
            <FaSync className={loading ? "animate-spin" : ""} size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="z-10 text-center mb-6 w-full max-w-[99%] mx-auto">
        <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/30 text-orange-400 inline-block mb-2">
          HackerRank-Grade Contest Command Center
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase italic">
          CONTEST <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">MANAGEMENT & TIMING</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed max-w-3xl mx-auto">
          Monitor your deployed and joined arenas, adjust live match durations, calibrate scheduled launch timings, and start or stop contests on demand.
        </p>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="z-20 w-full max-w-4xl mx-auto mb-4 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
          <FaShieldAlt className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="z-20 w-full max-w-4xl mx-auto mb-4 bg-green-500/10 border border-green-500/40 text-green-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <FaCheckCircle className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* CONTROLS & FILTER BAR */}
      <div className="z-10 w-full max-w-[99%] mx-auto bg-[#0a1118]/90 border border-white/20 rounded-2xl p-4 mb-6 shadow-xl flex flex-col gap-4">
        {/* ROW 1: STATUS FILTERS & CONTEST TYPE FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-gray-500 font-bold mr-1">Status:</span>
            {[
              { id: "all", label: "All Contests" },
              { id: "waiting", label: "⏳ Waiting / Scheduled" },
              { id: "active", label: "🟢 Active (Running)" },
              { id: "finished", label: "🏁 Finished" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-orange-500 text-black border-orange-500 font-black shadow-lg shadow-orange-500/20"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTEST TYPE FILTER PILLS (FRIENDLY VS POINT) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-gray-500 font-bold mr-1">Mode:</span>
            {[
              { id: "all", label: "All Modes" },
              { id: "point", label: "🏆 Point Contests (Real / XP)", icon: FaTrophy },
              { id: "friendly", label: "🤝 Friendly Contests (0 XP)", icon: FaHandshake }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                  typeFilter === tab.id
                    ? tab.id === "friendly"
                      ? "bg-purple-500 text-black border-purple-500 font-black shadow-lg shadow-purple-500/20"
                      : tab.id === "point"
                      ? "bg-amber-500 text-black border-amber-500 font-black shadow-lg shadow-amber-500/20"
                      : "bg-white text-black border-white font-black shadow-lg"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 2: SEARCH & SCOPE (ALL / MY CREATED / PARTICIPATED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setViewScope("mine")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewScope === "mine" ? "bg-orange-500/30 text-orange-300 border border-orange-500/40 font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              👑 My Contests
            </button>
            <button
              onClick={() => setViewScope("created")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewScope === "created" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              🛠️ Created by Me
            </button>
            <button
              onClick={() => setViewScope("participated")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewScope === "participated" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              🎮 Participated
            </button>
            <button
              onClick={() => setViewScope("all")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                viewScope === "all" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              🌐 All Platform Contests
            </button>
          </div>

          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-500 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Search room ID, type, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border border-white/20 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 outline-none focus:border-orange-500 w-52 sm:w-72"
            />
          </div>
        </div>
      </div>

      {/* CONTESTS GRID */}
      <div className="z-10 w-full max-w-[99%] mx-auto">
        {loading ? (
          <div className="p-16 text-center font-mono text-gray-400 animate-pulse text-sm">
            📡 Scanning neural nodes for deployed contest rooms...
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="bg-[#0a1118]/80 border border-white/20 rounded-2xl p-12 text-center text-gray-400 font-mono text-xs space-y-3">
            <FaClock size={28} className="mx-auto text-orange-400/60" />
            <p>No contest arenas matching current filters.</p>
            <button
              onClick={() => navigate("/create-room")}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <FaPlus /> Deploy First Contest Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContests.map((c) => {
              const isWaiting = c.status === "waiting";
              const isActive = c.status === "active";
              const isFinished = c.status === "finished";

              const durationMins = c.duration || 30;
              const durationFormatted =
                durationMins >= 1440
                  ? `${Math.floor(durationMins / 1440)}d ${Math.floor((durationMins % 1440) / 60)}h`
                  : durationMins >= 60
                  ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                  : `${durationMins}m`;

              return (
                <div
                  key={c.id || c.battleId}
                  className={`bg-[#0a1118]/95 border-2 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xl hover:shadow-2xl relative ${
                    isActive
                      ? "border-emerald-500/60 shadow-emerald-500/10"
                      : isWaiting
                      ? "border-amber-500/40 hover:border-amber-500/80"
                      : "border-white/20 opacity-80"
                  }`}
                >
                  {/* TOP CARD BAR */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-white tracking-wider">
                          ROOM: <span className="text-orange-400">{c.roomId}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/10 border border-white/20 text-gray-300">
                          {c.battleType}
                        </span>

                        {/* MODE BADGE (POINT VS FRIENDLY) */}
                        {c.tournamentMode === "friendly" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 border border-purple-500/40 text-purple-300">
                            🤝 Friendly
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/40 text-amber-300">
                            🏆 Point Match
                          </span>
                        )}

                        {/* ROLE BADGE */}
                        {c.isHost ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/15 border border-orange-500/40 text-orange-300">
                            👑 Host
                          </span>
                        ) : c.isParticipant ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                            🎮 Joined
                          </span>
                        ) : null}
                      </div>

                      {/* STATUS BADGE */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border shrink-0 ${
                          isActive
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 animate-pulse"
                            : isWaiting
                            ? "bg-amber-500/15 border-amber-500 text-amber-400"
                            : "bg-gray-500/20 border-gray-500 text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-400" : isWaiting ? "bg-amber-400" : "bg-gray-400"
                          }`}
                        ></span>
                        {c.status}
                      </span>
                    </div>

                    {/* STATS & TIMINGS */}
                    <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                      <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">Duration Cadence</span>
                        <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                          <FaClock className="text-orange-400 text-xs" />
                          {durationFormatted} ({durationMins}m)
                        </span>
                        {durationMins >= 1440 && (
                          <span className="text-[9px] text-amber-400 block mt-0.5 font-bold">Multi-day Hackathon</span>
                        )}
                      </div>

                      <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">Participants</span>
                        <span className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                          <FaUsers className="text-blue-400 text-xs" />
                          {c.approvedCount || 0} / {c.maxParticipants || 2} Approved
                        </span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          {c.participantCount || 0} Connected
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">Problem Quota</span>
                        <span className="font-bold text-orange-300 text-xs block mt-0.5">
                          {c.problemCount || 1} Challenge{c.problemCount > 1 ? "s" : ""}
                        </span>
                        <span className="text-[9px] text-gray-400 capitalize block">
                          Tier: {c.tier || "Bronze"}
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">Access Security</span>
                        <span className="font-bold text-xs block mt-0.5 flex items-center gap-1 text-gray-200">
                          {c.accessPassword ? (
                            <>
                              <FaLock className="text-amber-400 text-[10px]" /> Key: {c.accessPassword}
                            </>
                          ) : (
                            <>
                              <FaUnlock className="text-emerald-400 text-[10px]" /> Public Open
                            </>
                          )}
                        </span>
                        <span className="text-[9px] text-gray-400 block">
                          {c.requiresApproval ? "Approval Required" : "Auto-Join"}
                        </span>
                      </div>
                    </div>

                    {/* SCHEDULED DATES */}
                    {c.scheduledStartTime && (
                      <div className="mb-3 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] font-mono text-purple-300 flex items-center gap-2">
                        <FaCalendarAlt size={10} />
                        <span>Scheduled: {new Date(c.scheduledStartTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* ACTION CONTROLS (HACKERRANK STYLE) */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    {/* QUICK EXTEND BUTTONS FOR ACTIVE CONTESTS */}
                    {isActive && (
                      <div className="flex items-center justify-between gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] font-mono">
                        <span className="text-emerald-400 font-bold">Extend Live Time:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: "+15m", mins: 15 },
                            { label: "+30m", mins: 30 },
                            { label: "+1h", mins: 60 }
                          ].map((b) => (
                            <button
                              key={b.label}
                              onClick={() => handleQuickExtend(c, b.mins)}
                              disabled={actionLoading[c.id]}
                              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MAIN BUTTONS */}
                    {isFinished ? (
                      /* FINISHED CONTEST: ONLY VIEW RESULTS (NO EDIT OPTION) */
                      <button
                        onClick={() => navigate(`/results/${c.roomId}`)}
                        className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        View Results & Final Standings 🏆
                      </button>
                    ) : (
                      /* ACTIVE OR WAITING CONTEST: ALLOW START/STOP AND EDIT TIMING */
                      <div className="grid grid-cols-2 gap-2">
                        {/* START / STOP BUTTON */}
                        {isWaiting ? (
                          <button
                            onClick={() => handleStartContest(c.battleId || c.id, true)}
                            disabled={actionLoading[c.battleId || c.id]}
                            className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Start this contest immediately with present participants"
                          >
                            <FaPlay size={10} /> Start Contest
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStopContest(c.battleId || c.id)}
                            disabled={actionLoading[c.battleId || c.id]}
                            className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Stop contest immediately and finalize results"
                          >
                            <FaStop size={10} /> Stop Contest
                          </button>
                        )}

                        {/* EDIT SETTINGS & TIMING BUTTON - ONLY FOR ACTIVE / WAITING (NEVER FOR FINISHED) */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="py-2.5 px-3 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Edit contest duration, timing, and parameters"
                        >
                          <FaSlidersH size={11} /> Edit Timing
                        </button>
                      </div>
                    )}

                    {/* JUMP TO ARENA LINK */}
                    <button
                      onClick={() => {
                        if (isActive) {
                          navigate(`/contest/${c.roomId}`);
                        } else {
                          navigate(`/room/${c.roomId}`);
                        }
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white rounded-xl text-[11px] font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FaExternalLinkAlt size={10} /> Enter {isActive ? "Combat Arena" : "Lobby Command"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT CONTEST SETTINGS & TIMING MODAL */}
      {editingContest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1118] border-2 border-orange-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 my-8">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest font-bold block">
                  HackerRank Arena Configurator
                </span>
                <h3 className="text-xl font-black text-white uppercase italic">
                  Edit Contest Settings // <span className="text-orange-400">{editingContest.roomId}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingContest(null)}
                className="text-gray-400 hover:text-white p-1 transition"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* DURATION CADENCE */}
              <div>
                <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1.5 flex items-center gap-1.5">
                  <FaClock className="text-orange-400" /> Contest Duration
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="168"
                      value={editDurationHours}
                      onChange={(e) => setEditDurationHours(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl pl-3 pr-10 text-xs text-white font-mono outline-none"
                    />
                    <span className="absolute right-3 text-[10px] text-gray-400 font-mono pointer-events-none">hrs</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editDurationMinutes}
                      onChange={(e) => setEditDurationMinutes(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="30"
                      className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl pl-3 pr-10 text-xs text-white font-mono outline-none"
                    />
                    <span className="absolute right-3 text-[10px] text-gray-400 font-mono pointer-events-none">min</span>
                  </div>
                </div>

                {/* QUICK PRESET BUTTONS */}
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: "30m", h: 0, m: 30 },
                    { label: "1h", h: 1, m: 0 },
                    { label: "2h", h: 2, m: 0 },
                    { label: "4h", h: 4, m: 0 },
                    { label: "12h", h: 12, m: 0 },
                    { label: "24h", h: 24, m: 0 },
                    { label: "48h", h: 48, m: 0 },
                    { label: "7 Days", h: 168, m: 0 }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setEditDurationHours(p.h);
                        setEditDurationMinutes(p.m);
                      }}
                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/20 text-gray-300 hover:text-white rounded text-[10px] font-mono"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SCHEDULED START TIME */}
              <div>
                <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-purple-400" /> Scheduled Start Time
                </label>
                <input
                  type="datetime-local"
                  value={editScheduledStart}
                  onChange={(e) => setEditScheduledStart(e.target.value)}
                  className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                />
                <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                  Leave empty for immediate / on-demand launch.
                </span>
              </div>

              {/* SECURITY & APPROVAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1 flex items-center gap-1.5">
                    <FaLock className="text-amber-400" /> Access Password
                  </label>
                  <input
                    type="text"
                    placeholder="None (Public)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1 flex items-center gap-1.5">
                    <FaShieldAlt className="text-blue-400" /> Host Approval
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditRequiresApproval(!editRequiresApproval)}
                    className={`w-full h-10 rounded-xl text-xs font-mono font-bold border transition ${
                      editRequiresApproval
                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : "bg-white/5 border-white/20 text-gray-400"
                    }`}
                  >
                    {editRequiresApproval ? "Required (Vetted)" : "Disabled (Instant Join)"}
                  </button>
                </div>
              </div>

              {/* TIER & PROBLEM QUOTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1">
                    Arena Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl px-2.5 text-xs text-white font-mono outline-none"
                  >
                    {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((t) => (
                      <option key={t} value={t} className="bg-[#050b10] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-gray-300 font-bold block mb-1">
                    Problem Quota
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editProblemCount}
                    onChange={(e) => setEditProblemCount(e.target.value)}
                    className="w-full h-10 bg-[#050b10] border border-white/30 focus:border-orange-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingContest(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FaSave /> {savingSettings ? "Updating Live..." : "Save & Apply Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestManager;
