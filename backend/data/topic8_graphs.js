// TOPIC 8: GRAPHS & BFS / DFS (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)
export const topic8 = [
  {
    "slug": "find-if-path-exists-in-graph",
    "title": "Find if Path Exists in Graph",
    "difficulty": "easy",
    "description": "There is a bi-directional graph with n vertices, where each vertex is labeled from 0 to n - 1 (inclusive). The edges in the graph are represented as a 2D integer array edges, where each edges[i] = [u, v] denotes a bi-directional edge between vertex u and vertex v. Determine if there is a valid path that exists from vertex source to vertex destination.",
    "examples": [
      {
        "input": "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2",
        "output": "true",
        "explanation": "Two paths exist: 0->1->2 and 0->2."
      },
      {
        "input": "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5",
        "output": "false",
        "explanation": "No path exists between 0 and 5."
      },
      {
        "input": "n = 1, edges = [], source = 0, destination = 0",
        "output": "true",
        "explanation": "Source equals destination."
      }
    ],
    "constraints": [
      "1 <= n <= 2 * 10^5",
      "0 <= edges.length <= 2 * 10^5",
      "0 <= source, destination < n"
    ],
    "topics": [
      "Graph",
      "Depth-First Search",
      "Breadth-First Search",
      "Union Find"
    ],
    "companies": [
      "Amazon",
      "Microsoft",
      "Facebook"
    ],
    "hints": {
      "h1": "Build an adjacency list from the edge list.",
      "h2": "Use BFS or DFS starting from source, marking visited nodes in a Set or boolean array.",
      "h3": "Alternatively, use a Disjoint Set Union (DSU) structure to check if find(source) == find(destination)."
    },
    "testcases": [
      {
        "input": "3\n0 1\n1 2\n2 0\n0 2",
        "output": "true",
        "hidden": false
      },
      {
        "input": "6\n0 1\n0 2\n3 5\n5 4\n4 3\n0 5",
        "output": "false",
        "hidden": false
      },
      {
        "input": "1\n0 0",
        "output": "true",
        "hidden": false
      },
      {
        "input": "2\n0 1\n0 1",
        "output": "true",
        "hidden": true
      },
      {
        "input": "2\n0 1",
        "output": "false",
        "hidden": true
      },
      {
        "input": "4\n0 1\n1 2\n2 3\n0 3",
        "output": "true",
        "hidden": true
      },
      {
        "input": "4\n0 1\n2 3\n0 2",
        "output": "false",
        "hidden": true
      },
      {
        "input": "5\n0 1\n1 2\n3 4\n0 4",
        "output": "false",
        "hidden": true
      },
      {
        "input": "5\n0 1\n1 2\n2 3\n3 4\n0 4",
        "output": "true",
        "hidden": true
      },
      {
        "input": "3\n0 1\n0 2",
        "output": "false",
        "hidden": true
      },
      {
        "input": "3\n0 1\n1 2\n0 2",
        "output": "true",
        "hidden": true
      },
      {
        "input": "6\n0 1\n0 2\n1 3\n2 4\n3 5\n0 5",
        "output": "true",
        "hidden": true
      },
      {
        "input": "6\n0 1\n2 3\n4 5\n0 5",
        "output": "false",
        "hidden": true
      }
    ]
  },
  {
    "slug": "flood-fill",
    "title": "Flood Fill",
    "difficulty": "easy",
    "description": "An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image. You are given three integers sr, sc, and color. You should perform a flood fill on the image starting from the pixel image[sr][sc]. To perform a flood fill, consider the starting pixel, plus any pixels connected 4-directionally to the starting pixel of the same color, plus any pixels connected 4-directionally to those pixels, and so on. Replace the color of all of the aforementioned pixels with color.",
    "examples": [
      {
        "input": "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2",
        "output": "[[2,2,2],[2,2,0],[2,0,1]]",
        "explanation": "Origin pixel (1,1) is colored with 2, along with all 4-directionally connected pixels of color 1."
      },
      {
        "input": "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0",
        "output": "[[0,0,0],[0,0,0]]",
        "explanation": "Target color is identical to starting pixel color."
      },
      {
        "input": "image = [[0,0,0],[0,1,1]], sr = 1, sc = 1, color = 1",
        "output": "[[0,0,0],[0,1,1]]",
        "explanation": "Target color already matches."
      }
    ],
    "constraints": [
      "m == image.length",
      "n == image[i].length",
      "1 <= m, n <= 50",
      "0 <= image[i][j], color < 2^16"
    ],
    "topics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Apple"
    ],
    "hints": {
      "h1": "Check if the starting pixel already has the target color; if so, return immediately to avoid infinite recursion.",
      "h2": "Store the initial color of image[sr][sc].",
      "h3": "Recursively or iteratively visit 4 adjacent neighbors (up, down, left, right) if they match the initial color."
    },
    "testcases": [
      {
        "input": "[[1,1,1],[1,1,0],[1,0,1]]\n1 1 2",
        "output": "[[2,2,2],[2,2,0],[2,0,1]]",
        "hidden": false
      },
      {
        "input": "[[0,0,0],[0,0,0]]\n0 0 0",
        "output": "[[0,0,0],[0,0,0]]",
        "hidden": false
      },
      {
        "input": "[[0,0,0],[0,1,1]]\n1 1 1",
        "output": "[[0,0,0],[0,1,1]]",
        "hidden": false
      },
      {
        "input": "[[1]]\n0 0 2",
        "output": "[[2]]",
        "hidden": true
      },
      {
        "input": "[[1,1],[1,1]]\n0 0 3",
        "output": "[[3,3],[3,3]]",
        "hidden": true
      },
      {
        "input": "[[1,2],[3,4]]\n0 0 5",
        "output": "[[5,2],[3,4]]",
        "hidden": true
      },
      {
        "input": "[[0,0,0],[0,1,0]]\n1 1 2",
        "output": "[[0,0,0],[0,2,0]]",
        "hidden": true
      },
      {
        "input": "[[1,0,1],[1,1,1]]\n1 0 2",
        "output": "[[2,0,2],[2,2,2]]",
        "hidden": true
      },
      {
        "input": "[[2,2],[2,2]]\n0 1 2",
        "output": "[[2,2],[2,2]]",
        "hidden": true
      },
      {
        "input": "[[3,3,3],[3,3,3]]\n1 2 4",
        "output": "[[4,4,4],[4,4,4]]",
        "hidden": true
      },
      {
        "input": "[[0,1],[1,0]]\n0 0 2",
        "output": "[[2,1],[1,0]]",
        "hidden": true
      },
      {
        "input": "[[1,1,1,1]]\n0 2 9",
        "output": "[[9,9,9,9]]",
        "hidden": true
      },
      {
        "input": "[[1],[1],[1]]\n1 0 5",
        "output": "[[5],[5],[5]]",
        "hidden": true
      }
    ]
  },
  {
    "slug": "island-perimeter",
    "title": "Island Perimeter",
    "difficulty": "easy",
    "description": "You are given row x col grid representing a map where grid[i][j] = 1 represents land and grid[i][j] = 0 represents water. Grid cells are connected horizontally/vertically (not diagonally). The grid is completely surrounded by water, and there is exactly one island. Determine the perimeter of the island.",
    "examples": [
      {
        "input": "grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]",
        "output": "16",
        "explanation": "The perimeter is the 16 stripes in the perimeter boundary."
      },
      {
        "input": "grid = [[1]]",
        "output": "4",
        "explanation": "A single land cell has perimeter 4."
      },
      {
        "input": "grid = [[1,0]]",
        "output": "4",
        "explanation": "Single land cell next to water cell."
      }
    ],
    "constraints": [
      "row == grid.length",
      "col == grid[i].length",
      "1 <= row, col <= 100",
      "grid[i][j] is 0 or 1"
    ],
    "topics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Matrix"
    ],
    "companies": [
      "Bloomberg",
      "Facebook",
      "Amazon"
    ],
    "hints": {
      "h1": "Each land cell starts with 4 sides.",
      "h2": "For each adjacent neighbor that is also land, 1 shared side is lost from both cells (total 2 sides lost).",
      "h3": "Iterate through cells: when grid[r][c] == 1, add 4 and subtract 2 for each adjacent neighbor (down/right) that is also land."
    },
    "testcases": [
      {
        "input": "[[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]",
        "output": "16",
        "hidden": false
      },
      {
        "input": "[[1]]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[[1,0]]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[[1,1]]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[[1],[1]]",
        "output": "6",
        "hidden": true
      },
      {
        "input": "[[1,1],[1,1]]",
        "output": "8",
        "hidden": true
      },
      {
        "input": "[[1,1,1]]",
        "output": "8",
        "hidden": true
      },
      {
        "input": "[[0,0],[0,1]]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[[1,1,1],[1,0,1],[1,1,1]]",
        "output": "16",
        "hidden": true
      },
      {
        "input": "[[0,1,0],[1,1,1],[0,1,0]]",
        "output": "12",
        "hidden": true
      },
      {
        "input": "[[1,1,0],[1,1,0],[0,0,0]]",
        "output": "8",
        "hidden": true
      },
      {
        "input": "[[1,0,0],[1,1,0],[0,1,0]]",
        "output": "10",
        "hidden": true
      },
      {
        "input": "[[1,1,1,1],[0,0,0,1]]",
        "output": "12",
        "hidden": true
      }
    ]
  },
  {
    "slug": "number-of-islands",
    "title": "Number of Islands",
    "difficulty": "medium",
    "description": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    "examples": [
      {
        "input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]",
        "output": "1",
        "explanation": "All 1s form a single connected component."
      },
      {
        "input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]",
        "output": "3",
        "explanation": "There are 3 separate islands."
      },
      {
        "input": "grid = [[\"0\"]]",
        "output": "0",
        "explanation": "No islands exist."
      }
    ],
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'"
    ],
    "topics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Union Find",
      "Matrix"
    ],
    "companies": [
      "Amazon",
      "Bloomberg",
      "Google",
      "Microsoft"
    ],
    "hints": {
      "h1": "Iterate through each cell in the grid.",
      "h2": "When a '1' is encountered, increment island count and initiate BFS or DFS.",
      "h3": "Sink the visited island by changing visited '1's to '0's in-place to avoid extra space."
    },
    "testcases": [
      {
        "input": "[[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]",
        "output": "1",
        "hidden": false
      },
      {
        "input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]",
        "output": "3",
        "hidden": false
      },
      {
        "input": "[[\"0\"]]",
        "output": "0",
        "hidden": false
      },
      {
        "input": "[[\"1\"]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"0\"],[\"0\",\"1\"]]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"1\"],[\"1\",\"1\"]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[\"0\",\"0\"],[\"0\",\"0\"]]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"0\",\"1\"],[\"0\",\"1\",\"0\"],[\"1\",\"0\",\"1\"]]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"1\",\"1\"],[\"0\",\"1\",\"0\"],[\"1\",\"1\",\"1\"]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"0\",\"0\",\"1\"],[\"1\",\"0\",\"0\",\"1\"]]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"],[\"0\",\"0\",\"1\"]]",
        "output": "2",
        "hidden": true
      },
      {
        "input": "[[\"1\",\"0\",\"1\",\"0\",\"1\"]]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[[\"1\"],[\"0\"],[\"1\"],[\"0\"],[\"1\"]]",
        "output": "3",
        "hidden": true
      }
    ]
  },
  {
    "slug": "max-area-of-island",
    "title": "Max Area of Island",
    "difficulty": "medium",
    "description": "You are given an m x n binary matrix grid. An island is a group of 1's (representing land) connected 4-directionally (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water. The area of an island is the number of cells with a value 1 in the island. Return the maximum area of an island in grid. If there is no island, return 0.",
    "examples": [
      {
        "input": "grid = [[0,0,1,0,0],[1,1,1,0,0],[0,1,0,0,1]]",
        "output": "5",
        "explanation": "The max island area is 5."
      },
      {
        "input": "grid = [[0,0,0,0,0]]",
        "output": "0",
        "explanation": "No islands exist."
      },
      {
        "input": "grid = [[1,1],[1,1]]",
        "output": "4",
        "explanation": "Entire 2x2 grid is a single island of area 4."
      }
    ],
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 50",
      "grid[i][j] is either 0 or 1"
    ],
    "topics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Union Find",
      "Matrix"
    ],
    "companies": [
      "Facebook",
      "Amazon",
      "DoorDash"
    ],
    "hints": {
      "h1": "Traverse every cell in the grid.",
      "h2": "For every '1', run a DFS function that sums 1 + dfs for each 4-directional neighbor.",
      "h3": "Mark cells as 0 when visiting to avoid recounting, and track the maximum area seen."
    },
    "testcases": [
      {
        "input": "[[0,0,1,0,0],[1,1,1,0,0],[0,1,0,0,1]]",
        "output": "5",
        "hidden": false
      },
      {
        "input": "[[0,0,0,0,0]]",
        "output": "0",
        "hidden": false
      },
      {
        "input": "[[1,1],[1,1]]",
        "output": "4",
        "hidden": false
      },
      {
        "input": "[[1]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[0]]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "[[1,0,1],[0,1,0]]",
        "output": "1",
        "hidden": true
      },
      {
        "input": "[[1,1,1],[0,0,0],[1,1,1]]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "[[1,1,0],[1,1,0],[0,0,1]]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[[0,1,1],[1,1,0],[0,0,1]]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[[1,1,1,1,1]]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "[[1],[1],[1],[1]]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "[[0,0,1],[0,0,1],[1,1,1]]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "[[1,0,1,1],[1,0,1,1]]",
        "output": "4",
        "hidden": true
      }
    ]
  },
  {
    "slug": "course-schedule",
    "title": "Course Schedule",
    "difficulty": "medium",
    "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
    "examples": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "output": "true",
        "explanation": "Take course 0 then course 1."
      },
      {
        "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        "output": "false",
        "explanation": "Cycle detected: courses depend on each other."
      },
      {
        "input": "numCourses = 3, prerequisites = [[0,1],[1,2],[2,0]]",
        "output": "false",
        "explanation": "3-course cycle prevents completion."
      }
    ],
    "constraints": [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= ai, bi < numCourses",
      "All pairs [ai, bi] are unique."
    ],
    "topics": [
      "Depth-First Search",
      "Breadth-First Search",
      "Graph",
      "Topological Sort"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Facebook",
      "Microsoft"
    ],
    "hints": {
      "h1": "Model this as a directed graph cycle detection problem.",
      "h2": "Kahn's Algorithm (BFS): calculate in-degrees of all courses and push those with in-degree 0 into a queue.",
      "h3": "Alternatively, use 3-state DFS (0 = unvisited, 1 = visiting, 2 = visited). A cycle exists if you encounter a visiting node."
    },
    "testcases": [
      {
        "input": "2\n[[1,0]]",
        "output": "true",
        "hidden": false
      },
      {
        "input": "2\n[[1,0],[0,1]]",
        "output": "false",
        "hidden": false
      },
      {
        "input": "3\n[[0,1],[1,2],[2,0]]",
        "output": "false",
        "hidden": false
      },
      {
        "input": "1\n[]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "3\n[[1,0],[2,1]]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "4\n[[1,0],[2,0],[3,1],[3,2]]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "4\n[[1,0],[2,1],[3,2],[1,3]]",
        "output": "false",
        "hidden": true
      },
      {
        "input": "3\n[[1,0],[2,0]]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "5\n[[1,0],[2,1],[3,2],[4,3]]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "2\n[]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "3\n[[0,1],[0,2],[1,2]]",
        "output": "true",
        "hidden": true
      },
      {
        "input": "3\n[[0,1],[1,2],[2,1]]",
        "output": "false",
        "hidden": true
      },
      {
        "input": "4\n[[0,1],[2,3]]",
        "output": "true",
        "hidden": true
      }
    ]
  },
  {
    "slug": "word-ladder",
    "title": "Word Ladder",
    "difficulty": "hard",
    "description": "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair differs by exactly one letter, and all intermediate words are in wordList. Given beginWord, endWord, and wordList, return the number of words in the shortest transformation sequence, or 0 if no such sequence exists.",
    "examples": [
      {
        "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        "output": "5",
        "explanation": "\"hit\" -> \"hot\" -> \"dot\" -> \"dog\" -> \"cog\" has 5 words."
      },
      {
        "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
        "output": "0",
        "explanation": "endWord is not in wordList."
      },
      {
        "input": "beginWord = \"a\", endWord = \"c\", wordList = [\"a\",\"b\",\"c\"]",
        "output": "2",
        "explanation": "\"a\" -> \"c\" is 2 words."
      }
    ],
    "constraints": [
      "1 <= beginWord.length <= 10",
      "beginWord.length == endWord.length == wordList[i].length",
      "1 <= wordList.length <= 5000",
      "All strings consist of lowercase English letters."
    ],
    "topics": [
      "Breadth-First Search",
      "Hash Table",
      "String"
    ],
    "companies": [
      "Amazon",
      "Facebook",
      "Google",
      "Snapchat"
    ],
    "hints": {
      "h1": "Shortest transformation path in an unweighted graph naturally implies Breadth-First Search (BFS).",
      "h2": "Put wordList into a HashSet for O(1) lookups.",
      "h3": "At each BFS level, for the current word, try replacing each of its characters with 'a'-'z' and check if the transformed word is in the set."
    },
    "testcases": [
      {
        "input": "\"hit\"\n\"cog\"\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
        "output": "5",
        "hidden": false
      },
      {
        "input": "\"hit\"\n\"cog\"\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
        "output": "0",
        "hidden": false
      },
      {
        "input": "\"a\"\n\"c\"\n[\"a\",\"b\",\"c\"]",
        "output": "2",
        "hidden": false
      },
      {
        "input": "\"a\"\n\"c\"\n[\"a\",\"b\"]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"hot\"\n\"dog\"\n[\"hot\",\"dog\"]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"hot\"\n\"dog\"\n[\"hot\",\"dot\",\"dog\"]",
        "output": "3",
        "hidden": true
      },
      {
        "input": "\"cat\"\n\"sag\"\n[\"bat\",\"bag\",\"sag\",\"dag\"]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "\"kiss\"\n\"tusk\"\n[\"miss\",\"dusk\",\"kiss\",\"musk\",\"tusk\",\"diss\",\"disk\",\"task\"]",
        "output": "5",
        "hidden": true
      },
      {
        "input": "\"game\"\n\"thee\"\n[\"frye\",\"heat\",\"tree\",\"thee\",\"game\",\"free\",\"hell\",\"fame\",\"haze\"]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"red\"\n\"tax\"\n[\"ted\",\"tex\",\"red\",\"tax\",\"tad\",\"den\",\"rex\",\"pee\"]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "\"lead\"\n\"gold\"\n[\"load\",\"goad\",\"gold\"]",
        "output": "4",
        "hidden": true
      },
      {
        "input": "\"sand\"\n\"acne\"\n[\"sand\",\"pane\",\"pane\",\"cone\",\"acne\"]",
        "output": "0",
        "hidden": true
      },
      {
        "input": "\"lost\"\n\"cost\"\n[\"most\",\"fist\",\"lost\",\"cost\"]",
        "output": "2",
        "hidden": true
      }
    ]
  },
  {
    "slug": "pacific-atlantic-water-flow",
    "title": "Pacific Atlantic Water Flow",
    "difficulty": "hard",
    "description": "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific touches the island's left and top edges, and the Atlantic touches the right and bottom edges. Water can only flow from a cell to another cell of equal or lower height. Return a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from cell (ri, ci) to both oceans.",
    "examples": [
      {
        "input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        "explanation": "Water from these cells can reach both oceans."
      },
      {
        "input": "heights = [[1]]",
        "output": "[[0,0]]",
        "explanation": "Single cell touches both oceans."
      },
      {
        "input": "heights = [[2,1],[1,2]]",
        "output": "[[0,0],[0,1],[1,0],[1,1]]",
        "explanation": "All cells reach both oceans."
      }
    ],
    "constraints": [
      "m == heights.length",
      "n == heights[r].length",
      "1 <= m, n <= 200",
      "0 <= heights[r][c] <= 10^5"
    ],
    "topics": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Matrix"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Facebook"
    ],
    "hints": {
      "h1": "Instead of searching downwards from each cell to ocean, reverse the flow: search upwards from the oceans onto the island.",
      "h2": "Run DFS/BFS from Pacific border cells into island where height >= previous cell.",
      "h3": "Run DFS/BFS from Atlantic border cells similarly; the answer is the intersection of cells visited by both ocean traversals."
    },
    "testcases": [
      {
        "input": "[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        "hidden": false
      },
      {
        "input": "[[1]]",
        "output": "[[0,0]]",
        "hidden": false
      },
      {
        "input": "[[2,1],[1,2]]",
        "output": "[[0,0],[0,1],[1,0],[1,1]]",
        "hidden": false
      },
      {
        "input": "[[1,2],[2,1]]",
        "output": "[[0,0],[0,1],[1,0],[1,1]]",
        "hidden": true
      },
      {
        "input": "[[1,1],[1,1]]",
        "output": "[[0,0],[0,1],[1,0],[1,1]]",
        "hidden": true
      },
      {
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[[0,2],[1,2],[2,0],[2,1],[2,2]]",
        "hidden": true
      },
      {
        "input": "[[3,3,3],[3,1,3],[3,3,3]]",
        "output": "[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]",
        "hidden": true
      },
      {
        "input": "[[10,10,10],[10,1,10],[10,10,10]]",
        "output": "[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]",
        "hidden": true
      },
      {
        "input": "[[1,2,1],[1,2,1]]",
        "output": "[[0,1],[1,1]]",
        "hidden": true
      },
      {
        "input": "[[1,1,1,1]]",
        "output": "[[0,0],[0,1],[0,2],[0,3]]",
        "hidden": true
      },
      {
        "input": "[[1],[1],[1],[1]]",
        "output": "[[0,0],[1,0],[2,0],[3,0]]",
        "hidden": true
      },
      {
        "input": "[[2,3,4],[5,6,7]]",
        "output": "[[0,2],[1,0],[1,1],[1,2]]",
        "hidden": true
      },
      {
        "input": "[[9,8,7],[6,5,4]]",
        "output": "[[0,0],[0,1],[0,2],[1,0]]",
        "hidden": true
      }
    ]
  },
  {
    "slug": "alien-dictionary",
    "title": "Alien Dictionary",
    "difficulty": "hard",
    "description": "There is a new alien language that uses the English alphabet. However, the order among letters is unknown to you. You are given a list of strings words from the alien language's dictionary, where the strings are claimed to be sorted lexicographically by the rules of this new language. Derive the order of letters in this language. If the order is invalid, return \"\". If there are multiple valid orders, return any of them.",
    "examples": [
      {
        "input": "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "output": "\"wertf\"",
        "explanation": "Comparing adjacent words derives the character ordering."
      },
      {
        "input": "words = [\"z\",\"x\"]",
        "output": "\"zx\"",
        "explanation": "z comes before x."
      },
      {
        "input": "words = [\"z\",\"x\",\"z\"]",
        "output": "\"\"",
        "explanation": "Invalid order due to cycle."
      }
    ],
    "constraints": [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100",
      "words[i] consists of only lowercase English letters."
    ],
    "topics": [
      "Array",
      "String",
      "Depth-First Search",
      "Breadth-First Search",
      "Graph",
      "Topological Sort"
    ],
    "companies": [
      "Facebook",
      "Amazon",
      "Airbnb",
      "Google"
    ],
    "hints": {
      "h1": "Compare each adjacent pair of words (words[i] and words[i+1]) character by character.",
      "h2": "The first mismatch c1 in words[i] and c2 in words[i+1] creates a directed edge: c1 -> c2.",
      "h3": "Check prefix rule: if words[i] starts with words[i+1] and words[i].length > words[i+1].length, order is invalid. Then run topological sort."
    },
    "testcases": [
      {
        "input": "[\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]",
        "output": "\"wertf\"",
        "hidden": false
      },
      {
        "input": "[\"z\",\"x\"]",
        "output": "\"zx\"",
        "hidden": false
      },
      {
        "input": "[\"z\",\"x\",\"z\"]",
        "output": "\"\"",
        "hidden": false
      },
      {
        "input": "[\"abc\",\"ab\"]",
        "output": "\"\"",
        "hidden": true
      },
      {
        "input": "[\"a\",\"b\",\"c\"]",
        "output": "\"abc\"",
        "hidden": true
      },
      {
        "input": "[\"c\",\"b\",\"a\"]",
        "output": "\"cba\"",
        "hidden": true
      },
      {
        "input": "[\"za\",\"zb\",\"ca\",\"cb\"]",
        "output": "\"zacb\"",
        "hidden": true
      },
      {
        "input": "[\"x\"]",
        "output": "\"x\"",
        "hidden": true
      },
      {
        "input": "[\"xy\",\"zx\"]",
        "output": "\"xyz\"",
        "hidden": true
      },
      {
        "input": "[\"ab\",\"bc\",\"cd\"]",
        "output": "\"abcd\"",
        "hidden": true
      },
      {
        "input": "[\"ba\",\"ab\"]",
        "output": "\"ba\"",
        "hidden": true
      },
      {
        "input": "[\"qb\",\"qba\"]",
        "output": "\"qb\"",
        "hidden": true
      },
      {
        "input": "[\"apple\",\"app\"]",
        "output": "\"\"",
        "hidden": true
      }
    ]
  },
  {
    "slug": "critical-connections-in-a-network",
    "title": "Critical Connections in a Network",
    "difficulty": "hard",
    "description": "There are n servers numbered from 0 to n - 1 connected by undirected server-to-server connections forming a network where connections[i] = [ai, bi] represents a connection between servers ai and bi. Any server can reach other servers directly or indirectly through the network. A critical connection is a connection that, if removed, will make some servers unable to reach some other servers. Return all critical connections in the network in any order.",
    "examples": [
      {
        "input": "n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]",
        "output": "[[1,3]]",
        "explanation": "[[1,3]] is the only critical connection because removing it disconnects 3."
      },
      {
        "input": "n = 2, connections = [[0,1]]",
        "output": "[[0,1]]",
        "explanation": "Removing [0,1] disconnects the network."
      },
      {
        "input": "n = 5, connections = [[0,1],[1,2],[2,0],[1,3],[3,4],[4,1]]",
        "output": "[]",
        "explanation": "Two cycles, no critical bridges."
      }
    ],
    "constraints": [
      "2 <= n <= 10^5",
      "n - 1 <= connections.length <= 10^5",
      "0 <= ai, bi <= n - 1",
      "ai != bi",
      "There are no repeated connections."
    ],
    "topics": [
      "Depth-First Search",
      "Graph",
      "Biconnected Component"
    ],
    "companies": [
      "Amazon",
      "Google",
      "Facebook"
    ],
    "hints": {
      "h1": "A critical connection is a bridge in an undirected graph.",
      "h2": "Use Tarjan's bridge-finding algorithm with discovery time (tin) and lowest reachable time (low).",
      "h3": "An edge (u, v) is a bridge if low[v] > tin[u], meaning v cannot reach u or any ancestor of u without using edge (u, v)."
    },
    "testcases": [
      {
        "input": "4\n[[0,1],[1,2],[2,0],[1,3]]",
        "output": "[[1,3]]",
        "hidden": false
      },
      {
        "input": "2\n[[0,1]]",
        "output": "[[0,1]]",
        "hidden": false
      },
      {
        "input": "5\n[[0,1],[1,2],[2,0],[1,3],[3,4],[4,1]]",
        "output": "[]",
        "hidden": false
      },
      {
        "input": "3\n[[0,1],[1,2]]",
        "output": "[[0,1],[1,2]]",
        "hidden": true
      },
      {
        "input": "3\n[[0,1],[1,2],[2,0]]",
        "output": "[]",
        "hidden": true
      },
      {
        "input": "5\n[[0,1],[1,2],[2,3],[3,4]]",
        "output": "[[0,1],[1,2],[2,3],[3,4]]",
        "hidden": true
      },
      {
        "input": "4\n[[0,1],[1,2],[2,3],[3,0]]",
        "output": "[]",
        "hidden": true
      },
      {
        "input": "6\n[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]]",
        "output": "[[1,3]]",
        "hidden": true
      },
      {
        "input": "4\n[[0,1],[0,2],[0,3]]",
        "output": "[[0,1],[0,2],[0,3]]",
        "hidden": true
      },
      {
        "input": "5\n[[0,1],[1,2],[2,3],[3,0],[0,4]]",
        "output": "[[0,4]]",
        "hidden": true
      },
      {
        "input": "5\n[[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]]",
        "output": "[]",
        "hidden": true
      },
      {
        "input": "6\n[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]",
        "output": "[]",
        "hidden": true
      },
      {
        "input": "4\n[[0,1],[1,2],[2,0],[2,3]]",
        "output": "[[2,3]]",
        "hidden": true
      }
    ]
  }
];
