import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../db.js';
import Problem from '../models/Problem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  await connectDB();
  const total = await Problem.countDocuments();
  console.log('Total problems in DB:', total);

  const all = await Problem.find({}).lean();
  let invalidExampleCount = 0;
  let invalidTotalTcCount = 0;
  let invalidPubCount = 0;
  let invalidPrivCount = 0;

  all.forEach((p, idx) => {
    const exCount = p.examples?.length || 0;
    const tcCount = p.testcases?.length || 0;
    const pubCount = p.testcases?.filter(t => !t.hidden).length || 0;
    const privCount = p.testcases?.filter(t => t.hidden).length || 0;

    if (exCount < 3) invalidExampleCount++;
    if (tcCount < 13) invalidTotalTcCount++;
    if (pubCount < 3) invalidPubCount++;
    if (privCount < 10) invalidPrivCount++;
  });

  console.log('\n=== AUDIT RESULTS ===');
  console.log(`Problems with < 3 examples: ${invalidExampleCount}`);
  console.log(`Problems with < 13 total testcases: ${invalidTotalTcCount}`);
  console.log(`Problems with < 3 public testcases: ${invalidPubCount}`);
  console.log(`Problems with < 10 private testcases: ${invalidPrivCount}`);

  const pal = await Problem.findOne({ slug: 'palindrome-number-verification' }).lean();
  console.log('\n=== PALINDROME VERIFICATION AUDIT ===');
  console.log('Slug:', pal.slug);
  console.log('Title:', pal.title);
  console.log('Difficulty:', pal.difficulty);
  console.log('Description:', pal.description);
  console.log('Constraints:', pal.constraints);
  console.log('Topics:', pal.topics);
  console.log('Examples count:', pal.examples?.length);
  console.log('Examples:', JSON.stringify(pal.examples, null, 2));
  console.log('Total testcases:', pal.testcases?.length);
  console.log('Public testcases (hidden: false):', pal.testcases?.filter(t => !t.hidden).length);
  console.log('Private testcases (hidden: true):', pal.testcases?.filter(t => t.hidden).length);

  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
