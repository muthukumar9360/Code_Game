import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaTrophy,
  FaTimesCircle,
  FaCheckCircle,
  FaMedal,
  FaBolt,
  FaRedo,
  FaHome,
  FaListOl,
  FaClock,
  FaShieldAlt
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import CodeDiffViewer from "../Components/CodeDiffViewer.jsx";
import HackathonReportModal from "../Components/HackathonReportModal.jsx";

const ResultPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  const currentUserId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${API}/api/battles/${contestId}/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data.battle) {
          setBattle(res.data.battle);
        } else {
          setError("Contest summary could not be retrieved.");
        }
      } catch (err) {
        console.error("Failed to load contest summary:", err);
        setError("Error connecting to results server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [contestId, API, navigate]);

  // Enrich participants with live opponent draft code if backend code is empty
  const enrichedParticipants = useMemo(() => {
    if (!battle?.participants) return [];
    const copy = JSON.parse(JSON.stringify(battle.participants));
    const draftMap = location.state?.opponentDraftCode || {};

    return copy.map(p => {
      const draft = draftMap[p.username];
      if (draft && (!p.code || !p.code.trim())) {
        p.code = draft;
      }
      if (p.submissions && Array.isArray(p.submissions)) {
        p.submissions = p.submissions.map((sub) => {
          if ((!sub.code || !sub.code.trim()) && draft) {
            return { ...sub, code: draft };
          }
          return sub;
        });
      }
      return p;
    });
  }, [battle?.participants, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-orange-400 font-mono tracking-widest text-sm uppercase animate-pulse">
          COMPUTING_MISSION_TELEMETRY...
        </h2>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center text-white font-sans p-6 text-center">
        <FaTimesCircle className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Telemetry Error</h2>
        <p className="text-gray-400 text-sm mb-6">{error || "Battle not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest transition"
        >
          Return to Base
        </button>
      </div>
    );
  }

  const myRecord = enrichedParticipants.find(
    p => (p.userId && p.userId.toString() === currentUserId) || p.username === currentUsername
  );

  const isWinner = myRecord?.result === "win";
  const isDraw = myRecord?.result === "draw";
  const winner = enrichedParticipants.find(p => p.result === "win");

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white flex flex-col items-center justify-start px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16 relative font-sans">
      {/* BACKGROUND GLOWS */}
      <div className={`fixed top-[-15%] ${isWinner ? 'bg-green-500/15' : 'bg-red-500/15'} w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none`}></div>
      <div className="fixed bottom-[-15%] bg-orange-500/10 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none"></div>

      {/* TOP BAR WITH BACK BUTTON */}
      <div className="w-full max-w-[99%] mx-auto flex items-center justify-between mb-6 z-20">
        <BackButton to="/" label="Dashboard" />
        <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
          ARENA POST-MATCH REVIEW
        </span>
      </div>

      <div className="z-10 w-full max-w-[99%] mx-auto">
        {/* BANNER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-black/40 border border-white/30 shadow-2xl mb-4">
            {isWinner ? (
              <FaTrophy className="text-yellow-400 text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
            ) : isDraw ? (
              <FaMedal className="text-blue-400 text-6xl drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
            ) : (
              <FaTimesCircle className="text-red-500 text-6xl drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic">
            {isWinner ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-green-400">
                VICTORY ACHIEVED
              </span>
            ) : isDraw ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">
                STALEMATE // DRAW
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                MISSION FAILED
              </span>
            )}
          </h1>
          <p className="text-gray-300 text-xs font-mono uppercase tracking-[0.3em] mt-2 font-medium">
            Contest #{battle.roomId} — Sector: {battle.problem?.title || "Classified Problem"}
          </p>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0a1118]/80 border border-white/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl text-xl border border-white/20">
              <FaBolt />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">XP Earned</div>
              <div className="text-xl font-black text-orange-400 font-mono">
                {isWinner ? "+100 XP" : isDraw ? "+50 XP" : "+20 XP"}
              </div>
            </div>
          </div>

          <div className="bg-[#0a1118]/80 border border-white/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl text-xl border border-white/20">
              <FaCheckCircle />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Tests Passed</div>
              <div className="text-xl font-black text-blue-400 font-mono">
                {myRecord?.bestScore || 0}
              </div>
            </div>
          </div>

          <div className="bg-[#0a1118]/80 border border-white/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl text-xl border border-white/20">
              <FaTrophy />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Match Outcome</div>
              <div className="text-xl font-black text-orange-400 font-mono uppercase">
                {myRecord?.result === "win" ? "+25 XP Victory" : myRecord?.result === "loss" ? "-15 XP Defeat" : "Match Concluded"}
              </div>
            </div>
          </div>
        </div>

        {/* COMBATANTS SCOREBOARD */}
        <div className="bg-[#0a1118]/90 backdrop-blur-2xl border-2 border-white/40 rounded-3xl p-6 shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Combatant Standings
            </h3>
            <span className="text-[10px] font-mono text-gray-300 uppercase">
              Mode: {battle.battleType}
            </span>
          </div>

          <div className="space-y-3">
            {enrichedParticipants.map((p, idx) => {
              const isParticipantWinner = p.result === "win";
              const isCurrentUser = (p.userId && p.userId.toString() === currentUserId) || p.username === currentUsername;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isParticipantWinner
                      ? "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                      : "bg-white/5 border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border border-white/20 ${
                      isParticipantWinner ? "bg-yellow-500 text-black shadow-md border-yellow-400" : "bg-white/10 text-gray-300"
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {p.username || "Combatant"}
                        {isCurrentUser && (
                          <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-orange-500/40">
                            You
                          </span>
                        )}
                        {isParticipantWinner && (
                          <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono uppercase flex items-center gap-1 border border-yellow-500/40">
                            <FaTrophy size={10} /> Victor
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        Score: <strong className="text-white font-bold">{p.bestScore || 0} Solved</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {p.bestScore} Passed
                      </div>
                      <div className="text-[10px] font-mono uppercase text-gray-400">
                        {p.result ? p.result.toUpperCase() : "TIMEOUT"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POST-MATCH MULTI-QUESTION SOLUTION INSPECTOR */}
        <CodeDiffViewer
          participants={enrichedParticipants}
          problems={battle.problems && battle.problems.length > 0 ? battle.problems : (battle.problem ? [battle.problem] : [])}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
        />

        {/* NAVIGATION ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/create-room")}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl transition hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 border border-white/20"
          >
            <FaRedo /> New Battle
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-black text-xs uppercase tracking-[0.2em] rounded-xl border border-white/30 hover:border-purple-400 transition flex items-center justify-center gap-2"
          >
            <FaShieldAlt className="text-purple-400" /> Hackathon Report & CSV
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl border border-white/30 hover:border-white transition flex items-center justify-center gap-2"
          >
            <FaListOl /> Leaderboard
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl border border-white/30 hover:border-white transition flex items-center justify-center gap-2"
          >
            <FaHome /> Home Base
          </button>
        </div>
      </div>

      {/* HACKATHON PLAGIARISM AUDIT & CSV GRADEBOOK MODAL */}
      <HackathonReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        battleId={battle?._id || contestId}
      />
    </div>
  );
};

export default ResultPage;
