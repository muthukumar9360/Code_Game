import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../db.js';
import Problem from '../models/Problem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const palindromeProblem = {
  slug: "palindrome-number-verification",
  title: "Palindrome Number Verification",
  difficulty: "easy",
  description: "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\nFor example, 121 is a palindrome while 123 is not. Negative numbers are never palindromic because the minus sign does not mirror (e.g., -121 reads as 121- from right to left). Also, numbers ending in 0 (other than 0 itself) cannot be palindromes.",
  examples: [
    {
      input: "x = 121",
      output: "true",
      explanation: "121 reads as 121 from left to right and from right to left."
    },
    {
      input: "x = -121",
      output: "false",
      explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
    },
    {
      input: "x = 10",
      output: "false",
      explanation: "Reads 01 from right to left. Therefore it is not a palindrome."
    }
  ],
  constraints: [
    "-2^31 <= x <= 2^31 - 1",
    "Time Limit: 2.0s",
    "Memory Limit: 256MB",
    "Follow-up: Could you solve it without converting the integer to a string?"
  ],
  topics: ["Algorithms", "Math", "Two Pointers"],
  companies: ["Google", "Amazon", "Microsoft", "Bloomberg", "Meta"],
  hints: {
    h1: "Beware of negative numbers. Can negative numbers ever be palindromes? (e.g. -121 vs 121-)",
    h2: "Numbers ending in 0 (except 0 itself) cannot be palindromes since leading zeroes are not allowed.",
    h3: "Revert only the second half of the number to compare with the first half to avoid 32-bit integer overflow!"
  },
  testcases: [
    // 3 Public Test Cases
    { input: "121", output: "true", hidden: false },
    { input: "-121", output: "false", hidden: false },
    { input: "10", output: "false", hidden: false },

    // 10 Private Test Cases
    { input: "0", output: "true", hidden: true },
    { input: "7", output: "true", hidden: true },
    { input: "-101", output: "false", hidden: true },
    { input: "1221", output: "true", hidden: true },
    { input: "1234321", output: "true", hidden: true },
    { input: "123456", output: "false", hidden: true },
    { input: "1000021", output: "false", hidden: true },
    { input: "1000000001", output: "true", hidden: true },
    { input: "2147483647", output: "false", hidden: true },
    { input: "-2147483648", output: "false", hidden: true }
  ]
};

async function main() {
  await connectDB();
  const updated = await Problem.findOneAndUpdate(
    { slug: palindromeProblem.slug },
    { $set: palindromeProblem },
    { upsert: true, new: true }
  );
  console.log("Updated Palindrome Problem:");
  console.log("Slug:", updated.slug);
  console.log("Title:", updated.title);
  console.log("Examples:", updated.examples.length);
  console.log("Testcases total:", updated.testcases.length);
  console.log("Public TC:", updated.testcases.filter(t => !t.hidden).length);
  console.log("Private TC:", updated.testcases.filter(t => t.hidden).length);

  await mongoose.connection.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
