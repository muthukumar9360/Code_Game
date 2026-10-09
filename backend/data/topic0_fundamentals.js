// TOPIC 0: PROGRAMMING FUNDAMENTALS & SIMPLE ONE-LINERS
// Beginner-friendly problems: Odd or Even, Sum, Number Sign, Reverse String, etc.

export const topic0 = [
  {
    slug: "odd-or-even",
    title: "Odd or Even",
    difficulty: "easy",
    description: "Given an integer `n`, determine whether it is even or odd.\n\nPrint `Even` if the integer is divisible by 2, otherwise print `Odd`.",
    examples: [
      {
        input: "4",
        output: "Even",
        explanation: "4 is divisible by 2, so the output is Even."
      },
      {
        input: "7",
        output: "Odd",
        explanation: "7 is not divisible by 2, so the output is Odd."
      },
      {
        input: "0",
        output: "Even",
        explanation: "0 is even."
      }
    ],
    constraints: [
      "-10^9 <= n <= 10^9"
    ],
    topics: [
      "Fundamentals",
      "Math",
      "Conditionals"
    ],
    companies: [
      "TCS",
      "Infosys",
      "Wipro",
      "Cognizant"
    ],
    hints: {
      h1: "Use the modulo operator % to check divisibility by 2.",
      h2: "If n % 2 == 0, the number is Even; otherwise, it is Odd.",
      h3: "In Python: print('Even' if int(input().strip()) % 2 == 0 else 'Odd')"
    },
    testcases: [
      { input: "4", output: "Even", hidden: false },
      { input: "7", output: "Odd", hidden: false },
      { input: "0", output: "Even", hidden: false },
      { input: "-2", output: "Even", hidden: true },
      { input: "-5", output: "Odd", hidden: true },
      { input: "1000000", output: "Even", hidden: true },
      { input: "999999", output: "Odd", hidden: true },
      { input: "1", output: "Odd", hidden: true },
      { input: "2", output: "Even", hidden: true },
      { input: "-1000000000", output: "Even", hidden: true }
    ]
  },
  {
    slug: "sum-of-two-numbers",
    title: "Sum of Two Numbers",
    difficulty: "easy",
    description: "Given two space-separated integers `a` and `b`, calculate and print their sum.\n\nOutput a single integer representing `a + b`.",
    examples: [
      {
        input: "3 5",
        output: "8",
        explanation: "3 + 5 = 8."
      },
      {
        input: "-1 4",
        output: "3",
        explanation: "-1 + 4 = 3."
      },
      {
        input: "10 -20",
        output: "-10",
        explanation: "10 + (-20) = -10."
      }
    ],
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    topics: [
      "Fundamentals",
      "Basic Math"
    ],
    companies: [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    hints: {
      h1: "Read both numbers from the standard input line.",
      h2: "Add them together using the + operator.",
      h3: "In Python: a, b = map(int, input().split()); print(a + b)"
    },
    testcases: [
      { input: "3 5", output: "8", hidden: false },
      { input: "-1 4", output: "3", hidden: false },
      { input: "10 -20", output: "-10", hidden: false },
      { input: "0 0", output: "0", hidden: true },
      { input: "100 200", output: "300", hidden: true },
      { input: "-50 -50", output: "-100", hidden: true },
      { input: "12345 54321", output: "66666", hidden: true },
      { input: "-999 999", output: "0", hidden: true },
      { input: "1000000 2000000", output: "3000000", hidden: true },
      { input: "42 0", output: "42", hidden: true }
    ]
  },
  {
    slug: "check-number-sign",
    title: "Positive, Negative, or Zero",
    difficulty: "easy",
    description: "Given an integer `n`, determine its sign.\n\nPrint `Positive` if `n > 0`, `Negative` if `n < 0`, or `Zero` if `n == 0`.",
    examples: [
      {
        input: "15",
        output: "Positive",
        explanation: "15 is greater than zero."
      },
      {
        input: "-8",
        output: "Negative",
        explanation: "-8 is less than zero."
      },
      {
        input: "0",
        output: "Zero",
        explanation: "The number is zero."
      }
    ],
    constraints: [
      "-10^9 <= n <= 10^9"
    ],
    topics: [
      "Fundamentals",
      "Conditionals"
    ],
    companies: [
      "Accenture",
      "Capgemini",
      "TCS"
    ],
    hints: {
      h1: "Use if-elif-else statements to test against 0.",
      h2: "Check if n > 0 first, then n < 0, else Zero.",
      h3: "Remember to output exactly 'Positive', 'Negative', or 'Zero'."
    },
    testcases: [
      { input: "15", output: "Positive", hidden: false },
      { input: "-8", output: "Negative", hidden: false },
      { input: "0", output: "Zero", hidden: false },
      { input: "1", output: "Positive", hidden: true },
      { input: "-1", output: "Negative", hidden: true },
      { input: "999999", output: "Positive", hidden: true },
      { input: "-999999", output: "Negative", hidden: true },
      { input: "42", output: "Positive", hidden: true },
      { input: "-100", output: "Negative", hidden: true },
      { input: "0", output: "Zero", hidden: true }
    ]
  },
  {
    slug: "reverse-string-simple",
    title: "Reverse a String",
    difficulty: "easy",
    description: "Given a string `s`, reverse the string and print the reversed result.",
    examples: [
      {
        input: "hello",
        output: "olleh",
        explanation: "Reversing 'hello' gives 'olleh'."
      },
      {
        input: "world",
        output: "dlrow",
        explanation: "Reversing 'world' gives 'dlrow'."
      },
      {
        input: "racecar",
        output: "racecar",
        explanation: "'racecar' is a palindrome, so the reversed string is the same."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s contains printable characters"
    ],
    topics: [
      "Fundamentals",
      "Strings"
    ],
    companies: [
      "Amazon",
      "Microsoft",
      "Adobe"
    ],
    hints: {
      h1: "In Python, you can slice a string backwards using s[::-1].",
      h2: "In JavaScript, you can do s.split('').reverse().join('').",
      h3: "In C++, use reverse(s.begin(), s.end())."
    },
    testcases: [
      { input: "hello", output: "olleh", hidden: false },
      { input: "world", output: "dlrow", hidden: false },
      { input: "racecar", output: "racecar", hidden: false },
      { input: "code", output: "edoc", hidden: true },
      { input: "battlix", output: "xilttab", hidden: true },
      { input: "a", output: "a", hidden: true },
      { input: "12345", output: "54321", hidden: true },
      { input: "OpenAI", output: "IAnepO", hidden: true },
      { input: "Frontend", output: "dnetnorF", hidden: true },
      { input: "algorithm", output: "mhtirogla", hidden: true }
    ]
  },
  {
    slug: "square-of-number",
    title: "Square of a Number",
    difficulty: "easy",
    description: "Given an integer `n`, compute and print its square (`n * n`).",
    examples: [
      {
        input: "5",
        output: "25",
        explanation: "5 * 5 = 25."
      },
      {
        input: "-4",
        output: "16",
        explanation: "(-4) * (-4) = 16."
      },
      {
        input: "0",
        output: "0",
        explanation: "0 * 0 = 0."
      }
    ],
    constraints: [
      "-10^4 <= n <= 10^4"
    ],
    topics: [
      "Fundamentals",
      "Math"
    ],
    companies: [
      "Wipro",
      "Cognizant"
    ],
    hints: {
      h1: "Multiply n by itself: n * n.",
      h2: "In Python: n = int(input().strip()); print(n * n)"
    },
    testcases: [
      { input: "5", output: "25", hidden: false },
      { input: "-4", output: "16", hidden: false },
      { input: "0", output: "0", hidden: false },
      { input: "1", output: "1", hidden: true },
      { input: "12", output: "144", hidden: true },
      { input: "-15", output: "225", hidden: true },
      { input: "100", output: "10000", hidden: true },
      { input: "-100", output: "10000", hidden: true },
      { input: "25", output: "625", hidden: true },
      { input: "50", output: "2500", hidden: true }
    ]
  },
  {
    slug: "max-of-two",
    title: "Maximum of Two Numbers",
    difficulty: "easy",
    description: "Given two space-separated integers `a` and `b`, print the greater of the two numbers. If they are equal, print either.",
    examples: [
      {
        input: "10 20",
        output: "20",
        explanation: "20 is greater than 10."
      },
      {
        input: "-5 -1",
        output: "-1",
        explanation: "-1 is greater than -5."
      },
      {
        input: "7 7",
        output: "7",
        explanation: "Both numbers are equal."
      }
    ],
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    topics: [
      "Fundamentals",
      "Conditionals"
    ],
    companies: [
      "Zoho",
      "TCS"
    ],
    hints: {
      h1: "Use the max() function or a ternary condition: a if a > b else b.",
      h2: "In Python: a, b = map(int, input().split()); print(max(a, b))"
    },
    testcases: [
      { input: "10 20", output: "20", hidden: false },
      { input: "-5 -1", output: "-1", hidden: false },
      { input: "7 7", output: "7", hidden: false },
      { input: "100 0", output: "100", hidden: true },
      { input: "0 -100", output: "0", hidden: true },
      { input: "42 99", output: "99", hidden: true },
      { input: "-1000 -2000", output: "-1000", hidden: true },
      { input: "50000 50000", output: "50000", hidden: true },
      { input: "9 8", output: "9", hidden: true },
      { input: "-10 10", output: "10", hidden: true }
    ]
  }
];
