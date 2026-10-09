import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../db.js';
import Battle from '../models/Battle.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Problem from '../models/Problem.js';

const cleanDatabase = async () => {
  try {
    console.log('🚀 Connecting to MongoDB for database cleanup...');
    await connectDB();

    const beforeBattles = await Battle.countDocuments();
    const beforeSubmissions = await Submission.countDocuments();
    const userCount = await User.countDocuments();
    const problemCount = await Problem.countDocuments();

    console.log(`\n📊 Existing Database State:`);
    console.log(`- Battles: ${beforeBattles}`);
    console.log(`- Submissions: ${beforeSubmissions}`);
    console.log(`- Users (PRESERVED): ${userCount}`);
    console.log(`- Problems (PRESERVED): ${problemCount}`);

    console.log(`\n🧹 Clearing all Battle and Submission documents...`);
    const delBattles = await Battle.deleteMany({});
    const delSubmissions = await Submission.deleteMany({});

    console.log(`✅ Deleted ${delBattles.deletedCount} battle(s).`);
    console.log(`✅ Deleted ${delSubmissions.deletedCount} submission(s).`);

    const afterBattles = await Battle.countDocuments();
    const afterSubmissions = await Submission.countDocuments();
    const finalUsers = await User.countDocuments();
    const finalProblems = await Problem.countDocuments();

    console.log(`\n✨ Final Database Summary:`);
    console.log(`- Battles in DB: ${afterBattles}`);
    console.log(`- Submissions in DB: ${afterSubmissions}`);
    console.log(`- Users in DB (Safely preserved): ${finalUsers}`);
    console.log(`- Problems in DB (Safely preserved): ${finalProblems}`);

    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed. Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanDatabase();
