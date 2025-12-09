import React, { useState } from "react";
import axios from "axios";

const ContestPage = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [results, setResults] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // Language ID map for Judge0 (Community Edition)
  const languageIdMap = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
  };

  // Testcases
  const TESTCASES = [
    { input: "hello", expected: "olleh" },
    { input: "world", expected: "dlrow" },
    { input: "battlix", expected: "xiltab" }
  ];

  // FUNCTION: Run code against testcases using FREE Judge0 CE (no key needed)
  const runTestcases = async () => {
    setLoading(true);
    setDebugOutput("Running code on Judge0...");
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
    setDebugOutput("Finished running all testcases.");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* TOP BAR */}
      <div className="w-full py-5 px-10 bg-[#0f2735] bg-opacity-80 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white">
          BATT<span className="text-orange-500">LIX</span> Contest
        </h1>

        <div className="bg-orange-500 text-white font-bold text-xl px-5 py-2 rounded-xl shadow-lg">
          09:58
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex p-6 gap-6">

        {/* LEFT: Problem Statement */}
        <div className="w-1/3 bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl overflow-auto">
          <h2 className="text-2xl font-bold text-[#0f2735] mb-4">
            Problem: <span className="text-orange-500">Reverse a String</span>
          </h2>

          <p className="text-gray-700 font-medium leading-relaxed mb-4">
            You are given a string <b>S</b>. Write a program to reverse the string
            without using built-in reverse functions.
          </p>

          <div className="bg-gray-100 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-[#0f2735]">Example Input:</h3>
            <pre className="text-gray-800">hello</pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="font-bold text-[#0f2735]">Example Output:</h3>
            <pre className="text-gray-800">olleh</pre>
          </div>
        </div>

        {/* RIGHT: Code Editor + Testcase Results */}
        <div className="w-2/3 bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl flex flex-col">
          
          <h2 className="text-2xl font-bold text-[#0f2735] mb-4">Your Code</h2>

          {/* LANGUAGE SELECTOR */}
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

          {/* CODE EDITOR */}
          <textarea
            className="flex grow w-full h-[500px] p-4 border rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="// Type your solution here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          ></textarea>

          {/* SUBMIT BUTTON */}
          <button
            onClick={runTestcases}
            disabled={loading}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition"
          >
            {loading ? "Running..." : "Run & Check Testcases"}
          </button>

          {/* DEBUG OUTPUT */}
          <div className="mt-4 bg-black text-green-400 p-4 rounded-xl h-[150px] overflow-auto font-mono text-sm">
            {debugOutput}
          </div>

          {/* TESTCASE RESULTS */}
          <div className="mt-4">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl mb-3 border ${
                  r.passed ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"
                }`}
              >
                <p><b>Testcase {i + 1}</b></p>
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

export default ContestPage;
