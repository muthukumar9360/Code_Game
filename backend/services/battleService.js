import Battle from '../models/Battle.js';
import Problem from '../models/Problem.js';

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
