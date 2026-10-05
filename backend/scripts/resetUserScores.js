import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Battle from "../models/Battle.js";
import Submission from "../models/Submission.js";

dotenv.config({ path: "./.env" });

async function resetAllScores() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // 1. Reset all users' scores, XP, coins, ratings, streaks, and history to 0 / empty
    const updateResult = await User.updateMany(
      {},
      {
        $set: {
          xp: 0,
          coins: 0,
          practicePoints: 0,
          tournamentPoints: 0,
          friendRoomPoints: 0,
          eloRating: 1200,
          tier: "Bronze",
          streakCount: 0,
          longestStreak: 0,
          activeDays: [],
          dailyChallengeSolvedDates: [],
          badges: []
        }
      }
    );

    console.log(`Successfully reset scores for ${updateResult.modifiedCount} user(s).`);

    // 2. Clear old battle records and submissions so win rates and match stats start from 0
    const deletedBattles = await Battle.deleteMany({});
    console.log(`Cleared ${deletedBattles.deletedCount} old battle record(s).`);

    const deletedSubmissions = await Submission.deleteMany({});
    console.log(`Cleared ${deletedSubmissions.deletedCount} old submission record(s).`);

    // 3. Verify user list
    const users = await User.find({}, "username xp coins practicePoints tournamentPoints eloRating");
    console.log("\n--- Current Users After Reset ---");
    console.table(
      users.map((u) => ({
        username: u.username,
        xp: u.xp,
        coins: u.coins,
        practicePoints: u.practicePoints,
        tournamentPoints: u.tournamentPoints,
        eloRating: u.eloRating
      }))
    );

    console.log("\nAll users successfully reset to 0!");
  } catch (error) {
    console.error("Error resetting user scores:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

resetAllScores();
