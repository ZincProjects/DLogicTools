// Sanity checks for the maths behind the tools. Run with: npx tsx scripts/selftest.ts
import { parse, varsOf, truthTable, evaluate } from "../lib/boolean";
import { minimizeSOP, minimizePOS, termToSop } from "../lib/kmap";
import { twosComplement, fromTwosComplement, toGray, fromGray, parityBit, toBase, parseInBase } from "../lib/numbers";

let pass = 0, fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; } else { fail++; console.log(`FAIL ${name}\n  got  ${g}\n  want ${w}`); }
};

// --- parser -----------------------------------------------------------------
const ev = (src: string, env: Record<string, 0 | 1>) => evaluate(parse(src), env);
eq("AB juxtaposition", ev("AB", { A: 1, B: 1 }), 1);
eq("AB juxtaposition 0", ev("AB", { A: 1, B: 0 }), 0);
eq("postfix not", ev("A'", { A: 1 }), 0);
eq("prefix not", ev("!A", { A: 0 }), 1);
eq("precedence A+BC", ev("A+BC", { A: 0, B: 1, C: 0 }), 0);
eq("precedence AB'", ev("AB'", { A: 1, B: 0 }), 1);
eq("bracket not", ev("(A+B)'", { A: 0, B: 1 }), 0);
eq("xor word", ev("A xor B", { A: 1, B: 0 }), 1);
eq("xor symbol", ev("A^B^C", { A: 1, B: 1, C: 1 }), 1);
eq("nested", ev("(AB)' + C", { A: 1, B: 1, C: 0 }), 0);
eq("double postfix", ev("A''", { A: 1 }), 1);
eq("vars sorted", varsOf(parse("C + A'B")), ["A", "B", "C"]);
eq("truth table rows", truthTable(parse("A+B"), ["A", "B"]).map((r) => r.out), [0, 1, 1, 1]);

// --- minimiser --------------------------------------------------------------
// classic: F = Σm(0,1,2,3) over A,B  =>  A'
eq("QM 2var", minimizeSOP([0, 1], [], 2, ["A", "B"]).expression, "A'");
// F = Σm(0,1,2,3,4,5,6,7) => 1
eq("QM all ones", minimizeSOP([0,1,2,3,4,5,6,7], [], 3, ["A","B","C"]).expression, "1");
eq("QM none", minimizeSOP([], [], 3, ["A","B","C"]).expression, "0");
// F = Σm(1,3,5,7) over A,B,C => C
eq("QM = C", minimizeSOP([1,3,5,7], [], 3, ["A","B","C"]).expression, "C");
// Full-adder carry: Σm(3,5,6,7) => AB + AC + BC (3 terms, 6 literals)
{
  const r = minimizeSOP([3,5,6,7], [], 3, ["A","B","C"]);
  eq("QM carry literals", r.literals, 6);
  eq("QM carry terms", r.groups.length, 3);
}
// Verify every minimisation reproduces the original function, over many randoms.
{
  let bad = 0;
  for (let trial = 0; trial < 400; trial++) {
    const n = 2 + Math.floor(Math.random() * 3);          // 2..4 vars
    const vars = ["A","B","C","D"].slice(0, n);
    const total = 1 << n;
    const mins: number[] = [], dcs: number[] = [];
    for (let i = 0; i < total; i++) {
      const r = Math.random();
      if (r < 0.4) mins.push(i); else if (r < 0.5) dcs.push(i);
    }
    const sop = minimizeSOP(mins, dcs, n, vars);
    const pos = minimizePOS(mins, dcs, n, vars);
    const fs = sop.expression === "0" ? null : parse(sop.expression);
    const fp = pos.expression === "1" ? null : parse(pos.expression.replace(/\)\s*\(/g, ")(" ));
    for (let i = 0; i < total; i++) {
      if (dcs.includes(i)) continue;
      const want = mins.includes(i) ? 1 : 0;
      const env: Record<string, 0 | 1> = {};
      vars.forEach((v, j) => (env[v] = ((i >> (n - 1 - j)) & 1) as 0 | 1));
      const gotS = fs ? evaluate(fs, env) : 0;
      const gotP = fp ? evaluate(fp, env) : 1;
      if (gotS !== want) { bad++; console.log("SOP mismatch", { n, mins, dcs, expr: sop.expression, i }); break; }
      if (gotP !== want) { bad++; console.log("POS mismatch", { n, mins, dcs, expr: pos.expression, i }); break; }
    }
  }
  eq("random SOP/POS round-trip (400 fns)", bad, 0);
}

// --- numbers ----------------------------------------------------------------
eq("2s comp -5 4bit", twosComplement(-5, 4), "1011");
eq("2s comp +5 4bit", twosComplement(5, 4), "0101");
eq("2s comp -128 8bit", twosComplement(-128, 8), "10000000");
eq("2s comp decode", fromTwosComplement("1011"), -5);
eq("2s comp decode 8", fromTwosComplement("11111011"), -5);
eq("gray 1011", toGray("1011"), "1110");
eq("gray roundtrip", fromGray(toGray("10110110")), "10110110");
eq("even parity", parityBit("1011001", "even"), "0");
eq("odd parity", parityBit("1011001", "odd"), "1");
eq("toBase hex", toBase(255, 16), "FF");
eq("toBase bin frac", toBase(5.625, 2), "101.101");
eq("parse hex", parseInBase("2F", 16)?.value, 47);
eq("parse invalid", parseInBase("2G", 16), null);
eq("parse binary frac", parseInBase("1011.101", 2)?.value, 11.625);

// Gray code adjacency across the whole 4-bit sequence, including the wrap.
{
  let ok = true;
  for (let i = 0; i < 16; i++) {
    const a = toGray(i.toString(2).padStart(4, "0"));
    const b = toGray(((i + 1) % 16).toString(2).padStart(4, "0"));
    const diff = [...a].filter((c, j) => c !== b[j]).length;
    if (diff !== 1) ok = false;
  }
  eq("gray single-bit adjacency incl. wrap", ok, true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
