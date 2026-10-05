// TOPIC 9: DYNAMIC PROGRAMMING (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)
export const topic9 = [
  {
    "slug": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "easy",
    "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "1 step + 1 step, or 2 steps."
      },
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "1+1+1, 1+2, or 2+1."
      },
      {
        "input": "n = 5",
        "output": "8",
        "explanation": "There are 8 distinct combinations of 1 and 2 steps."
      }
    ],
    "constraints": [
      "1 <= n <= 45"
    ],
    "topics": [
      "Math",
      "Dynamic Programming",
      "Memoization"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple"
    ],
    "hints": {
      "h1": "To reach step n, you must arrive from either step n - 1 or step n - 2.",
      "h2": "Therefore ways(n) = ways(n - 1) + ways(n - 2).",
      "h3": "This reduces to Fibonacci numbers with O(1) space using two variables."
    },
    "testcases": [
      {
        "input": "2",
        "output": "2",
        "hidden": false
      },
      {
        "input": "3",
        "output": "3",
        "hidden": false
      },
      {
        "input": "5",
        "output": "8",
        "hidden": false
      },
      {
        "input": "1",
        "output": "1",
        "hidden": true
      },
      {
        "input": "4",
        "output": "5",
        "hidden": true
      },
      {
        "input": "6",
        "output": "13",
        "hidden": true
      },
      {
        "input": "7",
        "output": "21",
        "hidden": true
      },
      {
        "input": "8",
        "output": "34",
        "hidden": true
      },
      {
        "input": "10",
        "output": "89",
        "hidden": true
      },
      {
        "input": "12",
        "output": "233",
        "hidden": true
      },
      {
        "input": "15",
        "output": "987",
        "hidden": true
      },
      {
        "input": "20",
        "output": "10946",
        "hidden": true
      },
      {
        "input": "30",
        "output": "1346269",
        "hidden": true
      }
    ]
  },
  {
    "slug": "min-cost-climbing-stairs",
    "title": "Min Cost Climbing Stairs",
    "difficulty": "easy",
    "description": "You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor.",
    "examples": [
      {
        "input": "cost = [10,15,20]",
        "output": "15",
        "explanation": "Start at index 1, pay 15 and climb two steps to reach the top."
      },
      {
        "input": "cost = [1,100,1,1,1,100,1,1,100,1]",
        "output": "6",
        "explanation": "Start at index 0 and bounce between 1s."
      },
      {
        "input": "cost = [0,0,0,1]",
        "output": "0",
        "explanation": "Step through zeroes with 0 total cost."
      }
    ],
    "constraints": [
      "2 <= cost.length <= 1000",
      "0 <= cost[i] <= 999"
    ],
    "topics": [
      "Array",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "hints": {
      "h1": "Let dp[i] be the minimum cost to reach step i.",
      "h2": "dp[i] = cost[i] + min(dp[i - 1], dp[i - 2]).",
      "h3": "The answer is min(dp[n - 1], dp[n - 2])."
    },
    "testcases": [
      {
        "input": "[10,15,20]",
        "output": "15",
        "hidden": false
      },
      {
        "input": "[1,100,1,1,1,100,1,1,100,1]",
        "output": "6",
        "hidden": false
      },
      {
        "input": "[0,0,0,1]",
        "output": "0",
        "hidden": false
      },
      {
        "input": "[10,20]",
        "output": "10",
        "hidden": true
      },
      {
        "input": "[1,2,3]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[1,1,1,1]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[0,1,2,2]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[5,10,15,20]",
        "output": "20",
        "hidden": true
      },
      {
        "input": "[0,2,2,1]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[1,100,2,100,3]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[10,15,20,5,10,25]",
        "output": "30",
        "hidden": true
      },
      {
        "input": "[10,10,10,10,10]",
        "output": "20",
        "hidden": true
      },
      {
        "input": "[1,2,1,2,1,2,1]",
        "output": "4",
        "hidden": true
      }
    ]
  },
  {
    "slug": "fibonacci-number",
    "title": "Fibonacci Number",
    "difficulty": "easy",
    "description": "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is, F(0) = 0, F(1) = 1, and F(n) = F(n - 1) + F(n - 2) for n > 1. Given n, calculate F(n).",
    "examples": [
      {
        "input": "n = 2",
        "output": "1",
        "explanation": "F(2) = F(1) + F(0) = 1 + 0 = 1."
      },
      {
        "input": "n = 4",
        "output": "3",
        "explanation": "F(4) = F(3) + F(2) = 2 + 1 = 3."
      },
      {
        "input": "n = 0",
        "output": "0",
        "explanation": "F(0) = 0."
      }
    ],
    "constraints": [
      "0 <= n <= 30"
    ],
    "topics": [
      "Math",
      "Dynamic Programming",
      "Recursion",
      "Memoization"
    ],
    "companies": [
      "Amazon",
      "Apple",
      "Microsoft"
    ],
    "hints": {
      "h1": "Base cases: F(0) = 0, F(1) = 1.",
      "h2": "Maintain two variables (a = 0, b = 1) and iteratively update (a, b) = (b, a + b).",
      "h3": "This avoids exponential recursion and gives O(N) time and O(1) space."
    },
    "testcases": [
      {
        "input": "2",
        "output": "1",
        "hidden": false
      },
      {
        "input": "4",
        "output": "3",
        "hidden": false
      },
      {
        "input": "0",
        "output": "0",
        "hidden": false
      },
      {
        "input": "1",
        "output": "1",
        "hidden": true
      },
      {
        "input": "3",
        "output": "2",
        "hidden": true
      },
      {
        "input": "5",
        "output": "5",
        "hidden": true
      },
      {
        "input": "6",
        "output": "8",
        "hidden": true
      },
      {
        "input": "7",
        "output": "13",
        "hidden": true
      },
      {
        "input": "8",
        "output": "21",
        "hidden": true
      },
      {
        "input": "10",
        "output": "55",
        "hidden": true
      },
      {
        "input": "15",
        "output": "610",
        "hidden": true
      },
      {
        "input": "20",
        "output": "6765",
        "hidden": true
      },
      {
        "input": "30",
        "output": "832040",
        "hidden": true
      }
    ]
  },
  {
    "slug": "house-robber",
    "title": "House Robber",
    "difficulty": "medium",
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4",
        "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12",
        "explanation": "Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 12."
      },
      {
        "input": "nums = [2,1,1,2]",
        "output": "4",
        "explanation": "Rob first house (2) and fourth house (2). Total = 4."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    "topics": [
      "Array",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Cisco"
    ],
    "hints": {
      "h1": "For each house i, you have two choices: rob it, or skip it.",
      "h2": "If you rob house i, you cannot rob house i - 1: total = nums[i] + rob(i - 2).",
      "h3": "If you skip house i: total = rob(i - 1). Therefore dp[i] = max(dp[i - 1], nums[i] + dp[i - 2])."
    },
    "testcases": [
      {
        "input": "[1,2,3,1]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[2,7,9,3,1]",
        "output": "12",
        "hidden": false
      },
      {
        "input": "[2,1,1,2]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[0]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[1]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[1,2]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[2,1]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[1,3,1]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[1,2,1,1]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[10,2,3,20]",
        "output": "30",
        "hidden": true
      },
      {
        "input": "[10,20,30,40,50]",
        "output": "90",
        "hidden": true
      },
      {
        "input": "[100,1,1,100]",
        "output": "200",
        "hidden": true
      },
      {
        "input": "[4,1,2,7,5,3,1]",
        "output": "14",
        "hidden": true
      }
    ]
  },
  {
    "slug": "coin-change",
    "title": "Coin Change",
    "difficulty": "medium",
    "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin.",
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1",
        "explanation": "Cannot make 3 using only 2s."
      },
      {
        "input": "coins = [1], amount = 0",
        "output": "0",
        "explanation": "0 amount requires 0 coins."
      }
    ],
    "constraints": [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ],
    "topics": [
      "Array",
      "Dynamic Programming",
      "Breadth-First Search"
    ],
    "companies": [
      "Amazon",
      "Bloomberg",
      "Google",
      "Facebook"
    ],
    "hints": {
      "h1": "Create a dp array of size amount + 1, initialized to amount + 1 (infinity), with dp[0] = 0.",
      "h2": "For each coin c, iterate through amounts from c to amount.",
      "h3": "Update dp[i] = min(dp[i], dp[i - c] + 1). Return dp[amount] > amount ? -1 : dp[amount]."
    },
    "testcases": [
      {
        "input": "[1,2,5]\n11",
        "output": "3",
        "hidden": false
      },
      {
        "input": "[2]\n3",
        "output": "-1",
        "hidden": false
      },
      {
        "input": "[1]\n0",
        "output": "0",
        "hidden": false
      },
      {
        "input": "[1]\n1",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[1]\n2",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[2,5]\n10",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[2,5]\n11",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[1,3,4,5]\n7",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[186,419,83,408]\n6249",
        "output": "20",
        "hidden": true
      },
      {
        "input": "[3,7]\n11",
        "output": "-1",
        "hidden": true
      },
      {
        "input": "[5,10,25]\n30",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[1,2,5,10]\n18",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[4,6]\n9",
        "output": "-1",
        "hidden": true
      }
    ]
  },
  {
    "slug": "longest-increasing-subsequence",
    "title": "Longest Increasing Subsequence",
    "difficulty": "medium",
    "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence. A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.",
    "examples": [
      {
        "input": "nums = [10,9,2,5,3,7,101,18]",
        "output": "4",
        "explanation": "The longest increasing subsequence is [2,3,7,101], length 4."
      },
      {
        "input": "nums = [0,1,0,3,2,3]",
        "output": "4",
        "explanation": "[0,1,2,3], length 4."
      },
      {
        "input": "nums = [7,7,7,7,7,7,7]",
        "output": "1",
        "explanation": "All elements identical, length 1."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "topics": [
      "Array",
      "Binary Search",
      "Dynamic Programming"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Facebook"
    ],
    "hints": {
      "h1": "O(N^2) approach: dp[i] = length of LIS ending at index i. dp[i] = 1 + max(dp[j]) for j < i and nums[j] < nums[i].",
      "h2": "O(N log N) approach: Maintain a 'tails' array where tails[i] stores the smallest tail of all increasing subsequences of length i+1.",
      "h3": "For each x in nums, binary search in tails to find its position. If greater than all tails, append; otherwise replace."
    },
    "testcases": [
      {
        "input": "[10,9,2,5,3,7,101,18]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[0,1,0,3,2,3]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[7,7,7,7,7,7,7]",
        "output": "1",
        "hidden": false
      },
      {
        "input": "[1]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[1,2,3,4,5]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "[5,4,3,2,1]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[4,10,4,3,8,9]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[1,3,6,7,9,4,10,5,6]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[3,5,6,2,5,4,19,5,6,7,12]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[1,2]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[2,1]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[10,22,9,33,21,50,41,60,80]",
        "output": "6",
        "hidden": true
      }
    ]
  },
  {
    "slug": "edit-distance",
    "title": "Edit Distance",
    "difficulty": "hard",
    "description": "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.",
    "examples": [
      {
        "input": "word1 = \"horse\", word2 = \"ros\"",
        "output": "3",
        "explanation": "horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e')"
      },
      {
        "input": "word1 = \"intention\", word2 = \"execution\"",
        "output": "5",
        "explanation": "5 operations needed."
      },
      {
        "input": "word1 = \"\", word2 = \"a\"",
        "output": "1",
        "explanation": "Insert 'a'."
      }
    ],
    "constraints": [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters."
    ],
    "topics": [
      "String",
      "Dynamic Programming"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Facebook",
      "Microsoft"
    ],
    "hints": {
      "h1": "Define dp[i][j] as the edit distance between word1[0..i-1] and word2[0..j-1].",
      "h2": "If word1[i-1] == word2[j-1], dp[i][j] = dp[i-1][j-1].",
      "h3": "Otherwise, dp[i][j] = 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))."
    },
    "testcases": [
      {
        "input": "\"horse\"\n\"ros\"",
        "output": "3",
        "hidden": false
      },
      {
        "input": "\"intention\"\n\"execution\"",
        "output": "5",
        "hidden": false
      },
      {
        "input": "\"\"\n\"a\"",
        "output": "1",
        "hidden": false
      },
      {
        "input": "\"a\"\n\"\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"\"\n\"\"",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"a\"\n\"a\"",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"a\"\n\"b\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"sea\"\n\"eat\"",
        "output": "2",
        "hidden": true
      },
      {
        "input": "\"abc\"\n\"yabd\"",
        "output": "2",
        "hidden": true
      },
      {
        "input": "\"kitten\"\n\"sitting\"",
        "output": "3",
        "hidden": true
      },
      {
        "input": "\"flaw\"\n\"lawn\"",
        "output": "2",
        "hidden": true
      },
      {
        "input": "\"dinitrophenylhydrazine\"\n\"acetylphenylhydrazine\"",
        "output": "6",
        "hidden": true
      },
      {
        "input": "\"zoologico\"\n\"zoologo\"",
        "output": "2",
        "hidden": true
      }
    ]
  },
  {
    "slug": "trapping-rain-water-ii",
    "title": "Trapping Rain Water II",
    "difficulty": "hard",
    "description": "Given an m x n integer matrix heightMap representing the height of each unit cell in a 2D elevation map, return the volume of water it can trap after raining.",
    "examples": [
      {
        "input": "heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]",
        "output": "4",
        "explanation": "Total 4 units of water are trapped."
      },
      {
        "input": "heightMap = [[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]]",
        "output": "10",
        "explanation": "Total 10 units trapped inside the hollow bowl."
      },
      {
        "input": "heightMap = [[1,1],[1,1]]",
        "output": "0",
        "explanation": "Flat border cannot trap water."
      }
    ],
    "constraints": [
      "m == heightMap.length",
      "n == heightMap[i].length",
      "1 <= m, n <= 200",
      "0 <= heightMap[i][j] <= 2 * 10^4"
    ],
    "topics": [
      "Array",
      "Breadth-First Search",
      "Heap (Priority Queue)",
      "Matrix"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Twitter"
    ],
    "hints": {
      "h1": "Water spills over the lowest boundary cell. This suggests using a Min-Heap (Priority Queue).",
      "h2": "Add all boundary cells of the grid to the Min-Heap and mark them as visited.",
      "h3": "Pop the lowest boundary cell; examine its unvisited 4-neighbors. If neighbor height < current boundary, trap water (boundary - neighbor), and push neighbor with max(neighbor, boundary)."
    },
    "testcases": [
      {
        "input": "[[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]]",
        "output": "10",
        "hidden": false
      },
      {
        "input": "[[1,1],[1,1]]",
        "output": "0",
        "hidden": false
      },
      {
        "input": "[[1]]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[[1,2,3],[4,5,6]]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[[5,5,5],[5,1,5],[5,5,5]]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[[12,13,1,12],[13,4,13,12],[13,8,10,12],[12,13,12,12],[13,13,13,13]]",
        "output": "14",
        "hidden": true
      },
      {
        "input": "[[2,2,2],[2,1,2],[2,2,2]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[3,3,3],[3,0,3],[3,3,3]]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[[9,9,9,9],[9,0,0,9],[9,9,9,9]]",
        "output": "18",
        "hidden": true
      },
      {
        "input": "[[10,10,10],[10,5,10],[10,10,10]]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "[[2,3,4],[5,6,7],[8,9,10]]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[[5,5,5,5],[5,2,3,5],[5,5,5,5]]",
        "output": "5",
        "hidden": true
      }
    ]
  },
  {
    "slug": "regular-expression-matching",
    "title": "Regular Expression Matching",
    "difficulty": "hard",
    "description": "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where: '.' Matches any single character. '*' Matches zero or more of the preceding element. The matching should cover the entire input string (not partial).",
    "examples": [
      {
        "input": "s = \"aa\", p = \"a\"",
        "output": "false",
        "explanation": "\"a\" does not match the entire string \"aa\"."
      },
      {
        "input": "s = \"aa\", p = \"a*\"",
        "output": "true",
        "explanation": "'*' means zero or more of the preceding element, 'a'."
      },
      {
        "input": "s = \"ab\", p = \".*\"",
        "output": "true",
        "explanation": "\".*\" means \"zero or more (*) of any character (.)\"."
      }
    ],
    "constraints": [
      "1 <= s.length <= 20",
      "1 <= p.length <= 20",
      "s contains only lowercase English letters.",
      "p contains only lowercase English letters, '.', and '*'."
    ],
    "topics": [
      "String",
      "Dynamic Programming",
      "Recursion"
    ],
    "companies": [
      "Google",
      "Facebook",
      "Amazon",
      "Uber"
    ],
    "hints": {
      "h1": "Use 2D DP table dp[i][j] representing if s[0..i-1] matches p[0..j-1].",
      "h2": "If p[j-1] != '*', characters must match: (s[i-1] == p[j-1] || p[j-1] == '.') && dp[i-1][j-1].",
      "h3": "If p[j-1] == '*', consider two cases: 0 occurrences (dp[i][j-2]) or 1+ occurrences ((s[i-1] == p[j-2] || p[j-2] == '.') && dp[i-1][j])."
    },
    "testcases": [
      {
        "input": "\"aa\"\n\"a\"",
        "output": "false",
        "hidden": false
      },
      {
        "input": "\"aa\"\n\"a*\"",
        "output": "true",
        "hidden": false
      },
      {
        "input": "\"ab\"\n\".*\"",
        "output": "true",
        "hidden": false
      },
      {
        "input": "\"aab\"\n\"c*a*b\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"mississippi\"\n\"mis*is*p*.\"",
        "output": "false",
        "hidden": true
      },
      {
        "input": "\"\"\n\".*\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"\"\n\"\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"a\"\n\"ab*\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"bbbba\"\n\".*a*a\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"ab\"\n\".*c\"",
        "output": "false",
        "hidden": true
      },
      {
        "input": "\"aaa\"\n\"a*a\"",
        "output": "true",
        "hidden": true
      },
      {
        "input": "\"aaa\"\n\"aaaa\"",
        "output": "false",
        "hidden": true
      },
      {
        "input": "\"a\"\n\".*..\"",
        "output": "false",
        "hidden": true
      }
    ]
  },
  {
    "slug": "distinct-subsequences",
    "title": "Distinct Subsequences",
    "difficulty": "hard",
    "description": "Given two strings s and t, return the number of distinct subsequences of s which equals t. The test cases are generated so that the answer fits on a 32-bit signed integer.",
    "examples": [
      {
        "input": "s = \"rabbbit\", t = \"rabbit\"",
        "output": "3",
        "explanation": "There are 3 ways you can generate \"rabbit\" from \"rabbbit\"."
      },
      {
        "input": "s = \"babgbag\", t = \"bag\"",
        "output": "5",
        "explanation": "There are 5 ways to make \"bag\"."
      },
      {
        "input": "s = \"a\", t = \"b\"",
        "output": "0",
        "explanation": "\"b\" cannot be formed from \"a\"."
      }
    ],
    "constraints": [
      "1 <= s.length, t.length <= 1000",
      "s and t consist of English letters."
    ],
    "topics": [
      "String",
      "Dynamic Programming"
    ],
    "companies": [
      "Google",
      "Amazon"
    ],
    "hints": {
      "h1": "Let dp[i][j] be the number of distinct subsequences of s[0..i-1] that match t[0..j-1].",
      "h2": "Base cases: dp[i][0] = 1 for all i, because an empty target t has 1 match (empty subsequence).",
      "h3": "If s[i-1] == t[j-1], dp[i][j] = dp[i-1][j-1] + dp[i-1][j]; otherwise dp[i][j] = dp[i-1][j]."
    },
    "testcases": [
      {
        "input": "\"rabbbit\"\n\"rabbit\"",
        "output": "3",
        "hidden": false
      },
      {
        "input": "\"babgbag\"\n\"bag\"",
        "output": "5",
        "hidden": false
      },
      {
        "input": "\"a\"\n\"b\"",
        "output": "0",
        "hidden": false
      },
      {
        "input": "\"a\"\n\"a\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"\"\n\"a\"",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"a\"\n\"\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"aaa\"\n\"a\"",
        "output": "3",
        "hidden": true
      },
      {
        "input": "\"aaa\"\n\"aa\"",
        "output": "3",
        "hidden": true
      },
      {
        "input": "\"aaa\"\n\"aaa\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"ananas\"\n\"ana\"",
        "output": "3",
        "hidden": true
      },
      {
        "input": "\"b\"\n\"b\"",
        "output": "1",
        "hidden": true
      },
      {
        "input": "\"b\"\n\"a\"",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"adbdadeecadeadeccaeaabdabdbcdabddddabcaaabc\"\n\"bcddceeeebecbc\"",
        "output": "0",
        "hidden": true
      }
    ]
  }
];
