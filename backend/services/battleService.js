import Battle from '../models/Battle.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { awardBattleRewards } from './rewardService.js';

export const startBattle = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId).populate('participants.user');
    if (!battle) throw new Error('Battle not found');

    // Assign a random problem if not assigned
    if (!battle.problem) {
      const difficulty = getDifficultyFromTier(battle.tier);
      const problems = await Problem.find({ difficulty });
      if (problems && problems.length > 0) {
        const randomProblem = problems[Math.floor(Math.random() * problems.length)];
        battle.problem = randomProblem._id;
      } else {
        const fallbackProblem = await Problem.findOne();
        if (fallbackProblem) battle.problem = fallbackProblem._id;
      }
    }

    battle.status = 'active';
    battle.startTime = new Date();
    if (battle.isUntimed || battle.duration === 0) {
      battle.isUntimed = true;
      for (const p of battle.participants) {
        p.timeLeft = null;
      }
    } else {
      // initialize per-participant timeLeft (seconds)
      const initSeconds = (battle.duration || 30) * 60;
      for (const p of battle.participants) {
        if (p.timeLeft === null || p.timeLeft === undefined) p.timeLeft = initSeconds;
      }
    }
    await battle.save();

    return battle;
  } catch (error) {
    console.error('Error starting battle:', error);
    throw error;
  }
};

export const endBattle = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId);
    if (!battle) throw new Error('Battle not found');

    battle.status = 'finished';
    battle.endTime = new Date();

    // Determine results for all participants using their best submission
    const problem = await Problem.findById(battle.problem);
    const totalTests = problem?.testcases?.length || 0;

    // For each participant compute best score
    for (const participant of battle.participants) {
      const subs = await Submission.find({ battle: battle._id, user: participant.user });
      let best = 0;
      let bestSubId = null;
      for (const s of subs) {
        const passed = Array.isArray(s.results) ? s.results.filter(r => r.testcase && r.testcase.passed).length : 0;
        if (passed > best) {
          best = passed;
          bestSubId = s._id;
        }
      }
      participant.bestScore = best;
      participant.bestSubmission = bestSubId;
      if (!participant.result) {
        if (best === totalTests && totalTests > 0) {
          participant.result = 'win';
        } else if (best > 0) {
          participant.result = 'submitted';
        } else {
          participant.result = 'timeout';
        }
      }
    }

    // Decide winner/loser/draw by comparing team or individual scores
    const isTeamMatch = Boolean(battle.battleType === '2vs2' || battle.battleType === '4vs4');

    if (isTeamMatch) {
      const teamAParticipants = battle.participants.filter(p => p.team === 'A');
      const teamBParticipants = battle.participants.filter(p => p.team === 'B');

      const teamASolved = new Set();
      let teamAScore = 0;
      for (const p of teamAParticipants) {
        teamAScore += (p.bestScore || 0);
        for (const sp of (p.solvedProblems || [])) {
          teamASolved.add((sp?._id || sp).toString());
        }
      }

      const teamBSolved = new Set();
      let teamBScore = 0;
      for (const p of teamBParticipants) {
        teamBScore += (p.bestScore || 0);
        for (const sp of (p.solvedProblems || [])) {
          teamBSolved.add((sp?._id || sp).toString());
        }
      }

      if (teamASolved.size > teamBSolved.size) {
        for (const p of teamAParticipants) p.result = 'win';
        for (const p of teamBParticipants) p.result = 'lose';
      } else if (teamBSolved.size > teamASolved.size) {
        for (const p of teamBParticipants) p.result = 'win';
        for (const p of teamAParticipants) p.result = 'lose';
      } else {
        // Exactly same number of problems solved: compare the time taken to solve them!
        if (teamASolved.size > 0) {
          const startTimeMs = battle.startTime ? new Date(battle.startTime).getTime() : 0;
          const userIdsA = teamAParticipants.map(p => (p.user?._id || p.user).toString());
          const userIdsB = teamBParticipants.map(p => (p.user?._id || p.user).toString());

          const correctSubs = await Submission.find({
            battle: battle._id,
            overallResult: { $in: ['accepted', 'passed'] }
          }).sort({ submittedAt: 1, createdAt: 1 });

          // Calculate total solve time for Team A
          const teamASolveTimes = {};
          for (const s of correctSubs) {
            const uId = (s.user?._id || s.user).toString();
            const pId = (s.problem?._id || s.problem).toString();
            if (userIdsA.includes(uId) && !teamASolveTimes[pId]) {
              const subTime = s.submittedAt ? new Date(s.submittedAt).getTime() : new Date(s.createdAt).getTime();
              teamASolveTimes[pId] = Math.max(0, subTime - startTimeMs);
            }
          }
          const totalTimeA = Object.values(teamASolveTimes).reduce((a, b) => a + b, 0);

          // Calculate total solve time for Team B
          const teamBSolveTimes = {};
          for (const s of correctSubs) {
            const uId = (s.user?._id || s.user).toString();
            const pId = (s.problem?._id || s.problem).toString();
            if (userIdsB.includes(uId) && !teamBSolveTimes[pId]) {
              const subTime = s.submittedAt ? new Date(s.submittedAt).getTime() : new Date(s.createdAt).getTime();
              teamBSolveTimes[pId] = Math.max(0, subTime - startTimeMs);
            }
          }
          const totalTimeB = Object.values(teamBSolveTimes).reduce((a, b) => a + b, 0);

          if (totalTimeA < totalTimeB) {
            // Team A solved them in less time (faster)!
            for (const p of teamAParticipants) p.result = 'win';
            for (const p of teamBParticipants) p.result = 'lose';
          } else if (totalTimeB < totalTimeA) {
            // Team B solved them in less time (faster)!
            for (const p of teamBParticipants) p.result = 'win';
            for (const p of teamAParticipants) p.result = 'lose';
          } else {
            // Exactly tied on time as well: compare scores or draw
            if (teamAScore > teamBScore) {
              for (const p of teamAParticipants) p.result = 'win';
              for (const p of teamBParticipants) p.result = 'lose';
            } else if (teamBScore > teamAScore) {
              for (const p of teamBParticipants) p.result = 'win';
              for (const p of teamAParticipants) p.result = 'lose';
            } else {
              for (const p of battle.participants) p.result = 'draw';
            }
          }
        } else {
          // Neither team solved any problem: compare test cases passed (bestScore)
          if (teamAScore > teamBScore) {
            for (const p of teamAParticipants) p.result = 'win';
            for (const p of teamBParticipants) p.result = 'lose';
          } else if (teamBScore > teamAScore) {
            for (const p of teamBParticipants) p.result = 'win';
            for (const p of teamAParticipants) p.result = 'lose';
          } else {
            for (const p of battle.participants) p.result = 'draw';
          }
        }
      }
    } else {
      const scores = battle.participants.map(p => p.bestScore || 0);
      const maxScore = Math.max(...scores);
      const winners = battle.participants.filter(p => (p.bestScore || 0) === maxScore);

      if (maxScore > 0) {
        if (winners.length === 1) {
          for (const p of battle.participants) {
            if (p._id.toString() === winners[0]._id.toString()) p.result = 'win';
            else p.result = 'lose';
          }
        } else {
          for (const p of battle.participants) {
            if ((p.bestScore || 0) === maxScore) p.result = 'draw';
            else p.result = 'lose';
          }
        }
      } else {
        // No one scored
        for (const p of battle.participants) {
          p.result = 'draw';
        }
      }
    }

    await battle.save();

    // Award battle rewards
    await awardBattleRewards(battle.participants, battle);

    return battle;
  } catch (error) {
    console.error('Error ending battle:', error);
    throw error;
  }
};

export const getBattleStatus = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.user', 'username tier xp')
      .populate('problem', 'title description examples testcases');

    if (!battle) throw new Error('Battle not found');

    return battle;
  } catch (error) {
    console.error('Error getting battle status:', error);
    throw error;
  }
};

const getDifficultyFromTier = (tier) => {
  const tierDifficulties = {
    'Bronze': 'easy',
    'Silver': 'easy',
    'Gold': 'medium',
    'Platinum': 'medium',
    'Diamond': 'hard'
  };
  return tierDifficulties[tier] || 'easy';
};

