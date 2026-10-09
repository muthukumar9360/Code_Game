import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FaPlay,
  FaRegClock,
  FaTerminal,
  FaLightbulb,
  FaExclamationTriangle,
  FaArrowLeft,
  FaBrain,
  FaCheckCircle,
  FaTrophy,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
  FaUsers,
  FaUser,
  FaLock,
  FaHourglassHalf,
  FaShieldAlt
} from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import ResultPopup from "./ResultPopup.jsx";
import BackButton from "../Components/BackButton.jsx";
import TeamVoiceComms from "../Components/TeamVoiceComms.jsx";
import { SplitDivider, useResizableSplit } from "../Components/SplitDivider.jsx";
import EditorTopBar from "../Components/EditorTopBar.jsx";
import CodeEditor from "../Components/CodeEditor.jsx";
import { handleEditorKeyDown } from "../utils/editorUtils.js";
import { STARTER_CODES } from "./ProblemSolve.jsx";
import { useSecureProctoring, FullscreenGatewayModal } from "../Components/SecureProctoringGuard.jsx";

const ContestPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODES.python);
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [battle, setBattle] = useState(location.state?.battle || null);
  const socketRef = useRef(null);

  // Multi-Question Selection & Code Preservation State
  const initialAssignedIndex = location.state?.battle?.participants?.find(
    (p) =>
      p.user === (location.state?.username || localStorage.getItem("username") || "Combatant").trim() ||
      p.username === (location.state?.username || localStorage.getItem("username") || "Combatant").trim() ||
      p.user?.username === (location.state?.username || localStorage.getItem("username") || "Combatant").trim() ||
      p.userId === localStorage.getItem("userId")
  )?.assignedProblemIndex || 0;

  const [activeProblemIndex, setActiveProblemIndex] = useState(initialAssignedIndex);
  const [codeMap, setCodeMap] = useState({});
  const [opponentDraftCode, setOpponentDraftCode] = useState({});

  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const popupShownRef = useRef(false);

  const [syncError, setSyncError] = useState(null);
  const [syncTimeout, setSyncTimeout] = useState(false);

  useEffect(() => {
    if (battle) {
      setSyncTimeout(false);
      return;
    }
    const timer = setTimeout(() => {
      setSyncTimeout(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [battle]);

  // Resolve multiple problems if present
  const problemsList = (battle?.problems && battle.problems.length > 0)
    ? battle.problems
    : (battle?.problem ? [battle.problem] : []);

  const safeActiveIndex = Math.min(activeProblemIndex, Math.max(0, problemsList.length - 1));
  const currentProblem = problemsList[safeActiveIndex] || battle?.problem || null;

  const API = import.meta.env.VITE_API_URL;
  const myUsername = (location.state?.username || localStorage.getItem("username") || "Combatant").trim();

  // Find my participant object
  const myParticipant = battle?.participants?.find(
    (p) =>
      p.user === myUsername ||
      p.username === myUsername ||
      p.user?.username === myUsername ||
      p.userId === localStorage.getItem("userId")
  );

  const opponentParticipant = battle?.participants?.find(
    (p) =>
      p.user !== myUsername &&
      p.username !== myUsername &&
      p.user?.username !== myUsername &&
      (p.userId ? p.userId !== localStorage.getItem("userId") : true)
  );

  const isTeamMatch = Boolean(
    battle?.battleType === "2vs2" ||
    battle?.battleType === "4vs4" ||
    location.state?.battleType === "2vs2" ||
    location.state?.battleType === "4vs4"
  );
  const myTeam = myParticipant?.team && myParticipant.team !== "solo"
    ? myParticipant.team
    : (isTeamMatch ? (location.state?.team || "A") : "solo");
  const contestDurationSec = (battle?.duration || 30) * 60;
  const startTimestamp = battle?.startTime ? new Date(battle.startTime).getTime() : null;
  const computedElapsed = startTimestamp ? Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000)) : 0;
  const exactComputedTimeLeft = startTimestamp ? Math.max(0, contestDurationSec - computedElapsed) : null;

  const myTimeLeft = exactComputedTimeLeft !== null
    ? exactComputedTimeLeft
    : (myParticipant?.timeLeft !== undefined && myParticipant?.timeLeft !== null
      ? myParticipant.timeLeft
      : contestDurationSec);

  const isRanked = Boolean(
    battle?.isRanked ||
    location.state?.isRanked ||
    (contestId && contestId.startsWith("RNK")) ||
    (battle?.roomId && battle.roomId.startsWith("RNK"))
  );

  // Team Problem Claiming State ({ [problemIndex]: claimedByUsername })
  const [teamClaims, setTeamClaims] = useState({});

  // Pre-Battle Problem Selection & Ready Countdown States (Auto-assigned mode)
  const isSelectionPhase = false;
  const readyCountdown = null;
  const [lockedProblems, setLockedProblems] = useState({});
  const [isMyProblemLocked, setIsMyProblemLocked] = useState(false);

  // Team Consensus Exit State
  const [exitVoteInitiator, setExitVoteInitiator] = useState(null); // username of requester
  const [isMyExitRequested, setIsMyExitRequested] = useState(false); // true if I requested
  const [exitNotification, setExitNotification] = useState("");

  // Check if problem is solved
  const isProblemSolved = (prob) => {
    if (!prob) return false;
    const pId = (prob._id?.toString?.() || prob._id || prob.slug || "").toString();
    const solvedList = myParticipant?.solvedProblems || [];
    return solvedList.some(sp => {
      const spId = (sp?._id?.toString?.() || sp?.toString?.() || "").toString();
      return spId === pId;
    });
  };

  const mySolvedCount = problemsList.filter(isProblemSolved).length;
  const totalRequired = problemsList.length || 1;
  const opponentSolvedCount = opponentParticipant?.solvedProblems?.length || 0;

  // Squad solved count across all teammates
  const myTeamMembers = (battle?.participants || []).filter(
    (p) => (myTeam !== "solo" ? p.team === myTeam : true)
  );
  const teamSolvedSet = new Set();
  for (const tp of myTeamMembers) {
    for (const sp of (tp.solvedProblems || [])) {
      teamSolvedSet.add((sp?._id || sp).toString());
    }
  }
  const squadSolvedCount = isTeamMatch && myTeam !== "solo" ? teamSolvedSet.size : mySolvedCount;

  // Teammates in my team
  const teammateParticipants = (battle?.participants || []).filter(
    (p) =>
      (myTeam !== "solo" ? p.team === myTeam : false) &&
      p.user !== myUsername &&
      p.username !== myUsername &&
      p.user?.username !== myUsername
  );

  // Claim problem for team coordination
  const handleClaimProblem = (targetIndex) => {
    if (!socketRef.current || myTeam === "solo") return;
    const prob = problemsList[targetIndex];
    socketRef.current.emit("team-claim-problem", {
      roomId: battle?.roomId || contestId,
      team: myTeam,
      username: myUsername,
      problemIndex: targetIndex,
      problemTitle: prob?.title || `Question ${targetIndex + 1}`
    });
    setTeamClaims((prev) => ({
      ...prev,
      [targetIndex]: myUsername
    }));
  };

  // Odd/Even problem selection helpers for Pre-Battle
  const handleSelectOdd = () => {
    // 1-indexed odd: index 0 (Q1), index 2 (Q3)...
    const oddIdx = problemsList.findIndex((p, idx) => {
      if (idx % 2 !== 0) return false;
      const claimed = Object.values(lockedProblems).find(l => l.team === myTeam && l.problemIndex === idx)?.username || teamClaims[idx];
      return !claimed || claimed === myUsername;
    });
    if (oddIdx !== -1) {
      setActiveProblemIndex(oddIdx);
    }
  };

  const handleSelectEven = () => {
    // 1-indexed even: index 1 (Q2), index 3 (Q4)...
    const evenIdx = problemsList.findIndex((p, idx) => {
      if (idx % 2 === 0) return false;
      const claimed = Object.values(lockedProblems).find(l => l.team === myTeam && l.problemIndex === idx)?.username || teamClaims[idx];
      return !claimed || claimed === myUsername;
    });
    if (evenIdx !== -1) {
      setActiveProblemIndex(evenIdx);
    }
  };

  // Lock In Selected Challenge
  const handleLockInSelection = (idxToLock) => {
    const targetIdx = idxToLock !== undefined ? idxToLock : safeActiveIndex;
    setActiveProblemIndex(targetIdx);
    setIsMyProblemLocked(true);
    const prob = problemsList[targetIdx];
    const pTitle = prob?.title || `Question ${targetIdx + 1}`;

    setLockedProblems((prev) => ({
      ...prev,
      [myUsername]: {
        team: myTeam,
        problemIndex: targetIdx,
        problemTitle: pTitle,
        username: myUsername
      }
    }));
    setTeamClaims((prev) => ({
      ...prev,
      [targetIdx]: myUsername
    }));

    if (socketRef.current) {
      socketRef.current.emit("player-lock-problem", {
        roomId: battle?.roomId || contestId,
        team: myTeam,
        username: myUsername,
        problemIndex: targetIdx,
        problemTitle: pTitle
      });
      socketRef.current.emit("team-claim-problem", {
        roomId: battle?.roomId || contestId,
        team: myTeam,
        username: myUsername,
        problemIndex: targetIdx,
        problemTitle: pTitle
      });
    }
  };

  // Automatically broadcast assigned problem claim on initial load for squad matches
  const hasAutoClaimedRef = useRef(false);
  useEffect(() => {
    if (!battle || hasAutoClaimedRef.current || !problemsList.length) return;
    const assignedIdx = myParticipant?.assignedProblemIndex;
    if (assignedIdx !== undefined && assignedIdx !== null && assignedIdx >= 0 && assignedIdx < problemsList.length) {
      hasAutoClaimedRef.current = true;
      setActiveProblemIndex(assignedIdx);
      if (myTeam !== "solo") {
        handleClaimProblem(assignedIdx);
      }
    }
  }, [battle, myParticipant, myTeam, problemsList.length]);


  // Handle switching between questions
  const handleSwitchProblem = (newIndex) => {
    if (newIndex === safeActiveIndex || newIndex < 0 || newIndex >= problemsList.length) return;

    const curProblem = problemsList[safeActiveIndex];
    const curId = curProblem?._id || `prob_${safeActiveIndex}`;

    // Save current editor code
    setCodeMap((prev) => ({
      ...prev,
      [curId]: {
        ...(prev[curId] || {}),
        [language]: code
      }
    }));

    // Switch to new problem and restore its code
    const nextProblem = problemsList[newIndex];
    const nextId = nextProblem?._id || `prob_${newIndex}`;
    const nextCode = codeMap[nextId]?.[language] || STARTER_CODES[language] || "";

    setActiveProblemIndex(newIndex);
    setCode(nextCode);
    setResults([]);
    setHint("");
    setShowHintBox(false);
    setDebugOutput((prev) => prev + `> Switched to Challenge #${newIndex + 1}: ${nextProblem?.title || `Question ${newIndex + 1}`}\n`);

    // In team match, automatically broadcast to teammates that you are tackling this challenge
    if (myTeam !== "solo") {
      handleClaimProblem(newIndex);
    }
  };

  // Handle language switch with per-problem code preservation
  const handleLanguageChange = (newLang) => {
    const curProblem = problemsList[safeActiveIndex];
    const curId = curProblem?._id || `prob_${safeActiveIndex}`;

    setCodeMap((prev) => ({
      ...prev,
      [curId]: {
        ...(prev[curId] || {}),
        [language]: code
      }
    }));

    const savedForNewLang = codeMap[curId]?.[newLang];
    setLanguage(newLang);
    if (savedForNewLang) {
      setCode(savedForNewLang);
    } else {
      setCode(STARTER_CODES[newLang] || "");
    }
  };

  // Draggable Middle Divider Split State
  const {
    leftPercent,
    isDragging,
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleReset
  } = useResizableSplit({
    initialPercent: 38,
    minPercent: 20,
    maxPercent: 75,
    storageKey: "battlix_contest_split"
  });

  // Offline Hint State (from database)
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [showHintBox, setShowHintBox] = useState(false);

  // Security & Anti-Cheat States
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const lastKeyTimeRef = useRef(Date.now());
  const maxStrikes = 1;



  // Real-time code telemetry for post-match solution inspection
  useEffect(() => {
    if (!socketRef.current) return;
    const t = setTimeout(() => {
      socketRef.current.emit("opponent-code-update", {
        roomId: battle?.roomId || contestId,
        username: myUsername,
        code,
        language,
        problemId: currentProblem?._id,
        testsPassed: results.filter((r) => r.passed).length,
        totalTests: results.length || currentProblem?.testcases?.length || 10,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [code, language, results, battle?.roomId, contestId, myUsername, currentProblem]);

  // Exit / Abandon Battle handler (Always navigates to results page to review full telemetry)
  const handleExitBattle = useCallback(async (force = false) => {
    // If battle has already concluded, immediately proceed to results
    if (battle?.status === "finished") {
      navigate(`/results/${contestId}`, {
        state: { opponentDraftCode }
      });
      return;
    }

    if (
      !force &&
      !window.confirm(
        "Warning: Leaving an active match will register an immediate defeat. Are you sure you want to exit and review match telemetry?"
      )
    ) {
      return;
    }

    // Instantly notify rival through socket that this player forfeited/exited
    if (socketRef.current) {
      try {
        socketRef.current.emit("player-forfeit", {
          roomId: battle?.roomId || contestId,
          contestId,
          username: myUsername
        });
      } catch (e) {}
    }

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API}/api/battles/${contestId}/abandon`,
        {
          code,
          language,
          problemId: currentProblem?._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("Abandon request completed (navigating to results telemetry):", err);
    } finally {
      navigate(`/results/${contestId}`, {
        state: { opponentDraftCode }
      });
    }
  }, [API, contestId, navigate, battle?.status, battle?.roomId, myUsername, code, language, currentProblem, opponentDraftCode]);

  // Squad Consensus Exit Click Handler
  const handleExitClick = () => {
    if (battle?.status === "finished") {
      navigate(`/results/${contestId}`, {
        state: { opponentDraftCode }
      });
      return;
    }

    if (isTeamMatch && myTeam !== "solo") {
      if (
        window.confirm(
          "⚠️ Initiate Squad Exit Vote?\nAll teammates must accept for the squad to forfeit and exit."
        )
      ) {
        setIsMyExitRequested(true);
        if (socketRef.current) {
          socketRef.current.emit("team-exit-request", {
            roomId: battle?.roomId || contestId,
            team: myTeam,
            requestedBy: myUsername
          });
        }
      }
    } else {
      handleExitBattle(false);
    }
  };

  const handleRespondExitVote = (accepted) => {
    if (socketRef.current) {
      socketRef.current.emit("team-exit-response", {
        roomId: battle?.roomId || contestId,
        team: myTeam,
        respondent: myUsername,
        accepted
      });
      if (accepted) {
        socketRef.current.emit("team-exit-confirmed", {
          roomId: battle?.roomId || contestId,
          team: myTeam
        });
      }
    }
    setExitVoteInitiator(null);
  };

  const handleCancelExitVote = () => {
    if (socketRef.current) {
      socketRef.current.emit("team-exit-cancel", {
        roomId: battle?.roomId || contestId,
        team: myTeam,
        cancelledBy: myUsername
      });
    }
    setIsMyExitRequested(false);
  };

  // Strict Zero-Tolerance Proctoring
  const handleSecurityTermination = useCallback((reason) => {
    handleExitBattle(true);
  }, [handleExitBattle]);

  const { isFullscreen, enterFullscreen, triggerViolation } = useSecureProctoring({
    onTerminate: handleSecurityTermination,
    enabled: true,
    environmentName: isRanked ? "Ranked 1v1 Battle" : "Contest Arena"
  });

  // Anti-Copy & Anti-Paste Enforcement
  const handlePasteBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Clipboard paste detected in code editor");
  };

  const handleCopyBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Copy attempt detected in arena workspace");
  };

  // Format MM:SS
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Tab, auto-indent, auto-space, bracket auto-close handling for code editor
  const handleKeyDown = (e) => {
    handleEditorKeyDown(e, code, setCode);
  };

  // Battle status fetcher
  const fetchBattleStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !contestId) return;
    try {
      const res = await axios.get(`${API}/api/battles/${contestId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.battle) {
        if (res.data.battle.status === "finished") {
          // Room is already completed! Cannot re-enter active arena with old URL.
          navigate(`/results/${contestId}`, { replace: true, state: { opponentDraftCode } });
          return;
        }
        setBattle(res.data.battle);
        setSyncError(null);
      }
    } catch (err) {
      console.error("Status fetch error", err);
      if (!location.state?.battle) {
        setSyncError(err.response?.data?.error || "Failed to synchronize with contest node.");
      }
    }
  }, [API, contestId, navigate, location.state?.battle, opponentDraftCode]);

  // Initial and reactive status sync
  useEffect(() => {
    fetchBattleStatus();
  }, [fetchBattleStatus]);

  // Socket Connection for Real-Time Sync
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!contestId) return;

    socketRef.current = io(API, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current.emit("join-room", contestId);
    if (battle?.roomId && battle.roomId !== contestId) {
      socketRef.current.emit("join-room", battle.roomId);
    }
    if (battle?._id && battle._id.toString() !== contestId) {
      socketRef.current.emit("join-room", battle._id.toString());
    }

    if (isTeamMatch && myTeam !== "solo") {
      socketRef.current.emit("join-team-channel", {
        roomId: contestId,
        team: myTeam,
        username: myUsername
      });
    }

    socketRef.current.on("battle-ended", (data) => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", contestId);
      }
      if (!popupShownRef.current) {
        popupShownRef.current = true;
        const currentWinner = data.winner;
        const isMyTeamWin = Boolean(
          (data.winningTeam && myTeam !== "solo" && data.winningTeam === myTeam) ||
          (currentWinner && myTeam !== "solo" && currentWinner.includes(myTeam))
        );
        const isMeWinner = currentWinner === myUsername || isMyTeamWin;
        setIsWinner(isMeWinner);
        setWinnerName(currentWinner || (isMyTeamWin ? `Team ${myTeam}` : "A Combatant"));
        setShowResultPopup(true);
      }
    });

    socketRef.current.on("opponent-code-update", (data) => {
      if (data && data.username && data.code) {
        setOpponentDraftCode((prev) => ({
          ...prev,
          [data.username]: data.code
        }));
      }
    });

    socketRef.current.on("opponent-submitted", (data) => {
      setDebugOutput((prev) => prev + `> An opponent has submitted a solution for verification.\n`);
    });

    socketRef.current.on("problem-solved-update", (data) => {
      setDebugOutput((prev) => prev + `> ⚔️ [ARENA TELEMETRY] ${data.username} solved ${data.solvedProblemTitle ? `"${data.solvedProblemTitle}"` : "a challenge"}! (${data.solvedCount}/${data.totalRequired})\n`);
      const myId = localStorage.getItem("userId");
      const isForMe = (data.userId && data.userId === myId) || data.username === myUsername;
      if (isForMe && data.nextAssignedProblemIndex !== undefined) {
        handleSwitchProblem(data.nextAssignedProblemIndex);
        setDebugOutput((prev) => prev + `> 🚀 [AUTO-ASSIGN] Next objective assigned: Challenge #${data.nextAssignedProblemIndex + 1} (${data.nextAssignedProblemTitle || `Question ${data.nextAssignedProblemIndex + 1}`})!\n`);
      }
      fetchBattleStatus();
    });

    socketRef.current.on("contest-settings-updated", (data) => {
      setDebugOutput((prev) => prev + `> ⚙️ [SYSTEM NOTICE] Contest settings updated live! Authorized duration: ${data.duration}m.\n`);
      fetchBattleStatus();
    });

    socketRef.current.on("team-problem-claimed", ({ username, problemIndex, problemTitle }) => {
      setTeamClaims((prev) => ({
        ...prev,
        [problemIndex]: username
      }));
      setDebugOutput((prev) => prev + `> 👥 [SQUAD COORD] ${username} claimed Challenge #${problemIndex + 1}: ${problemTitle || ""}\n`);
    });

    socketRef.current.on("player-problem-locked", ({ team, username, problemIndex, problemTitle }) => {
      setLockedProblems((prev) => ({
        ...prev,
        [username]: { team, problemIndex, problemTitle, username }
      }));
      setTeamClaims((prev) => ({
        ...prev,
        [problemIndex]: username
      }));
      setDebugOutput((prev) => prev + `> 🔒 [SELECTION] ${username} locked Challenge #${problemIndex + 1}: ${problemTitle || ""}\n`);
    });

    socketRef.current.on("battle-ready-countdown-start", ({ countdownSeconds = 5 }) => {
      setReadyCountdown(countdownSeconds);
    });

    socketRef.current.on("team-exit-requested", ({ requestedBy, team }) => {
      if (team === myTeam && requestedBy !== myUsername) {
        setExitVoteInitiator(requestedBy);
      }
    });

    socketRef.current.on("team-exit-voted", ({ respondent }) => {
      setExitNotification(`✅ ${respondent} accepted the squad exit request.`);
    });

    socketRef.current.on("team-exit-cancelled", ({ declinedBy, reason }) => {
      setExitVoteInitiator(null);
      setIsMyExitRequested(false);
      setExitNotification(reason || `❌ Exit request rejected by ${declinedBy}. Battle continues!`);
      setTimeout(() => setExitNotification(""), 5000);
    });

    socketRef.current.on("team-exit-execute", ({ team }) => {
      if (team === myTeam) {
        setExitVoteInitiator(null);
        setIsMyExitRequested(false);
        handleExitBattle(true);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", contestId);
        socketRef.current.disconnect();
      }
    };
  }, [contestId, API, navigate, myUsername, fetchBattleStatus, isTeamMatch, myTeam, handleExitBattle]);

  // Live Active Match Heartbeat Poll (guarantees rival victory screen displays instantly on opponent exit even if socket delays)
  useEffect(() => {
    if (!battle || battle.status === "finished" || !contestId) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/api/battles/${contestId}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.battle && res.data.battle.status === "finished") {
          clearInterval(interval);
          if (!popupShownRef.current) {
            popupShownRef.current = true;
            const myId = localStorage.getItem("userId");
            const me = res.data.battle.participants?.find((p) =>
              (p.userId && p.userId.toString() === myId) ||
              p.user === myUsername ||
              p.username === myUsername
            );
            const winnerPart = res.data.battle.participants?.find((p) => p.result === "win");
            const isMeWinner = me?.result === "win" || (!me?.result && winnerPart?.user === myUsername);
            setIsWinner(isMeWinner);
            setWinnerName(winnerPart?.user?.username || winnerPart?.username || winnerPart?.user || myUsername);
            setShowResultPopup(true);
          }
        }
      } catch (e) {
        // quiet poll
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [battle?.status, contestId, API, myUsername]);

  // Countdown timer for MY time only (Standard Contests only; Ranked duels are sprints; paused during selection phase)
  useEffect(() => {
    if (!battle || battle.status === "finished" || isRanked || isSelectionPhase) return;
    const t = setInterval(() => {
      setBattle((prev) => {
        if (!prev) return prev;
        const copy = JSON.parse(JSON.stringify(prev));
        const durSec = (copy.duration || 30) * 60;
        const sTime = copy.startTime ? new Date(copy.startTime).getTime() : null;
        const elapsedNow = sTime ? Math.max(0, Math.floor((Date.now() - sTime) / 1000)) : null;

        copy.participants = copy.participants.map((p) => {
          const isMe =
            p.user === myUsername ||
            p.username === myUsername ||
            p.user?.username === myUsername ||
            (myTeam !== "solo" && p.team === myTeam);
          if (isMe) {
            const nextTime = elapsedNow !== null
              ? Math.max(0, durSec - elapsedNow)
              : Math.max(0, (p.timeLeft !== undefined && p.timeLeft !== null ? p.timeLeft : durSec) - 1);
            return {
              ...p,
              timeLeft: nextTime,
            };
          }
          return p;
        });
        return copy;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [battle?.status, battle?.startTime, battle?.duration, myUsername, myTeam, isRanked, isSelectionPhase]);

  // Run testcases locally via Judge0 (Public testcases only)
  const runTestcases = async () => {
    setLoading(true);
    const visible = currentProblem?.testcases || [];
    setDebugOutput(
      `> Initializing compilation node for [${currentProblem?.title || `Q${safeActiveIndex + 1}`}]...\n` +
      `> RUNNING PUBLIC TESTCASES ONLY (${visible.length} Public Tests)...\n` +
      `> Note: Hidden/Private testcases are verified only when you click "Submit Solution".\n` +
      `> Connecting to Judge0 CE...\n`
    );
    let testcaseResults = [];

    if (!code || !code.trim()) {
      setLoading(false);
      setDebugOutput((prev) => prev + "> Error: source buffer empty. Write solution before executing.\n");
      return;
    }

    if (!visible.length) {
      setLoading(false);
      setDebugOutput((prev) => prev + "> Warning: No public verification testcases found.\n");
      return;
    }

    const languageIdMap = { c: 50, cpp: 54, java: 62, python: 71 };

    for (let tc of visible) {
      try {
        const response = await axios.post(
          "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
          {
            source_code: code,
            language_id: languageIdMap[language],
            stdin: tc.input || "",
            expected_output: tc.output || "",
          }
        );

        const data = response.data;
        const actualOutput = (data.stdout || "").trim();
        const expected = (tc.output || "").trim();
        const passed = actualOutput === expected;

        testcaseResults.push({
          input: tc.input,
          output: tc.output,
          actual: actualOutput,
          passed,
          status: data.status?.description,
          stderr: data.stderr,
          compile_output: data.compile_output,
        });

        if (data.stderr || data.compile_output) {
          setDebugOutput(
            (prev) =>
              prev + `[RUNTIME ERROR]\n${data.stderr || data.compile_output}\n`
          );
        }
      } catch (err) {
        testcaseResults.push({
          input: tc.input,
          output: tc.output,
          actual: "Execution Error",
          passed: false,
          status: "Network/Judge Error",
        });
      }
    }

    setResults(testcaseResults);
    setLoading(false);
    setDebugOutput(
      (prev) =>
        prev +
        `> Public testcase execution finished: ${testcaseResults.filter((r) => r.passed).length}/${testcaseResults.length} passed.\n` +
        `> Click "Submit Solution" to run full evaluation against all private testcases and score points.\n`
    );
  };

  // Submit Solution handler (Evaluates against full private testcases on backend)
  const submitSolution = async () => {
    if (!contestId) return;
    setLoading(true);
    setDebugOutput(
      (prev) =>
        prev +
        `> SUBMIT SOLUTION: Transmitting solution for challenge [${currentProblem?.title || `Q${safeActiveIndex + 1}`}]...\n` +
        `> Evaluating against full PRIVATE testcase suite on server...\n`
    );

    const token = localStorage.getItem("token");
    const problemId = currentProblem?._id;
    const problemSlug = currentProblem?.slug || currentProblem?.title?.toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await axios.post(
        `${API}/api/battles/${contestId}/submit`,
        { 
          code, 
          language,
          problemId,
          problemSlug
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.result === "win" && !popupShownRef.current) {
        popupShownRef.current = true;
        const isMyTeamWin = Boolean(
          (res.data?.winningTeam && myTeam !== "solo" && res.data?.winningTeam === myTeam) ||
          (res.data?.winner && myTeam !== "solo" && res.data?.winner.includes(myTeam))
        );
        setIsWinner(isMyTeamWin || res.data?.winner === myUsername);
        setWinnerName(res.data?.winner || (isMyTeamWin ? `Team ${myTeam}` : myUsername));
        setShowResultPopup(true);
      } else if (res.data?.problemSolved && !res.data?.allSolved) {
        setDebugOutput(
          (prev) =>
            prev +
            `> 🎉 CHALLENGE SOLVED! Passed ${res.data.passedCount}/${res.data.totalTests} private testcases.\n` +
            `> Progress: ${res.data.solvedCount}/${res.data.totalRequired} challenges completed.\n`
        );
        if (res.data?.nextAssignedProblemIndex !== undefined) {
          handleSwitchProblem(res.data.nextAssignedProblemIndex);
          setDebugOutput(
            (prev) =>
              prev +
              `> 🚀 [AUTO-ASSIGN] Next objective automatically assigned: Challenge #${res.data.nextAssignedProblemIndex + 1} (${res.data.nextAssignedProblem?.title || `Question ${res.data.nextAssignedProblemIndex + 1}`})!\n`
          );
        }
      } else {
        setDebugOutput(
          (prev) =>
            prev +
            `> Private testcase evaluation: Passed ${res.data.passedCount}/${res.data.totalTests} testcases.\n`
        );
      }

      await fetchBattleStatus();
    } catch (err) {
      console.error("Submit error", err);
      setDebugOutput((prev) => prev + `> Submit error: ${err.response?.data?.error || "Submission rejected"}\n`);
    } finally {
      setLoading(false);
    }
  };



  // Offline Database Hint handler
  const requestHint = async () => {
    setShowHintBox(true);
    if (hint) return;
    setHintLoading(true);
    const token = localStorage.getItem("token");
    const problemSlug = currentProblem?.slug || currentProblem?.title?.toLowerCase().replace(/\s+/g, "-");

    try {
      const res = await axios.post(
        `${API}/api/problems/${problemSlug}/hint`,
        { hintLevel: 1 },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.hint) {
        setHint(res.data.hint);
      } else {
        setHint(currentProblem?.hints?.h1 || "Analyze edge cases and optimal time-complexity bounds.");
      }
    } catch (e) {
      setHint(currentProblem?.hints?.h1 || "Review data structures suitable for this operation.");
    } finally {
      setHintLoading(false);
    }
  };

  if (!battle) {
    return (
      <div className="h-screen max-h-screen flex flex-col items-center justify-center bg-[#050b10] text-white font-mono p-6">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-orange-400 animate-pulse text-center">
          Synchronizing Combat Arena Telemetry...
        </h2>
        <p className="text-xs text-gray-500 mt-2 font-mono text-center">Connecting to contest node [{contestId}]...</p>

        {(syncTimeout || syncError) && (
          <div className="mt-6 max-w-md w-full bg-red-950/40 border border-orange-500/40 rounded-2xl p-5 text-center animate-in fade-in duration-300">
            <p className="text-xs text-orange-300 mb-4 font-sans leading-relaxed">
              {syncError || "Connecting is taking longer than expected. Node telemetry may still be compiling or recovering."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSyncTimeout(false);
                  setSyncError(null);
                  fetchBattleStatus();
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30"
              >
                Retry Node Connection
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Exit Arena
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onCopy={handleCopyBlocked}
      onCut={handleCopyBlocked}
      onPaste={handlePasteBlocked}
      onContextMenu={(e) => e.preventDefault()}
      className={`h-screen max-h-screen flex flex-col bg-[#050b10] text-white font-sans select-none overflow-hidden ${
        isWindowBlurred ? "filter blur-sm" : ""
      }`}
    >
      <style>{`
        @media print {
          body { display: none !important; }
        }
        .code-font {
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
        }
      `}</style>

      {/* MANDATORY FULLSCREEN GATEWAY */}
      <FullscreenGatewayModal
        isFullscreen={isFullscreen}
        onEnterFullscreen={enterFullscreen}
        environmentName={isRanked ? "Ranked 1v1 Battle" : "Contest Arena"}
      />

      {/* SECURITY BANNER ALERT */}
      {showSecurityAlert && (
        <div className="bg-red-950/90 border-b border-red-500/50 text-red-200 px-6 py-2.5 text-xs flex items-center justify-between z-50 animate-bounce font-mono">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-400" />
            <span>{alertMessage}</span>
          </div>
          <button
            onClick={() => setShowSecurityAlert(false)}
            className="text-red-400 hover:text-white font-bold px-2 py-0.5"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* TOP ARENA BAR - ONLY SINGLE COUNTDOWN TIMER */}
      <nav className="w-full py-2.5 px-4 sm:px-6 md:px-8 bg-[#0a1118] border-b border-white/20 flex justify-between items-center shrink-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1.5 text-gray-300 hover:text-red-400 text-xs font-bold uppercase transition bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/30 hover:border-white cursor-pointer"
            title={battle?.status === "finished" ? "View Match Results" : "Exit Match"}
          >
            <FaArrowLeft /> {battle?.status === "finished" ? "View Results" : (isRanked ? "Exit Battle" : "Exit Contest")}
          </button>

          <span className="text-gray-500">|</span>

          <h1 className="text-lg font-black italic tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            BATT<span className="text-orange-500">LIX</span>
          </h1>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider ${
            isRanked
              ? "bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold"
              : "bg-white/5 border border-white/30 text-white"
          }`}>
            {isRanked ? "Ranked 1v1 Duel" : (isTeamMatch ? `${battle?.battleType || "Squad"} Battle` : "Contest Arena")}
          </span>
        </div>

        {/* PROGRESS AND TIMER */}
        <div className="flex items-center gap-3">
          {/* MULTI-QUESTION PROGRESS BADGE (SOLO / FFA ONLY) */}
          {!isTeamMatch && problemsList.length > 1 && (
            <div className="hidden sm:flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.08)] font-mono text-xs">
              <span className="text-gray-400">Arena Goal:</span>
              <span className="text-green-400 font-bold">{mySolvedCount}/{totalRequired} Solved</span>
              {opponentParticipant && (
                <>
                  <span className="text-gray-600">|</span>
                  <span className="text-orange-400">Rival: {opponentSolvedCount}/{totalRequired}</span>
                </>
              )}
            </div>
          )}

          {/* TIMER / RANKED SPRINT BADGE */}
          {isRanked ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/10 px-3.5 py-1.5 rounded-xl border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)] font-mono">
              <FaBolt className="text-orange-400 text-xs animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[8px] uppercase tracking-widest text-orange-300 font-bold">
                  Ranked Sprint
                </span>
                <span className="text-xs font-black text-white tracking-wider">
                  First to Solve All Wins
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <FaRegClock className="text-orange-500 animate-pulse text-xs" />
              <div className="flex flex-col text-right">
                <span className="text-[8px] uppercase tracking-widest text-gray-400 font-mono">
                  {myTeam !== "solo" ? "Team Time" : "Time Left"}
                </span>
                <span className="font-mono text-base font-black text-orange-400 tracking-wider">
                  {fmt(myTimeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* LOGGED IN USERNAME BADGE */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/20 px-3 py-1.5 rounded-xl font-mono text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <FaUser className="text-orange-400 text-xs" />
            <span className="text-gray-400 hidden sm:inline">User:</span>
            <span className="text-white font-bold tracking-wide">{myUsername}</span>
          </div>

          {/* SQUAD TEAM VOICE & TACTICAL CHAT (IF TEAM MATCH) */}
          {(myTeam !== "solo" || isTeamMatch) && (
            <TeamVoiceComms
              socket={socketRef.current}
              roomId={battle?.roomId || contestId}
              team={myTeam !== "solo" ? myTeam : "A"}
              username={myUsername}
            />
          )}
        </div>
      </nav>

      {/* TEAM EXIT VOTE NOTIFICATION TOAST */}
      {exitNotification && (
        <div className="bg-red-950/90 border-b border-red-500/50 text-red-200 px-6 py-2.5 text-xs flex items-center justify-between z-50 font-mono">
          <span>{exitNotification}</span>
          <button onClick={() => setExitNotification("")} className="text-red-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* TEAM EXIT REQUEST INITIATOR MODAL (WAITING FOR SQUAD CONSENSUS) */}
      {isMyExitRequested && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1118] border-2 border-orange-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">
              Waiting for Squad Consensus
            </h3>
            <p className="text-xs text-gray-300 mb-6 font-mono leading-relaxed">
              Your exit/forfeit vote has been sent to your teammates. All squad members must accept for the team to exit. If any teammate declines, combat continues!
            </p>
            <button
              onClick={handleCancelExitVote}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Cancel Request & Keep Fighting
            </button>
          </div>
        </div>
      )}

      {/* TEAM EXIT REQUEST RESPONDENT MODAL (ACCEPT OR DECLINE) */}
      {exitVoteInitiator && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1118] border-2 border-red-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in zoom-in-95">
            <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">
              Squad Exit Request
            </h3>
            <p className="text-xs text-gray-300 mb-6 font-mono leading-relaxed">
              Operative <span className="text-orange-400 font-bold">{exitVoteInitiator}</span> has initiated a squad surrender/exit vote.
              <br /><br />
              Do you agree to surrender and exit to results review? If you decline, the match continues!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRespondExitVote(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Decline & Keep Fighting
              </button>
              <button
                onClick={() => handleRespondExitVote(true)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Accept & Exit
              </button>
            </div>
          </div>
        </div>
      )}



      {/* SQUAD MISSION COMMAND BAR: ONLY SELECTED PROBLEM SHOWN TO EACH PLAYER */}
      {isTeamMatch && myTeam !== "solo" ? (
        <div className="w-full bg-[#050b10] border-b border-blue-500/30 px-4 sm:px-6 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-md">
          {/* LEFT: MY ASSIGNED MISSION */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/40 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <span className="text-gray-400 font-bold uppercase tracking-wider">Your Assigned Mission:</span>
              <span className="text-white font-black text-sm">
                Challenge #{safeActiveIndex + 1}: {currentProblem?.title || `Question ${safeActiveIndex + 1}`}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ml-1 ${
                currentProblem?.difficulty === "easy"
                  ? "bg-green-500/10 border-green-500/40 text-green-400"
                  : currentProblem?.difficulty === "medium"
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                  : "bg-red-500/10 border-red-500/40 text-red-400"
              }`}>
                {currentProblem?.difficulty || "Medium"}
              </span>
            </div>

            {isProblemSolved(currentProblem) && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                <FaCheckCircle /> Objective Completed!
              </span>
            )}
          </div>

          {/* RIGHT: TEAMMATES AND RIVALS STATUS OVERVIEW */}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {teammateParticipants.map((tp, idx) => {
              const tUsername = tp.user?.username || tp.username || tp.user || "Teammate";
              const tAssigned = tp.assignedProblemIndex !== undefined ? tp.assignedProblemIndex : (safeActiveIndex === 0 ? 1 : 0);
              const tProb = problemsList[tAssigned];
              const tSolved = tp.solvedProblems?.some(sp => (sp?._id || sp)?.toString() === (tProb?._id || "").toString());
              return (
                <div key={idx} className="flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-mono">
                  <FaUsers className="text-blue-400 text-xs" />
                  <span className="text-gray-300 font-bold">{tUsername}:</span>
                  <span className="text-blue-300">Q{tAssigned + 1}</span>
                  <span className={tSolved ? "text-emerald-400 font-bold" : "text-amber-400 font-semibold"}>
                    {tSolved ? "✓ Solved" : "Solving..."}
                  </span>
                </div>
              );
            })}

            {/* TEAM SOLVED TOTAL PILL */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs font-mono text-orange-300">
              <span className="text-gray-400">Squad Goal:</span>
              <span className="font-bold text-white">{squadSolvedCount}/{totalRequired} Solved</span>
              {squadSolvedCount === totalRequired && (
                <span className="text-emerald-400 font-bold ml-1">🏆 All Complete!</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SOLO / FFA MULTI-QUESTION COMMAND BAR */
        problemsList.length > 1 && (
          <div className="w-full bg-[#050b10] border-b border-white/20 px-4 sm:px-6 md:px-8 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-md">
            {/* LEFT: STEPPERS & CHALLENGE CAPSULES */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold hidden sm:inline">
                Challenges:
              </span>

              {/* PREV BUTTON */}
              <button
                onClick={() => handleSwitchProblem(safeActiveIndex - 1)}
                disabled={safeActiveIndex === 0}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 border ${
                  safeActiveIndex === 0
                    ? "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                    : "bg-white/10 border-white/30 text-white hover:bg-orange-500 hover:text-black hover:border-orange-500 cursor-pointer"
                }`}
                title="Previous Question"
              >
                <FaChevronLeft size={10} /> Prev
              </button>

              {/* QUESTION CAPSULES */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {problemsList.map((prob, idx) => {
                  const solved = isProblemSolved(prob);
                  const isActive = idx === safeActiveIndex;
                  const diff = prob.difficulty || "medium";
                  const diffDot =
                    diff === "easy"
                      ? "bg-emerald-400"
                      : diff === "medium"
                      ? "bg-amber-400"
                      : "bg-rose-500";

                  return (
                    <button
                      key={prob._id || idx}
                      onClick={() => handleSwitchProblem(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-white shadow-[0_0_15px_rgba(249,115,22,0.6)] font-black scale-105"
                          : solved
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                          : "bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/50"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${diffDot} shrink-0`}></span>
                      <span>Q{idx + 1}</span>
                      {solved ? (
                        <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
                      ) : (
                        <span className="text-[10px] opacity-60 capitalize font-sans">{diff}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* NEXT BUTTON */}
              <button
                onClick={() => handleSwitchProblem(safeActiveIndex + 1)}
                disabled={safeActiveIndex >= problemsList.length - 1}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 border ${
                  safeActiveIndex >= problemsList.length - 1
                    ? "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                    : "bg-white/10 border-white/30 text-white hover:bg-orange-500 hover:text-black hover:border-orange-500 cursor-pointer"
                }`}
                title="Next Question"
              >
                Next <FaChevronRight size={10} />
              </button>
            </div>

            {/* RIGHT: QUICK SELECT DROPDOWN & PROGRESS */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative flex items-center">
                <select
                  value={safeActiveIndex}
                  onChange={(e) => handleSwitchProblem(Number(e.target.value))}
                  aria-label="Quick jump to problem challenge"
                  className="bg-[#0a1118] border border-white/30 hover:border-white/60 text-white text-xs font-mono rounded-lg px-2.5 py-1 outline-none cursor-pointer pr-6 appearance-none transition"
                >
                  {problemsList.map((prob, idx) => (
                    <option key={prob._id || idx} value={idx} className="bg-[#0a1118] text-white">
                      {`Challenge ${idx + 1}: ${prob.title || `Question ${idx + 1}`} ${isProblemSolved(prob) ? "✓ Solved" : ""}`}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 pointer-events-none text-gray-400 text-[10px]">▼</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[11px] font-mono text-orange-300">
                <span className="font-bold text-white">
                  {mySolvedCount}/{totalRequired} Solved
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-emerald-400 font-semibold tracking-wide">
                  {mySolvedCount === totalRequired ? "All Solved! 🏆" : `${totalRequired - mySolvedCount} Remaining`}
                </span>
              </div>
            </div>
          </div>
        )
      )}

      {/* MAIN COMBAT ARENA - RESIZABLE SPLIT LAYOUT WITH INDEPENDENT SCROLL */}
      <div
        ref={containerRef}
        className="flex flex-1 px-4 sm:px-6 md:px-8 py-3 pb-8 gap-0 md:gap-2 overflow-hidden w-full relative min-h-0"
      >
        {/* LEFT: PROBLEM SPECIFICATIONS (INDEPENDENT SLIDER, EXACT MATCH TO PRACTICE PAGE) */}
        <div
          style={{ width: `${leftPercent}%` }}
          className="min-w-[280px] bg-[#0a1118] border-2 border-white/40 rounded-xl flex flex-col overflow-hidden shadow-2xl shrink-0 h-full min-h-0"
        >
          {/* PROBLEM HEADER */}
          <div className="px-3 py-2.5 border-b border-white/20 bg-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FaTerminal className="text-orange-500 text-sm" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                {problemsList.length > 1
                  ? `Challenge ${safeActiveIndex + 1} of ${problemsList.length}`
                  : "Problem Specifications"}
              </h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                currentProblem?.difficulty === "easy"
                  ? "bg-green-500/10 border-green-500/40 text-green-400"
                  : currentProblem?.difficulty === "medium"
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                  : "bg-red-500/10 border-red-500/40 text-red-400"
              }`}
            >
              {currentProblem?.difficulty || "Medium"}
            </span>
          </div>

          {/* PROBLEM CONTENT */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0" onCopy={handleCopyBlocked}>
            {/* TEAM SQUAD ASSIGNMENT BANNER */}
            {myTeam !== "solo" && (
              <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs font-mono flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-blue-400 text-sm shrink-0" />
                  <div>
                    <span className="text-gray-400">Team {myTeam} Assignment: </span>
                    <span className="font-bold text-white">
                      Challenge #{safeActiveIndex + 1}: {currentProblem?.title || `Question ${safeActiveIndex + 1}`}
                    </span>
                    <span className="text-blue-300/80 text-[11px] block sm:inline sm:ml-2">
                      (Auto-assigned • Solve to unlock next squad challenge)
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-[10px] uppercase font-bold tracking-wider border border-blue-400/40 shrink-0">
                  {isProblemSolved(currentProblem) ? "✓ Solved" : "Active Objective"}
                </div>
              </div>
            )}

            {isProblemSolved(currentProblem) && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-green-500/15 border border-green-500/40 text-green-300 text-xs font-bold flex items-center gap-2">
                <FaCheckCircle className="text-green-400 text-sm shrink-0" />
                <span>
                  {myTeam !== "solo"
                    ? squadSolvedCount >= totalRequired
                      ? "🎉 Squad objective accomplished! All team challenges solved."
                      : "🎉 Challenge verified! Loading next squad challenge objective..."
                    : "You have solved this challenge! Choose another question tab above to solve all and claim victory."}
                </span>
              </div>
            )}

            <h2 className="text-2xl font-black mb-3 text-white">
              {currentProblem?.title || "Classified Challenge"}
            </h2>

            {/* HINT BUTTON BELOW EQUATION TITLE (EXACT REFERENCE TO PRACTICE PAGE) */}
            <button
              onClick={requestHint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-white/30 hover:border-white text-xs font-bold transition uppercase tracking-wider mb-4"
            >
              <FaLightbulb /> Hint
            </button>

            {/* HINT BOX */}
            {showHintBox && (
              <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-white/30 text-xs text-orange-200 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold flex items-center gap-1.5 text-orange-400">
                    <FaLightbulb /> Problem Hint
                  </span>
                  <button onClick={() => setShowHintBox(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                {hintLoading ? (
                  <div className="animate-pulse font-mono text-gray-400">Retrieving hint...</div>
                ) : (
                  <p className="leading-relaxed font-sans">{hint}</p>
                )}
              </div>
            )}

            <div className="space-y-4 text-white text-sm leading-relaxed">
              <p className="whitespace-pre-line">{currentProblem?.description}</p>

              {/* TOPICS */}
              {currentProblem?.topics && currentProblem.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentProblem.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/5 border border-white/20 rounded-md text-[10px] text-white font-bold uppercase flex items-center gap-1"
                    >
                      <FaBrain size={10} className="text-blue-400" /> {t}
                    </span>
                  ))}
                </div>
              )}

              {/* EXAMPLES */}
              <div className="mt-6 space-y-4">
                {(currentProblem?.examples || []).map((ex, i) => (
                  <div key={i} className="bg-black/50 p-4 rounded-xl border border-white/20 font-mono text-xs shadow-inner">
                    <h3 className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Example {i + 1}
                    </h3>
                    <div className="space-y-1.5 text-white">
                      <div><span className="text-slate-400 font-semibold">Input:</span> {ex.input}</div>
                      <div><span className="text-slate-400 font-semibold">Output:</span> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-slate-300 text-xs mt-1.5 font-sans leading-relaxed border-t border-white/20 pt-1.5">{ex.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CONSTRAINTS */}
              {currentProblem?.constraints && currentProblem.constraints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">
                    Constraints:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-white">
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE RESIZABLE DRAGGER */}
        <SplitDivider
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleReset}
        />

        {/* RIGHT: COMPILER (INDEPENDENT SLIDER, EXACT MATCH TO PRACTICE PAGE) */}
        <div
          style={{ width: `calc(${100 - leftPercent}% - 0.5rem)` }}
          className="flex-1 min-w-[320px] flex flex-col h-full min-h-0"
        >
          <div className="flex-1 bg-[#0a1118] border-2 border-white/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-full min-h-0">
            {/* UNIFIED EDITOR TOP BAR WITH UNIQUE LANGUAGE DROPDOWN */}
            <EditorTopBar
              language={language}
              onLanguageChange={handleLanguageChange}
              title={problemsList.length > 1 ? `Solution Workspace // Q${safeActiveIndex + 1}: ${currentProblem?.title || `Challenge ${safeActiveIndex + 1}`}` : "Solution Workspace // Tab=Indent"}
            />

            {/* CODE EDITOR WITH SYNTAX COLOR HIGHLIGHTING & LINE NUMBERS */}
            <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                placeholder="// Execute your algorithm here...&#10;// Anti-cheat is armed: live typing only."
                onPaste={handlePasteBlocked}
                onCopy={handleCopyBlocked}
              />
            </div>

            {/* OUTPUT / TELEMETRY LOG (COLLAPSED/SCROLLED INSIDE BOTTOM OF EDITOR WINDOW) */}
            {debugOutput && (
              <div className="h-32 bg-[#050b10] border-t border-white/20 p-3 font-mono text-[11px] text-gray-300 overflow-y-auto custom-scrollbar shrink-0">
                <pre className="whitespace-pre-wrap">{debugOutput}</pre>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="p-3 bg-black/40 border-t border-white/20 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={runTestcases}
                disabled={loading}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border border-white/30 hover:border-white disabled:opacity-50"
              >
                <FaPlay className="text-[10px]" /> Run Tests
              </button>

              <button
                onClick={submitSolution}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl transition hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 border border-white/20 disabled:opacity-50"
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup */}
      {showResultPopup && (
        <ResultPopup
          isWinner={isWinner}
          winnerName={winnerName}
          onClose={() => {
            setShowResultPopup(false);
            navigate(`/results/${contestId}`, {
              state: { opponentDraftCode }
            });
          }}
        />
      )}
    </div>
  );
};

export default ContestPage;