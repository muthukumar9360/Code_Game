import Problem from "../models/Problem.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import { executeCode } from "../services/codeExecutionService.js";
import { awardPracticeReward, updateDailyStreakAndBadges } from "../services/rewardService.js";
import { getHint, getExplanation } from "../services/aiMentorService.js";

export const createProblem = async (req, res) => {
  try {
    const {
      slug,
      title,
      difficulty,
      description,
      examples,
      constraints,
      topics,
      companies,
      hints,
      testcases
    } = req.body;

    const problem = new Problem({
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      title,
      difficulty: (difficulty || 'easy').toLowerCase(),
      description,
      examples,
      constraints,
      topics,
      companies,
      hints,
      testcases
    });

    await problem.save();

    res.status(201).json({
      success: true,
      message: "Problem added successfully",
      data: problem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProblemsForAdmin = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllProblemsForUser = async (req, res) => {
  try {
    const problems = await Problem.find().select('-testcases.hidden').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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

export const getProblemCategories = async (req, res) => {
  try {
    const problems = await Problem.find({}, { topics: 1 });
    const totalProblems = problems.length;

    // Track unique problems per canonical category
    const categoryCounts = {};

    problems.forEach(problem => {
      const matchedCategories = new Set();
      (problem.topics || []).forEach(rawTopic => {
        const canonical = getCanonicalCategory(rawTopic);
        if (canonical) {
          matchedCategories.add(canonical);
        }
      });

      matchedCategories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    // Sort categories by problem count descending
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        count
      }));

    const categories = [
      { id: 'all', name: 'All Topics', count: totalProblems },
      ...sortedCategories
    ];

    res.status(200).json({
      success: true,
      totalProblems,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await Problem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const problemObj = problem.toObject();
    // Only return visible testcases so hidden testcases are not leaked to frontend
    problemObj.testcases = (problemObj.testcases || [])
      .filter(tc => !tc.hidden)
      .map(tc => ({ input: tc.input, output: tc.output }));

    res.status(200).json(problemObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Problem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json({ success: true, message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      difficulty,
      description,
      examples,
      constraints,
      topics,
      companies,
      hints,
      testcases
    } = req.body;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    if (title !== undefined) problem.title = title;
    if (slug !== undefined && slug.trim()) problem.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (difficulty !== undefined) problem.difficulty = difficulty.toLowerCase();
    if (description !== undefined) problem.description = description;
    if (examples !== undefined) problem.examples = examples;
    if (constraints !== undefined) problem.constraints = constraints;
    if (topics !== undefined) problem.topics = topics;
    if (companies !== undefined) problem.companies = companies;
    if (hints !== undefined) problem.hints = hints;
    if (testcases !== undefined) problem.testcases = testcases;

    await problem.save();

    res.json({
      success: true,
      message: "Problem updated successfully",
      data: problem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Run Public Testcases (Used for "Run Tests" / "Run Code")
export const runPublicTestcases = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;

    const problem = await Problem.findOne({ slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Filter public test cases (hidden: false or not hidden)
    const publicCases = (problem.testcases || []).filter(tc => !tc.hidden);
    const testCasesToRun = publicCases.length > 0 ? publicCases : (problem.testcases || []).slice(0, 3);

    const testCases = testCasesToRun.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    if (!testCases.length) {
      return res.status(400).json({ error: "No public testcases available for this problem" });
    }

    const executionResult = await executeCode(code, language, testCases);
    const passedCount = Array.isArray(executionResult.results)
      ? executionResult.results.filter(r => r.testcase && r.testcase.passed).length
      : 0;
    const totalTests = executionResult.results.length;
    const allPassed = passedCount === totalTests && totalTests > 0;

    res.json({
      success: true,
      mode: "public_run",
      allPassed,
      passedCount,
      totalTests,
      results: executionResult.results,
      message: `Public Test Run: ${passedCount}/${totalTests} Passed.`
    });
  } catch (error) {
    console.error("Public run error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Solo Practice Submission (Evaluates against ALL Private Testcases - 100% pass required for solved)
export const submitPracticeSolution = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;
    const userId = req.user?.id;

    const problem = await Problem.findOne({ slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Filter private test cases (hidden: true)
    const privateTestCases = (problem.testcases || []).filter(tc => tc.hidden);
    // If no hidden testcases configured, evaluate all testcases as private evaluation
    const testCasesToEvaluate = privateTestCases.length > 0 ? privateTestCases : problem.testcases;

    const testCases = (testCasesToEvaluate || []).map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    if (!testCases.length) {
      return res.status(400).json({ error: "No private testcases available for this problem" });
    }

    const executionResult = await executeCode(code, language, testCases);
    const passedCount = Array.isArray(executionResult.results)
      ? executionResult.results.filter(r => r.testcase && r.testcase.passed).length
      : 0;
    const totalTests = executionResult.results.length;

    // CRITICAL: ALL private testcases must pass (100% pass rate) for the problem to be solved!
    // If even one fails, allPassed is FALSE and overallResult is 'failed'
    const allPassed = passedCount === totalTests && totalTests > 0;
    const overallResult = allPassed ? "accepted" : "failed";

    let reward = null;
    if (userId) {
      if (allPassed) {
        // Check if user has already solved this problem previously
        const alreadySolved = await Submission.exists({
          user: userId,
          problem: problem._id,
          overallResult: { $in: ["accepted", "passed"] }
        });

        if (alreadySolved) {
          // Already solved before: 0 additional XP
          const user = await User.findById(userId);
          if (user) {
            updateDailyStreakAndBadges(user, 'practice', true);
            await user.save();
          }
          reward = {
            alreadySolved: true,
            xpEarned: 0,
            practiceXp: user?.practiceXp || 0,
            totalXp: user?.xp || 0,
            tier: user?.tier || 'Bronze',
            message: "Problem already solved previously. No duplicate XP awarded."
          };
        } else {
          // First time solving this problem: award Practice XP
          reward = await awardPracticeReward(userId);
        }
      } else {
        const user = await User.findById(userId);
        if (user) {
          updateDailyStreakAndBadges(user, 'practice', false);
          await user.save();
        }
      }

      const today = new Date().toISOString().slice(0, 10);
      await User.findByIdAndUpdate(userId, {
        $addToSet: { activeDays: today },
        $set: { lastActive: new Date() }
      });
      const submission = new Submission({
        user: userId,
        problem: problem._id,
        code,
        language,
        results: executionResult.results,
        overallResult // 'accepted' ONLY if 100% passed, otherwise 'failed'
      });
      await submission.save();
    }

    res.json({
      success: true,
      mode: "private_submit",
      allPassed,
      passedCount,
      totalTests,
      results: executionResult.results,
      reward,
      message: allPassed
        ? `Accepted! All ${totalTests}/${totalTests} Private Testcases Passed! Problem Solved!`
        : `Verdict: Failed (Wrong Answer). ${passedCount}/${totalTests} Private Testcases Passed. All private testcases must pass to mark as solved.`
    });
  } catch (error) {
    console.error("Practice submit error:", error);
    res.status(500).json({ error: error.message });
  }
};

// AI Mentor Hint
export const getProblemHint = async (req, res) => {
  try {
    const { slug } = req.params;
    const { hintLevel = 1 } = req.body;
    const userId = req.user?.id;
    let tier = 'Bronze';
    if (userId) {
      const user = await User.findById(userId);
      if (user) tier = user.tier;
    }
    const hint = await getHint(slug, tier, hintLevel);
    res.json({ success: true, hint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// AI Mentor Code Review / Explanation
export const getCodeExplanation = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;
    const explanation = await getExplanation(slug, code, language);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET DETERMINISTIC DAILY CHALLENGE PROBLEM
export const getDailyProblem = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const totalProblems = await Problem.countDocuments();
    if (totalProblems === 0) {
      return res.status(404).json({ success: false, error: "No problems found in arena database." });
    }

    // Deterministic hash based on today's date
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % totalProblems;

    const dailyProblem = await Problem.findOne().skip(index);
    if (!dailyProblem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    let isSolvedToday = false;
    const userId = req.user?.id;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.dailyChallengeSolvedDates?.includes(today)) {
        isSolvedToday = true;
      }
    }

    const problemObj = dailyProblem.toObject();
    // Exclude hidden testcase outputs
    problemObj.testcases = (problemObj.testcases || []).map((tc, idx) => ({
      input: tc.input,
      output: tc.hidden ? "[HIDDEN]" : tc.output,
      hidden: tc.hidden
    }));

    res.json({
      success: true,
      date: today,
      problem: problemObj,
      isSolvedToday
    });
  } catch (error) {
    console.error("Daily problem error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// COMPLETE DAILY BLITZ / DAILY CHALLENGE & UPDATE STREAK + BADGE
export const completeDailyProblem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required to record daily challenge." });
    }

    const { code, language, problemSlug } = req.body;
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found." });
    }

    // Check private testcases of the daily problem
    const privateTestCases = (problem.testcases || []).filter(tc => tc.hidden);
    const testCasesToEvaluate = privateTestCases.length > 0 ? privateTestCases : problem.testcases;
    const testCases = (testCasesToEvaluate || []).map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    if (!testCases.length) {
      return res.status(400).json({ error: "No testcases available for this daily challenge" });
    }

    const executionResult = await executeCode(code, language, testCases);
    const passedCount = Array.isArray(executionResult.results)
      ? executionResult.results.filter(r => r.testcase && r.testcase.passed).length
      : 0;
    const totalTests = executionResult.results.length;
    const allPassed = passedCount === totalTests && totalTests > 0;

    // IF EVEN ONE TESTCASE FAILS, DO NOT MARK AS SOLVED OR AWARD STREAK
    if (!allPassed) {
      if (userId && code && language) {
        const submission = new Submission({
          user: userId,
          problem: problem._id,
          isDailyChallenge: true,
          code,
          language,
          status: "completed",
          overallResult: "failed",
          results: executionResult.results
        });
        await submission.save();
      }

      return res.status(400).json({
        success: false,
        allPassed: false,
        passedCount,
        totalTests,
        results: executionResult.results,
        message: `Daily Challenge Failed: ${passedCount}/${totalTests} private testcases passed. All private testcases must pass to complete today's challenge!`
      });
    }

    // Check if already completed today OR already solved previously
    const alreadyCompleted = user.dailyChallengeSolvedDates?.includes(today);
    const alreadySolvedProblem = await Submission.exists({
      user: userId,
      problem: problem._id,
      overallResult: { $in: ["accepted", "passed"] }
    });
    const isProblemAlreadySolved = Boolean(alreadyCompleted || alreadySolvedProblem);

    // Calculate Streak
    const now = new Date();

    if (!alreadyCompleted) {
      updateDailyStreakAndBadges(user, 'daily', true);
      user.lastActive = now;

      if (!user.dailyChallengeSolvedDates) user.dailyChallengeSolvedDates = [];
      user.dailyChallengeSolvedDates.push(today);
    }

    if (!isProblemAlreadySolved) {
      // Award Practice XP for Daily Challenge ONLY if first time solved!
      user.practiceXp = (user.practiceXp || 0) + 150;
      user.xp = Math.max(0, (user.practiceXp || 0) + (user.rankedBattleXp || 0) + (user.contestXp || 0));
    }
    await user.save();

    // Record accepted submission
    if (code && language) {
      const submission = new Submission({
        user: userId,
        problem: problem._id,
        isDailyChallenge: true,
        code,
        language,
        status: "completed",
        overallResult: "accepted",
        results: executionResult.results
      });
      await submission.save();
    }

    res.json({
      success: true,
      alreadySolved: isProblemAlreadySolved,
      message: isProblemAlreadySolved
        ? "Daily challenge problem was already solved previously! No duplicate XP awarded."
        : "Daily Challenge Victory! +150 Practice XP awarded!",
      streakCount: user.streakCount,
      longestStreak: user.longestStreak,
      xpGained: isProblemAlreadySolved ? 0 : 150,
      practiceXp: user.practiceXp || 0,
      totalXp: user.xp || 0
    });
  } catch (error) {
    console.error("Complete daily problem error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
