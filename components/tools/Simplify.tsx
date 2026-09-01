"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel, Seg, Label, Result, Callout, Table, Chip, NumberStepper, Bit, Field } from "@/components/UI";
import { minimizeSOP, minimizePOS, kmapLayout, termToSop, termToPos, Term } from "@/lib/kmap";
import { parse, varsOf, truthTable } from "@/lib/boolean";

const VARNAMES = ["A", "B", "C", "D", "E"];
const GROUP_COLORS = ["#60a5fa", "#4ade80", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee", "#fb923c", "#ec4899"];

/* ========================================================================== */
/* Karnaugh map solver                                                        */
/* ========================================================================== */

type CellVal = 0 | 1 | "x";

export function KmapSolver() {
  const params = useSearchParams();
  const [n, setN] = useState(4);
  const [cells, setCells] = useState<CellVal[]>(Array(16).fill(0));
  const [form, setForm] = useState<"sop" | "pos">("sop");
  const [exprIn, setExprIn] = useState("");
  const [exprErr, setExprErr] = useState<string | null>(null);

  // Deep-link from the truth-table tool: /tools/kmap?m=1,3,5&n=4
  useEffect(() => {
    const m = params.get("m");
    const nv = params.get("n");
    if (nv) {
      const k = Math.max(2, Math.min(5, parseInt(nv, 10) || 4));
      setN(k);
      const arr: CellVal[] = Array(1 << k).fill(0);
      if (m) m.split(",").map(Number).filter((x) => !isNaN(x) && x < (1 << k)).forEach((i) => (arr[i] = 1));
      setCells(arr);
    }
  }, [params]);

  const resize = (k: number) => {
    setN(k);
    setCells((prev) => {
      const arr: CellVal[] = Array(1 << k).fill(0);
      for (let i = 0; i < Math.min(prev.length, arr.length); i++) arr[i] = prev[i];
      return arr;
    });
  };

  const vars = VARNAMES.slice(0, n);
  const minterms = cells.map((c, i) => (c === 1 ? i : -1)).filter((i) => i >= 0);
  const dontCares = cells.map((c, i) => (c === "x" ? i : -1)).filter((i) => i >= 0);
  const zeros = cells.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);

  const sop = useMemo(() => minimizeSOP(minterms, dontCares, n, vars), [cells, n]);
  const pos = useMemo(() => minimizePOS(minterms, dontCares, n, vars), [cells, n]);
  const active = form === "sop" ? sop : pos;

  const loadExpr = () => {
    try {
      const node = parse(exprIn);
      const vs = varsOf(node);
      if (vs.length < 2 || vs.length > 5) throw new Error("Use 2 to 5 variables.");
      const rows = truthTable(node, vs);
      setN(vs.length);
      setCells(rows.map((r) => r.out as CellVal));
      setExprErr(null);
    } catch (e: any) { setExprErr(e.message); }
  };

  const cycle = (i: number) =>
    setCells(cells.map((c, j) => (i === j ? (c === 0 ? 1 : c === 1 ? "x" : 0) : c)));

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Why a K-map works at all">
        The rows and columns are labelled in <strong>Gray code</strong>, so any two neighbouring squares differ in
        exactly one variable. Two adjacent 1s therefore mean &ldquo;that variable doesn’t matter here&rdquo; — which is the
        theorem <code>AB + AB′ = A</code> made visual. Circling a group of 2ⁿ cells eliminates n variables.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <NumberStepper label="Variables" value={n} onChange={resize} min={2} max={5} />
          <div>
            <Label>Answer form</Label>
            <Seg options={[{ v: "sop" as const, label: "Minimal SOP (circle the 1s)" }, { v: "pos" as const, label: "Minimal POS (circle the 0s)" }]} value={form} onChange={setForm} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCells(Array(1 << n).fill(0))} className="px-3 py-2 text-sm rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">Clear</button>
            <button onClick={() => setCells(Array(1 << n).fill(0).map(() => (Math.random() < 0.45 ? 1 : Math.random() < 0.1 ? "x" : 0) as CellVal))} className="px-3 py-2 text-sm rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">Random</button>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-[var(--color-line-soft)] flex flex-wrap gap-3 items-end">
          <Field label="…or load from an expression" value={exprIn} onChange={setExprIn} placeholder="e.g. A'B + BCD' + AC" className="flex-1 min-w-[220px]" />
          <button onClick={loadExpr} className="px-4 py-2.5 text-sm rounded-lg bg-[var(--color-accent)] text-[#06111f] font-semibold">Load</button>
        </div>
        {exprErr && <div className="mt-2 text-sm text-[var(--color-bad)]">{exprErr}</div>}
        <div className="mt-3 text-xs text-[var(--color-ink-faint)]">
          Click a cell to cycle it: <span className="text-[var(--color-ink-faint)]">0</span> →{" "}
          <span className="text-[var(--color-hi)]">1</span> → <span className="text-[var(--color-warn)]">X (don’t care)</span> → 0
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">
          The map — {form === "sop" ? "grouping the 1s" : "grouping the 0s"}
        </h3>
        {n <= 4 ? (
          <KmapGrid n={n} cells={cells} onCycle={cycle} groups={active.groups} vars={vars} form={form} />
        ) : (
          <div className="space-y-6">
            {[0, 1].map((half) => (
              <div key={half}>
                <div className="text-sm font-mono mb-2 text-[var(--color-accent)]">{vars[0]} = {half}</div>
                <KmapGrid n={4} cells={cells.slice(half * 16, half * 16 + 16)} onCycle={(i) => cycle(half * 16 + i)}
                  groups={active.groups.filter((g) => g.bits[0] === "-" || g.bits[0] === String(half)).map((g) => ({ ...g, bits: g.bits.slice(1), covers: g.covers.filter((c) => (c >= 16) === (half === 1)).map((c) => c % 16) }))}
                  vars={vars.slice(1)} form={form} offset={half * 16} />
              </div>
            ))}
            <p className="text-sm text-[var(--color-ink-dim)]">
              A 5-variable map is two 4-variable maps stacked. Cells in the <em>same position</em> on the two maps are
              also adjacent — a group appearing identically on both halves means {vars[0]} was eliminated.
            </p>
          </div>
        )}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-3">The groups it found</h3>
          {active.groups.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-dim)]">Nothing to group — set some cells to {form === "sop" ? "1" : "0"}.</p>
          ) : (
            <div className="space-y-2">
              {active.groups.map((g, i) => {
                const size = g.covers.length;
                const eliminated = vars.filter((_, j) => g.bits[j] === "-");
                return (
                  <div key={i} className="rounded-lg border p-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"
                    style={{ borderColor: GROUP_COLORS[i % GROUP_COLORS.length] + "88", background: GROUP_COLORS[i % GROUP_COLORS.length] + "0d" }}>
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }} />
                    <span className="font-mono text-sm font-bold" style={{ color: GROUP_COLORS[i % GROUP_COLORS.length] }}>
                      {form === "sop" ? termToSop(g.bits, vars) : termToPos(g.bits, vars)}
                    </span>
                    <span className="text-xs text-[var(--color-ink-faint)]">group of {size}</span>
                    <span className="text-xs text-[var(--color-ink-faint)]">
                      covers {form === "sop" ? "m" : "M"}({g.covers.join(", ")})
                    </span>
                    {eliminated.length > 0 && (
                      <span className="text-xs text-[var(--color-ink-dim)] w-full">
                        eliminates {eliminated.join(", ")} — {eliminated.length === 1 ? "that variable" : "those variables"} take{eliminated.length === 1 ? "s" : ""} both values inside the group
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h3 className="font-bold mb-3">Answers</h3>
            <div className="space-y-3">
              <Result label="Minimal SOP" value={sop.expression} sub={`${sop.literals} literals · ${sop.groups.length} product term(s)`} tone={form === "sop" ? "good" : undefined} />
              <Result label="Minimal POS" value={pos.expression} sub={`${pos.literals} literals · ${pos.groups.length} sum term(s)`} tone={form === "pos" ? "accent" : undefined} />
            </div>
            <div className="mt-4 font-mono text-[13px] text-[var(--color-ink-dim)] space-y-1">
              <div>Σm({minterms.join(", ") || "—"}){dontCares.length ? ` + Σd(${dontCares.join(", ")})` : ""}</div>
              <div>ΠM({zeros.join(", ") || "—"}){dontCares.length ? ` · Πd(${dontCares.join(", ")})` : ""}</div>
            </div>
          </Panel>

          <Panel>
            <h3 className="font-bold mb-2">Cost comparison</h3>
            <Table
              head={["Form", "Terms", "Literals", "Gate inputs*"]}
              rows={[
                ["Canonical SOP", minterms.length, minterms.length * n, minterms.length * n + minterms.length],
                ["Minimal SOP", sop.groups.length, sop.literals, sop.gateInputs],
                ["Minimal POS", pos.groups.length, pos.literals, pos.gateInputs],
              ]}
              highlight={(i) => i === (form === "sop" ? 1 : 2)}
            />
            <p className="text-[11px] text-[var(--color-ink-faint)] mt-2">
              *Rough cost measure used in SC1005: total inputs across all gates. Fewer is cheaper and usually faster.
            </p>
          </Panel>
        </div>
      </div>

      <Panel>
        <h3 className="font-bold mb-3">The grouping rules, in order of priority</h3>
        <ol className="space-y-2.5 text-sm text-[var(--color-ink-dim)] list-decimal pl-5">
          <li>Groups must contain a number of cells that is a <strong>power of two</strong>: 1, 2, 4, 8, 16. Never 3, never 6.</li>
          <li>Groups must be <strong>rectangles</strong> (including 1×2, 2×4, whole rows, whole columns). No L-shapes, no diagonals.</li>
          <li>Make every group <strong>as large as possible</strong>. A bigger group means fewer literals in that term.</li>
          <li>The map <strong>wraps around</strong>: left edge touches right edge, top touches bottom, and the four corners are all mutually adjacent.</li>
          <li>Groups <strong>may overlap</strong>. Reusing a 1 costs nothing.</li>
          <li>Use the <strong>fewest groups</strong> that still covers every 1. Stop as soon as all 1s are covered.</li>
          <li><strong>Don’t-cares (X)</strong> may be included if they let you make a group bigger, and ignored otherwise. You are never obliged to cover an X.</li>
        </ol>
        <Callout kind="warn" title="The three K-map mistakes examiners look for">
          <ul className="list-disc pl-5 space-y-1">
            <li>Forgetting the wrap-around, so you write two groups of 2 where one group of 4 exists.</li>
            <li>Adding a redundant group that is entirely covered by others. Every group must contain at least one 1 that <em>no other group</em> covers (that is what makes it essential).</li>
            <li>For POS: forgetting to <strong>invert</strong> the variables. In a maxterm, a cell value of 0 means the variable appears plain, and 1 means complemented — the opposite of SOP.</li>
          </ul>
        </Callout>
      </Panel>
    </div>
  );
}

function KmapGrid({ n, cells, onCycle, groups, vars, form, offset = 0 }:
  { n: number; cells: CellVal[]; onCycle: (i: number) => void; groups: Term[]; vars: string[]; form: "sop" | "pos"; offset?: number }) {
  const { rows, cols, cells: layout, colBits, rowBits } = kmapLayout(n);
  const rowVars = vars.slice(0, rowBits).join("");
  const colVars = vars.slice(rowBits).join("");
  const SZ = 62, GAP = 4;
  const gw = cols.length * SZ + (cols.length - 1) * GAP;
  const gh = rows.length * SZ + (rows.length - 1) * GAP;

  // For each group, work out which (row,col) cells it occupies, then split into
  // cyclically-contiguous rectangles so wrap-around groups draw as two boxes.
  const rects: { x: number; y: number; w: number; h: number; color: string }[] = [];
  groups.forEach((g, gi) => {
    const color = GROUP_COLORS[gi % GROUP_COLORS.length];
    const set = new Set(g.covers);
    const rIdx: number[] = [], cIdx: number[] = [];
    rows.forEach((_, r) => { if (layout[r].some((m) => set.has(m))) rIdx.push(r); });
    cols.forEach((_, c) => { if (rows.some((_, r) => set.has(layout[r][c]))) cIdx.push(c); });
    const runs = (idx: number[], total: number) => {
      if (idx.length === total) return [[0, total - 1] as [number, number]];
      const out: [number, number][] = [];
      let start = idx[0], prev = idx[0];
      for (let i = 1; i < idx.length; i++) {
        if (idx[i] === prev + 1) prev = idx[i];
        else { out.push([start, prev]); start = idx[i]; prev = idx[i]; }
      }
      out.push([start, prev]);
      // merge a run touching the last index with one starting at 0 (wrap)
      if (out.length > 1 && out[0][0] === 0 && out[out.length - 1][1] === total - 1) return out;
      return out;
    };
    const rr = runs(rIdx, rows.length), cc = runs(cIdx, cols.length);
    rr.forEach(([r0, r1]) => cc.forEach(([c0, c1]) => {
      rects.push({
        x: c0 * (SZ + GAP), y: r0 * (SZ + GAP),
        w: (c1 - c0 + 1) * SZ + (c1 - c0) * GAP,
        h: (r1 - r0 + 1) * SZ + (r1 - r0) * GAP,
        color,
      });
    }));
  });

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-max">
        <div className="flex">
          <div className="w-16 shrink-0" />
          <div>
            <div className="text-[11px] font-mono text-[var(--color-accent)] mb-1.5 pl-1">{colVars} →</div>
            <div className="flex gap-1 mb-1" style={{ width: gw }}>
              {cols.map((c) => (
                <div key={c} className="text-center text-[11px] font-mono text-[var(--color-ink-faint)]" style={{ width: SZ }}>
                  {c.toString(2).padStart(colBits, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-16 shrink-0 pr-2">
            <div className="text-[11px] font-mono text-[var(--color-accent)] mb-1.5 text-right">{rowVars} ↓</div>
            <div className="flex flex-col gap-1">
              {rows.map((r) => (
                <div key={r} className="text-right text-[11px] font-mono text-[var(--color-ink-faint)] grid items-center" style={{ height: SZ }}>
                  {r.toString(2).padStart(rowBits, "0")}
                </div>
              ))}
            </div>
          </div>

          <div className="relative" style={{ width: gw, height: gh }}>
            <div className="grid gap-1 absolute inset-0" style={{ gridTemplateColumns: `repeat(${cols.length}, ${SZ}px)` }}>
              {rows.map((r, ri) =>
                cols.map((c, ci) => {
                  const m = layout[ri][ci];
                  const v = cells[m];
                  return (
                    <button key={`${ri}-${ci}`} onClick={() => onCycle(m)}
                      className={`rounded-lg border font-mono font-bold text-xl grid place-items-center relative transition
                        ${v === 1 ? "bg-[#10301f] border-[var(--color-hi)] text-[var(--color-hi)]"
                          : v === "x" ? "bg-[#2a2416] border-[var(--color-warn)] text-[var(--color-warn)]"
                          : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-faint)]"}
                        hover:brightness-125`}
                      style={{ width: SZ, height: SZ }}>
                      {v === "x" ? "X" : v}
                      <span className="absolute top-1 left-1.5 text-[9px] font-normal text-[var(--color-ink-faint)]">{m + offset}</span>
                    </button>
                  );
                })
              )}
            </div>
            {/* group outlines drawn on top */}
            <svg className="absolute inset-0 pointer-events-none" width={gw} height={gh}>
              {rects.map((r, i) => (
                <rect key={i} x={r.x + 3} y={r.y + 3} width={r.w - 6} height={r.h - 6} rx="10"
                  fill={r.color + "18"} stroke={r.color} strokeWidth="2.5" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* PLA builder                                                                */
/* ========================================================================== */

type PlaTerm = ("0" | "1" | "-")[];

export function PlaBuilder() {
  const [nIn, setNIn] = useState(3);
  const [nOut, setNOut] = useState(2);
  const [nTerms, setNTerms] = useState(4);
  const [terms, setTerms] = useState<PlaTerm[]>([
    ["1", "-", "0"], ["-", "1", "1"], ["0", "0", "-"], ["1", "1", "1"],
  ]);
  const [orPlane, setOrPlane] = useState<boolean[][]>([[true, false, true, false], [false, true, false, true]]);
  const [inputs, setInputs] = useState<(0 | 1)[]>([1, 0, 0]);

  const fit = <T,>(arr: T[], len: number, fill: () => T) => {
    const out = arr.slice(0, len);
    while (out.length < len) out.push(fill());
    return out;
  };
  const T = fit(terms, nTerms, () => Array(nIn).fill("-") as PlaTerm).map((t) => fit(t, nIn, () => "-" as const));
  const O = fit(orPlane, nOut, () => Array(nTerms).fill(false)).map((r) => fit(r, nTerms, () => false));
  const IN = fit(inputs, nIn, () => 0 as 0 | 1);

  const vars = VARNAMES.slice(0, nIn);
  const termActive = T.map((t) => t.every((c, i) => c === "-" || Number(c) === IN[i]));
  const outputs = O.map((row) => (row.some((used, j) => used && termActive[j]) ? 1 : 0));

  const cycleCell = (ti: number, ci: number) =>
    setTerms(T.map((t, i) => (i === ti ? t.map((c, j) => (j === ci ? (c === "-" ? "1" : c === "1" ? "0" : "-") : c)) as PlaTerm : t)));

  return (
    <div className="space-y-5">
      <Callout kind="key" title="What a PLA is">
        A chip full of unconnected AND gates feeding unconnected OR gates. You &ldquo;program&rdquo; it by deciding which
        connections exist. Since <strong>any</strong> function can be written as a sum of products, an AND plane
        followed by an OR plane can implement anything — you just choose the wiring instead of choosing the chips.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <NumberStepper label="Inputs" value={nIn} onChange={(v) => { setNIn(v); setInputs((p) => fit(p, v, () => 0 as 0 | 1)); }} min={2} max={4} />
          <NumberStepper label="Product terms" value={nTerms} onChange={setNTerms} min={2} max={6} />
          <NumberStepper label="Outputs" value={nOut} onChange={setNOut} min={1} max={3} />
          <div>
            <Label>Test inputs</Label>
            <div className="flex gap-1.5">
              {IN.map((b, i) => (
                <div key={i} className="text-center">
                  <div className="text-[10px] font-mono text-[var(--color-ink-faint)] mb-1">{vars[i]}</div>
                  <Bit v={b} onClick={() => setInputs(IN.map((x, j) => (i === j ? ((x ^ 1) as 0 | 1) : x)))} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">AND plane — define each product term</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          Click a cell to cycle: <span className="text-[var(--color-ink-faint)]">–</span> (variable not used) →{" "}
          <span className="text-[var(--color-hi)]">1</span> (use it plain) → <span className="text-[var(--color-bad)]">0</span> (use it complemented).
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)] pr-4 pb-2">Term</th>
                {vars.map((v) => <th key={v} className="px-2 pb-2 font-mono text-[var(--color-accent)]">{v}</th>)}
                <th className="pl-5 pb-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">Product</th>
                <th className="pl-4 pb-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">Now</th>
              </tr>
            </thead>
            <tbody>
              {T.map((t, ti) => (
                <tr key={ti}>
                  <td className="pr-4 font-mono text-xs text-[var(--color-ink-faint)]">P{ti}</td>
                  {t.map((c, ci) => (
                    <td key={ci} className="px-1 py-1">
                      <button onClick={() => cycleCell(ti, ci)}
                        className={`w-10 h-10 rounded-md border font-mono font-bold transition hover:brightness-125
                          ${c === "1" ? "bg-[#10301f] border-[var(--color-hi)] text-[var(--color-hi)]"
                            : c === "0" ? "bg-[#301616] border-[var(--color-bad)] text-[var(--color-bad)]"
                            : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-faint)]"}`}>
                        {c === "-" ? "–" : c}
                      </button>
                    </td>
                  ))}
                  <td className="pl-5 font-mono text-sm">{termToSop(t.join(""), vars)}</td>
                  <td className="pl-4"><Chip tone={termActive[ti] ? "good" : "n"}>{termActive[ti] ? 1 : 0}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">OR plane — pick which products feed each output</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">Click to connect or disconnect.</p>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="text-left pr-4 pb-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">Output</th>
                {T.map((_, ti) => <th key={ti} className="px-1 pb-2 font-mono text-xs text-[var(--color-ink-faint)]">P{ti}</th>)}
                <th className="pl-5 pb-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">Equation</th>
                <th className="pl-4 pb-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">Now</th>
              </tr>
            </thead>
            <tbody>
              {O.map((row, oi) => (
                <tr key={oi}>
                  <td className="pr-4 font-mono text-sm text-[var(--color-accent-2)]">F{oi}</td>
                  {row.map((on, ti) => (
                    <td key={ti} className="px-1 py-1">
                      <button onClick={() => setOrPlane(O.map((r, i) => (i === oi ? r.map((x, j) => (j === ti ? !x : x)) : r)))}
                        className={`w-10 h-10 rounded-md border grid place-items-center transition hover:brightness-125
                          ${on ? (termActive[ti] ? "bg-[#12304a] border-[var(--color-accent)] text-[var(--color-accent)]" : "bg-[#1a2130] border-[var(--color-line)] text-[var(--color-ink-dim)]") : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-faint)]"}`}>
                        {on ? "●" : "○"}
                      </button>
                    </td>
                  ))}
                  <td className="pl-5 font-mono text-sm">
                    F{oi} = {row.map((on, ti) => (on ? termToSop(T[ti].join(""), vars) : null)).filter(Boolean).join(" + ") || "0"}
                  </td>
                  <td className="pl-4"><Chip tone={outputs[oi] ? "good" : "n"}>{outputs[oi]}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">Full truth table of what you programmed</h3>
        <Table
          head={[...vars, ...O.map((_, i) => `F${i}`)]}
          rows={Array.from({ length: 1 << nIn }, (_, i) => {
            const bits = Array.from({ length: nIn }, (_, j) => ((i >> (nIn - 1 - j)) & 1) as 0 | 1);
            const act = T.map((t) => t.every((c, k) => c === "-" || Number(c) === bits[k]));
            return [...bits, ...O.map((row, oi) => {
              const v = row.some((used, j) => used && act[j]) ? 1 : 0;
              return <span key={`o${oi}`} className={v ? "text-[var(--color-hi)] font-bold" : "text-[var(--color-ink-faint)]"}>{v}</span>;
            })];
          })}
          highlight={(i) => i === IN.reduce<number>((acc, b, j) => acc | (b << (nIn - 1 - j)), 0)}
        />
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">PLA vs PAL vs ROM</h3>
        <Table
          head={["Device", "AND plane", "OR plane", "Trade-off"]}
          rows={[
            ["PROM / ROM", "fixed (a full decoder — all 2ⁿ minterms)", "programmable", "Simplest to think about, but the AND plane doubles in size with every extra input."],
            ["PLA", "programmable", "programmable", "The most flexible. Both planes cost you, so it is the slowest and priciest."],
            ["PAL", "programmable", "fixed (each output gets a fixed set of terms)", "Cheaper and faster than a PLA. You lose the ability to share a product term between outputs."],
          ]}
        />
        <p className="text-sm text-[var(--color-ink-dim)] mt-4">
          Note what a ROM really is: address lines in, data out. That is a truth table stored in silicon —
          any n-input, m-output combinational function at all, with no logic minimisation needed. Simplification
          only saves you money on the PLA/PAL side.
        </p>
      </Panel>
    </div>
  );
}
