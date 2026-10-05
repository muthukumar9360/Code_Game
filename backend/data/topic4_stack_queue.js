// TOPIC 4: STACK & QUEUE (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)
export const topic4 = [
  {
    "slug": "valid-parentheses",
    "title": "Valid Parentheses",
    "difficulty": "easy",
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    "examples": [
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "All brackets close properly."
      },
      {
        "input": "s = \"(]\"",
        "output": "false",
        "explanation": "Mismatched bracket types."
      },
      {
        "input": "s = \"([{}])\"",
        "output": "true",
        "explanation": "Nested brackets closed in the exact reverse order."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    "topics": [
      "Stack",
      "Strings"
    ],
    "companies": [
      "Amazon",
      "Bloomberg",
      "Google"
    ],
    "hints": {
      "h1": "Push opening brackets onto a stack.",
      "h2": "When encountering a closing bracket, check if the top of the stack matches its corresponding pair.",
      "h3": "At the end, the stack must be completely empty."
    },
    "testcases": [
      {
        "input": "()[]{}",
        "output": "true",
        "hidden": false
      },
      {
        "input": "(]",
        "output": "false",
        "hidden": false
      },
      {
        "input": "([{}])",
        "output": "true",
        "hidden": false
      },
      {
        "input": "]",
        "output": "false",
        "hidden": true
      },
      {
        "input": "[",
        "output": "false",
        "hidden": true
      },
      {
        "input": "()",
        "output": "true",
        "hidden": true
      },
      {
        "input": "([)]",
        "output": "false",
        "hidden": true
      },
      {
        "input": "{[]}",
        "output": "true",
        "hidden": true
      },
      {
        "input": "((()))",
        "output": "true",
        "hidden": true
      },
      {
        "input": "((())",
        "output": "false",
        "hidden": true
      },
      {
        "input": "{[()]}()",
        "output": "true",
        "hidden": true
      },
      {
        "input": "}{",
        "output": "false",
        "hidden": true
      },
      {
        "input": "[[[]]]",
        "output": "true",
        "hidden": true
      }
    ]
  },
  {
    "slug": "implement-queue-using-stacks",
    "title": "Implement Queue using Stacks",
    "difficulty": "easy",
    "description": "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all standard queue operations: push, pop, peek, and empty.",
    "examples": [
      {
        "input": "push 1, push 2, peek, pop, empty",
        "output": "1 1 false",
        "explanation": "Peek returns 1, pop returns 1, empty returns false."
      },
      {
        "input": "push 10, pop, empty",
        "output": "10 true",
        "explanation": "Pop returns 10, then queue is empty."
      },
      {
        "input": "push 5, push 6, push 7, pop, peek",
        "output": "5 6",
        "explanation": "Pop removes front element 5, new front is 6."
      }
    ],
    "constraints": [
      "1 <= x <= 9",
      "At most 100 calls will be made to push, pop, peek, and empty."
    ],
    "topics": [
      "Stack",
      "Queue",
      "Design"
    ],
    "companies": [
      "Microsoft",
      "Goldman Sachs"
    ],
    "hints": {
      "h1": "Use two stacks: inputStack and outputStack.",
      "h2": "Push elements to inputStack.",
      "h3": "When popping or peeking, if outputStack is empty, pop all elements from inputStack and push to outputStack."
    },
    "testcases": [
      {
        "input": "push 1, push 2, peek, pop, empty",
        "output": "1 1 false",
        "hidden": false
      },
      {
        "input": "push 10, pop, empty",
        "output": "10 true",
        "hidden": false
      },
      {
        "input": "push 5, push 6, push 7, pop, peek",
        "output": "5 6",
        "hidden": false
      },
      {
        "input": "empty",
        "output": "true",
        "hidden": true
      },
      {
        "input": "push 1, empty",
        "output": "false",
        "hidden": true
      },
      {
        "input": "push 1, push 2, push 3, pop, pop, pop",
        "output": "1 2 3",
        "hidden": true
      },
      {
        "input": "push 1, pop, push 2, peek",
        "output": "1 2",
        "hidden": true
      },
      {
        "input": "push 1, push 2, pop, push 3, pop, pop",
        "output": "1 2 3",
        "hidden": true
      },
      {
        "input": "push 8, peek, empty",
        "output": "8 false",
        "hidden": true
      },
      {
        "input": "push 4, push 5, pop, empty",
        "output": "4 false",
        "hidden": true
      },
      {
        "input": "push 9, push 8, push 7, peek",
        "output": "9",
        "hidden": true
      },
      {
        "input": "push 1, push 2, peek, peek",
        "output": "1 1",
        "hidden": true
      },
      {
        "input": "push 3, pop, empty",
        "output": "3 true",
        "hidden": true
      }
    ]
  },
  {
    "slug": "baseball-game",
    "title": "Baseball Game",
    "difficulty": "easy",
    "description": "You are keeping the scores for a baseball game with strange rules. Given a list of operations ops where each operation is an integer, '+', 'D', or 'C', return the sum of all the scores on the record after applying all operations.",
    "examples": [
      {
        "input": "ops = [\"5\",\"2\",\"C\",\"D\",\"+\"]",
        "output": "30",
        "explanation": "Sum of valid scores: 5 + 10 + 15 = 30."
      },
      {
        "input": "ops = [\"5\",\"-2\",\"4\",\"C\",\"D\",\"9\",\"+\",\"+\"]",
        "output": "27",
        "explanation": "Final scores sum to 27."
      },
      {
        "input": "ops = [\"1\"]",
        "output": "1",
        "explanation": "Single game score."
      }
    ],
    "constraints": [
      "1 <= ops.length <= 1000",
      "ops[i] is \"C\", \"D\", \"+\", or an integer."
    ],
    "topics": [
      "Stack",
      "Arrays"
    ],
    "companies": [
      "Amazon"
    ],
    "hints": {
      "h1": "Use a stack to maintain the record of scores.",
      "h2": "'C' pops the last score. 'D' pushes double the top score.",
      "h3": "'+' pushes the sum of the top two scores. Sum up the stack at the end."
    },
    "testcases": [
      {
        "input": "5 2 C D +",
        "output": "30",
        "hidden": false
      },
      {
        "input": "5 -2 4 C D 9 + +",
        "output": "27",
        "hidden": false
      },
      {
        "input": "1",
        "output": "1",
        "hidden": false
      },
      {
        "input": "1 C",
        "output": "0",
        "hidden": true
      },
      {
        "input": "1 D",
        "output": "3",
        "hidden": true
      },
      {
        "input": "1 2 +",
        "output": "6",
        "hidden": true
      },
      {
        "input": "10 20 D C +",
        "output": "70",
        "hidden": true
      },
      {
        "input": "3 4 5 + +",
        "output": "33",
        "hidden": true
      },
      {
        "input": "-5 5 +",
        "output": "0",
        "hidden": true
      },
      {
        "input": "10 D D D",
        "output": "150",
        "hidden": true
      },
      {
        "input": "1 2 C 3 D +",
        "output": "16",
        "hidden": true
      },
      {
        "input": "4 -1 D +",
        "output": "-1",
        "hidden": true
      },
      {
        "input": "2 2 2 + +",
        "output": "14",
        "hidden": true
      }
    ]
  },
  {
    "slug": "min-stack",
    "title": "Min Stack",
    "difficulty": "medium",
    "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. You must implement a solution with O(1) time complexity for each function.",
    "examples": [
      {
        "input": "push -2, push 0, push -3, getMin, pop, top, getMin",
        "output": "-3 0 -2",
        "explanation": "Retrieves min in O(1)."
      },
      {
        "input": "push 1, push 2, top, getMin",
        "output": "2 1",
        "explanation": "Top is 2, minimum is 1."
      },
      {
        "input": "push 0, push 1, push 0, getMin, pop, getMin",
        "output": "0 0",
        "explanation": "Handling duplicate minimums."
      }
    ],
    "constraints": [
      "-2^31 <= val <= 2^31 - 1",
      "Methods pop, top and getMin will always be called on non-empty stacks."
    ],
    "topics": [
      "Stack",
      "Design"
    ],
    "companies": [
      "Bloomberg",
      "Amazon",
      "Apple"
    ],
    "hints": {
      "h1": "Maintain two stacks or store pairs in a single stack.",
      "h2": "Each entry can store [val, minSoFar].",
      "h3": "getMin simply reads the min value of the current top pair."
    },
    "testcases": [
      {
        "input": "push -2, push 0, push -3, getMin, pop, top, getMin",
        "output": "-3 0 -2",
        "hidden": false
      },
      {
        "input": "push 1, push 2, top, getMin",
        "output": "2 1",
        "hidden": false
      },
      {
        "input": "push 0, push 1, push 0, getMin, pop, getMin",
        "output": "0 0",
        "hidden": false
      },
      {
        "input": "push 5, getMin, top",
        "output": "5 5",
        "hidden": true
      },
      {
        "input": "push 2, push 1, getMin, pop, getMin",
        "output": "1 2",
        "hidden": true
      },
      {
        "input": "push 3, push 3, push 3, getMin, pop, getMin",
        "output": "3 3",
        "hidden": true
      },
      {
        "input": "push -10, push 10, getMin, top",
        "output": "-10 10",
        "hidden": true
      },
      {
        "input": "push 7, push 2, push 9, getMin, pop, getMin",
        "output": "2 2",
        "hidden": true
      },
      {
        "input": "push 10, push 20, push 5, getMin, pop, top, getMin",
        "output": "5 20 10",
        "hidden": true
      },
      {
        "input": "push 1, push -1, getMin, pop, top",
        "output": "-1 1",
        "hidden": true
      },
      {
        "input": "push 4, top, getMin",
        "output": "4 4",
        "hidden": true
      },
      {
        "input": "push 8, push 6, push 4, push 2, getMin, pop, getMin",
        "output": "2 4",
        "hidden": true
      },
      {
        "input": "push -1, push -2, push -3, top, getMin",
        "output": "-3 -3",
        "hidden": true
      }
    ]
  },
  {
    "slug": "evaluate-reverse-polish-notation",
    "title": "Evaluate Reverse Polish Notation",
    "difficulty": "medium",
    "description": "You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation. Evaluate the expression and return an integer that represents the value of the expression.",
    "examples": [
      {
        "input": "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]",
        "output": "9",
        "explanation": "((2 + 1) * 3) = 9."
      },
      {
        "input": "tokens = [\"4\",\"13\",\"5\",\"/\",\"+\"]",
        "output": "6",
        "explanation": "(4 + (13 / 5)) = 6."
      },
      {
        "input": "tokens = [\"10\",\"6\",\"9\",\"3\",\"+\",\"-11\",\"*\",\"/\",\"*\",\"17\",\"+\",\"5\",\"+\"]",
        "output": "22",
        "explanation": "Complex nested expression evaluates to 22."
      }
    ],
    "constraints": [
      "1 <= tokens.length <= 10^4",
      "tokens[i] is an operator '+', '-', '*', or '/', or an integer in range [-200, 200]."
    ],
    "topics": [
      "Stack",
      "Arrays",
      "Math"
    ],
    "companies": [
      "Amazon",
      "LinkedIn"
    ],
    "hints": {
      "h1": "Iterate through tokens: push numbers onto stack.",
      "h2": "When an operator is encountered, pop operand 2, then operand 1.",
      "h3": "Apply the operator (note integer truncation toward zero for division) and push the result."
    },
    "testcases": [
      {
        "input": "2 1 + 3 *",
        "output": "9",
        "hidden": false
      },
      {
        "input": "4 13 5 / +",
        "output": "6",
        "hidden": false
      },
      {
        "input": "10 6 9 3 + -11 * / * 17 + 5 +",
        "output": "22",
        "hidden": false
      },
      {
        "input": "3",
        "output": "3",
        "hidden": true
      },
      {
        "input": "1 2 +",
        "output": "3",
        "hidden": true
      },
      {
        "input": "5 2 -",
        "output": "3",
        "hidden": true
      },
      {
        "input": "3 4 *",
        "output": "12",
        "hidden": true
      },
      {
        "input": "6 2 /",
        "output": "3",
        "hidden": true
      },
      {
        "input": "7 2 /",
        "output": "3",
        "hidden": true
      },
      {
        "input": "4 3 -",
        "output": "1",
        "hidden": true
      },
      {
        "input": "2 3 + 4 *",
        "output": "20",
        "hidden": true
      },
      {
        "input": "15 7 1 1 + - / 3 * 2 1 1 + + -",
        "output": "5",
        "hidden": true
      },
      {
        "input": "0 3 /",
        "output": "0",
        "hidden": true
      }
    ]
  },
  {
    "slug": "daily-temperatures",
    "title": "Daily Temperatures",
    "difficulty": "medium",
    "description": "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0.",
    "examples": [
      {
        "input": "temperatures = [73,74,75,71,69,72,76,73]",
        "output": "[1,1,4,2,1,1,0,0]",
        "explanation": "Waiting days until warmer temperatures."
      },
      {
        "input": "temperatures = [30,40,50,60]",
        "output": "[1,1,1,0]",
        "explanation": "Strictly increasing temperatures."
      },
      {
        "input": "temperatures = [30,60,90]",
        "output": "[1,1,0]",
        "explanation": "Each next day is warmer."
      }
    ],
    "constraints": [
      "1 <= temperatures.length <= 10^5",
      "30 <= temperatures[i] <= 100"
    ],
    "topics": [
      "Stack",
      "Monotonic Stack",
      "Arrays"
    ],
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "hints": {
      "h1": "Use a monotonic decreasing stack storing indices.",
      "h2": "While current temperature is greater than temperature at stack.top(), pop and calculate difference: i - poppedIndex.",
      "h3": "Push the current index onto the stack."
    },
    "testcases": [
      {
        "input": "73 74 75 71 69 72 76 73",
        "output": "1 1 4 2 1 1 0 0",
        "hidden": false
      },
      {
        "input": "30 40 50 60",
        "output": "1 1 1 0",
        "hidden": false
      },
      {
        "input": "30 60 90",
        "output": "1 1 0",
        "hidden": false
      },
      {
        "input": "90",
        "output": "0",
        "hidden": true
      },
      {
        "input": "90 80 70",
        "output": "0 0 0",
        "hidden": true
      },
      {
        "input": "50 50 50",
        "output": "0 0 0",
        "hidden": true
      },
      {
        "input": "50 51",
        "output": "1 0",
        "hidden": true
      },
      {
        "input": "55 38 53 81 61 93 97 32 43 78",
        "output": "3 1 1 2 1 1 0 1 1 0",
        "hidden": true
      },
      {
        "input": "40 35 45",
        "output": "2 1 0",
        "hidden": true
      },
      {
        "input": "89 62 70 58 47 47 46 76 100 70",
        "output": "8 1 5 4 3 2 1 1 0 0",
        "hidden": true
      },
      {
        "input": "30 30 30 31",
        "output": "3 2 1 0",
        "hidden": true
      },
      {
        "input": "70 60 50 80",
        "output": "3 2 1 0",
        "hidden": true
      },
      {
        "input": "31 32 33 34 35",
        "output": "1 1 1 1 0",
        "hidden": true
      }
    ]
  },
  {
    "slug": "largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "difficulty": "hard",
    "description": "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    "examples": [
      {
        "input": "heights = [2,1,5,6,2,3]",
        "output": "10",
        "explanation": "The largest rectangle is of height 5, width 2 (bars 5 and 6), area = 10."
      },
      {
        "input": "heights = [2,4]",
        "output": "4",
        "explanation": "Width 1 * height 4 = 4."
      },
      {
        "input": "heights = [1,1,1,1,1]",
        "output": "5",
        "explanation": "All bars height 1, area = 5."
      }
    ],
    "constraints": [
      "1 <= heights.length <= 10^5",
      "0 <= heights[i] <= 10^4"
    ],
    "topics": [
      "Stack",
      "Monotonic Stack",
      "Arrays"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Uber"
    ],
    "hints": {
      "h1": "For each bar, find the nearest smaller bar to the left and to the right.",
      "h2": "A monotonic increasing stack finds these boundaries in O(N) overall time.",
      "h3": "Width = (rightIndex - leftIndex - 1). Area = height * width."
    },
    "testcases": [
      {
        "input": "2 1 5 6 2 3",
        "output": "10",
        "hidden": false
      },
      {
        "input": "2 4",
        "output": "4",
        "hidden": false
      },
      {
        "input": "1 1 1 1 1",
        "output": "5",
        "hidden": false
      },
      {
        "input": "6 2 5 4 5 1 6",
        "output": "12",
        "hidden": true
      },
      {
        "input": "1",
        "output": "1",
        "hidden": true
      },
      {
        "input": "0",
        "output": "0",
        "hidden": true
      },
      {
        "input": "3 6 5 7 4 8 1 0",
        "output": "20",
        "hidden": true
      },
      {
        "input": "5 4 3 2 1",
        "output": "9",
        "hidden": true
      },
      {
        "input": "1 2 3 4 5",
        "output": "9",
        "hidden": true
      },
      {
        "input": "2 1 2",
        "output": "3",
        "hidden": true
      },
      {
        "input": "4 2 0 3 2 5",
        "output": "6",
        "hidden": true
      },
      {
        "input": "1 2 2 1",
        "output": "4",
        "hidden": true
      },
      {
        "input": "9 0",
        "output": "9",
        "hidden": true
      }
    ]
  },
  {
    "slug": "maximal-rectangle",
    "title": "Maximal Rectangle",
    "difficulty": "hard",
    "description": "Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.",
    "examples": [
      {
        "input": "matrix = [[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]",
        "output": "6",
        "explanation": "The maximal rectangle has area 6."
      },
      {
        "input": "matrix = [[\"0\"]]",
        "output": "0",
        "explanation": "Only zero, max area is 0."
      },
      {
        "input": "matrix = [[\"1\"]]",
        "output": "1",
        "explanation": "Single cell with 1 has area 1."
      }
    ],
    "constraints": [
      "rows == matrix.length",
      "cols == matrix[i].length",
      "1 <= row, cols <= 200",
      "matrix[i][j] is '0' or '1'."
    ],
    "topics": [
      "Stack",
      "Monotonic Stack",
      "Dynamic Programming",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Google",
      "ByteDance"
    ],
    "hints": {
      "h1": "Convert each row of the matrix into a histogram of consecutive 1s.",
      "h2": "For row r, if matrix[r][c] == '1', height[c] += 1, else height[c] = 0.",
      "h3": "Apply the 'Largest Rectangle in Histogram' algorithm on each row's height array."
    },
    "testcases": [
      {
        "input": "1 0 1 0 0 | 1 0 1 1 1 | 1 1 1 1 1 | 1 0 0 1 0",
        "output": "6",
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
        "hidden": false
      },
      {
        "input": "1 1 | 1 1",
        "output": "4",
        "hidden": true
      },
      {
        "input": "0 0 | 0 0",
        "output": "0",
        "hidden": true
      },
      {
        "input": "1 0 | 0 1",
        "output": "1",
        "hidden": true
      },
      {
        "input": "1 1 1 | 1 1 1",
        "output": "6",
        "hidden": true
      },
      {
        "input": "0 1 | 1 0",
        "output": "1",
        "hidden": true
      },
      {
        "input": "1 1 1 1 | 1 1 1 1 | 1 1 1 1",
        "output": "12",
        "hidden": true
      },
      {
        "input": "0 0 1 | 0 1 1 | 1 1 1",
        "output": "4",
        "hidden": true
      },
      {
        "input": "1 0 1 1 1",
        "output": "3",
        "hidden": true
      },
      {
        "input": "1 | 1 | 1",
        "output": "3",
        "hidden": true
      },
      {
        "input": "0 1 1 0 | 1 1 1 1 | 1 1 1 1 | 1 1 0 0",
        "output": "8",
        "hidden": true
      }
    ]
  },
  {
    "slug": "basic-calculator",
    "title": "Basic Calculator",
    "difficulty": "hard",
    "description": "Given a string s representing a valid expression, implement a basic calculator to evaluate it, and return the result of the evaluation.\n\nNote: You are not allowed to use any built-in function which evaluates strings as mathematical expressions, such as eval(). Supports '+', '-', '(', ')', and spaces.",
    "examples": [
      {
        "input": "s = \"1 + 1\"",
        "output": "2",
        "explanation": "Evaluates to 2."
      },
      {
        "input": "s = \" 2-1 + 2 \"",
        "output": "3",
        "explanation": "Spaces ignored, evaluates to 3."
      },
      {
        "input": "s = \"(1+(4+5+2)-3)+(6+8)\"",
        "output": "23",
        "explanation": "Evaluates parenthesis precedence."
      }
    ],
    "constraints": [
      "1 <= s.length <= 3 * 10^5",
      "s consists of digits, '+', '-', '(', ')', and ' '."
    ],
    "topics": [
      "Stack",
      "Math",
      "Strings"
    ],
    "companies": [
      "Google",
      "Facebook",
      "Microsoft"
    ],
    "hints": {
      "h1": "Maintain a running result and current sign (+1 or -1).",
      "h2": "When '(' is seen, push result and sign to stack, then reset result = 0, sign = 1.",
      "h3": "When ')' is seen, multiply current result by sign popped from stack, then add previous result."
    },
    "testcases": [
      {
        "input": "1 + 1",
        "output": "2",
        "hidden": false
      },
      {
        "input": " 2-1 + 2 ",
        "output": "3",
        "hidden": false
      },
      {
        "input": "(1+(4+5+2)-3)+(6+8)",
        "output": "23",
        "hidden": false
      },
      {
        "input": "0",
        "output": "0",
        "hidden": true
      },
      {
        "input": "1-(     -2)",
        "output": "3",
        "hidden": true
      },
      {
        "input": "-(2 + 3)",
        "output": "-5",
        "hidden": true
      },
      {
        "input": "10 + 20 - 5",
        "output": "25",
        "hidden": true
      },
      {
        "input": "2-(5-6)",
        "output": "3",
        "hidden": true
      },
      {
        "input": "(5-(1+2))",
        "output": "2",
        "hidden": true
      },
      {
        "input": "100 - (20 + (30 - 10))",
        "output": "60",
        "hidden": true
      },
      {
        "input": "-(3 - (-2))",
        "output": "-5",
        "hidden": true
      },
      {
        "input": "((1 + 2) + (3 + 4))",
        "output": "10",
        "hidden": true
      },
      {
        "input": "2147483647",
        "output": "2147483647",
        "hidden": true
      }
    ]
  },
  {
    "slug": "online-stock-span",
    "title": "Online Stock Span",
    "difficulty": "hard",
    "description": "Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day.\n\nThe span of the stock's price today is the maximum number of consecutive days (starting from today and going backward) for which the stock price was less than or equal to today's price.",
    "examples": [
      {
        "input": "prices = [100, 80, 60, 70, 60, 75, 85]",
        "output": "[1, 1, 1, 2, 1, 4, 6]",
        "explanation": "Daily spans calculated."
      },
      {
        "input": "prices = [10, 20, 30, 40, 50]",
        "output": "[1, 2, 3, 4, 5]",
        "explanation": "Strictly increasing prices."
      },
      {
        "input": "prices = [50, 40, 30, 20, 10]",
        "output": "[1, 1, 1, 1, 1]",
        "explanation": "Strictly decreasing prices."
      }
    ],
    "constraints": [
      "1 <= price <= 10^5",
      "At most 10^4 calls will be made to next."
    ],
    "topics": [
      "Stack",
      "Monotonic Stack",
      "Design"
    ],
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "hints": {
      "h1": "Use a monotonic stack storing pairs: [price, span].",
      "h2": "When calling next(price), while stack is non-empty and stack.top().price <= price, pop and add its span to current span.",
      "h3": "Push [price, totalSpan] and return totalSpan."
    },
    "testcases": [
      {
        "input": "100 80 60 70 60 75 85",
        "output": "1 1 1 2 1 4 6",
        "hidden": false
      },
      {
        "input": "10 20 30 40 50",
        "output": "1 2 3 4 5",
        "hidden": false
      },
      {
        "input": "50 40 30 20 10",
        "output": "1 1 1 1 1",
        "hidden": false
      },
      {
        "input": "10",
        "output": "1",
        "hidden": true
      },
      {
        "input": "31 41 48 59 79",
        "output": "1 2 3 4 5",
        "hidden": true
      },
      {
        "input": "28 14 28 35 46 53 66 80 87 88",
        "output": "1 1 3 4 5 6 7 8 9 10",
        "hidden": true
      },
      {
        "input": "100 100 100",
        "output": "1 2 3",
        "hidden": true
      },
      {
        "input": "10 5 10",
        "output": "1 1 3",
        "hidden": true
      },
      {
        "input": "29 91 10 76 51",
        "output": "1 2 1 2 1",
        "hidden": true
      },
      {
        "input": "30 20 40 10 50",
        "output": "1 1 3 1 5",
        "hidden": true
      },
      {
        "input": "5 4 3 2 1 6",
        "output": "1 1 1 1 1 6",
        "hidden": true
      },
      {
        "input": "90 85 80 85 90",
        "output": "1 1 1 3 5",
        "hidden": true
      },
      {
        "input": "1 2 1 2 1 2",
        "output": "1 2 1 4 1 6",
        "hidden": true
      }
    ]
  }
];
