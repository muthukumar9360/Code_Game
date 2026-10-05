import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  const jsSandboxCode = `
    function solution(stdin) {
      const s = String(stdin).trim();
      if (s.startsWith('-')) return 'false';
      const rev = s.split('').reverse().join('');
      return s === rev ? 'true' : 'false';
    }
  `;

  const token = jwt.sign({ id: '65f000000000000000000001', username: 'testuser' }, process.env.JWT_SECRET);

  const res = await fetch('http://localhost:5000/api/problems/palindrome-number-verification/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code: jsSandboxCode, language: 'javascript' })
  });

  const data = await res.json();
  console.log('Submission Response Status:', res.status);
  console.log('allPassed:', data.allPassed);
  console.log('passedCount:', data.passedCount);
  console.log('totalTests:', data.totalTests);
  console.log('Results count:', data.results?.length);
  if (data.results) {
    data.results.forEach((r, i) => {
      console.log(`  TC ${i + 1}: in=${JSON.stringify(r.testcase.input)} expected=${JSON.stringify(r.testcase.expectedOutput)} actual=${JSON.stringify(r.testcase.actualOutput)} passed=${r.testcase.passed}`);
    });
  }
}

test().catch(console.error);
