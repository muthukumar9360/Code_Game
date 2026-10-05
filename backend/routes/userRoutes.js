import express from 'express';
import User from '../models/User.js';
import Battle from '../models/Battle.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { authMiddleware } from '../middleware/auth.js';
import adminAuth from '../middleware/Adminauth.js';

const router = express.Router();

// Hash password helper
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Create/Signup new user
router.post('/signup', async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    if (!username || !email || !password || !fullname) {
      return res.status(400).json({ error: 'Username, email, fullname, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const newUser = new User({
      username: username.trim(),
      fullname: fullname.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password)
    });

    await newUser.save();
    console.log('User created:', username);

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        tier: newUser.tier,
        xp: newUser.xp
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    let user = await User.findOne({ email: name.toLowerCase() });
    if (!user) {
      user = await User.findOne({ username: name });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tier: user.tier,
        xp: user.xp || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Global Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('username fullname tier xp practiceXp practicePoints rankedBattleXp contestXp tournamentPoints friendRoomPoints createdAt')
      .sort({ xp: -1 })
      .limit(100);

    const leaderboard = await Promise.all(
      users.map(async (u, idx) => {
        const winsCount = await Battle.countDocuments({
          'participants.user': u._id,
          'participants.result': 'win'
        });
        const totalBattles = await Battle.countDocuments({
          'participants.user': u._id,
          status: 'finished'
        });
        return {
          rank: idx + 1,
          id: u._id,
          username: u.username,
          fullname: u.fullname,
          tier: u.tier,
          xp: u.xp || 0,
          practicePoints: u.practiceXp || u.practicePoints || 0,
          rankedPoints: u.rankedBattleXp || 0,
          tournamentPoints: u.contestXp || u.tournamentPoints || 0,
          wins: winsCount,
          totalBattles,
          winRate: totalBattles > 0 ? Math.round((winsCount / totalBattles) * 100) : 0
        };
      })
    );

    res.json({ success: true, count: leaderboard.length, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Admin get all users
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Admin users fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Admin delete user
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all users (authenticated)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { username, tier, xp, coins } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, tier, xp, coins, lastActive: new Date() },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get User Submission Activity & Heatmap Data (365-day grid)
router.get('/:id/submission-activity', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    // Fetch submissions in past 365 days
    const submissions = await Submission.find({
      user: id,
      createdAt: { $gte: oneYearAgo }
    }).select('createdAt overallResult');

    // Also fetch finished battles in past 365 days
    const battles = await Battle.find({
      'participants.user': id,
      status: 'finished',
      createdAt: { $gte: oneYearAgo }
    }).select('createdAt');

    // Build activity count map: { "YYYY-MM-DD": count }
    const activityMap = {};

    submissions.forEach(s => {
      const d = new Date(s.createdAt).toISOString().slice(0, 10);
      activityMap[d] = (activityMap[d] || 0) + 1;
    });

    battles.forEach(b => {
      const d = new Date(b.createdAt).toISOString().slice(0, 10);
      activityMap[d] = (activityMap[d] || 0) + 1;
    });

    // Ensure all stored activeDays are represented with at least 1 count
    if (Array.isArray(user.activeDays)) {
      user.activeDays.forEach(d => {
        if (!activityMap[d]) activityMap[d] = 1;
      });
    }

    if (Array.isArray(user.dailyChallengeSolvedDates)) {
      user.dailyChallengeSolvedDates.forEach(d => {
        if (!activityMap[d]) activityMap[d] = 1;
      });
    }

    const activeDaysCount = Object.keys(activityMap).length;
    let totalSubmissions = Object.values(activityMap).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      totalSubmissions,
      activeDaysCount,
      streakCount: user.streakCount || 1,
      longestStreak: user.longestStreak || user.streakCount || 1,
      eloRating: user.eloRating || 1200,
      activityMap
    });
  } catch (error) {
    console.error('Submission activity fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get User Topic Progress & Daily Question Mastery Stats
router.get('/:id/topic-progress', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allProblems = await Problem.find({}, '_id slug title difficulty topics');

    // Find all problems user has successfully solved
    const solvedSubmissions = await Submission.find({
      user: id,
      overallResult: { $in: ['accepted', 'passed'] }
    }).select('problem');

    const solvedProblemIds = new Set(
      solvedSubmissions
        .map(s => s.problem?.toString())
        .filter(Boolean)
    );

    const TOPIC_GROUPS = [
      { id: 'arrays-hashing', name: 'Arrays & Hashing', icon: 'FaCode', match: ['Array', 'Arrays', 'Hash Table'] },
      { id: 'two-pointers', name: 'Two Pointers', icon: 'FaExchangeAlt', match: ['Two Pointers'] },
      { id: 'sliding-window', name: 'Sliding Window', icon: 'FaSlidersH', match: ['Sliding Window'] },
      { id: 'stack-queue', name: 'Stack & Queue', icon: 'FaStream', match: ['Stack', 'Queue', 'Monotonic Stack', 'Monotonic Queue'] },
      { id: 'binary-search', name: 'Binary Search', icon: 'FaSearch', match: ['Binary Search'] },
      { id: 'linked-list', name: 'Linked Lists', icon: 'FaLink', match: ['Linked List', 'Doubly-Linked List'] },
      { id: 'trees', name: 'Trees & BST', icon: 'FaSitemap', match: ['Trees', 'Binary Tree', 'Binary Search Tree'] },
      { id: 'graphs', name: 'Graphs & BFS/DFS', icon: 'FaProjectDiagram', match: ['Graph', 'Breadth-First Search', 'Depth-First Search', 'Topological Sort', 'Union Find'] },
      { id: 'dynamic-programming', name: 'Dynamic Programming', icon: 'FaBrain', match: ['Dynamic Programming', 'Memoization'] },
      { id: 'greedy', name: 'Greedy Algorithms', icon: 'FaGem', match: ['Greedy'] }
    ];

    const topicProgress = TOPIC_GROUPS.map(tg => {
      const topicProblems = allProblems.filter(p => (p.topics || []).some(t => tg.match.includes(t)));
      const solvedInTopic = topicProblems.filter(p => solvedProblemIds.has(p._id.toString()));
      const totalCount = topicProblems.length;
      const solvedCount = solvedInTopic.length;
      const isCompleted = totalCount > 0 && solvedCount >= totalCount;
      const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

      return {
        id: tg.id,
        name: tg.name,
        icon: tg.icon,
        totalProblems: totalCount,
        solvedProblems: solvedCount,
        isCompleted,
        percentage
      };
    });

    const totalDailySolved = Array.isArray(user.dailyChallengeSolvedDates) ? user.dailyChallengeSolvedDates.length : 0;
    const dailyStreak = user.streakCount || 0;
    const longestDailyStreak = user.longestStreak || dailyStreak;
    const activeDaysStreak = user.activeDaysStreak || 0;
    const longestActiveStreak = user.longestActiveStreak || activeDaysStreak;
    const activeDaysCount = Array.isArray(user.activeDays) ? user.activeDays.length : 0;
    const solvedDaysCount = Array.isArray(user.solvedDays) ? user.solvedDays.length : 0;

    res.json({
      success: true,
      totalDailySolved,
      dailyStreak,
      longestDailyStreak,
      activeDaysStreak,
      longestActiveStreak,
      activeDaysCount,
      solvedDaysCount,
      dailyChallengeSolvedDates: user.dailyChallengeSolvedDates || [],
      activeDays: user.activeDays || [],
      solvedDays: user.solvedDays || [],
      topics: topicProgress
    });
  } catch (error) {
    console.error('Topic progress fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get User Submission History & Solved Problems List with Solution Code
router.get('/:id/submissions-history', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all submissions by user, sorted newest first
    const submissions = await Submission.find({ user: id })
      .populate('problem', 'title slug difficulty topics category')
      .populate('battle', 'battleType roomId isRanked isTournament tournamentMode name')
      .sort({ createdAt: -1 })
      .limit(300);

    // Group to find unique solved and pending/attempted problems
    const solvedMap = new Map();
    const attemptedMap = new Map();

    submissions.forEach(sub => {
      const isAccepted = sub.overallResult === 'accepted' || sub.overallResult === 'passed';
      const probId = sub.problem?._id?.toString() || (sub.isDailyChallenge ? 'daily-challenge' : null);
      if (!probId) return;

      const probData = {
        submissionId: sub._id,
        problemId: probId,
        title: sub.problem?.title || (sub.isDailyChallenge ? 'Daily Blitz Challenge' : 'Practice Directive'),
        slug: sub.problem?.slug || '',
        difficulty: sub.problem?.difficulty || 'medium',
        topics: sub.problem?.topics || [],
        category: sub.problem?.category || 'Algorithms',
        lastSolutionCode: sub.code,
        language: sub.language,
        solvedAt: sub.createdAt,
        overallResult: sub.overallResult,
        isDailyChallenge: Boolean(sub.isDailyChallenge),
        isBattle: Boolean(sub.battle),
        battleType: sub.battle?.battleType || null,
        isRanked: Boolean(sub.battle?.isRanked)
      };

      if (isAccepted) {
        if (!solvedMap.has(probId)) {
          solvedMap.set(probId, probData);
        }
      } else {
        if (!attemptedMap.has(probId)) {
          attemptedMap.set(probId, probData);
        }
      }
    });

    // Remove any problem from attempted that the user has already solved
    for (const probId of solvedMap.keys()) {
      attemptedMap.delete(probId);
    }

    const solvedProblems = Array.from(solvedMap.values());
    const attemptedProblems = Array.from(attemptedMap.values());

    res.json({
      success: true,
      totalSubmissionsCount: submissions.length,
      solvedCount: solvedProblems.length,
      attemptedCount: attemptedProblems.length,
      solvedProblems,
      attemptedProblems,
      recentSubmissions: submissions.map(s => {
        const isBattle = Boolean(s.battle);
        const b = s.battle || {};
        let source = "practice";
        if (s.isDailyChallenge) {
          source = "daily";
        } else if (isBattle) {
          source = "competitive";
        }

        return {
          id: s._id,
          problemId: s.problem?._id?.toString() || '',
          problemTitle: s.problem?.title || (s.isDailyChallenge ? 'Daily Blitz Challenge' : 'Arena Challenge Problem'),
          problemSlug: s.problem?.slug || '',
          difficulty: s.problem?.difficulty || 'medium',
          topics: s.problem?.topics || [],
          code: s.code,
          language: s.language,
          overallResult: s.overallResult,
          status: s.status,
          source, // 'practice' | 'competitive' | 'daily'
          isBattle,
          battleId: b._id || b.roomId || null,
          battleRoomId: b.roomId || null,
          battleType: b.battleType || (isBattle ? "1vs1" : null),
          isRanked: Boolean(b.isRanked) || Boolean(b.roomId && b.roomId.startsWith("RNK")),
          isTournament: Boolean(b.isTournament),
          contestName: b.name || null,
          isDailyChallenge: Boolean(s.isDailyChallenge),
          submittedAt: s.createdAt,
          testsPassed: (s.results || []).filter(r => r.testcase?.passed).length,
          totalTests: (s.results || []).length
        };
      })
    });
  } catch (error) {
    console.error('Submission history fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
