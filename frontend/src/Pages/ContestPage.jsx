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

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [battle, setBattle] = useState(location.state?.battle || null);
  const socketRef = useRef(null);

  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [winnerName, setWinnerName] = useState("");

  const popupShownRef = useRef(false);

  const API = import.meta.env.VITE_API_URL;

  const languageIdMap = { c: 50, cpp: 54, java: 62, python: 71 };

  const TESTCASES = [];

  const runTestcases = async () => {
    setLoading(true);
    setDebugOutput(
      "> Initializing compiler...\n> Connecting to Judge0 CE...\n"
    );
    let testcaseResults = [];

    if (!code || !code.trim()) {
      setLoading(false);
      setDebugOutput(
        (prev) => prev + "> Error: please enter code before running.\n"
      );
      alert("Please write some code before running the testcases.");
      return;
    }

    const visible =
      battle &&
      battle.problem &&
      Array.isArray(battle.problem.testcases) &&
      battle.problem.testcases.length
        ? battle.problem.testcases
        : TESTCASES;

    for (let tc of visible) {
      try {
        const response = await axios.post(
          "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
          {
            source_code: code,
            language_id: languageIdMap[language],
            stdin: tc.input,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const result = response.data;
        let output = result.stdout ? result.stdout.trim() : "";
        let passed = output === tc.output;

        testcaseResults.push({
          input: tc.input,
          expected: tc.output,
          output,
          passed,
        });
      } catch (err) {
        console.error(
          "Judge0 API error",
          err.response?.data || err.message || err
        );
        const errOutput =
          err.response?.data?.stderr || err.response?.data || "Execution Error";
        testcaseResults.push({
          input: tc.input,
          expected: tc.output,
          output: errOutput,
          passed: false,
        });
        setDebugOutput(
          (prev) =>
            prev +
            `> Judge0 error for input(${tc.input}): ${JSON.stringify(
              err.response?.data || err.message
            )}\n`
        );
      }
    }

    setResults(testcaseResults);
    setDebugOutput(
      (prev) => prev + "> Execution complete. Check logs below.\n"
    );
    setLoading(false);
  };

  const fmt = (s) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API}/api/battles/${contestId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.battle) setBattle(res.data.battle);
      } catch (err) {
        console.error("Failed to get battle status", err);
      }
    };

    fetchStatus();

  socketRef.current = io(API, {
    transports: ["websocket"],
  });

  socketRef.current.on("connect", () => {
    console.log("Socket connected:", socketRef.current.id);
    socketRef.current.emit("join-battle", contestId);
  });


    // ✅ FIXED: Handle battle-ended event for BOTH winner and loser
    socketRef.current.on("battle-ended", ({ winner }) => {
      console.log("Battle ended event received. Winner:", winner);
      
      
      const myUsername = location.state?.username || localStorage.getItem("username");
      

      console.log("My username:", myUsername);
      console.log("Popup already shown?", popupShownRef.current);

      if (!popupShownRef.current) {
        popupShownRef.current = true;
        
        // Determine if current user is the winner
        const amIWinner = winner === myUsername;
        
        console.log("Am I winner?", amIWinner);
        
        setIsWinner(amIWinner);
        setWinnerName(winner);
        setShowResultPopup(true);
      }
    });

    socketRef.current.on("battle-updated", (data) => {
      if (data && data.battleId === contestId) fetchStatus();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-battle", contestId);
        socketRef.current.disconnect();
      }
    };
  }, [contestId, location.state?.username]);

  useEffect(() => {
    if (!battle) return;
    const t = setInterval(() => {
      setBattle((prev) => {
        if (!prev) return prev;
        const copy = JSON.parse(JSON.stringify(prev));
        copy.participants = copy.participants.map((p) => ({
          ...p,
          timeLeft: Math.max(0, (p.timeLeft || 0) - 1),
        }));
        return copy;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [battle]);

  // ✅ FIXED: Submit solution handler
  const submitSolution = async () => {
    if (!contestId) return;
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API}/api/battles/${contestId}/submit`,
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Submit response:", res.data);

      // ✅ If I won, show popup immediately (before socket event)
      if (!popupShownRef.current && res.data?.result === "win") {
        popupShownRef.current = true;
        
        const myUsername = location.state?.username || localStorage.getItem("username");
        
        setIsWinner(true);
        setWinnerName(myUsername);
        setShowResultPopup(true);
      }

      // Fetch updated battle status
      const st = await axios.get(`${API}/api/battles/${contestId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (st.data?.battle) {
        setBattle(st.data.battle);
      }

    } catch (err) {
      console.error("Submit error", err);
      alert(err.response?.data?.error || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b10] text-white font-sans">
      {/* TOP HUD */}
      <nav className="w-full py-4 px-8 bg-[#0a1118] border-b border-white/10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black italic tracking-tighter">
            BATT
            <span className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
              LIX
            </span>
          </h1>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest text-gray-400">
            Sector: Alpha_Contest
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-orange-500 font-mono text-xl bg-orange-500/10 px-4 py-1 rounded-full border border-orange-500/20">
            <FaRegClock className="animate-pulse" />
            <span>
              {battle && battle.participants
                ? fmt(
                    Math.max(...battle.participants.map((p) => p.timeLeft || 0))
                  )
                : "--:--"}
            </span>
          </div>
          <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold px-4 py-2 rounded border border-red-500/30 transition">
            ABANDON MISSION
          </button>
        </div>
      </nav>

      {/* MAIN INTERFACE */}
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* LEFT: MISSION INTEL */}
        <div className="w-1/3 bg-[#0a1118] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <FaTerminal className="text-orange-500 text-sm" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">
              Mission Objectives
            </h2>
          </div>

          <div className="p-6 overflow-y-auto grow">
            <h2 className="text-2xl font-black mb-4">
              {battle?.problem?.title || "Problem"}
            </h2>

            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p
                dangerouslySetInnerHTML={{
                  __html: battle?.problem?.description || "No problem loaded.",
                }}
              />

              <div className="mt-8 space-y-4">
                {(battle?.problem?.examples || []).map((ex, i) => (
                  <div
                    key={i}
                    className="bg-black/40 p-4 rounded-lg border border-white/5"
                  >
                    <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-2">
                      Example
                    </h3>
                    <code className="text-white font-mono">
                      Input: {ex.input} — Output: {ex.output}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: COMPILER & LOGS */}
        <div className="w-2/3 flex flex-col gap-4">
          {/* EDITOR AREA */}
          <div className="flex-1 bg-[#0a1118] border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-2 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex gap-2 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>

              <div className="ml-4 flex items-center gap-3">
                {battle && battle.participants && (
                  <div className="flex items-center gap-3 text-sm">
                    {battle.participants.map((p, i) => (
                      <div key={i} className="text-gray-300">
                        {p.user}:{" "}
                        {fmt(p.timeLeft || (battle.duration || 30) * 60)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                className="bg-black/40 border border-white/10 text-orange-500 text-[10px] font-bold uppercase rounded px-3 py-1 outline-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="c">C-Lang</option>
                <option value="cpp">C++ Standard</option>
                <option value="java">Java Core</option>
                <option value="python">Python 3.x</option>
              </select>
            </div>

            <textarea
              className="flex-1 w-full p-6 bg-transparent font-mono text-sm outline-none resize-none text-orange-100/90 placeholder:opacity-20"
              placeholder="// Execute your logic here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            ></textarea>

            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={runTestcases}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all ${
                    loading
                      ? "bg-gray-800 text-gray-500"
                      : "bg-orange-500 text-black hover:bg-orange-400"
                  }`}
                >
                  {loading ? (
                    "Compiling..."
                  ) : (
                    <>
                      <FaPlay className="text-[10px]" /> Run
                    </>
                  )}
                </button>

                <button
                  onClick={submitSolution}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all ${
                    loading
                      ? "bg-gray-800 text-gray-500"
                      : "bg-green-500 text-black hover:bg-green-400"
                  }`}
                >
                  Submit
                </button>
              </div>

              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded bg-white/5 text-xs"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* CONSOLE & RESULTS */}
          <div className="h-1/3 flex gap-4">
            {/* TERMINAL LOG */}
            <div className="w-1/2 bg-black border border-white/10 rounded-xl p-4 font-mono text-[11px] overflow-y-auto">
              <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-white/5 pb-2">
                <FaCode /> <span>SYSTEM_LOGS</span>
              </div>
              <pre className="text-green-500 whitespace-pre-wrap">
                {debugOutput || "> System idle. Awaiting user input..."}
              </pre>
            </div>

            {/* TESTCASE STATUS */}
            <div className="w-1/2 bg-[#0a1118] border border-white/10 rounded-xl p-4 overflow-y-auto">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                Validation_Status
              </div>
              <div className="space-y-2">
                {results.length === 0 && (
                  <div className="text-gray-600 text-[10px] italic">
                    No simulation data available.
                  </div>
                )}
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      r.passed
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {r.passed ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                      <span className="text-[10px] font-bold">
                        NODE_{i + 1}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                        r.passed
                          ? "bg-green-500 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {r.passed ? "Success" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Result Popup */}
      {showResultPopup && (
        <ResultPopup
          isWinner={isWinner}
          winnerName={winnerName}
          onClose={() => {
            setShowResultPopup(false);
            navigate(`/results/${contestId}`);
          }}
        />
      )}
    </div>
  );
};

export default ContestPage;