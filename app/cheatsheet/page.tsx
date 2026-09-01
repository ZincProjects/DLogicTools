import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cheat sheet",
  description: "Every formula, rule and definition from SC1005 weeks 1–6 on one page.",
};

type Row = [string, string];
type Card = { title: string; week: number; rows: Row[]; note?: string };

const CARDS: Card[] = [
  {
    title: "Number systems", week: 1,
    rows: [
      ["Any base → decimal", "Multiply each digit by base^position and add"],
      ["Decimal → base b (integer)", "Divide repeatedly by b, read remainders BOTTOM-TO-TOP"],
      ["Decimal → base b (fraction)", "Multiply repeatedly by b, read carries TOP-TO-BOTTOM"],
      ["Binary ⇄ octal", "Group bits in 3s from the binary point"],
      ["Binary ⇄ hex", "Group bits in 4s from the binary point"],
      ["Range of n unsigned bits", "0 to 2ⁿ − 1, i.e. 2ⁿ patterns"],
      ["Bits needed for value V", "⌈log₂(V + 1)⌉"],
    ],
    note: "Never convert hex ⇄ octal through decimal. Go via binary.",
  },
  {
    title: "Codes", week: 1,
    rows: [
      ["BCD (8421)", "Each decimal digit in its own 4 bits. 47 = 0100 0111"],
      ["Illegal BCD codes", "1010 – 1111 (six wasted patterns per digit)"],
      ["Binary → Gray", "G = B ⊕ (B >> 1); MSB copied unchanged"],
      ["Gray → binary", "B₀ = G₀; Bᵢ = Bᵢ₋₁ ⊕ Gᵢ working left to right"],
      ["Gray code property", "Exactly one bit changes between adjacent values"],
      ["ASCII anchors", "'0' = 48, 'A' = 65, 'a' = 97; 7 bits, 128 characters"],
      ["Even parity bit", "P = D₀ ⊕ D₁ ⊕ … ⊕ Dₙ"],
      ["Odd parity bit", "P = (D₀ ⊕ D₁ ⊕ … ⊕ Dₙ)′"],
      ["Parity limitation", "Detects odd numbers of errors only; can never correct"],
    ],
  },
  {
    title: "Gates", week: 1,
    rows: [
      ["AND", "Y = A·B — 1 only when every input is 1. Controlling value 0."],
      ["OR", "Y = A + B — 1 when any input is 1. Controlling value 1."],
      ["NOT", "Y = A′"],
      ["BUFFER", "Y = A — restores drive strength, no logic change"],
      ["NAND", "Y = (A·B)′ — universal gate"],
      ["NOR", "Y = (A + B)′ — universal gate"],
      ["XOR", "Y = A ⊕ B = A′B + AB′ — 1 when inputs DIFFER"],
      ["XNOR", "Y = (A ⊕ B)′ — 1 when inputs are the SAME (equality)"],
      ["Truth table size", "2ⁿ rows for n inputs"],
    ],
  },
  {
    title: "Boolean theorems", week: 1,
    rows: [
      ["A·0 = 0", "A + 1 = 1"],
      ["A·1 = A", "A + 0 = A"],
      ["A·A = A", "A + A = A"],
      ["A·A′ = 0", "A + A′ = 1"],
      ["(A′)′ = A", "double negation"],
      ["A(B + C) = AB + AC", "distributive"],
      ["A + BC = (A+B)(A+C)", "distributive — no arithmetic equivalent!"],
      ["A + AB = A", "absorption"],
      ["A(A + B) = A", "absorption (dual)"],
      ["AB + AB′ = A", "adjacency — what a K-map pair does"],
      ["A + A′B = A + B", "simplification"],
      ["AB + A′C + BC = AB + A′C", "consensus — BC is redundant"],
      ["(A·B)′ = A′ + B′", "DeMorgan 1"],
      ["(A + B)′ = A′·B′", "DeMorgan 2"],
    ],
    note: "DeMorgan in three steps: break the line, change the sign, complement each term.",
  },
  {
    title: "XOR properties", week: 2,
    rows: [
      ["A ⊕ 0 = A", "XOR with 0 passes the signal through"],
      ["A ⊕ 1 = A′", "XOR with 1 inverts — a CONTROLLABLE inverter"],
      ["A ⊕ A = 0", "self-cancelling"],
      ["A ⊕ B ⊕ C ⊕ …", "= 1 when an ODD number of inputs are 1 (parity)"],
    ],
  },
  {
    title: "Adders", week: 2,
    rows: [
      ["Half adder Sum", "A ⊕ B"],
      ["Half adder Carry", "A · B"],
      ["Full adder Sum", "A ⊕ B ⊕ Cin"],
      ["Full adder Cout", "AB + Cin(A ⊕ B) = AB + ACin + BCin"],
      ["Ripple-carry delay", "n × t_pd for n bits — the bottleneck"],
      ["Carry look-ahead", "G = A·B (generate), P = A ⊕ B (propagate); all carries computed in parallel"],
      ["Adder-subtractor", "XOR every B bit with SUB, and feed SUB into C₀"],
    ],
  },
  {
    title: "Signed numbers", week: 2,
    rows: [
      ["Sign-magnitude", "MSB = sign, rest = magnitude. TWO zeros. Range −(2ⁿ⁻¹−1) … +(2ⁿ⁻¹−1)"],
      ["1’s complement", "Flip every bit. TWO zeros. Needs end-around carry."],
      ["2’s complement", "Flip every bit, then add 1. ONE zero."],
      ["2’s complement range", "−2ⁿ⁻¹ … +2ⁿ⁻¹ − 1 (asymmetric)"],
      ["Fast decode", "MSB carries weight −2ⁿ⁻¹; all other columns normal"],
      ["Fast negate", "From the right, copy up to and including the first 1, then invert the rest"],
      ["Sign extension", "Copy the SIGN BIT into every new position (never pad with 0)"],
    ],
  },
  {
    title: "Overflow", week: 3,
    rows: [
      ["Carry rule", "V = C_in(into MSB) ⊕ C_out(of MSB)"],
      ["Sign rule", "Same-signed operands giving an opposite-signed result"],
      ["Never overflows", "Adding two numbers of OPPOSITE sign"],
      ["Carry flag C", "The UNSIGNED result needed one more bit"],
      ["Overflow flag V", "The SIGNED result fell outside the range"],
    ],
    note: "Carry and overflow are different flags for different interpretations of the same bits.",
  },
  {
    title: "Multiplication & BCD", week: 3,
    rows: [
      ["Binary multiply", "Each partial product is 0 or a shifted copy of the multiplicand"],
      ["Product width", "n × n needs 2n bits"],
      ["Array multiplier", "n² AND gates + adder mesh; one cycle"],
      ["Shift-and-add", "One adder, n cycles"],
      ["BCD add correction", "If a digit sum > 9 or produced a carry, add 0110 (6)"],
      ["Correction logic", "Fix = C₄ + S₃S₂ + S₃S₁"],
    ],
  },
  {
    title: "Minterms, maxterms, SOP, POS", week: 4,
    rows: [
      ["Minterm rule", "Variable = 1 → plain; variable = 0 → complemented; AND them"],
      ["Maxterm rule", "Variable = 0 → plain; variable = 1 → complemented; OR them"],
      ["Canonical SOP", "OR the minterms of every row where F = 1. F = Σm(…)"],
      ["Canonical POS", "AND the maxterms of every row where F = 0. F = ΠM(…)"],
      ["Relationship", "Σm(list) = ΠM(all rows not in the list)"],
      ["SOP → one gate type", "All NAND"],
      ["POS → one gate type", "All NOR"],
    ],
  },
  {
    title: "Karnaugh maps", week: 4,
    rows: [
      ["Labelling", "Gray code: 00, 01, 11, 10 — so neighbours differ in one variable"],
      ["Group sizes", "Powers of two only: 1, 2, 4, 8, 16"],
      ["Group of 2ᵏ", "Eliminates k variables"],
      ["Adjacency", "Wraps around all edges; the four corners are mutually adjacent"],
      ["Overlap", "Allowed and often necessary"],
      ["Reading an SOP group", "Keep only variables constant across the group; 1 → plain, 0 → complemented"],
      ["Reading a POS group", "Group the 0s; 0 → plain, 1 → complemented (INVERTED rule)"],
      ["Don’t-cares", "Use an X only if it makes a group bigger; you need not cover any X"],
      ["Essential group", "Contains at least one cell no other group covers"],
    ],
  },
  {
    title: "Enable / disable", week: 4,
    rows: [
      ["AND", "EN = 1 passes; EN = 0 forces output LOW"],
      ["OR", "control = 0 passes; control = 1 forces output HIGH"],
      ["NAND", "EN = 1 passes inverted; EN = 0 forces output HIGH"],
      ["NOR", "control = 0 passes inverted; control = 1 forces output LOW"],
      ["XOR", "control = 0 passes; control = 1 inverts (programmable inversion)"],
    ],
  },
  {
    title: "CMOS", week: 5,
    rows: [
      ["NMOS", "Conducts when gate is HIGH; good at pulling DOWN"],
      ["PMOS", "Conducts when gate is LOW (bubble); good at pulling UP"],
      ["Structure", "PMOS pull-up network + NMOS pull-down network, always duals"],
      ["Series NMOS", "= AND"],
      ["Parallel NMOS", "= OR"],
      ["NAND", "NMOS in SERIES, PMOS in PARALLEL"],
      ["NOR", "NMOS in PARALLEL, PMOS in SERIES"],
      ["Key fact", "CMOS is ALWAYS inverting; Y = (pull-down condition)′"],
      ["Transistor count", "2 per input for a simple gate"],
    ],
  },
  {
    title: "TTL vs CMOS", week: 5,
    rows: [
      ["TTL static power", "High — continuous current flow"],
      ["CMOS static power", "Near zero — no VDD-to-GND path when idle"],
      ["TTL input current", "mA range — inputs load the driver"],
      ["CMOS input current", "≈ 0 — an input is a capacitor"],
      ["TTL fan-out", "Limited (~10) by current"],
      ["CMOS fan-out", "Limited by capacitance, i.e. by speed"],
      ["Noise margin (5 V)", "TTL ≈ 0.4 V; CMOS ≈ 1.45 V"],
    ],
  },
  {
    title: "Active levels & bubbles", week: 5,
    rows: [
      ["HIGH / LOW", "About VOLTAGE — physical"],
      ["Asserted / negated", "About MEANING — is the signal doing its job?"],
      ["Bubble on a pin", "That pin is ACTIVE-LOW"],
      ["No bubble", "Active-HIGH"],
      ["Bubble matching", "Bubbled output should feed a bubbled input; the two cancel"],
      ["Alternate symbol", "Flip the body shape (AND ⇄ OR) and toggle every bubble"],
      ["NAND conversion", "Draw SOP, then replace EVERY gate with a NAND"],
    ],
  },
  {
    title: "Electrical parameters", week: 6,
    rows: [
      ["NM_H", "V_OH − V_IH"],
      ["NM_L", "V_IL − V_OL"],
      ["Worst-case margin", "min(NM_H, NM_L)"],
      ["Fan-out", "min(I_OH/I_IH, I_OL/I_IL), rounded DOWN"],
      ["Static power", "P = V_DD × I_CC"],
      ["Dynamic power", "P = C × V_DD² × f"],
      ["Speed-power product", "P × t_pd — energy per operation, in pJ"],
      ["Rise time t_r", "10% → 90% of a rising edge"],
      ["Fall time t_f", "90% → 10% of a falling edge"],
      ["Propagation delay", "50% in → 50% out; t_pd = (t_PLH + t_PHL)/2"],
      ["Max frequency", "f_max = 1 / (total path delay)"],
    ],
  },
  {
    title: "Outputs & inputs", week: 6,
    rows: [
      ["Totem-pole", "Always drives; never tie two together"],
      ["Tri-state", "Adds Hi-Z; only ONE driver enabled at a time"],
      ["Bus contention", "Two enabled tri-state drivers disagreeing — a short circuit"],
      ["Floating bus", "No driver enabled — drifts into the undefined region"],
      ["Open-drain", "Can only pull LOW; needs an external pull-up; gives wired-AND"],
      ["Open-drain t_r", "= RC — slow rising edge"],
      ["Schmitt trigger", "Two thresholds V_T+ and V_T−; hysteresis V_H = V_T+ − V_T−"],
      ["Schmitt use", "Debouncing, slow edges, noisy lines, relaxation oscillators"],
    ],
  },
  {
    title: "Programmable logic", week: 6,
    rows: [
      ["ROM / PROM", "Fixed AND plane (full decoder), programmable OR plane"],
      ["PLA", "Both planes programmable — most flexible, slowest"],
      ["PAL", "Programmable AND, fixed OR — cheaper and faster, no term sharing"],
      ["FPGA", "Lookup tables + programmable routing + flip-flops"],
    ],
  },
  {
    title: "Number formats", week: 6,
    rows: [
      ["Fixed point Qm.n", "Stored = round(real × 2ⁿ); resolution 2⁻ⁿ"],
      ["Fixed point range", "−2^(m+n−1)/2ⁿ … (2^(m+n−1) − 1)/2ⁿ"],
      ["IEEE-754 single", "1 sign + 8 exponent + 23 mantissa; bias 127"],
      ["IEEE-754 double", "1 sign + 11 exponent + 52 mantissa; bias 1023"],
      ["Value", "(−1)^S × 1.M × 2^(E − bias)"],
      ["Hidden bit", "The leading 1 is implied, not stored"],
      ["E all 0s, M = 0", "±0"],
      ["E all 0s, M ≠ 0", "denormal"],
      ["E all 1s, M = 0", "±Infinity"],
      ["E all 1s, M ≠ 0", "NaN"],
    ],
  },
];

export default function CheatSheet() {
  return (
    <>
      <div className="pt-12 pb-8 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6 grid-paper">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cheat sheet</h1>
        <p className="mt-3 text-[var(--color-ink-dim)] max-w-2xl leading-relaxed">
          Every formula, rule and definition from weeks 1–6, on one page. Prints cleanly.
          If you can explain each line to somebody else, you are ready.
        </p>
      </div>

      <div className="mt-10 columns-1 lg:columns-2 gap-4 [column-fill:_balance]">
        {CARDS.map((c) => (
          <div key={c.title} className="panel p-4 mb-4 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 className="font-bold text-[15px]">{c.title}</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)] shrink-0">W{c.week}</span>
            </div>
            <dl className="space-y-1.5">
              {c.rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(90px,38%)_1fr] gap-3 items-baseline">
                  <dt className="font-mono text-[12px] text-[var(--color-accent)] break-words">{k}</dt>
                  <dd className="text-[12.5px] text-[var(--color-ink-dim)] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            {c.note && (
              <p className="mt-3 pt-2.5 border-t border-[var(--color-line-soft)] text-[12px] text-[var(--color-warn)] leading-snug">
                ⚠ {c.note}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="panel p-6 mt-6">
        <h2 className="font-bold text-lg mb-4">Powers of two</h2>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1.5 font-mono text-sm">
            {Array.from({ length: 17 }, (_, i) => (
              <div key={i} className="text-center rounded-lg border border-[var(--color-line)] bg-[#0d1219] px-2 py-2">
                <div className="text-[10px] text-[var(--color-ink-faint)]">2<sup>{i}</sup></div>
                <div className="text-[var(--color-accent)] font-bold mt-1 text-[13px]">{Math.pow(2, i).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
