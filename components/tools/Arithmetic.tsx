"use client";
import { useMemo, useState } from "react";
import { Panel, Field, Seg, Label, Result, Callout, Table, Chip, Bit, NumberStepper, Steps } from "@/components/UI";
import { GateSymbol } from "@/components/Gates";
import { twosComplement, fromTwosComplement, signMagnitude, onesComplement, toBinaryWidth, toBCD } from "@/lib/numbers";

/* ========================================================================== */
/* Adder lab                                                                  */
/* ========================================================================== */

export function AdderLab() {
  const [mode, setMode] = useState<"half" | "full" | "ripple">("half");
  return (
    <div className="space-y-5">
      <Panel>
        <Label>What are we building?</Label>
        <Seg
          options={[
            { v: "half" as const, label: "Half adder" },
            { v: "full" as const, label: "Full adder" },
            { v: "ripple" as const, label: "Ripple-carry adder" },
          ]}
          value={mode} onChange={setMode}
        />
      </Panel>
      {mode === "half" && <HalfAdder />}
      {mode === "full" && <FullAdder />}
      {mode === "ripple" && <RippleAdder />}
    </div>
  );
}

function HalfAdder() {
  const [a, setA] = useState<0 | 1>(1);
  const [b, setB] = useState<0 | 1>(1);
  const sum = (a ^ b) as 0 | 1;
  const carry = (a & b) as 0 | 1;

  return (
    <>
      <Callout kind="tip">
        Add two single bits. 1 + 1 = 2, which doesn’t fit in one bit — so the answer needs <em>two</em> outputs:
        a <strong>Sum</strong> (the units column) and a <strong>Carry</strong> (the twos column).
      </Callout>

      <Panel>
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
          <div>
            <Label>Inputs</Label>
            <div className="flex gap-3">
              <div className="text-center"><div className="text-xs font-mono text-[var(--color-ink-faint)] mb-1.5">A</div><Bit v={a} size="lg" onClick={() => setA((a ^ 1) as 0 | 1)} /></div>
              <div className="text-center"><div className="text-xs font-mono text-[var(--color-ink-faint)] mb-1.5">B</div><Bit v={b} size="lg" onClick={() => setB((b ^ 1) as 0 | 1)} /></div>
            </div>
            <div className="mt-5 font-mono text-lg">
              <div className="text-[var(--color-ink-dim)]">{a} + {b} = {a + b}</div>
              <div className="mt-1">= <span className="text-[var(--color-warn)]">{carry}</span><span className="text-[var(--color-hi)]">{sum}</span><sub className="text-xs">2</sub></div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xs font-mono text-[var(--color-ink-faint)] mb-1">Sum = A ⊕ B</div>
                <GateSymbol kind="XOR" inputs={[a, b]} output={sum} labels={["A", "B"]} />
              </div>
              <div>
                <div className="text-xs font-mono text-[var(--color-ink-faint)] mb-1">Carry = A · B</div>
                <GateSymbol kind="AND" inputs={[a, b]} output={carry} labels={["A", "B"]} />
              </div>
            </div>
            <div className="mt-4">
              <Table
                head={["A", "B", "Carry", "Sum", "meaning"]}
                rows={[[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, y]) => [
                  x, y,
                  <span key="c" className={x && y ? "text-[var(--color-warn)] font-bold" : "text-[var(--color-ink-faint)]"}>{x & y}</span>,
                  <span key="s" className={(x ^ y) ? "text-[var(--color-hi)] font-bold" : "text-[var(--color-ink-faint)]"}>{x ^ y}</span>,
                  <span key="m" className="text-[var(--color-ink-faint)]">{x} + {y} = {x + y}</span>,
                ])}
                highlight={(i) => i === (a << 1 | b)}
              />
            </div>
          </div>
        </div>
      </Panel>

      <Callout kind="key">
        Look at the Sum column: it is 1 exactly when A and B differ. That is XOR. Look at the Carry column: 1 only
        when both are 1. That is AND. <strong>A half adder is one XOR and one AND.</strong> Nothing more.
      </Callout>
    </>
  );
}

function FullAdder() {
  const [a, setA] = useState<0 | 1>(1);
  const [b, setB] = useState<0 | 1>(1);
  const [cin, setCin] = useState<0 | 1>(1);
  const total = a + b + cin;
  const sum = (total % 2) as 0 | 1;
  const cout = (total >= 2 ? 1 : 0) as 0 | 1;
  const h1s = (a ^ b) as 0 | 1;
  const h1c = (a & b) as 0 | 1;
  const h2c = (h1s & cin) as 0 | 1;

  return (
    <>
      <Callout kind="tip">
        A half adder can’t be chained, because it has nowhere to <em>receive</em> a carry from the column to its right.
        A full adder adds a third input, C<sub>in</sub>, and that one change is what lets you build an adder of any width.
      </Callout>

      <Panel>
        <div className="grid lg:grid-cols-[auto_1fr] gap-8">
          <div>
            <Label>Inputs</Label>
            <div className="flex gap-3">
              {([["A", a, setA], ["B", b, setB], ["Cin", cin, setCin]] as const).map(([l, v, set]) => (
                <div key={l} className="text-center">
                  <div className="text-xs font-mono text-[var(--color-ink-faint)] mb-1.5">{l}</div>
                  <Bit v={v} size="lg" onClick={() => (set as any)((v ^ 1) as 0 | 1)} />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <Result label="Sum" value={sum} tone="good" sub={`A ⊕ B ⊕ Cin`} />
              <Result label="Carry out" value={cout} tone="accent" sub={`AB + Cin(A ⊕ B)`} />
              <div className="font-mono text-sm text-[var(--color-ink-dim)] pt-1">
                {a} + {b} + {cin} = {total} → binary {cout}{sum}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-3">Built from two half adders + an OR</div>
            <svg viewBox="0 0 470 190" className="w-full max-w-[470px]">
              {/* labels */}
              <text x="4" y="34" fill="#98a3b8" fontSize="11" fontFamily="monospace">A={a}</text>
              <text x="4" y="64" fill="#98a3b8" fontSize="11" fontFamily="monospace">B={b}</text>
              <text x="4" y="128" fill="#98a3b8" fontSize="11" fontFamily="monospace">Cin={cin}</text>

              {/* HA1 box */}
              <rect x="52" y="14" width="96" height="70" rx="8" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
              <text x="100" y="38" textAnchor="middle" fill="#98a3b8" fontSize="11" fontFamily="monospace">HALF</text>
              <text x="100" y="52" textAnchor="middle" fill="#98a3b8" fontSize="11" fontFamily="monospace">ADDER 1</text>
              <line x1="34" y1="30" x2="52" y2="30" stroke={a ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="34" y1="60" x2="52" y2="60" stroke={b ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="148" y1="30" x2="210" y2="30" stroke={h1s ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <text x="156" y="24" fill="#667085" fontSize="10" fontFamily="monospace">S={h1s}</text>
              <line x1="148" y1="70" x2="180" y2="70" stroke={h1c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="180" y1="70" x2="180" y2="152" stroke={h1c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="180" y1="152" x2="330" y2="152" stroke={h1c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <text x="152" y="84" fill="#667085" fontSize="10" fontFamily="monospace">C={h1c}</text>

              {/* HA2 box */}
              <rect x="210" y="14" width="96" height="70" rx="8" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
              <text x="258" y="38" textAnchor="middle" fill="#98a3b8" fontSize="11" fontFamily="monospace">HALF</text>
              <text x="258" y="52" textAnchor="middle" fill="#98a3b8" fontSize="11" fontFamily="monospace">ADDER 2</text>
              <line x1="34" y1="124" x2="196" y2="124" stroke={cin ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="196" y1="124" x2="196" y2="60" stroke={cin ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="196" y1="60" x2="210" y2="60" stroke={cin ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="306" y1="30" x2="452" y2="30" stroke={sum ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <text x="424" y="24" fill="#4ade80" fontSize="11" fontFamily="monospace">SUM={sum}</text>
              <line x1="306" y1="70" x2="330" y2="70" stroke={h2c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="330" y1="70" x2="330" y2="112" stroke={h2c ? "#4ade80" : "#4a5568"} strokeWidth="2" />

              {/* OR gate */}
              <path d="M336 100 Q352 100 376 132 Q352 164 336 164 Q347 132 336 100 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" transform="translate(0,-14)" />
              <line x1="330" y1="112" x2="342" y2="112" stroke={h2c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="330" y1="140" x2="342" y2="140" stroke={h1c ? "#4ade80" : "#4a5568"} strokeWidth="2" />
              <line x1="376" y1="118" x2="452" y2="118" stroke={cout ? "#60a5fa" : "#4a5568"} strokeWidth="2" />
              <text x="392" y="112" fill="#60a5fa" fontSize="11" fontFamily="monospace">Cout={cout}</text>
            </svg>
          </div>
        </div>

        <div className="mt-6">
          <Table
            head={["Cin", "A", "B", "Cout", "Sum", "decimal"]}
            rows={[0, 1].flatMap((c) => [0, 1].flatMap((x) => [0, 1].map((y) => {
              const t = c + x + y;
              return [c, x, y,
                <span key="c" className={t >= 2 ? "text-[var(--color-accent)] font-bold" : "text-[var(--color-ink-faint)]"}>{t >= 2 ? 1 : 0}</span>,
                <span key="s" className={t % 2 ? "text-[var(--color-hi)] font-bold" : "text-[var(--color-ink-faint)]"}>{t % 2}</span>,
                <span key="d" className="text-[var(--color-ink-faint)]">{c}+{x}+{y} = {t}</span>];
            })))}
            highlight={(i) => i === (cin * 4 + a * 2 + b)}
          />
        </div>
      </Panel>

      <Callout kind="key">
        <p><strong>Sum = A ⊕ B ⊕ C<sub>in</sub></strong> — the sum bit is 1 when an <em>odd</em> number of the three inputs are 1.</p>
        <p><strong>C<sub>out</sub> = AB + C<sub>in</sub>(A ⊕ B)</strong> — carry out when at least <em>two</em> of the three inputs are 1. (You will also see it written AB + AC<sub>in</sub> + BC<sub>in</sub>; both are correct, the second is the K-map form.)</p>
      </Callout>
    </>
  );
}

function RippleAdder() {
  const [width, setWidth] = useState(4);
  const [a, setA] = useState(11);
  const [b, setB] = useState(7);
  const [step, setStep] = useState(99);
  const [tpd, setTpd] = useState(10);

  const max = (1 << width) - 1;
  const A = toBinaryWidth(a & max, width);
  const B = toBinaryWidth(b & max, width);

  // Build the carry chain LSB→MSB
  const carries: (0 | 1)[] = [0];
  const sums: (0 | 1)[] = [];
  for (let i = width - 1; i >= 0; i--) {
    const x = Number(A[i]) as 0 | 1, y = Number(B[i]) as 0 | 1;
    const c = carries[carries.length - 1];
    const t = x + y + c;
    sums.unshift((t % 2) as 0 | 1);
    carries.push((t >= 2 ? 1 : 0) as 0 | 1);
  }
  const settled = Math.min(step, width);

  return (
    <>
      <Callout kind="tip">
        Chain n full adders, each one’s C<sub>out</sub> feeding the next one’s C<sub>in</sub>. The lowest adder’s
        C<sub>in</sub> is tied to 0. That is a <strong>parallel adder</strong> — all the bits are presented at once —
        but the carry still has to <em>ripple</em> from right to left, and that is what makes it slow.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <NumberStepper label="Width (bits)" value={width} onChange={(w) => { setWidth(w); setA((x) => x & ((1 << w) - 1)); setB((x) => x & ((1 << w) - 1)); }} min={2} max={8} />
          <div>
            <Label>A (click bits)</Label>
            <div className="flex gap-1">{[...A].map((bit, i) => <Bit key={i} v={Number(bit) as 0 | 1} onClick={() => setA(a ^ (1 << (width - 1 - i)))} />)}</div>
            <div className="text-xs font-mono text-[var(--color-ink-faint)] mt-1.5">= {a & max}</div>
          </div>
          <div>
            <Label>B (click bits)</Label>
            <div className="flex gap-1">{[...B].map((bit, i) => <Bit key={i} v={Number(bit) as 0 | 1} onClick={() => setB(b ^ (1 << (width - 1 - i)))} />)}</div>
            <div className="text-xs font-mono text-[var(--color-ink-faint)] mt-1.5">= {b & max}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Label>Carry ripple — step through it</Label>
            <div className="flex gap-2 -mt-1.5">
              <button onClick={() => setStep(Math.max(0, Math.min(step, width) - 1))} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">◀ back</button>
              <button onClick={() => setStep(Math.min(width, step + 1))} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">forward ▶</button>
              <button onClick={() => setStep(width)} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">all</button>
            </div>
            <span className="text-xs text-[var(--color-ink-faint)]">stage {settled} of {width} settled</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max flex-row-reverse justify-end">
              {Array.from({ length: width }, (_, k) => {
                const idx = k;                   // 0 = LSB
                const pos = width - 1 - idx;     // index into strings
                const done = idx < settled;
                return (
                  <div key={idx} className={`rounded-lg border p-3 w-[104px] transition ${done ? "border-[var(--color-accent)] bg-[#101c2c]" : "border-[var(--color-line)] bg-[#0d1219] opacity-45"}`}>
                    <div className="text-[10px] font-mono text-[var(--color-ink-faint)] text-center mb-2">FA{idx}</div>
                    <div className="flex justify-center gap-1 mb-2">
                      <Bit v={Number(A[pos]) as 0 | 1} size="sm" />
                      <Bit v={Number(B[pos]) as 0 | 1} size="sm" />
                    </div>
                    <div className="text-[9px] text-center text-[var(--color-ink-faint)] font-mono mb-1">Cin={done ? carries[idx] : "?"}</div>
                    <div className="flex justify-center">
                      <Bit v={done ? sums[pos] : 0} size="md" tone="accent" />
                    </div>
                    <div className="text-[9px] text-center text-[var(--color-ink-faint)] font-mono mt-1">Cout={done ? carries[idx + 1] : "?"}</div>
                  </div>
                );
              })}
              <div className="self-center px-2 text-[var(--color-warn)] font-mono text-xs">
                C{width}<br />={settled === width ? carries[width] : "?"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <Result label="Sum bits" value={sums.join("")} tone="accent" sub={`unsigned = ${parseInt(sums.join(""), 2)}`} />
          <Result label="Carry out (C₄ … Cₙ)" value={carries[width]} tone={carries[width] ? "bad" : "good"} sub={carries[width] ? "unsigned overflow — the answer needs one more bit" : "fits in the width"} />
          <Result label="Check" value={`${a & max} + ${b & max} = ${(a & max) + (b & max)}`} />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">Carry propagation delay — why this design doesn’t scale</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          FA0 can’t produce its carry until its inputs are stable; FA1 can’t start until FA0’s carry arrives; and so on.
          The worst case is a carry born at the LSB that has to travel the whole way to the MSB.
        </p>
        <div className="flex flex-wrap gap-6 items-end mb-4">
          <div>
            <Label>Delay per full adder (ns)</Label>
            <input type="range" min={1} max={30} value={tpd} onChange={(e) => setTpd(+e.target.value)} className="w-48 accent-[var(--color-accent)]" />
            <div className="font-mono text-sm mt-1">{tpd} ns</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Result label={`Worst-case delay (${width}-bit)`} value={`${width * tpd} ns`} sub={`${width} stages × ${tpd} ns`} tone="bad" />
          <Result label="Max clock rate" value={`${(1000 / (width * tpd)).toFixed(1)} MHz`} sub="1 / total delay" />
          <Result label="If this were 64-bit" value={`${64 * tpd} ns`} sub={`only ${(1000 / (64 * tpd)).toFixed(1)} MHz — unusable`} tone="bad" />
        </div>
        <Callout kind="key" title="The fix (mentioned in lectures, examinable as a concept)">
          <strong>Carry look-ahead.</strong> Instead of waiting for the carry, compute for each bit whether it
          <em> generates</em> a carry (G = A·B) or would <em>propagate</em> one (P = A ⊕ B). Then every carry can be
          worked out in parallel from the Gs and Ps, in constant time, at the cost of a lot more gates.
          Speed traded for area — the recurring theme of the whole course.
        </Callout>
      </Panel>
    </>
  );
}

/* ========================================================================== */
/* Signed number explorer                                                     */
/* ========================================================================== */

export function SignedNumbers() {
  const [n, setN] = useState("-13");
  const [width, setWidth] = useState(8);
  const v = parseInt(n, 10);
  const valid = !isNaN(v);
  const max2 = (1 << (width - 1)) - 1, min2 = -(1 << (width - 1));

  const sm = valid ? signMagnitude(v, width) : "";
  const oc = valid ? onesComplement(v, width) : "";
  const tc = valid ? twosComplement(v, width) : "";

  return (
    <div className="space-y-5">
      <Callout kind="key" title="The problem being solved">
        Bits have no minus sign. So we have to <em>agree</em> that some bit patterns mean negative numbers.
        There are three historical agreements; modern hardware uses the third one exclusively, and the reason
        is worth understanding rather than memorising.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <Field label="Decimal value" value={n} onChange={setN} className="w-40" />
          <NumberStepper label="Width (bits)" value={width} onChange={setWidth} min={4} max={16} />
          <div className="text-sm text-[var(--color-ink-dim)] pb-2">
            2’s complement range: <span className="font-mono text-[var(--color-ink)]">{min2} … {max2}</span>
          </div>
        </div>
      </Panel>

      {valid && (
        <>
          <div className="space-y-4">
            <RepCard
              title="1 · Sign-magnitude"
              bits={sm}
              width={width}
              idea="Leftmost bit is the sign (0 = +, 1 = −). The rest is the plain magnitude, exactly as you'd write it by hand."
              pros={["Dead easy for a human to read", "Symmetric range"]}
              cons={[
                "TWO zeros: 0000 0000 and 1000 0000 both mean zero. A comparator has to special-case that.",
                "Addition needs a separate subtractor and a pile of sign-comparison logic. Expensive.",
              ]}
              range={[-(Math.pow(2, width - 1) - 1), Math.pow(2, width - 1) - 1]}
            />
            <RepCard
              title="2 · 1’s complement"
              bits={oc}
              width={width}
              idea="To negate, flip every bit. That's it."
              pros={["Negation is one row of inverters", "Addition almost works"]}
              cons={[
                "Still TWO zeros (all 0s and all 1s).",
                "Needs an “end-around carry”: if the addition produces a carry out, you must add it back into the LSB. Extra hardware, extra delay.",
              ]}
              range={[-(Math.pow(2, width - 1) - 1), Math.pow(2, width - 1) - 1]}
            />
            <RepCard
              title="3 · 2’s complement — the one everybody uses"
              bits={tc}
              width={width}
              idea="To negate: flip every bit, then add 1. Equivalently, the MSB carries a NEGATIVE weight."
              pros={[
                "Exactly ONE zero.",
                "Ordinary binary addition just works — the same adder handles positive and negative operands with no extra logic.",
                "Subtraction becomes A + (−B). You never build a subtractor.",
              ]}
              cons={["Range is asymmetric: one extra negative value, because the zero it saved went to the negative side."]}
              range={[min2, max2]}
              highlight
            />
          </div>

          {tc && (
            <Panel>
              <h3 className="font-bold mb-1">Why the MSB has a negative weight</h3>
              <p className="text-sm text-[var(--color-ink-dim)] mb-4">
                This is the fastest way to convert a 2’s complement pattern back to decimal in an exam — no flipping, no adding 1.
                Just weight the columns normally, but make the leftmost one negative.
              </p>
              <div className="overflow-x-auto">
                <div className="inline-flex gap-1.5">
                  {[...tc].map((b, i) => {
                    const pos = width - 1 - i;
                    const w = i === 0 ? -Math.pow(2, pos) : Math.pow(2, pos);
                    return (
                      <div key={i} className={`text-center rounded-lg border p-2 w-[70px] ${i === 0 ? "border-[var(--color-bad)] bg-[rgba(248,113,113,0.06)]" : "border-[var(--color-line)] bg-[#0d1219]"}`}>
                        <div className={`font-mono text-xl font-bold ${b === "1" ? "text-[var(--color-hi)]" : "text-[var(--color-ink-faint)]"}`}>{b}</div>
                        <div className={`text-[10px] font-mono mt-1 ${i === 0 ? "text-[var(--color-bad)]" : "text-[var(--color-ink-faint)]"}`}>{w}</div>
                        <div className="text-[11px] font-mono mt-1 pt-1 border-t border-[var(--color-line)] text-[var(--color-accent)]">{b === "1" ? w : 0}</div>
                      </div>
                    );
                  })}
                  <div className="self-center pl-3 font-mono text-lg">= <span className="text-[var(--color-hi)] font-bold">{fromTwosComplement(tc)}</span></div>
                </div>
              </div>
            </Panel>
          )}

          <Panel>
            <h3 className="font-bold mb-1">Negating step by step</h3>
            <Steps items={[
              { title: `Write |${v}| = ${Math.abs(v)} in ${width}-bit binary`, body: <code>{toBinaryWidth(Math.abs(v), width)}</code> },
              { title: "Flip every bit (1’s complement)", body: <code>{[...toBinaryWidth(Math.abs(v), width)].map((b) => (b === "0" ? "1" : "0")).join("")}</code> },
              { title: "Add 1", body: <><code>{twosComplement(-Math.abs(v), width)}</code> — this is −{Math.abs(v)} in 2’s complement</> },
              { title: "Sanity check", body: <>Add it to <code>{toBinaryWidth(Math.abs(v), width)}</code> and you get all zeros (plus a carry you throw away). That is what &ldquo;negative&rdquo; means.</> },
            ]} />
            <Callout kind="tip" title="The faster hand method">
              Scan from the right. Copy bits until you have copied the first <code>1</code>. Then invert everything
              to the left of it. Try it on <code>{toBinaryWidth(Math.abs(v), width)}</code> — you get{" "}
              <code>{twosComplement(-Math.abs(v), width)}</code> in one pass.
            </Callout>
          </Panel>

          <Panel>
            <h3 className="font-bold mb-3">All three, side by side ({width > 5 ? "4-bit example for readability" : `${width}-bit`})</h3>
            <ComparisonTable width={Math.min(width, 4)} />
          </Panel>
        </>
      )}
    </div>
  );
}

function RepCard({ title, bits, width, idea, pros, cons, range, highlight }:
  { title: string; bits: string; width: number; idea: string; pros: string[]; cons: string[]; range: [number, number]; highlight?: boolean }) {
  return (
    <div className={`panel p-5 ${highlight ? "border-[var(--color-hi)]" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <span className="text-xs font-mono text-[var(--color-ink-faint)]">range {range[0]} … {range[1]}</span>
      </div>
      <p className="text-sm text-[var(--color-ink-dim)] mt-1.5">{idea}</p>
      {bits ? (
        <div className="flex gap-1 mt-3 flex-wrap">
          {[...bits].map((b, i) => <Bit key={i} v={Number(b) as 0 | 1} size="sm" tone={i === 0 ? "accent" : undefined} />)}
          <span className="ml-2 self-center font-mono text-sm text-[var(--color-ink-dim)]">← MSB is on the left</span>
        </div>
      ) : (
        <div className="mt-3 text-sm text-[var(--color-bad)]">Out of range for {width} bits in this representation.</div>
      )}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-4 text-[13px]">
        <div>
          {pros.map((p) => <div key={p} className="text-[var(--color-ink-dim)] flex gap-2 my-1"><span className="text-[var(--color-hi)]">+</span>{p}</div>)}
        </div>
        <div>
          {cons.map((c) => <div key={c} className="text-[var(--color-ink-dim)] flex gap-2 my-1"><span className="text-[var(--color-bad)]">−</span>{c}</div>)}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ width }: { width: number }) {
  const rows = [];
  for (let i = 0; i < 1 << width; i++) {
    const b = i.toString(2).padStart(width, "0");
    const smVal = (b[0] === "1" ? -1 : 1) * parseInt(b.slice(1) || "0", 2);
    const ocVal = b[0] === "1" ? -(parseInt([...b].map((x) => (x === "0" ? "1" : "0")).join(""), 2)) : i;
    const tcVal = fromTwosComplement(b);
    rows.push([b, smVal, ocVal, <span key="t" className="text-[var(--color-hi)] font-bold">{tcVal}</span>]);
  }
  return <Table head={["Pattern", "Sign-magnitude", "1’s complement", "2’s complement"]} rows={rows} />;
}

/* ========================================================================== */
/* 2's complement calculator                                                  */
/* ========================================================================== */

export function TwosCalc() {
  const [a, setA] = useState("5");
  const [b, setB] = useState("-3");
  const [width, setWidth] = useState(8);
  const [op, setOp] = useState<"+" | "−">("+");

  const av = parseInt(a, 10), bv = parseInt(b, 10);
  const valid = !isNaN(av) && !isNaN(bv);
  const max = (1 << (width - 1)) - 1, min = -(1 << (width - 1));
  const inRange = valid && av <= max && av >= min && bv <= max && bv >= min;

  const effB = op === "+" ? bv : -bv;
  const A = inRange ? twosComplement(av, width) : "";
  // For subtraction the hardware negates B, so show the negated operand.
  const B = inRange ? twosComplement(op === "+" ? bv : -bv, width) : "";

  const calc = useMemo(() => {
    if (!A || !B) return null;
    const carries: number[] = [];
    let c = 0;
    const sum: string[] = [];
    for (let i = width - 1; i >= 0; i--) {
      const x = Number(A[i]), y = Number(B[i]);
      const t = x + y + c;
      sum.unshift(String(t % 2));
      carries.unshift(c);
      c = t >= 2 ? 1 : 0;
    }
    const cOut = c;
    const cIntoMsb = carries[0];
    const result = fromTwosComplement(sum.join(""));
    const trueResult = av + effB;
    const overflow = cOut !== cIntoMsb;
    return { sum: sum.join(""), carries, cOut, cIntoMsb, result, trueResult, overflow };
  }, [A, B, width, av, effB]);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-wrap gap-5 items-end">
          <Field label="A (decimal)" value={a} onChange={setA} className="w-32" />
          <div>
            <Label>Operation</Label>
            <Seg options={[{ v: "+" as const, label: "A + B" }, { v: "−" as const, label: "A − B" }]} value={op} onChange={setOp} />
          </div>
          <Field label="B (decimal)" value={b} onChange={setB} className="w-32" />
          <NumberStepper label="Width" value={width} onChange={setWidth} min={4} max={16} />
        </div>
        {valid && !inRange && (
          <div className="mt-3 text-sm text-[var(--color-bad)]">
            One of the operands doesn’t fit in {width} bits (range {min} … {max}). Widen it or pick smaller numbers.
          </div>
        )}
      </Panel>

      {calc && (
        <>
          {op === "−" && (
            <Callout kind="key" title="How subtraction is really done">
              The hardware never subtracts. It computes <strong>A + (−B)</strong>, where −B is B’s 2’s complement.
              So A − B = {av} + ({-bv}) — that is the sum shown below.
            </Callout>
          )}

          <Panel>
            <h3 className="font-bold mb-4">Bit-by-bit addition</h3>
            <div className="overflow-x-auto">
              <div className="inline-block font-mono text-sm">
                <div className="flex gap-1 items-center mb-1">
                  <span className="w-16 text-right text-[10px] text-[var(--color-ink-faint)] pr-2">carries</span>
                  {calc.carries.map((c, i) => (
                    <span key={i} className={`w-9 text-center text-xs ${c ? "text-[var(--color-warn)] font-bold" : "text-[var(--color-ink-faint)]"}`}>{c}</span>
                  ))}
                </div>
                <div className="flex gap-1 items-center">
                  <span className="w-16 text-right text-[11px] text-[var(--color-ink-dim)] pr-2">A = {av}</span>
                  {[...A].map((x, i) => <Bit key={i} v={Number(x) as 0 | 1} size="sm" />)}
                </div>
                <div className="flex gap-1 items-center mt-1">
                  <span className="w-16 text-right text-[11px] text-[var(--color-ink-dim)] pr-2">{op === "+" ? "B" : "−B"} = {effB}</span>
                  {[...B].map((x, i) => <Bit key={i} v={Number(x) as 0 | 1} size="sm" />)}
                </div>
                <div className="flex gap-1 items-center mt-2 pt-2 border-t border-[var(--color-line)]">
                  <span className="w-16 text-right text-[11px] text-[var(--color-ink-dim)] pr-2">sum</span>
                  {[...calc.sum].map((x, i) => <Bit key={i} v={Number(x) as 0 | 1} size="sm" tone="accent" />)}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <Result label="Result (as 2’s complement)" value={calc.result} sub={calc.sum} tone={calc.overflow ? "bad" : "good"} />
              <Result label="Correct answer" value={calc.trueResult} sub={`${av} ${op} ${Math.abs(bv) === bv ? bv : `(${bv})`}`} />
              <Result label="Carry out of MSB" value={calc.cOut} sub="discarded in signed arithmetic" />
            </div>
          </Panel>

          <Panel className={calc.overflow ? "border-[var(--color-bad)]" : "border-[var(--color-hi)]"}>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold">Overflow check</h3>
              {calc.overflow ? <Chip tone="bad">OVERFLOW — the result is wrong</Chip> : <Chip tone="good">No overflow — result is valid</Chip>}
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-5">
              <div>
                <div className="text-sm font-semibold mb-2">Rule 1 — the carry rule (what hardware uses)</div>
                <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-3.5 space-y-1">
                  <div>carry <em>into</em> the MSB  = {calc.cIntoMsb}</div>
                  <div>carry <em>out of</em> the MSB = {calc.cOut}</div>
                  <div className="pt-2 border-t border-[var(--color-line)] mt-2">
                    V = C<sub>in</sub> ⊕ C<sub>out</sub> = <span className={calc.overflow ? "text-[var(--color-bad)] font-bold" : "text-[var(--color-hi)] font-bold"}>{calc.overflow ? 1 : 0}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--color-ink-dim)] mt-2">
                  They differ ⇒ overflow. They match ⇒ fine.
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Rule 2 — the sign rule (what you use by eye)</div>
                <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-3.5 space-y-1 text-[var(--color-ink-dim)]">
                  <div>sign of A     = {A[0] === "1" ? "−" : "+"}</div>
                  <div>sign of {op === "+" ? "B" : "−B"}  = {B[0] === "1" ? "−" : "+"}</div>
                  <div>sign of result = {calc.sum[0] === "1" ? "−" : "+"}</div>
                </div>
                <p className="text-[13px] text-[var(--color-ink-dim)] mt-2">
                  Overflow can <strong>only</strong> happen when the two operands have the <em>same</em> sign and the
                  result comes out with the <em>opposite</em> sign. Two numbers of opposite signs can never overflow —
                  the answer is always smaller in magnitude than one of them.
                </p>
              </div>
            </div>

            {calc.overflow && (
              <div className="mt-4 text-sm text-[var(--color-bad)] leading-relaxed">
                {av} {op} {bv} = {calc.trueResult}, which is outside {min} … {max}. The bits wrapped around and the
                machine reported {calc.result}. In a real CPU this sets the V (overflow) flag; ignoring it is how
                spacecraft get lost.
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="font-bold mb-1">Sign extension</h3>
            <p className="text-sm text-[var(--color-ink-dim)] mb-4">
              To widen a 2’s complement number, <strong>copy the sign bit</strong> into all the new positions.
              Do not pad with zeros — that would turn a negative number positive.
            </p>
            <div className="space-y-3">
              {[4, 8, 16].filter((w) => w >= width || true).map((w) => {
                const ok = av <= (1 << (w - 1)) - 1 && av >= -(1 << (w - 1));
                if (!ok) return null;
                const bits = twosComplement(av, w);
                const extended = w > width;
                return (
                  <div key={w} className="flex flex-wrap items-center gap-3">
                    <span className="w-14 text-xs font-mono text-[var(--color-ink-faint)]">{w}-bit</span>
                    <div className="flex gap-1 flex-wrap">
                      {[...bits].map((x, i) => {
                        const isNew = extended && i < w - width;
                        return <Bit key={i} v={Number(x) as 0 | 1} size="sm" tone={isNew ? "warn" : undefined} />;
                      })}
                    </div>
                    <span className="text-xs font-mono text-[var(--color-ink-dim)]">= {av}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[13px] text-[var(--color-ink-faint)] mt-3">
              Highlighted bits are the copies of the sign. The value never changes — which is the whole point.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Adder-subtractor circuit                                                   */
/* ========================================================================== */

export function AddSubCircuit() {
  const [sub, setSub] = useState<0 | 1>(0);
  const [width] = useState(4);
  const [a, setA] = useState(6);
  const [b, setB] = useState(3);

  const max = (1 << width) - 1;
  const A = toBinaryWidth(a, width);
  const Braw = toBinaryWidth(b, width);
  const Bxor = [...Braw].map((x) => String(Number(x) ^ sub)).join("");

  let c = sub as number;
  const sum: string[] = [];
  const carries: number[] = [];
  for (let i = width - 1; i >= 0; i--) {
    const t = Number(A[i]) + Number(Bxor[i]) + c;
    sum.unshift(String(t % 2));
    carries.unshift(c);
    c = t >= 2 ? 1 : 0;
  }
  const cOut = c;
  const overflow = cOut !== carries[0];
  const signedResult = fromTwosComplement(sum.join(""));
  const trueVal = fromTwosComplement(A) + (sub ? -fromTwosComplement(Braw) : fromTwosComplement(Braw));

  return (
    <div className="space-y-5">
      <Callout kind="key" title="One control line does both jobs">
        Put an XOR gate on every bit of B, with the control line SUB as the other input. XOR with 0 passes B
        through; XOR with 1 inverts it. Then feed SUB into C<sub>in</sub> as well — that supplies the &ldquo;+1&rdquo;.
        Invert-and-add-one <em>is</em> 2’s complement negation, so SUB = 1 gives you A + (−B).
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Control line SUB</Label>
            <div className="flex items-center gap-3">
              <Bit v={sub} size="lg" onClick={() => setSub((sub ^ 1) as 0 | 1)} />
              <span className="text-sm text-[var(--color-ink-dim)]">{sub ? "SUB = 1 → computing A − B" : "SUB = 0 → computing A + B"}</span>
            </div>
          </div>
          <div>
            <Label>A</Label>
            <div className="flex gap-1">{[...A].map((x, i) => <Bit key={i} v={Number(x) as 0 | 1} onClick={() => setA(a ^ (1 << (width - 1 - i)))} />)}</div>
            <div className="text-xs font-mono text-[var(--color-ink-faint)] mt-1.5">signed = {fromTwosComplement(A)}</div>
          </div>
          <div>
            <Label>B</Label>
            <div className="flex gap-1">{[...Braw].map((x, i) => <Bit key={i} v={Number(x) as 0 | 1} onClick={() => setB(b ^ (1 << (width - 1 - i)))} />)}</div>
            <div className="text-xs font-mono text-[var(--color-ink-faint)] mt-1.5">signed = {fromTwosComplement(Braw)}</div>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">The circuit</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max flex-row-reverse justify-end">
            {Array.from({ length: width }, (_, k) => {
              const pos = width - 1 - k;
              return (
                <div key={k} className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-3 w-[120px]">
                  <div className="text-[10px] font-mono text-[var(--color-ink-faint)] text-center mb-2">bit {k}</div>
                  <div className="flex justify-center items-center gap-1 mb-1">
                    <Bit v={Number(Braw[pos]) as 0 | 1} size="sm" />
                    <span className="text-[var(--color-ink-faint)] text-xs">⊕</span>
                    <Bit v={sub} size="sm" tone="warn" />
                  </div>
                  <div className="text-center text-[10px] text-[var(--color-ink-faint)] my-1">↓ B{sub ? "′" : ""}</div>
                  <div className="flex justify-center gap-1">
                    <Bit v={Number(A[pos]) as 0 | 1} size="sm" />
                    <Bit v={Number(Bxor[pos]) as 0 | 1} size="sm" tone="accent" />
                  </div>
                  <div className="text-center text-[10px] text-[var(--color-ink-faint)] my-1">full adder ↓</div>
                  <div className="flex justify-center"><Bit v={Number(sum[pos]) as 0 | 1} tone="accent" /></div>
                </div>
              );
            })}
            <div className="self-center px-2 text-center">
              <div className="text-[10px] font-mono text-[var(--color-ink-faint)]">C₀</div>
              <Bit v={sub} size="sm" tone="warn" />
              <div className="text-[9px] text-[var(--color-ink-faint)] mt-1 w-16">= SUB<br />(the “+1”)</div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mt-6">
          <Result label="Result bits" value={sum.join("")} tone="accent" />
          <Result label="As signed (2’s comp)" value={signedResult} tone={overflow ? "bad" : "good"} />
          <Result label="Expected" value={trueVal} />
          <Result label="Overflow V" value={overflow ? 1 : 0} tone={overflow ? "bad" : "good"} sub="C_in(msb) ⊕ C_out" />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">Parallel addition with registers</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          In a real datapath the operands don’t come from switches — they sit in <strong>registers</strong>.
          A typical accumulate loop looks like this, and the clock period must be long enough for the slowest
          path (the full carry ripple) to settle.
        </p>
        <svg viewBox="0 0 520 170" className="w-full max-w-[520px]">
          <rect x="20" y="16" width="110" height="42" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
          <text x="75" y="42" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontFamily="monospace">Register A</text>
          <rect x="20" y="100" width="110" height="42" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
          <text x="75" y="126" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontFamily="monospace">Register B</text>

          <line x1="130" y1="37" x2="200" y2="37" stroke="#60a5fa" strokeWidth="2" />
          <line x1="130" y1="121" x2="200" y2="121" stroke="#60a5fa" strokeWidth="2" />
          <line x1="200" y1="37" x2="200" y2="60" stroke="#60a5fa" strokeWidth="2" />
          <line x1="200" y1="121" x2="200" y2="98" stroke="#60a5fa" strokeWidth="2" />

          <rect x="200" y="52" width="120" height="54" rx="6" fill="#12253a" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="260" y="76" textAnchor="middle" fill="#60a5fa" fontSize="12" fontFamily="monospace">n-bit ADDER /</text>
          <text x="260" y="92" textAnchor="middle" fill="#60a5fa" fontSize="12" fontFamily="monospace">SUBTRACTOR</text>
          <text x="260" y="42" textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">SUB</text>
          <line x1="260" y1="46" x2="260" y2="52" stroke="#fbbf24" strokeWidth="2" />

          <line x1="320" y1="79" x2="380" y2="79" stroke="#4ade80" strokeWidth="2" />
          <rect x="380" y="58" width="110" height="42" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
          <text x="435" y="84" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontFamily="monospace">Result reg</text>

          {/* feedback path */}
          <line x1="435" y1="100" x2="435" y2="158" stroke="#4a5568" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="435" y1="158" x2="75" y2="158" stroke="#4a5568" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="75" y1="158" x2="75" y2="58" stroke="#4a5568" strokeWidth="2" strokeDasharray="4 3" />
          <text x="230" y="152" fill="#667085" fontSize="10" fontFamily="monospace">accumulate: A ← A + B each clock</text>
        </svg>
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Binary multiplier                                                          */
/* ========================================================================== */

export function Multiplier() {
  const [a, setA] = useState("13");
  const [b, setB] = useState("11");
  const av = Math.max(0, Math.min(255, parseInt(a, 10) || 0));
  const bv = Math.max(0, Math.min(255, parseInt(b, 10) || 0));
  const A = av.toString(2);
  const B = bv.toString(2);
  const product = av * bv;
  const width = A.length + B.length;

  const partials = [...B].reverse().map((bit, i) => ({
    bit: Number(bit),
    shift: i,
    value: Number(bit) ? av << i : 0,
    bits: Number(bit) ? (av << i).toString(2).padStart(width, "0") : "0".padStart(width, "0"),
  }));

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Binary multiplication is easier than decimal">
        Each digit of the multiplier is either 0 or 1. So every partial product is either <strong>zero</strong> or
        <strong> a copy of the multiplicand, shifted left</strong>. There are no times tables. Multiply = AND + shift + add.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-5 items-end">
          <Field label="Multiplicand A" value={a} onChange={setA} className="w-32" />
          <span className="pb-3 text-2xl text-[var(--color-ink-faint)]">×</span>
          <Field label="Multiplier B" value={b} onChange={setB} className="w-32" />
        </div>
        <div className="mt-3 font-mono text-sm text-[var(--color-ink-dim)]">
          {av} × {bv} = {product} · in binary {A} × {B} = {product.toString(2)}
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">Long multiplication, worked out</h3>
        <div className="overflow-x-auto">
          <div className="inline-block font-mono text-sm">
            <div className="flex justify-end gap-1 items-center">
              <span className="text-[11px] text-[var(--color-ink-faint)] w-24 text-right pr-2">A = {av}</span>
              <span className="tracking-[0.35em] text-[var(--color-ink)]">{A.padStart(width, " ")}</span>
            </div>
            <div className="flex justify-end gap-1 items-center border-b border-[var(--color-line)] pb-1">
              <span className="text-[11px] text-[var(--color-ink-faint)] w-24 text-right pr-2">× B = {bv}</span>
              <span className="tracking-[0.35em] text-[var(--color-ink)]">{B.padStart(width, " ")}</span>
            </div>
            {partials.map((p, i) => (
              <div key={i} className="flex justify-end gap-1 items-center mt-1">
                <span className="text-[11px] text-[var(--color-ink-faint)] w-24 text-right pr-2">
                  b{i}={p.bit} {p.bit ? `→ A<<${i}` : "→ 0"}
                </span>
                <span className={`tracking-[0.35em] ${p.bit ? "text-[var(--color-hi)]" : "text-[var(--color-ink-faint)]"}`}>
                  {p.bits}
                </span>
                <span className="text-[11px] text-[var(--color-ink-faint)] pl-3 w-16">= {p.value}</span>
              </div>
            ))}
            <div className="flex justify-end gap-1 items-center mt-2 pt-2 border-t border-[var(--color-line)]">
              <span className="text-[11px] text-[var(--color-ink-faint)] w-24 text-right pr-2">sum</span>
              <span className="tracking-[0.35em] text-[var(--color-accent)] font-bold">{product.toString(2).padStart(width, "0")}</span>
              <span className="text-[11px] text-[var(--color-accent)] pl-3 w-16">= {product}</span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-2">How hardware does it (shift-and-add)</h3>
          <Steps items={[
            { title: "Clear the accumulator", body: "P ← 0" },
            { title: "Look at the lowest bit of B", body: "If it is 1, P ← P + A. If it is 0, do nothing." },
            { title: "Shift", body: "Shift A left by one, shift B right by one." },
            { title: "Repeat n times", body: <>After n iterations P holds the full 2n-bit product. Costs <strong>one adder</strong> and n clock cycles.</> },
          ]} />
        </Panel>
        <Panel>
          <h3 className="font-bold mb-2">Or all at once (array multiplier)</h3>
          <p className="text-sm text-[var(--color-ink-dim)]">
            Every partial product bit is just <code className="font-mono">Aᵢ · Bⱼ</code> — one AND gate.
            Lay out n² AND gates in a grid, then a mesh of full adders to sum the columns. One clock cycle,
            but n² gates.
          </p>
          <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${A.length}, minmax(0,1fr))`, maxWidth: 260 }}>
            {[...B].reverse().map((bBit, r) =>
              [...A].map((aBit, c) => {
                const v = Number(aBit) & Number(bBit);
                return (
                  <div key={`${r}-${c}`} className={`aspect-square rounded grid place-items-center text-[11px] font-mono border
                    ${v ? "bg-[#10301f] border-[var(--color-hi)] text-[var(--color-hi)]" : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-faint)]"}`}>
                    {v}
                  </div>
                );
              })
            )}
          </div>
          <div className="text-[11px] text-[var(--color-ink-faint)] mt-2 font-mono">
            {A.length} × {B.length} = {A.length * B.length} AND gates
          </div>
        </Panel>
      </div>

      <Callout kind="warn">
        An n-bit × n-bit product needs <strong>2n bits</strong> to hold it. 8 × 8 can reach 255 × 255 = 65025,
        which needs 16 bits. Truncating the product back to n bits is a classic source of silent bugs — and a
        classic exam question.
      </Callout>
    </div>
  );
}

/* ========================================================================== */
/* BCD adder                                                                  */
/* ========================================================================== */

export function BcdAdder() {
  const [a, setA] = useState("47");
  const [b, setB] = useState("38");
  const av = Math.max(0, Math.min(9999, parseInt(a, 10) || 0));
  const bv = Math.max(0, Math.min(9999, parseInt(b, 10) || 0));

  const digitsA = String(av).split("").map(Number);
  const digitsB = String(bv).split("").map(Number);
  const len = Math.max(digitsA.length, digitsB.length);
  while (digitsA.length < len) digitsA.unshift(0);
  while (digitsB.length < len) digitsB.unshift(0);

  const steps: { da: number; db: number; cin: number; raw: number; needFix: boolean; fixed: number; digit: number; cout: number }[] = [];
  let carry = 0;
  for (let i = len - 1; i >= 0; i--) {
    const raw = digitsA[i] + digitsB[i] + carry;
    const needFix = raw > 9;
    const fixed = needFix ? raw + 6 : raw;
    const digit = needFix ? fixed - 16 : raw;
    const cout = needFix ? 1 : 0;
    steps.unshift({ da: digitsA[i], db: digitsB[i], cin: carry, raw, needFix, fixed, digit, cout });
    carry = cout;
  }

  const bcd4 = (n: number) => n.toString(2).padStart(4, "0");

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Why BCD addition needs a fix">
        Each BCD digit is 4 bits, so it can hold 0–15. But a decimal digit only goes up to 9. When a column adds to
        more than 9, the 4-bit adder produces one of the six illegal codes 1010–1111 — or wraps at 16 instead of at 10.
        Adding <strong>6</strong> skips over exactly those six illegal codes and pushes the carry out at the right moment.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-5 items-end">
          <Field label="A (decimal)" value={a} onChange={setA} className="w-32" />
          <span className="pb-3 text-2xl text-[var(--color-ink-faint)]">+</span>
          <Field label="B (decimal)" value={b} onChange={setB} className="w-32" />
          <div className="pb-2.5 font-mono text-sm text-[var(--color-ink-dim)]">= {av + bv}</div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">Digit by digit, right to left</h3>
        <div className="space-y-3">
          {[...steps].reverse().map((s, ri) => {
            const i = steps.length - 1 - ri;
            return (
              <div key={i} className={`rounded-lg border p-4 ${s.needFix ? "border-[var(--color-warn)] bg-[rgba(251,191,36,0.05)]" : "border-[var(--color-line)] bg-[#0d1219]"}`}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-faint)]">
                    digit position {steps.length - 1 - i} ({["units", "tens", "hundreds", "thousands"][steps.length - 1 - i] ?? ""})
                  </span>
                  {s.needFix ? <Chip tone="warn">needs the +6 correction</Chip> : <Chip tone="good">no correction needed</Chip>}
                </div>

                <div className="font-mono text-sm space-y-1.5">
                  <BcdLine label={`A digit = ${s.da}`} bits={bcd4(s.da)} />
                  <BcdLine label={`B digit = ${s.db}`} bits={bcd4(s.db)} />
                  {s.cin > 0 && <BcdLine label={`carry in = ${s.cin}`} bits={bcd4(s.cin)} />}
                  <div className="border-t border-[var(--color-line)] pt-1.5">
                    <BcdLine label={`raw sum = ${s.raw}`} bits={s.raw.toString(2).padStart(s.raw > 15 ? 5 : 4, "0")} tone={s.needFix ? "bad" : "good"} />
                  </div>
                  {s.needFix && (
                    <>
                      <BcdLine label="+ 6 (0110)" bits="0110" tone="warn" />
                      <div className="border-t border-[var(--color-line)] pt-1.5">
                        <BcdLine label={`corrected = ${s.fixed}`} bits={s.fixed.toString(2).padStart(5, "0")} tone="accent" />
                      </div>
                    </>
                  )}
                  <div className="pt-2 text-[13px] text-[var(--color-ink-dim)]">
                    {s.needFix
                      ? <>The raw sum {s.raw} is {s.raw > 9 && s.raw < 16 ? "an illegal BCD code" : "past 15"}. After +6 the low 4 bits are <strong className="text-[var(--color-ink)]">{bcd4(s.digit)}</strong> = digit <strong className="text-[var(--color-ink)]">{s.digit}</strong>, and a carry of 1 goes to the next digit.</>
                      : <>{s.raw} ≤ 9, so it is already a valid BCD digit. Result <strong className="text-[var(--color-ink)]">{bcd4(s.digit)}</strong> = <strong className="text-[var(--color-ink)]">{s.digit}</strong>, no carry.</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <Result label="BCD result" value={(carry ? "1 " : "") + steps.map((s) => bcd4(s.digit)).join(" ")} tone="accent" />
          <Result label="Reads as decimal" value={(carry ? "1" : "") + steps.map((s) => s.digit).join("")} tone="good" sub={`check: ${av} + ${bv} = ${av + bv}`} />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">The correction rule, stated exactly</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-3">
          After a 4-bit binary add producing sum bits S₃S₂S₁S₀ and carry-out C₄, add 6 when:
        </p>
        <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4">
          Fix = C₄ + S₃S₂ + S₃S₁
        </div>
        <p className="text-sm text-[var(--color-ink-dim)] mt-3">
          In words: correct if the 4-bit add already overflowed (C₄ = 1, sum ≥ 16), or if the sum is 10–15
          (S₃ set together with S₂ or S₁). That single expression is the extra logic a BCD adder has on top of a
          plain 4-bit binary adder — plus a second 4-bit adder to actually add the 6.
        </p>
        <Table
          head={["Raw sum", "Binary", "Valid BCD?", "Action", "Digit", "Carry"]}
          rows={Array.from({ length: 20 }, (_, n) => {
            const bad = n > 9;
            return [n, n.toString(2).padStart(5, "0"),
              bad ? <span key="v" className="text-[var(--color-bad)]">no</span> : <span key="v" className="text-[var(--color-hi)]">yes</span>,
              bad ? "+6" : "—", bad ? n + 6 - 16 : n, bad ? 1 : 0];
          })}
          highlight={(i) => i > 9}
        />
      </Panel>
    </div>
  );
}

function BcdLine({ label, bits, tone }: { label: string; bits: string; tone?: "good" | "bad" | "warn" | "accent" }) {
  const col = tone === "bad" ? "var(--color-bad)" : tone === "warn" ? "var(--color-warn)" : tone === "accent" ? "var(--color-accent)" : tone === "good" ? "var(--color-hi)" : "var(--color-ink-dim)";
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-right text-[11px] text-[var(--color-ink-faint)]">{label}</span>
      <span className="tracking-[0.3em]" style={{ color: col }}>{bits}</span>
    </div>
  );
}
