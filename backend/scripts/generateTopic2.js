import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic2Enriched = [
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "easy",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    examples: [
      { input: "s = \"A man, a plan, a canal: Panama\"", output: "true", explanation: "\"amanaplanacanalpanama\" is a palindrome." },
      { input: "s = \"race a car\"", output: "false", explanation: "\"raceacar\" is not a palindrome." },
      { input: "s = \" \"", output: "true", explanation: "s is an empty string \"\" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome." }
    ],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    topics: ["Two Pointers", "String"],
    companies: ["Facebook", "Microsoft", "Amazon"],
    hints: {
      h1: "Consider using two pointers: one at the start, one at the end.",
      h2: "Skip non-alphanumeric characters and compare case-insensitively.",
      h3: "If any character pair mismatches, return false immediately."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "A man, a plan, a canal: Panama", output: "true", hidden: false },
      { input: "race a car", output: "false", hidden: false },
      { input: " ", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "0P", output: "false", hidden: true },
      { input: "a", output: "true", hidden: true },
      { input: "ab", output: "false", hidden: true },
      { input: "aba", output: "true", hidden: true },
      { input: "Madam, I'm Adam", output: "true", hidden: true },
      { input: "No lemon, no melon", output: "true", hidden: true },
      { input: "Was it a car or a cat I saw?", output: "true", hidden: true },
      { input: "hello world", output: "false", hidden: true },
      { input: "12321", output: "true", hidden: true },
      { input: "12345", output: "false", hidden: true }
    ]
  },
  {
    slug: "move-zeroes",
    title: "Move Zeroes",
    difficulty: "easy",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
    examples: [
      { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "All zeroes are moved to the end." },
      { input: "nums = [0]", output: "[0]", explanation: "Single zero element remains unchanged." },
      { input: "nums = [1,2,3]", output: "[1,2,3]", explanation: "No zeroes to move." }
    ],
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    topics: ["Arrays", "Two Pointers"],
    companies: ["Facebook", "Bloomberg", "Amazon"],
    hints: {
      h1: "Keep a slow pointer representing the index for the next non-zero element.",
      h2: "Iterate with a fast pointer; when nums[fast] != 0, write it to nums[slow].",
      h3: "Fill the rest of the array with zeroes after the loop."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "0 1 0 3 12", output: "1 3 12 0 0", hidden: false },
      { input: "0", output: "0", hidden: false },
      { input: "1 2 3", output: "1 2 3", hidden: false },
      // 10 Private Test Cases
      { input: "0 0 1", output: "1 0 0", hidden: true },
      { input: "1 0 1", output: "1 1 0", hidden: true },
      { input: "0 0 0 0", output: "0 0 0 0", hidden: true },
      { input: "4 2 4 0 0 3 0 5 1 0", output: "4 2 4 3 5 1 0 0 0 0", hidden: true },
      { input: "1 0", output: "1 0", hidden: true },
      { input: "0 1", output: "1 0", hidden: true },
      { input: "-1 0 3 -2 0", output: "-1 3 -2 0 0", hidden: true },
      { input: "5 4 3 2 1", output: "5 4 3 2 1", hidden: true },
      { input: "0 0 0 1", output: "1 0 0 0", hidden: true },
      { input: "10 0 20 0 30", output: "10 20 30 0 0", hidden: true }
    ]
  },
  {
    slug: "remove-duplicates-from-sorted-array",
    title: "Remove Duplicates from Sorted Array",
    difficulty: "easy",
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.",
    examples: [
      { input: "nums = [1,1,2]", output: "2", explanation: "Unique elements are [1, 2], with length k = 2." },
      { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5", explanation: "Unique elements are [0, 1, 2, 3, 4], length k = 5." },
      { input: "nums = [1,2,3,4,5]", output: "5", explanation: "Already unique, length k = 5." }
    ],
    constraints: ["1 <= nums.length <= 3 * 10^4", "-100 <= nums[i] <= 100", "nums is sorted in non-decreasing order."],
    topics: ["Arrays", "Two Pointers"],
    companies: ["Microsoft", "Google", "Amazon"],
    hints: {
      h1: "Use two pointers: one pointer for the unique element insertion position, one for scanning.",
      h2: "Whenever nums[fast] != nums[fast - 1], update nums[slow++] = nums[fast].",
      h3: "Return slow pointer position as k."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 1 2", output: "2", hidden: false },
      { input: "0 0 1 1 1 2 2 3 3 4", output: "5", hidden: false },
      { input: "1 2 3 4 5", output: "5", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "1", hidden: true },
      { input: "1 1", output: "1", hidden: true },
      { input: "1 1 1 1 1", output: "1", hidden: true },
      { input: "-10 -10 -5 0 0 3 3", output: "4", hidden: true },
      { input: "2 2 3 3 4 4 5 5", output: "4", hidden: true },
      { input: "1 2", output: "2", hidden: true },
      { input: "-3 -3 -2 -1 -1 0 0", output: "4", hidden: true },
      { input: "0 0 0", output: "1", hidden: true },
      { input: "10 20 30", output: "3", hidden: true },
      { input: "-50 -50 50 50", output: "2", hidden: true }
    ]
  },
  {
    slug: "two-sum-ii-input-array-is-sorted",
    title: "Two Sum II - Input Array Is Sorted",
    difficulty: "medium",
    description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.",
    examples: [
      { input: "numbers = [2,7,11,15], target = 9", output: "[1,2]", explanation: "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2." },
      { input: "numbers = [2,3,4], target = 6", output: "[1,3]", explanation: "The sum of 2 and 4 is 6. Therefore, index1 = 1, index2 = 3." },
      { input: "numbers = [-1,0], target = -1", output: "[1,2]", explanation: "The sum of -1 and 0 is -1. Therefore, index1 = 1, index2 = 2." }
    ],
    constraints: ["2 <= numbers.length <= 3 * 10^4", "-1000 <= numbers[i] <= 1000", "numbers is sorted in non-decreasing order.", "-1000 <= target <= 1000", "Exactly one solution exists."],
    topics: ["Arrays", "Two Pointers", "Binary Search"],
    companies: ["Amazon", "Google", "Apple"],
    hints: {
      h1: "Since the array is sorted, two pointers at both ends can solve this in O(N).",
      h2: "If sum < target, advance the left pointer. If sum > target, decrement right pointer.",
      h3: "Remember to use 1-based indexing for the result."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "2 7 11 15\n9", output: "1 2", hidden: false },
      { input: "2 3 4\n6", output: "1 3", hidden: false },
      { input: "-1 0\n-1", output: "1 2", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 4 9 56 90\n8", output: "4 5", hidden: true },
      { input: "5 25 75\n100", output: "2 3", hidden: true },
      { input: "-3 3 4 90\n0", output: "1 2", hidden: true },
      { input: "1 3 5 7 9\n12", output: "2 4", hidden: true },
      { input: "1 2\n3", output: "1 2", hidden: true },
      { input: "-5 -3 -1 0 2 4\n-1", output: "1 6", hidden: true },
      { input: "10 20 30 40 50\n70", output: "2 5", hidden: true },
      { input: "-10 -5 0 5 10\n0", output: "1 5", hidden: true },
      { input: "2 4 6 8 10\n14", output: "2 5", hidden: true },
      { input: "1 5 10 15 20\n25", output: "1 5", hidden: true }
    ]
  },
  {
    slug: "3sum",
    title: "3Sum",
    difficulty: "medium",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "Triplets that sum to 0." },
      { input: "nums = [0,1,1]", output: "[]", explanation: "No triplets sum to 0." },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]", explanation: "The only possible triplet sums to 0." }
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    topics: ["Arrays", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Facebook", "Microsoft", "Apple"],
    hints: {
      h1: "Sort the array first. Then fix the first element and use two pointers for the remaining two.",
      h2: "To avoid duplicate triplets, skip elements identical to their predecessors.",
      h3: "When a match is found, increment left and decrement right while skipping duplicates."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2 | -1 0 1", hidden: false },
      { input: "0 1 1", output: "", hidden: false },
      { input: "0 0 0", output: "0 0 0", hidden: false },
      // 10 Private Test Cases
      { input: "-2 0 1 1 2", output: "-2 0 2 | -2 1 1", hidden: true },
      { input: "-4 -2 -2 -2 0 1 2 2 2 3 3 4 4 6 6", output: "-4 -2 6 | -4 0 4 | -4 1 3 | -4 2 2 | -2 -2 4 | -2 0 2", hidden: true },
      { input: "1 2 -2 -1", output: "", hidden: true },
      { input: "-1 0 1", output: "-1 0 1", hidden: true },
      { input: "-2 0 0 2 2", output: "-2 0 2", hidden: true },
      { input: "3 0 -2 -1 1 2", output: "-2 -1 3 | -2 0 2 | -1 0 1", hidden: true },
      { input: "-5 1 2 3 4", output: "-5 1 4 | -5 2 3", hidden: true },
      { input: "0 0 0 0", output: "0 0 0", hidden: true },
      { input: "-1 -1 2 2", output: "-1 -1 2", hidden: true },
      { input: "-3 1 2", output: "-3 1 2", hidden: true }
    ]
  },
  {
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "medium",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8 hold 7 * 7 = 49." },
      { input: "height = [1,1]", output: "1", explanation: "Width 1 * height 1 = 1." },
      { input: "height = [4,3,2,1,4]", output: "16", explanation: "Width 4 * height 4 = 16." }
    ],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    topics: ["Arrays", "Two Pointers", "Greedy"],
    companies: ["Google", "Amazon", "Facebook", "Goldman Sachs"],
    hints: {
      h1: "Start with maximum width using pointers at indices 0 and n - 1.",
      h2: "Area is constrained by the shorter line: area = min(h[l], h[r]) * (r - l).",
      h3: "Always move the pointer pointing to the shorter vertical bar inward."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 8 6 2 5 4 8 3 7", output: "49", hidden: false },
      { input: "1 1", output: "1", hidden: false },
      { input: "4 3 2 1 4", output: "16", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 1", output: "2", hidden: true },
      { input: "2 3 4 5 18 17 6", output: "17", hidden: true },
      { input: "1 2 4 3", output: "4", hidden: true },
      { input: "5 5 5 5 5", output: "20", hidden: true },
      { input: "1 100 100 1", output: "100", hidden: true },
      { input: "10 9 8 7 6 5 4 3 2 1", output: "25", hidden: true },
      { input: "1 3 2 5 25 24 5", output: "24", hidden: true },
      { input: "100 1 1 1 100", output: "400", hidden: true },
      { input: "2 1", output: "1", hidden: true },
      { input: "6 9 3 4 5 8", output: "32", hidden: true }
    ]
  },
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "hard",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of rain water are trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "9 units of rain water trapped between bars." },
      { input: "height = [3,0,2,0,4]", output: "7", explanation: "7 units of rain water trapped." }
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    topics: ["Arrays", "Two Pointers", "Dynamic Programming", "Stack"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"],
    hints: {
      h1: "Water trapped above bar i is min(maxLeft[i], maxRight[i]) - height[i].",
      h2: "Use two pointers from left and right, maintaining leftMax and rightMax.",
      h3: "Advance the pointer with the smaller max to guarantee valid water bounds."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6", hidden: false },
      { input: "4 2 0 3 2 5", output: "9", hidden: false },
      { input: "3 0 2 0 4", output: "7", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5", output: "0", hidden: true },
      { input: "5 4 3 2 1", output: "0", hidden: true },
      { input: "5 0 5", output: "5", hidden: true },
      { input: "3 1 2 4", output: "3", hidden: true },
      { input: "2 0 2", output: "2", hidden: true },
      { input: "0", output: "0", hidden: true },
      { input: "5 2 1 2 1 5", output: "14", hidden: true },
      { input: "4 2 3", output: "1", hidden: true },
      { input: "0 1 2 0 3 0 1 2 0 0 4 0", output: "15", hidden: true },
      { input: "6 4 2 0 3 2 0 3 1 4 5 3 2 7 5 3 0 1 2 1 3 4 6 8 1 3", output: "83", hidden: true }
    ]
  },
  {
    slug: "4sum",
    title: "4Sum",
    difficulty: "medium",
    description: "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:\n- 0 <= a, b, c, d < n\n- a, b, c, and d are distinct.\n- nums[a] + nums[b] + nums[c] + nums[d] == target\n\nYou may return the answer in any order.",
    examples: [
      { input: "nums = [1,0,-1,0,-2,2], target = 0", output: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]", explanation: "Three quadruplets sum to 0." },
      { input: "nums = [2,2,2,2,2], target = 8", output: "[[2,2,2,2]]", explanation: "Only one unique quadruplet exists." },
      { input: "nums = [0,0,0,0], target = 0", output: "[[0,0,0,0]]", explanation: "Four zeroes sum to 0." }
    ],
    constraints: ["1 <= nums.length <= 200", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    topics: ["Arrays", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Apple", "Microsoft"],
    hints: {
      h1: "Sort the input array to make duplicate skipping easy.",
      h2: "Use two nested loops to fix the first two numbers, then two pointers for the remaining two.",
      h3: "Carefully skip duplicate values for all four indices."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 0 -1 0 -2 2\n0", output: "-2 -1 1 2 | -2 0 0 2 | -1 0 0 1", hidden: false },
      { input: "2 2 2 2 2\n8", output: "2 2 2 2", hidden: false },
      { input: "0 0 0 0\n0", output: "0 0 0 0", hidden: false },
      // 10 Private Test Cases
      { input: "-3 -2 -1 0 0 1 2 3\n0", output: "-3 -2 2 3 | -3 -1 1 3 | -3 0 0 3 | -3 0 1 2 | -2 -1 0 3 | -2 -1 1 2 | -2 0 0 2 | -1 0 0 1", hidden: true },
      { input: "1 2 3 4\n10", output: "1 2 3 4", hidden: true },
      { input: "1 2 3 4\n5", output: "", hidden: true },
      { input: "-1 0 1 2 -1 -4\n-1", output: "-4 0 1 2 | -1 -1 0 1", hidden: true },
      { input: "1 -2 -5 -4 -3 3 3 5\n-11", output: "-5 -4 -3 1", hidden: true },
      { input: "0 0 0\n0", output: "", hidden: true },
      { input: "1 1 1 1 1\n4", output: "1 1 1 1", hidden: true },
      { input: "-5 5 4 -3 0 0 4 -2\n4", output: "-5 0 4 5 | -3 -2 4 5 | -2 0 2 4", hidden: true },
      { input: "1000000000 1000000000 1000000000 1000000000\n-294967296", output: "", hidden: true },
      { input: "-2 -1 0 1 2 3\n0", output: "-2 -1 0 3 | -2 -1 1 2", hidden: true }
    ]
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "hard",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    examples: [
      { input: "s = \"ADOBECODEBANC\", t = \"ABC\"", output: "\"BANC\"", explanation: "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t." },
      { input: "s = \"a\", t = \"a\"", output: "\"a\"", explanation: "The entire string s is the minimum window." },
      { input: "s = \"a\", t = \"aa\"", output: "\"\"", explanation: "Both 'a's from t must be included in the window. Since the largest window of s only has one 'a', return empty string." }
    ],
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5", "s and t consist of uppercase and lowercase English letters."],
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["Facebook", "Amazon", "LinkedIn", "Microsoft", "Uber"],
    hints: {
      h1: "Use two pointers to create a sliding window: expand right until valid, shrink left to minimize.",
      h2: "Maintain a character frequency dictionary for t and match counts inside the active window.",
      h3: "Keep track of the minimum window length and its starting index throughout the traversal."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "ADOBECODEBANC\nABC", output: "BANC", hidden: false },
      { input: "a\na", output: "a", hidden: false },
      { input: "a\naa", output: "", hidden: false },
      // 10 Private Test Cases
      { input: "ab\nb", output: "b", hidden: true },
      { input: "ab\na", output: "a", hidden: true },
      { input: "aaflslflsldkalskaaa\naaa", output: "aaa", hidden: true },
      { input: "cabwefgewcwaefgcf\ncae", output: "cwae", hidden: true },
      { input: "bba\nab", output: "ba", hidden: true },
      { input: "bdab\nab", output: "ab", hidden: true },
      { input: "this is a test string\ntist", output: "t stri", hidden: true },
      { input: "geeksforgeeks\nork", output: "ksfor", hidden: true },
      { input: "xyz\na", output: "", hidden: true },
      { input: "abcde\nace", output: "abcde", hidden: true }
    ]
  },
  {
    slug: "smallest-range-covering-elements-from-k-lists",
    title: "Smallest Range Covering Elements from K Lists",
    difficulty: "hard",
    description: "You have k lists of sorted integers in non-decreasing order. Find the smallest range that includes at least one number from each of the k lists.\n\nWe define the range [a, b] is smaller than range [c, d] if b - a < d - c, or a < c if b - a == d - c.",
    examples: [
      { input: "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]", output: "[20,24]", explanation: "List 1: 24, List 2: 20, List 3: 22. Range [20,24] covers all three lists." },
      { input: "nums = [[1,2,3],[1,2,3],[1,2,3]]", output: "[1,1]", explanation: "Number 1 appears in all 3 lists." },
      { input: "nums = [[1],[2],[3],[4]]", output: "[1,4]", explanation: "Must cover from minimum 1 to maximum 4." }
    ],
    constraints: ["nums.length == k", "1 <= k <= 3500", "1 <= nums[i].length <= 50", "-10^5 <= nums[i][j] <= 10^5", "nums[i] is sorted in non-decreasing order."],
    topics: ["Arrays", "Hash Table", "Two Pointers", "Heap (Priority Queue)"],
    companies: ["Amazon", "Google", "Lyft"],
    hints: {
      h1: "Merge all elements into a single sorted list of pairs: (value, list_id).",
      h2: "Use a sliding window over the merged list to find the shortest range containing all k list IDs.",
      h3: "Alternatively, use a min-heap tracking the current element from each of the k lists."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "4 10 15 24 26 | 0 9 12 20 | 5 18 22 30", output: "20 24", hidden: false },
      { input: "1 2 3 | 1 2 3 | 1 2 3", output: "1 1", hidden: false },
      { input: "1 | 2 | 3 | 4", output: "1 4", hidden: false },
      // 10 Private Test Cases
      { input: "10 10 | 11 11", output: "10 11", hidden: true },
      { input: "1 5 | 2 6 | 3 7", output: "1 3", hidden: true },
      { input: "1 3 5 | 2 4 6", output: "1 2", hidden: true },
      { input: "1 10 | 2 3 4 5", output: "1 2", hidden: true },
      { input: "10 | 20 | 30", output: "10 30", hidden: true },
      { input: "1 2 3 4 5 | 5 6 7 8 9", output: "5 5", hidden: true },
      { input: "2 4 6 | 1 3 5", output: "1 2", hidden: true },
      { input: "100 200 | 150 250", output: "100 150", hidden: true },
      { input: "1 4 | 2 5 | 3 6", output: "1 3", hidden: true },
      { input: "-10 -5 | 0 5 | 10 15", output: "-5 10", hidden: true }
    ]
  },
  {
    slug: "palindrome-number-verification",
    title: "Palindrome Number Verification",
    difficulty: "easy",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\nFor example, 121 is a palindrome while 123 is not. Negative numbers are never palindromic because the negative sign does not mirror (e.g., -121 reads as 121- from right to left). Also, numbers ending in 0 (other than 0 itself) cannot be palindromes.",
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." },
      { input: "x = 10", output: "false", explanation: "Reads 01 from right to left. Therefore it is not a palindrome." }
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1", "Time Limit: 2.0s", "Memory Limit: 256MB", "Follow-up: Could you solve it without converting the integer to a string?"],
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
  }
];

const content = `// TOPIC 2: TWO POINTERS (11 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic2 = ${JSON.stringify(topic2Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic2_two_pointers.js'), content, 'utf8');
console.log('Successfully wrote enriched topic2_two_pointers.js!');
