import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic3Enriched = [
  {
    slug: "maximum-average-subarray-i",
    title: "Maximum Average Subarray I",
    difficulty: "easy",
    description: "You are given an integer array nums consisting of n elements, and an integer k.\n\nFind a contiguous subarray whose length is equal to k that has the maximum average value and return this value. Any answer with a calculation error less than 10^-5 will be accepted.",
    examples: [
      { input: "nums = [1,12,-5,-6,50,3], k = 4", output: "12.75", explanation: "Subarray [12, -5, -6, 50] has sum 51, average 51/4 = 12.75." },
      { input: "nums = [5], k = 1", output: "5.0", explanation: "Only element average is 5.0." },
      { input: "nums = [0,4,0,3,2], k = 1", output: "4.0", explanation: "Subarray [4] has average 4.0." }
    ],
    constraints: ["n == nums.length", "1 <= k <= n <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    topics: ["Sliding Window", "Arrays"],
    companies: ["Google", "Facebook"],
    hints: {
      h1: "Calculate the sum of the first k elements.",
      h2: "Slide the window by adding the next element and subtracting the element leaving the window.",
      h3: "Track the max sum observed, then divide by k at the end."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 12 -5 -6 50 3\n4", output: "12.75", hidden: false },
      { input: "5\n1", output: "5.0", hidden: false },
      { input: "0 4 0 3 2\n1", output: "4.0", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5\n2", output: "4.5", hidden: true },
      { input: "-1\n1", output: "-1.0", hidden: true },
      { input: "0 0 0 0\n2", output: "0.0", hidden: true },
      { input: "10 20 30 40\n3", output: "30.0", hidden: true },
      { input: "-5 -10 -2 -1\n2", output: "-1.5", hidden: true },
      { input: "4 2 1 7 8 1 2 8 1 0\n3", output: "5.66667", hidden: true },
      { input: "1 1 1 1 1\n5", output: "1.0", hidden: true },
      { input: "100 -50 200 -100\n2", output: "75.0", hidden: true },
      { input: "3 3 4 3 0\n3", output: "3.33333", hidden: true },
      { input: "7 4 5 8 8 3 9 8 7 6\n7", output: "6.71429", hidden: true }
    ]
  },
  {
    slug: "defuse-the-bomb",
    title: "Defuse the Bomb",
    difficulty: "easy",
    description: "You have a bomb to defuse, and your informer gives you a circular array code of length of n and a key k.\n\n- If k > 0, replace the ith number with the sum of the next k numbers.\n- If k < 0, replace with the sum of previous k numbers.\n- If k == 0, replace with 0.\n\nAs code is circular, the next element of code[n-1] is code[0], and the previous element of code[0] is code[n-1].",
    examples: [
      { input: "code = [5,7,1,4], k = 3", output: "[12,10,16,13]", explanation: "Sums of next 3 circular elements: 7+1+4=12, 1+4+5=10, 4+5+7=16, 5+7+1=13." },
      { input: "code = [1,2,3,4], k = 0", output: "[0,0,0,0]", explanation: "k is 0, so all numbers are replaced by 0." },
      { input: "code = [2,4,9,3], k = -2", output: "[12,5,6,13]", explanation: "Sums of previous 2 elements: 9+3=12, 3+2=5, 2+4=6, 4+9=13." }
    ],
    constraints: ["n == code.length", "1 <= n <= 100", "1 <= code[i] <= 100", "-(n - 1) <= k <= n - 1"],
    topics: ["Sliding Window", "Arrays"],
    companies: ["Amazon", "Cisco"],
    hints: {
      h1: "Use modulo indexing i % n to handle circular transitions.",
      h2: "For k > 0, the first window is indices 1 to k.",
      h3: "Slide the window one step forward on each iteration."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "5 7 1 4\n3", output: "12 10 16 13", hidden: false },
      { input: "1 2 3 4\n0", output: "0 0 0 0", hidden: false },
      { input: "2 4 9 3\n-2", output: "12 5 6 13", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3\n1", output: "2 3 1", hidden: true },
      { input: "1 2 3\n-1", output: "3 1 2", hidden: true },
      { input: "10 20\n1", output: "20 10", hidden: true },
      { input: "10 20\n0", output: "0 0", hidden: true },
      { input: "1 2 3 4 5\n2", output: "5 7 9 6 3", hidden: true },
      { input: "1 2 3 4 5\n-2", output: "9 6 3 5 7", hidden: true },
      { input: "4 1 2 3\n3", output: "6 9 8 7", hidden: true },
      { input: "1\n0", output: "0", hidden: true },
      { input: "3 5 1 2\n-1", output: "2 3 5 1", hidden: true },
      { input: "2 1 3 4 5\n-3", output: "12 10 6 7 8", hidden: true }
    ]
  },
  {
    slug: "contains-duplicate-ii",
    title: "Contains Duplicate II",
    difficulty: "easy",
    description: "Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.",
    examples: [
      { input: "nums = [1,2,3,1], k = 3", output: "true", explanation: "nums[0] == nums[3] and 3 - 0 <= 3." },
      { input: "nums = [1,2,3,1,2,3], k = 2", output: "false", explanation: "Identical elements are farther than distance 2." },
      { input: "nums = [1,0,1,1], k = 1", output: "true", explanation: "nums[2] == nums[3] and 3 - 2 <= 1." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "0 <= k <= 10^5"],
    topics: ["Sliding Window", "Hash Table", "Arrays"],
    companies: ["Airbnb", "Palantir"],
    hints: {
      h1: "Maintain a HashSet representing a sliding window of size k.",
      h2: "If nums[i] is already in the set, return true.",
      h3: "When the set exceeds size k, remove nums[i - k]."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 1\n3", output: "true", hidden: false },
      { input: "1 2 3 1 2 3\n2", output: "false", hidden: false },
      { input: "1 0 1 1\n1", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 1\n0", output: "false", hidden: true },
      { input: "1 2 1\n1", output: "false", hidden: true },
      { input: "1 2 1\n2", output: "true", hidden: true },
      { input: "99 99\n2", output: "true", hidden: true },
      { input: "1 2 3 4 5\n3", output: "false", hidden: true },
      { input: "1 2 3 4 1\n3", output: "false", hidden: true },
      { input: "1 2 3 4 1\n4", output: "true", hidden: true },
      { input: "-1 -1\n1", output: "true", hidden: true },
      { input: "1 2 3 2 1\n1", output: "false", hidden: true },
      { input: "1 2 3 2 1\n2", output: "true", hidden: true }
    ]
  },
  {
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "medium",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "In this case, no transactions are done and max profit = 0." },
      { input: "prices = [2,4,1]", output: "2", explanation: "Buy on day 1 (price = 2) and sell on day 2 (price = 4), profit = 2." }
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    topics: ["Sliding Window", "Arrays", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Goldman Sachs"],
    hints: {
      h1: "Track the minimum price seen so far as you iterate through the days.",
      h2: "Calculate potential profit on day i as (prices[i] - minPrice).",
      h3: "Update maxProfit whenever potential profit exceeds current maximum."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "7 1 5 3 6 4", output: "5", hidden: false },
      { input: "7 6 4 3 1", output: "0", hidden: false },
      { input: "2 4 1", output: "2", hidden: false },
      // 10 Private Test Cases
      { input: "1 2", output: "1", hidden: true },
      { input: "2 1", output: "0", hidden: true },
      { input: "1", output: "0", hidden: true },
      { input: "3 2 6 5 0 3", output: "4", hidden: true },
      { input: "2 1 2 1 0 1 2", output: "2", hidden: true },
      { input: "1 2 3 4 5", output: "4", hidden: true },
      { input: "5 4 3 2 1", output: "0", hidden: true },
      { input: "10 5 8 2 9 1", output: "7", hidden: true },
      { input: "1 1 1 1", output: "0", hidden: true },
      { input: "100 180 260 310 40 535 695", output: "655", hidden: true }
    ]
  },
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3", explanation: "The answer is \"abc\", with the length of 3." },
      { input: "s = \"bbbbb\"", output: "1", explanation: "The answer is \"b\", with the length of 1." },
      { input: "s = \"pwwkew\"", output: "3", explanation: "The answer is \"wke\", with the length of 3." }
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    topics: ["Sliding Window", "Hash Table", "Strings"],
    companies: ["Amazon", "Bloomberg", "Meta"],
    hints: {
      h1: "Use a sliding window [left, right] with a Hash Map storing last seen positions of characters.",
      h2: "When a repeating character is found at right, advance left to lastSeen[char] + 1.",
      h3: "Update maximum window length on each step."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "abcabcbb", output: "3", hidden: false },
      { input: "bbbbb", output: "1", hidden: false },
      { input: "pwwkew", output: "3", hidden: false },
      // 10 Private Test Cases
      { input: " ", output: "1", hidden: true },
      { input: "", output: "0", hidden: true },
      { input: "au", output: "2", hidden: true },
      { input: "dvdf", output: "3", hidden: true },
      { input: "abba", output: "2", hidden: true },
      { input: "tmmzuxt", output: "5", hidden: true },
      { input: "abcdefg", output: "7", hidden: true },
      { input: "aab", output: "2", hidden: true },
      { input: "cdd", output: "2", hidden: true },
      { input: "anviaj", output: "5", hidden: true }
    ]
  },
  {
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "medium",
    description: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character at most k times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
    examples: [
      { input: "s = \"ABAB\", k = 2", output: "4", explanation: "Replace two 'A's with 'B's or vice versa." },
      { input: "s = \"AABABBA\", k = 1", output: "4", explanation: "Replace the middle 'A' with 'B' to form \"AABBBBA\". The substring \"BBBB\" has length 4." },
      { input: "s = \"ABBB\", k = 2", output: "4", explanation: "Replace 'A' with 'B' to form \"BBBB\"." }
    ],
    constraints: ["1 <= s.length <= 10^5", "s consists of only uppercase English letters.", "0 <= k <= s.length"],
    topics: ["Sliding Window", "Hash Table", "Strings"],
    companies: ["Google", "Amazon", "Uber"],
    hints: {
      h1: "A window [left, right] is valid if (windowLength - maxFrequencyInWindow) <= k.",
      h2: "Maintain a frequency array for the 26 uppercase English letters.",
      h3: "If condition is violated, shrink window from left."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "ABAB\n2", output: "4", hidden: false },
      { input: "AABABBA\n1", output: "4", hidden: false },
      { input: "ABBB\n2", output: "4", hidden: false },
      // 10 Private Test Cases
      { input: "AAAA\n2", output: "4", hidden: true },
      { input: "A\n0", output: "1", hidden: true },
      { input: "ABAA\n0", output: "2", hidden: true },
      { input: "BAAA\n0", output: "3", hidden: true },
      { input: "ABCDE\n1", output: "2", hidden: true },
      { input: "KRSCDCSONAJNHLBMDQGIFCPEKPOHQIHLTDIQGEKLRLCQNBOHNDQGHQBITIHQHXILBHYGTRPBRQHQDHQPOKL\n4", output: "7", hidden: true },
      { input: "BAAAB\n2", output: "5", hidden: true },
      { input: "ABC\n2", output: "3", hidden: true },
      { input: "AAAAABBBBB\n3", output: "8", hidden: true },
      { input: "ABABABAB\n1", output: "3", hidden: true }
    ]
  },
  {
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "hard",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.",
    examples: [
      { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]", explanation: "Max values for each 3-element window." },
      { input: "nums = [1], k = 1", output: "[1]", explanation: "Single element max is 1." },
      { input: "nums = [9,11], k = 2", output: "[11]", explanation: "Window of size 2 over [9, 11] gives 11." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "1 <= k <= nums.length"],
    topics: ["Sliding Window", "Queue", "Monotonic Queue", "Heap"],
    companies: ["Google", "Amazon", "Citadel"],
    hints: {
      h1: "A monotonic decreasing deque stores indices of relevant elements.",
      h2: "Before adding index i, remove smaller elements from the back of the deque.",
      h3: "Remove indices out of the current window from the front of the deque."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 3 -1 -3 5 3 6 7\n3", output: "3 3 5 5 6 7", hidden: false },
      { input: "1\n1", output: "1", hidden: false },
      { input: "9 11\n2", output: "11", hidden: false },
      // 10 Private Test Cases
      { input: "4 -2\n2", output: "4", hidden: true },
      { input: "1 -1\n1", output: "1 -1", hidden: true },
      { input: "7 2 4\n2", output: "7 4", hidden: true },
      { input: "1 3 1 2 0 5\n3", output: "3 3 2 5", hidden: true },
      { input: "5 4 3 2 1\n3", output: "5 4 3", hidden: true },
      { input: "1 2 3 4 5\n3", output: "3 4 5", hidden: true },
      { input: "10 9 8 7 6 5 4 3 2 1\n4", output: "10 9 8 7 6 5 4", hidden: true },
      { input: "-7 -8 7 5 7 1 6 0\n4", output: "7 7 7 7 7", hidden: true },
      { input: "3 1 -1 -3 5 3 6 7\n3", output: "3 1 5 5 6 7", hidden: true },
      { input: "2 4 7\n1", output: "2 4 7", hidden: true }
    ]
  },
  {
    slug: "permutation-in-string",
    title: "Permutation in String",
    difficulty: "hard",
    description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.\n\nIn other words, return true if one of s1's permutations is the substring of s2.",
    examples: [
      { input: "s1 = \"ab\", s2 = \"eidbaooo\"", output: "true", explanation: "s2 contains one permutation of s1 (\"ba\")." },
      { input: "s1 = \"ab\", s2 = \"eidboaoo\"", output: "false", explanation: "No permutation exists as substring." },
      { input: "s1 = \"adc\", s2 = \"dcda\"", output: "true", explanation: "\"cda\" or \"dcd\" matches anagram of \"adc\"." }
    ],
    constraints: ["1 <= s1.length, s2.length <= 10^4", "s1 and s2 consist of lowercase English letters."],
    topics: ["Sliding Window", "Hash Table", "Two Pointers", "Strings"],
    companies: ["Microsoft", "Facebook"],
    hints: {
      h1: "A permutation means character counts must match exactly in a window of size len(s1).",
      h2: "Slide a fixed-size window of len(s1) across s2.",
      h3: "Track a count of matching frequencies to achieve O(N) comparisons."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "ab\neidbaooo", output: "true", hidden: false },
      { input: "ab\neidboaoo", output: "false", hidden: false },
      { input: "adc\ndcda", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "a\na", output: "true", hidden: true },
      { input: "a\nb", output: "false", hidden: true },
      { input: "hello\nooolleoooleh", output: "false", hidden: true },
      { input: "aba\nab", output: "false", hidden: true },
      { input: "ab\nba", output: "true", hidden: true },
      { input: "abc\nlecabee", output: "true", hidden: true },
      { input: "horse\nshore", output: "true", hidden: true },
      { input: "xyz\naxyzb", output: "true", hidden: true },
      { input: "pack\nbackpack", output: "true", hidden: true },
      { input: "test\nbestrest", output: "false", hidden: true }
    ]
  },
  {
    slug: "substring-with-concatenation-of-all-words",
    title: "Substring with Concatenation of All Words",
    difficulty: "hard",
    description: "You are given a string s and an array of strings words of the same length. Return an array of all the starting indices of substring(s) in s that is a concatenation of each word in words exactly once and without any intervening characters.",
    examples: [
      { input: "s = \"barfoothefoobarman\", words = [\"foo\",\"bar\"]", output: "[0,9]", explanation: "Substrings at indices 0 and 9 are \"barfoo\" and \"foobar\"." },
      { input: "s = \"wordgoodgoodgoodbestword\", words = [\"word\",\"good\",\"best\",\"word\"]", output: "[]", explanation: "No concatenation matches words exactly." },
      { input: "s = \"barfoofoobarthefoobarman\", words = [\"bar\",\"foo\",\"the\"]", output: "[6,9,12]", explanation: "Substrings start at indices 6, 9, and 12." }
    ],
    constraints: ["1 <= s.length <= 10^4", "1 <= words.length <= 5000", "1 <= words[i].length <= 30", "words[i] consists of lowercase English letters."],
    topics: ["Sliding Window", "Hash Table", "Strings"],
    companies: ["Amazon", "Apple"],
    hints: {
      h1: "All words have the same length L. Run sliding windows with starting offsets 0, 1, ..., L-1.",
      h2: "In each offset, step by L characters and track word frequency matching words array.",
      h3: "Reset left pointer when an invalid word is encountered."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "barfoothefoobarman\nfoo bar", output: "0 9", hidden: false },
      { input: "wordgoodgoodgoodbestword\nword good best word", output: "", hidden: false },
      { input: "barfoofoobarthefoobarman\nbar foo the", output: "6 9 12", hidden: false },
      // 10 Private Test Cases
      { input: "a\na", output: "0", hidden: true },
      { input: "a\nb", output: "", hidden: true },
      { input: "lingmindraboofooowingdingbarrwingmonkeypoundcake\nfooo barwing dingr wing", output: "", hidden: true },
      { input: "wordgoodgoodgoodbestword\nword good best good", output: "8", hidden: true },
      { input: "aaa\na a", output: "0 1", hidden: true },
      { input: "ababababab\nab ba", output: "", hidden: true },
      { input: "foobarfoobar\nfoo bar", output: "0 3 6", hidden: true },
      { input: "shewrotethisletter\nshe wrote", output: "0", hidden: true },
      { input: "catbatrat\ncat bat rat", output: "0", hidden: true },
      { input: "catbatratcat\ncat bat", output: "0", hidden: true }
    ]
  },
  {
    slug: "min-flips-alternating-binary-string",
    title: "Minimum Flips to Make the Binary String Alternating",
    difficulty: "hard",
    description: "You are given a binary string s. You are allowed to perform two types of operations:\n- Type-1: Remove the first character and append it to the end.\n- Type-2: Pick any character and flip it (0 to 1, or 1 to 0).\n\nReturn the minimum number of type-2 operations to make s alternating.",
    examples: [
      { input: "s = \"111000\"", output: "2", explanation: "Use type-1 to get \"011100\", then flip index 1 and 4." },
      { input: "s = \"010\"", output: "0", explanation: "The string is already alternating." },
      { input: "s = \"1110\"", output: "1", explanation: "Rotate once to get \"1101\", flip index 1 to get \"1001\" -> \"1010\"." }
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is either '0' or '1'."],
    topics: ["Sliding Window", "Greedy", "Strings"],
    companies: ["ByteDance", "Google"],
    hints: {
      h1: "Append s to itself (s + s) to simulate all circular shifts using a sliding window of size N.",
      h2: "Construct target alternating patterns: \"010101...\" and \"101010...\".",
      h3: "Count differences inside the sliding window of size N and take the minimum across all shifts."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "111000", output: "2", hidden: false },
      { input: "010", output: "0", hidden: false },
      { input: "1110", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "0", output: "0", hidden: true },
      { input: "1", output: "0", hidden: true },
      { input: "00", output: "1", hidden: true },
      { input: "11", output: "1", hidden: true },
      { input: "01", output: "0", hidden: true },
      { input: "0100", output: "1", hidden: true },
      { input: "01001001101", output: "2", hidden: true },
      { input: "10010100", output: "2", hidden: true },
      { input: "100011001010000", output: "5", hidden: true },
      { input: "11001100", output: "2", hidden: true }
    ]
  }
];

const content = `// TOPIC 3: SLIDING WINDOW (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic3 = ${JSON.stringify(topic3Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic3_sliding_window.js'), content, 'utf8');
console.log('Successfully wrote enriched topic3_sliding_window.js!');
