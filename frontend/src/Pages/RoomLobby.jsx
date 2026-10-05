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
  FaTimesCircle,
  FaExchangeAlt
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
  const myParticipant = participants.find((p) => {
    const pId = p.userId?._id ? p.userId._id.toString() : (p.userId ? p.userId.toString() : null);
    const pName = p.user?.username || (typeof p.user === "string" ? p.user : "");
    const matchesId = Boolean(currentUserId && pId && (pId === currentUserId || pId === currentUserId.toString()));
    const matchesName = Boolean(currentUsername && pName && pName.trim().toLowerCase() === currentUsername.trim().toLowerCase());
    return matchesId || matchesName;
  });

  const isSpectator = Boolean(myParticipant?.isSpectator || location.state?.isSpectator);
  const myApprovalStatus = myParticipant?.approvalStatus || (isHost ? "approved" : (battle?.myApprovalStatus || "approved"));

  const pendingRequests = participants.filter(p => p.approvalStatus === "pending");
  const approvedParticipants = participants.filter(p => p.approvalStatus !== "pending" && p.approvalStatus !== "rejected");
  const approvedPlayers = approvedParticipants.filter(p => !p.isSpectator);
  const approvedSpectators = approvedParticipants.filter(p => p.isSpectator);

  const isTeamMode = battle?.battleType === "2vs2" || battle?.battleType === "4vs4";
  const slotsPerTeam = battle?.battleType === "2vs2" ? 2 : (battle?.battleType === "4vs4" ? 4 : 1);
  const teamAPlayers = approvedPlayers.filter(p => p.team === "A");
  const teamBPlayers = approvedPlayers.filter(p => p.team === "B" || (isTeamMode && p.team !== "A"));

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
      fetchRoom();
    });

    socketRef.current.on("team-reassigned", ({ battle: updatedBattle }) => {
      if (updatedBattle) {
        setBattle(prev => ({
          ...prev,
          ...updatedBattle,
          id: updatedBattle.id || prev?.id
        }));
      }
      fetchRoom();
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

  // Host Approve/Decline handler (with optional team selection)
  const handleApproveUser = async (targetUserId, action, assignedTeam = null) => {
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
        body: JSON.stringify({ targetUserId, action, team: assignedTeam })
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

  // Host Rearrange Team handler
  const handleReassignTeam = async (targetUserId, newTeam) => {
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/battles/room/${activeRoomId}/reassign-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, team: newTeam })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBattle(prev => ({
          ...prev,
          ...data.battle
        }));
      } else {
        setError(data.error || `Failed to switch to Team ${newTeam}`);
      }
    } catch (err) {
      console.error("Reassign team error:", err);
      setError("Network communication error while rearranging teams.");
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
                              {isTeamMode && (
                                <span className="text-gray-400 ml-2">
                                  Default: <span className="text-blue-400 uppercase font-mono font-bold">Team {reqUser.team || "A"}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
                          {isTeamMode ? (
                            <>
                              <button
                                onClick={() => handleApproveUser(targetId, "approve", "A")}
                                disabled={isProcessing}
                                title="Approve and assign to Team A (Alpha)"
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                <FaUserCheck /> Approve to Team A
                              </button>
                              <button
                                onClick={() => handleApproveUser(targetId, "approve", "B")}
                                disabled={isProcessing}
                                title="Approve and assign to Team B (Bravo)"
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/35 text-orange-300 border border-orange-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                <FaUserCheck /> Approve to Team B
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleApproveUser(targetId, "approve")}
                              disabled={isProcessing}
                              title="Approve Entrance"
                              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              <FaUserCheck /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleApproveUser(targetId, "reject")}
                            disabled={isProcessing}
                            title="Decline Entrance"
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
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

          {/* COMBATANTS SECTION */}
          {isTeamMode ? (
            /* SQUAD / DUO TEAM ROSTERS (TEAM A vs TEAM B) */
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/20">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FaUsers className="text-orange-500" /> Tactical Squad Rosters ({playersCount} / {maxSlots} Active Players)
                </h3>
                <div className="flex items-center gap-3">
                  {isHost && (
                    <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30 font-bold">
                      💡 Host Controls: Click "Switch Team" on any player to rebalance squads
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-400">
                    {canStart ? "Squads Ready" : `Need ${maxSlots - playersCount} more`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TEAM ALPHA (TEAM A) COLUMN */}
                <div className="bg-[#07131e]/90 border-2 border-blue-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.12)]">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center justify-center font-black text-sm">
                        A
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-blue-400 tracking-wider">
                          TEAM ALPHA // TEAM A
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">Blue Squad</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      {teamAPlayers.length} / {slotsPerTeam} Players
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Array.from({ length: slotsPerTeam }).map((_, idx) => {
                      const participant = teamAPlayers[idx];
                      const playerName = participant?.user || (typeof participant === "string" ? participant : null);
                      const isMe = playerName && (
                        playerName.toLowerCase() === currentUsername.toLowerCase() ||
                        participant?.userId === localStorage.getItem("userId")
                      );
                      const isUserHost = participant && (participant.userId === battle?.participants?.[0]?.userId || (idx === 0 && participant?.team === "A" && battle?.isHost));
                      const targetId = participant?.userId || participant?.user;

                      return (
                        <div
                          key={`teamA-${idx}`}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isMe
                              ? "bg-green-500/15 border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
                              : playerName
                              ? "bg-blue-950/30 border-blue-500/30 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.06)]"
                              : "bg-black/30 border-white/20 border-dashed text-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${
                              isMe
                                ? "bg-green-500 text-black border-green-400"
                                : playerName
                                ? "bg-blue-600 text-white border-blue-400"
                                : "bg-white/5 text-gray-500 border-white/10"
                            }`}>
                              {playerName ? playerName.charAt(0).toUpperCase() : idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-2">
                                <span>{playerName || "Open Squad Slot"}</span>
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
                                {playerName ? (isMe ? "Status: Ready (You)" : "Status: Ready") : "Awaiting squad member..."}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isHost && playerName && (
                              <button
                                onClick={() => handleReassignTeam(targetId, "B")}
                                disabled={actionLoading[targetId] || teamBPlayers.length >= slotsPerTeam}
                                title={teamBPlayers.length >= slotsPerTeam ? "Team B is already at full capacity" : "Move player to Team B"}
                                className="px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[11px] font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                              >
                                <span>To Team B</span>
                                <FaExchangeAlt size={10} />
                              </button>
                            )}
                            {playerName ? (
                              <span className={`w-2.5 h-2.5 rounded-full ${isMe ? "bg-green-400" : "bg-blue-400"} animate-pulse`}></span>
                            ) : (
                              <FaHourglassHalf className="text-gray-500 text-xs animate-spin" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TEAM BRAVO (TEAM B) COLUMN */}
                <div className="bg-[#190d07]/90 border-2 border-orange-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(249,115,22,0.12)]">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-orange-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/50 flex items-center justify-center font-black text-sm">
                        B
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-orange-400 tracking-wider">
                          TEAM BRAVO // TEAM B
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">Orange Squad</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40">
                      {teamBPlayers.length} / {slotsPerTeam} Players
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Array.from({ length: slotsPerTeam }).map((_, idx) => {
                      const participant = teamBPlayers[idx];
                      const playerName = participant?.user || (typeof participant === "string" ? participant : null);
                      const isMe = playerName && (
                        playerName.toLowerCase() === currentUsername.toLowerCase() ||
                        participant?.userId === localStorage.getItem("userId")
                      );
                      const isUserHost = participant && participant.userId === battle?.participants?.[0]?.userId;
                      const targetId = participant?.userId || participant?.user;

                      return (
                        <div
                          key={`teamB-${idx}`}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isMe
                              ? "bg-green-500/15 border-2 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
                              : playerName
                              ? "bg-orange-950/30 border-orange-500/30 hover:border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.06)]"
                              : "bg-black/30 border-white/20 border-dashed text-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${
                              isMe
                                ? "bg-green-500 text-black border-green-400"
                                : playerName
                                ? "bg-orange-600 text-black border-orange-400"
                                : "bg-white/5 text-gray-500 border-white/10"
                            }`}>
                              {playerName ? playerName.charAt(0).toUpperCase() : idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-2">
                                <span>{playerName || "Open Squad Slot"}</span>
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
                                {playerName ? (isMe ? "Status: Ready (You)" : "Status: Ready") : "Awaiting squad member..."}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isHost && playerName && (
                              <button
                                onClick={() => handleReassignTeam(targetId, "A")}
                                disabled={actionLoading[targetId] || teamAPlayers.length >= slotsPerTeam}
                                title={teamAPlayers.length >= slotsPerTeam ? "Team A is already at full capacity" : "Move player to Team A"}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                              >
                                <FaExchangeAlt size={10} />
                                <span>To Team A</span>
                              </button>
                            )}
                            {playerName ? (
                              <span className={`w-2.5 h-2.5 rounded-full ${isMe ? "bg-green-400" : "bg-orange-400"} animate-pulse`}></span>
                            ) : (
                              <FaHourglassHalf className="text-gray-500 text-xs animate-spin" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD COMBATANTS GRID (1vs1, 3-FFA, 4-FFA, CONTEST) */
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
          )}

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