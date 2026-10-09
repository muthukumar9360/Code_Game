import { topic0 } from "./topic0_fundamentals.js";
import { topic1 } from "./topic1_arrays.js";
import { topic2 } from "./topic2_two_pointers.js";
import { topic3 } from "./topic3_sliding_window.js";
import { topic4 } from "./topic4_stack_queue.js";
import { topic5 } from "./topic5_binary_search.js";
import { topic6 } from "./topic6_linked_lists.js";
import { topic7 } from "./topic7_trees.js";
import { topic8 } from "./topic8_graphs.js";
import { topic9 } from "./topic9_dp.js";
import { topic10 } from "./topic10_greedy.js";

export const topicsMeta = [
  { id: 0, name: "Programming Fundamentals & Simple Codes", problems: topic0 },
  { id: 1, name: "Arrays & Hashing", problems: topic1 },
  { id: 2, name: "Two Pointers", problems: topic2 },
  { id: 3, name: "Sliding Window", problems: topic3 },
  { id: 4, name: "Stack & Queue", problems: topic4 },
  { id: 5, name: "Binary Search", problems: topic5 },
  { id: 6, name: "Linked Lists", problems: topic6 },
  { id: 7, name: "Trees & BST", problems: topic7 },
  { id: 8, name: "Graphs & BFS/DFS", problems: topic8 },
  { id: 9, name: "Dynamic Programming", problems: topic9 },
  { id: 10, name: "Greedy Algorithms", problems: topic10 }
];

export const allProblems = [
  ...topic0,
  ...topic1,
  ...topic2,
  ...topic3,
  ...topic4,
  ...topic5,
  ...topic6,
  ...topic7,
  ...topic8,
  ...topic9,
  ...topic10
];
