import axios from 'axios';

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // You need to set this in .env

const languageIds = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
  c: 50 // C
};

export const executeCode = async (code, language, testCases) => {
  try {
    const languageId = languageIds[language];
    if (!languageId) throw new Error('Unsupported language');

    const results = [];

    for (const testCase of testCases) {
      // Submit code for execution
      const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions`, {
        source_code: code,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.expectedOutput
      }, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      });

      const token = submissionResponse.data.token;

      // Wait for execution result
      let result;
      let attempts = 0;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const statusResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });
        result = statusResponse.data;
        attempts++;
      } while (result.status.id <= 2 && attempts < 10); // Status 1: In Queue, 2: Processing

      const passed = result.status.id === 3 && result.stdout.trim() === testCase.expectedOutput.trim(); // Status 3: Accepted

      results.push({
        testcase: {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout || result.stderr || '',
          passed,
          executionTime: result.time || 0,
          memoryUsed: result.memory || 0
        }
      });
    }

    // Determine overall result
    const allPassed = results.every(r => r.testcase.passed);
    let overallResult = 'accepted';
    if (!allPassed) {
      overallResult = 'wrong_answer';
    }

    return {
      results,
      overallResult
    };
  } catch (error) {
    console.error('Error executing code:', error);
    return {
      results: [],
      overallResult: 'runtime_error'
    };
  }
};
