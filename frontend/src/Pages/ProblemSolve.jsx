import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaCode,
  FaTerminal,
  FaLightbulb,
  FaBolt,
  FaTrophy,
  FaArrowLeft,
  FaBrain,
  FaVial,
  FaTimes,
  FaEye,
  FaCopy,
  FaCheck,
  FaUser
} from "react-icons/fa";
import CustomTestcasePlayground from "../Components/CustomTestcasePlayground.jsx";
import { SplitDivider, useResizableSplit } from "../Components/SplitDivider.jsx";
import EditorTopBar from "../Components/EditorTopBar.jsx";
import CodeEditor from "../Components/CodeEditor.jsx";
import { handleEditorKeyDown } from "../utils/editorUtils.js";
import { useSecureProctoring, FullscreenGatewayModal } from "../Components/SecureProctoringGuard.jsx";

export const STARTER_CODES = {
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

const ProblemSolve = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODES.python);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [debugOutput, setDebugOutput] = useState("");

  // AI Hint state
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Solved Reward Modal state
  const [rewardModal, setRewardModal] = useState(null);

  // Custom Testcases state
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
    initialPercent: 38,
    minPercent: 20,
    maxPercent: 75,
    storageKey: "battlix_practice_split"
  });

  const languageIdMap = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
    javascript: 63,
  };

  const [isSolved, setIsSolved] = useState(false);
  const [acceptedSolution, setAcceptedSolution] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [copiedAcceptedCode, setCopiedAcceptedCode] = useState(false);

  // Tab, auto-indent, auto-space, bracket auto-close handling for code editor
  const handleKeyDown = (e) => {
    handleEditorKeyDown(e, code, setCode);
  };

  // Strict Zero-Tolerance Proctoring
  const handleSecurityTermination = useCallback((reason) => {
    navigate("/problems");
  }, [navigate]);

  const { isFullscreen, enterFullscreen, triggerViolation } = useSecureProctoring({
    onTerminate: handleSecurityTermination,
    enabled: true,
    environmentName: "Practice Arena"
  });

  const handlePasteBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Clipboard paste detected in practice editor");
  };

  const handleCopyBlocked = (e) => {
    e.preventDefault();
    triggerViolation("Copy attempt detected in practice workspace");
  };

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const res = await axios.get(`${API}/api/problems/${slug}`);
      setProblem(res.data);

      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (userId) {
        axios.get(`${API}/api/users/${userId}/submissions-history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).then(subRes => {
          if (subRes.data?.solvedProblems) {
            const matchedSolved = subRes.data.solvedProblems.find(
              sp => (sp.problemId && sp.problemId.toString() === res.data._id?.toString()) ||
                    (sp.slug && sp.slug.toLowerCase() === slug.toLowerCase()) ||
                    (sp.title && sp.title.toLowerCase() === res.data.title?.toLowerCase())
            );
            if (matchedSolved) {
              setIsSolved(true);
              setAcceptedSolution({
                code: matchedSolved.lastSolutionCode || code,
                language: matchedSolved.language || "python",
                solvedAt: matchedSolved.solvedAt || new Date().toISOString()
              });
            }
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load problem", err);
    }
  };

  // Handle language switch with starter code
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const isStarter = Object.values(STARTER_CODES).some(c => c.trim() === code.trim());
    if (!code.trim() || isStarter) {
      setCode(STARTER_CODES[newLang] || "");
    }
  };

  // Run Public Testcases (Does NOT mark problem as solved)
  const runTestcases = async () => {
    if (!problem) return;
    setLoading(true);
    setResults([]);
    setDebugOutput("> RUN CODE: Executing against 3 Public Testcases...\n");

    try {
      const res = await axios.post(`${API}/api/problems/${slug}/run`, {
        code,
        language
      });

      const data = res.data;
      if (data.results) {
        const mapped = data.results.map((r, i) => ({
          name: `Public Testcase #${i + 1}`,
          input: r.testcase.input,
          expected: r.testcase.expectedOutput,
          output: r.testcase.actualOutput,
          passed: r.testcase.passed
        }));
        setResults(mapped);

        setDebugOutput(
          `> RUN CODE COMPLETE: ${data.passedCount}/${data.totalTests} Public Testcases Passed.\n` +
          mapped.map((r, i) => `  [Public Test #${i + 1}]: ${r.passed ? "✓ PASSED" : `✗ FAILED (Expected: ${r.expected}, Got: ${r.output})`}`).join("\n") +
          `\n> NOTE: Running public tests does not mark problem as solved. Click 'Submit Solution' to verify against all Private Testcases.\n`
        );
      }
    } catch (err) {
      console.error("Run error:", err);
      // Fallback to client-side Judge0 with visible testcases
      const visibleTestcases = problem.testcases || [];
      let tempResults = [];

      for (let tc of visibleTestcases) {
        try {
          const res = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
              source_code: code,
              language_id: languageIdMap[language],
              stdin: tc.input,
            }
          );
          const output = res.data.stdout?.trim() || "";
          const expected = (tc.output || "").trim();
          tempResults.push({
            name: `Public Testcase`,
            input: tc.input,
            expected: tc.output,
            output: output || res.data.stderr || "No Output",
            passed: output === expected,
          });
        } catch (e) {
          tempResults.push({
            name: `Public Testcase`,
            input: tc.input,
            expected: tc.output,
            output: "Execution Error",
            passed: false,
          });
        }
      }

      setResults(tempResults);
      const passedCount = tempResults.filter((r) => r.passed).length;
      setDebugOutput(
        `> Public test run finished. Passed: ${passedCount}/${tempResults.length}\n` +
        tempResults.map((r, i) => `  Test #${i + 1}: ${r.passed ? "✓ PASSED" : `✗ FAILED (Expected: ${r.expected}, Got: ${r.output})`}`).join("\n") +
        `\n> Click 'Submit Solution' to evaluate Private Testcases.\n`
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit Solution (Evaluates against ALL Private Testcases - 100% pass required for solved)
  const submitSolution = async () => {
    if (!code.trim()) {
      alert("Please write some code before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    setSubmitLoading(true);
    setDebugOutput("> SUBMIT CODE: Evaluating solution against all Private Testcases...\n");

    try {
      const res = await axios.post(
        `${API}/api/problems/${slug}/submit`,
        { code, language },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const data = res.data;
      if (data.results) {
        setResults(
          data.results.map((r, i) => ({
            name: `Private Testcase #${i + 1}`,
            input: `[HIDDEN TESTCASE #${i + 1}]`,
            expected: `[CONFIDENTIAL]`,
            output: r.testcase.passed
              ? `[PASSED] Execution Time: ${r.testcase.executionTime || "0.01"}s`
              : `[FAILED] ${r.testcase.actualOutput || "Wrong Output"}`,
            passed: r.testcase.passed,
          }))
        );
      }

      if (data.allPassed) {
        setIsSolved(true);
        setAcceptedSolution({
          code,
          language,
          solvedAt: new Date().toISOString()
        });
        setDebugOutput(
          `====================================================\n` +
          `>>> VERDICT: ACCEPTED (PROBLEM SOLVED) <<<\n` +
          `All ${data.totalTests}/${data.totalTests} Private Testcases Successfully Passed!\n` +
          `XP Awarded to Your Profile.\n` +
          `====================================================\n`
        );
        if (data.reward) {
          setRewardModal(data.reward);
        } else {
          alert(`Accepted! All ${data.totalTests}/${data.totalTests} Private Testcases passed. Problem Solved!`);
        }
      } else {
        setDebugOutput(
          `====================================================\n` +
          `>>> VERDICT: WRONG ANSWER / FAILED <<<\n` +
          `Passed: ${data.passedCount}/${data.totalTests} Private Testcases.\n` +
          `STATUS: NOT SOLVED. All private testcases must pass (100% pass rate) for the problem to be marked as solved.\n` +
          `Please inspect the failed testcases and refine your solution.\n` +
          `====================================================\n`
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      setDebugOutput((prev) => prev + `> Submit error: ${err.response?.data?.error || "Submission rejected"}\n`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Request AI Hint
  const requestHint = async () => {
    setShowHint(true);
    if (hint) return;
    setHintLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API}/api/problems/${slug}/hint`,
        { hintLevel: 1 },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.hint) {
        setHint(res.data.hint);
      } else {
        setHint(problem.hints?.h1 || "Think about optimal time complexity constraints.");
      }
    } catch (e) {
      setHint(problem.hints?.h1 || "Review the input types and test edge cases like empty or single-element inputs.");
    } finally {
      setHintLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-orange-400 font-mono tracking-widest text-sm uppercase animate-pulse">
          INITIALIZING_PROBLEM_NODE...
        </h2>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#050b10] text-white font-sans overflow-hidden select-none">
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* MANDATORY FULLSCREEN GATEWAY */}
      <FullscreenGatewayModal
        isFullscreen={isFullscreen}
        onEnterFullscreen={enterFullscreen}
        environmentName="Practice Arena"
      />

      {/* TOP NAV */}
      <nav className="w-full py-2.5 px-4 mt-3 sm:px-6 md:px-8 bg-[#0a1118] border-b border-white/20 flex justify-between items-center shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/problems")}
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-xs font-bold uppercase transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/30 hover:border-white"
          >
            <FaArrowLeft /> Problems
          </button>
          <span className="text-gray-500">|</span>
          <h1 className="text-lg font-black italic tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            BATT<span className="text-orange-500">LIX</span>
          </h1>
          <span className="px-2.5 py-0.5 bg-white/5 border border-white/30 rounded-full text-[10px] uppercase font-mono tracking-wider text-white">
            Practice Module
          </span>
        </div>

        {/* LOGGED IN USER STATUS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/20 px-3 py-1.5 rounded-xl font-mono text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <FaUser className="text-orange-400 text-xs" />
            <span className="text-gray-400">User:</span>
            <span className="text-white font-bold tracking-wide">
              {localStorage.getItem("username") || "Combatant"}
            </span>
          </div>
        </div>
      </nav>

      {/* MAIN INTERFACE - RESIZABLE SPLIT LAYOUT WITH INDEPENDENT SCROLL */}
      <div
        ref={containerRef}
        className="flex flex-1 px-4 sm:px-6 md:px-8 py-3 pb-8 gap-0 md:gap-2 overflow-hidden w-full relative min-h-0"
      >
        {/* LEFT: PROBLEM DETAILS (INDEPENDENT SLIDER) */}
        <div
          style={{ width: `${leftPercent}%` }}
          className="min-w-[280px] bg-[#0a1118] border-2 border-white/40 rounded-xl flex flex-col overflow-hidden shadow-2xl shrink-0 h-full min-h-0"
        >
          <div className="px-3 py-2.5 border-b border-white/20 bg-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FaTerminal className="text-orange-500 text-sm" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                Problem Specifications
              </h2>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${problem.difficulty === "easy"
                ? "bg-green-500/10 border-green-500/40 text-green-400"
                : problem.difficulty === "medium"
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                  : "bg-red-500/10 border-red-500/40 text-red-400"
                }`}
            >
              {problem.difficulty}
            </span>

          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">

            <h2 className="text-2xl font-black mb-3">{problem.title}</h2>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={requestHint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-white/30 hover:border-white text-xs font-bold transition uppercase tracking-wider"
              >
                <FaLightbulb /> Hint
              </button>

              {isSolved && (
                <button
                  onClick={() => setShowSolutionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition uppercase tracking-wider"
                  title="View your accepted solution"
                >
                  <FaEye size={12} /> View Solution
                </button>
              )}
            </div>

            {/* HINT BOX */}
            {showHint && (
              <div className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-white/30 text-xs text-orange-200 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold flex items-center gap-1.5 text-orange-400">
                    <FaLightbulb /> Problem Hint
                  </span>
                  <button onClick={() => setShowHint(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                {hintLoading ? (
                  <div className="animate-pulse font-mono text-gray-400">Retrieving hint...</div>
                ) : (
                  <p className="leading-relaxed font-sans">{hint}</p>
                )}
              </div>
            )}

            <div className="space-y-4 text-white text-sm leading-relaxed">
              <p className="whitespace-pre-line">{problem.description}</p>

              {/* TOPICS */}
              {problem.topics && problem.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {problem.topics.map((t, idx) => (
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
                {(problem.examples || []).map((ex, i) => (
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
              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">
                    Constraints:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-white">
                    {problem.constraints.map((c, i) => (
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

        {/* RIGHT: COMPILER (INDEPENDENT SLIDER) */}
        <div
          style={{ width: `calc(${100 - leftPercent}% - 0.5rem)` }}
          className="flex-1 min-w-[320px] flex flex-col h-full min-h-0"
        >
          <div className="flex-1 bg-[#0a1118] border-2 border-white/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-full min-h-0">
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
                placeholder="// Write your algorithmic solution here..."
                onPaste={handlePasteBlocked}
                onCopy={handleCopyBlocked}
              />
            </div>

            {/* OUTPUT / TELEMETRY LOG */}
            {debugOutput && (
              <div className="h-32 bg-[#050b10] border-t border-white/20 p-3 font-mono text-[11px] text-gray-300 overflow-y-auto custom-scrollbar shrink-0">
                <pre className="whitespace-pre-wrap">{debugOutput}</pre>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="p-3 bg-black/40 border-t border-white/20 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={runTestcases}
                  disabled={loading}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border border-white/30 hover:border-white disabled:opacity-50"
                >
                  <FaPlay className="text-[10px]" /> Run Tests
                </button>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 border border-white/30 hover:border-white"
                  title="Run Custom Testcases"
                >
                  <FaVial className="text-[10px]" /> Custom Testcases
                </button>
              </div>

              <button
                onClick={submitSolution}
                disabled={submitLoading}
                className={`px-6 py-2.5 font-black text-xs uppercase tracking-[0.15em] rounded-xl transition hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 border disabled:opacity-50 ${
                  isSolved
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black border-white/20"
                }`}
                title={isSolved ? "Problem already solved! Click to submit again." : "Submit code for private testcase evaluation"}
              >
                {isSolved ? (
                  <>
                    <FaCheckCircle size={13} className="text-black" />
                    <span>Solved (Submit)</span>
                  </>
                ) : (
                  <span>Submit Solution</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REWARD MODAL */}
      {rewardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-md p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(255,255,255,0.1)]">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-500/10 border border-white/30 flex items-center justify-center text-orange-400 mb-4">
              <FaTrophy size={40} className="animate-bounce" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
              {rewardModal?.alreadySolved ? "PROBLEM VERIFIED!" : "CHALLENGE CONQUERED!"}
            </h2>
            <p className="text-gray-300 text-xs font-mono uppercase tracking-widest mb-6 font-medium">
              {rewardModal?.alreadySolved
                ? "Problem was already solved previously • No duplicate XP"
                : "All testcase validation nodes passed • Practice XP Earned"}
            </p>

            <div className="flex items-center justify-center mb-6 font-mono">
              <div className="bg-black/50 border border-white/20 px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                <FaBolt className={rewardModal?.alreadySolved ? "text-gray-400" : "text-orange-400"} />
                <span className={`font-bold ${rewardModal?.alreadySolved ? "text-gray-300" : "text-orange-400"}`}>
                  {rewardModal?.alreadySolved ? "0 XP (Already Solved)" : `+${rewardModal?.xpEarned || 25} Practice XP`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setRewardModal(null);
                navigate("/problems");
              }}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition"
            >
              Continue Practice
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM TESTCASE MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-4xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.15)]">
            {/* MODAL BODY */}
            <div className="p-4 overflow-y-auto flex-1">
              <CustomTestcasePlayground
                code={code}
                language={language}
                onClose={() => setShowCustomModal(false)}
              />
            </div>
            
          </div>
          
        </div>
      )}
      {/* ACCEPTED SOLUTION MODAL */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* HEADER */}
            <div className="p-4 bg-white/5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FaCheckCircle size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {problem.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-emerald-500/20 border-emerald-500/40 text-emerald-400">
                      Accepted Solution
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Language: <strong className="text-white uppercase">{acceptedSolution?.language || language}</strong>
                    {acceptedSolution?.solvedAt && ` • Solved: ${new Date(acceptedSolution.solvedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* SINGLE CLEAN CLOSE BUTTON */}
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/20 transition flex items-center gap-1.5 text-xs font-mono font-bold"
                title="Close Window"
              >
                <FaTimes size={13} />
                <span className="text-[10px] uppercase tracking-wider">Close ✕</span>
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 overflow-y-auto flex-1 bg-black/70 custom-scrollbar">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono text-gray-400">
                <span>Verified Solution Code:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (acceptedSolution?.code) setCode(acceptedSolution.code);
                      if (acceptedSolution?.language) setLanguage(acceptedSolution.language);
                      setShowSolutionModal(false);
                    }}
                    className="px-3 py-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 rounded-lg transition text-xs border border-orange-500/30 font-bold"
                    title="Load this code into the editor"
                  >
                    Load into Editor
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(acceptedSolution?.code || code);
                      setCopiedAcceptedCode(true);
                      setTimeout(() => setCopiedAcceptedCode(false), 2000);
                    }}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition flex items-center gap-1.5 text-xs border border-white/10"
                  >
                    {copiedAcceptedCode ? (
                      <>
                        <FaCheck className="text-green-400" />
                        <span className="text-green-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto">
                {acceptedSolution?.code || code || "// No code saved"}
              </pre>
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-black/50 border-t border-white/10 flex items-center justify-between font-mono text-xs text-gray-400 text-[11px]">
              <span>Verified 100% passed private testcases</span>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition"
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

export default ProblemSolve;
