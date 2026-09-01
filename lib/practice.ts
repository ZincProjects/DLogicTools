// Randomly generated practice questions with full worked solutions.
// Each generator returns a fresh question every call, so you can drill a skill
// until it is automatic rather than memorising six fixed examples.

import { toBase, twosComplement, fromTwosComplement, toBinaryWidth, toGray, parityBit, toBCD, signMagnitude, onesComplement } from "./numbers";
import { minimizeSOP, termToSop } from "./kmap";

export type Question = {
  topic: string;
  week: number;
  prompt: string;
  answer: string;
  working: string[];
  hint?: string;
};

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const VARS = ["A", "B", "C", "D"];

/* -------------------------------------------------- week 1: number systems */

function qBaseConvert(): Question {
  const from = pick([2, 8, 10, 16]);
  const to = pick([2, 8, 10, 16].filter((b) => b !== from));
  const value = ri(20, 500);
  const names: Record<number, string> = { 2: "binary", 8: "octal", 10: "decimal", 16: "hexadecimal" };
  const src = toBase(value, from);
  const bin = toBase(value, 2);

  const working = [
    `Write out the source number: ${src} (base ${from}).`,
    from === 10
      ? `Repeatedly divide by ${to}, collecting remainders, then read them bottom-to-top.`
      : `First get to decimal by weighting each column: ${src}₍${from}₎ = ${value}₁₀.`,
  ];
  if (from !== 10 && to !== 10 && (from === 2 || to === 2 || [8, 16].includes(from) && [8, 16].includes(to))) {
    working.push(`Faster route: go via binary. ${value} = ${bin}₂, then regroup.`);
  }
  if (to === 8) working.push(`Group the binary in 3s from the right: ${bin.padStart(Math.ceil(bin.length / 3) * 3, "0").match(/.{3}/g)?.join(" ")} → ${toBase(value, 8)}`);
  if (to === 16) working.push(`Group the binary in 4s from the right: ${bin.padStart(Math.ceil(bin.length / 4) * 4, "0").match(/.{4}/g)?.join(" ")} → ${toBase(value, 16)}`);
  if (to === 10) working.push(`Sum the column weights to get ${value}.`);
  if (to === 2) working.push(`Result in binary: ${bin}`);

  return {
    topic: "Number systems", week: 1,
    prompt: `Convert ${src}₍${from}₎ to ${names[to]}.`,
    answer: `${toBase(value, to)}₍${to}₎`,
    working,
    hint: from === 10 || to === 10 ? "Use repeated division (whole part) or column weights." : "Never go via decimal between binary/octal/hex — group the bits instead.",
  };
}

function qCodes(): Question {
  const kind = pick(["bcd", "gray", "parity", "ascii"]);
  if (kind === "bcd") {
    const n = ri(10, 99);
    return {
      topic: "Codes", week: 1,
      prompt: `Write ${n} in BCD (8421), and state how many bits it needs compared with straight binary.`,
      answer: `${toBCD(n).join(" ")} — ${toBCD(n).length * 4} bits in BCD vs ${n.toString(2).length} in straight binary`,
      working: [
        `BCD encodes each DECIMAL DIGIT separately in 4 bits.`,
        ...String(n).split("").map((d) => `digit ${d} → ${Number(d).toString(2).padStart(4, "0")}`),
        `Concatenate (do NOT add): ${toBCD(n).join(" ")}`,
        `Straight binary would be ${n.toString(2)} (${n.toString(2).length} bits). BCD is longer because it wastes codes 1010–1111 in every digit.`,
      ],
      hint: "Encode each digit on its own. Never convert the whole number at once.",
    };
  }
  if (kind === "gray") {
    const n = ri(4, 15);
    const b = n.toString(2).padStart(4, "0");
    return {
      topic: "Codes", week: 1,
      prompt: `Convert the binary number ${b} to Gray code.`,
      answer: toGray(b),
      working: [
        `Rule: G = B XOR (B shifted right by one). The MSB is copied unchanged.`,
        `MSB: G₃ = B₃ = ${b[0]}`,
        `G₂ = B₃ ⊕ B₂ = ${b[0]} ⊕ ${b[1]} = ${Number(b[0]) ^ Number(b[1])}`,
        `G₁ = B₂ ⊕ B₁ = ${b[1]} ⊕ ${b[2]} = ${Number(b[1]) ^ Number(b[2])}`,
        `G₀ = B₁ ⊕ B₀ = ${b[2]} ⊕ ${b[3]} = ${Number(b[2]) ^ Number(b[3])}`,
        `Gray = ${toGray(b)}`,
      ],
      hint: "XOR each bit with the bit to its left.",
    };
  }
  if (kind === "parity") {
    const bits = Array.from({ length: 7 }, () => ri(0, 1)).join("");
    const kindP = pick(["even", "odd"] as const);
    const ones = [...bits].filter((b) => b === "1").length;
    return {
      topic: "Codes", week: 1,
      prompt: `The 7 data bits are ${bits}. What is the ${kindP} parity bit, and what is transmitted?`,
      answer: `P = ${parityBit(bits, kindP)}, transmitted as ${bits}${parityBit(bits, kindP)}`,
      working: [
        `Count the 1s in the data: there are ${ones}, which is ${ones % 2 === 0 ? "even" : "odd"}.`,
        `${kindP === "even" ? "Even" : "Odd"} parity requires the TOTAL number of 1s (data + parity) to be ${kindP}.`,
        `Total is currently ${ones} (${ones % 2 === 0 ? "even" : "odd"}), so P must be ${parityBit(bits, kindP)}.`,
        `Transmit ${bits}${parityBit(bits, kindP)} — total 1s = ${ones + Number(parityBit(bits, kindP))} ✓`,
      ],
      hint: "Count the 1s first, then decide what P must be to hit the required parity.",
    };
  }
  const ch = pick("ABCXYZmnpq019".split(""));
  const code = ch.charCodeAt(0);
  return {
    topic: "Codes", week: 1,
    prompt: `Give the 7-bit ASCII code for '${ch}' in binary and hex.`,
    answer: `${code.toString(2).padStart(7, "0")}₂ = 0x${code.toString(16).toUpperCase()} (decimal ${code})`,
    working: [
      `Anchors worth memorising: '0' = 48, 'A' = 65, 'a' = 97.`,
      code >= 97 ? `'${ch}' is ${code - 97} letters after 'a', so ${97} + ${code - 97} = ${code}.`
        : code >= 65 && code <= 90 ? `'${ch}' is ${code - 65} letters after 'A', so ${65} + ${code - 65} = ${code}.`
        : `'${ch}' is digit ${ch}, so 48 + ${code - 48} = ${code}.`,
      `${code} in binary = ${code.toString(2).padStart(7, "0")}`,
      `${code} in hex = 0x${code.toString(16).toUpperCase()}`,
    ],
  };
}

/* --------------------------------------------------- week 1–2: logic gates */

function qTruthValue(): Question {
  const exprs = [
    { e: "A'B + AB'", f: (a: number, b: number, c: number) => (!a && b) || (a && !b) ? 1 : 0, n: 2 },
    { e: "(A + B)'", f: (a: number, b: number) => (a || b ? 0 : 1), n: 2 },
    { e: "(AB)' + C", f: (a: number, b: number, c: number) => ((a && b) ? 0 : 1) || c ? 1 : 0, n: 3 },
    { e: "A(B + C')", f: (a: number, b: number, c: number) => (a && (b || !c)) ? 1 : 0, n: 3 },
    { e: "AB + A'C", f: (a: number, b: number, c: number) => ((a && b) || (!a && c)) ? 1 : 0, n: 3 },
  ];
  const q = pick(exprs);
  const a = ri(0, 1), b = ri(0, 1), c = ri(0, 1);
  const res = q.f(a, b, c);
  const sub = q.n === 2 ? `A=${a}, B=${b}` : `A=${a}, B=${b}, C=${c}`;
  return {
    topic: "Boolean expressions", week: 1,
    prompt: `Evaluate Y = ${q.e} when ${sub}.`,
    answer: `Y = ${res}`,
    working: [
      `Precedence: NOT first, then AND, then OR.`,
      `Substitute ${sub} and work from the innermost brackets outwards.`,
      `Y = ${res}`,
    ],
    hint: "Complement the individual variables first, then do the ANDs, then the ORs.",
  };
}

function qDeMorgan(): Question {
  const forms = [
    { q: "(A·B·C)'", a: "A' + B' + C'", w: "Break the bar, change AND to OR, complement each term." },
    { q: "(A + B + C)'", a: "A'·B'·C'", w: "Break the bar, change OR to AND, complement each term." },
    { q: "(A'B)'", a: "A + B'", w: "Break the bar over the whole product: (A')' + B' = A + B'." },
    { q: "(A + B'C)'", a: "A'(B + C')", w: "Outer bar: A'·(B'C)'. Then inner: (B'C)' = B + C'." },
    { q: "((A+B)(C+D))'", a: "A'B' + C'D'", w: "Outer bar turns the AND into an OR: (A+B)' + (C+D)'. Then apply DeMorgan to each: A'B' + C'D'." },
  ];
  const f = pick(forms);
  return {
    topic: "DeMorgan", week: 1,
    prompt: `Apply DeMorgan’s theorem to simplify ${f.q} so that no bar covers more than one variable.`,
    answer: f.a,
    working: ["Rule: break the line, change the sign, complement each term underneath.", f.w, `Result: ${f.a}`],
    hint: "Work from the outermost bar inwards, one bar at a time.",
  };
}

function qSimplify(): Question {
  const items = [
    { q: "A + A'B", a: "A + B", w: ["This is the 'simplification' theorem.", "A + A'B = (A + A')(A + B) = 1·(A + B) = A + B"] },
    { q: "AB + AB'", a: "A", w: ["Adjacency: factor out A.", "AB + AB' = A(B + B') = A·1 = A"] },
    { q: "A + AB", a: "A", w: ["Absorption.", "A + AB = A(1 + B) = A·1 = A"] },
    { q: "A(A + B)", a: "A", w: ["Absorption (the dual form).", "A(A+B) = AA + AB = A + AB = A"] },
    { q: "AB + A'C + BC", a: "AB + A'C", w: ["Consensus theorem — the BC term is redundant.", "BC = BC(A + A') = ABC + A'BC, and ABC is covered by AB while A'BC is covered by A'C."] },
    { q: "(A + B)(A + B')", a: "A", w: ["Expand: AA + AB' + AB + BB'", "= A + AB' + AB + 0 = A(1 + B' + B) = A"] },
    { q: "A'B'C + A'BC + AB'C", a: "A'C + B'C", w: ["Factor C out of everything: C(A'B' + A'B + AB')", "A'B' + A'B = A'(B'+B) = A'", "So C(A' + AB') = C(A' + B') = A'C + B'C"] },
  ];
  const it = pick(items);
  return {
    topic: "Boolean simplification", week: 1,
    prompt: `Simplify Y = ${it.q} to the fewest possible literals.`,
    answer: `Y = ${it.a}`,
    working: [...it.w, `Answer: ${it.a}`],
    hint: "Look for a common factor first, then a pair that differs in exactly one variable.",
  };
}

/* ------------------------------------------------------ week 2–3: adders */

function qFullAdder(): Question {
  const a = ri(0, 1), b = ri(0, 1), c = ri(0, 1);
  const t = a + b + c;
  return {
    topic: "Adders", week: 2,
    prompt: `A full adder has A=${a}, B=${b}, C_in=${c}. Give Sum and C_out.`,
    answer: `Sum = ${t % 2}, C_out = ${t >= 2 ? 1 : 0}`,
    working: [
      `Add them as ordinary numbers: ${a} + ${b} + ${c} = ${t}.`,
      `Write ${t} in binary: ${t.toString(2).padStart(2, "0")}.`,
      `The right-hand bit is Sum = ${t % 2}; the left-hand bit is C_out = ${t >= 2 ? 1 : 0}.`,
      `Check with the equations: Sum = A⊕B⊕C_in = ${a}⊕${b}⊕${c} = ${t % 2}. C_out = AB + C_in(A⊕B) = ${a * b} + ${c}·${a ^ b} = ${t >= 2 ? 1 : 0}.`,
    ],
    hint: "Sum is 1 when an odd number of inputs are 1. C_out is 1 when at least two are.",
  };
}

function qTwosRep(): Question {
  const width = pick([4, 6, 8]);
  const max = (1 << (width - 1)) - 1;
  const v = ri(-max - 1, max);
  const form = pick(["2's complement", "sign-magnitude", "1's complement"]);
  const ans = form === "2's complement" ? twosComplement(v, width) : form === "sign-magnitude" ? signMagnitude(v, width) : onesComplement(v, width);
  const mag = Math.abs(v);
  return {
    topic: "Signed numbers", week: 2,
    prompt: `Represent ${v} in ${width}-bit ${form}.`,
    answer: ans || "out of range",
    working: v >= 0
      ? [`${v} is positive, so all three representations are identical: just write it in ${width}-bit binary.`, `${v} = ${toBinaryWidth(v, width)}`]
      : [
          `Start from the magnitude: |${v}| = ${mag} = ${toBinaryWidth(mag, width)}`,
          form === "sign-magnitude"
            ? `Set the MSB to 1 for negative and leave the rest as the magnitude: ${signMagnitude(v, width)}`
            : form === "1's complement"
            ? `Flip every bit: ${onesComplement(v, width)}`
            : `Flip every bit: ${[...toBinaryWidth(mag, width)].map((b) => (b === "0" ? "1" : "0")).join("")}`,
          ...(form === "2's complement" ? [`Then add 1: ${twosComplement(v, width)}`, `Check with the negative-MSB rule: ${twosComplement(v, width)} = ${fromTwosComplement(twosComplement(v, width))} ✓`] : []),
        ],
    hint: form === "2's complement" ? "Flip all the bits, then add 1." : undefined,
  };
}

function qTwosArith(): Question {
  const width = pick([4, 5, 6]);
  const max = (1 << (width - 1)) - 1, min = -(1 << (width - 1));
  const a = ri(min, max), b = ri(min, max);
  const op = pick(["+", "−"] as const);
  const eff = op === "+" ? b : -b;
  const A = twosComplement(a, width), B = twosComplement(op === "+" ? b : -b, width);
  if (!A || !B) return qTwosArith();

  // do the addition, tracking carries
  let c = 0, cIntoMsb = 0;
  const sum: string[] = [];
  for (let i = width - 1; i >= 0; i--) {
    const t = Number(A[i]) + Number(B[i]) + c;
    sum.unshift(String(t % 2));
    if (i === 0) cIntoMsb = c;
    c = t >= 2 ? 1 : 0;
  }
  const overflow = c !== cIntoMsb;
  const got = fromTwosComplement(sum.join(""));
  const truth = a + eff;

  return {
    topic: "2’s complement arithmetic", week: 3,
    prompt: `Using ${width}-bit 2’s complement, compute ${a} ${op} ${b}. State the result and whether overflow occurs.`,
    answer: `${sum.join("")} = ${got}${overflow ? " — OVERFLOW, the result is invalid" : " — no overflow"}`,
    working: [
      `Range for ${width} bits: ${min} to ${max}.`,
      `${a} = ${A}`,
      op === "−" ? `Subtraction is A + (−B), so negate B: −(${b}) = ${eff}, which is ${B}.` : `${b} = ${B}`,
      `Add the patterns: ${A} + ${B} = ${sum.join("")} (carry out = ${c}, discarded).`,
      `Overflow check: carry into MSB = ${cIntoMsb}, carry out of MSB = ${c}. V = ${cIntoMsb} ⊕ ${c} = ${overflow ? 1 : 0}.`,
      overflow
        ? `True answer ${truth} is outside ${min}…${max}, so the ${width}-bit result ${got} is WRONG. Overflow confirmed.`
        : `True answer is ${truth}, and the bits read back as ${got}. ✓`,
    ],
    hint: "Convert both to the width first. Then check overflow with both the carry rule and the sign rule.",
  };
}

function qBcdAdd(): Question {
  const a = ri(10, 89), b = ri(10, 89);
  const digitsA = String(a).padStart(2, "0").split("").map(Number);
  const digitsB = String(b).padStart(2, "0").split("").map(Number);
  const steps: string[] = [];
  let carry = 0;
  const out: number[] = [];
  for (let i = 1; i >= 0; i--) {
    const raw = digitsA[i] + digitsB[i] + carry;
    if (raw > 9) {
      steps.push(`Digit ${i === 1 ? "units" : "tens"}: ${digitsA[i]} + ${digitsB[i]}${carry ? ` + carry ${carry}` : ""} = ${raw} (${raw.toString(2).padStart(4, "0")}). That is > 9, so ADD 6: ${raw} + 6 = ${raw + 6} → digit ${raw + 6 - 16}, carry 1.`);
      out.unshift(raw + 6 - 16);
      carry = 1;
    } else {
      steps.push(`Digit ${i === 1 ? "units" : "tens"}: ${digitsA[i]} + ${digitsB[i]}${carry ? ` + carry ${carry}` : ""} = ${raw} ≤ 9, already valid BCD (${raw.toString(2).padStart(4, "0")}). No correction.`);
      out.unshift(raw);
      carry = 0;
    }
  }
  const result = (carry ? "1" : "") + out.join("");
  return {
    topic: "BCD addition", week: 3,
    prompt: `Add ${a} + ${b} in BCD. Show where the +6 correction is needed.`,
    answer: `${(carry ? "0001 " : "") + out.map((d) => d.toString(2).padStart(4, "0")).join(" ")} = decimal ${a + b}`,
    working: [`Work right to left, one decimal digit at a time.`, ...steps, `Check: ${a} + ${b} = ${a + b} ✓`],
    hint: "Correct whenever a digit sum exceeds 9, or the 4-bit adder produced a carry.",
  };
}

/* ------------------------------------------------------ week 4: SOP / K-map */

function qMinterm(): Question {
  const n = pick([3, 4]);
  const vars = VARS.slice(0, n);
  const row = ri(0, (1 << n) - 1);
  const bits = row.toString(2).padStart(n, "0");
  const wantMax = Math.random() < 0.4;
  return {
    topic: "Minterms & maxterms", week: 4,
    prompt: wantMax
      ? `For a ${n}-variable function of ${vars.join(", ")}, write maxterm M${row}.`
      : `For a ${n}-variable function of ${vars.join(", ")}, write minterm m${row}.`,
    answer: wantMax ? termToPosLocal(bits, vars) : termToSop(bits, vars),
    working: [
      `Row ${row} in binary is ${bits}, i.e. ${vars.map((v, i) => `${v}=${bits[i]}`).join(", ")}.`,
      wantMax
        ? `MAXTERM rule (the inverted one): a variable that is 0 appears PLAIN, a variable that is 1 appears COMPLEMENTED, and the terms are ORed.`
        : `MINTERM rule: a variable that is 1 appears PLAIN, a variable that is 0 appears COMPLEMENTED, and the terms are ANDed.`,
      `Result: ${wantMax ? termToPosLocal(bits, vars) : termToSop(bits, vars)}`,
    ],
    hint: wantMax ? "Maxterms invert the rule you use for minterms." : "1 means plain, 0 means complemented.",
  };
}

function termToPosLocal(bits: string, vars: string[]) {
  const parts: string[] = [];
  for (let i = 0; i < bits.length; i++) parts.push(bits[i] === "0" ? vars[i] : vars[i] + "'");
  return "(" + parts.join(" + ") + ")";
}

function qKmap(): Question {
  const n = pick([3, 4]);
  const vars = VARS.slice(0, n);
  const total = 1 << n;
  const count = ri(Math.floor(total * 0.3), Math.floor(total * 0.6));
  const set = new Set<number>();
  while (set.size < count) set.add(ri(0, total - 1));
  const minterms = [...set].sort((a, b) => a - b);
  const res = minimizeSOP(minterms, [], n, vars);
  return {
    topic: "Karnaugh maps", week: 4,
    prompt: `Simplify F(${vars.join(",")}) = Σm(${minterms.join(", ")}) using a ${n}-variable K-map. Give the minimal SOP.`,
    answer: `F = ${res.expression}`,
    working: [
      `Draw a ${n}-variable K-map with Gray-coded labels (00, 01, 11, 10) and place a 1 in cells ${minterms.join(", ")}.`,
      `Circle the largest possible power-of-two groups, remembering the map wraps around at every edge.`,
      `Groups found: ${res.groups.map((g) => termToSop(g.bits, vars)).join(", ") || "none"}`,
      ...res.groups.map((g) => {
        const elim = vars.filter((_, j) => g.bits[j] === "-");
        return `  ${termToSop(g.bits, vars)} — a group of ${g.covers.length} covering m(${g.covers.join(",")})${elim.length ? `, eliminating ${elim.join(" and ")}` : ""}.`;
      }),
      `OR the terms together: F = ${res.expression}  (${res.literals} literals)`,
    ],
    hint: "Group in powers of two, make each group as large as possible, and use the fewest groups that cover every 1.",
  };
}

/* ------------------------------------------ week 5–6: hardware & electrical */

function qCmos(): Question {
  const items = [
    { q: "2 NMOS in series (pull-down) with 2 PMOS in parallel (pull-up)", a: "Y = (A·B)′ — a NAND gate", w: ["Series NMOS = AND, so the pull-down condition is A·B.", "CMOS is always inverting, so Y = (A·B)′.", "That is a 2-input NAND, built from 4 transistors."] },
    { q: "2 NMOS in parallel (pull-down) with 2 PMOS in series (pull-up)", a: "Y = (A + B)′ — a NOR gate", w: ["Parallel NMOS = OR, so the pull-down condition is A + B.", "Invert it: Y = (A+B)′.", "That is a 2-input NOR, built from 4 transistors."] },
    { q: "A and B in series, that pair in parallel with C, all in the pull-down network", a: "Y = (A·B + C)′ — an AND-OR-Invert gate", w: ["Series A,B gives A·B. Putting C in parallel with that pair gives A·B + C.", "Invert: Y = (A·B + C)′.", "6 transistors, versus 14 if you built it from separate AND, OR and NOT gates."] },
  ];
  const it = pick(items);
  return {
    topic: "CMOS analysis", week: 5,
    prompt: `A static CMOS gate has ${it.q}. What function does it implement?`,
    answer: it.a,
    working: ["Read the NMOS pull-down network only: series = AND, parallel = OR.", ...it.w],
    hint: "Analyse the NMOS network, then complement the result — CMOS is always inverting.",
  };
}

function qNoiseMargin(): Question {
  const voh = +(ri(20, 45) / 10).toFixed(1);
  const vih = +(voh - ri(2, 8) / 10).toFixed(1);
  const vol = +(ri(1, 6) / 10).toFixed(1);
  const vil = +(vol + ri(2, 8) / 10).toFixed(1);
  const nmh = +(voh - vih).toFixed(2), nml = +(vil - vol).toFixed(2);
  return {
    topic: "Noise margin", week: 6,
    prompt: `A logic family has V_OH = ${voh} V, V_IH = ${vih} V, V_IL = ${vil} V, V_OL = ${vol} V. Find NM_H, NM_L and the worst-case noise margin.`,
    answer: `NM_H = ${nmh} V, NM_L = ${nml} V, worst case = ${Math.min(nmh, nml).toFixed(2)} V`,
    working: [
      `NM_H = V_OH − V_IH = ${voh} − ${vih} = ${nmh} V`,
      `NM_L = V_IL − V_OL = ${vil} − ${vol} = ${nml} V`,
      `The circuit's real immunity is the SMALLER of the two: ${Math.min(nmh, nml).toFixed(2)} V.`,
      `Interpretation: a HIGH signal can lose up to ${nmh} V and a LOW can gain up to ${nml} V before the receiver misreads it.`,
    ],
    hint: "Outputs minus inputs, in both directions. Then take the smaller.",
  };
}

function qFanout(): Question {
  const ioh = pick([0.4, 0.8, 4, 8]);
  const iol = pick([8, 16, 24]);
  const iih = pick([0.02, 0.04, 0.05]);
  const iil = pick([0.4, 1.6, 2]);
  const fh = Math.floor(ioh / iih), fl = Math.floor(iol / iil);
  return {
    topic: "Fan-out", week: 6,
    prompt: `A gate can source I_OH = ${ioh} mA and sink I_OL = ${iol} mA. Each input it drives needs I_IH = ${iih} mA and I_IL = ${iil} mA. What is the fan-out?`,
    answer: `${Math.min(fh, fl)} loads (limited by the ${fh < fl ? "HIGH" : "LOW"} state)`,
    working: [
      `HIGH state: ${ioh} ÷ ${iih} = ${(ioh / iih).toFixed(1)} → ${fh} loads (always round DOWN).`,
      `LOW state:  ${iol} ÷ ${iil} = ${(iol / iil).toFixed(1)} → ${fl} loads.`,
      `Fan-out is the smaller of the two: ${Math.min(fh, fl)}.`,
      `Exceeding it means the output voltage drifts out of spec and the receiver may misread the level.`,
    ],
    hint: "Check both states and take the minimum. Always round down.",
  };
}

function qPower(): Question {
  const v = pick([1.8, 2.5, 3.3, 5]);
  const c = pick([5, 10, 15, 22, 50]);
  const f = pick([10, 25, 50, 100, 200]);
  const p = c * 1e-12 * v * v * f * 1e6;
  return {
    topic: "Power dissipation", week: 6,
    prompt: `A CMOS gate drives a ${c} pF load from a ${v} V supply, switching at ${f} MHz. Find its dynamic power dissipation.`,
    answer: `${(p * 1e6).toFixed(2)} µW`,
    working: [
      `Formula: P_dynamic = C · V_DD² · f`,
      `= ${c}×10⁻¹² F × (${v} V)² × ${f}×10⁶ Hz`,
      `= ${c}×10⁻¹² × ${(v * v).toFixed(2)} × ${f}×10⁶`,
      `= ${(p * 1e6).toFixed(2)} µW  (${(p * 1000).toFixed(4)} mW)`,
      `Note the V² term: halving the supply would cut this to ${((p / 4) * 1e6).toFixed(2)} µW.`,
    ],
    hint: "P = CV²f. Keep the units straight: pF is 10⁻¹², MHz is 10⁶.",
  };
}

function qDelay(): Question {
  const stages = ri(3, 8);
  const tpd = pick([1, 2, 3, 5, 10]);
  const total = stages * tpd;
  return {
    topic: "Propagation delay", week: 6,
    prompt: `A signal passes through ${stages} gates, each with t_pd = ${tpd} ns. What is the total delay, and the maximum clock frequency this path allows?`,
    answer: `${total} ns; f_max = ${(1000 / total).toFixed(1)} MHz`,
    working: [
      `Delays along a path simply add: ${stages} × ${tpd} ns = ${total} ns.`,
      `The clock period must be at least the longest path, so T_min = ${total} ns.`,
      `f_max = 1/T = 1 / (${total} × 10⁻⁹ s) = ${(1000 / total).toFixed(1)} MHz.`,
      `In a real design you would also add register setup and clock-to-Q times, which lowers this further.`,
    ],
    hint: "Add the delays, then invert to get frequency. 1 ns ↔ 1000 MHz.",
  };
}

function qFloat(): Question {
  const vals = [12.375, -5.75, 0.15625, 40.5, -0.375, 100.25];
  const v = pick(vals);
  const buf = new DataView(new ArrayBuffer(4));
  buf.setFloat32(0, v);
  let bits = "";
  for (let i = 0; i < 4; i++) bits += buf.getUint8(i).toString(2).padStart(8, "0");
  const sign = bits[0], exp = bits.slice(1, 9), mant = bits.slice(9);
  const e = parseInt(exp, 2);
  return {
    topic: "Floating point", week: 6,
    prompt: `Express ${v} in IEEE-754 single precision. Give the sign, the stored exponent and the mantissa.`,
    answer: `S = ${sign}, E = ${exp} (${e}), M = ${mant}`,
    working: [
      `Sign: ${v < 0 ? "negative → S = 1" : "positive → S = 0"}`,
      `Convert the magnitude to binary, then normalise to the form 1.xxx × 2^k.`,
      `Here the unbiased exponent k = ${e - 127}.`,
      `Stored exponent = k + bias = ${e - 127} + 127 = ${e} = ${exp}`,
      `Mantissa is everything after the leading 1 (which is not stored), padded to 23 bits: ${mant}`,
      `Full 32-bit pattern: ${bits}  (0x${parseInt(bits, 2).toString(16).toUpperCase().padStart(8, "0")})`,
    ],
    hint: "Normalise first, then bias the exponent by 127, then drop the leading 1.",
  };
}

/* ---------------------------------------------------------------- registry */

export const GENERATORS: { week: number; label: string; gen: () => Question }[] = [
  { week: 1, label: "Base conversion", gen: qBaseConvert },
  { week: 1, label: "Codes (BCD, Gray, ASCII, parity)", gen: qCodes },
  { week: 1, label: "Evaluating a Boolean expression", gen: qTruthValue },
  { week: 1, label: "DeMorgan’s theorem", gen: qDeMorgan },
  { week: 1, label: "Boolean simplification", gen: qSimplify },
  { week: 2, label: "Full adder", gen: qFullAdder },
  { week: 2, label: "Signed representations", gen: qTwosRep },
  { week: 3, label: "2’s complement add/subtract + overflow", gen: qTwosArith },
  { week: 3, label: "BCD addition", gen: qBcdAdd },
  { week: 4, label: "Minterms and maxterms", gen: qMinterm },
  { week: 4, label: "K-map simplification", gen: qKmap },
  { week: 5, label: "CMOS circuit analysis", gen: qCmos },
  { week: 6, label: "Noise margin", gen: qNoiseMargin },
  { week: 6, label: "Fan-out", gen: qFanout },
  { week: 6, label: "Power dissipation", gen: qPower },
  { week: 6, label: "Propagation delay", gen: qDelay },
  { week: 6, label: "IEEE-754 floating point", gen: qFloat },
];

export function generateSet(weeks: number[], count: number): Question[] {
  const pool = GENERATORS.filter((g) => weeks.length === 0 || weeks.includes(g.week));
  if (pool.length === 0) return [];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length].gen()).sort(() => Math.random() - 0.5);
}
