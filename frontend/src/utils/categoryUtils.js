export const CANONICAL_TOPIC_MAP = {
  // Arrays
  'array': 'Arrays',
  'arrays': 'Arrays',
  'prefix sum': 'Arrays',
  // Strings
  'string': 'Strings',
  'strings': 'Strings',
  // Searching (Consolidates all search topics into one)
  'binary search': 'Searching',
  'binary search tree': 'Searching',
  'breadth-first search': 'Searching',
  'depth-first search': 'Searching',
  'search': 'Searching',
  'searching': 'Searching',
  'bfs': 'Searching',
  'dfs': 'Searching',
  // Two Pointers
  'two pointers': 'Two Pointers',
  // Sliding Window
  'sliding window': 'Sliding Window',
  // Hash Table
  'hash table': 'Hash Table',
  // Trees
  'tree': 'Trees',
  'trees': 'Trees',
  'binary tree': 'Trees',
  // Graphs
  'graph': 'Graphs',
  'graphs': 'Graphs',
  'union find': 'Graphs',
  'topological sort': 'Graphs',
  'biconnected component': 'Graphs',
  // Dynamic Programming
  'dynamic programming': 'Dynamic Programming',
  'memoization': 'Dynamic Programming',
  'dp': 'Dynamic Programming',
  // Stack & Queue
  'stack': 'Stack & Queue',
  'monotonic stack': 'Stack & Queue',
  'queue': 'Stack & Queue',
  'monotonic queue': 'Stack & Queue',
  'heap (priority queue)': 'Stack & Queue',
  'heap': 'Stack & Queue',
  // Linked List
  'linked list': 'Linked List',
  'doubly-linked list': 'Linked List',
  // Greedy
  'greedy': 'Greedy',
  // Sorting
  'sorting': 'Sorting',
  'merge sort': 'Sorting',
  'bucket sort': 'Sorting',
  'radix sort': 'Sorting',
  // Math & Matrix
  'math': 'Math & Matrix',
  'matrix': 'Math & Matrix',
  'recursion': 'Math & Matrix',
  'divide and conquer': 'Math & Matrix'
};

export const getCanonicalCategory = (rawTopic) => {
  if (!rawTopic || typeof rawTopic !== 'string') return null;
  const clean = rawTopic.trim().toLowerCase();
  if (CANONICAL_TOPIC_MAP[clean]) return CANONICAL_TOPIC_MAP[clean];
  if (clean.includes('search') || clean.includes('bfs') || clean.includes('dfs')) return 'Searching';
  if (clean.includes('array')) return 'Arrays';
  if (clean.includes('string')) return 'Strings';
  if (clean.includes('stack') || clean.includes('queue') || clean.includes('heap')) return 'Stack & Queue';
  if (clean.includes('tree')) return 'Trees';
  if (clean.includes('graph')) return 'Graphs';
  if (clean.includes('linked list')) return 'Linked List';
  if (clean.includes('sort')) return 'Sorting';
  if (clean.includes('dp') || clean.includes('dynamic')) return 'Dynamic Programming';
  return null;
};

/**
 * Returns distinct canonical categories for a given problem
 */
export const getProblemCanonicalCategories = (problem) => {
  if (!problem || !Array.isArray(problem.topics)) return [];
  const set = new Set();
  problem.topics.forEach(t => {
    const c = getCanonicalCategory(t);
    if (c) set.add(c);
  });
  return Array.from(set);
};

/**
 * Returns distinct, deduplicated display topic tags for problem cards
 */
export const getProblemDisplayTags = (problem, max = 3) => {
  if (!problem || !Array.isArray(problem.topics)) return [];
  const set = new Set();
  problem.topics.forEach(t => {
    const c = getCanonicalCategory(t) || t;
    set.add(c);
  });
  return Array.from(set).slice(0, max);
};
