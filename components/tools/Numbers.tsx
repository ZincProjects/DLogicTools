"use client";
import { useMemo, useState } from "react";
import { Panel, Field, Seg, Label, Result, Callout, Table, Chip, Bit, NumberStepper } from "@/components/UI";
import {
  parseInBase, toBase, divisionSteps, multiplicationSteps, toBCD, toGray, fromGray,
  parityBit, floatBits, DIGITS,
} from "@/lib/numbers";

/* ========================================================================== */
/* Base converter                                                             */
/* ========================================================================== */

const BASES = [
  { v: 2, label: "Binary (2)" },
  { v: 8, label: "Octal (8)" },
  { v: 10, label: "Decimal (10)" },
  { v: 16, label: "Hex (16)" },
];

export function BaseConverter() {
  const [text, setText] = useState("1011.101");
  const [base, setBase] = useState(2);

  const parsed = useMemo(() => parseInBase(text, base), [text, base]);
  const value = parsed?.value ?? NaN;
  const ok = parsed !== null;
  const intPart = ok ? Math.floor(value) : 0;
  const fracPart = ok ? value - intPart : 0;

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
          <Field label="Your number" value={text} onChange={setText} placeholder="e.g. 1011.101" />
          <div>
            <Label>Which base is it written in?</Label>
            <Seg options={BASES} value={base} onChange={setBase} />
          </div>
        </div>
        {!ok && text.trim() && (
          <div className="mt-3 text-sm text-[var(--color-bad)]">
            That isn’t a valid base-{base} number. Allowed digits: <code className="font-mono">{DIGITS.slice(0, base)}</code>
          </div>
        )}
      </Panel>

      {ok && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Result label="Binary (base 2)" value={toBase(value, 2)} tone="accent" />
            <Result label="Octal (base 8)" value={toBase(value, 8)} />
            <Result label="Decimal (base 10)" value={toBase(value, 10)} />
            <Result label="Hexadecimal (base 16)" value={toBase(value, 16)} />
          </div>

          {/* ------------------------------------------------ positional weights */}
          <Panel>
            <h3 className="font-bold mb-1">Step 1 — why it equals {toBase(value, 10)} in decimal</h3>
            <p className="text-sm text-[var(--color-ink-dim)] mb-4">
              Every digit sits in a column. The column is worth base<sup>position</sup>. Multiply, then add. That is
              <em> all</em> a number system is.
            </p>
            <PositionalBreakdown text={text} base={base} />
          </Panel>

          {/* --------------------------------------------- decimal → other base */}
          <Panel>
            <h3 className="font-bold mb-1">Step 2 — going the other way (decimal → any base)</h3>
            <p className="text-sm text-[var(--color-ink-dim)] mb-4">
              Whole part: divide repeatedly, collect remainders, then <strong>read them bottom-to-top</strong>.
              Fraction part: multiply repeatedly, collect the carried digits, then <strong>read top-to-bottom</strong>.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[2, 8, 16].map((b) => (
                <div key={b}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)] mb-2">→ base {b}</div>
                  <Table
                    head={["N", `÷${b}`, "rem"]}
                    rows={divisionSteps(intPart, b).map((s) => [s.n, s.q, <span key="r" className="text-[var(--color-accent)] font-bold">{s.r}</span>])}
                  />
                  <div className="mt-2 font-mono text-sm">
                    read up ⇒ <span className="text-[var(--color-accent)] font-bold">{toBase(intPart, b)}</span>
                  </div>
                  {fracPart > 1e-12 && (
                    <>
                      <div className="mt-3">
                        <Table
                          head={["frac", `×${b}`, "digit"]}
                          rows={multiplicationSteps(fracPart, b, 8).map((s) => [
                            s.f.toFixed(5), s.prod.toFixed(5),
                            <span key="d" className="text-[var(--color-accent)] font-bold">{s.digit}</span>,
                          ])}
                        />
                      </div>
                      <div className="mt-2 font-mono text-sm">read down ⇒ .{toBase(value, b).split(".")[1] ?? "0"}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="font-bold mb-1">Step 3 — the shortcut you should actually use in the exam</h3>
            <p className="text-sm text-[var(--color-ink-dim)] mb-4">
              8 = 2³ and 16 = 2⁴. So octal and hex are just binary <strong>chopped into groups</strong>. Never go via decimal.
            </p>
            <GroupingView value={value} />
          </Panel>

          <Callout kind="warn" title="The three mistakes that cost marks">
            <ul className="list-disc pl-5 space-y-1">
              <li>Reading division remainders <strong>top-to-bottom</strong>. They go bottom-to-top (LSB comes out first).</li>
              <li>Grouping hex digits from the <strong>left</strong>. Always group from the binary point outwards, padding the ends with 0s.</li>
              <li>Writing <code>101</code> without saying which base. Always subscript: 101₂ = 5₁₀ but 101₁₀ = 101.</li>
            </ul>
          </Callout>
        </>
      )}
    </div>
  );
}

function PositionalBreakdown({ text, base }: { text: string; base: number }) {
  const s = text.trim().toUpperCase().replace(/\s/g, "");
  const [ip, fp = ""] = s.split(".");
  const cells: { d: string; pos: number }[] = [];
  [...ip].forEach((d, i) => cells.push({ d, pos: ip.length - 1 - i }));
  [...fp].forEach((d, i) => cells.push({ d, pos: -(i + 1) }));

  const total = cells.reduce((acc, c) => acc + DIGITS.indexOf(c.d) * Math.pow(base, c.pos), 0);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1.5 items-end">
        {cells.map((c, i) => (
          <div key={i} className="text-center">
            {c.pos === -1 && <div className="text-[var(--color-ink-faint)] text-xs mb-1">↓ point</div>}
            <div className="w-16 rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-2">
              <div className="font-mono text-xl font-bold text-[var(--color-accent)]">{c.d}</div>
              <div className="text-[10px] text-[var(--color-ink-faint)] mt-1 font-mono">{base}<sup>{c.pos}</sup></div>
              <div className="text-[10px] text-[var(--color-ink-dim)] font-mono mt-0.5">
                ={Math.pow(base, c.pos) < 0.001 ? Math.pow(base, c.pos).toExponential(1) : +Math.pow(base, c.pos).toFixed(4)}
              </div>
              <div className="text-[11px] font-mono mt-1.5 pt-1.5 border-t border-[var(--color-line)] text-[var(--color-hi)]">
                {+(DIGITS.indexOf(c.d) * Math.pow(base, c.pos)).toFixed(4)}
              </div>
            </div>
          </div>
        ))}
        <div className="pl-3 pb-2 font-mono text-lg">
          = <span className="text-[var(--color-hi)] font-bold">{+total.toFixed(6)}</span><sub className="text-xs">10</sub>
        </div>
      </div>
    </div>
  );
}

function GroupingView({ value }: { value: number }) {
  const bin = toBase(value, 2);
  const [bi, bf = ""] = bin.split(".");

  const group = (n: number) => {
    const ipPad = bi.padStart(Math.ceil(bi.length / n) * n, "0");
    const fpPad = bf ? bf.padEnd(Math.ceil(bf.length / n) * n, "0") : "";
    const gi = ipPad.match(new RegExp(`.{${n}}`, "g")) ?? [];
    const gf = fpPad ? fpPad.match(new RegExp(`.{${n}}`, "g")) ?? [] : [];
    return { gi, gf };
  };

  const render = (n: number, label: string) => {
    const { gi, gf } = group(n);
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)] mb-2">
          {label} — group the binary in {n}s
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {gi.map((g, i) => (
            <div key={i} className="text-center">
              <div className="font-mono text-sm px-2 py-1 rounded bg-[#0d1219] border border-[var(--color-line)]">{g}</div>
              <div className="font-mono text-lg font-bold text-[var(--color-accent)] mt-1">{DIGITS[parseInt(g, 2)]}</div>
            </div>
          ))}
          {gf.length > 0 && <div className="text-2xl px-1 text-[var(--color-ink-faint)]">.</div>}
          {gf.map((g, i) => (
            <div key={"f" + i} className="text-center">
              <div className="font-mono text-sm px-2 py-1 rounded bg-[#0d1219] border border-[var(--color-line)]">{g}</div>
              <div className="font-mono text-lg font-bold text-[var(--color-accent)] mt-1">{DIGITS[parseInt(g, 2)]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="font-mono text-sm text-[var(--color-ink-dim)]">binary = {bin}</div>
      {render(3, "Octal")}
      {render(4, "Hexadecimal")}
    </div>
  );
}

/* ========================================================================== */
/* Code explorer                                                              */
/* ========================================================================== */

export function CodeExplorer() {
  const [n, setN] = useState("2025");
  const num = Math.max(0, Math.min(999999, parseInt(n || "0", 10) || 0));
  const straight = num.toString(2);
  const bcd = toBCD(num);
  const width = Math.max(4, straight.length);
  const padded = straight.padStart(width, "0");
  const gray = toGray(padded);

  const [text, setText] = useState("Hi!");

  return (
    <div className="space-y-5">
      <Callout kind="key" title="The one idea behind all codes">
        A code is an <strong>agreement</strong>: “this pattern of bits means that thing.” Straight binary optimises for
        arithmetic. BCD optimises for showing digits on a display. Gray code optimises for not glitching.
        ASCII optimises for text. Same bits, different deals.
      </Callout>

      <Panel>
        <Field label="Type a decimal number" value={n} onChange={setN} placeholder="0 – 999999" />
        <div className="mt-5 space-y-5">
          <CodeRow
            title="Straight binary"
            why="The actual value in base 2. Use this whenever you want to do maths."
            bits={padded}
            note={`${padded.length} bits`}
          />
          <CodeRow
            title="BCD (binary-coded decimal, 8421)"
            why="Each decimal digit gets its own 4-bit code, kept separate. A 7-segment display can read this directly."
            bits={bcd.join(" ")}
            note={`${bcd.length} digits × 4 bits = ${bcd.length * 4} bits`}
            groups={bcd.map((b, i) => ({ label: String(num)[i], bits: b }))}
          />
          <CodeRow
            title="Gray code"
            why="Only ONE bit changes between neighbouring values. Perfect for rotary encoders, where two bits changing at slightly different times would produce a nonsense reading."
            bits={gray}
            note="XOR each bit with the one to its left"
          />
        </div>

        <div className="mt-6 rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4">
          <div className="text-sm font-semibold mb-2">Why BCD is bigger than straight binary</div>
          <p className="text-sm text-[var(--color-ink-dim)]">
            {num} needs <strong className="text-[var(--color-ink)]">{padded.length} bits</strong> in straight binary but{" "}
            <strong className="text-[var(--color-ink)]">{bcd.length * 4} bits</strong> in BCD. BCD wastes the six
            unused patterns 1010–1111 in every single digit. You pay in bits; you get easy display in return.
          </p>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">Gray code counting sequence</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          Watch the highlighted column: exactly one bit flips per step, including from the last row back to the first.
        </p>
        <GrayTable bits={4} />
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">ASCII</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          7 bits per character (0–127), usually stored in 8 bits. <code>&apos;A&apos;</code>=65, <code>&apos;a&apos;</code>=97,
          <code>&apos;0&apos;</code>=48 — those three are worth memorising, everything else follows by counting.
        </p>
        <Field label="Type some text" value={text} onChange={setText} mono={false} />
        <div className="mt-4 overflow-x-auto">
          <Table
            head={["Char", "Decimal", "Hex", "Binary (7-bit)", "With even parity (8 bits)"]}
            rows={[...text].slice(0, 24).map((c) => {
              const code = c.charCodeAt(0);
              const b = code.toString(2).padStart(7, "0");
              return [
                <span key="c" className="text-[var(--color-accent)] font-bold">{c === " " ? "␣" : c}</span>,
                code, "0x" + code.toString(16).toUpperCase().padStart(2, "0"), b,
                <span key="p"><span className="text-[var(--color-warn)]">{parityBit(b, "even")}</span>{b}</span>,
              ];
            })}
          />
        </div>
      </Panel>
    </div>
  );
}

function CodeRow({ title, why, bits, note, groups }:
  { title: string; why: string; bits: string; note: string; groups?: { label: string; bits: string }[] }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-semibold">{title}</div>
        <div className="text-[11px] text-[var(--color-ink-faint)] font-mono">{note}</div>
      </div>
      <p className="text-[13px] text-[var(--color-ink-dim)] mt-1 leading-relaxed">{why}</p>
      {groups ? (
        <div className="flex flex-wrap gap-3 mt-3">
          {groups.map((g, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-[var(--color-ink-faint)] mb-1">digit “{g.label}”</div>
              <div className="flex gap-1">{[...g.bits].map((b, j) => <Bit key={j} v={b === "1" ? 1 : 0} size="sm" />)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-mono text-lg text-[var(--color-accent)] mt-3 tracking-widest break-all">{bits}</div>
      )}
    </div>
  );
}

function GrayTable({ bits }: { bits: number }) {
  const rows = [];
  for (let i = 0; i < 1 << bits; i++) {
    const b = i.toString(2).padStart(bits, "0");
    const g = toGray(b);
    const prev = i === 0 ? toGray(((1 << bits) - 1).toString(2).padStart(bits, "0")) : toGray((i - 1).toString(2).padStart(bits, "0"));
    const changed = [...g].map((c, j) => c !== prev[j]);
    rows.push([
      i, b,
      <span key="g" className="tracking-widest">
        {[...g].map((c, j) => (
          <span key={j} className={changed[j] ? "text-[var(--color-warn)] font-bold bg-[#2a2416] px-0.5 rounded" : ""}>{c}</span>
        ))}
      </span>,
    ]);
  }
  return <Table head={["Decimal", "Straight binary", "Gray code (changed bit highlighted)"]} rows={rows} />;
}

/* ========================================================================== */
/* Parity lab                                                                 */
/* ========================================================================== */

export function ParityLab() {
  const [data, setData] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1]);
  const [kind, setKind] = useState<"even" | "odd">("even");
  const [flipped, setFlipped] = useState<number[]>([]);

  const bitsStr = data.join("");
  const p = parityBit(bitsStr, kind);
  const sent = [...data, Number(p) as 0 | 1];
  const received = sent.map((b, i) => (flipped.includes(i) ? ((b ^ 1) as 0 | 1) : b));
  const receivedOnes = received.filter((b) => b === 1).length;
  const expectEven = kind === "even";
  const passes = expectEven ? receivedOnes % 2 === 0 : receivedOnes % 2 === 1;
  const actuallyCorrupted = flipped.length > 0;

  return (
    <div className="space-y-5">
      <Callout kind="tip">
        A parity bit is one extra bit tacked on so that the total number of 1s comes out even (even parity) or
        odd (odd parity). The receiver counts the 1s. Wrong count ⇒ something got corrupted in transit.
        It is the cheapest error <em>detection</em> there is — one bit, one XOR tree.
      </Callout>

      <Panel>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <Label>Parity scheme</Label>
            <Seg options={[{ v: "even" as const, label: "Even parity" }, { v: "odd" as const, label: "Odd parity" }]} value={kind} onChange={setKind} />
          </div>
          <div>
            <Label>Data bits (click to toggle)</Label>
            <div className="flex gap-1.5">
              {data.map((b, i) => (
                <Bit key={i} v={b} onClick={() => setData(data.map((x, j) => (i === j ? ((x ^ 1) as 0 | 1) : x)))} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-4">
        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">1 · Transmitter</div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">
            Counts the 1s in the data: <strong className="text-[var(--color-ink)]">{data.filter((b) => b).length}</strong>.
          </div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">
            For {kind} parity the total must be {kind}, so it appends <strong className="text-[var(--color-warn)]">P = {p}</strong>.
          </div>
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {data.map((b, i) => <Bit key={i} v={b} size="sm" />)}
            <Bit v={Number(p) as 0 | 1} size="sm" tone="warn" />
          </div>
          <div className="text-[11px] text-[var(--color-ink-faint)] mt-1.5">data · parity</div>
        </Panel>

        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">2 · Noisy channel</div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">Click a bit to corrupt it in transit.</div>
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {sent.map((b, i) => (
              <button key={i}
                onClick={() => setFlipped(flipped.includes(i) ? flipped.filter((x) => x !== i) : [...flipped, i])}
                className={`w-9 h-9 rounded-md font-mono font-bold border grid place-items-center transition
                  ${flipped.includes(i) ? "bg-[#301616] border-[var(--color-bad)] text-[var(--color-bad)]" : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-dim)] hover:border-[var(--color-accent)]"}`}>
                {flipped.includes(i) ? "⚡" : b}
              </button>
            ))}
          </div>
          {flipped.length > 0 && (
            <button onClick={() => setFlipped([])} className="mt-3 text-xs text-[var(--color-accent)] underline">clear all errors</button>
          )}
        </Panel>

        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">3 · Receiver / checker</div>
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {received.map((b, i) => <Bit key={i} v={b} size="sm" />)}
          </div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">
            Number of 1s received: <strong className="text-[var(--color-ink)]">{receivedOnes}</strong> ({receivedOnes % 2 === 0 ? "even" : "odd"})
          </div>
          <div className="mt-3">
            {passes ? <Chip tone="good">Checker says: OK</Chip> : <Chip tone="bad">Checker says: ERROR</Chip>}
          </div>
          {actuallyCorrupted && passes && (
            <div className="mt-3 text-sm text-[var(--color-warn)] leading-relaxed">
              But the data really <em>is</em> wrong! You flipped {flipped.length} bits — an even number of errors cancels out.
              <strong> This is the fundamental limit of single-bit parity.</strong>
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <h3 className="font-bold mb-1">How it is built: an XOR tree</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-3">
          XOR outputs 1 when its inputs differ, which means a chain of XORs outputs 1 exactly when there is an
          <strong> odd number of 1s</strong>. That is a parity generator. The same circuit at the far end is the checker.
        </p>
        <div className="font-mono text-sm text-[var(--color-ink-dim)] rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 space-y-1">
          <div>Even-parity bit  P = D₀ ⊕ D₁ ⊕ D₂ ⊕ … ⊕ Dₙ</div>
          <div>Odd-parity bit   P = (D₀ ⊕ D₁ ⊕ … ⊕ Dₙ)′</div>
          <div className="pt-2">Checker  E = D₀ ⊕ D₁ ⊕ … ⊕ Dₙ ⊕ P   → E=1 means error (for even parity)</div>
        </div>
      </Panel>

      <Callout kind="warn">
        Parity <strong>detects</strong> an odd number of bit errors. It cannot detect an even number, and it can never
        <em> correct</em> anything — it doesn’t know which bit is wrong. If an exam question asks “can this scheme
        correct the error?”, the answer for plain parity is always no.
      </Callout>
    </div>
  );
}

/* ========================================================================== */
/* Fixed & floating point                                                     */
/* ========================================================================== */

export function FloatLab() {
  const [val, setVal] = useState("-12.375");
  const [dbl, setDbl] = useState(false);
  const [intBits, setIntBits] = useState(8);
  const [fracBits, setFracBits] = useState(8);

  const v = parseFloat(val);
  const valid = !isNaN(v);
  const f = valid ? floatBits(v, dbl) : null;

  // fixed point
  const scale = Math.pow(2, fracBits);
  const fxRaw = valid ? Math.round(v * scale) : 0;
  const total = intBits + fracBits;
  const fxMax = (Math.pow(2, total - 1) - 1) / scale;
  const fxMin = -Math.pow(2, total - 1) / scale;
  const fxFits = valid && v <= fxMax && v >= fxMin;
  const fxBits = fxFits ? ((fxRaw < 0 ? Math.pow(2, total) + fxRaw : fxRaw) >>> 0).toString(2).padStart(total, "0").slice(-total) : "";
  const fxActual = fxRaw / scale;

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <Field label="A real number" value={val} onChange={setVal} placeholder="e.g. -12.375" />
          <div>
            <Label>Floating-point precision</Label>
            <Seg options={[{ v: false, label: "Single (32-bit)" }, { v: true, label: "Double (64-bit)" }]} value={dbl} onChange={setDbl} />
          </div>
        </div>
      </Panel>

      <Callout kind="key" title="Fixed vs floating in one sentence each">
        <p><strong>Fixed point:</strong> the binary point is nailed to one position. Simple, fast, but the range is small.</p>
        <p><strong>Floating point:</strong> you store the digits and separately store <em>where</em> the point goes — like
        scientific notation. Huge range, but the spacing between representable numbers grows as the numbers grow.</p>
      </Callout>

      {/* --------------------------------------------------------- fixed point */}
      <Panel>
        <h3 className="font-bold mb-1">Fixed point (Q{intBits}.{fracBits} format)</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          Store the number as a plain 2’s complement integer, then <em>pretend</em> there is a binary point
          {" "}{fracBits} places from the right. Nothing in the hardware knows about the point — it is
          bookkeeping in your head.
        </p>
        <div className="flex flex-wrap gap-6 mb-4">
          <NumberStepper label="Integer bits" value={intBits} onChange={setIntBits} min={1} max={16} />
          <NumberStepper label="Fraction bits" value={fracBits} onChange={setFracBits} min={0} max={16} />
        </div>

        {fxFits ? (
          <>
            <div className="flex flex-wrap gap-1.5 items-center">
              {[...fxBits].map((b, i) => (
                <span key={i} className="contents">
                  {i === intBits && <span className="text-2xl text-[var(--color-warn)] font-bold px-1">.</span>}
                  <Bit v={b === "1" ? 1 : 0} size="sm" tone={i < intBits ? "accent" : undefined} />
                </span>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <Result label="Stored integer" value={fxRaw} sub={`= round(${v} × 2^${fracBits})`} />
              <Result label="Value it represents" value={fxActual} sub={`= ${fxRaw} ÷ 2^${fracBits}`} tone={fxActual === v ? "good" : "bad"} />
              <Result label="Resolution (step size)" value={`2^-${fracBits} = ${1 / scale}`} sub={`range ${fxMin} … ${fxMax}`} />
            </div>
            {fxActual !== v && (
              <div className="mt-3 text-sm text-[var(--color-warn)]">
                Rounding error of {Math.abs(fxActual - v).toPrecision(3)} — this format cannot hold {v} exactly.
                Add fraction bits to shrink the error.
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-[var(--color-bad)]">
            {v} is outside the range {fxMin} … {fxMax} for Q{intBits}.{fracBits}. Add integer bits.
          </div>
        )}
      </Panel>

      {/* ------------------------------------------------------ floating point */}
      {f && (
        <Panel>
          <h3 className="font-bold mb-1">IEEE-754 {dbl ? "double" : "single"} precision</h3>
          <p className="text-sm text-[var(--color-ink-dim)] mb-4">
            Value = (−1)<sup>S</sup> × 1.M × 2<sup>(E − {f.bias})</sup>. The leading 1 is not stored — it’s always
            there for normalised numbers, so storing it would waste a bit.
          </p>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-0.5 min-w-max">
              <BitBlock label="S (sign)" bits={f.sign} color="var(--color-bad)" />
              <BitBlock label={`E (exponent, ${f.exp.length} bits)`} bits={f.exp} color="var(--color-warn)" />
              <BitBlock label={`M (mantissa, ${f.mant.length} bits)`} bits={f.mant} color="var(--color-accent)" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <Result label="Sign S" value={f.sign} sub={f.sign === "1" ? "negative" : "positive"} tone="bad" />
            <Result label="Stored exponent E" value={parseInt(f.exp, 2)} sub={`unbiased: ${parseInt(f.exp, 2)} − ${f.bias} = ${parseInt(f.exp, 2) - f.bias}`} />
            <Result label="Mantissa (with hidden 1)" value={"1." + f.mant.slice(0, 12) + (f.mant.length > 12 ? "…" : "")} sub={`= ${(1 + parseInt(f.mant.slice(0, 23) || "0", 2) / Math.pow(2, Math.min(23, f.mant.length))).toFixed(8)}`} />
            <Result label="Value actually stored" value={f.actual} tone={f.actual === v ? "good" : "bad"} sub={f.actual === v ? "exact" : `you asked for ${v}`} />
          </div>

          <div className="mt-5 rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 text-sm font-mono text-[var(--color-ink-dim)] leading-relaxed">
            <div>hex: 0x{parseInt(f.bits.slice(0, 32), 2).toString(16).toUpperCase().padStart(8, "0")}{dbl ? "…" : ""}</div>
            <div className="mt-2">
              = (−1)<sup>{f.sign}</sup> × 1.{f.mant.slice(0, 10)}… × 2<sup>{parseInt(f.exp, 2) - f.bias}</sup>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">The special exponent patterns</div>
            <Table
              head={["Exponent E", "Mantissa M", "Means"]}
              rows={[
                ["all 0s", "all 0s", "±0 (zero has no representation otherwise, because of the hidden 1)"],
                ["all 0s", "non-zero", "denormal — very small numbers, hidden bit is 0 instead of 1"],
                ["all 1s", "all 0s", "±Infinity"],
                ["all 1s", "non-zero", "NaN (not a number)"],
                [`1 … ${Math.pow(2, f.exp.length) - 2}`, "anything", "normal number, hidden 1 applies"],
              ]}
            />
          </div>
        </Panel>
      )}

      <Callout kind="warn">
        0.1 cannot be written exactly in binary, in the same way 1/3 cannot be written exactly in decimal.
        Type <code>0.1</code> above and look at &ldquo;value actually stored&rdquo;. This is why you never compare
        floats with <code>==</code>.
      </Callout>
    </div>
  );
}

function BitBlock({ label, bits, color }: { label: string; bits: string; color: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 whitespace-nowrap" style={{ color }}>{label}</div>
      <div className="flex gap-0.5">
        {[...bits].map((b, i) => (
          <div key={i} className="w-5 h-8 grid place-items-center font-mono text-xs font-bold rounded-sm border"
            style={{ borderColor: color + "66", background: b === "1" ? color + "22" : "#0d1219", color: b === "1" ? color : "#4a5568" }}>
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}
