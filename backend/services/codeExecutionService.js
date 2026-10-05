import axios from "axios";
import vm from "node:vm";

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const languageIds = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  javascript: 63,
};

// In-Memory Execution Cache (code + input -> result)
const executionCache = new Map();
const MAX_CACHE_SIZE = 500;

// High-speed local JS sandbox for instantaneous sub-10ms evaluation
const runJsSandbox = (code, stdin) => {
  const sandbox = {
    console: {
      log: (...args) => {
        output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      }
    },
    process: {
      stdin: {
        read: () => stdin
      }
    },
    input: stdin
  };

  let output = "";
  const context = vm.createContext(sandbox);

  // Auto-wrapper to execute function or capture stdout
  const wrappedCode = `
    try {
      ${code}
      // If code defines solve or solution, auto-invoke
      if (typeof solve === 'function') {
        const res = solve(${JSON.stringify(stdin)});
        if (res !== undefined) console.log(typeof res === 'object' ? JSON.stringify(res) : res);
      } else if (typeof solution === 'function') {
        const res = solution(${JSON.stringify(stdin)});
        if (res !== undefined) console.log(typeof res === 'object' ? JSON.stringify(res) : res);
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  `;

  try {
    const script = new vm.Script(wrappedCode);
    script.runInContext(context, { timeout: 1500 });
    return output.trim();
  } catch (err) {
    return `Runtime Error: ${err.message}`;
  }
};

export const executeCode = async (code, language, testCases) => {
  try {
    const lang = (language || "javascript").toLowerCase();
    const cacheKey = `${lang}:${code.trim()}:${JSON.stringify(testCases)}`;

    if (executionCache.has(cacheKey)) {
      return executionCache.get(cacheKey);
    }

    const languageId = languageIds[lang] || 63;

    // Fast-path: If JavaScript, run in local sandbox first for 5ms latency
    if (lang === "javascript") {
      const localResults = testCases.map(testCase => {
        const start = performance.now();
        const actualOutput = runJsSandbox(code, testCase.input);
        const executionTime = (performance.now() - start) / 1000;
        const expected = (testCase.expectedOutput || "").trim();
        const passed = actualOutput === expected;

        return {
          testcase: {
            input: testCase.input,
            expectedOutput: expected,
            actualOutput,
            passed,
            executionTime: executionTime.toFixed(4),
            memoryUsed: 1024
          }
        };
      });

      // If local sandbox produced valid results, return immediately
      if (localResults.some(r => r.testcase.passed) || !code.includes("readline")) {
        const allPassed = localResults.every(r => r.testcase.passed);
        const resultPayload = {
          results: localResults,
          overallResult: allPassed ? "accepted" : "wrong_answer",
          mode: "fast-sandbox"
        };
        if (executionCache.size < MAX_CACHE_SIZE) {
          executionCache.set(cacheKey, resultPayload);
        }
        return resultPayload;
      }
    }

    // Parallel Batched Remote Judge0 Execution
    const executeSingle = async (testCase) => {
      try {
        const response = await axios.post(
          JUDGE0_URL,
          {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            timeout: 7000
          }
        );

        const output = (response.data.stdout || response.data.stderr || "").trim();
        const expected = (testCase.expectedOutput || "").trim();
        const passed = output === expected;

        return {
          testcase: {
            input: testCase.input,
            expectedOutput: expected,
            actualOutput: output,
            passed,
            executionTime: response.data.time || "0.01",
            memoryUsed: response.data.memory || 2048,
          },
        };
      } catch (e) {
        return {
          testcase: {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "Execution Timeout / Service Notice",
            passed: false,
            executionTime: 0,
            memoryUsed: 0
          }
        };
      }
    };

    // Run ALL test cases in parallel concurrently!
    const results = await Promise.all(testCases.map(tc => executeSingle(tc)));
    const allPassed = results.every(r => r.testcase.passed);

    const finalResult = {
      results,
      overallResult: allPassed ? "accepted" : "wrong_answer",
      mode: "judge0-parallel"
    };

    if (executionCache.size < MAX_CACHE_SIZE) {
      executionCache.set(cacheKey, finalResult);
    }

    return finalResult;

  } catch (error) {
    console.error("Error executing code:", error.message);
    return {
      results: [],
      overallResult: "runtime_error",
    };
  }
};
