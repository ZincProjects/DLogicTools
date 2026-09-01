import { GENERATORS } from "../lib/practice";
let n = 0, bad = 0;
for (const g of GENERATORS) {
  for (let i = 0; i < 200; i++) {
    try {
      const q = g.gen();
      n++;
      if (!q.prompt || !q.answer || !q.working?.length) { bad++; console.log("EMPTY", g.label, q); }
      if (/undefined|NaN|\[object/.test(q.prompt + q.answer + q.working.join(""))) {
        bad++; console.log("BAD TEXT in", g.label, JSON.stringify(q).slice(0, 300));
      }
    } catch (e: any) { bad++; console.log("THREW", g.label, e.message); }
  }
}
console.log(`${n} questions generated, ${bad} problems`);
process.exit(bad ? 1 : 0);
