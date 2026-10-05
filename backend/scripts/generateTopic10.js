import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic10Enriched = [
  {
    slug: "assign-cookies",
    title: "Assign Cookies",
    difficulty: "easy",
    description: "Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie. Each child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content. Your goal is to maximize the number of your content children and output the maximum number.",
    examples: [
      { input: "g = [1,2,3], s = [1,1]", output: "1", explanation: "You have 3 children and 2 cookies. Both cookies have size 1. You can only make the child with greed factor 1 content." },
      { input: "g = [1,2], s = [1,2,3]", output: "2", explanation: "Both children can be satisfied." },
      { input: "g = [5], s = [1,2,3]", output: "0", explanation: "No cookie is large enough." }
    ],
    constraints: ["1 <= g.length <= 3 * 10^4", "0 <= s.length <= 3 * 10^4", "1 <= g[i], s[j] <= 2^31 - 1"],
    topics: ["Array", "Two Pointers", "Greedy", "Sorting"],
    companies: ["Amazon", "Google"],
    hints: {
      h1: "Sort both g (greed factors) and s (cookie sizes) in ascending order.",
      h2: "Use two pointers to match the smallest sufficient cookie to the child with smallest greed.",
      h3: "Advance the cookie pointer every step; advance child pointer only when satisfied."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[1,2,3]\n[1,1]", output: "1", hidden: false },
      { input: "[1,2]\n[1,2,3]", output: "2", hidden: false },
      { input: "[5]\n[1,2,3]", output: "0", hidden: false },
      // 10 Private Test Cases
      { input: "[1,2,3]\n[]", output: "0", hidden: true },
      { input: "[1,2,3]\n[3]", output: "1", hidden: true },
      { input: "[1,1,1]\n[1,1,1]", output: "3", hidden: true },
      { input: "[10,9,8,7]\n[5,6,7,8]", output: "2", hidden: true },
      { input: "[1,2,3]\n[1,2,3]", output: "3", hidden: true },
      { input: "[2,3,4]\n[1,1,1]", output: "0", hidden: true },
      { input: "[3,4,5]\n[5,6,7,8]", output: "3", hidden: true },
      { input: "[1,2,3,4,5]\n[1,1,1,1,1]", output: "1", hidden: true },
      { input: "[10]\n[10]", output: "1", hidden: true },
      { input: "[1,2,3,4]\n[2,3,4,5]", output: "4", hidden: true }
    ]
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "easy",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "The subarray [1] has sum 1." },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "The subarray [5,4,-1,7,8] has sum 23." }
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    topics: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: ["Amazon", "Apple", "Microsoft", "LinkedIn"],
    hints: {
      h1: "Kadane's algorithm computes this greedily in O(N) time.",
      h2: "Maintain current_sum and max_sum.",
      h3: "For each num: current_sum = max(num, current_sum + num), and max_sum = max(max_sum, current_sum)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", hidden: false },
      { input: "[1]", output: "1", hidden: false },
      { input: "[5,4,-1,7,8]", output: "23", hidden: false },
      // 10 Private Test Cases
      { input: "[-1]", output: "-1", hidden: true },
      { input: "[-2,-1]", output: "-1", hidden: true },
      { input: "[-1,-2]", output: "-1", hidden: true },
      { input: "[1,2,3,4,5]", output: "15", hidden: true },
      { input: "[-5,-4,-3,-2,-1]", output: "-1", hidden: true },
      { input: "[2,-1,2,-1,2]", output: "4", hidden: true },
      { input: "[10,-5,20,-10,30]", output: "45", hidden: true },
      { input: "[-2,0,-1]", output: "0", hidden: true },
      { input: "[8,-19,5,-4,20]", output: "21", hidden: true },
      { input: "[1,2,-1,-2,2,1,-2,1,4,-5,4]", output: "6", hidden: true }
    ]
  },
  {
    slug: "lemonade-change",
    title: "Lemonade Change",
    difficulty: "easy",
    description: "At a lemonade stand, each lemonade costs $5. Customers are standing in a queue to buy from you and order one at a time (in the order specified by bills). Each customer will only buy one lemonade and pay with either a $5, $10, or $20 bill. You must provide the correct change to each customer so that the net transaction is that the customer pays $5. Return true if you can provide every customer with correct change, or false otherwise.",
    examples: [
      { input: "bills = [5,5,5,10,20]", output: "true", explanation: "From the first 3 customers, we collect three $5 bills. For 4th, we give a $5. For 5th, we give a $10 and a $5." },
      { input: "bills = [5,5,10,10,20]", output: "false", explanation: "For the last customer, we cannot give $15 change." },
      { input: "bills = [5,10,5,20]", output: "true", explanation: "Can provide exact change to all customers." }
    ],
    constraints: ["1 <= bills.length <= 10^5", "bills[i] is either 5, 10, or 20."],
    topics: ["Array", "Greedy"],
    companies: ["Amazon", "Google"],
    hints: {
      h1: "Keep count of $5 and $10 bills you currently hold.",
      h2: "When receiving $5, increment five_count.",
      h3: "When receiving $10, give a $5. When receiving $20, prioritize giving a $10 and a $5; if no $10 available, give three $5s."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[5,5,5,10,20]", output: "true", hidden: false },
      { input: "[5,5,10,10,20]", output: "false", hidden: false },
      { input: "[5,10,5,20]", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "[5]", output: "true", hidden: true },
      { input: "[10]", output: "false", hidden: true },
      { input: "[20]", output: "false", hidden: true },
      { input: "[5,5,5,5,20,20,5,5,20,5]", output: "false", hidden: true },
      { input: "[5,5,5,10,5,5,10,20,20,20]", output: "false", hidden: true },
      { input: "[5,5,5,20]", output: "true", hidden: true },
      { input: "[5,5,10]", output: "true", hidden: true },
      { input: "[5,10,20]", output: "false", hidden: true },
      { input: "[5,5,5,5,10,5,10,10,10,20]", output: "true", hidden: true },
      { input: "[5,5,5,5,5,20,20,20]", output: "false", hidden: true }
    ]
  },
  {
    slug: "jump-game",
    title: "Jump Game",
    difficulty: "medium",
    description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "You will always arrive at index 3, whose maximum jump is 0." },
      { input: "nums = [0]", output: "true", explanation: "Already at the last index." }
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["Amazon", "Apple", "Microsoft"],
    hints: {
      h1: "Track the furthest index reachable so far, max_reach.",
      h2: "Iterate i from 0 to n - 1: if i > max_reach, return false.",
      h3: "Update max_reach = max(max_reach, i + nums[i]). If max_reach >= n - 1, return true."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[2,3,1,1,4]", output: "true", hidden: false },
      { input: "[3,2,1,0,4]", output: "false", hidden: false },
      { input: "[0]", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "[1]", output: "true", hidden: true },
      { input: "[2,0]", output: "true", hidden: true },
      { input: "[1,0,1]", output: "false", hidden: true },
      { input: "[2,5,0,0]", output: "true", hidden: true },
      { input: "[1,2,3]", output: "true", hidden: true },
      { input: "[1,1,1,1]", output: "true", hidden: true },
      { input: "[0,1]", output: "false", hidden: true },
      { input: "[1,0,0,0]", output: "false", hidden: true },
      { input: "[2,0,0]", output: "true", hidden: true },
      { input: "[1,1,0,1]", output: "false", hidden: true }
    ]
  },
  {
    slug: "gas-station",
    title: "Gas Station",
    difficulty: "medium",
    description: "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations. Given two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1. If there exists a solution, it is guaranteed to be unique.",
    examples: [
      { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", output: "3", explanation: "Start at station 3 (index 3). Tank = 0 + 4 = 4. Drive to 4: cost 1, tank 3 + 5 = 8. Drive to 0: cost 2, tank 6 + 1 = 7. Reach back safely." },
      { input: "gas = [2,3,4], cost = [3,4,3]", output: "-1", explanation: "Total gas is less than total cost, impossible to complete circuit." },
      { input: "gas = [5,1,2,3,4], cost = [4,4,1,5,1]", output: "4", explanation: "Start at index 4 to complete circuit." }
    ],
    constraints: ["n == gas.length == cost.length", "1 <= n <= 10^5", "0 <= gas[i], cost[i] <= 10^4"],
    topics: ["Array", "Greedy"],
    companies: ["Amazon", "Google", "Microsoft"],
    hints: {
      h1: "If sum(gas) < sum(cost), it's strictly impossible to complete the circle, return -1.",
      h2: "Maintain current_tank and start_index. Iterate through all stations.",
      h3: "If current_tank + gas[i] - cost[i] < 0, reset start_index = i + 1 and current_tank = 0."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[1,2,3,4,5]\n[3,4,5,1,2]", output: "3", hidden: false },
      { input: "[2,3,4]\n[3,4,3]", output: "-1", hidden: false },
      { input: "[5,1,2,3,4]\n[4,4,1,5,1]", output: "4", hidden: false },
      // 10 Private Test Cases
      { input: "[2]\n[2]", output: "0", hidden: true },
      { input: "[2]\n[3]", output: "-1", hidden: true },
      { input: "[3,1,1]\n[1,2,2]", output: "0", hidden: true },
      { input: "[1,2,3,4,5]\n[1,2,3,4,5]", output: "0", hidden: true },
      { input: "[5,8,2,8]\n[6,5,6,6]", output: "3", hidden: true },
      { input: "[4,5,2,6,5,3]\n[3,2,7,3,2,9]", output: "-1", hidden: true },
      { input: "[1,2]\n[2,1]", output: "1", hidden: true },
      { input: "[3,3,4]\n[3,4,4]", output: "-1", hidden: true },
      { input: "[5,0,9,4,3,3,9,9,1,2]\n[6,7,5,9,5,8,7,1,10,5]", output: "-1", hidden: true },
      { input: "[6,1,4,3,5]\n[3,8,2,4,2]", output: "2", hidden: true }
    ]
  },
  {
    slug: "partition-labels",
    title: "Partition Labels",
    difficulty: "medium",
    description: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.",
    examples: [
      { input: "s = \"ababcbacadefegdehijhklij\"", output: "[9,7,8]", explanation: "Partitions: \"ababcbaca\", \"defegde\", \"hijhklij\"." },
      { input: "s = \"eccbbbbdec\"", output: "[10]", explanation: "Single partition covers all occurrences of 'e' and 'c'." },
      { input: "s = \"a\"", output: "[1]", explanation: "Single letter partition." }
    ],
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters."],
    topics: ["Hash Table", "Two Pointers", "String", "Greedy"],
    companies: ["Amazon", "Facebook", "Google"],
    hints: {
      h1: "First pass: store the last occurrence index of each character in a map or array of size 26.",
      h2: "Second pass: track start and end of the current partition.",
      h3: "For each character, extend end = max(end, last[s[i]]). When i == end, partition is complete; add size (end - start + 1) and reset start = i + 1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "\"ababcbacadefegdehijhklij\"", output: "[9,7,8]", hidden: false },
      { input: "\"eccbbbbdec\"", output: "[10]", hidden: false },
      { input: "\"a\"", output: "[1]", hidden: false },
      // 10 Private Test Cases
      { input: "\"ab\"", output: "[1,1]", hidden: true },
      { input: "\"aba\"", output: "[3]", hidden: true },
      { input: "\"abc\"", output: "[1,1,1]", hidden: true },
      { input: "\"caedbdedda\"", output: "[1,9]", hidden: true },
      { input: "\"qiejxqfnqceydsrhyjsonlh扉\"", output: "[13,1,1,7,1]", hidden: true },
      { input: "\"eaaaabaaec\"", output: "[9,1]", hidden: true },
      { input: "\"abcdefghijklmnopqrstuvwxyz\"", output: "[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]", hidden: true },
      { input: "\"aaaaa\"", output: "[5]", hidden: true },
      { input: "\"abcabcz\"", output: "[6,1]", hidden: true },
      { input: "\"zabcabc\"", output: "[1,6]", hidden: true }
    ]
  },
  {
    slug: "candy",
    title: "Candy",
    difficulty: "hard",
    description: "There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings. You are giving candies to these children subjected to the following requirements: Each child must have at least one candy. Children with a higher rating get more candies than their neighbors. Return the minimum number of candies you need to have to distribute the candies to the children.",
    examples: [
      { input: "ratings = [1,0,2]", output: "5", explanation: "You can allocate 2, 1, 2 candies respectively." },
      { input: "ratings = [1,2,2]", output: "4", explanation: "You can allocate 1, 2, 1 candies respectively." },
      { input: "ratings = [1]", output: "1", explanation: "Single child gets 1 candy." }
    ],
    constraints: ["n == ratings.length", "1 <= n <= 2 * 10^4", "0 <= ratings[i] <= 2 * 10^4"],
    topics: ["Array", "Greedy"],
    companies: ["Amazon", "Google", "Microsoft"],
    hints: {
      h1: "Initialize an array candies of size n with all 1s.",
      h2: "Left-to-right pass: if ratings[i] > ratings[i-1], candies[i] = candies[i-1] + 1.",
      h3: "Right-to-left pass: if ratings[i] > ratings[i+1], candies[i] = max(candies[i], candies[i+1] + 1). Return the sum."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[1,0,2]", output: "5", hidden: false },
      { input: "[1,2,2]", output: "4", hidden: false },
      { input: "[1]", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "[1,2]", output: "3", hidden: true },
      { input: "[2,1]", output: "3", hidden: true },
      { input: "[1,1,1]", output: "3", hidden: true },
      { input: "[1,3,2,2,1]", output: "7", hidden: true },
      { input: "[1,2,87,87,87,2,1]", output: "13", hidden: true },
      { input: "[1,3,4,5,2]", output: "11", hidden: true },
      { input: "[1,6,10,8,7,3,2]", output: "18", hidden: true },
      { input: "[5,4,3,2,1]", output: "15", hidden: true },
      { input: "[1,2,3,4,5]", output: "15", hidden: true },
      { input: "[29,51,87,87,72,12]", output: "12", hidden: true }
    ]
  },
  {
    slug: "jump-game-ii",
    title: "Jump Game II",
    difficulty: "hard",
    description: "You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. In other words, if you are at nums[i], you can jump to any nums[i + j] where: 0 <= j <= nums[i] and i + j < n. Return the minimum number of jumps to reach nums[n - 1]. The test cases are generated such that you can reach nums[n - 1].",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "2", explanation: "Jump 1 step from index 0 to 1, then 3 steps to index 4." },
      { input: "nums = [2,3,0,1,4]", output: "2", explanation: "Jump from index 0 to 1, then to 4." },
      { input: "nums = [1,2,3]", output: "2", explanation: "Jump from index 0 to 1, then to index 2." }
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 1000", "It's guaranteed that you can reach nums[n - 1]."],
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["Amazon", "Apple", "Microsoft", "Google"],
    hints: {
      h1: "Use BFS-like greedy intervals: current_end and max_reach.",
      h2: "Iterate from index 0 up to n - 2.",
      h3: "Update max_reach = max(max_reach, i + nums[i]). When i reaches current_end, increment jumps and update current_end = max_reach."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[2,3,1,1,4]", output: "2", hidden: false },
      { input: "[2,3,0,1,4]", output: "2", hidden: false },
      { input: "[1,2,3]", output: "2", hidden: false },
      // 10 Private Test Cases
      { input: "[1]", output: "0", hidden: true },
      { input: "[1,1]", output: "1", hidden: true },
      { input: "[2,1]", output: "1", hidden: true },
      { input: "[1,1,1,1]", output: "3", hidden: true },
      { input: "[7,0,9,6,9,6,1,7,9,0,1,2,9,0,3]", output: "2", hidden: true },
      { input: "[1,2,1,1,1]", output: "3", hidden: true },
      { input: "[3,2,1]", output: "1", hidden: true },
      { input: "[10,9,8,7,6,5,4,3,2,1,1,0]", output: "2", hidden: true },
      { input: "[2,1,1,1,1]", output: "3", hidden: true },
      { input: "[4,1,1,3,1,1,1]", output: "2", hidden: true }
    ]
  },
  {
    slug: "integer-to-english-words",
    title: "Integer to English Words",
    difficulty: "hard",
    description: "Convert a non-negative integer num to its English words representation.",
    examples: [
      { input: "num = 123", output: "\"One Hundred Twenty Three\"", explanation: "123 spelled out." },
      { input: "num = 12345", output: "\"Twelve Thousand Three Hundred Forty Five\"", explanation: "12345 spelled out." },
      { input: "num = 0", output: "\"Zero\"", explanation: "0 is Zero." }
    ],
    constraints: ["0 <= num <= 2^31 - 1"],
    topics: ["Math", "String", "Recursion"],
    companies: ["Facebook", "Amazon", "Microsoft", "Google"],
    hints: {
      h1: "If num == 0, return 'Zero'.",
      h2: "Divide the number into 3-digit chunks: Billion, Million, Thousand, and the remaining 3 digits.",
      h3: "Write a helper function to convert numbers less than 1000 using arrays for digits (<20) and tens (20, 30..90)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "123", output: "\"One Hundred Twenty Three\"", hidden: false },
      { input: "12345", output: "\"Twelve Thousand Three Hundred Forty Five\"", hidden: false },
      { input: "0", output: "\"Zero\"", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "\"One\"", hidden: true },
      { input: "10", output: "\"Ten\"", hidden: true },
      { input: "14", output: "\"Fourteen\"", hidden: true },
      { input: "20", output: "\"Twenty\"", hidden: true },
      { input: "100", output: "\"One Hundred\"", hidden: true },
      { input: "1000", output: "\"One Thousand\"", hidden: true },
      { input: "1000000", output: "\"One Million\"", hidden: true },
      { input: "1000000000", output: "\"One Billion\"", hidden: true },
      { input: "1234567", output: "\"One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven\"", hidden: true },
      { input: "2147483647", output: "\"Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven\"", hidden: true }
    ]
  },
  {
    slug: "patching-array",
    title: "Patching Array",
    difficulty: "hard",
    description: "Given a sorted integer array nums and an integer n, add/patch the minimum number of elements to the array such that any number in the range [1, n] inclusive can be formed by the sum of some elements in the array. Return the minimum number of patches required.",
    examples: [
      { input: "nums = [1,3], n = 6", output: "1", explanation: "Combinations of nums are [1], [3], [1,3]->4. Adding 2 gives [1,2,3], which covers [1,6]." },
      { input: "nums = [1,5,10], n = 20", output: "2", explanation: "The two patches can be [2, 4]." },
      { input: "nums = [1,2,2], n = 5", output: "0", explanation: "All numbers in range [1, 5] can already be formed." }
    ],
    constraints: ["1 <= nums.length <= 1000", "1 <= nums[i] <= 10^4", "nums is sorted in ascending order.", "1 <= n <= 2^31 - 1"],
    topics: ["Array", "Greedy"],
    companies: ["Google", "Amazon"],
    hints: {
      h1: "Let miss be the smallest number in [1, n] that cannot be formed currently. Initially miss = 1.",
      h2: "If nums[i] <= miss, then adding nums[i] extends our covered range to miss + nums[i].",
      h3: "If nums[i] > miss (or array exhausted), we greedily patch miss itself, which doubles our coverage to miss + miss = 2 * miss, and increment patch count."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "[1,3]\n6", output: "1", hidden: false },
      { input: "[1,5,10]\n20", output: "2", hidden: false },
      { input: "[1,2,2]\n5", output: "0", hidden: false },
      // 10 Private Test Cases
      { input: "[]\n7", output: "3", hidden: true },
      { input: "[1]\n1", output: "0", hidden: true },
      { input: "[1]\n2", output: "0", hidden: true },
      { input: "[1]\n3", output: "1", hidden: true },
      { input: "[1,2,31,33]\n2147483647", output: "28", hidden: true },
      { input: "[1,2,4,8,16,32]\n64", output: "1", hidden: true },
      { input: "[1,2,4,8,16,32,64]\n100", output: "0", hidden: true },
      { input: "[2]\n5", output: "2", hidden: true },
      { input: "[1,2,3]\n10", output: "1", hidden: true },
      { input: "[10,20]\n5", output: "3", hidden: true }
    ]
  }
];

const content = `// TOPIC 10: GREEDY ALGORITHMS & INTERVALS (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic10 = ${JSON.stringify(topic10Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic10_greedy.js'), content, 'utf8');
console.log('Successfully wrote enriched topic10_greedy.js!');
