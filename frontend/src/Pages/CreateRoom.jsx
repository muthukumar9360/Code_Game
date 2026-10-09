import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTerminal,
  FaShieldAlt,
  FaRocket,
  FaClock,
  FaListOl,
  FaUserNinja,
  FaEye,
  FaSearch,
  FaCheck,
  FaHourglassHalf,
  FaUsers,
  FaLock,
  FaCode,
  FaBolt,
  FaMedal,
  FaKey,
  FaGlobe
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import { getProblemCanonicalCategories } from "../utils/categoryUtils.js";

const CreateRoom = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [battleType, setBattleType] = useState("1vs1");
  const [tier, setTier] = useState("Bronze");
  const [problemCount, setProblemCount] = useState(1);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isUntimed, setIsUntimed] = useState(false); // No Time Limit (Ends only when winner solves all problems)
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [accessPassword, setAccessPassword] = useState("");
  const [securityMode, setSecurityMode] = useState("open"); // 'open' | 'password'
  const [selectionMode, setSelectionMode] = useState("random"); // 'random' or 'manual'
  const [startMode, setStartMode] = useState("immediate"); // 'immediate' or 'scheduled'
  const [scheduledMinutes, setScheduledMinutes] = useState(5);
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [tournamentMode, setTournamentMode] = useState("real"); // 'real' or 'friendly'
  const [isRanked, setIsRanked] = useState(true);

  // Manual problem selection states
  const [allProblems, setAllProblems] = useState([]);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loadingProblems, setLoadingProblems] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const battleTypes = [
    { value: "1vs1", label: "1v1 DUEL", badge: "2 Players", description: "Head-to-head solo combat", defaultMax: 2 },
    { value: "3-ffa", label: "3-PLAYER SOLO FFA", badge: "3 Players", description: "3 persons free-for-all showdown", defaultMax: 3 },
    { value: "2vs2", label: "2v2 SQUAD MATCH", badge: "4 Players", description: "Opposing counterpart problems", defaultMax: 4 },
    { value: "4-ffa", label: "4-PLAYER SOLO FFA", badge: "4 Players", description: "4 persons tactical solo deathmatch", defaultMax: 4 },
    { value: "4vs4", label: "4v4 WARZONE", badge: "8 Players", description: "Full tactical squad warfare", defaultMax: 8 },
    { value: "contest", label: "OPEN CONTEST ARENA", badge: "N Players", description: "Custom multi-participant contest", defaultMax: 20 }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Adjust max participants & minimum problem count when battleType changes
  useEffect(() => {
    const found = battleTypes.find(b => b.value === battleType);
    if (found) {
      setMaxParticipants(found.defaultMax);
    }
    if (battleType === "contest") {
      setRequiresApproval(true);
    }
    const minProblems = battleType === "2vs2" ? 2 : (battleType === "4vs4" ? 4 : 1);
    if (problemCount < minProblems) {
      setProblemCount(minProblems);
    }
  }, [battleType]);

  // Fetch all problems when manual mode is selected
  useEffect(() => {
    if (selectionMode === "manual" && allProblems.length === 0) {
      setLoadingProblems(true);
      fetch(`${API}/api/problems`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setAllProblems(data.data);
          }
        })
        .catch(err => console.error("Error fetching problems:", err))
        .finally(() => setLoadingProblems(false));
    }
  }, [selectionMode, API, allProblems.length]);

  const toggleSelectProblem = (slug) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter(s => s !== slug));
    } else {
      if (selectedSlugs.length >= problemCount) {
        setSelectedSlugs([...selectedSlugs.slice(1), slug]);
      } else {
        setSelectedSlugs([...selectedSlugs, slug]);
      }
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to create a battle room");
        setLoading(false);
        navigate("/login");
        return;
      }

      const minRequired = battleType === "2vs2" ? 2 : (battleType === "4vs4" ? 4 : 1);
      if (selectionMode === "manual" && selectedSlugs.length < minRequired) {
        setError(`Please select at least ${minRequired} problems for a ${battleType} battle so each squad member has a distinct challenge.`);
        setLoading(false);
        return;
      }

      const scheduledStartTime = startMode === "scheduled"
        ? new Date(Date.now() + scheduledMinutes * 60 * 1000)
        : null;

      const totalDuration = isUntimed ? 0 : Math.max(1, (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0));

      const payload = {
        battleType,
        tier,
        problemCount: Math.max(minRequired, parseInt(problemCount) || minRequired),
        duration: totalDuration,
        isUntimed,
        selectionMode,
        selectedProblemSlugs: selectionMode === "manual" ? selectedSlugs : [],
        startMode,
        scheduledStartTime,
        maxParticipants: parseInt(maxParticipants) || 2,
        isTournament: true,
        tournamentMode,
        isRanked: false,
        requiresApproval: true,
        accessPassword: securityMode === "password" ? accessPassword.trim() || null : null
      };

      const response = await fetch(`${API}/api/battles/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.clear();
        setError("Session expired or invalid token. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const data = await response.json();
      if (data.success) {
        navigate(`/room/${data.battle.roomId}`, {
          state: {
            battle: data.battle,
            isHost: true,
            username: (username || "").trim()
          }
        });
      } else {
        setError(data.error || "Failed to initialize battle server");
      }
    } catch (err) {
      setError("Critical Error: Connection Interrupted");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(allProblems.flatMap(p => getProblemCanonicalCategories(p))))
  ].slice(0, 15);

  const filteredProblems = allProblems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const problemCats = getProblemCanonicalCategories(p);
    const matchesCat = categoryFilter === "All" || problemCats.includes(categoryFilter);
    return matchesSearch && matchesCat;
  });

  const totalCalculatedDuration = Math.max(
    1,
    (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0)
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16">
      {/* GLOBAL BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[550px] h-[550px] bg-orange-600/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      {/* TOP BAR WITH BACK BUTTON (FULL WIDTH MAX-W-[99%]) */}
      <div className="w-full max-w-[99%] mx-auto flex flex-wrap items-center justify-between gap-3 mb-6 z-20">
        <div className="flex items-center gap-3">
          <BackButton to="/" label="Dashboard" />
          <button
            onClick={() => navigate("/contest-management")}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 hover:border-orange-500 text-orange-400 rounded-xl text-xs font-mono font-bold transition shadow-lg cursor-pointer"
            title="View created contests to edit timing, start, or stop"
          >
            <FaClock size={12} />
            <span>Manage Created Contests</span>
          </button>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-gray-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          ARENA PROTOCOL // BTX-DEPLOY
        </span>
      </div>

      {/* HEADER SECTION */}
      <div className="z-10 text-center mb-6 w-full max-w-[99%] mx-auto">
        <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-orange-500/10 border border-orange-500/30 text-orange-400 inline-block mb-2">
          Multiplayer Combat Engineering
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase italic">
          CREATE <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">BATTLE ROOM</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed max-w-3xl mx-auto">
          Configure real-time algorithmic combat parameters, duration cadence, and competitive problem quotas.
        </p>
      </div>

      {/* MAIN FORM CONTAINER (FULL SCREEN WIDTH MAX-W-[99%]) */}
      <div className="z-10 w-full max-w-[99%] mx-auto relative">
        <div className="bg-[#0a1118]/95 backdrop-blur-2xl border-2 border-white/40 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
              <FaShieldAlt className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTOR 1: OPERATOR ALIAS & HOST PARTICIPATION */}
          <div className="bg-black/40 border border-white/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                <FaTerminal />
                <span>Sector 01: Operator Identity & Deployment Role</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Verified Session</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">
                  Host Operator Alias
                </label>
                <div className="h-11 bg-[#050b10] border border-white/30 rounded-xl px-4 flex items-center text-white font-mono text-sm">
                  {username || "Commander"}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">
                  Host Participation Directive
                </label>
                <div className="h-11 px-4 rounded-xl border border-orange-500/50 bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                  <FaUserNinja size={12} />
                  <span>Active Combatant (Host Competitor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTOR 2: BATTLE ENGAGEMENT FORMAT */}
          <div className="bg-black/40 border border-white/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                <FaUsers />
                <span>Sector 02: Combat Engagement Format</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Current: <strong className="text-white uppercase">{battleType}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {battleTypes.map((type) => {
                const isSelected = battleType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBattleType(type.value)}
                    className={`flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-orange-500/20 via-orange-950/30 to-black/60 border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.25)] scale-[1.01]"
                        : "bg-[#050b10] border border-white/30 text-gray-300 hover:border-white hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className={`font-black tracking-tight text-xs uppercase ${isSelected ? "text-white" : "text-gray-200"}`}>
                        {type.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        isSelected
                          ? "bg-orange-500 text-black border-orange-400"
                          : "bg-white/5 border border-white/30 text-gray-300"
                      }`}>
                        {type.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                      {type.description}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* OPEN CONTEST PARTICIPANTS OVERRIDE */}
            {battleType === "contest" && (
              <div className="p-4 bg-orange-500/10 border border-white/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                    Open Contest Participant Capacity (N Players)
                  </label>
                  <p className="text-xs text-gray-300">
                    Specify the maximum player slots authorized for this open tournament arena.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-24 h-10 bg-black/60 border border-white/30 focus:border-white rounded-xl px-3 text-white font-mono text-sm text-center outline-none"
                  />
                  <span className="text-xs text-gray-400 font-mono">Max Slots</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTOR 3: BALANCED DUAL-COLUMN MATCH PARAMETERS (SECTOR 03A & SECTOR 03B FULLY SYMMETRICAL) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* SECTOR 03A: PROBLEM SETS & QUOTA */}
            <div className="bg-black/40 border border-white/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header 03A */}
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <FaCode />
                    <span>Sector 03A: Problem Sets & Quota</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-400 border border-white/30 rounded text-[10px] font-mono font-bold uppercase">
                    {selectionMode === "random" ? "System Automated" : `${selectedSlugs.length}/${problemCount} Selected`}
                  </span>
                </div>

                {/* Row 1: Problem Selection Mode (2-Button Toggle) */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5">
                    Problem Selection Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectionMode("random")}
                      className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        selectionMode === "random"
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                          : "bg-white/5 border border-white/30 text-gray-300 hover:text-white hover:border-white"
                      }`}
                    >
                      <FaCode size={12} />
                      <span>Random Selection</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode("manual")}
                      className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        selectionMode === "manual"
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                          : "bg-white/5 border border-white/30 text-gray-300 hover:text-white hover:border-white"
                      }`}
                    >
                      <FaListOl size={12} />
                      <span>Choose Problem Sets</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Number of Problems with Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5">
                      <FaListOl /> Number of Problems
                    </label>
                    <div className="flex items-center gap-1">
                      {(battleType === "2vs2" ? [2, 3, 4, 6] : battleType === "4vs4" ? [4, 6, 8, 10] : [1, 2, 3, 5]).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setProblemCount(preset);
                            if (selectedSlugs.length > preset) {
                              setSelectedSlugs(selectedSlugs.slice(0, preset));
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                            problemCount === preset
                              ? "bg-orange-500 text-black border-orange-500 font-black"
                              : "bg-white/5 border border-white/30 text-gray-300 hover:border-white hover:text-white"
                          }`}
                        >
                          {preset}Q
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={battleType === "2vs2" ? 2 : (battleType === "4vs4" ? 4 : 1)}
                      max="20"
                      value={problemCount}
                      onChange={(e) => {
                        const minAllowed = battleType === "2vs2" ? 2 : (battleType === "4vs4" ? 4 : 1);
                        const val = e.target.value === "" ? "" : Math.max(minAllowed, parseInt(e.target.value) || minAllowed);
                        setProblemCount(val);
                        if (val !== "" && selectedSlugs.length > val) {
                          setSelectedSlugs(selectedSlugs.slice(0, val));
                        }
                      }}
                      className="w-full h-11 bg-[#050b10] border border-white/30 focus:border-white rounded-xl pl-4 pr-24 text-sm text-white font-mono outline-none transition"
                    />
                    <span className="absolute right-3.5 text-xs text-gray-400 font-mono pointer-events-none">
                      Problem{problemCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  {(battleType === "2vs2" || battleType === "4vs4") && (
                    <span className="text-[10px] text-orange-400 font-mono mt-1.5 block">
                      👥 Squad Directive: At least {battleType === "2vs2" ? "2" : "4"} challenges required so each teammate has a problem to claim.
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Quota Directives Summary Pill */}
              <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-xs text-gray-400 font-mono space-y-1 min-h-[58px] flex flex-col justify-center">
                <div className="flex justify-between items-center">
                  <span>Target Question Quota:</span>
                  <strong className="text-white font-bold">
                    {problemCount} Problem{problemCount > 1 ? "s" : ""} Allocated
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Selection Source Directive:</span>
                  <strong className="text-orange-400 font-bold">
                    {selectionMode === "random" ? "System Automated Random" : "Curated Set Catalog"}
                  </strong>
                </div>
              </div>
            </div>

            {/* SECTOR 03B: DURATION & START DIRECTIVES (MATCHES SECTOR 03A EXACTLY) */}
            <div className="bg-black/40 border border-white/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header 03B */}
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <FaClock />
                    <span>Sector 03B: Duration & Start Directives</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-400 border border-white/30 rounded text-[10px] font-mono font-bold uppercase">
                    {isUntimed ? "♾️ Untimed (Ends on Victory)" : `Total: ${totalCalculatedDuration} Min`}
                  </span>
                </div>

                {/* Row 1: Start Trigger Mode (2-Button Toggle - Matches Row 1 in 03A) */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1.5 flex items-center gap-1.5">
                    <FaHourglassHalf /> Start Trigger Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStartMode("immediate")}
                      className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        startMode === "immediate"
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                          : "bg-white/5 border border-white/30 text-gray-300 hover:text-white hover:border-white"
                      }`}
                    >
                      <FaBolt size={12} />
                      <span>Immediate Launch</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartMode("scheduled")}
                      className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        startMode === "scheduled"
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                          : "bg-white/5 border border-white/30 text-gray-300 hover:text-white hover:border-white"
                      }`}
                    >
                      <FaClock size={12} />
                      <span>Scheduled Start</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Match Duration with Presets (Matches Row 2 in 03A) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5">
                      <FaClock /> Match Duration
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUntimed(true);
                          setDurationHours(0);
                          setDurationMinutes(0);
                        }}
                        className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                          isUntimed
                            ? "bg-purple-500 text-black border-purple-500 font-black shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                            : "bg-white/5 border border-white/30 text-purple-300 hover:border-purple-400"
                        }`}
                      >
                        ♾️ Untimed
                      </button>
                      {[
                        { label: "15m", mins: 15 },
                        { label: "30m", mins: 30 },
                        { label: "1h", mins: 60 },
                        { label: "2h", mins: 120 },
                        { label: "4h", mins: 240 },
                        { label: "12h", mins: 720 },
                        { label: "24h", mins: 1440 },
                        { label: "48h", mins: 2880 },
                        { label: "7 Days", mins: 10080 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setIsUntimed(false);
                            setDurationHours(Math.floor(item.mins / 60));
                            setDurationMinutes(item.mins % 60);
                          }}
                          className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                            !isUntimed && (parseInt(durationHours) || 0) * 60 + (parseInt(durationMinutes) || 0) === item.mins
                              ? "bg-orange-500 text-black border-orange-500 font-black shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                              : "bg-white/5 border border-white/30 text-gray-300 hover:border-white hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UNTIMED TOGGLE CARD */}
                  <div className="mb-2 p-2.5 bg-black/50 border border-white/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">♾️</span>
                      <div>
                        <div className="text-[11px] font-bold text-white uppercase tracking-wider">No Time Limit (Untimed Mode)</div>
                        <div className="text-[9px] text-gray-400 font-mono">Contest runs continuously until winner solves all challenges or forfeits</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUntimed(!isUntimed)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition border cursor-pointer ${
                        isUntimed
                          ? "bg-purple-500 text-black border-purple-400 font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                          : "bg-white/10 text-gray-300 border-white/20 hover:border-white"
                      }`}
                    >
                      {isUntimed ? "ACTIVE ♾️" : "ENABLE"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="0"
                        className="w-full h-11 bg-[#050b10] border border-white/30 focus:border-white rounded-xl pl-3 pr-10 text-sm text-white font-mono outline-none transition"
                      />
                      <span className="absolute right-3 text-xs text-gray-400 font-mono pointer-events-none">hrs</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="30"
                        className="w-full h-11 bg-[#050b10] border border-white/30 focus:border-white rounded-xl pl-3 pr-10 text-sm text-white font-mono outline-none transition"
                      />
                      <span className="absolute right-3 text-xs text-gray-400 font-mono pointer-events-none">min</span>
                    </div>
                  </div>
                  {totalCalculatedDuration >= 1440 && (
                    <span className="text-[10px] text-amber-400 font-mono mt-1.5 block">
                      🔥 Long-Lasting Hackathon Mode: Match will stay active for {Math.floor(totalCalculatedDuration / 1440)} day(s) {Math.floor((totalCalculatedDuration % 1440) / 60)} hr(s).
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Timing Directive Summary Pill (Matches Row 3 in 03A) */}
              <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-xs text-gray-400 font-mono space-y-1 min-h-[58px] flex flex-col justify-center">
                <div className="flex justify-between items-center">
                  <span>Authorized Match Timer:</span>
                  <strong className="text-white font-bold">
                    {totalCalculatedDuration >= 1440
                      ? `${Math.floor(totalCalculatedDuration / 1440)}d ${Math.floor((totalCalculatedDuration % 1440) / 60)}h (${totalCalculatedDuration}m)`
                      : totalCalculatedDuration >= 60
                      ? `${Math.floor(totalCalculatedDuration / 60)}h ${totalCalculatedDuration % 60}m (${totalCalculatedDuration}m)`
                      : `${totalCalculatedDuration} Minutes`}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Protocol Directive:</span>
                  {startMode === "immediate" ? (
                    <strong className="text-orange-400 font-bold">Host Immediate Command</strong>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-orange-400 font-bold">Launch Delay:</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={scheduledMinutes}
                        onChange={(e) => setScheduledMinutes(e.target.value)}
                        className="w-12 h-6 bg-[#050b10] border border-white/30 focus:border-white rounded px-1.5 text-center text-xs text-white font-bold outline-none"
                      />
                      <span className="text-orange-400 font-bold">min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FULL WIDTH EXPANDED PROBLEM CATALOG (WHEN MANUAL MODE IS ACTIVE) */}
          {selectionMode === "manual" && (
            <div className="bg-black/50 border-2 border-white/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <FaListOl className="text-orange-400" />
                  <span className="text-xs uppercase tracking-widest text-white font-bold">
                    Problem Catalog Selection Matrix
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span>Selected: <strong className="text-orange-400 font-bold">{selectedSlugs.length} / {problemCount}</strong></span>
                  <span className="text-gray-400">{problemCount - selectedSlugs.length} needed</span>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative grow">
                  <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search problem title or algorithm tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/30 focus:border-white rounded-xl pl-9 pr-4 text-xs text-white outline-none font-mono"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 bg-black/80 border border-white/30 focus:border-white rounded-xl px-4 text-xs text-white outline-none font-mono shrink-0"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#0a1118]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Problem Cards Grid */}
              {loadingProblems ? (
                <p className="text-xs text-gray-400 animate-pulse text-center py-10 font-mono">
                  FETCHING DATABASE PROBLEMS...
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1 custom-scrollbar">
                  {filteredProblems.slice(0, 60).map((prob) => {
                    const isSelected = selectedSlugs.includes(prob.slug);
                    const diffColor =
                      prob.difficulty === "easy"
                        ? "text-green-400 border-green-500/30"
                        : prob.difficulty === "medium"
                        ? "text-yellow-400 border-yellow-500/30"
                        : "text-red-400 border-red-500/30";

                    return (
                      <div
                        key={prob.slug}
                        onClick={() => toggleSelectProblem(prob.slug)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                          isSelected
                            ? "bg-orange-500/20 border-orange-500 text-white shadow-md"
                            : "bg-[#050b10] border border-white/20 hover:border-white text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-orange-500 border-orange-500 text-black font-bold"
                                : "border-gray-500"
                            }`}
                          >
                            {isSelected && <FaCheck size={9} />}
                          </div>
                          <span className="font-semibold truncate">
                            {prob.title}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0 ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTOR 4: RULE SET & SECURITY KEY (SECTOR 04A & SECTOR 04B FULLY SYMMETRICAL) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* SECTOR 04A: TOURNAMENT RULE SET */}
            <div className="bg-black/40 border border-white/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Header 04A */}
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <FaShieldAlt />
                    <span>Sector 04A: Tournament Rule Set</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-400 border border-white/30 rounded text-[10px] font-mono font-bold uppercase">
                    {tournamentMode === "real" ? "Ranked Stakes" : "Friendly Match"}
                  </span>
                </div>

                {/* Symmetrical Dual Cards 04A */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTournamentMode("real");
                      setIsRanked(true);
                    }}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 ${
                      tournamentMode === "real"
                        ? "bg-orange-500/20 border-orange-500 shadow-md ring-1 ring-orange-500"
                        : "bg-[#050b10] border border-white/30 text-gray-300 hover:border-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Ranked Battle
                        </span>
                        <span className="px-2 py-0.5 bg-orange-500 text-black text-[9px] font-black rounded uppercase">
                          +25 / -15 XP
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Official combat: Win grants <strong className="text-green-400">+25 XP</strong>; Defeat loses <strong className="text-red-400">-15 XP</strong>.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">Competitive Ladder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTournamentMode("friendly");
                      setIsRanked(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 ${
                      tournamentMode === "friendly"
                        ? "bg-green-500/20 border-green-500 shadow-md ring-1 ring-green-500"
                        : "bg-[#050b10] border border-white/30 text-gray-300 hover:border-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Friendly Match
                        </span>
                        <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-black rounded uppercase">
                          0 XP / Safe
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Casual exhibition: <strong className="text-green-300">0 XP gained, 0 XP lost</strong>. Safe for peer sparring & practice.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-green-400 font-bold">Unranked Sparring</span>
                  </button>
                </div>
              </div>

              {/* Directive Summary 04A */}
              <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-xs text-gray-400 font-mono space-y-1 min-h-[58px] flex flex-col justify-center">
                <div className="flex justify-between items-center">
                  <span>Tournament Rule Set:</span>
                  <strong className="text-white font-bold">
                    {tournamentMode === "real" ? "Ranked Battle Stakes" : "Friendly Sparring Match"}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>XP Stakes Protocol:</span>
                  <strong className={tournamentMode === "real" ? "text-orange-400 font-bold" : "text-green-400 font-bold"}>
                    {tournamentMode === "real" ? "+25 XP (Win) / -15 XP (Loss)" : "0 XP Gain / 0 XP Loss (Safe)"}
                  </strong>
                </div>
              </div>
            </div>

            {/* SECTOR 04B: SECURITY KEY & PASSCODE (MATCHES SECTOR 04A EXACTLY) */}
            <div className="bg-black/40 border border-white/30 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Header 04B */}
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <FaLock />
                    <span>Sector 04B: Security Key & Passcode</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-white/30 rounded text-[10px] font-mono font-bold uppercase">
                    {securityMode === "password" ? "Key Protected" : "Optional Gate"}
                  </span>
                </div>

                {/* Symmetrical Dual Cards 04B (Matches Dual Cards in 04A) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityMode("open");
                      setAccessPassword("");
                    }}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 ${
                      securityMode === "open"
                        ? "bg-blue-500/20 border-blue-500 shadow-md ring-1 ring-blue-500"
                        : "bg-[#050b10] border border-white/30 text-gray-300 hover:border-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Open Public
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded uppercase">
                          No Password
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Open entrance: Any combatant with the designated Room ID can enter directly.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 font-bold">Public Combat Arena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSecurityMode("password")}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 ${
                      securityMode === "password"
                        ? "bg-orange-500/20 border-orange-500 shadow-md ring-1 ring-orange-500"
                        : "bg-[#050b10] border border-white/30 text-gray-300 hover:border-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Protected Passcode
                        </span>
                        <span className="px-2 py-0.5 bg-orange-500 text-black text-[9px] font-black rounded uppercase">
                          Passcode Gate
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Corporate & lab exams: Requires an entrance passcode key to enter combat slots.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold">Private Exam / Lab</span>
                  </button>
                </div>
              </div>

              {/* Directive Summary / Passcode Input 04B */}
              <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-xs text-gray-400 font-mono space-y-1 min-h-[58px] flex flex-col justify-center">
                {securityMode === "password" ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold shrink-0">
                      <FaKey size={11} />
                      <span>Passcode:</span>
                    </div>
                    <input
                      type="text"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      placeholder="Enter Required Entrance Passcode..."
                      className="w-full h-8 bg-[#050b10] border border-white/30 focus:border-white rounded-lg px-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Security Gate Protocol:</span>
                      <strong className="text-white font-bold">Open Public Access</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Combat Slot Clearance:</span>
                      <strong className="text-blue-400 font-bold">Direct Entry via Room ID</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* DEPLOY BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="group relative w-full h-14 overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 py-4 rounded-2xl font-black text-black tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {loading ? (
                  "DEPLOYING COMBAT SECTOR..."
                ) : (
                  <>
                    <FaRocket className="text-base animate-pulse" />
                    <span>DEPLOY MULTIPLAYER ROOM</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </button>
          </div>

          {/* SECURITY & PROTOCOL GUARANTEES FOOTER */}
          <div className="pt-4 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
            <div className="flex items-center gap-1.5"><FaShieldAlt className="text-orange-400" /> Anti-Cheat Guard</div>
            <div className="flex items-center gap-1.5"><FaLock className="text-orange-400" /> Tab-Switch Guard</div>
            <div className="flex items-center gap-1.5"><FaClock className="text-orange-400" /> Synchronized Timer</div>
            <div className="flex items-center gap-1.5"><FaMedal className="text-orange-400" /> Post-Match XP Ranks</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateRoom;