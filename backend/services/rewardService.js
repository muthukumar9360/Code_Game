import User from '../models/User.js';

const TIER_THRESHOLDS = [
  { tier: 'Diamond', minXp: 7000 },
  { tier: 'Platinum', minXp: 3500 },
  { tier: 'Gold', minXp: 1500 },
  { tier: 'Silver', minXp: 500 },
  { tier: 'Bronze', minXp: 0 }
];

export const calculateTier = (xp) => {
  for (const t of TIER_THRESHOLDS) {
    if (xp >= t.minXp) return t.tier;
  }
  return 'Bronze';
};

/**
 * Update streaks and badges
 * @param {Object} user - User document
 * @param {string} activityType - 'practice' | 'battle' | 'daily'
 * @param {boolean} isSolved - TRUE only if solution passes 100% testcases, FALSE for general activity
 */
export const updateDailyStreakAndBadges = (user, activityType = 'battle', isSolved = false) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 1. ACTIVE DAYS STREAK (Triggered on ANY submission or activity today)
  if (!user.activeDays) user.activeDays = [];
  if (!user.activeDays.includes(todayStr)) {
    user.activeDays.push(todayStr);
  }

  const lastActiveDate = user.lastActiveSubmissionDate ? new Date(user.lastActiveSubmissionDate) : null;
  if (lastActiveDate) {
    const isSameDay = now.toDateString() === lastActiveDate.toDateString();
    if (!isSameDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = yesterday.toDateString() === lastActiveDate.toDateString();

      if (isConsecutive) {
        user.activeDaysStreak = (user.activeDaysStreak || 0) + 1;
      } else {
        user.activeDaysStreak = 1;
      }
      user.lastActiveSubmissionDate = now;
      if (user.activeDaysStreak > (user.longestActiveStreak || 0)) {
        user.longestActiveStreak = user.activeDaysStreak;
      }
    }
  } else {
    user.activeDaysStreak = 1;
    user.longestActiveStreak = 1;
    user.lastActiveSubmissionDate = now;
  }

  // 2. SOLVED STREAK (Triggered ONLY when submitting a correct solution that passes ALL testcases)
  if (isSolved) {
    if (!user.solvedDays) user.solvedDays = [];
    if (!user.solvedDays.includes(todayStr)) {
      user.solvedDays.push(todayStr);
    }

    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    if (lastStreakDate) {
      const isSameDay = now.toDateString() === lastStreakDate.toDateString();
      if (!isSameDay) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = yesterday.toDateString() === lastStreakDate.toDateString();

        if (isConsecutive) {
          user.streakCount = (user.streakCount || 0) + 1;
        } else {
          user.streakCount = 1;
        }
        user.lastStreakDate = now;
        if (user.streakCount > (user.longestStreak || 0)) {
          user.longestStreak = user.streakCount;
        }
      }
    } else {
      user.streakCount = 1;
      user.longestStreak = 1;
      user.lastStreakDate = now;
    }
  }
};

export const awardBattleRewards = async (participants, battle = null) => {
  const rewards = [];
  const isTournament = Boolean(battle?.isTournament);
  const isRanked = Boolean(battle?.isRanked);
  const tournamentMode = battle?.tournamentMode || 'real'; // 'real' or 'friendly'

  for (const p of participants) {
    const userId = p.user?._id || p.user;
    if (!userId) continue;

    let xpGain = 0;
    let xpType = 'friendly'; // 'ranked', 'contest', 'friendly'

    if (isTournament) {
      if (tournamentMode === 'friendly') {
        // Friendly Tournament: 0 XP gained, 0 XP lost (Safe friendly exhibition)
        xpGain = 0;
        xpType = 'friendly';
      } else {
        // Official Tournament Contest: Win = +25 XP, Loss = -15 XP, Draw/Other = 0 XP
        if (p.result === 'win') {
          xpGain = 25;
        } else if (p.result === 'lose') {
          xpGain = -15;
        } else {
          xpGain = 0;
        }
        xpType = 'contest';
      }
    } else if (isRanked) {
      // 1v1 Live Ranked Match: Win = +25 XP, Loss = -15 XP, Draw = 0 XP
      if (p.result === 'win') {
        xpGain = 25;
      } else if (p.result === 'lose') {
        xpGain = -15;
      } else {
        xpGain = 0;
      }
      xpType = 'ranked';
    } else {
      // Casual / Friendly Room Match: 0 XP gain / 0 XP loss
      xpGain = 0;
      xpType = 'friendly';
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        if (xpType === 'ranked') {
          user.rankedBattleXp = Math.max(0, (user.rankedBattleXp || 0) + xpGain);
        } else if (xpType === 'contest') {
          user.contestXp = Math.max(0, (user.contestXp || 0) + xpGain);
        }

        // Total XP is the unified sum of categorized XP
        user.xp = Math.max(
          0,
          (user.practiceXp || 0) + (user.rankedBattleXp || 0) + (user.contestXp || 0)
        );
        user.tier = calculateTier(user.xp);
        user.lastActive = new Date();

        const isSolvedBattle = p.result === 'win' || (p.bestScore && p.bestScore > 0);
        updateDailyStreakAndBadges(user, 'battle', Boolean(isSolvedBattle));
        await user.save();

        rewards.push({
          userId: user._id,
          username: user.username,
          result: p.result,
          xpEarned: xpGain,
          xpType,
          newTier: user.tier,
          totalXp: user.xp,
          rankedBattleXp: user.rankedBattleXp || 0,
          contestXp: user.contestXp || 0,
          practiceXp: user.practiceXp || 0
        });
      }
    } catch (err) {
      console.error(`Error awarding rewards to user ${userId}:`, err);
    }
  }
  return rewards;
};

/**
 * Practice Module: ONLY AWARDS PRACTICE XP
 */
export const awardPracticeReward = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Award +25 Practice XP
    user.practiceXp = (user.practiceXp || 0) + 25;
    user.xp = Math.max(
      0,
      (user.practiceXp || 0) + (user.rankedBattleXp || 0) + (user.contestXp || 0)
    );
    user.tier = calculateTier(user.xp);
    user.lastActive = new Date();

    // In practice module, this function is called only when ALL testcases pass
    updateDailyStreakAndBadges(user, 'practice', true);
    await user.save();

    return {
      xpEarned: 25,
      practiceXp: user.practiceXp,
      totalXp: user.xp,
      tier: user.tier
    };
  } catch (err) {
    console.error('Error awarding practice reward:', err);
    return null;
  }
};
