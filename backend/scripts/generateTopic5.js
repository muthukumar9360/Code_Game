import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic5Enriched = [
  {
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "easy",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1." },
      { input: "nums = [5], target = 5", output: "0", explanation: "5 is found at index 0." }
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All the integers in nums are unique.", "nums is sorted in ascending order."],
    topics: ["Binary Search", "Arrays"],
    companies: ["Microsoft", "Google", "Amazon"],
    hints: {
      h1: "Initialize left = 0, right = nums.length - 1.",
      h2: "Compute mid = left + (right - left) / 2 to avoid integer overflow.",
      h3: "If nums[mid] == target, return mid; if nums[mid] < target, left = mid + 1; else right = mid - 1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "-1 0 3 5 9 12\n9", output: "4", hidden: false },
      { input: "-1 0 3 5 9 12\n2", output: "-1", hidden: false },
      { input: "5\n5", output: "0", hidden: false },
      // 10 Private Test Cases
      { input: "1 3 5 7 9\n10", output: "-1", hidden: true },
      { input: "1 3 5 7 9\n1", output: "0", hidden: true },
      { input: "1 3 5 7 9\n9", output: "4", hidden: true },
      { input: "1 3 5 7 9\n5", output: "2", hidden: true },
      { input: "2 5\n5", output: "1", hidden: true },
      { input: "2 5\n2", output: "0", hidden: true },
      { input: "2 5\n1", output: "-1", hidden: true },
      { input: "-10 -5 0 3 7 12 18\n-5", output: "1", hidden: true },
      { input: "-10 -5 0 3 7 12 18\n18", output: "6", hidden: true },
      { input: "-10 -5 0 3 7 12 18\n4", output: "-1", hidden: true }
    ]
  },
  {
    slug: "search-insert-position",
    title: "Search Insert Position",
    difficulty: "easy",
    description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [1,3,5,6], target = 5", output: "2", explanation: "5 is found at index 2." },
      { input: "nums = [1,3,5,6], target = 2", output: "1", explanation: "2 should be inserted at index 1." },
      { input: "nums = [1,3,5,6], target = 7", output: "4", explanation: "7 should be appended at index 4." }
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4", "nums contains distinct values sorted in ascending order."],
    topics: ["Binary Search", "Arrays"],
    companies: ["Apple", "Google"],
    hints: {
      h1: "Standard lower_bound binary search.",
      h2: "When the binary search loop terminates (left > right), 'left' points to the correct insert position.",
      h3: "Return left."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 3 5 6\n5", output: "2", hidden: false },
      { input: "1 3 5 6\n2", output: "1", hidden: false },
      { input: "1 3 5 6\n7", output: "4", hidden: false },
      // 10 Private Test Cases
      { input: "1 3 5 6\n0", output: "0", hidden: true },
      { input: "1\n0", output: "0", hidden: true },
      { input: "1\n1", output: "0", hidden: true },
      { input: "1\n2", output: "1", hidden: true },
      { input: "1 3\n2", output: "1", hidden: true },
      { input: "1 3 5 9\n4", output: "2", hidden: true },
      { input: "2 4 6 8 10\n7", output: "3", hidden: true },
      { input: "10 20 30\n25", output: "2", hidden: true },
      { input: "5 10 15 20\n30", output: "4", hidden: true },
      { input: "-5 -2 0 3 6\n-3", output: "1", hidden: true }
    ]
  },
  {
    slug: "guess-number-higher-or-lower",
    title: "Guess Number Higher or Lower",
    difficulty: "easy",
    description: "We are playing the Guess Game. I pick a number from 1 to n. You have to guess which number I picked. Every time you guess wrong, I will tell you whether the number I picked is higher or lower than your guess. Return the number picked.",
    examples: [
      { input: "n = 10, pick = 6", output: "6", explanation: "Binary search identifies 6." },
      { input: "n = 1, pick = 1", output: "1", explanation: "Only 1 is possible." },
      { input: "n = 2, pick = 1", output: "1", explanation: "Target is 1." }
    ],
    constraints: ["1 <= n <= 2^31 - 1", "1 <= pick <= n"],
    topics: ["Binary Search", "Interactive"],
    companies: ["Google"],
    hints: {
      h1: "Use binary search in the range [1, n].",
      h2: "Call guess(mid). If guess returns 0, target is found.",
      h3: "If -1, search left half; if 1, search right half."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "10\n6", output: "6", hidden: false },
      { input: "1\n1", output: "1", hidden: false },
      { input: "2\n1", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "2\n2", output: "2", hidden: true },
      { input: "100\n50", output: "50", hidden: true },
      { input: "100\n1", output: "1", hidden: true },
      { input: "100\n100", output: "100", hidden: true },
      { input: "1000\n723", output: "723", hidden: true },
      { input: "500\n256", output: "256", hidden: true },
      { input: "20\n15", output: "15", hidden: true },
      { input: "30\n7", output: "7", hidden: true },
      { input: "2147483647\n2147483647", output: "2147483647", hidden: true },
      { input: "50\n42", output: "42", hidden: true }
    ]
  },
  {
    slug: "search-a-2d-matrix",
    title: "Search a 2D Matrix",
    difficulty: "medium",
    description: "You are given an m x n integer matrix matrix with the following two properties:\n1. Each row is sorted in non-decreasing order.\n2. The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer target, return true if target is in matrix or false otherwise. You must write a solution in O(log(m * n)) time complexity.",
    examples: [
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true", explanation: "3 exists in the matrix." },
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", output: "false", explanation: "13 does not exist in the matrix." },
      { input: "matrix = [[1]], target = 1", output: "true", explanation: "Single element matrix matches target." }
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 100", "-10^4 <= matrix[i][j], target <= 10^4"],
    topics: ["Binary Search", "Matrix", "Arrays"],
    companies: ["Amazon", "Microsoft", "Facebook"],
    hints: {
      h1: "Treat the 2D matrix as a flat sorted 1D array of length m * n.",
      h2: "The element at flat index idx is matrix[Math.floor(idx / n)][idx % n].",
      h3: "Run standard binary search between 0 and m * n - 1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 3 5 7 | 10 11 16 20 | 23 30 34 60\n3", output: "true", hidden: false },
      { input: "1 3 5 7 | 10 11 16 20 | 23 30 34 60\n13", output: "false", hidden: false },
      { input: "1\n1", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "1\n0", output: "false", hidden: true },
      { input: "1 3\n3", output: "true", hidden: true },
      { input: "1 | 3\n2", output: "false", hidden: true },
      { input: "1 3 5 | 7 9 11\n9", output: "true", hidden: true },
      { input: "1 3 5 | 7 9 11\n8", output: "false", hidden: true },
      { input: "1 4 | 5 6 | 8 10\n8", output: "true", hidden: true },
      { input: "2 4 6 8 | 10 12 14 16\n1", output: "false", hidden: true },
      { input: "2 4 6 8 | 10 12 14 16\n17", output: "false", hidden: true },
      { input: "5 10 | 15 20 | 25 30\n20", output: "true", hidden: true },
      { input: "-10 -5 | 0 5\n-5", output: "true", hidden: true }
    ]
  },
  {
    slug: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "medium",
    description: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Notice that rotating an array [a[0], a[1], ..., a[n-1]] 1 time results in [a[n-1], a[0], a[1], ..., a[n-2]].\n\nGiven the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.",
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1", explanation: "Original was [1,2,3,4,5] rotated 3 times." },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0", explanation: "Original was [0,1,2,4,5,6,7] rotated 4 times." },
      { input: "nums = [11,13,15,17]", output: "11", explanation: "Original array rotated 4 times (identical to 0 times)." }
    ],
    constraints: ["n == nums.length", "1 <= n <= 5000", "-5000 <= nums[i] <= 5000", "All values are unique."],
    topics: ["Binary Search", "Arrays"],
    companies: ["Microsoft", "Amazon", "Facebook"],
    hints: {
      h1: "Compare nums[mid] with nums[right].",
      h2: "If nums[mid] > nums[right], the minimum lies strictly in the right half (left = mid + 1).",
      h3: "If nums[mid] <= nums[right], the minimum lies at mid or to the left (right = mid)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 4 5 1 2", output: "1", hidden: false },
      { input: "4 5 6 7 0 1 2", output: "0", hidden: false },
      { input: "11 13 15 17", output: "11", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "1", hidden: true },
      { input: "2 1", output: "1", hidden: true },
      { input: "1 2", output: "1", hidden: true },
      { input: "2 3 4 5 1", output: "1", hidden: true },
      { input: "5 1 2 3 4", output: "1", hidden: true },
      { input: "4 5 1 2 3", output: "1", hidden: true },
      { input: "10 20 30 40 50 5", output: "5", hidden: true },
      { input: "6 7 8 9 1 2 3 4 5", output: "1", hidden: true },
      { input: "-1 0 1 -4 -3 -2", output: "-4", hidden: true },
      { input: "50 60 70 80 90 100 10 20 30 40", output: "10", hidden: true }
    ]
  },
  {
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "medium",
    description: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "0 is at index 4." },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1", explanation: "3 does not exist in nums." },
      { input: "nums = [1], target = 0", output: "-1", explanation: "0 does not exist." }
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4", "All values are unique."],
    topics: ["Binary Search", "Arrays"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    hints: {
      h1: "One half of the rotated array is always strictly sorted.",
      h2: "Determine whether the left or right half is sorted by comparing nums[left] and nums[mid].",
      h3: "Check if the target lies within the boundaries of the sorted half to decide which direction to branch."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "4 5 6 7 0 1 2\n0", output: "4", hidden: false },
      { input: "4 5 6 7 0 1 2\n3", output: "-1", hidden: false },
      { input: "1\n0", output: "-1", hidden: false },
      // 10 Private Test Cases
      { input: "1\n1", output: "0", hidden: true },
      { input: "3 1\n1", output: "1", hidden: true },
      { input: "3 1\n3", output: "0", hidden: true },
      { input: "5 1 3\n5", output: "0", hidden: true },
      { input: "4 5 6 7 8 1 2 3\n8", output: "4", hidden: true },
      { input: "4 5 6 7 8 1 2 3\n2", output: "6", hidden: true },
      { input: "8 9 2 3 4\n9", output: "1", hidden: true },
      { input: "6 7 1 2 3 4 5\n6", output: "0", hidden: true },
      { input: "6 7 1 2 3 4 5\n5", output: "6", hidden: true },
      { input: "10 20 30 1 2 3\n25", output: "-1", hidden: true }
    ]
  },
  {
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "hard",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "Merged = [1,2,3], median = 2.0." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "Merged = [1,2,3,4], median = (2 + 3) / 2 = 2.5." },
      { input: "nums1 = [0,0], nums2 = [0,0]", output: "0.0", explanation: "Merged = [0,0,0,0], median = 0.0." }
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
    topics: ["Binary Search", "Arrays", "Divide and Conquer"],
    companies: ["Google", "Amazon", "Goldman Sachs", "Apple"],
    hints: {
      h1: "Binary search on the partition of the shorter array.",
      h2: "Partition both arrays such that left parts have (m + n + 1) / 2 elements.",
      h3: "Check if maxLeft1 <= minRight2 and maxLeft2 <= minRight1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 3\n2", output: "2.0", hidden: false },
      { input: "1 2\n3 4", output: "2.5", hidden: false },
      { input: "0 0\n0 0", output: "0.0", hidden: false },
      // 10 Private Test Cases
      { input: "\n1", output: "1.0", hidden: true },
      { input: "2\n", output: "2.0", hidden: true },
      { input: "1 2 3 4 5\n", output: "3.0", hidden: true },
      { input: "1 3 5\n2 4 6", output: "3.5", hidden: true },
      { input: "1 2\n-1 3", output: "1.5", hidden: true },
      { input: "10 20\n30 40 50", output: "30.0", hidden: true },
      { input: "1 1\n1 1", output: "1.0", hidden: true },
      { input: "100 200\n150 250", output: "175.0", hidden: true },
      { input: "1 4 7 9\n2 3 5 8", output: "4.5", hidden: true },
      { input: "-5 -3 -1\n-4 -2 0", output: "-2.5", hidden: true }
    ]
  },
  {
    slug: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    difficulty: "hard",
    description: "Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. The guards have gone and will come back in h hours. Return the minimum integer k such that she can eat all the bananas within h hours.",
    examples: [
      { input: "piles = [3,6,7,11], h = 8", output: "4", explanation: "At speed 4, Koko eats all piles in 8 hours." },
      { input: "piles = [30,11,23,4,20], h = 5", output: "30", explanation: "Needs to eat at rate 30 to finish in 5 hours." },
      { input: "piles = [30,11,23,4,20], h = 6", output: "23", explanation: "At speed 23, Koko finishes in 6 hours." }
    ],
    constraints: ["1 <= piles.length <= 10^4", "piles.length <= h <= 10^9", "1 <= piles[i] <= 10^9"],
    topics: ["Binary Search", "Arrays"],
    companies: ["Airbnb", "Google"],
    hints: {
      h1: "Binary search on speed k in range [1, max(piles)].",
      h2: "For speed k, total hours required is sum(ceil(pile / k)).",
      h3: "If hours <= h, search lower speeds; else search higher speeds."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 6 7 11\n8", output: "4", hidden: false },
      { input: "30 11 23 4 20\n5", output: "30", hidden: false },
      { input: "30 11 23 4 20\n6", output: "23", hidden: false },
      // 10 Private Test Cases
      { input: "10\n1", output: "10", hidden: true },
      { input: "10\n10", output: "1", hidden: true },
      { input: "1 1 1 1\n4", output: "1", hidden: true },
      { input: "5 5 5 5\n8", output: "3", hidden: true },
      { input: "100 200 300\n6", output: "100", hidden: true },
      { input: "312884470\n312884469", output: "2", hidden: true },
      { input: "2 2\n2", output: "2", hidden: true },
      { input: "3 6 7 11\n10", output: "3", hidden: true },
      { input: "4 8 12 16\n8", output: "7", hidden: true },
      { input: "10 10 10 10 10\n5", output: "10", hidden: true }
    ]
  },
  {
    slug: "split-array-largest-sum",
    title: "Split Array Largest Sum",
    difficulty: "hard",
    description: "Given an integer array nums and an integer k, split nums into k non-empty subarrays such that the largest sum of any subarray is minimized. Return the minimized largest sum of the split.",
    examples: [
      { input: "nums = [7,2,5,10,8], k = 2", output: "18", explanation: "Best split is [7,2,5] and [10,8], where max sum is 18." },
      { input: "nums = [1,2,3,4,5], k = 2", output: "9", explanation: "Split [1,2,3] and [4,5], max sum is 9." },
      { input: "nums = [1,4,4], k = 3", output: "4", explanation: "Split into [1], [4], [4], max sum is 4." }
    ],
    constraints: ["1 <= nums.length <= 1000", "0 <= nums[i] <= 10^6", "1 <= k <= min(50, nums.length)"],
    topics: ["Binary Search", "Dynamic Programming", "Greedy"],
    companies: ["Google", "Amazon", "Baidu"],
    hints: {
      h1: "Binary search on the answer in range [max(nums), sum(nums)].",
      h2: "For a guessed maximum sum mid, greedily count subarrays needed.",
      h3: "If pieces <= k, we can try a smaller maximum sum (right = mid); else left = mid + 1."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "7 2 5 10 8\n2", output: "18", hidden: false },
      { input: "1 2 3 4 5\n2", output: "9", hidden: false },
      { input: "1 4 4\n3", output: "4", hidden: false },
      // 10 Private Test Cases
      { input: "10\n1", output: "10", hidden: true },
      { input: "1 2 3 4 5\n1", output: "15", hidden: true },
      { input: "1 2 3 4 5\n5", output: "5", hidden: true },
      { input: "10 20 30 40\n2", output: "60", hidden: true },
      { input: "5 5 5 5\n2", output: "10", hidden: true },
      { input: "1 1 1 1 1 1\n3", output: "2", hidden: true },
      { input: "100 200 100 200\n2", output: "300", hidden: true },
      { input: "2 3 1 2 4 3\n5", output: "4", hidden: true },
      { input: "9 1 2 3 4 5\n2", output: "15", hidden: true },
      { input: "10 5 15 20 5\n3", output: "20", hidden: true }
    ]
  },
  {
    slug: "find-in-mountain-array",
    title: "Find in Mountain Array",
    difficulty: "hard",
    description: "An array arr is a mountain array if it increases strictly to a peak, then decreases strictly. Given a mountain array and a target, return the minimum index such that arr[index] == target. If not found, return -1.",
    examples: [
      { input: "mountainArr = [1,2,3,4,5,3,1], target = 3", output: "2", explanation: "3 exists at index 2 and index 5. The minimum index is 2." },
      { input: "mountainArr = [0,1,2,4,2,1], target = 3", output: "-1", explanation: "3 does not exist in the array." },
      { input: "mountainArr = [1,5,2], target = 2", output: "2", explanation: "2 is at index 2." }
    ],
    constraints: ["3 <= mountainArr.length <= 10^4", "0 <= target <= 10^9"],
    topics: ["Binary Search", "Interactive", "Arrays"],
    companies: ["Bloomberg"],
    hints: {
      h1: "First, use binary search to find the peak index.",
      h2: "Search target in ascending left slope [0, peak] using binary search.",
      h3: "If not found, search target in descending right slope [peak + 1, n - 1]."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 4 5 3 1\n3", output: "2", hidden: false },
      { input: "0 1 2 4 2 1\n3", output: "-1", hidden: false },
      { input: "1 5 2\n2", output: "2", hidden: false },
      // 10 Private Test Cases
      { input: "1 5 2\n1", output: "0", hidden: true },
      { input: "1 5 2\n5", output: "1", hidden: true },
      { input: "1 2 3 4 5 2 1\n4", output: "3", hidden: true },
      { input: "1 3 5 7 6 4 2\n6", output: "4", hidden: true },
      { input: "0 5 3 1\n5", output: "1", hidden: true },
      { input: "1 2 3 4 3 2 1\n1", output: "0", hidden: true },
      { input: "1 2 3 4 3 2 1\n2", output: "1", hidden: true },
      { input: "1 2 4 5 3 1\n3", output: "4", hidden: true },
      { input: "1 2 3 4 5 6 7 2 1\n8", output: "-1", hidden: true },
      { input: "1 10 5\n10", output: "1", hidden: true }
    ]
  }
];

const content = `// TOPIC 5: BINARY SEARCH (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic5 = ${JSON.stringify(topic5Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic5_binary_search.js'), content, 'utf8');
console.log('Successfully wrote enriched topic5_binary_search.js!');
