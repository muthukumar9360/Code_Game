import Problem from '../models/Problem.js';

const TOPIC_GUIDANCE = {
  'array': 'Consider iterating through the array while maintaining state (e.g. prefix sums, two pointers, or a sliding window).',
  'string': 'Look for common substring patterns, frequency counting of characters with a hash map, or two-pointer traversal.',
  'hash table': 'Use a dictionary or map for O(1) average lookup time to store elements or frequencies you have already visited.',
  'two pointers': 'If the collection is sorted or monotonic, placing pointers at both ends can reduce time complexity from O(N^2) to O(N).',
  'binary search': 'If the search space is monotonic or sorted, check the midpoint and halve your search range on each step.',
  'dynamic programming': 'Identify overlapping subproblems. Define a dp array or state where dp[i] depends on previously computed smaller states.',
  'recursion': 'Identify your base case first where recursion terminates, then solve the subproblem on the remaining input.',
  'sorting': 'Sorting the input array first may reveal patterns and simplify checking duplicates or ranges in O(N log N) time.',
  'stack': 'A stack can track elements in LIFO order—useful for matching parentheses or finding the next greater/smaller element.',
  'queue': 'A queue is ideal for FIFO processing, such as breadth-first search (BFS) level-order traversal.',
  'graph': 'Model the relationships as nodes and edges. Use BFS for shortest unweighted paths or DFS for connected components.',
  'tree': 'Trees are naturally recursive structures. Preorder, inorder, or postorder traversals often solve subproblems on left and right children.'
};

// Retrieve hint: 100% database-driven with offline fallback
export const getHint = async (problemSlug, userTier = 'Bronze', hintLevel = 1) => {
  try {
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      return 'Carefully analyze the problem constraints and boundary conditions.';
    }

    // 1. Primary: Return stored hint directly from MongoDB
    const hintKey = `h${hintLevel}`;
    if (problem.hints && problem.hints[hintKey] && problem.hints[hintKey].trim()) {
      return problem.hints[hintKey].trim();
    }

    // Check if any other hint level is filled in DB
    if (problem.hints) {
      for (const k of ['h1', 'h2', 'h3']) {
        if (problem.hints[k] && problem.hints[k].trim()) {
          return problem.hints[k].trim();
        }
      }
    }

    // 2. Offline Fallback: Context-aware guidance based on Problem topics
    const topics = Array.isArray(problem.topics) ? problem.topics.map(t => t.toLowerCase()) : [];
    for (const t of topics) {
      for (const [key, advice] of Object.entries(TOPIC_GUIDANCE)) {
        if (t.includes(key)) {
          return `Tactical Hint (${t.toUpperCase()}): ${advice}`;
        }
      }
    }

    // 3. Fallback based on difficulty
    if (problem.difficulty === 'easy') {
      return 'Tactical Hint: Focus on a straightforward iterative approach. Verify edge cases like empty inputs or boundary values.';
    } else if (problem.difficulty === 'hard') {
      return 'Tactical Hint: A brute-force approach may exceed time limits. Look for memoization, monotonic structures, or mathematical invariants.';
    }

    return 'Tactical Hint: Consider storing intermediate results in a map or hash set to avoid duplicate calculations.';
  } catch (error) {
    return 'Examine the problem constraints: consider time and space complexity tradeoffs.';
  }
};

// Code explanation fallback
export const getExplanation = async (problemSlug, userCode, language = 'python') => {
  try {
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      return 'Review your logic against the sample inputs and outputs.';
    }
    return `Ensure your ${language} implementation handles all constraints, including zero/empty inputs and maximum boundary values.`;
  } catch (error) {
    return 'Verify boundary conditions and algorithm logic.';
  }
};
