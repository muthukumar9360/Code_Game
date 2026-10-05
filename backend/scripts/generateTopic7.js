import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const topic7Enriched = [
  {
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "easy",
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "Every left and right child swapped." },
      { input: "root = [2,1,3]", output: "[2,3,1]", explanation: "Subtrees swapped." },
      { input: "root = []", output: "[]", explanation: "Empty tree inverts to empty." }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
    topics: ["Trees", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["Google", "Amazon", "Twitter"],
    hints: {
      h1: "Base case: if root is null, return null.",
      h2: "Swap root.left and root.right.",
      h3: "Recursively invert root.left and root.right."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "4 2 7 1 3 6 9", output: "4 7 2 9 6 3 1", hidden: false },
      { input: "2 1 3", output: "2 3 1", hidden: false },
      { input: "", output: "", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "1", hidden: true },
      { input: "1 2", output: "1 null 2", hidden: true },
      { input: "1 null 2", output: "1 2", hidden: true },
      { input: "1 2 3 4 5", output: "1 3 2 null null 5 4", hidden: true },
      { input: "3 1 null null 2", output: "3 null 1 2", hidden: true },
      { input: "10 5 15", output: "10 15 5", hidden: true },
      { input: "1 2 3 null null 4 5", output: "1 3 2 5 4", hidden: true },
      { input: "5 3 8 1 4 7 9", output: "5 8 3 9 7 4 1", hidden: true },
      { input: "2 3", output: "2 null 3", hidden: true },
      { input: "0 1 2", output: "0 2 1", hidden: true }
    ]
  },
  {
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    description: "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3", explanation: "Depth is 3." },
      { input: "root = [1,null,2]", output: "2", explanation: "Depth is 2." },
      { input: "root = []", output: "0", explanation: "Empty tree has depth 0." }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
    topics: ["Trees", "Depth-First Search", "Breadth-First Search"],
    companies: ["LinkedIn", "Amazon", "Microsoft"],
    hints: {
      h1: "Recursive depth: 1 + max(depth(left), depth(right)).",
      h2: "Base case: null node has depth 0.",
      h3: "Can also be solved using level-order traversal with a queue."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 9 20 null null 15 7", output: "3", hidden: false },
      { input: "1 null 2", output: "2", hidden: false },
      { input: "", output: "0", hidden: false },
      // 10 Private Test Cases
      { input: "1", output: "1", hidden: true },
      { input: "1 2 3 4 5", output: "3", hidden: true },
      { input: "1 2 null 3 null 4", output: "4", hidden: true },
      { input: "1 2 3", output: "2", hidden: true },
      { input: "1 null 2 null 3 null 4 null 5", output: "5", hidden: true },
      { input: "10 5 15 3 7 13 18", output: "3", hidden: true },
      { input: "0", output: "1", hidden: true },
      { input: "1 2 3 null null null 4", output: "3", hidden: true },
      { input: "1 2 3 4 5 6 7 8", output: "4", hidden: true },
      { input: "2 1 3", output: "2", hidden: true }
    ]
  },
  {
    slug: "same-tree",
    title: "Same Tree",
    difficulty: "easy",
    description: "Given the roots of two binary trees p and q, write a function to check if they are the same or not.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
    examples: [
      { input: "p = [1,2,3], q = [1,2,3]", output: "true", explanation: "Identical structures and values." },
      { input: "p = [1,2], q = [1,null,2]", output: "false", explanation: "Different tree shapes." },
      { input: "p = [1,2,1], q = [1,1,2]", output: "false", explanation: "Different values at matching positions." }
    ],
    constraints: ["The number of nodes in both trees is in the range [0, 100].", "-10^4 <= Node.val <= 10^4"],
    topics: ["Trees", "Depth-First Search", "Breadth-First Search"],
    companies: ["Amazon", "Google"],
    hints: {
      h1: "If both nodes are null, return true.",
      h2: "If only one node is null, or their values differ, return false.",
      h3: "Check both p.left == q.left and p.right == q.right recursively."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 | 1 2 3", output: "true", hidden: false },
      { input: "1 2 | 1 null 2", output: "false", hidden: false },
      { input: "1 2 1 | 1 1 2", output: "false", hidden: false },
      // 10 Private Test Cases
      { input: " | ", output: "true", hidden: true },
      { input: "1 | ", output: "false", hidden: true },
      { input: "1 | 1", output: "true", hidden: true },
      { input: "1 | 2", output: "false", hidden: true },
      { input: "1 2 null | 1 2 null", output: "true", hidden: true },
      { input: "1 null 2 | 1 null 2", output: "true", hidden: true },
      { input: "1 2 3 4 5 | 1 2 3 4 5", output: "true", hidden: true },
      { input: "1 2 3 4 5 | 1 2 3 4 null", output: "false", hidden: true },
      { input: "5 3 7 | 5 3 7", output: "true", hidden: true },
      { input: "10 5 15 | 10 5 20", output: "false", hidden: true }
    ]
  },
  {
    slug: "lowest-common-ancestor-of-a-bst",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "medium",
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.\n\nAccording to the definition of LCA: 'The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).'",
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6", explanation: "The LCA of nodes 2 and 8 is 6." },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2", explanation: "Node 2 is ancestor of itself and 4." },
      { input: "root = [2,1], p = 2, q = 1", output: "2", explanation: "Root 2 is LCA of 2 and 1." }
    ],
    constraints: ["The number of nodes in the tree is in the range [2, 10^5].", "All Node.val are unique.", "p != q", "p and q will exist in the BST."],
    topics: ["Trees", "Binary Search Tree", "Depth-First Search"],
    companies: ["Amazon", "Microsoft", "Facebook"],
    hints: {
      h1: "Leverage BST ordering: left < root < right.",
      h2: "If both p and q are smaller than root.val, search left child.",
      h3: "If both p and q are larger than root.val, search right child. Otherwise, root is the split point (LCA)."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "6 2 8 0 4 7 9 null null 3 5\n2 8", output: "6", hidden: false },
      { input: "6 2 8 0 4 7 9 null null 3 5\n2 4", output: "2", hidden: false },
      { input: "2 1\n2 1", output: "2", hidden: false },
      // 10 Private Test Cases
      { input: "6 2 8 0 4 7 9 null null 3 5\n3 5", output: "4", hidden: true },
      { input: "6 2 8 0 4 7 9 null null 3 5\n0 5", output: "2", hidden: true },
      { input: "6 2 8 0 4 7 9 null null 3 5\n7 9", output: "8", hidden: true },
      { input: "5 3 6 2 4 null null 1\n1 4", output: "3", hidden: true },
      { input: "5 3 6 2 4 null null 1\n1 6", output: "5", hidden: true },
      { input: "3 1 4 null 2\n2 4", output: "3", hidden: true },
      { input: "3 1 4 null 2\n1 2", output: "1", hidden: true },
      { input: "10 5 15 2 7 12 20\n2 7", output: "5", hidden: true },
      { input: "10 5 15 2 7 12 20\n12 20", output: "15", hidden: true },
      { input: "10 5 15 2 7 12 20\n2 15", output: "10", hidden: true }
    ]
  },
  {
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "Nodes traversed level by level." },
      { input: "root = [1]", output: "[[1]]", explanation: "Single node level." },
      { input: "root = []", output: "[]", explanation: "Empty tree." }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    topics: ["Trees", "Breadth-First Search", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    hints: {
      h1: "Use a Queue for standard BFS.",
      h2: "On each level, record queue.length, then loop exactly that many times to process all nodes of current level.",
      h3: "Add children to the queue for the next level."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 9 20 null null 15 7", output: "3 | 9 20 | 15 7", hidden: false },
      { input: "1", output: "1", hidden: false },
      { input: "", output: "", hidden: false },
      // 10 Private Test Cases
      { input: "1 2 3 4 5", output: "1 | 2 3 | 4 5", hidden: true },
      { input: "1 2 null 3", output: "1 | 2 | 3", hidden: true },
      { input: "1 null 2 null 3", output: "1 | 2 | 3", hidden: true },
      { input: "1 2 3", output: "1 | 2 3", hidden: true },
      { input: "1 2 3 4 5 6 7", output: "1 | 2 3 | 4 5 6 7", hidden: true },
      { input: "10 5 15", output: "10 | 5 15", hidden: true },
      { input: "0", output: "0", hidden: true },
      { input: "4 2 7 1 3 6 9", output: "4 | 2 7 | 1 3 6 9", hidden: true },
      { input: "1 2 3 null 4 null 5", output: "1 | 2 3 | 4 5", hidden: true },
      { input: "8 4 12 2 6 10 14", output: "8 | 4 12 | 2 6 10 14", hidden: true }
    ]
  },
  {
    slug: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    difficulty: "medium",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node's key.\n- The right subtree of a node contains only nodes with keys strictly greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    examples: [
      { input: "root = [2,1,3]", output: "true", explanation: "Valid BST." },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "Root 5 has right child 4 which is smaller than 5." },
      { input: "root = [2147483647]", output: "true", explanation: "Single extreme value node is valid." }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
    topics: ["Trees", "Binary Search Tree", "Depth-First Search"],
    companies: ["Amazon", "Facebook", "Bloomberg"],
    hints: {
      h1: "It is not sufficient to only check immediate parent and child.",
      h2: "Pass valid ranges (low, high) recursively: validate(node.left, low, node.val) and validate(node.right, node.val, high).",
      h3: "Alternatively, check if inorder traversal is strictly strictly increasing."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "2 1 3", output: "true", hidden: false },
      { input: "5 1 4 null null 3 6", output: "false", hidden: false },
      { input: "2147483647", output: "true", hidden: false },
      // 10 Private Test Cases
      { input: "1 1", output: "false", hidden: true },
      { input: "1", output: "true", hidden: true },
      { input: "10 5 15 null null 6 20", output: "false", hidden: true },
      { input: "3 2 5 1 4", output: "false", hidden: true },
      { input: "4 2 6 1 3 5 7", output: "true", hidden: true },
      { input: "5 4 6 null null 3 7", output: "false", hidden: true },
      { input: "3 1 5 0 2 4 6", output: "true", hidden: true },
      { input: "0 -1", output: "true", hidden: true },
      { input: "32 26 47 19 null null 56 null 27", output: "false", hidden: true },
      { input: "2 2 2", output: "false", hidden: true }
    ]
  },
  {
    slug: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "hard",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.",
    examples: [
      { input: "root = [1,2,3]", output: "6", explanation: "Optimal path is 2 -> 1 -> 3 with sum 2 + 1 + 3 = 6." },
      { input: "root = [-10,9,20,null,null,15,7]", output: "42", explanation: "Optimal path is 15 -> 20 -> 7 with sum 15 + 20 + 7 = 42." },
      { input: "root = [-3]", output: "-3", explanation: "Single negative node path sum is -3." }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 3 * 10^4].", "-1000 <= Node.val <= 1000"],
    topics: ["Trees", "Dynamic Programming", "Depth-First Search"],
    companies: ["Facebook", "Amazon", "Google", "Microsoft"],
    hints: {
      h1: "For each node, compute max gain from left subtree and right subtree (clamp negatives to 0).",
      h2: "The maximum path passing through this node as apex is: node.val + leftGain + rightGain. Update globalMax.",
      h3: "Return node.val + max(leftGain, rightGain) up to the parent."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3", output: "6", hidden: false },
      { input: "-10 9 20 null null 15 7", output: "42", hidden: false },
      { input: "-3", output: "-3", hidden: false },
      // 10 Private Test Cases
      { input: "2 -1", output: "2", hidden: true },
      { input: "-2 1", output: "1", hidden: true },
      { input: "-2 -1", output: "-1", hidden: true },
      { input: "1 -2 3", output: "4", hidden: true },
      { input: "5 4 8 11 null 13 4 7 2 null null null 1", output: "48", hidden: true },
      { input: "1 2 null 3 null 4 null 5", output: "15", hidden: true },
      { input: "9 6 -3 null null -6 2 null null 2 null -6 -6 -6", output: "16", hidden: true },
      { input: "0", output: "0", hidden: true },
      { input: "1 2 3 -1 -2 -3 -4", output: "6", hidden: true },
      { input: "-10 -20 -30", output: "-10", hidden: true }
    ]
  },
  {
    slug: "serialize-and-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "hard",
    description: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.",
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", explanation: "Encodes and decodes identically." },
      { input: "root = []", output: "[]", explanation: "Empty tree serializes to empty." },
      { input: "root = [1]", output: "[1]", explanation: "Single node tree." }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    topics: ["Trees", "Design", "String", "Breadth-First Search"],
    companies: ["Uber", "Google", "Amazon", "Microsoft"],
    hints: {
      h1: "Preorder traversal with delimiters and marker for null nodes (e.g. '#') works cleanly.",
      h2: "To deserialize, split the string into a queue of tokens.",
      h3: "Recursively build root, root.left, root.right from the queue."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 2 3 null null 4 5", output: "1 2 3 null null 4 5", hidden: false },
      { input: "", output: "", hidden: false },
      { input: "1", output: "1", hidden: false },
      // 10 Private Test Cases
      { input: "1 2", output: "1 2", hidden: true },
      { input: "1 null 2", output: "1 null 2", hidden: true },
      { input: "1 2 3", output: "1 2 3", hidden: true },
      { input: "4 2 7 1 3 6 9", output: "4 2 7 1 3 6 9", hidden: true },
      { input: "1 2 3 4 5", output: "1 2 3 4 5", hidden: true },
      { input: "0 0 0", output: "0 0 0", hidden: true },
      { input: "-1 -2 -3", output: "-1 -2 -3", hidden: true },
      { input: "10 5 15 null null 12 20", output: "10 5 15 null null 12 20", hidden: true },
      { input: "5 4 3 2 1", output: "5 4 3 2 1", hidden: true },
      { input: "100", output: "100", hidden: true }
    ]
  },
  {
    slug: "kth-smallest-element-in-a-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "hard",
    description: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    examples: [
      { input: "root = [3,1,4,null,2], k = 1", output: "1", explanation: "Smallest element is 1." },
      { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3", explanation: "3rd smallest element is 3." },
      { input: "root = [2,1,3], k = 2", output: "2", explanation: "2nd smallest element is 2." }
    ],
    constraints: ["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
    topics: ["Trees", "Binary Search Tree", "Depth-First Search"],
    companies: ["Amazon", "Uber", "Facebook"],
    hints: {
      h1: "An inorder traversal of a BST visits nodes in strictly ascending order.",
      h2: "Traverse iteratively using a stack or recursively.",
      h3: "Decrement k on each visited node; when k reaches 0, return current node's value."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "3 1 4 null 2\n1", output: "1", hidden: false },
      { input: "5 3 6 2 4 null null 1\n3", output: "3", hidden: false },
      { input: "2 1 3\n2", output: "2", hidden: false },
      // 10 Private Test Cases
      { input: "1\n1", output: "1", hidden: true },
      { input: "2 1\n1", output: "1", hidden: true },
      { input: "2 1\n2", output: "2", hidden: true },
      { input: "4 2 5 1 3\n1", output: "1", hidden: true },
      { input: "4 2 5 1 3\n4", output: "4", hidden: true },
      { input: "4 2 5 1 3\n5", output: "5", hidden: true },
      { input: "10 5 15 3 7 12 18\n6", output: "15", hidden: true },
      { input: "10 5 15 3 7 12 18\n2", output: "5", hidden: true },
      { input: "10 5 15 3 7 12 18\n7", output: "18", hidden: true },
      { input: "6 3 8 2 4 7 9\n4", output: "6", hidden: true }
    ]
  },
  {
    slug: "recover-binary-search-tree",
    title: "Recover Binary Search Tree",
    difficulty: "hard",
    description: "You are given the root of a binary search tree (BST), where the values of exactly two nodes of the tree were swapped by mistake. Recover the tree without changing its structure.",
    examples: [
      { input: "root = [1,3,null,null,2]", output: "[3,1,null,null,2]", explanation: "1 and 3 swapped." },
      { input: "root = [3,1,4,null,null,2]", output: "[2,1,4,null,null,3]", explanation: "2 and 3 swapped." },
      { input: "root = [2,3,1]", output: "[2,1,3]", explanation: "3 and 1 swapped." }
    ],
    constraints: ["The number of nodes in the tree is in the range [2, 1000].", "-2^31 <= Node.val <= 2^31 - 1"],
    topics: ["Trees", "Binary Search Tree", "Depth-First Search"],
    companies: ["Microsoft", "Google"],
    hints: {
      h1: "Inorder traversal of valid BST is sorted.",
      h2: "Identify the two points where prev.val > curr.val.",
      h3: "Swap the values of the two identified anomalous nodes."
    },
    testcases: [
      // 3 Public Test Cases
      { input: "1 3 null null 2", output: "3 1 null null 2", hidden: false },
      { input: "3 1 4 null null 2", output: "2 1 4 null null 3", hidden: false },
      { input: "2 3 1", output: "2 1 3", hidden: false },
      // 10 Private Test Cases
      { input: "3 2 1", output: "1 2 3", hidden: true },
      { input: "1 2", output: "2 1", hidden: true },
      { input: "2 null 1", output: "1 null 2", hidden: true },
      { input: "4 2 6 1 5 3 7", output: "4 2 6 1 3 5 7", hidden: true },
      { input: "2 4 3 1", output: "3 4 2 1", hidden: true },
      { input: "5 3 9 1 7 4 10", output: "5 3 9 1 4 7 10", hidden: true },
      { input: "10 5 15 2 20 12 7", output: "10 5 15 2 7 12 20", hidden: true },
      { input: "6 3 8 2 7 4 9", output: "6 3 8 2 4 7 9", hidden: true },
      { input: "3 1 null null 2", output: "2 1 null null 3", hidden: true },
      { input: "2 1 4 null null 3 5", output: "2 1 4 null null 3 5", hidden: true }
    ]
  }
];

const content = `// TOPIC 7: TREES & BINARY SEARCH TREES (10 Problems - Fully Enriched with 3 Public & 10 Private Test Cases)\nexport const topic7 = ${JSON.stringify(topic7Enriched, null, 2)};\n`;
fs.writeFileSync(path.resolve(__dirname, '../data/topic7_trees.js'), content, 'utf8');
console.log('Successfully wrote enriched topic7_trees.js!');
