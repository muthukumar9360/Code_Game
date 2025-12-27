import User from '../models/User.js';

export const findOpponent = async (userId, tier) => {
  try {
    // Find a random opponent in the same tier, excluding the current user
    const opponents = await User.find({
      _id: { $ne: userId },
      tier: tier
    });

    if (opponents.length === 0) {
      return null;
    }

    // Return a random opponent
    const randomIndex = Math.floor(Math.random() * opponents.length);
    return opponents[randomIndex];
  } catch (error) {
    console.error('Error finding opponent:', error);
    throw error;
  }
};
