import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaPlay,
  FaAward,
  FaFire,
  FaTerminal,
  FaHome,
  FaVial,
  FaTimes
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import CustomTestcasePlayground from "../Components/CustomTestcasePlayground.jsx";
import { SplitDivider, useResizableSplit } from "../Components/SplitDivider.jsx";
import EditorTopBar from "../Components/EditorTopBar.jsx";
import CodeEditor from "../Components/CodeEditor.jsx";
import { handleEditorKeyDown } from "../utils/editorUtils.js";
import { useSecureProctoring, FullscreenGatewayModal } from "../Components/SecureProctoringGuard.jsx";

const STARTER_CODES = {
  python: `def solve():
    # Read input and implement solution
    import sys
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    # Write your solution logic here
    pass

if __name__ == '__main__':
    solve()
`,
  javascript: `const readline = require('readline');

function solve() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let inputLines = [];
    rl.on('line', (line) => {
        inputLines.push(line);
    });

    rl.on('close', () => {
        // Write your solution logic here
    });
}

solve();
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution logic here

    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution logic here
    }
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your solution logic here
    return 0;
}
`
};

const DailyBlitz = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [problem, setProblem] = useState(null);
  const [dailyDate, setDailyDate] = useState("");
  const [isAlreadySolved, setIsAlreadySolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODES.python);

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");

  // Victory modal
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryStats, setVictoryStats] = useState(null);

  // Custom Testcases modal
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Draggable Middle Divider Split State
  const {
    leftPercent,
    isDragging,
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleReset
  } = useResizableSplit({
    initialPercent: 40,
    minPercent: 20,
    maxPercent: 75,
    storageKey: "battlix_daily_split"
  });

  // Strict Zero-Tolerance Proctoring
  const handleSecurityTermination = useCallback((reason) => {
    navigate("/");
  }, [navigate]);

  const {
    isFullscreen,
    warningActive,
    warningCountdown,
    warningReason,
    warningCount,
    maxWarnings,
    enterFullscreen,
    triggerViolation
  } = useSecureProctoring({
    onTerminate: handleSecurityTermination,
    enabled: true,
    environmentName: "Daily Blitz Challenge"
  });

  const handlePasteBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Clipboard paste detected in daily blitz editor");
  };

  const handleCopyBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Copy attempt detected in daily blitz workspace");
  };

  // Mandatory Login Gate for Daily Challenge (DC/DT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to participate in the Daily Challenge.");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch daily problem
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/api/problems/daily`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data?.success && res.data.problem) {
          setProblem(res.data.problem);
          setDailyDate(res.data.date);
          setIsAlreadySolved(Boolean(res.data.isSolvedToday));
        }
      } catch (err) {
        console.error("Error fetching daily problem:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [API]);

  // Handle language switch
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODES[lang] || "");
  };

  // Run Public Testcases (Does NOT solve challenge or increment streak)
  const handleRunTests = async () => {
    if (!problem?.slug) return;
    setSubmitting(true);
    setDebugOutput("> RUN CODE: Executing solution against Public Testcases...\n");

    try {
      const res = await axios.post(`${API}/api/problems/${problem.slug}/run`, {
        code,
        language
      });

      if (res.data?.results) {
        setResults(res.data.results);
        const passed = res.data.passedCount || 0;
        const total = res.data.totalTests || 0;
        setDebugOutput(
          (prev) =>
            prev +
            `> Public Run: ${passed}/${total} testcases passed.\n` +
            res.data.results.map((r, i) => `  Test #${i + 1}: ${r.testcase.passed ? "✓ PASSED" : `✗ FAILED (Expected: ${r.testcase.expectedOutput}, Got: ${r.testcase.actualOutput})`}`).join("\n") +
            `\n> Click 'Submit Daily Challenge' to verify against all Private Testcases and maintain your streak!\n`
        );
      }
    } catch (err) {
      setDebugOutput((prev) => prev + `> Error: ${err.response?.data?.error || err.message}\n`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit and complete Daily Problem (Evaluates all Private Testcases - 100% pass required)
  const handleCompleteBlitz = async () => {
    if (!code.trim()) {
      alert("Please write your code before submitting!");
      return;
    }

    setSubmitting(true);
    setDebugOutput((prev) => prev + "> SUBMITTING: Evaluating against all Private Testcases for daily streak...\n");
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API}/api/problems/daily/complete`,
        {
          problemSlug: problem.slug,
          code,
          language
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success) {
        setIsAlreadySolved(true);
        setVictoryStats(res.data);
        setShowVictoryModal(true);
        setDebugOutput(
          (prev) =>
            prev +
            `====================================================\n` +
            `>>> DAILY CHALLENGE ACCEPTED! <<<\n` +
            `All private testcases passed! Streak updated: ${res.data.streakCount} days!\n` +
            `====================================================\n`
        );
      }
    } catch (err) {
      console.error("Complete daily problem error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Submission rejected";
      setDebugOutput(
        (prev) =>
          prev +
          `====================================================\n` +
          `>>> DAILY CHALLENGE FAILED <<<\n` +
          `Verdict: Wrong Answer. 100% of private testcases must pass to solve today's challenge.\n` +
          `Detail: ${errMsg}\n` +
          `====================================================\n`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-yellow-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          INITIALIZING_DAILY_CHALLENGE...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-full bg-[#050b10] text-white flex flex-col font-sans select-none relative overflow-hidden">
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* MANDATORY FULLSCREEN GATEWAY & SKILLRACK WARNING */}
      <FullscreenGatewayModal
        isFullscreen={isFullscreen}
        warningActive={warningActive}
        warningCountdown={warningCountdown}
        warningReason={warningReason}
        warningCount={warningCount}
        maxWarnings={maxWarnings}
        onEnterFullscreen={enterFullscreen}
        environmentName="Daily Blitz Challenge"
      />

      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* TOP NAVIGATION & STATUS BAR */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#0a1118] border-b border-white/30 shrink-0 z-40 mt-3">
        <div className="flex items-center gap-3">
          <BackButton to="/" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-white/30">
              <FaBolt className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight uppercase flex items-center gap-2">
                Daily Problem <span className="text-yellow-400">Challenge</span>
              </h1>
              <p className="text-[10px] text-gray-300 font-mono">
                {dailyDate} // Daily Algorithmic Challenge
              </p>
            </div>
          </div>
        </div>

        {/* STATUS INDICATOR (NO TIMER) */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono transition-all duration-300 ${
              isAlreadySolved
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-black/60 border-yellow-500/40 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
            }`}
          >
            <FaCheckCircle className={isAlreadySolved ? "text-green-400 text-xs" : "text-yellow-400 text-xs"} />
            <div>
              <div className="text-[7px] uppercase tracking-widest text-gray-400 font-semibold leading-tight">
                Daily Status
              </div>
              <div className="text-xs font-black tracking-wider uppercase leading-tight">
                {isAlreadySolved ? "Solved Today" : "Active Challenge"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH WITH INDEPENDENT SCROLL */}
      <div
        ref={containerRef}
        className="flex flex-1 px-4 py-3 pb-8 gap-0 lg:gap-2 overflow-hidden w-full relative min-h-0"
      >
        {/* LEFT COLUMN: DAILY PROBLEM DETAILS (INDEPENDENT SLIDER) */}
        <div
          style={{ width: `${leftPercent}%` }}
          className="w-full lg:w-auto min-w-[280px] bg-[#0a1118] border-2 border-white/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl p-5 space-y-4 shrink-0 h-full min-h-0"
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <FaTerminal className="text-yellow-400" />
              <span className="text-xs uppercase tracking-widest font-mono text-white font-bold">
                Problem Directive
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                problem?.difficulty === "easy"
                  ? "bg-green-500/10 border-green-500/40 text-green-400"
                  : problem?.difficulty === "medium"
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                  : "bg-red-500/10 border-red-500/40 text-red-400"
              }`}
            >
              {problem?.difficulty || "Medium"}
            </span>
          </div>

          <div className="overflow-y-auto custom-scrollbar space-y-4 flex-1 min-h-0 pr-1">
            <h2 className="text-xl font-black text-white">{problem?.title}</h2>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {problem?.description}
            </p>

            {/* EXAMPLES */}
            {problem?.examples?.map((ex, idx) => (
              <div key={idx} className="bg-black/50 p-3 rounded-xl border border-white/20 font-mono text-xs">
                <div className="text-orange-400 text-[10px] font-bold mb-1">Example #{idx + 1}</div>
                <div><span className="text-gray-500">Input:</span> <span className="text-gray-200">{ex.input}</span></div>
                <div><span className="text-gray-500">Output:</span> <span className="text-green-400">{ex.output}</span></div>
                {ex.explanation && (
                  <div className="text-white text-[11px] mt-1 font-sans italic">{ex.explanation}</div>
                )}
              </div>
            ))}

            {/* CONSTRAINTS */}
            {problem?.constraints?.length > 0 && (
              <div className="pt-2 border-t border-white/20">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Constraints:</h4>
                <ul className="space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="text-xs text-white font-mono list-disc list-inside">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE RESIZABLE DRAGGER */}
        <SplitDivider
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleReset}
        />

        {/* RIGHT COLUMN: CODE EDITOR & SUBMIT (INDEPENDENT SLIDER) */}
        <div
          style={{ width: `calc(${100 - leftPercent}% - 0.5rem)` }}
          className="w-full lg:w-auto flex-1 min-w-[320px] bg-[#0a1118] border-2 border-white/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-full min-h-0"
        >
          {/* UNIFIED EDITOR TOP BAR WITH UNIQUE LANGUAGE DROPDOWN */}
          <EditorTopBar
            language={language}
            onLanguageChange={handleLanguageChange}
            title="Solution Workspace // Tab=Indent"
          />

          {/* CODE EDITOR WITH SYNTAX COLOR HIGHLIGHTING & LINE NUMBERS */}
          <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              placeholder="Type your optimal solution here..."
              onPaste={handlePasteBlocked}
              onCopy={handleCopyBlocked}
            />
          </div>

          {/* OUTPUT / TELEMETRY LOG */}
          {debugOutput && (
            <div className="h-28 bg-[#050b10] border-t border-white/20 p-3 font-mono text-[11px] text-gray-300 overflow-y-auto custom-scrollbar shrink-0">
              <pre className="whitespace-pre-wrap">{debugOutput}</pre>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="p-3 bg-black/40 border-t border-white/20 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={submitting}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border border-white/30 disabled:opacity-50"
              >
                <FaPlay className="text-[10px]" /> Run Testcases
              </button>

              <button
                onClick={() => setShowCustomModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border border-white/30"
                title="Run Custom Testcases"
              >
                <FaVial className="text-[10px]" /> Custom Testcases
              </button>
            </div>

            <button
              onClick={handleCompleteBlitz}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl transition hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 border border-white/40 disabled:opacity-50"
            >
              <FaBolt /> Submit Daily Challenge
            </button>
          </div>
        </div>
      </div>

      {/* VICTORY MODAL: DAILY BADGE & STREAK MULTIPLIER */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1118] border-2 border-white/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-scaleIn relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-yellow-500/20 border border-white/30 mx-auto flex items-center justify-center text-4xl text-yellow-400 mb-4 animate-bounce">
              <FaAward />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-yellow-400 font-bold">
              DAILY DIRECTIVE ACCOMPLISHED
            </span>
            <h2 className="text-2xl font-black text-white mt-1 mb-2">
              Daily Challenge Solved!
            </h2>
            <p className="text-xs text-white mb-6">
              You verified all testcases, solved today's algorithmic directive, and preserved your daily streak!
            </p>

            {/* STREAK & BADGE CARDS */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-black/50 border border-white/25 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-white">Current Streak</div>
                <div className="text-xl font-black text-orange-400 font-mono flex items-center justify-center gap-1 mt-1">
                  <FaFire /> {victoryStats?.streakCount || 1} Days
                </div>
              </div>
              <div className="p-3 bg-black/50 border border-white/25 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-white">XP Earned</div>
                <div className="text-base sm:text-lg font-black text-yellow-400 font-mono mt-1 flex items-center justify-center gap-1">
                  <FaBolt /> {victoryStats?.alreadySolved || victoryStats?.xpGained === 0 ? "0 XP (Already Solved)" : `+${victoryStats?.xpGained || 150} Practice XP`}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/profile")}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition border border-white/30"
              >
                View in Profile
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition border border-white/30"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TESTCASE MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-4xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.3)]">
            {/* HEADER */}
            <div className="p-4 bg-white/5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-white/30">
                  <FaVial size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    Daily Challenge Custom Sandbox
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Inject custom input vectors and verify execution against today's problem in real-time
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/30 transition flex items-center gap-1.5 text-xs font-mono font-bold"
                title="Close Custom Testcase Modal"
              >
                <FaTimes size={13} />
                <span className="text-[10px] uppercase tracking-wider">Close ✕</span>
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 overflow-y-auto flex-1">
              <CustomTestcasePlayground
                code={code}
                language={language}
                onClose={() => setShowCustomModal(false)}
              />
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-black/50 border-t border-white/20 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400 text-[11px]">
                Language: <strong className="text-yellow-400 uppercase">{language}</strong> • Isolated cloud runner
              </span>
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition border border-white/30"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyBlitz;
