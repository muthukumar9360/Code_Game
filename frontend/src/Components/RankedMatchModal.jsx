import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaShieldAlt,
  FaBolt,
  FaTimes,
  FaCircleNotch,
  FaCheckCircle,
  FaFlagCheckered,
  FaListOl,
  FaDice
} from "react-icons/fa";

const RankedMatchModal = ({ socket, isOpen, onClose, currentUsername, rankedBattleXp = 0 }) => {
  const navigate = useNavigate();
  const [matchingStatus, setMatchingStatus] = useState("idle"); // 'idle' | 'searching' | 'found'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [matchDetails, setMatchDetails] = useState(null);
  const [problemCount, setProblemCount] = useState(1); // 1, 2, 3, 4, 5 questions

  const currentUserId = localStorage.getItem("userId");

  // Timer for search duration
  useEffect(() => {
    let t = null;
    if (matchingStatus === "searching") {
      t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(t);
  }, [matchingStatus]);

  const [countdown, setCountdown] = useState(5);

  // Socket matchmaking listeners
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data) => {
      setMatchingStatus("found");
      setMatchDetails(data);
      setCountdown(5);
    };

    socket.on("ranked-match-found", handleMatchFound);

    return () => {
      socket.off("ranked-match-found", handleMatchFound);
    };
  }, [socket]);

  // 5-second synchronized countdown before entering battle arena on both sides
  useEffect(() => {
    if (matchingStatus !== "found" || !matchDetails) return;

    if (countdown <= 0) {
      onClose();
      navigate(`/contest/${matchDetails.roomId}`, {
        state: {
          battle: matchDetails.battle,
          isRanked: true,
          opponent: matchDetails.opponent,
          username: currentUsername,
          problemCount: matchDetails.problemCount || problemCount
        }
      });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [matchingStatus, matchDetails, countdown, navigate, onClose, currentUsername, problemCount]);

  if (!isOpen) return null;

  const startMatchmaking = () => {
    setMatchingStatus("searching");
    if (socket) {
      socket.emit("join-ranked-queue", {
        userId: currentUserId,
        username: currentUsername,
        rankedBattleXp: Number(rankedBattleXp) || 0,
        problemCount: Number(problemCount) || 1
      });
    }
  };

  const cancelMatchmaking = () => {
    setMatchingStatus("idle");
    if (socket) {
      socket.emit("leave-ranked-queue");
    }
  };

  const xpNum = Number(rankedBattleXp) || 0;
  const minXp = Math.max(0, xpNum - 150);
  const maxXp = xpNum + 150;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 font-sans select-none animate-in fade-in duration-200">
      <div className={`relative w-full ${matchingStatus === "found" ? "max-w-xl" : "max-w-lg"} bg-[#0a1118]/95 border-2 border-white/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_80px_rgba(249,115,22,0.25)] text-center overflow-hidden transition-all duration-300`}>
        {/* BACKGROUND GLOW */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* CLOSE BUTTON (DISABLED DURING 10S LOCK-IN COUNTDOWN) */}
        {matchingStatus !== "found" && (
          <button
            onClick={() => {
              cancelMatchmaking();
              onClose();
            }}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/30"
          >
            <FaTimes size={14} />
          </button>
        )}

        {matchingStatus === "idle" && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/15 border border-white/40 flex items-center justify-center text-orange-400 text-3xl shadow-[0_0_30px_rgba(249,115,22,0.35)]">
              <FaTrophy />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2 italic">
                FIND YOUR <span className="text-orange-500">RIVAL</span>
              </h2>
            </div>

            {/* RANKED XP TELEMETRY BADGE */}
            <div className="bg-black/60 border border-white/30 p-3.5 rounded-2xl flex items-center justify-around font-mono">
              <div className="text-center">
                <span className="text-[10px] text-gray-500 uppercase block font-bold">Your Ranked Battle XP</span>
                <span className="text-xl font-black text-orange-400">{xpNum} XP</span>
              </div>
              <div className="text-center border-l border-white/20 pl-6">
                <span className="text-[10px] text-gray-500 uppercase block font-bold">Match XP Range</span>
                <span className="text-sm font-bold text-white">
                  {minXp} - {maxXp} XP
                </span>
              </div>
            </div>

            {/* UNIQUE COMBAT PROBLEM QUOTA SELECTOR */}
            <div className="bg-black/50 border border-white/30 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-widest text-gray-200 font-black flex items-center gap-1.5 font-mono">
                  <FaListOl className="text-orange-400" /> Select Battle Length
                </label>
                <span className="text-[11px] font-mono text-orange-400 font-extrabold bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                  {problemCount} Algorithmic Challenge{problemCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { count: 1, label: "1Q", subtitle: "Quick Duel" },
                  { count: 2, label: "2Q", subtitle: "Dual Clash" },
                  { count: 3, label: "3Q", subtitle: "Triad" },
                  { count: 4, label: "4Q", subtitle: "Gauntlet" },
                  { count: 5, label: "5Q", subtitle: "Penta" }
                ].map(({ count, label, subtitle }) => {
                  const isSelected = problemCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setProblemCount(count)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-orange-500 to-amber-500 text-black border-white shadow-[0_0_20px_rgba(249,115,22,0.5)] font-black scale-105"
                          : "bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/50"
                      }`}
                    >
                      <span className={`text-sm font-mono font-black ${isSelected ? "text-black" : "text-orange-400"}`}>{label}</span>
                      <span className={`text-[9px] uppercase tracking-tighter truncate max-w-full font-mono ${isSelected ? "text-black/80 font-bold" : "text-gray-400"}`}>{subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OFFICIAL COMBAT RULES & DIRECTIVES INSTRUCTION BANNER (NOT A SELECTION) */}
            <div className="bg-[#050b10] border border-white/30 rounded-2xl p-4 text-left font-mono space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 pb-2 border-b border-white/20">
                <FaShieldAlt size={12} />
                <span>Combat Directives & Rules</span>
              </div>

              {/* CORE RULE: FIRST TO FINISH WINS */}
              <div className="flex items-start gap-2.5 text-xs text-gray-200">
                <FaFlagCheckered className="text-orange-400 mt-0.5 shrink-0 text-xs" />
                <div>
                  <strong className="text-white uppercase font-bold">First to Finish Wins: </strong>
                  <span>
                    Verdict is determined exclusively by who solves all {problemCount} problem{problemCount > 1 ? "s" : ""} and passes 100% of testcases first.
                  </span>
                </div>
              </div>

              {/* PROFIT & LOSS STAKES */}
              <div className="flex items-start gap-2.5 text-xs text-gray-200">
                <FaBolt className="text-yellow-400 mt-0.5 shrink-0 text-xs" />
                <div>
                  <strong className="text-white uppercase font-bold">Stakes: </strong>
                  <span className="text-green-400 font-bold">+25 XP Profit (Win)</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-red-400 font-bold">-15 XP Loss (Defeat)</span>.
                </div>
              </div>

              {/* RANDOM SELECTION */}
              <div className="flex items-start gap-2.5 text-xs text-gray-200">
                <FaDice className="text-blue-400 mt-0.5 shrink-0 text-xs" />
                <div>
                  <strong className="text-white uppercase font-bold">Random Assignment: </strong>
                  <span>
                    Arena servers randomly allocate {problemCount} algorithmic challenge{problemCount > 1 ? "s" : ""} from the database to both combatants.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={startMatchmaking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 border border-white/40"
            >
              <FaBolt /> Enter Matchmaking Queue ({problemCount}Q)
            </button>
          </div>
        )}

        {matchingStatus === "searching" && (
          <div className="py-8 space-y-6">
            {/* RADAR PULSE SPINNER */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border border-orange-500/40 animate-pulse"></div>
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-400 text-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <FaCircleNotch className="animate-spin text-3xl" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight italic">
                SEARCHING FOR <span className="text-orange-500">LIVE RIVAL...</span>
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Scanning queue for opponents (Nearby Battle XP: {xpNum} ± 150 • {problemCount}Q)
              </p>
              <div className="text-sm font-mono font-bold text-orange-400 mt-2">
                00:{elapsedSeconds.toString().padStart(2, "0")}
              </div>
            </div>

            <button
              onClick={cancelMatchmaking}
              className="px-6 py-2.5 rounded-xl border border-white/30 hover:border-red-500 text-gray-400 hover:text-red-400 font-mono text-xs uppercase tracking-wider transition"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {matchingStatus === "found" && matchDetails && (
          <div className="py-4 space-y-5 animate-in zoom-in-95 duration-300">
            {/* TOP STATUS PILL & COUNTDOWN */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                RIVAL LOCATED • COMBAT IMMINENT
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white italic">
                ARENA INITIALIZING IN <span className="text-orange-500 text-3xl font-mono not-italic font-black animate-pulse">{countdown}s</span>
              </h3>
            </div>

            {/* DUEL CARDS: YOU VS OPPONENT */}
            <div className="grid grid-cols-11 gap-2 items-center bg-black/60 border border-white/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                ></div>
              </div>

              {/* YOU (COMBATANT 1) */}
              <div className="col-span-5 bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/40 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center relative shadow-[0_0_25px_rgba(249,115,22,0.15)]">
                <span className="text-[9px] font-mono uppercase tracking-widest text-orange-400 font-extrabold bg-orange-500/20 px-2 py-0.5 rounded-full mb-2">
                  YOU
                </span>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border-2 border-orange-500/60 flex items-center justify-center text-orange-400 font-black text-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] mb-2 uppercase">
                  {currentUsername?.[0] || "U"}
                </div>
                <div className="font-black text-sm text-white truncate max-w-full">
                  {currentUsername}
                </div>
                <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                  <span className="text-orange-400 font-bold">{xpNum}</span> XP
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <FaCheckCircle size={10} /> READY
                </div>
              </div>

              {/* VS BADGE (CENTER) */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.8)] border-2 border-white scale-110 italic">
                  VS
                </div>
              </div>

              {/* OPPONENT (COMBATANT 2) */}
              <div className="col-span-5 bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center relative shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded-full mb-2">
                  OPPONENT
                </span>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-2 uppercase">
                  {matchDetails.opponent?.username?.[0] || "R"}
                </div>
                <div className="font-black text-sm text-white truncate max-w-full">
                  {matchDetails.opponent?.username || "Combatant"}
                </div>
                <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                  <span className="text-amber-400 font-bold">{matchDetails.opponent?.rankedBattleXp || 0}</span> XP
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <FaCheckCircle size={10} /> LOCKED IN
                </div>
              </div>
            </div>

            {/* BATTLE PROTOCOLS */}
            <div className="bg-[#050b10] border border-white/20 rounded-2xl p-3.5 font-mono text-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FaListOl className="text-orange-400" /> Problem Quota:
                </span>
                <span className="font-bold text-white">
                  {matchDetails.problemCount || problemCount} Challenge{(matchDetails.problemCount || problemCount) > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FaFlagCheckered className="text-orange-400" /> Victory Condition:
                </span>
                <span className="font-bold text-amber-400">
                  First to solve all wins
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FaBolt className="text-yellow-400" /> Match Stakes:
                </span>
                <span className="font-bold text-emerald-400">
                  +25 XP <span className="text-gray-500">/</span> <span className="text-red-400">-15 XP</span>
                </span>
              </div>
            </div>

            {/* FOOTER NOTICE */}
            <div className="text-center font-mono text-[11px] text-gray-400 animate-pulse">
              Synchronizing both combatants on contest node [{matchDetails.roomId}]...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankedMatchModal;
