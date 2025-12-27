import React, { useState } from "react";
import axios from "axios";
import { FaPlay, FaRegClock, FaTerminal, FaCheckCircle, FaTimesCircle, FaCode } from "react-icons/fa";

const ContestPage = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const languageIdMap = { c: 50, cpp: 54, java: 62, python: 71 };

  const TESTCASES = [
    { input: "hello", expected: "olleh" },
    { input: "world", expected: "dlrow" },
    { input: "battlix", expected: "xilttab" }
  ];

  const runTestcases = async () => {
    setLoading(true);
    setDebugOutput("> Initializing compiler...\n> Connecting to Judge0 CE...\n");
    let testcaseResults = [];

    for (let tc of TESTCASES) {
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
              "Accept": "application/json"
            },
          }
        );

        const result = response.data;
        let output = result.stdout ? result.stdout.trim() : "";
        let passed = output === tc.expected;

        testcaseResults.push({
          input: tc.input,
          expected: tc.expected,
          output,
          passed,
        });

      } catch (err) {
        testcaseResults.push({
          input: tc.input,
          expected: tc.expected,
          output: "Execution Error",
          passed: false,
        });
      }
    }

    setResults(testcaseResults);
    setDebugOutput((prev) => prev + "> Execution complete. Check logs below.\n");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b10] text-white font-sans">
      
      {/* TOP HUD (Heads-Up Display) */}
      <nav className="w-full py-4 px-8 bg-[#0a1118] border-b border-white/10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black italic tracking-tighter">
            BATT<span className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">LIX</span>
          </h1>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest text-gray-400">
            Sector: Alpha_Contest
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-orange-500 font-mono text-xl bg-orange-500/10 px-4 py-1 rounded-full border border-orange-500/20">
            <FaRegClock className="animate-pulse" />
            <span>09:58</span>
          </div>
          <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold px-4 py-2 rounded border border-red-500/30 transition">
            ABANDON MISSION
          </button>
        </div>
      </nav>

      {/* MAIN INTERFACE */}
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">

        {/* LEFT: MISSION INTEL (Problem Statement) */}
        <div className="w-1/3 bg-[#0a1118] border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <FaTerminal className="text-orange-500 text-sm" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Mission Objectives</h2>
          </div>
          
          <div className="p-6 overflow-y-auto grow">
            <h2 className="text-2xl font-black mb-4">
              REVERSE <span className="text-orange-500">STRING_UPLINK</span>
            </h2>

            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                A high-frequency transmission has been intercepted. You are required to reverse the data packet 
                <b className="text-white ml-1">S</b> to decode the hidden coordinates.
              </p>
              <p className="border-l-2 border-orange-500 pl-4 italic">
                Restriction: Native `.reverse()` protocols are jammed. Manual logic is required.
              </p>

              <div className="mt-8 space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase mb-2">Input_Buffer</h3>
                  <code className="text-white font-mono">"hello"</code>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <h3 className="text-[10px] font-bold text-green-500 uppercase mb-2">Expected_Output</h3>
                  <code className="text-white font-mono">"olleh"</code>
                </div>
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

            <div className="p-4 bg-black/20 border-t border-white/5 flex justify-end">
              <button
                onClick={runTestcases}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all
                  ${loading ? "bg-gray-800 text-gray-500" : "bg-orange-500 text-black hover:bg-orange-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]"}
                `}
              >
                {loading ? "Compiling..." : <><FaPlay className="text-[10px]" /> Run Simulation</>}
              </button>
            </div>
          </div>

          {/* CONSOLE & RESULTS */}
          <div className="h-1/3 flex gap-4">
            {/* TERMINAL LOG */}
            <div className="w-1/2 bg-black border border-white/10 rounded-xl p-4 font-mono text-[11px] overflow-y-auto">
              <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-white/5 pb-2">
                <FaCode /> <span>SYSTEM_LOGS</span>
              </div>
              <pre className="text-green-500 whitespace-pre-wrap">{debugOutput || "> System idle. Awaiting user input..."}</pre>
            </div>

            {/* TESTCASE STATUS */}
            <div className="w-1/2 bg-[#0a1118] border border-white/10 rounded-xl p-4 overflow-y-auto">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Validation_Status</div>
              <div className="space-y-2">
                {results.length === 0 && (
                  <div className="text-gray-600 text-[10px] italic">No simulation data available.</div>
                )}
                {results.map((r, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${
                    r.passed ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                  }`}>
                    <div className="flex items-center gap-3">
                      {r.passed ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
                      <span className="text-[10px] font-bold">NODE_{i + 1}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                       r.passed ? "bg-green-500 text-black" : "bg-red-500 text-white"
                    }`}>
                      {r.passed ? "Success" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestPage;