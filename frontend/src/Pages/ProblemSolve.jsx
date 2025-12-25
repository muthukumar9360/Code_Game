import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProblemSolve = () => {
  const { slug } = useParams();
  const API = import.meta.env.VITE_API_URL;

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugOutput, setDebugOutput] = useState("");

  const languageIdMap = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
  };

  // Fetch problem
  useEffect(() => {
    fetchProblem();
  }, []);

  const fetchProblem = async () => {
    try {
      const res = await axios.get(`${API}/api/problems/${slug}`);
      setProblem(res.data);
    } catch (err) {
      alert("Failed to load problem");
    }
  };

  const runTestcases = async () => {
    if (!problem) return;

    setLoading(true);
    setResults([]);
    setDebugOutput("Running code...");

    const visibleTestcases = problem.testcases.filter(tc => !tc.hidden);
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
        tempResults.push({
          input: tc.input,
          expected: tc.output,
          output,
          passed: output === tc.output,
        });

      } catch (err) {
        tempResults.push({
          input: tc.input,
          expected: tc.output,
          output: "Execution Error",
          passed: false,
        });
      }
    }

    setResults(tempResults);
    setDebugOutput("Execution finished.");
    setLoading(false);
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-xl font-bold">Loading Problem...</h2>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* HEADER */}
      <div className="w-full py-5 px-10 bg-[#0f2735] bg-opacity-80 shadow-lg">
        <h1 className="text-3xl font-extrabold text-white">
          BATT<span className="text-orange-500">LIX</span>
        </h1>
      </div>

      {/* MAIN */}
      <div className="flex gap-6 p-6">

        {/* LEFT - PROBLEM */}
        <div className="w-1/3 bg-white rounded-2xl p-6 shadow-xl overflow-auto">
          <h2 className="text-2xl font-bold text-[#0f2735]">
            {problem.title}
          </h2>

          <p className="mt-4 text-gray-700">{problem.description}</p>

          <div className="mt-4">
            <h3 className="font-bold">Examples</h3>
            {problem.examples.map((ex, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded-xl mt-2">
                <p><b>Input:</b> {ex.input}</p>
                <p><b>Output:</b> {ex.output}</p>
                <p><b>Explanation:</b> {ex.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - CODE */}
        <div className="w-2/3 bg-white rounded-2xl p-6 shadow-xl flex flex-col">

          <select
            className="p-2 mb-4 border rounded-xl"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <textarea
            className="flex-grow p-4 border rounded-xl font-mono text-sm"
            placeholder="// Write your solution here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button
            onClick={runTestcases}
            disabled={loading}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl"
          >
            {loading ? "Running..." : "Run Code"}
          </button>

          <div className="mt-4 bg-black text-green-400 p-4 rounded-xl h-[120px] overflow-auto font-mono text-sm">
            {debugOutput}
          </div>

          <div className="mt-4">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl mb-2 ${
                  r.passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p>Input: {r.input}</p>
                <p>Expected: {r.expected}</p>
                <p>Output: {r.output}</p>
                <p>Status: {r.passed ? "✅ Passed" : "❌ Failed"}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;
