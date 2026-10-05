import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaUserShield,
  FaCopy,
  FaCheck,
  FaPlay,
  FaSignOutAlt,
  FaUsers,
  FaTerminal,
  FaGamepad,
  FaHourglassHalf,
  FaClock,
  FaListOl,
  FaEye,
  FaShieldAlt,
  FaUserCheck,
  FaUserTimes,
  FaTimesCircle
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import TeamVoiceComms from "../Components/TeamVoiceComms.jsx";

const RoomLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();

  const { battle: initialBattle, isHost: initialIsHost, username: initialUsername } = location.state || {};

  const currentUsername = initialUsername || localStorage.getItem("username") || "Combatant";
  const [battle, setBattle] = useState(initialBattle || null);
  const [isHost, setIsHost] = useState(initialIsHost || false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!initialBattle);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const socketRef = useRef(null);
  const API = import.meta.env.VITE_API_URL;
  const activeRoomId = battle?.roomId || urlRoomId;

  // Capacity calculation based on battleType and battle configuration
  const getCapacity = (type, b) => {
    if (b?.maxParticipants) return b.maxParticipants;
    if (type === "3-ffa") return 3;
    if (type === "4-ffa") return 4;
    if (type === "2vs2") return 4;
    if (type === "4vs4") return 8;
    if (type === "contest") return 20;
    return 2;
  };

  const maxSlots = getCapacity(battle?.battleType || "1vs1", battle);
  const participants = battle?.participants || [];

  const currentUserId = localStorage.getItem("userId");
  const myParticipant = participants.find(
    p => p.user === currentUsername || p.userId === currentUserId || (p.userId && p.userId._id === currentUserId)
  );
  const myApprovalStatus = myParticipant?.approvalStatus || battle?.myApprovalStatus || "approved";

  const pendingRequests = participants.filter(p => p.approvalStatus === "pending");
  const approvedParticipants = participants.filter(p => p.approvalStatus !== "pending" && p.approvalStatus !== "rejected");
  const approvedPlayers = approvedParticipants.filter(p => !p.isSpectator);
  const approvedSpectators = approvedParticipants.filter(p => p.isSpectator);

  const playersCount = approvedPlayers.length;
  const spectatorsCount = approvedSpectators.length;
  const minRequired = battle?.battleType === "3-ffa" ? 3 : battle?.battleType === "2vs2" ? 4 : battle?.battleType === "4vs4" ? 8 : 2;
  const canStart = playersCount >= minRequired || playersCount >= 1;

  // Fetch Room data
  const fetchRoom = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!activeRoomId) return;

    try {
      const res = await fetch(`${API}/api/battles/room/${activeRoomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.battle) {
        setBattle(data.battle);
        setIsHost(!!data.battle.isHost);
        if (data.battle.status === "active") {
          navigate(`/contest/${data.battle.roomId}`, {
            state: { battle: data.battle, username: currentUsername }
          });
        }
      } else {
        setError(data.error || "Room not found or access denied.");
      }
    } catch (err) {
      console.error("Fetch room error:", err);
      setError("Network error while connecting to room.");
    } finally {
      setFetchLoading(false);
    }
  }, [activeRoomId, API, navigate, currentUsername]);

  // Initial fetch if refreshed or entered via direct URL
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Socket.IO real-time events
  useEffect(() => {
    if (!activeRoomId) return;

    socketRef.current = io(API, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-room", activeRoomId);
    });

    socketRef.current.on("player-joined", ({ battle: updatedBattle }) => {
      if (updatedBattle) {
        setBattle(prev => ({
          ...prev,
          ...updatedBattle,
          id: updatedBattle.id || prev?.id
        }));
      }
    });

    socketRef.current.on("participant-approved", ({ battle: updatedBattle }) => {
      if (updatedBattle) {
        setBattle(prev => ({
          ...prev,
          ...updatedBattle,
          id: updatedBattle.id || prev?.id
        }));
      }
    });

    socketRef.current.on("player-join-requested", () => {
      fetchRoom();
    });

    socketRef.current.on("player-left", ({ battle: updatedBattle }) => {
      if (updatedBattle) {
        setBattle(prev => ({
          ...prev,
          ...updatedBattle
        }));
      }
    });

    socketRef.current.on("battle-started", ({ battle: startedBattle }) => {
      if (startedBattle) {
        navigate(`/contest/${startedBattle.roomId}`, {
          state: { battle: startedBattle, username: currentUsername }
        });
      }
    });

    // Fallback polling every 4 seconds in case socket drops
    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/battles/room/${activeRoomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.battle) {
          if (data.battle.status === "finished") {
            clearInterval(interval);
            navigate(`/results/${data.battle.roomId || activeRoomId}`, { replace: true });
            return;
          }
          setBattle(prev => ({ ...prev, ...data.battle }));
          if (data.battle.status === "active") {
            clearInterval(interval);
            navigate(`/contest/${data.battle.roomId}`, {
              state: { battle: data.battle, username: currentUsername }
            });
          }
        }
      } catch (err) {
        // quiet fallback
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.emit("leave-room", activeRoomId);
        socketRef.current.disconnect();
      }
    };
  }, [activeRoomId, API, navigate, currentUsername, fetchRoom]);

  // Host Approve/Decline handler
  const handleApproveUser = async (targetUserId, action) => {
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/battles/room/${activeRoomId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBattle(prev => ({
          ...prev,
          ...data.battle
        }));
      } else {
        setError(data.error || `Failed to ${action} user`);
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      setError("Network communication error.");
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Copy Room Code
  const copyRoomCode = () => {
    if (activeRoomId) {
      navigator.clipboard.writeText(activeRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Start Battle
  const handleStartBattle = async () => {
    const battleIdentifier = battle?.id || activeRoomId;
    if (!battleIdentifier) {
      setError("Battle ID missing");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/battles/start/${battleIdentifier}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const startedBattle = data.battle || battle;
        navigate(`/contest/${startedBattle.roomId || activeRoomId}`, {
          state: { battle: startedBattle, username: currentUsername }
        });
      } else {
        setError(data.error || data.message || "Failed to start battle");
      }
    } catch (err) {
      console.error("Start battle error:", err);
      setError("Network error starting battle");
    } finally {
      setLoading(false);
    }
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/api/battles/leave-room/${activeRoomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error(e);
    }
    navigate("/");
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-orange-400 font-mono tracking-widest text-sm uppercase animate-pulse">
          CONNECTING_TO_STAGING_SECTOR...
        </h2>
      </div>
    );
  }

  // PENDING CLEARANCE STANDBY QUEUE (NON-HOST)
  if (!isHost && myApprovalStatus === "pending") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16">
        {/* BACKGROUND ACCENTS */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none"></div>

        {/* TOP BAR */}
        <div className="w-full max-w-[99%] mx-auto flex items-center justify-between mb-6 z-20">
          <BackButton to="/create-room" label="Exit Lobby" />

          {/* LOGGED IN USER IDENTITY BADGE */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0a1118] border border-white/40 shadow-md">
            <span className="text-[10px] text-gray-400 font-mono uppercase">User:</span>
            <span className="font-bold text-sm text-orange-400 font-mono">{currentUsername}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-black font-mono uppercase border bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
              {myParticipant?.isSpectator ? "Spectator (YOU)" : "Combatant (YOU)"}
            </span>
          </div>

          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">
            TOURNAMENT GATEKEEPER // STANDBY QUEUE
          </span>
        </div>

        {/* PENDING CARD (FULL SCREEN WIDTH) */}
        <div className="z-10 w-full max-w-[99%] mx-auto mt-6">
          <div className="relative bg-[#0a1118]/95 backdrop-blur-2xl border-2 border-white/40 p-6 md:p-10 rounded-3xl shadow-2xl text-center space-y-6 w-full">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 text-3xl shadow-[0_0_30px_rgba(249,115,22,0.3)] animate-pulse">
              <FaShieldAlt />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                Uplink Transmitted // Awaiting Clearance
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight italic">
                AWAITING <span className="text-orange-500">ADMIN APPROVAL</span>
              </h2>
              <p className="text-white text-xs md:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                This is an official tournament room. The Tournament Administrator (<span className="text-orange-400 font-mono font-bold">{battle?.host || "Host"}</span>) must verify and authorize your entrance before your combat slot is unlocked.
              </p>
            </div>

            {/* DETAILS */}
            <div className="bg-black/50 border border-white/30 rounded-2xl p-4 grid grid-cols-3 gap-3 text-xs max-w-3xl mx-auto">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-mono font-bold">Room Code</span>
                <span className="font-mono font-black text-orange-400">{activeRoomId}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-mono font-bold">Requested Role</span>
                <span className="font-bold text-white">{myParticipant?.isSpectator ? "Spectator 👁️" : "Competitor ⚔️"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-mono font-bold">Clearance Status</span>
                <span className="font-mono text-yellow-400 font-bold">Pending Review...</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handleLeaveRoom}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/30 hover:border-red-400 text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel & Exit Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED CLEARANCE (NON-HOST)
  if (!isHost && myApprovalStatus === "rejected") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-4 sm:px-8 md:px-12 py-6">
        <div className="z-10 w-full max-w-xl mx-auto mt-16 text-center space-y-6 bg-[#0a1118]/95 border-2 border-white/40 p-8 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 text-3xl">
            <FaTimesCircle />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-red-400">Clearance Declined</h2>
            <p className="text-gray-400 text-xs mt-2">
              Your admission request to Battle Room {activeRoomId} was declined by the tournament admin.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase border border-white/30 hover:border-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none"></div>

      {/* TOP BAR WITH BACK BUTTON & USER IDENTITY */}
      <div className="w-full max-w-[99%] mx-auto flex items-center justify-between mb-6 z-20">
        <BackButton to="/create-room" label="Exit Lobby" />

        {/* LOGGED IN USER IDENTITY BADGE AT TOP OF SCREEN */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0a1118] border border-white/40 shadow-md">
          <span className="text-[10px] text-gray-400 font-mono uppercase">Combatant:</span>
          <span className="font-bold text-sm text-orange-400 font-mono">{currentUsername}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-black font-mono uppercase border ${
            isHost 
              ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
              : isSpectator
              ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
              : "bg-green-500/20 text-green-400 border-green-500/40"
          }`}>
            {isHost ? "Host" : isSpectator ? "Spectator (YOU)" : "Combatant (YOU)"}
          </span>
        </div>

        <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">
          ARENA HANGAR // STATUS: {battle?.status || "WAITING"}
        </span>
      </div>

      {/* HEADER */}
      <div className="z-10 text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-orange-500 text-xs font-mono uppercase tracking-widest mb-1">
          <FaTerminal /> Matchmaking // Staging Lobby
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
          COMBAT <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">HANGAR</span>
        </h1>
        <p className="text-gray-300 tracking-[0.2em] text-xs uppercase mt-1 font-medium">
          Synchronizing Combatants for {battle?.battleType || "1vs1"} Duel
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <div className="z-10 relative w-full max-w-[99%] mx-auto">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-blue-600/30 rounded-3xl blur-lg opacity-40"></div>

        <div className="relative bg-[#0a1118]/95 backdrop-blur-2xl border-2 border-white/40 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl">
          {/* TOP BAR: ROOM CODE & TYPE */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-black/50 border border-white/30 p-4 rounded-2xl mb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Room Code:</span>
              <span className="font-mono text-2xl font-black text-orange-400 tracking-wider">
                {activeRoomId}
              </span>
              <button
                onClick={copyRoomCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-white/30 hover:border-white text-xs font-bold transition active:scale-95"
                title="Copy Room Code"
              >
                {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/30 rounded-full text-xs font-bold uppercase tracking-wider text-gray-300">
                Mode: <span className="text-orange-400">{battle?.battleType || "1vs1"}</span>
              </span>
              {(battle?.requiresApproval || battle?.isTournament) && (
                <span className="px-3 py-1 bg-orange-500/20 border border-white/30 rounded-full text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                  <FaShieldAlt size={10} /> Tournament Gatekeeper
                </span>
              )}

              {/* SQUAD COMMS IN LOBBY */}
              {(battle?.battleType === "2vs2" || battle?.battleType === "4vs4") && myParticipant && (
                <TeamVoiceComms
                  socket={socketRef.current}
                  roomId={activeRoomId}
                  team={myParticipant.team || "A"}
                  username={currentUsername}
                />
              )}
            </div>
          </div>

          {/* CUSTOM ARENA SPEC BADGES */}
          <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/20 p-3 rounded-xl mb-6 text-center text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Problems</span>
              <span className="font-bold text-orange-400">{battle?.problemCount || 1} Question{battle?.problemCount > 1 ? "s" : ""}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Match Time</span>
              <span className="font-bold text-orange-400">{battle?.duration || 30} Minutes</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Question Set</span>
              <span className="font-bold text-orange-400">{battle?.selectionMode === "manual" ? "Custom Pick" : "Random Problems"}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-6 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-300 hover:text-white font-bold ml-4">✕</button>
            </div>
          )}

          {/* TOURNAMENT GATEKEEPER - PENDING CLEARANCE QUEUE (HOST ONLY - FULL WIDTH) */}
          {isHost && (battle?.requiresApproval || battle?.isTournament || pendingRequests.length > 0) && (
            <div className="mb-6 p-4 md:p-5 rounded-2xl bg-orange-500/10 border-2 border-white/40 w-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-orange-400 text-base" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-400">
                    Tournament Gatekeeper // Pending Clearances ({pendingRequests.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {pendingRequests.length === 0 ? "All verified" : "Requires Admin Approval"}
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <p className="text-xs text-gray-400 font-mono py-2">
                  ✓ No pending authorization requests. Any new players joining will appear here for your review.
                </p>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {pendingRequests.map((reqUser, idx) => {
                    const targetId = reqUser.userId || reqUser.user;
                    const isProcessing = !!actionLoading[targetId];

                    return (
                      <div
                        key={idx}
                        className="w-full bg-[#050b10] border border-white/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl hover:border-white transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-lg shrink-0 border border-white/30 shadow-md">
                            {(reqUser.user || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-base text-white flex items-center gap-2">
                              <span>{reqUser.user || "Unknown User"}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-400 mt-0.5">
                              Request: <span className="text-orange-400 font-semibold uppercase tracking-wider">Competitor</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                          <button
                            onClick={() => handleApproveUser(targetId, "approve")}
                            disabled={isProcessing}
                            title="Approve Entrance"
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                          >
                            <FaUserCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleApproveUser(targetId, "reject")}
                            disabled={isProcessing}
                            title="Decline Entrance"
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                          >
                            <FaUserTimes /> Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* COMBATANTS GRID */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <FaUsers className="text-orange-500" /> Authorized Combatants ({playersCount} / {maxSlots})
              </h3>
              <span className="text-xs font-mono text-gray-400">
                {canStart ? "Ready to Launch" : `Awaiting ${maxSlots - playersCount} more`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: maxSlots }).map((_, index) => {
                const participant = approvedPlayers[index];
                const playerName = participant?.user || (typeof participant === "string" ? participant : null);
                const isUserHost = index === 0;
                const isMe = playerName && (
                  playerName.toLowerCase() === currentUsername.toLowerCase() ||
                  participant?.userId === localStorage.getItem("userId")
                );

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isMe
                        ? "bg-green-500/10 border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
                        : playerName
                        ? "bg-white/5 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        : "bg-black/30 border-white/20 border-dashed text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border border-white/20 ${
                        isMe
                          ? "bg-green-500 text-black shadow-md border-green-400"
                          : playerName
                          ? "bg-orange-500 text-black shadow-md border-orange-400"
                          : "bg-white/5 text-gray-400"
                      }`}>
                        {playerName ? playerName.charAt(0).toUpperCase() : index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{playerName || "Open Slot"}</span>
                          {isUserHost && playerName && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40 uppercase font-mono">
                              Host
                            </span>
                          )}
                          {isMe && (
                            <span className="text-[10px] bg-green-500/25 text-green-400 px-2 py-0.5 rounded border border-green-500/50 uppercase font-mono font-black animate-pulse">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {playerName ? (isMe ? "Status: Ready (You)" : "Status: Ready") : "Awaiting uplink..."}
                        </div>
                      </div>
                    </div>

                    {playerName ? (
                      <span className={`w-2.5 h-2.5 rounded-full ${isMe ? "bg-green-400" : "bg-green-500"} animate-pulse`}></span>
                    ) : (
                      <FaHourglassHalf className="text-gray-500 text-xs animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-white/20">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleLeaveRoom}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-300 text-xs font-bold uppercase tracking-wider border border-white/30 hover:border-red-500 transition flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Abandon Lobby
              </button>
            </div>

            {isHost ? (
              <button
                onClick={handleStartBattle}
                disabled={loading || !canStart}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 shadow-lg border border-white/20 ${
                  loading || !canStart
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10"
                    : "bg-orange-500 hover:bg-orange-400 text-black hover:scale-105 active:scale-95 shadow-orange-500/20"
                }`}
              >
                {loading ? (
                  "INITIALIZING CONTEST..."
                ) : (
                  <>
                    <FaPlay className="text-[10px]" /> START BATTLE
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 py-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                Awaiting host to initiate contest deployment...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;