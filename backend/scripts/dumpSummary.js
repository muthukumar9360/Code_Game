import { topicsMeta } from '../data/allProblems.js';

topicsMeta.forEach(t => {
  console.log(`\n### TOPIC ${t.id}: ${t.name} (${t.problems.length} problems)`);
  t.problems.forEach(p => {
    console.log(`- ${p.slug} | Ex: ${p.examples.length} | TC: ${p.testcases.length} (Pub: ${p.testcases.filter(x=>!x.hidden).length}, Priv: ${p.testcases.filter(x=>x.hidden).length})`);
  });
});
