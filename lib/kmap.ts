// ---------------------------------------------------------------------------
// Quine-McCluskey minimiser. Used both by the K-map solver (for the groups it
// draws) and by the truth-table tool (for the "simplified" answer it prints).
// A term is stored as a string of '0' | '1' | '-' , one character per variable.
// ---------------------------------------------------------------------------

export type Term = { bits: string; covers: number[] };

const ones = (b: string) => [...b].filter((c) => c === "1").length;

function combine(a: string, b: string): string | null {
  let diff = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      if (a[i] === "-" || b[i] === "-") return null;
      if (diff !== -1) return null;
      diff = i;
    }
  }
  if (diff === -1) return null;
  return a.slice(0, diff) + "-" + a.slice(diff + 1);
}

function primeImplicants(minterms: number[], dontCares: number[], n: number): Term[] {
  const all = [...new Set([...minterms, ...dontCares])].sort((x, y) => x - y);
  if (all.length === 0) return [];
  let current: Term[] = all.map((m) => ({ bits: m.toString(2).padStart(n, "0"), covers: [m] }));
  const primes: Term[] = [];
  const seen = new Set<string>();

  while (current.length) {
    const used = new Array(current.length).fill(false);
    const next = new Map<string, Term>();
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        if (Math.abs(ones(current[i].bits) - ones(current[j].bits)) > 1) continue;
        const c = combine(current[i].bits, current[j].bits);
        if (c) {
          used[i] = used[j] = true;
          const covers = [...new Set([...current[i].covers, ...current[j].covers])].sort((x, y) => x - y);
          next.set(c, { bits: c, covers });
        }
      }
    }
    current.forEach((t, i) => {
      if (!used[i] && !seen.has(t.bits)) { seen.add(t.bits); primes.push(t); }
    });
    current = [...next.values()];
  }
  return primes;
}

/** Pick a minimal cover: essential prime implicants first, then a greedy pass. */
function selectCover(primes: Term[], minterms: number[]): Term[] {
  const need = new Set(minterms);
  const chosen: Term[] = [];

  // essential prime implicants
  for (const m of minterms) {
    const covering = primes.filter((p) => p.covers.includes(m));
    if (covering.length === 1 && !chosen.includes(covering[0])) {
      chosen.push(covering[0]);
      covering[0].covers.forEach((c) => need.delete(c));
    }
  }
  // greedy for whatever is left: take the implicant covering the most remaining
  while (need.size) {
    let best: Term | null = null;
    let bestScore = -1;
    for (const p of primes) {
      if (chosen.includes(p)) continue;
      const score = p.covers.filter((c) => need.has(c)).length;
      // tie-break toward the physically larger group (fewer literals)
      if (score > bestScore || (score === bestScore && best && p.covers.length > best.covers.length)) {
        best = p; bestScore = score;
      }
    }
    if (!best || bestScore <= 0) break;
    chosen.push(best);
    best.covers.forEach((c) => need.delete(c));
  }
  return chosen;
}

export function termToSop(bits: string, vars: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") parts.push(vars[i]);
    else if (bits[i] === "0") parts.push(vars[i] + "'");
  }
  return parts.length ? parts.join("") : "1";
}

export function termToPos(bits: string, vars: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < bits.length; i++) {
    // maxterm convention is inverted relative to a minterm
    if (bits[i] === "0") parts.push(vars[i]);
    else if (bits[i] === "1") parts.push(vars[i] + "'");
  }
  return parts.length ? "(" + parts.join(" + ") + ")" : "0";
}

export type MinResult = {
  groups: Term[];
  expression: string;
  literals: number;
  gateInputs: number;
};

/** Minimal sum-of-products for the given minterms (+ optional don't cares). */
export function minimizeSOP(minterms: number[], dontCares: number[], n: number, vars: string[]): MinResult {
  const total = 1 << n;
  if (minterms.length === 0) return { groups: [], expression: "0", literals: 0, gateInputs: 0 };
  if (minterms.length + dontCares.length === total && minterms.length > 0) {
    const allOnes = minterms.length === total || [...Array(total).keys()].every((i) => minterms.includes(i) || dontCares.includes(i));
    if (allOnes && minterms.length + dontCares.length === total) {
      return { groups: [{ bits: "-".repeat(n), covers: [...Array(total).keys()] }], expression: "1", literals: 0, gateInputs: 0 };
    }
  }
  const primes = primeImplicants(minterms, dontCares, n);
  const cover = selectCover(primes, minterms);
  const expr = cover.map((t) => termToSop(t.bits, vars)).join(" + ") || "0";
  const literals = cover.reduce((s, t) => s + [...t.bits].filter((c) => c !== "-").length, 0);
  return { groups: cover, expression: expr, literals, gateInputs: literals + (cover.length > 1 ? cover.length : 0) };
}

/** Minimal product-of-sums: minimise the zeros, then invert with DeMorgan. */
export function minimizePOS(minterms: number[], dontCares: number[], n: number, vars: string[]): MinResult {
  const total = 1 << n;
  const zeros: number[] = [];
  for (let i = 0; i < total; i++) if (!minterms.includes(i) && !dontCares.includes(i)) zeros.push(i);
  if (zeros.length === 0) return { groups: [], expression: "1", literals: 0, gateInputs: 0 };
  const primes = primeImplicants(zeros, dontCares, n);
  const cover = selectCover(primes, zeros);
  const expr = cover.map((t) => termToPos(t.bits, vars)).join(" ") || "1";
  const literals = cover.reduce((s, t) => s + [...t.bits].filter((c) => c !== "-").length, 0);
  return { groups: cover, expression: expr, literals, gateInputs: literals + (cover.length > 1 ? cover.length : 0) };
}

// --- K-map geometry ---------------------------------------------------------
// Gray-code ordering is what makes neighbouring cells differ by exactly one bit.
export const GRAY = (n: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < 1 << n; i++) out.push(i ^ (i >> 1));
  return out;
};

/** Layout for a K-map: which minterm sits in each (row, col) cell. */
export function kmapLayout(n: number) {
  const colBits = n <= 2 ? 1 : 2;
  const rowBits = n - colBits;
  const rows = GRAY(rowBits);
  const cols = GRAY(colBits);
  const cells: number[][] = rows.map((r) => cols.map((c) => (r << colBits) | c));
  return { rows, cols, cells, rowBits, colBits };
}
