import Battle from '../models/Battle.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';

export const startBattle = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId).populate('participants.user');
    if (!battle) throw new Error('Battle not found');

    // Assign a random problem if not assigned
    if (!battle.problem) {
      const problems = await Problem.find({ difficulty: getDifficultyFromTier(battle.tier) });
      const randomProblem = problems[Math.floor(Math.random() * problems.length)];
      battle.problem = randomProblem._id;
    }

    battle.status = 'active';
    battle.startTime = new Date();
    // initialize per-participant timeLeft (seconds)
    const initSeconds = (battle.duration || 30) * 60;
    for (const p of battle.participants) {
      if (p.timeLeft === null || p.timeLeft === undefined) p.timeLeft = initSeconds;
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
    // Fetch submissions grouped by user and pick the best (max passed testcases)
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

    // Decide winner/loser/draw by comparing bestScore across participants
    const scores = battle.participants.map(p => p.bestScore || 0);
    const maxScore = Math.max(...scores);
    const winners = battle.participants.filter(p => (p.bestScore || 0) === maxScore);

    if (winners.length === 1) {
      for (const p of battle.participants) {
        if (p._id.toString() === winners[0]._id.toString()) p.result = 'win';
        else p.result = 'lose';
      }
    } else {
      // tie
      for (const p of battle.participants) {
        if ((p.bestScore || 0) === maxScore) p.result = 'draw';
        else p.result = 'lose';
      }
    }

    await battle.save();

    return battle;
  } catch (error) {
    console.error('Error ending battle:', error);
    throw error;
  }
};

export const getBattleStatus = async (battleId) => {
  try {
    const battle = await Battle.findById(battleId)
      .populate('participants.user', 'username tier')
      .populate('problem', 'title description');

    if (!battle) throw new Error('Battle not found');

    return battle;
  } catch (error) {
    console.error('Error getting battle status:', error);
    throw error;
  }
};

const getDifficultyFromTier = (tier) => {
  const tierDifficulties = {
    'Bronze': 'Easy',
    'Silver': 'Easy',
    'Gold': 'Medium',
    'Platinum': 'Medium',
    'Diamond': 'Hard'
  };
  return tierDifficulties[tier] || 'Easy';
};
