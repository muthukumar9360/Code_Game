import React, { useState, useEffect } from "react";
import {
  FaTv,
  FaExpand,
  FaCompress,
  FaUsers,
  FaTrophy,
  FaTerminal,
  FaCode,
  FaCheckCircle,
  FaBolt,
  FaClock,
  FaThLarge,
  FaUserNinja,
  FaCircle
} from "react-icons/fa";
import BackButton from "./BackButton.jsx";

const SpectatorArenaCast = ({
  battle,
  socket,
  contestId,
  onExit
}) => {
  const [combatantStreams, setCombatantStreams] = useState({});
  const [selectedCombatant, setSelectedCombatant] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'spotlight'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'directive'

  // Non-spectator participants
  const competitors = (battle?.participants || []).filter(p => !p.isSpectator);

  useEffect(() => {
    if (!selectedCombatant && competitors.length > 0) {
      setSelectedCombatant(competitors[0].username || competitors[0].user?.username);
    }
  }, [competitors, selectedCombatant]);

  // Listen for real-time telemetry stream from combatants
  useEffect(() => {
    if (!socket) return;

    const handleStreamUpdate = (data) => {
      setCombatantStreams((prev) => ({
        ...prev,
        [data.username]: {
          code: data.code,
          testsPassed: data.testsPassed,
          totalTests: data.totalTests,
          lastActive: data.timestamp || Date.now()
        }
      }));
    };

    socket.on("spectator-stream-received", handleStreamUpdate);

    return () => {
      socket.off("spectator-stream-received", handleStreamUpdate);
    };
  }, [socket]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const currentStream = combatantStreams[selectedCombatant] || {};
  const currentParticipant = competitors.find(
    c => (c.username || c.user?.username) === selectedCombatant
  ) || competitors[0];

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white flex flex-col font-sans select-none">
      {/* ARENA BROADCAST TOP BAR */}
      <header className="px-4 py-3 bg-[#0a1118]/95 border-b border-orange-500/30 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition border border-white/5"
          >
            ← Exit Broadcast
          </button>

          <span className="text-gray-600">|</span>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse">
              <FaTv size={14} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5 font-mono">
                  <FaCircle size={8} className="animate-ping text-red-500" /> LIVE ARENA CAST
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-gray-400">
                  Sector: {battle?.roomId}
                </span>
              </div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">
                {battle?.problem?.title || "Classified Directive"}
              </h1>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          {/* VIEW MODE TOGGLE */}
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-orange-500 text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaThLarge size={11} /> Multi-Grid
            </button>
            <button
              onClick={() => setViewMode("spotlight")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                viewMode === "spotlight"
                  ? "bg-orange-500 text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaUserNinja size={11} /> Spotlight
            </button>
          </div>

          {/* FULLSCREEN BUTTON */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition"
            title="Toggle Big Screen Fullscreen"
          >
            {isFullscreen ? <FaCompress size={13} /> : <FaExpand size={13} />}
          </button>
        </div>
      </header>

      {/* SUB-HEADER TICKER */}
      <div className="bg-black/60 border-b border-white/5 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-orange-400">
            <FaUsers size={12} /> {competitors.length} Active Competitors
          </span>
          <span>•</span>
          <span>Difficulty: {battle?.problem?.difficulty || "Standard"}</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-400 font-bold">
          <span>Tournament Director Feed</span>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-3 overflow-hidden flex gap-3">
        {/* VIEW MODE: MULTI-GRID CAST (SIDE-BY-SIDE ALL COMPETITORS) */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full h-[calc(100vh-120px)] overflow-y-auto">
            {competitors.map((c, idx) => {
              const name = c.username || c.user?.username || `Competitor ${idx + 1}`;
              const stream = combatantStreams[name] || {};
              const isVictor = c.result === "win";
              const passed = stream.testsPassed !== undefined ? stream.testsPassed : c.bestScore || 0;
              const total = stream.totalTests || (battle?.problem?.testcases?.length || 10);

              return (
                <div
                  key={name}
                  className={`bg-[#0a1118] border rounded-2xl flex flex-col overflow-hidden transition-all shadow-xl ${
                    isVictor
                      ? "border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                      : "border-white/10"
                  }`}
                >
                  {/* COMPETITOR CARD HEADER */}
                  <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isVictor
                          ? "bg-yellow-400 animate-bounce"
                          : stream.lastActive && Date.now() - stream.lastActive < 4000
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-500"
                      }`} />
                      <span className="font-bold text-sm text-white">{name}</span>
                      {c.team && c.team !== "solo" && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          c.team === "A" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                        }`}>
                          Team {c.team}
                        </span>
                      )}
                      {isVictor && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <FaTrophy size={10} /> Victor
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-orange-400">
                        {passed}/{total} Passed
                      </span>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-white/5 h-1.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isVictor ? "bg-yellow-400" : "bg-gradient-to-r from-orange-500 to-green-500"
                      }`}
                      style={{ width: `${total > 0 ? (passed / total) * 100 : 0}%` }}
                    />
                  </div>

                  {/* CODE STREAM BUFFER */}
                  <div className="flex-1 p-3 bg-[#050b10] overflow-y-auto font-mono text-xs text-gray-300 select-text max-h-[350px]">
                    {stream.code ? (
                      stream.code.split("\n").map((line, lIdx) => (
                        <div key={lIdx} className="flex items-start hover:bg-white/5 py-0.5">
                          <span className="w-8 select-none text-[10px] text-gray-600 text-right pr-2">
                            {lIdx + 1}
                          </span>
                          <pre className="font-mono whitespace-pre flex-1 text-gray-300">{line || " "}</pre>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-600 text-xs italic font-mono pt-16">
                        Awaiting initial keystrokes...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW MODE: SPOTLIGHT FOCUS */
          <div className="flex-1 flex gap-3 h-[calc(100vh-120px)] overflow-hidden">
            {/* COMPETITOR ROSTER SIDEBAR */}
            <div className="w-72 bg-[#0a1118] border border-white/10 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                Select Featured Competitor
              </span>
              {competitors.map((c) => {
                const name = c.username || c.user?.username;
                const isSelected = name === selectedCombatant;
                const stream = combatantStreams[name] || {};
                const passed = stream.testsPassed !== undefined ? stream.testsPassed : c.bestScore || 0;

                return (
                  <button
                    key={name}
                    onClick={() => setSelectedCombatant(name)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-orange-500/15 border-orange-500 text-white shadow-lg"
                        : "bg-black/30 border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {name}
                        {c.result === "win" && <FaTrophy className="text-yellow-400" size={10} />}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                        {c.team && c.team !== "solo" ? `Team ${c.team}` : "Solo"}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-orange-400">
                      {passed} pts
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SPOTLIGHT LARGE EDITOR VIEW */}
            <div className="flex-1 bg-[#0a1118] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-white">
                    {selectedCombatant} — Live Code Feed
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                    Stream Active
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  Tests: {currentStream.testsPassed || 0} / {currentStream.totalTests || 10}
                </div>
              </div>

              <div className="flex-1 p-4 bg-[#050b10] overflow-y-auto font-mono text-xs text-gray-200 select-text leading-relaxed">
                {currentStream.code ? (
                  currentStream.code.split("\n").map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start hover:bg-white/5 py-0.5 px-2 rounded">
                      <span className="w-10 select-none text-[10px] text-gray-600 text-right pr-4">
                        {lIdx + 1}
                      </span>
                      <pre className="font-mono whitespace-pre flex-1 text-gray-200">{line || " "}</pre>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 text-sm italic font-mono">
                    Competitor is compiling initial draft...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpectatorArenaCast;
