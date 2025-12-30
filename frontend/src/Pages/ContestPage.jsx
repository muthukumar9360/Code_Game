import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaPlay,
  FaRegClock,
  FaTerminal,
  FaCheckCircle,
  FaTimesCircle,
  FaCode,
} from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import ResultPopup from "./ResultPopup.jsx";

const ContestPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [battle, setBattle] = useState(location.state?.battle || null);

  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [winnerName, setWinnerName] = useState("");

  const popupShownRef = useRef(false);
  const socketRef = useRef(null);

  const API = import.meta.env.VITE_API_URL;

  const languageIdMap = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
  };

  /* ---------------- TIMER FORMAT ---------------- */
  const fmt = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  /* ---------------- SOCKET + STATUS FETCH ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${API}/api/battles/${contestId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.battle) setBattle(res.data.battle);
      } catch (err) {
        console.error("Status fetch failed", err);
      }
    };

    fetchStatus();

    /* ✅ CORRECT SOCKET CONNECTION (NO HTTP FORCE) */
    socketRef.current = io(API, {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      socketRef.current.emit("join-battle", contestId);
    });

    /* ✅ BATTLE ENDED (WINNER + LOSER) */
    socketRef.current.on("battle-ended", ({ winnerUsername, winnerId }) => {
      if (popupShownRef.current) return;
      popupShownRef.current = true;

      const myId = localStorage.getItem("userId");

      setIsWinner(winnerId === myId);
      setWinnerName(winnerUsername);
      setShowResultPopup(true);
    });

    socketRef.current.on("battle-updated", fetchStatus);

    return () => {
      socketRef.current?.emit("leave-battle", contestId);
      socketRef.current?.disconnect();
    };
  }, [contestId]);

  /* ---------------- FALLBACK POPUP (PRODUCTION SAFE) ---------------- */
  useEffect(() => {
    if (!battle || popupShownRef.current) return;

    if (battle.status === "ended") {
      popupShownRef.current = true;

      const myId = localStorage.getItem("userId");
      const winnerId = battle.winnerId;

      setIsWinner(myId === winnerId);
      setWinnerName(battle.winnerUsername);
      setShowResultPopup(true);
    }
  }, [battle]);

  /* ---------------- TIMER DECREMENT ---------------- */
  useEffect(() => {
    if (!battle) return;
    const t = setInterval(() => {
      setBattle((prev) => {
        if (!prev) return prev;
        const copy = structuredClone(prev);
        copy.participants = copy.participants.map((p) => ({
          ...p,
          timeLeft: Math.max(0, (p.timeLeft || 0) - 1),
        }));
        return copy;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [battle]);

  /* ---------------- RUN TEST CASES ---------------- */
  const runTestcases = async () => {
    if (!code.trim()) {
      alert("Write code first");
      return;
    }

    setLoading(true);
    setResults([]);
    setDebugOutput("> Running testcases...\n");

    const testcases = battle?.problem?.testcases || [];

    const output = [];

    for (let tc of testcases) {
      try {
        const res = await axios.post(
          "https://ce.judge0.com/submissions?wait=true",
          {
            source_code: code,
            language_id: languageIdMap[language],
            stdin: tc.input,
          }
        );

        const out = (res.data.stdout || "").trim();
        output.push({
          passed: out === tc.output,
        });
      } catch {
        output.push({ passed: false });
      }
    }

    setResults(output);
    setLoading(false);
  };

  /* ---------------- SUBMIT ---------------- */
  const submitSolution = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/api/battles/${contestId}/submit`,
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.result === "win" && !popupShownRef.current) {
        popupShownRef.current = true;
        setIsWinner(true);
        setWinnerName(localStorage.getItem("username"));
        setShowResultPopup(true);
      }
    } catch (err) {
      alert("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#050b10] text-white flex flex-col">
      <nav className="px-6 py-3 bg-[#0a1118] flex justify-between items-center">
        <h1 className="font-black text-xl">
          BATT<span className="text-orange-500">LIX</span>
        </h1>
        <div className="flex items-center gap-2">
          <FaRegClock />
          {battle?.participants &&
            fmt(Math.max(...battle.participants.map((p) => p.timeLeft || 0)))}
        </div>
      </nav>

      <textarea
        className="flex-1 bg-black p-4 font-mono"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// write code"
      />

      <div className="flex gap-2 p-4">
        <button
          onClick={runTestcases}
          className="bg-orange-500 px-4 py-2 text-black"
        >
          Run
        </button>
        <button
          onClick={submitSolution}
          className="bg-green-500 px-4 py-2 text-black"
        >
          Submit
        </button>
      </div>

      {showResultPopup && (
        <ResultPopup
          isWinner={isWinner}
          winnerName={winnerName}
          onClose={() => navigate(`/results/${contestId}`)}
        />
      )}
    </div>
  );
};

export default ContestPage;
