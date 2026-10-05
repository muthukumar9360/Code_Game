import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic1Enriched = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
      { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]." }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    topics: ["Arrays", "Hash Table"],
    companies: ["Google", "Amazon", "Apple", "Meta"],
    hints: {
      h1: "Try using a hash map to store the values and their indices as you iterate.",
      h2: "For each element x, check if (target - x) already exists in the map.",
      h3: "This reduces the search time from O(N^2) to O(N)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "2 7 11 15\n9", output: "0 1", hidden: false },
      { input: "3 2 4\n6", output: "1 2", hidden: false },
      { input: "3 3\n6", output: "0 1", hidden: false },
      // 10 Private Test Cases
      { input: "1 5 8 11 14\n19", output: "2 3", hidden: true },
      { input: "1 2\n3", output: "0 1", hidden: true },
      { input: "-3 4 3 90\n0", output: "0 2", hidden: true },
      { input: "0 4 3 0\n0", output: "0 3", hidden: true },
      { input: "-10 -1 -18 -19\n-19", output: "1 2", hidden: true },
      { input: "5 25 75\n100", output: "1 2", hidden: true },
      { input: "10 20 30 40 50\n90", output: "3 4", hidden: true },
      { input: "100 200 500\n700", output: "1 2", hidden: true },
      { input: "-5 -2 -3 1\n-1", output: "1 3", hidden: true },
      { input: "8 1 4 2 9\n3", output: "1 3", hidden: true }
    ]
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "easy",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears at index 0 and index 3." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true", explanation: "Multiple elements appear more than once." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    topics: ["Arrays", "Hash Table"],
    companies: ["Microsoft", "Amazon", "Apple"],
    hints: {
      h1: "A hash set can detect duplicates in O(N) time.",
      h2: "Alternatively, sorting takes O(N log N) and allows comparing adjacent elements.",
      h3: "Check set size against original array length."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 1", output: "true", hidden: false },
      { input: "1 2 3 4", output: "false", hidden: false },
      { input: "1 1 1 3 3 4 3 2 4 2", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "99 100 101", output: "false", hidden: true },
      { input: "1", output: "false", hidden: true },
      { input: "2 2", output: "true", hidden: true },
      { input: "1 5 -2 -4 0", output: "false", hidden: true },
      { input: "10 20 30 40 50 10", output: "true", hidden: true },
      { input: "-1 -2 -3 -1", output: "true", hidden: true },
      { input: "0 0", output: "true", hidden: true },
      { input: "7 8 9 10 11 12 13", output: "false", hidden: true },
      { input: "1000000 2000000 1000000", output: "true", hidden: true },
      { input: "3 1 2 4 5 6", output: "false", hidden: true }
    ]
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "easy",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      { input: "s = \"anagram\", t = \"nagaram\"", output: "true", explanation: "Both strings contain the same character frequencies." },
      { input: "s = \"rat\", t = \"car\"", output: "false", explanation: "Characters and frequencies differ." },
      { input: "s = \"listen\", t = \"silent\"", output: "true", explanation: "Rearranging 'listen' produces 'silent'." }
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    topics: ["Arrays", "Hash Table", "Strings"],
    companies: ["Facebook", "Bloomberg", "Uber"],
    hints: {
      h1: "If the lengths of s and t differ, they cannot be anagrams.",
      h2: "Count the frequency of each character in s and decrement for each in t.",
      h3: "If all count buckets are zero at the end, they are anagrams."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "anagram\nnagaram", output: "true", hidden: false },
      { input: "rat\ncar", output: "false", hidden: false },
      { input: "listen\nsilent", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "a\nab", output: "false", hidden: true },
      { input: "a\na", output: "true", hidden: true },
      { input: "ab\nba", output: "true", hidden: true },
      { input: "aa\nbb", output: "false", hidden: true },
      { input: "triangle\nintegral", output: "true", hidden: true },
      { input: "apple\npaple", output: "true", hidden: true },
      { input: "hello\nworld", output: "false", hidden: true },
      { input: "cinema\niceman", output: "true", hidden: true },
      { input: "aabbcc\nabcabc", output: "true", hidden: true },
      { input: "aabbcc\naabbcd", output: "false", hidden: true }
    ]
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "medium",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    examples: [
      { input: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "bat | nat tan | ate eat tea", explanation: "Anagrams grouped by shared characters." },
      { input: "strs = [\"a\"]", output: "a", explanation: "Single character is its own group." },
      { input: "strs = [\"ab\",\"ba\",\"abc\",\"cba\"]", output: "ab ba | abc cba", explanation: "Grouped into 2-character and 3-character anagram sets." }
    ],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    topics: ["Arrays", "Hash Table", "Strings"],
    companies: ["Amazon", "Microsoft", "Salesforce"],
    hints: {
      h1: "Sort each string alphabetically to use as a canonical hash key.",
      h2: "Alternatively, use a 26-element character count tuple as the dictionary key.",
      h3: "Group strings under their common key."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "eat tea tan ate nat bat", output: "bat | nat tan | ate eat tea", hidden: false },
      { input: "a", output: "a", hidden: false },
      { input: "ab ba abc cba", output: "ab ba | abc cba", hidden: false },
      // 10 Private Test Cases
      { input: "rat tar art car", output: "car | rat tar art", hidden: true },
      { input: "cat dog tac god", output: "cat tac | dog god", hidden: true },
      { input: "abc", output: "abc", hidden: true },
      { input: "a b c", output: "a | b | c", hidden: true },
      { input: "listen silent enlist", output: "listen silent enlist", hidden: true },
      { input: "opt pot top spot stop post", output: "opt pot top | spot stop post", hidden: true },
      { input: "no on yes sey", output: "no on | yes sey", hidden: true },
      { input: "one neo eon two tow", output: "two tow | one neo eon", hidden: true },
      { input: "hello olleh world dlrow", output: "hello olleh | world dlrow", hidden: true },
      { input: "xyz zyx yxz", output: "xyz zyx yxz", hidden: true }
    ]
  },
  {
    slug: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "medium",
    description: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "1 has frequency 3, 2 has frequency 2." },
      { input: "nums = [1], k = 1", output: "[1]", explanation: "Only element is 1." },
      { input: "nums = [4,4,4,6,6,7,8,9,9,9,9], k = 2", output: "[9,4]", explanation: "9 has frequency 4, 4 has frequency 3." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements in the array].", "It is guaranteed that the answer is unique."],
    topics: ["Arrays", "Hash Table", "Heap (Priority Queue)"],
    companies: ["Amazon", "Google", "Facebook"],
    hints: {
      h1: "First, count the frequencies of all numbers with a hash map.",
      h2: "Use bucket sort where the index represents frequency to achieve O(N) runtime.",
      h3: "Iterate from the highest frequency bucket backwards until k elements are collected."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 1 1 2 2 3\n2", output: "1 2", hidden: false },
      { input: "1\n1", output: "1", hidden: false },
      { input: "4 4 4 6 6 7 8 9 9 9 9\n2", output: "9 4", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5\n1", output: "1", hidden: true },
      { input: "5 5 5 5 5\n1", output: "5", hidden: true },
      { input: "1 2 2 3 3 3\n2", output: "3 2", hidden: true },
      { input: "1 1 2 2 3 3\n3", output: "1 2 3", hidden: true },
      { input: "10 20 20 30 30 30 40 40 40 40\n2", output: "40 30", hidden: true },
      { input: "-1 -1 2\n1", output: "-1", hidden: true },
      { input: "7 7 8 8 9 9 9\n1", output: "9", hidden: true },
      { input: "1 2 3 1 2 1\n2", output: "1 2", hidden: true },
      { input: "100 200 100 300 200 100\n2", output: "100 200", hidden: true },
      { input: "4 4 5 5 6 6 6 7 7 7 7\n3", output: "7 6 4", hidden: true }
    ]
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "medium",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "Each index stores product of prefix and suffix." },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "Zero handling without division." },
      { input: "nums = [2,3,4,5]", output: "[60,40,30,24]", explanation: "Products: 3*4*5=60, 2*4*5=40, 2*3*5=30, 2*3*4=24." }
    ],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    topics: ["Arrays", "Prefix Sum"],
    companies: ["Apple", "Amazon", "Lyft"],
    hints: {
      h1: "Think about calculating prefix products and suffix products separately.",
      h2: "answer[i] = prefixProduct[i-1] * suffixProduct[i+1].",
      h3: "You can optimize space by calculating suffix products on the fly into the output array."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4", output: "24 12 8 6", hidden: false },
      { input: "-1 1 0 -3 3", output: "0 0 9 0 0", hidden: false },
      { input: "2 3 4 5", output: "60 40 30 24", hidden: false },
      // 10 Private Test Cases
      { input: "1 1 1 1", output: "1 1 1 1", hidden: true },
      { input: "2 3", output: "3 2", hidden: true },
      { input: "0 0", output: "0 0", hidden: true },
      { input: "1 0", output: "0 1", hidden: true },
      { input: "2 0 3", output: "0 6 0", hidden: true },
      { input: "-1 -1 -1", output: "1 1 1", hidden: true },
      { input: "1 2 3 4 5", output: "120 60 40 30 24", hidden: true },
      { input: "5 2 4", output: "8 20 10", hidden: true },
      { input: "-2 3 -4 5", output: "-60 40 -30 24", hidden: true },
      { input: "1 -1 1 -1", output: "-1 1 -1 1", hidden: true }
    ]
  },
  {
    slug: "first-missing-positive",
    title: "First Missing Positive",
    difficulty: "hard",
    description: "Given an unsorted integer array nums. Return the smallest positive integer that is not present in nums.\n\nYou must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.",
    examples: [
      { input: "nums = [1,2,0]", output: "3", explanation: "Numbers 1 and 2 are present, 3 is missing." },
      { input: "nums = [3,4,-1,1]", output: "2", explanation: "1 is in the array but 2 is missing." },
      { input: "nums = [7,8,9,11,12]", output: "1", explanation: "The smallest positive integer 1 is missing." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1"],
    topics: ["Arrays", "Hash Table"],
    companies: ["Microsoft", "Amazon", "Databricks"],
    hints: {
      h1: "Notice the answer must lie in the range [1, N + 1] where N is the length of nums.",
      h2: "Use cycle sort: place each number x at index x - 1 if 1 <= x <= N.",
      h3: "Find the first index i where nums[i] != i + 1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 0", output: "3", hidden: false },
      { input: "3 4 -1 1", output: "2", hidden: false },
      { input: "7 8 9 11 12", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "2", hidden: true },
      { input: "2", output: "1", hidden: true },
      { input: "0", output: "1", hidden: true },
      { input: "-1 -2", output: "1", hidden: true },
      { input: "1 2 3 4 5", output: "6", hidden: true },
      { input: "2 3 7 6 8 -1 -10 15", output: "1", hidden: true },
      { input: "1 1", output: "2", hidden: true },
      { input: "3 2 1", output: "4", hidden: true },
      { input: "2 1", output: "3", hidden: true },
      { input: "1000 -1", output: "1", hidden: true }
    ]
  },
  {
    slug: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    difficulty: "hard",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
    examples: [
      { input: "nums = [100,4,200,1,3,2]", output: "4", explanation: "The longest consecutive elements sequence is [1, 2, 3, 4]." },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9", explanation: "Sequence 0,1,2,3,4,5,6,7,8 has length 9." },
      { input: "nums = [10,5,12,3,55,4,11,2]", output: "4", explanation: "Sequence 2,3,4,5 has length 4." }
    ],
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    topics: ["Arrays", "Hash Table", "Union Find"],
    companies: ["Google", "Spotify", "Goldman Sachs"],
    hints: {
      h1: "Put all numbers in a HashSet for O(1) lookups.",
      h2: "Only start counting a sequence from numbers where (num - 1) is NOT in the set.",
      h3: "This guarantees each consecutive chain is traversed only once."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "100 4 200 1 3 2", output: "4", hidden: false },
      { input: "0 3 7 2 5 8 4 6 0 1", output: "9", hidden: false },
      { input: "10 5 12 3 55 4 11 2", output: "4", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "1", hidden: true },
      { input: "1 2 3 4 5", output: "5", hidden: true },
      { input: "5 4 3 2 1", output: "5", hidden: true },
      { input: "10 20 30", output: "1", hidden: true },
      { input: "-1 0 1", output: "3", hidden: true },
      { input: "9 1 4 7 3 -1 0 5 8 -1 6", output: "7", hidden: true },
      { input: "1 2 0 1", output: "3", hidden: true },
      { input: "-5 -4 -3 -2 -1 0", output: "6", hidden: true },
      { input: "1000 1001 1002", output: "3", hidden: true },
      { input: "2 4 6 8", output: "1", hidden: true }
    ]
  },
  {
    slug: "maximum-gap",
    title: "Maximum Gap",
    difficulty: "hard",
    description: "Given an integer array nums, return the maximum difference between two successive elements in its sorted form. If the array contains less than two elements, return 0.\n\nYou must write an algorithm that runs in linear time and uses linear extra space.",
    examples: [
      { input: "nums = [3,6,9,1]", output: "3", explanation: "The sorted form of array is [1,3,6,9], max diff is 3." },
      { input: "nums = [10]", output: "0", explanation: "Array contains less than two elements, return 0." },
      { input: "nums = [1,10000000]", output: "9999999", explanation: "The difference between 1 and 10000000 is 9999999." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "0 <= nums[i] <= 10^9"],
    topics: ["Arrays", "Bucket Sort", "Radix Sort"],
    companies: ["Amazon", "ByteDance"],
    hints: {
      h1: "Comparison sort takes O(N log N), but bucket sort takes O(N).",
      h2: "Compute bucket size based on (max - min) / (n - 1).",
      h3: "The maximum gap will never be found inside the same bucket, only between adjacent non-empty buckets."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 6 9 1", output: "3", hidden: false },
      { input: "10", output: "0", hidden: false },
      { input: "1 10000000", output: "9999999", hidden: false },
      // 10 Private Test Cases
      { input: "1 3 100", output: "97", hidden: true },
      { input: "5 5 5 5", output: "0", hidden: true },
      { input: "1 2", output: "1", hidden: true },
      { input: "1 10 100 1000", output: "900", hidden: true },
      { input: "15 2 9 4 1", output: "6", hidden: true },
      { input: "100 200 400 800", output: "400", hidden: true },
      { input: "7 3 1 9", output: "2", hidden: true },
      { input: "0 100", output: "100", hidden: true },
      { input: "1 5 9 13 17", output: "4", hidden: true },
      { input: "50 1 25 75", output: "25", hidden: true }
    ]
  },
  {
    slug: "subarrays-with-k-different-integers",
    title: "Subarrays with K Different Integers",
    difficulty: "hard",
    description: "Given an integer array nums and an integer k, return the number of good subarrays of nums.\n\nA good array is an array where the number of different integers in that array is exactly k.",
    examples: [
      { input: "nums = [1,2,1,2,3], k = 2", output: "7", explanation: "Subarrays with 2 distinct integers: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2]." },
      { input: "nums = [1,2,1,3,4], k = 3", output: "3", explanation: "Subarrays with 3 distinct integers: [1,2,1,3], [2,1,3], [1,3,4]." },
      { input: "nums = [1,1,1,1,1], k = 1", output: "15", explanation: "All 15 subarrays contain exactly 1 distinct integer." }
    ],
    constraints: ["1 <= nums.length <= 2 * 10^4", "1 <= nums[i], k <= nums.length"],
    topics: ["Arrays", "Hash Table", "Sliding Window"],
    companies: ["Amazon", "Uber"],
    hints: {
      h1: "Calculating exactly K is hard. Calculating 'at most K' is easier.",
      h2: "exactly(K) = atMost(K) - atMost(K - 1).",
      h3: "Use standard two-pointer sliding window to implement atMost(K)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 1 2 3\n2", output: "7", hidden: false },
      { input: "1 2 1 3 4\n3", output: "3", hidden: false },
      { input: "1 1 1 1 1\n1", output: "15", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3\n1", output: "3", hidden: true },
      { input: "1 2 3\n2", output: "2", hidden: true },
      { input: "1 2 3\n3", output: "1", hidden: true },
      { input: "1 2 1 2 1\n2", output: "11", hidden: true },
      { input: "1 2\n1", output: "2", hidden: true },
      { input: "1 2 3 4 5\n2", output: "4", hidden: true },
      { input: "2 2 2 2\n1", output: "10", hidden: true },
      { input: "1 2 1 1 2\n2", output: "9", hidden: true },
      { input: "1 2 3 2 1\n3", output: "4", hidden: true },
      { input: "1 1 2 2 3 3\n2", output: "9", hidden: true }
    ]
  }
];

const content = `// TOPIC 1: ARRAYS & HASHING (10 Problems: 3 Easy, 3 Med, 4 Hard - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic1 = ${JSON.stringify(topic1Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic1_arrays.js'), content, 'utf8');
console.log('Successfully wrote enriched topic1_arrays.js!');
