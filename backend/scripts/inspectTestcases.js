import { allProblems } from '../data/allProblems.js';

allProblems.forEach((p, idx) => {
  console.log(`=== ${idx + 1}. [${p.slug}] "${p.title}" ===`);
  console.log('Examples count:', p.examples.length);
  p.examples.forEach((ex, ei) => {
    console.log(`  Ex ${ei + 1}: in=${ex.input} | out=${ex.output}`);
  });
  console.log('Testcases:');
  p.testcases.forEach((tc, ti) => {
    console.log(`  TC ${ti + 1} [${tc.hidden ? 'HIDDEN' : 'PUBLIC'}]: in=${JSON.stringify(tc.input)} | out=${JSON.stringify(tc.output)}`);
  });
});
