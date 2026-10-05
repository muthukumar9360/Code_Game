import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './db.js';
import Problem from './models/Problem.js';
import { allProblems, topicsMeta } from './data/allProblems.js';

const seedDatabase = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await connectDB();

    console.log(`\n📦 Total problems to upsert: ${allProblems.length}`);
    console.log(`📚 Topics count: ${topicsMeta.length}`);

    let upsertedCount = 0;
    for (const p of allProblems) {
      await Problem.findOneAndUpdate(
        { slug: p.slug },
        { $set: p },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upsertedCount++;
    }

    console.log(`\n✅ Successfully upserted ${upsertedCount} problems into MongoDB.`);

    // Verification queries
    const totalInDb = await Problem.countDocuments();
    const easyCount = await Problem.countDocuments({ difficulty: 'easy' });
    const mediumCount = await Problem.countDocuments({ difficulty: 'medium' });
    const hardCount = await Problem.countDocuments({ difficulty: 'hard' });

    console.log('\n📊 Database Summary:');
    console.log(`- Total Problems in DB: ${totalInDb}`);
    console.log(`- Easy Problems: ${easyCount}`);
    console.log(`- Medium Problems: ${mediumCount}`);
    console.log(`- Hard Problems: ${hardCount}`);

    console.log('\n🎯 Breakdown by Topic:');
    for (const t of topicsMeta) {
      console.log(`  Topic ${t.id}: ${t.name} -> ${t.problems.length} problems`);
    }

    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
