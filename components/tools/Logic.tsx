"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Panel, Field, Seg, Label, Result, Callout, Table, Chip, Bit } from "@/components/UI";
import { GateSymbol, IEEESymbol, GATE_INFO, evalGate, GateKind } from "@/components/Gates";
import { parse, varsOf, truthTable, toStringExpr, evaluate, Node } from "@/lib/boolean";
import { minimizeSOP, minimizePOS, termToSop, termToPos } from "@/lib/kmap";

const ALL_GATES: GateKind[] = ["AND", "OR", "NOT", "BUF", "NAND", "NOR", "XOR", "XNOR"];

/* ========================================================================== */
/* Gate lab                                                                   */
/* ========================================================================== */

export function GateLab() {
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);
  const [style, setStyle] = useState<"ansi" | "ieee">("ansi");

  return (
    <div className="space-y-5">
      <Callout kind="tip">
        A gate is a tiny machine with a fixed opinion. It looks at its inputs and, with no memory of anything that
        happened before, produces one output. Everything else in this course is gates wired together.
      </Callout>

      <Panel>
        <div className="flex flex-wrap items-end gap-8">
          <div>
            <Label>Set the inputs — click them</Label>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-[var(--color-ink-faint)] mb-1.5 font-mono">A</div>
                <Bit v={a} size="lg" onClick={() => setA((a ^ 1) as 0 | 1)} />
              </div>
              <div className="text-center">
                <div className="text-xs text-[var(--color-ink-faint)] mb-1.5 font-mono">B</div>
                <Bit v={b} size="lg" onClick={() => setB((b ^ 1) as 0 | 1)} />
              </div>
            </div>
          </div>
          <div>
            <Label>Symbol style</Label>
            <Seg options={[{ v: "ansi" as const, label: "Distinctive shape" }, { v: "ieee" as const, label: "IEEE rectangular" }]} value={style} onChange={setStyle} />
          </div>
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 gap-4">
        {ALL_GATES.map((g) => {
          const info = GATE_INFO[g];
          const single = g === "NOT" || g === "BUF";
          const out = evalGate(g, a, single ? a : b);
          return (
            <Panel key={g}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{info.name}</h3>
                    <Chip tone={out ? "good" : "n"}>output = {out}</Chip>
                  </div>
                  <div className="font-mono text-sm text-[var(--color-accent)] mt-1">{info.expr}</div>
                </div>
              </div>
              <p className="text-sm text-[var(--color-ink-dim)] mt-2 leading-relaxed">{info.plain}</p>
              <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="pt-1">
                  {style === "ansi"
                    ? <GateSymbol kind={g} inputs={single ? [a] : [a, b]} output={out} labels={single ? ["A"] : ["A", "B"]} />
                    : <IEEESymbol kind={g} />}
                </div>
                <div className="shrink-0">
                  <MiniTruth kind={g} a={a} b={b} />
                </div>
              </div>
              <div className="mt-3 text-xs text-[var(--color-ink-faint)] border-t border-[var(--color-line-soft)] pt-2.5">
                <strong className="text-[var(--color-ink-dim)]">Shortcut:</strong> {info.rule}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel>
        <h3 className="font-bold mb-3">Reading a gate symbol</h3>
        <div className="grid sm:grid-cols-3 gap-5 text-sm text-[var(--color-ink-dim)]">
          <div>
            <div className="font-semibold text-[var(--color-ink)] mb-1">Shape = the function</div>
            Flat back with a round nose is AND. Curved back with a pointed nose is OR. A triangle is NOT/buffer.
            A second curved line at the back means XOR.
          </div>
          <div>
            <div className="font-semibold text-[var(--color-ink)] mb-1">Bubble = inversion</div>
            A small circle on the output means “then flip it”. AND + bubble = NAND. On an <em>input</em> it means
            “flip it before you use it”.
          </div>
          <div>
            <div className="font-semibold text-[var(--color-ink)] mb-1">IEEE style = the label tells you</div>
            <code>&amp;</code> is AND, <code>≥1</code> is OR (“at least one input is 1”), <code>=1</code> is XOR
            (“exactly one input is 1”), <code>1</code> in a box is a buffer.
          </div>
        </div>
      </Panel>
    </div>
  );
}

function MiniTruth({ kind, a, b }: { kind: GateKind; a: 0 | 1; b: 0 | 1 }) {
  const single = kind === "NOT" || kind === "BUF";
  const rows: (0 | 1)[][] = single ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return (
    <table className="text-[11px] font-mono border border-[var(--color-line)] rounded overflow-hidden">
      <thead>
        <tr className="bg-[#0d1219] text-[var(--color-ink-faint)]">
          {single ? <th className="px-2 py-1">A</th> : <><th className="px-2 py-1">A</th><th className="px-2 py-1">B</th></>}
          <th className="px-2 py-1 border-l border-[var(--color-line)]">Y</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const active = single ? r[0] === a : r[0] === a && r[1] === b;
          const y = evalGate(kind, r[0], single ? r[0] : r[1]);
          return (
            <tr key={i} className={active ? "bg-[rgba(96,165,250,0.16)]" : ""}>
              {r.map((v, j) => <td key={j} className="px-2 py-0.5 text-center text-[var(--color-ink-dim)]">{v}</td>)}
              <td className={`px-2 py-0.5 text-center font-bold border-l border-[var(--color-line)] ${y ? "text-[var(--color-hi)]" : "text-[var(--color-ink-faint)]"}`}>{y}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ========================================================================== */
/* Truth table builder                                                        */
/* ========================================================================== */

const EXAMPLES = [
  "A'B + AB'",
  "(A + B)(A' + C)",
  "A xor B xor C",
  "AB + BC + AC",
  "(AB)'",
  "A'B'C' + A'BC + AB'C + ABC'",
];

export function TruthTableTool() {
  const [src, setSrc] = useState("A'B + AB'");

  const analysis = useMemo(() => {
    try {
      const node = parse(src);
      const vars = varsOf(node);
      if (vars.length === 0) throw new Error("Add at least one variable (A, B, C …).");
      if (vars.length > 6) throw new Error("Six variables is the sensible limit for a hand-drawn table.");
      const rows = truthTable(node, vars);
      const minterms = rows.map((r, i) => (r.out ? i : -1)).filter((i) => i >= 0);
      const maxterms = rows.map((r, i) => (r.out ? -1 : i)).filter((i) => i >= 0);
      const sop = minimizeSOP(minterms, [], vars.length, vars);
      const pos = minimizePOS(minterms, [], vars.length, vars);
      return { node, vars, rows, minterms, maxterms, sop, pos, err: null as string | null };
    } catch (e: any) {
      return { err: e.message as string } as any;
    }
  }, [src]);

  const bad = !!analysis.err;

  return (
    <div className="space-y-5">
      <Panel>
        <Field label="Boolean expression" value={src} onChange={setSrc} error={bad} placeholder="A'B + AB'" />
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[var(--color-ink-faint)]">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => setSrc(e)} className="text-xs font-mono px-2 py-1 rounded border border-[var(--color-line)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition">{e}</button>
          ))}
        </div>
        <div className="mt-3 text-xs text-[var(--color-ink-faint)] leading-relaxed">
          Notation accepted — NOT: <code>A&apos;</code> <code>!A</code> <code>~A</code> · AND: <code>AB</code> <code>A·B</code> <code>A*B</code> ·
          OR: <code>A+B</code> <code>A|B</code> · XOR: <code>A^B</code> <code>A xor B</code>
        </div>
        {bad && <div className="mt-3 text-sm text-[var(--color-bad)]">{analysis.err}</div>}
      </Panel>

      {!bad && (
        <>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
            <Panel>
              <h3 className="font-bold mb-3">Truth table</h3>
              <div className="max-h-[460px] overflow-auto rounded-lg border border-[var(--color-line)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-[#0d1219]">
                      <th className="px-2.5 py-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)] border-b border-[var(--color-line)]">#</th>
                      {analysis.vars.map((v: string) => (
                        <th key={v} className="px-2.5 py-2 text-center font-mono text-[13px] border-b border-[var(--color-line)]">{v}</th>
                      ))}
                      <th className="px-2.5 py-2 text-center font-mono text-[13px] border-b border-l border-[var(--color-line)] text-[var(--color-accent)]">Y</th>
                      <th className="px-2.5 py-2 text-left text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)] border-b border-[var(--color-line)]">term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.rows.map((r: any, i: number) => (
                      <tr key={i} className={`border-b border-[var(--color-line-soft)] ${r.out ? "bg-[rgba(74,222,128,0.06)]" : ""}`}>
                        <td className="px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-ink-faint)]">{i}</td>
                        {r.bits.map((b: number, j: number) => (
                          <td key={j} className="px-2.5 py-1.5 text-center font-mono text-[13px] text-[var(--color-ink-dim)]">{b}</td>
                        ))}
                        <td className={`px-2.5 py-1.5 text-center font-mono text-[13px] font-bold border-l border-[var(--color-line)] ${r.out ? "text-[var(--color-hi)]" : "text-[var(--color-ink-faint)]"}`}>{r.out}</td>
                        <td className="px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-ink-faint)]">
                          {r.out ? `m${i} = ${termToSop(r.bits.join(""), analysis.vars)}` : `M${i} = ${termToPos(r.bits.join(""), analysis.vars)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="space-y-4">
              <Panel>
                <h3 className="font-bold mb-1">Canonical SOP (sum of minterms)</h3>
                <p className="text-xs text-[var(--color-ink-dim)] mb-3">
                  Take every row where Y = 1. Write an AND term that is true only for that row. OR them all together.
                </p>
                <div className="font-mono text-sm bg-[#0d1219] border border-[var(--color-line)] rounded-lg p-3 break-words">
                  Y = Σm({analysis.minterms.join(", ") || "—"})
                </div>
                <div className="font-mono text-[13px] mt-2 text-[var(--color-hi)] break-words leading-relaxed">
                  {analysis.minterms.length
                    ? analysis.minterms.map((m: number) => termToSop(m.toString(2).padStart(analysis.vars.length, "0"), analysis.vars)).join(" + ")
                    : "0"}
                </div>
              </Panel>

              <Panel>
                <h3 className="font-bold mb-1">Canonical POS (product of maxterms)</h3>
                <p className="text-xs text-[var(--color-ink-dim)] mb-3">
                  Take every row where Y = 0. Write an OR term that is false only for that row (invert each bit).
                  AND them all together.
                </p>
                <div className="font-mono text-sm bg-[#0d1219] border border-[var(--color-line)] rounded-lg p-3 break-words">
                  Y = ΠM({analysis.maxterms.join(", ") || "—"})
                </div>
                <div className="font-mono text-[13px] mt-2 text-[var(--color-accent)] break-words leading-relaxed">
                  {analysis.maxterms.length
                    ? analysis.maxterms.map((m: number) => termToPos(m.toString(2).padStart(analysis.vars.length, "0"), analysis.vars)).join(" · ")
                    : "1"}
                </div>
              </Panel>

              <Panel>
                <h3 className="font-bold mb-3">Minimal forms</h3>
                <div className="space-y-3">
                  <Result label="Minimal SOP (fewest literals)" value={analysis.sop.expression} sub={`${analysis.sop.literals} literals, ${analysis.sop.groups.length} product term(s)`} tone="good" />
                  <Result label="Minimal POS" value={analysis.pos.expression} sub={`${analysis.pos.literals} literals, ${analysis.pos.groups.length} sum term(s)`} tone="accent" />
                </div>
                <Link href={`/tools/kmap?m=${analysis.minterms.join(",")}&n=${analysis.vars.length}`}
                  className="inline-block mt-4 text-sm text-[var(--color-accent)] underline underline-offset-4">
                  Open these minterms in the K-map solver →
                </Link>
              </Panel>
            </div>
          </div>

          <Callout kind="key" title="The mechanical recipe (memorise this shape)">
            <p><strong>Truth table → SOP:</strong> for each 1-row, a variable that is 1 appears plain; a variable that is 0 appears complemented. AND them. Then OR all the rows.</p>
            <p><strong>Truth table → POS:</strong> for each 0-row, a variable that is 0 appears plain; a variable that is 1 appears complemented. OR them. Then AND all the rows.</p>
            <p>Notice POS is the exact mirror image. If you can remember one, you can derive the other.</p>
          </Callout>
        </>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Boolean laws                                                               */
/* ========================================================================== */

const LAWS: { group: string; items: { name: string; expr: string; note: string; check?: [string, string] }[] }[] = [
  {
    group: "Single-variable theorems",
    items: [
      { name: "T1", expr: "A · 0 = 0", note: "Anything ANDed with 0 dies." },
      { name: "T2", expr: "A · 1 = A", note: "1 is the identity for AND." },
      { name: "T3", expr: "A · A = A", note: "Idempotence — no such thing as “extra true”." },
      { name: "T4", expr: "A · A' = 0", note: "A thing and its opposite can’t both hold." },
      { name: "T5", expr: "A + 0 = A", note: "0 is the identity for OR." },
      { name: "T6", expr: "A + 1 = 1", note: "Anything ORed with 1 is swamped." },
      { name: "T7", expr: "A + A = A", note: "Idempotence again." },
      { name: "T8", expr: "A + A' = 1", note: "One of them must be true." },
      { name: "T9", expr: "(A')' = A", note: "Double negation cancels." },
    ],
  },
  {
    group: "Multi-variable theorems",
    items: [
      { name: "Commutative", expr: "A·B = B·A   and   A+B = B+A", note: "Order doesn’t matter.", check: ["AB", "BA"] },
      { name: "Associative", expr: "A(BC) = (AB)C", note: "Bracketing doesn’t matter for a chain of the same operator.", check: ["A(BC)", "(AB)C"] },
      { name: "Distributive", expr: "A(B + C) = AB + AC", note: "Same as ordinary algebra.", check: ["A(B+C)", "AB+AC"] },
      { name: "Distributive (the weird one)", expr: "A + BC = (A + B)(A + C)", note: "This one has NO arithmetic equivalent. It only works in Boolean algebra. Memorise it.", check: ["A+BC", "(A+B)(A+C)"] },
      { name: "Absorption", expr: "A + AB = A", note: "The AB term is already covered by A. Deleting terms like this is most of simplification.", check: ["A+AB", "A"] },
      { name: "Absorption (2)", expr: "A(A + B) = A", note: "The dual of the one above.", check: ["A(A+B)", "A"] },
      { name: "Adjacency", expr: "AB + AB' = A", note: "B is irrelevant — either way A is what decides. This is exactly what a K-map group of two is doing.", check: ["AB+AB'", "A"] },
      { name: "Simplification", expr: "A + A'B = A + B", note: "Trips everybody up. Verify it in the table.", check: ["A+A'B", "A+B"] },
      { name: "Consensus", expr: "AB + A'C + BC = AB + A'C", note: "The BC term is redundant — it is already covered by the other two.", check: ["AB+A'C+BC", "AB+A'C"] },
    ],
  },
  {
    group: "DeMorgan’s theorems — the most useful pair in the course",
    items: [
      { name: "DeMorgan 1", expr: "(A · B)' = A' + B'", note: "“NOT (both)” = “either one is not”.", check: ["(AB)'", "A'+B'"] },
      { name: "DeMorgan 2", expr: "(A + B)' = A' · B'", note: "“NOT (either)” = “neither one”.", check: ["(A+B)'", "A'B'"] },
    ],
  },
];

export function BooleanLaws() {
  return (
    <div className="space-y-5">
      <Callout kind="key" title="How to actually apply DeMorgan">
        <p>Three mechanical steps, every time:</p>
        <p>1. <strong>Break the bar</strong> over the expression. 2. <strong>Change the operator</strong> (· becomes +, + becomes ·).
        3. <strong>Complement each term</strong> underneath.</p>
        <p className="mt-2">“Break the line, change the sign.” That’s the whole thing.</p>
      </Callout>

      {LAWS.map((g) => (
        <Panel key={g.group}>
          <h3 className="font-bold mb-4">{g.group}</h3>
          <div className="space-y-3">
            {g.items.map((l) => <LawRow key={l.name + l.expr} law={l} />)}
          </div>
        </Panel>
      ))}

      <Panel>
        <h3 className="font-bold mb-1">Duality — a free second theorem for every one you learn</h3>
        <p className="text-sm text-[var(--color-ink-dim)]">
          Swap every <code className="font-mono">·</code> with <code className="font-mono">+</code>, and every
          <code className="font-mono"> 0</code> with <code className="font-mono">1</code>. If the original was true,
          the dual is true too. That is why the theorems above come in mirrored pairs — you only ever memorise half of them.
        </p>
        <div className="mt-4 font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 space-y-1.5 text-[var(--color-ink-dim)]">
          <div>A · 0 = 0 <span className="text-[var(--color-ink-faint)]">←dual→</span> A + 1 = 1</div>
          <div>A · 1 = A <span className="text-[var(--color-ink-faint)]">←dual→</span> A + 0 = A</div>
          <div>A + AB = A <span className="text-[var(--color-ink-faint)]">←dual→</span> A(A + B) = A</div>
        </div>
      </Panel>
    </div>
  );
}

function LawRow({ law }: { law: { name: string; expr: string; note: string; check?: [string, string] } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] overflow-hidden">
      <div className="p-3.5 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-2)] w-24 shrink-0">{law.name}</span>
        <span className="font-mono text-[15px] font-semibold">{law.expr}</span>
        {law.check && (
          <button onClick={() => setOpen(!open)} className="ml-auto text-xs text-[var(--color-accent)] underline underline-offset-2 shrink-0">
            {open ? "hide proof" : "prove it in a table"}
          </button>
        )}
      </div>
      <div className="px-3.5 pb-3.5 -mt-1 text-[13px] text-[var(--color-ink-dim)]">{law.note}</div>
      {open && law.check && <div className="border-t border-[var(--color-line)] p-3.5"><ProofTable left={law.check[0]} right={law.check[1]} /></div>}
    </div>
  );
}

function ProofTable({ left, right }: { left: string; right: string }) {
  try {
    const ln = parse(left), rn = parse(right);
    const vars = [...new Set([...varsOf(ln), ...varsOf(rn)])].sort();
    const rows = [];
    for (let i = 0; i < 1 << vars.length; i++) {
      const env: Record<string, 0 | 1> = {};
      const bits: number[] = [];
      vars.forEach((v, j) => { const b = ((i >> (vars.length - 1 - j)) & 1) as 0 | 1; env[v] = b; bits.push(b); });
      const l = evaluate(ln, env), r = evaluate(rn, env);
      rows.push([...bits,
        <span key="l" className={l ? "text-[var(--color-hi)] font-bold" : "text-[var(--color-ink-faint)]"}>{l}</span>,
        <span key="r" className={r ? "text-[var(--color-hi)] font-bold" : "text-[var(--color-ink-faint)]"}>{r}</span>,
        l === r ? <span key="e" className="text-[var(--color-hi)]">✓</span> : <span key="e" className="text-[var(--color-bad)]">✗</span>,
      ]);
    }
    return (
      <>
        <Table head={[...vars, left, right, "same?"]} rows={rows} />
        <div className="mt-2 text-xs text-[var(--color-hi)]">Both columns match on every row ⇒ the theorem holds.</div>
      </>
    );
  } catch { return <div className="text-sm text-[var(--color-bad)]">Could not parse.</div>; }
}

/* ========================================================================== */
/* Universal gates (NAND-only / NOR-only)                                     */
/* ========================================================================== */

type Build = { target: GateKind; steps: { label: string; expr: string; gates: { kind: GateKind; in: string[] }[] }[]; count: number; reason: string };

const NAND_BUILDS: Record<string, Build> = {
  NOT: { target: "NOT", count: 1, reason: "Tie both NAND inputs together: (A·A)' = A'.", steps: [{ label: "NOT A", expr: "A' = (A·A)'", gates: [{ kind: "NAND", in: ["A", "A"] }] }] },
  AND: { target: "AND", count: 2, reason: "NAND then invert. The second NAND acts as an inverter.", steps: [{ label: "NAND first", expr: "X = (A·B)'", gates: [{ kind: "NAND", in: ["A", "B"] }] }, { label: "Invert it", expr: "Y = (X·X)' = A·B", gates: [{ kind: "NAND", in: ["X", "X"] }] }] },
  OR: { target: "OR", count: 3, reason: "DeMorgan: A + B = (A'·B')'. Invert both inputs, then NAND them.", steps: [{ label: "Invert A", expr: "A' = (A·A)'", gates: [{ kind: "NAND", in: ["A", "A"] }] }, { label: "Invert B", expr: "B' = (B·B)'", gates: [{ kind: "NAND", in: ["B", "B"] }] }, { label: "NAND the two", expr: "Y = (A'·B')' = A + B", gates: [{ kind: "NAND", in: ["A'", "B'"] }] }] },
  NOR: { target: "NOR", count: 4, reason: "Build OR from 3 NANDs, then invert with a 4th.", steps: [{ label: "OR (3 NANDs)", expr: "X = A + B", gates: [{ kind: "NAND", in: ["A", "A"] }, { kind: "NAND", in: ["B", "B"] }, { kind: "NAND", in: ["A'", "B'"] }] }, { label: "Invert", expr: "Y = (X·X)' = (A+B)'", gates: [{ kind: "NAND", in: ["X", "X"] }] }] },
  XOR: { target: "XOR", count: 4, reason: "The classic 4-NAND XOR. Worth memorising as a shape.", steps: [{ label: "N1", expr: "X = (A·B)'", gates: [{ kind: "NAND", in: ["A", "B"] }] }, { label: "N2", expr: "P = (A·X)'", gates: [{ kind: "NAND", in: ["A", "X"] }] }, { label: "N3", expr: "Q = (B·X)'", gates: [{ kind: "NAND", in: ["B", "X"] }] }, { label: "N4", expr: "Y = (P·Q)' = A ⊕ B", gates: [{ kind: "NAND", in: ["P", "Q"] }] }] },
};

const NOR_BUILDS: Record<string, Build> = {
  NOT: { target: "NOT", count: 1, reason: "Tie both NOR inputs together: (A+A)' = A'.", steps: [{ label: "NOT A", expr: "A' = (A+A)'", gates: [{ kind: "NOR", in: ["A", "A"] }] }] },
  OR: { target: "OR", count: 2, reason: "NOR then invert.", steps: [{ label: "NOR first", expr: "X = (A+B)'", gates: [{ kind: "NOR", in: ["A", "B"] }] }, { label: "Invert it", expr: "Y = (X+X)' = A+B", gates: [{ kind: "NOR", in: ["X", "X"] }] }] },
  AND: { target: "AND", count: 3, reason: "DeMorgan: A·B = (A' + B')'. Invert both inputs, then NOR them.", steps: [{ label: "Invert A", expr: "A' = (A+A)'", gates: [{ kind: "NOR", in: ["A", "A"] }] }, { label: "Invert B", expr: "B' = (B+B)'", gates: [{ kind: "NOR", in: ["B", "B"] }] }, { label: "NOR the two", expr: "Y = (A'+B')' = A·B", gates: [{ kind: "NOR", in: ["A'", "B'"] }] }] },
  NAND: { target: "NAND", count: 4, reason: "Build AND from 3 NORs, then invert with a 4th.", steps: [{ label: "AND (3 NORs)", expr: "X = A·B", gates: [{ kind: "NOR", in: ["A", "A"] }, { kind: "NOR", in: ["B", "B"] }, { kind: "NOR", in: ["A'", "B'"] }] }, { label: "Invert", expr: "Y = (X+X)' = (A·B)'", gates: [{ kind: "NOR", in: ["X", "X"] }] }] },
  XNOR: { target: "XNOR", count: 4, reason: "Mirror of the 4-NAND XOR.", steps: [{ label: "N1", expr: "X = (A+B)'", gates: [{ kind: "NOR", in: ["A", "B"] }] }, { label: "N2", expr: "P = (A+X)'", gates: [{ kind: "NOR", in: ["A", "X"] }] }, { label: "N3", expr: "Q = (B+X)'", gates: [{ kind: "NOR", in: ["B", "X"] }] }, { label: "N4", expr: "Y = (P+Q)' = (A⊕B)'", gates: [{ kind: "NOR", in: ["P", "Q"] }] }] },
};

export function UniversalGates() {
  const [family, setFamily] = useState<"NAND" | "NOR">("NAND");
  const builds = family === "NAND" ? NAND_BUILDS : NOR_BUILDS;
  const keys = Object.keys(builds);
  const [target, setTarget] = useState(keys[0]);
  const current = builds[keys.includes(target) ? target : keys[0]];

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Why anyone cares">
        NAND and NOR are called <strong>universal</strong> gates: any logic function at all can be built from just one
        of them. Chip factories love this — one transistor layout, mass produced, wired up differently.
        In CMOS, NAND and NOR are also <em>simpler and faster</em> than AND and OR, because AND is literally
        &ldquo;NAND followed by an inverter&rdquo; on the silicon.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Build everything from…</Label>
            <Seg options={[{ v: "NAND" as const, label: "NAND only" }, { v: "NOR" as const, label: "NOR only" }]}
              value={family} onChange={(f) => { setFamily(f); setTarget(Object.keys(f === "NAND" ? NAND_BUILDS : NOR_BUILDS)[0]); }} />
          </div>
          <div>
            <Label>Target gate</Label>
            <Seg options={keys.map((k) => ({ v: k, label: k }))} value={keys.includes(target) ? target : keys[0]} onChange={setTarget} />
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-lg">{current.target} from {current.count} × {family}</h3>
          <Chip tone="accent">{current.count} gate{current.count > 1 ? "s" : ""}</Chip>
        </div>
        <p className="text-sm text-[var(--color-ink-dim)] mt-2">{current.reason}</p>

        <div className="mt-5 space-y-3">
          {current.steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-2)] w-20">{s.label}</span>
                <span className="font-mono text-sm">{s.expr}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {s.gates.map((g, j) => (
                  <div key={j} className="opacity-90">
                    <GateSymbol kind={g.kind} labels={g.in} width={112} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-[var(--color-line)] p-4">
          <div className="text-sm font-semibold mb-2">Proof by truth table</div>
          <ProofTable left={GATE_INFO[current.target].expr.split("=")[1].trim().replace("⊕", "^")} right={current.steps[current.steps.length - 1].expr.split("=").slice(-1)[0].trim().replace("⊕", "^")} />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">Converting a whole SOP circuit to NAND-only</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-3">
          You never need to expand gate-by-gate. There is a two-line trick:
        </p>
        <ol className="space-y-2 text-sm text-[var(--color-ink-dim)] list-decimal pl-5">
          <li>Draw the circuit as AND gates feeding one OR gate (standard SOP).</li>
          <li>Replace <strong>every</strong> gate with a NAND. Done.</li>
        </ol>
        <p className="text-sm text-[var(--color-ink-dim)] mt-3">
          Why it works: the bubbles you add on the AND outputs and the OR inputs cancel in pairs
          (that is bubble-to-bubble matching), and a bubbled-input OR <em>is</em> a NAND by DeMorgan.
          The mirror statement holds for POS and NOR: replace every gate in an OR-into-AND circuit with a NOR.
        </p>
        <Callout kind="warn">
          The trick only cancels bubbles on wires that go gate-to-gate. If a variable feeds the final OR
          <em> directly</em> (a single-literal term), you must invert it yourself first.
        </Callout>
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Alternate symbols / bubble matching                                        */
/* ========================================================================== */

export function AltSymbols() {
  const [gate, setGate] = useState<GateKind>("NAND");
  const [a, setA] = useState<0 | 1>(1);
  const [b, setB] = useState<0 | 1>(0);
  const single = gate === "NOT" || gate === "BUF";
  const out = evalGate(gate, a, single ? a : b);

  const equiv: Record<string, string> = {
    AND: "A·B  =  (A' + B')'   — “both are 1” = “neither is 0”",
    OR: "A+B  =  (A'·B')'      — “at least one is 1” = “not both are 0”",
    NAND: "(A·B)' =  A' + B'   — “not both 1” = “at least one is 0”",
    NOR: "(A+B)' =  A'·B'      — “neither is 1” = “both are 0”",
    NOT: "A' = A'              — an inverter is its own twin",
    BUF: "A = A",
    XOR: "A⊕B = A'⊕B' ",
    XNOR: "(A⊕B)' = A⊕B' ",
  };

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Every gate has two legal symbols">
        Applying DeMorgan to a gate’s equation gives an equally correct second drawing: change the body shape
        (AND ⇄ OR) and flip every bubble (add where there is none, remove where there is one).
        Same silicon, same truth table, different <em>story</em>.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-8 items-end">
          <div>
            <Label>Gate</Label>
            <Seg options={ALL_GATES.map((g) => ({ v: g, label: g }))} value={gate} onChange={setGate} size="sm" />
          </div>
          <div>
            <Label>Inputs</Label>
            <div className="flex gap-2">
              <Bit v={a} onClick={() => setA((a ^ 1) as 0 | 1)} />
              {!single && <Bit v={b} onClick={() => setB((b ^ 1) as 0 | 1)} />}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Standard symbol</div>
          <div className="mt-4"><GateSymbol kind={gate} inputs={single ? [a] : [a, b]} output={out} labels={single ? ["A"] : ["A", "B"]} width={170} /></div>
          <div className="mt-4 font-mono text-sm text-[var(--color-accent)]">{GATE_INFO[gate].expr}</div>
          <p className="text-sm text-[var(--color-ink-dim)] mt-2">Reads as: “{GATE_INFO[gate].plain}”</p>
        </Panel>

        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Alternate (DeMorgan) symbol</div>
          <div className="mt-4"><GateSymbol kind={gate} alt inputs={single ? [a] : [a, b]} output={out} labels={single ? ["A"] : ["A", "B"]} width={170} /></div>
          <div className="mt-4 font-mono text-sm text-[var(--color-accent-2)]">{equiv[gate]}</div>
          <p className="text-sm text-[var(--color-ink-dim)] mt-2">
            Body shape flipped, every bubble toggled. Output is still <strong className="text-[var(--color-ink)]">{out}</strong> — it must be, it is the same chip.
          </p>
        </Panel>
      </div>

      <Panel>
        <h3 className="font-bold mb-1">Which one should you draw?</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          Pick the symbol whose bubbles <strong>match</strong> the signals around it. This is bubble-to-bubble matching,
          and it is the single most useful diagram-reading skill in this course.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[var(--color-hi)] bg-[rgba(74,222,128,0.05)] p-4">
            <div className="text-sm font-bold text-[var(--color-hi)] mb-2">✓ Good — bubbles cancel</div>
            <BubbleDiagram matched />
            <p className="text-[13px] text-[var(--color-ink-dim)] mt-3">
              An output bubble meets an input bubble. Two inversions cancel, so you can read the logic straight
              through: “<em>if this AND that, then …</em>”. No mental algebra needed.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-bad)] bg-[rgba(248,113,113,0.05)] p-4">
            <div className="text-sm font-bold text-[var(--color-bad)] mb-2">✗ Confusing — bubble meets plain wire</div>
            <BubbleDiagram />
            <p className="text-[13px] text-[var(--color-ink-dim)] mt-3">
              Same circuit electrically, but now you have to carry an inversion in your head across the wire.
              Redraw the second gate in its alternate form and the bubbles will line up.
            </p>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">The active-level reading</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-3">
          A bubble on a pin means <strong>“this signal is active-LOW”</strong> — it does its job when it is 0.
          No bubble means active-HIGH. Bubble-to-bubble matching is just: an active-low output should feed an
          active-low input.
        </p>
        <Table
          head={["Symbol you drew", "Reads as", "Use when"]}
          rows={[
            ["AND with plain output", "Y is HIGH when all inputs are HIGH", "Everything around it is active-high"],
            ["NAND (AND + output bubble)", "Y is LOW when all inputs are HIGH", "The thing you are driving is active-low (e.g. a chip-enable EN̅)"],
            ["OR with bubbled inputs (= NAND)", "Y is HIGH when any input is LOW", "The signals feeding you are active-low"],
            ["AND with bubbled inputs (= NOR)", "Y is HIGH when all inputs are LOW", "Detecting that several active-low signals are all asserted"],
          ]}
        />
      </Panel>
    </div>
  );
}

function BubbleDiagram({ matched = false }: { matched?: boolean }) {
  return (
    <svg viewBox="0 0 260 90" className="w-full max-w-[260px]">
      {/* gate 1: NAND */}
      <line x1="4" y1="30" x2="30" y2="30" stroke="#8fa2bd" strokeWidth="2" />
      <line x1="4" y1="50" x2="30" y2="50" stroke="#8fa2bd" strokeWidth="2" />
      <path d="M30 18 H52 A22 22 0 0 1 52 62 H30 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
      <circle cx="79" cy="40" r="4.5" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
      <line x1="83.5" y1="40" x2="140" y2="40" stroke={matched ? "#4ade80" : "#f87171"} strokeWidth="2" />
      {/* gate 2 */}
      {matched ? (
        <>
          <circle cx="146" cy="40" r="4.5" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
          <line x1="150.5" y1="40" x2="160" y2="40" stroke="#8fa2bd" strokeWidth="2" />
          <line x1="140" y1="62" x2="160" y2="62" stroke="#8fa2bd" strokeWidth="2" />
          <circle cx="146" cy="62" r="4.5" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
          <path d="M158 18 Q178 18 208 40 Q178 62 158 62 Q172 40 158 18 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" transform="translate(0,10)" />
          <line x1="208" y1="50" x2="252" y2="50" stroke="#8fa2bd" strokeWidth="2" />
        </>
      ) : (
        <>
          <line x1="140" y1="62" x2="160" y2="62" stroke="#8fa2bd" strokeWidth="2" />
          <path d="M160 28 H182 A22 22 0 0 1 182 72 H160 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
          <line x1="204" y1="50" x2="252" y2="50" stroke="#8fa2bd" strokeWidth="2" />
        </>
      )}
      {matched && <text x="132" y="18" fill="#4ade80" fontSize="10" fontFamily="monospace">○—○ cancel</text>}
      {!matched && <text x="128" y="18" fill="#f87171" fontSize="10" fontFamily="monospace">○—| mismatch</text>}
    </svg>
  );
}

/* ========================================================================== */
/* Enable / disable lab                                                       */
/* ========================================================================== */

export function EnableLab() {
  const [en, setEn] = useState<0 | 1>(1);
  const [t, setT] = useState(0);

  // A little square-wave "data" signal so the pass-through is visible.
  const samples = Array.from({ length: 24 }, (_, i) => (Math.floor(i / 3) % 2 === 0 ? 0 : 1) as 0 | 1);

  const configs = [
    { gate: "AND" as GateKind, ctrl: "EN", desc: "Passes the signal when EN = 1. When EN = 0 the output is stuck LOW.", out: (d: 0 | 1) => (en && d ? 1 : 0), disabledLevel: "0" },
    { gate: "OR" as GateKind, ctrl: "DIS", desc: "Passes the signal when the control is 0. When it is 1 the output is stuck HIGH.", out: (d: 0 | 1) => ((en ? 0 : 1) || d ? 1 : 0), disabledLevel: "1" },
    { gate: "NAND" as GateKind, ctrl: "EN", desc: "Passes the INVERTED signal when EN = 1. Disabled output is HIGH.", out: (d: 0 | 1) => (en && d ? 0 : 1), disabledLevel: "1" },
    { gate: "NOR" as GateKind, ctrl: "DIS", desc: "Passes the INVERTED signal when the control is 0. Disabled output is LOW.", out: (d: 0 | 1) => ((en ? 0 : 1) || d ? 0 : 1), disabledLevel: "0" },
  ];

  return (
    <div className="space-y-5">
      <Callout kind="key" title="A gate used as a gate">
        Two of the four basic gates have a &ldquo;controlling&rdquo; input value that forces the output regardless of the
        other input: <strong>AND is controlled by 0</strong>, <strong>OR is controlled by 1</strong>. That is exactly
        what you exploit to switch a signal on and off.
      </Callout>

      <Panel>
        <Label>Control input</Label>
        <div className="flex items-center gap-3">
          <Bit v={en} size="lg" onClick={() => setEn((en ^ 1) as 0 | 1)} />
          <span className="text-sm text-[var(--color-ink-dim)]">
            {en ? "Enabled — the data signal gets through." : "Disabled — the output is frozen at the gate’s controlling level."}
          </span>
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 gap-4">
        {configs.map((c) => (
          <Panel key={c.gate}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold">{c.gate} as an enable</h3>
              <Chip tone={en ? "good" : "n"}>{en ? "passing" : `held at ${c.disabledLevel}`}</Chip>
            </div>
            <p className="text-[13px] text-[var(--color-ink-dim)] mt-1.5">{c.desc}</p>
            <div className="mt-3"><GateSymbol kind={c.gate} labels={["DATA", c.ctrl]} width={130} /></div>
            <div className="mt-4">
              <WaveRow label="DATA" values={samples} />
              <WaveRow label="OUT" values={samples.map(c.out) as (0 | 1)[]} tone="accent" />
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <h3 className="font-bold mb-3">Where you actually meet this</h3>
        <ul className="text-sm text-[var(--color-ink-dim)] space-y-2 list-disc pl-5">
          <li><strong>Chip enable pins.</strong> A memory chip’s CE̅ input is active-low; a NAND-based decoder drives it low to select one chip out of many.</li>
          <li><strong>Clock gating.</strong> AND a clock with an enable to stop a register updating — and to save the dynamic power that clock edge would have burned.</li>
          <li><strong>Masking.</strong> AND a bus with a pattern of 1s and 0s to keep some bits and zero others.</li>
          <li><strong>Programmable inversion.</strong> XOR with a control line: control = 0 passes the data through, control = 1 inverts it. This is exactly the trick the adder-subtractor uses.</li>
        </ul>
      </Panel>
    </div>
  );
}

export function WaveRow({ label, values, tone }: { label: string; values: (0 | 1)[]; tone?: "accent" }) {
  const w = 14, h = 26;
  const color = tone === "accent" ? "var(--color-accent)" : "var(--color-hi)";
  let d = "";
  values.forEach((v, i) => {
    const y = v ? 4 : 4 + h;
    if (i === 0) d += `M ${i * w} ${y}`;
    else {
      const py = values[i - 1] ? 4 : 4 + h;
      if (py !== y) d += ` L ${i * w} ${y}`;
    }
    d += ` L ${(i + 1) * w} ${y}`;
  });
  return (
    <div className="flex items-center gap-2 my-1">
      <span className="w-12 text-[10px] font-mono text-[var(--color-ink-faint)] text-right shrink-0">{label}</span>
      <svg viewBox={`0 0 ${values.length * w} ${h + 8}`} className="w-full" style={{ maxHeight: 40 }}>
        <path d={d} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
}
