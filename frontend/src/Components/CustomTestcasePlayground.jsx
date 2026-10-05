import React, { useState } from "react";
import axios from "axios";
import {
  FaPlay,
  FaTerminal,
  FaCheckCircle,
  FaTimesCircle,
  FaBolt,
  FaMagic,
  FaCopy,
  FaTimes
} from "react-icons/fa";

const LANGUAGE_ID_MAP = {
  javascript: 63,
  python: 71,
  cpp: 54,
  c: 50,
  java: 62
};

const CustomTestcasePlayground = ({ code = "", language = "python", onClose }) => {
  const [customInput, setCustomInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setCustomInput(preset.input);
  };

  const runCustomCase = async () => {
    if (!code.trim()) {
      setExecutionResult({
        error: "Please write code before executing custom testcase.",
        passed: false
      });
      return;
    }

    setLoading(true);
    setExecutionResult(null);

    const startTime = performance.now();

    try {
      const langId = LANGUAGE_ID_MAP[language.toLowerCase()] || 71;
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: langId,
          stdin: customInput,
          expected_output: expectedOutput ? expectedOutput.trim() : undefined
        }
      );

      const endTime = performance.now();
      const elapsedMs = Math.round(endTime - startTime);

      const data = res.data;
      const stdout = (data.stdout || "").trim();
      const stderr = data.stderr || data.compile_output || "";
      const expected = expectedOutput.trim();

      const passed = expected ? stdout === expected : true;

      setExecutionResult({
        stdout,
        stderr,
        timeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : elapsedMs,
        memoryKb: data.memory || 1024,
        status: data.status?.description || "Completed",
        passed,
        hasExpected: Boolean(expected)
      });
    } catch (err) {
      setExecutionResult({
        error: err.response?.data?.message || err.message || "Failed to reach execution sandbox.",
        passed: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1118] border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
            <FaTerminal size={14} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Custom Edge-Case Sandbox
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCustomCase}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-400 text-black shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <FaPlay size={10} />
                <span>Run Custom Case</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
              title="Close Custom Testcase Modal"
            >
              <FaTimes size={13} />
              <span className="text-[10px] uppercase tracking-wider">Close ✕</span>
            </button>
          )}
        </div>
      </div>

      {/* INPUTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Custom Standard Input (stdin)
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            rows={4}
            placeholder="Type custom test inputs here..."
            className="w-full bg-[#050b10] border border-white/15 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white outline-none font-mono resize-y"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Expected Output (Optional)
          </label>
          <textarea
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            rows={4}
            placeholder="Optional: Provide expected stdout to compare against..."
            className="w-full bg-[#050b10] border border-white/15 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white outline-none font-mono resize-y"
          />
        </div>
      </div>

      {/* EXECUTION TELEMETRY OUTPUT */}
      {executionResult && (
        <div className="bg-[#050b10] border border-white/10 rounded-xl p-3 space-y-2 mt-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              {executionResult.hasExpected ? (
                executionResult.passed ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <FaCheckCircle /> PASSED EXPECTED SPEC
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <FaTimesCircle /> FAILED EXPECTED SPEC
                  </span>
                )
              ) : (
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <FaBolt /> EXECUTION COMPLETED
                </span>
              )}
              <span className="text-[10px] text-gray-500 font-mono">({executionResult.status})</span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
              <span>Time: <strong className="text-orange-400">{executionResult.timeMs}ms</strong></span>
              <span>Memory: <strong className="text-gray-200">{executionResult.memoryKb}KB</strong></span>
            </div>
          </div>

          {/* STDOUT */}
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Output:</span>
            <pre className="bg-black/60 p-2.5 rounded-lg text-xs font-mono text-green-300 overflow-x-auto whitespace-pre-wrap max-h-36">
              {executionResult.stdout || "(No Output)"}
            </pre>
          </div>

          {/* STDERR */}
          {executionResult.stderr && (
            <div>
              <span className="text-[10px] uppercase font-bold text-red-400 block">Runtime Telemetry / Error:</span>
              <pre className="bg-red-950/30 border border-red-500/20 p-2 rounded-lg text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                {executionResult.stderr}
              </pre>
            </div>
          )}

          {/* GENERAL ERROR */}
          {executionResult.error && (
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
              {executionResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomTestcasePlayground;
