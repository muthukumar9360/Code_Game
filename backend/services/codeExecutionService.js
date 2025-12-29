import axios from "axios";

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const languageIds = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  javascript: 63,
};

export const executeCode = async (code, language, testCases) => {
  try {
    const languageId = languageIds[language];
    if (!languageId) throw new Error("Unsupported language");

    const results = [];

    for (const testCase of testCases) {
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
        }
      );

      const output = (response.data.stdout || "").trim();
      const expected = testCase.expectedOutput.trim();

      const passed = output === expected;

      results.push({
        testcase: {
          input: testCase.input,
          expectedOutput: expected,
          actualOutput: output,
          passed,
          executionTime: response.data.time || 0,
          memoryUsed: response.data.memory || 0,
        },
      });
    }

    const allPassed = results.every(r => r.testcase.passed);

    return {
      results,
      overallResult: allPassed ? "accepted" : "wrong_answer",
    };

  } catch (error) {
    console.error("Error executing code:", error.message);
    return {
      results: [],
      overallResult: "runtime_error",
    };
  }
};
