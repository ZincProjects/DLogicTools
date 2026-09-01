"use client";
import { Callout, Table, Panel, Chip, Steps } from "@/components/UI";
import { GateSymbol, IEEESymbol } from "@/components/Gates";
import ToolLink from "@/components/ToolLink";

/* ======================================================================== */
/* W1 · What digital means                                                  */
/* ======================================================================== */

export function WhatIsDigital() {
  return (
    <>
      <h2>The one decision that creates the whole subject</h2>
      <p>
        The world is analog. Temperature, sound pressure, the brightness of a room — all of them slide smoothly
        through infinitely many values. A <strong>digital</strong> system deliberately refuses to represent that.
        It picks a small set of allowed values and rounds everything to the nearest one.
      </p>
      <p>
        In practice we pick <em>two</em> values, because two is the easiest number to build reliably out of
        transistors: a switch is either on or off. Everything else in SC1005 follows from that single choice.
      </p>

      <Callout kind="tip">
        Think of a staircase versus a ramp. A ramp (analog) can put you at any height; a nudge moves you slightly.
        A staircase (digital) only lets you stand on steps; a nudge does nothing at all, because you snap back to the
        step you were on. <strong>That snapping-back is noise immunity</strong>, and it is why digital won.
      </Callout>

      <h3>What you give up, and what you get</h3>
      <Table
        head={["", "Analog", "Digital"]}
        rows={[
          ["Values", "Infinitely many", "Exactly two per wire (0 and 1)"],
          ["Noise", "Accumulates — every stage adds a bit more", "Erased at every gate, as long as it stays under the noise margin"],
          ["Copying", "Degrades each time", "Perfect, indefinitely"],
          ["Storage", "Hard (magnetic tape, vinyl)", "Easy and cheap"],
          ["Precision", "Limited by physics", "Add more bits whenever you want more precision"],
          ["Cost of precision", "Free (it is already continuous)", "n bits gives 2ⁿ levels — you pay in wires and gates"],
        ]}
      />

      <h3>Turning an analog quantity into bits</h3>
      <p>
        An <strong>ADC</strong> (analog-to-digital converter) samples a voltage at regular intervals and rounds each
        sample to one of 2ⁿ levels. Two numbers describe it completely:
      </p>
      <ul>
        <li><strong>Resolution</strong> — how finely you slice the voltage range: (V<sub>max</sub> − V<sub>min</sub>) / 2ⁿ.
          An 8-bit ADC over 0–5 V has 256 steps, so each step is 5/256 ≈ 19.5 mV.</li>
        <li><strong>Sampling rate</strong> — how often you look. To reconstruct a signal you must sample at more than
          twice its highest frequency (the Nyquist rate). CD audio uses 44.1 kHz for a 20 kHz signal.</li>
      </ul>
      <p>
        Going the other way, a <strong>DAC</strong> turns numbers back into a voltage. Your phone does both millions of
        times a second, and the “quality” arguments people have about audio are really arguments about
        resolution and sampling rate.
      </p>

      <h3>Voltage: what a 0 and a 1 actually are</h3>
      <p>
        There is no such thing as a “1” inside a chip. There is a voltage, and a rule for interpreting it.
        A 3.3 V CMOS gate might say: anything above 2.0 V is a 1, anything below 0.8 V is a 0, and anything between
        is <strong>undefined</strong> — the gate is allowed to do whatever it likes, which in practice means
        oscillating and burning power.
      </p>
      <p>
        Crucially, outputs are held to a <em>tighter</em> standard than inputs. A gate must drive at least 2.4 V for a
        1, but will accept anything above 2.0 V. That deliberate 0.4 V gap is the <strong>noise margin</strong> —
        the amount of interference a signal can pick up on its way down a wire and still be understood.
      </p>
      <ToolLink slug="voltage-levels">Drag a voltage around and watch a gate decide what it means</ToolLink>

      <h3>How many transistors? A quick history</h3>
      <Table
        head={["Scale", "Gates per chip", "Era / examples"]}
        rows={[
          ["SSI — small-scale integration", "1 – 12", "1960s. The 7400 series: four NAND gates in one 14-pin package."],
          ["MSI — medium", "12 – 99", "Adders, decoders, multiplexers, counters as single chips."],
          ["LSI — large", "100 – 9,999", "Early microprocessors, small memories."],
          ["VLSI — very large", "10,000 – 999,999", "1980s–90s CPUs."],
          ["ULSI / SoC", "1,000,000+", "Today. A modern phone SoC has tens of billions of transistors."],
        ]}
      />
      <p>
        You still learn the SSI/MSI building blocks because a billion-transistor chip is made of them. The adder you
        will build by hand in week 2 exists, essentially unchanged, inside every processor ever made.
      </p>

      <h3>Programmable logic — buying the blank instead of the part</h3>
      <p>
        Instead of ordering a chip that does exactly what you want, you can buy one full of <em>unconnected</em> logic
        and decide the connections yourself:
      </p>
      <ul>
        <li><strong>PROM / ROM</strong> — a fixed decoder feeding a programmable OR array. Effectively a truth table burned into silicon.</li>
        <li><strong>PLA</strong> — both the AND array and the OR array are programmable. The most flexible, and the slowest.</li>
        <li><strong>PAL</strong> — programmable AND array, fixed OR array. Cheaper and faster than a PLA.</li>
        <li><strong>CPLD / FPGA</strong> — the modern versions, with thousands of small lookup tables plus programmable routing and flip-flops. You describe the circuit in Verilog and the tools work out the configuration.</li>
      </ul>
      <ToolLink slug="pla-builder">Program an AND plane and an OR plane yourself</ToolLink>

      <h3>Moving data: serial or parallel</h3>
      <p>
        Once you have bits you have to move them. Either give every bit its own wire and send them all at once
        (<strong>parallel</strong>), or send them one after another down a single wire (<strong>serial</strong>).
        Parallel is fast but needs many wires and suffers from <em>skew</em> — bits arriving at slightly different
        times. Serial needs one wire and no skew, which is why every fast modern link (USB, SATA, PCIe, Ethernet) is
        serial despite needing 8 clock ticks per byte.
      </p>
      <ToolLink slug="serial-parallel">Watch a byte move both ways</ToolLink>

      <h3>The software side</h3>
      <p>
        Nobody draws billion-gate schematics. Designers write <strong>HDL</strong> — Verilog or VHDL — describing
        behaviour, and a <em>synthesis</em> tool converts it into gates. Before anything is built, a
        <strong> simulator</strong> checks it against a testbench. You will meet Verilog later in SC1005; for now
        just know that the gates you are learning are what the tool produces at the far end.
      </p>

      <Callout kind="key" title="What to take away from week 1, lecture 1">
        <ul className="list-disc pl-5 space-y-1">
          <li>Digital = deliberately throwing away detail to gain noise immunity.</li>
          <li>A logic level is a voltage <em>range</em>, not a value; the gap between output and input specs is the noise margin.</li>
          <li>n bits gives 2ⁿ distinct values. That formula appears in nearly every question in the course.</li>
          <li>Parallel trades wires for time; serial trades time for wires.</li>
        </ul>
      </Callout>
    </>
  );
}

/* ======================================================================== */
/* W1 · Number systems                                                      */
/* ======================================================================== */

export function NumberSystems() {
  return (
    <>
      <h2>A number system is just a set of columns</h2>
      <p>
        When you write 472 you never think about it, but you are saying
        “4 hundreds, 7 tens, 2 ones”. Each column is worth ten times the one to its right, because you
        happen to have ten fingers. Change that ten to any other number and everything else stays identical.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)]">
        472₁₀ = 4×10² + 7×10¹ + 2×10⁰<br />
        1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 8 + 0 + 2 + 1 = 11₁₀<br />
        2F₁₆ = 2×16¹ + 15×16⁰ = 32 + 15 = 47₁₀
      </div>

      <h3>The four bases you need</h3>
      <Table
        head={["Base", "Name", "Digits", "Why it exists"]}
        rows={[
          ["2", "Binary", "0 1", "What the hardware physically is — a wire is on or off."],
          ["8", "Octal", "0–7", "One octal digit = exactly 3 bits. Older systems used it; rarer today."],
          ["10", "Decimal", "0–9", "What humans think in. Convenient for nobody else."],
          ["16", "Hexadecimal", "0–9 A–F", "One hex digit = exactly 4 bits. The standard shorthand for writing binary."],
        ]}
      />

      <Callout kind="key" title="The four conversions, and the two you should actually use">
        <p><strong>Any base → decimal:</strong> multiply each digit by its column weight and add. Always works.</p>
        <p><strong>Decimal → any base:</strong> repeated division for the whole part (read remainders <em>bottom-to-top</em>),
        repeated multiplication for the fraction (read the carries <em>top-to-bottom</em>).</p>
        <p><strong>Binary ⇄ octal:</strong> group the bits in 3s from the binary point.</p>
        <p><strong>Binary ⇄ hex:</strong> group the bits in 4s from the binary point. <em>Never</em> route hex↔octal through decimal — go via binary.</p>
      </Callout>

      <h3>The grouping shortcut, spelled out</h3>
      <p>
        Because 8 = 2³ and 16 = 2⁴, one octal digit is exactly three bits and one hex digit is exactly four.
        So converting is pure pattern-matching, with no arithmetic at all:
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        1011 0110 . 1100₂<br />
        &nbsp;&nbsp;&nbsp;B&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;C₁₆<br /><br />
        Pad the ends, never the middle:<br />
        10110110₂ → 1011 0110 → B6₁₆ &nbsp;(pad the LEFT of the integer part)<br />
        0.11₂ → 0.1100 → 0.C₁₆ &nbsp;(pad the RIGHT of the fraction part)
      </div>

      <h3>Binary weights worth memorising</h3>
      <p>
        You will convert small numbers hundreds of times this semester. Knowing the powers of two up to 2¹⁰ by
        reflex saves minutes in every exam.
      </p>
      <div className="overflow-x-auto my-4">
        <div className="inline-flex gap-2 font-mono text-sm">
          {[1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].map((v, i) => (
            <div key={v} className="text-center rounded-lg border border-[var(--color-line)] bg-[#0d1219] px-2.5 py-2">
              <div className="text-[10px] text-[var(--color-ink-faint)]">2<sup>{i}</sup></div>
              <div className="text-[var(--color-accent)] font-bold mt-1">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <p>
        The fastest hand method for decimal → binary is not division at all: it is subtraction. To convert 200,
        find the largest power of two that fits (128), subtract, repeat. 200 − 128 = 72, 72 − 64 = 8, 8 − 8 = 0.
        So the bits set are 128, 64, 8 ⇒ <code>11001000</code>. Try both methods and use whichever sticks.
      </p>

      <h3>Fractions</h3>
      <p>
        Columns to the right of the point are worth 2⁻¹, 2⁻², 2⁻³ … i.e. 0.5, 0.25, 0.125. To convert a decimal
        fraction, multiply repeatedly by 2 and record the whole part each time:
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        0.625 × 2 = <span className="text-[var(--color-accent)]">1</span>.25 &nbsp;→ first bit 1<br />
        0.25&nbsp; × 2 = <span className="text-[var(--color-accent)]">0</span>.5&nbsp;&nbsp;→ next bit 0<br />
        0.5&nbsp;&nbsp; × 2 = <span className="text-[var(--color-accent)]">1</span>.0&nbsp;&nbsp;→ next bit 1, and we hit zero — stop<br />
        0.625₁₀ = 0.101₂
      </div>
      <Callout kind="warn">
        Most decimal fractions <strong>never terminate</strong> in binary. 0.1₁₀ = 0.000110011001100…₂ forever, exactly
        as 1/3 never terminates in decimal. When a question says “convert to 6 binary places”, it is
        because the process would otherwise never stop. This is also the reason floating-point arithmetic surprises people.
      </Callout>

      <ToolLink slug="base-converter">Convert anything and see every step of the working</ToolLink>

      <h3>Counting the range</h3>
      <p>
        With n bits you can write <strong>2ⁿ</strong> different patterns, representing unsigned values
        <strong> 0 to 2ⁿ − 1</strong>. Eight bits: 256 patterns, values 0–255. Going the other way, to hold a value V
        you need <strong>⌈log₂(V+1)⌉</strong> bits — or just find the smallest power of two greater than V.
      </p>
    </>
  );
}

/* ======================================================================== */
/* W1 · Codes                                                               */
/* ======================================================================== */

export function Codes() {
  return (
    <>
      <h2>Bits that aren’t numbers</h2>
      <p>
        So far <code>1011</code> has meant eleven. But a bit pattern only means something because we
        <em> agreed</em> it does. Change the agreement and the same four bits mean something else entirely.
        Each of the codes below is a different agreement, chosen to make one particular job easy.
      </p>

      <h3>1 · Straight binary</h3>
      <p>
        The pattern <em>is</em> the value in base 2. Best for arithmetic — an adder can work on it directly.
        Worst for driving a decimal display, because you would have to divide by ten to find each digit.
      </p>

      <h3>2 · BCD — binary-coded decimal</h3>
      <p>
        Encode each decimal digit separately in 4 bits, and never let the digits mix. 47 becomes
        <code> 0100 0111</code>, not <code>101111</code>.
      </p>
      <Table
        head={["Decimal", "BCD (8421)", "Straight binary"]}
        rows={[["0", "0000", "0"], ["5", "0101", "101"], ["9", "1001", "1001"], ["47", "0100 0111", "101111"], ["100", "0001 0000 0000", "1100100"]]}
      />
      <ul>
        <li><strong>Good:</strong> a 7-segment display decoder reads one BCD digit and lights the segments. No division needed. Calculators, meters and clocks all use it.</li>
        <li><strong>Bad:</strong> it wastes the six patterns 1010–1111 in every digit, so BCD numbers are roughly 20% longer. And arithmetic needs a correction step (see <ToolLink slug="bcd-adder" inline>the BCD adder</ToolLink>).</li>
      </ul>
      <Callout kind="warn">
        <code>0100 0111</code> is <strong>47 in BCD</strong> but <strong>71 in straight binary</strong>. A question that
        does not say which code it means is testing whether you noticed. Always state your assumption.
      </Callout>

      <h3>3 · Gray code</h3>
      <p>
        A counting sequence in which <strong>exactly one bit changes</strong> between consecutive values —
        including from the last value back to the first.
      </p>
      <Table
        head={["Decimal", "Binary", "Gray"]}
        rows={[["0", "000", "000"], ["1", "001", "001"], ["2", "010", "011"], ["3", "011", "010"], ["4", "100", "110"], ["5", "101", "111"], ["6", "110", "101"], ["7", "111", "100"]]}
      />
      <p>
        Why bother? Consider a rotary position sensor going from 3 to 4. In straight binary that is
        <code> 011 → 100</code>: all three bits change. They will never change at exactly the same instant,
        so for a few nanoseconds the sensor might read <code>111</code> (=7) or <code>000</code> (=0) — a wild
        error at the worst possible moment. In Gray code, 3→4 is <code>010 → 110</code>: one bit moves, so the
        worst you can ever read is one of the two neighbouring values.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)]">
        binary → gray:  G = B XOR (B shifted right by 1)<br />
        gray → binary:  B₀ = G₀ ; Bᵢ = Bᵢ₋₁ XOR Gᵢ  (working left to right)
      </div>
      <p>
        You will meet Gray code again in week 4: the rows and columns of a <strong>Karnaugh map</strong> are labelled
        in Gray code, and that is exactly what makes neighbouring squares differ in only one variable.
      </p>

      <h3>4 · ASCII</h3>
      <p>
        7 bits per character, 128 characters, usually stored in a byte with the top bit spare. Three anchors are
        worth memorising because everything else is counting from them:
      </p>
      <Table
        head={["Character", "Decimal", "Hex", "Binary"]}
        rows={[
          ["'0'", "48", "0x30", "011 0000"],
          ["'A'", "65", "0x41", "100 0001"],
          ["'a'", "97", "0x61", "110 0001"],
          ["space", "32", "0x20", "010 0000"],
        ]}
      />
      <p>
        Two nice facts that fall out: to convert an ASCII digit to its value, subtract 48 (or just mask off the
        low 4 bits). And upper- to lower-case is a single bit — bit 5 — so <code>'A' + 32 = 'a'</code>.
      </p>

      <h3>5 · Parity</h3>
      <p>
        Not a code for data, but an extra bit added to <em>detect</em> corruption. Choose the parity bit so the total
        number of 1s is even (even parity) or odd (odd parity). The receiver counts; a wrong count means damage.
      </p>
      <ul>
        <li>Detects any <strong>odd</strong> number of bit errors — most importantly, any single error.</li>
        <li>Misses any <strong>even</strong> number of errors, because they cancel.</li>
        <li>Can never <em>correct</em> anything: it knows something is wrong, not what.</li>
        <li>Built from an XOR tree, since XOR of a group of bits <em>is</em> its odd-parity.</li>
      </ul>
      <ToolLink slug="parity-lab">Generate a parity bit, then corrupt the message and watch the checker</ToolLink>
      <ToolLink slug="code-explorer">See one number in all four codes at once</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W1 · Logic gates                                                         */
/* ======================================================================== */

export function LogicGates() {
  return (
    <>
      <h2>Three gates, and then everything else</h2>
      <p>
        A gate takes one or more binary inputs and produces one binary output, according to a fixed rule.
        It has no memory: given the same inputs it always gives the same output. There are exactly three you
        need before anything else works.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 my-6 not-prose">
        {(["AND", "OR", "NOT"] as const).map((g) => (
          <div key={g} className="panel p-4">
            <div className="font-bold">{g}</div>
            <div className="mt-2"><GateSymbol kind={g} width={120} labels={g === "NOT" ? ["A"] : ["A", "B"]} /></div>
            <div className="font-mono text-xs text-[var(--color-accent)] mt-2">
              {g === "AND" ? "Y = A·B" : g === "OR" ? "Y = A+B" : "Y = A'"}
            </div>
            <div className="text-[13px] text-[var(--color-ink-dim)] mt-2">
              {g === "AND" ? "1 only when every input is 1." : g === "OR" ? "1 when at least one input is 1." : "Flips the bit."}
            </div>
          </div>
        ))}
      </div>

      <Callout kind="tip" title="Read them as English, not symbols">
        <p><strong>AND</strong> = “both”. The seatbelt light is on when the engine is running AND the belt is unfastened.</p>
        <p><strong>OR</strong> = “either”. The alarm sounds when the front door OR the back door is open.</p>
        <p><strong>NOT</strong> = “isn’t”.</p>
        <p className="mt-2">Every circuit you will analyse is a sentence built out of those three words.</p>
      </Callout>

      <h3>The buffer — a gate that does nothing, usefully</h3>
      <p>
        A buffer’s output equals its input. Logically useless; electrically vital. It <em>restores</em> the signal:
        it draws almost no current from whatever drives it, but can supply plenty to whatever it drives. Use one when
        a signal must travel a long way, or fan out to many inputs, or drive an LED.
      </p>

      <h3>Truth tables</h3>
      <p>
        A truth table lists <strong>every possible input combination</strong> and the output for each.
        With n inputs there are 2ⁿ rows, and the convention is to count upward in binary so nothing is missed.
      </p>
      <Table
        head={["A", "B", "A·B", "A+B", "A'"]}
        rows={[
          ["0", "0", "0", "0", "1"],
          ["0", "1", "0", "1", "1"],
          ["1", "0", "0", "1", "0"],
          ["1", "1", "1", "1", "0"],
        ]}
      />
      <p>
        The truth table is the <strong>definitive</strong> description of a combinational circuit. Two circuits with the
        same truth table are the same circuit as far as logic is concerned, however differently they are drawn. That
        idea does a lot of work in week 4.
      </p>

      <h3>Boolean expressions</h3>
      <p>
        The same information, written algebraically. Precedence is the same as ordinary algebra:
        <strong> NOT first, then AND, then OR</strong>. So <code>A + B·C</code> means “A, or (B and C)”,
        and <code>AB&apos;</code> means “A and (not B)”, not “not (AB)”.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)]">
        AND is written  A·B   AB   A*B   A∧B<br />
        OR  is written  A+B   A|B  A∨B<br />
        NOT is written  A'    Ā    ¬A   !A
      </div>
      <ToolLink slug="truth-table">Type an expression and get its truth table instantly</ToolLink>
      <ToolLink slug="gate-lab">Click inputs on live gate symbols</ToolLink>

      <h3>Circuit diagrams</h3>
      <p>
        Wire gate outputs into gate inputs and you have a circuit. To find its expression, work
        <strong> left to right</strong>, labelling each intermediate wire. To find its truth table, do that for every
        input combination. There is no cleverness involved — it is bookkeeping, and doing it slowly is faster than
        doing it fast.
      </p>
      <div className="my-4 not-prose">
        <div className="panel p-4 inline-block">
          <div className="text-xs text-[var(--color-ink-faint)] mb-2 font-mono">Y = (A·B) + C&apos;</div>
          <svg viewBox="0 0 300 120" className="w-full max-w-[300px]">
            <line x1="6" y1="30" x2="46" y2="30" stroke="#8fa2bd" strokeWidth="2" />
            <line x1="6" y1="54" x2="46" y2="54" stroke="#8fa2bd" strokeWidth="2" />
            <text x="0" y="24" fill="#98a3b8" fontSize="10" fontFamily="monospace">A</text>
            <text x="0" y="48" fill="#98a3b8" fontSize="10" fontFamily="monospace">B</text>
            <path d="M46 18 H66 A21 21 0 0 1 66 66 H46 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
            <line x1="87" y1="42" x2="150" y2="42" stroke="#8fa2bd" strokeWidth="2" />
            <text x="96" y="36" fill="#667085" fontSize="9" fontFamily="monospace">AB</text>

            <line x1="6" y1="96" x2="46" y2="96" stroke="#8fa2bd" strokeWidth="2" />
            <text x="0" y="90" fill="#98a3b8" fontSize="10" fontFamily="monospace">C</text>
            <path d="M46 84 L74 96 L46 108 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
            <circle cx="78" cy="96" r="4" fill="#151c28" stroke="#8fa2bd" strokeWidth="1.8" />
            <line x1="82" y1="96" x2="150" y2="96" stroke="#8fa2bd" strokeWidth="2" />
            <text x="96" y="90" fill="#667085" fontSize="9" fontFamily="monospace">C'</text>

            <path d="M150 30 Q168 30 196 69 Q168 108 150 108 Q162 69 150 30 Z" fill="#151c28" stroke="#8fa2bd" strokeWidth="2" />
            <line x1="196" y1="69" x2="250" y2="69" stroke="#8fa2bd" strokeWidth="2" />
            <text x="256" y="73" fill="#4ade80" fontSize="11" fontFamily="monospace">Y</text>
          </svg>
        </div>
      </div>

      <h3>Timing: gates are not instant</h3>
      <p>
        On paper the output changes the moment the input does. In silicon there is a delay, and the edges are sloped
        because every wire has capacitance that must be charged. Three numbers describe this, and all three are examinable:
      </p>
      <Table
        head={["Quantity", "Definition", "Typical"]}
        rows={[
          ["Rise time t_r", "Time for a signal to go from 10% to 90% of its final value", "1–10 ns"],
          ["Fall time t_f", "Time to go from 90% down to 10%", "Usually a bit faster than t_r in CMOS"],
          ["Propagation delay t_pd", "50% of the input edge to 50% of the output edge; the average of t_PHL and t_PLH", "1–20 ns per gate"],
        ]}
      />
      <Callout kind="key">
        Propagation delay is what limits clock speed. If a signal must pass through 5 gates each with t<sub>pd</sub> = 3 ns,
        the total path takes 15 ns, so the clock period cannot be shorter than that — a ceiling of about 66 MHz.
        Every “how fast can this run?” question in the course is this calculation.
      </Callout>
      <ToolLink slug="timing-lab">Measure rise time and propagation delay on a waveform</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W1 · Boolean algebra                                                     */
/* ======================================================================== */

export function BooleanAlgebra() {
  return (
    <>
      <h2>Why algebra, when you have a truth table?</h2>
      <p>
        A truth table with 4 variables has 16 rows; with 10 variables it has 1024. And a table doesn’t tell you how to
        build the thing cheaply. Boolean algebra lets you rewrite an expression into an equivalent one with fewer
        gates — which is less silicon, less power and less delay.
      </p>

      <h3>The single-variable theorems</h3>
      <p>All nine are obvious once you read them as sentences. Do not memorise them as symbol soup.</p>
      <Table
        head={["Theorem", "In words"]}
        rows={[
          ["A · 0 = 0", "“This AND false” is always false."],
          ["A · 1 = A", "“This AND true” is just this."],
          ["A · A = A", "Saying it twice adds nothing."],
          ["A · A' = 0", "Something cannot be both true and false."],
          ["A + 0 = A", "“This OR false” is just this."],
          ["A + 1 = 1", "“This OR true” is always true."],
          ["A + A = A", "Same as above, for OR."],
          ["A + A' = 1", "One of the two must hold."],
          ["(A')' = A", "Two nots cancel."],
        ]}
      />

      <h3>The multi-variable theorems that actually save gates</h3>
      <Table
        head={["Name", "Theorem", "What it buys you"]}
        rows={[
          ["Commutative", "AB = BA,  A+B = B+A", "Reorder freely."],
          ["Associative", "A(BC) = (AB)C", "Re-bracket freely within one operator."],
          ["Distributive", "A(B+C) = AB + AC", "Factor out common terms — like ordinary algebra."],
          ["Distributive 2", "A + BC = (A+B)(A+C)", "Has NO arithmetic equivalent. Memorise it separately."],
          ["Absorption", "A + AB = A", "Delete a whole term. The workhorse of simplification."],
          ["Adjacency", "AB + AB' = A", "B doesn't matter, so drop it. This is what a K-map group of 2 does."],
          ["Simplification", "A + A'B = A + B", "Drop a complement. Very commonly needed, easily missed."],
          ["Consensus", "AB + A'C + BC = AB + A'C", "The BC term is redundant."],
        ]}
      />

      <Callout kind="key" title="DeMorgan’s theorems — the two you will use every week">
        <p className="font-mono text-[15px] my-1">(A · B)′ = A′ + B′</p>
        <p className="font-mono text-[15px] my-1">(A + B)′ = A′ · B′</p>
        <p className="mt-2"><strong>Break the line, change the sign.</strong> Break the bar over the whole expression,
        swap AND ↔ OR, and complement each term underneath.</p>
        <p className="mt-2">In English: “not (both)” = “at least one isn’t”.
        “not (either)” = “neither”. Say those out loud until they sound obvious.</p>
      </Callout>

      <h3>Duality — buy one theorem, get one free</h3>
      <p>
        Swap every AND with OR, and every 0 with 1. If a theorem was true, its dual is true too. That is why the
        table above is full of mirrored pairs, and why you really only have to learn half of it.
      </p>
      <ToolLink slug="boolean-laws">Every theorem with a truth-table proof you can open</ToolLink>

      <h3>NAND and NOR</h3>
      <p>
        NAND is AND followed by NOT. NOR is OR followed by NOT. In CMOS these are the <em>natural</em> gates —
        a plain AND is literally built as a NAND plus an inverter, so it costs two more transistors and one more
        gate delay. Real chips are full of NANDs and NORs, and almost devoid of ANDs and ORs.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
        {(["NAND", "NOR"] as const).map((g) => (
          <div key={g} className="panel p-4">
            <div className="font-bold">{g}</div>
            <div className="mt-2"><GateSymbol kind={g} width={130} labels={["A", "B"]} /></div>
            <div className="font-mono text-xs text-[var(--color-accent)] mt-2">{g === "NAND" ? "Y = (A·B)'" : "Y = (A+B)'"}</div>
            <div className="text-[13px] text-[var(--color-ink-dim)] mt-2">
              {g === "NAND" ? "Output 0 only when BOTH inputs are 1." : "Output 1 only when BOTH inputs are 0."}
            </div>
          </div>
        ))}
      </div>

      <h3>Universality — one gate type is enough</h3>
      <p>
        NAND alone can build NOT, AND, OR and therefore everything. So can NOR alone. That is what
        “universal gate” means, and it is why a chip foundry can mass-produce one cell and wire it into
        anything.
      </p>
      <Steps items={[
        { title: "NOT from a NAND", body: <>Tie both inputs together: <code>(A·A)′ = A′</code>. One gate.</> },
        { title: "AND from NANDs", body: <>NAND then invert: <code>((A·B)′)′ = A·B</code>. Two gates.</> },
        { title: "OR from NANDs", body: <>DeMorgan: <code>A + B = (A′·B′)′</code>. Invert both inputs (2 gates), then NAND them (1 more). Three gates.</> },
      ]} />

      <Callout kind="tip" title="The whole-circuit shortcut">
        You never expand gate by gate. Draw the circuit in standard <strong>SOP form</strong> (ANDs feeding one OR),
        then replace <em>every</em> gate with a NAND. Done — the added bubbles cancel in pairs.
        The mirror trick works for POS (ORs feeding one AND) with NORs.
        Watch out only for single-literal terms that feed the final gate directly: those need their own inverter.
      </Callout>
      <ToolLink slug="universal-gates">Build any gate from NANDs or NORs, step by step</ToolLink>

      <h3>A worked simplification</h3>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-loose">
        Y = A′BC + AB′C + ABC′ + ABC<br />
        &nbsp;&nbsp;= A′BC + ABC + AB′C + ABC′ + ABC &nbsp;<span className="text-[var(--color-ink-faint)]">(A+A=A, duplicate ABC)</span><br />
        &nbsp;&nbsp;= BC(A′+A) + AC(B′+B) + AB(C′+C) &nbsp;<span className="text-[var(--color-ink-faint)]">(factor)</span><br />
        &nbsp;&nbsp;= BC + AC + AB &nbsp;<span className="text-[var(--color-ink-faint)]">(X+X′=1)</span>
      </div>
      <p>
        From four 3-input AND gates down to three 2-input ANDs. That is the entire point of the algebra — and in
        week 4 you will learn to do the same thing by drawing boxes on a grid, which is far less error-prone.
      </p>
    </>
  );
}

/* ======================================================================== */
/* W2 · Alternate symbols, XOR, parity                                      */
/* ======================================================================== */

export function AltSymbolsXor() {
  return (
    <>
      <h2>Every gate has two faces</h2>
      <p>
        Apply DeMorgan to a gate’s equation and you get a second, equally correct symbol for the same silicon.
        The rule for drawing it is mechanical: <strong>change the body shape</strong> (AND ⇄ OR) and
        <strong> flip every bubble</strong> (add one where there is none, remove one where there is).
      </p>
      <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
        <div className="panel p-4">
          <div className="text-xs text-[var(--color-ink-faint)] font-mono mb-2">NAND, standard symbol</div>
          <GateSymbol kind="NAND" width={150} labels={["A", "B"]} />
          <div className="font-mono text-sm text-[var(--color-accent)] mt-2">Y = (A·B)′</div>
          <div className="text-[13px] text-[var(--color-ink-dim)] mt-1">“Output goes LOW when both inputs are HIGH.”</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs text-[var(--color-ink-faint)] font-mono mb-2">NAND, alternate symbol</div>
          <GateSymbol kind="NAND" alt width={150} labels={["A", "B"]} />
          <div className="font-mono text-sm text-[var(--color-accent-2)] mt-2">Y = A′ + B′</div>
          <div className="text-[13px] text-[var(--color-ink-dim)] mt-1">“Output goes HIGH when either input is LOW.”</div>
        </div>
      </div>
      <p>
        Those two sentences describe the same chip. Which drawing you choose depends on which sentence is the
        <em> story you want the reader of your schematic to follow</em>.
      </p>

      <h3>Bubble-to-bubble matching</h3>
      <p>
        The rule for choosing: <strong>make the bubbles line up</strong>. An output bubble should meet an input
        bubble. Two inversions on the same wire cancel, and the reader can then trace the logic straight through
        without doing algebra in their head.
      </p>
      <Callout kind="key">
        <p>A bubble on a pin means <strong>“active LOW”</strong> — this signal does its job when it is 0.</p>
        <p>No bubble means <strong>active HIGH</strong>.</p>
        <p className="mt-2">Bubble-to-bubble matching is therefore just: an active-low output should feed an
        active-low input. If they don’t match, redraw one gate in its alternate form. The circuit doesn’t change;
        only the drawing does.</p>
      </Callout>
      <ToolLink slug="alt-symbols">Flip any gate to its twin and check the bubbles</ToolLink>

      <h3>XOR — the difference detector</h3>
      <p>
        <strong>XOR</strong> (exclusive-OR) outputs 1 when its inputs are <em>different</em>.
        <strong> XNOR</strong> outputs 1 when they are the <em>same</em>, so it is an equality detector.
      </p>
      <Table
        head={["A", "B", "A ⊕ B (XOR)", "(A ⊕ B)′ (XNOR)"]}
        rows={[["0", "0", "0", "1"], ["0", "1", "1", "0"], ["1", "0", "1", "0"], ["1", "1", "0", "1"]]}
      />
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)]">
        A ⊕ B = A′B + AB′ = (A + B)(A·B)′
      </div>

      <h3>The four XOR properties worth knowing by heart</h3>
      <Table
        head={["Property", "Why it matters"]}
        rows={[
          ["A ⊕ 0 = A", "XOR with 0 passes the signal through unchanged."],
          ["A ⊕ 1 = A′", "XOR with 1 inverts it. So XOR is a CONTROLLABLE inverter — this is the trick behind the adder-subtractor."],
          ["A ⊕ A = 0", "Anything XORed with itself vanishes. The basis of simple encryption and of checksums."],
          ["Chained XOR = odd parity", "A ⊕ B ⊕ C ⊕ … is 1 exactly when an odd number of the inputs are 1. This is the parity generator."],
        ]}
      />

      <h3>Parity generator and checker</h3>
      <p>
        Put those last two together and the circuit designs itself. To send 7 data bits with even parity:
      </p>
      <Steps items={[
        { title: "Generator (at the transmitter)", body: <>P = D₀ ⊕ D₁ ⊕ … ⊕ D₆. That is 1 when the data has an odd number of 1s — exactly the bit needed to make the total even. For <em>odd</em> parity, invert the output.</> },
        { title: "Send", body: "8 bits go down the wire: the 7 data bits plus P." },
        { title: "Checker (at the receiver)", body: <>E = D₀ ⊕ … ⊕ D₆ ⊕ P. If nothing was corrupted the total number of 1s is even, so E = 0. E = 1 means an error was detected.</> },
      ]} />
      <p>
        Notice the generator and the checker are the <em>same circuit</em>: an XOR tree. That symmetry is why parity
        is so cheap that it appears in memory chips, serial links and bus protocols everywhere.
      </p>
      <ToolLink slug="parity-lab">Inject an error and watch the checker respond</ToolLink>

      <h3>Reading a connection diagram</h3>
      <p>
        Real 7400-series chips come in 14-pin packages: pin 14 is V<sub>CC</sub>, pin 7 is GND, and the rest are gates.
        A connection diagram shows which pins belong to which gate. When a lab sheet says “use a 7486”,
        that is four XOR gates in one package, and you need the pinout to wire it.
      </p>
      <Callout kind="warn">
        Unused CMOS inputs must be tied to V<sub>DD</sub> or GND — never left floating. A floating input drifts into the
        undefined region, makes the gate oscillate, and can draw enough current to overheat. It is the single most
        common lab mistake.
      </Callout>
    </>
  );
}

/* ======================================================================== */
/* W2 · Adders & signed numbers                                             */
/* ======================================================================== */

export function Adders() {
  return (
    <>
      <h2>Building addition out of gates</h2>
      <p>
        Adding two bits has four cases: 0+0=0, 0+1=1, 1+0=1, and 1+1=<strong>10</strong>. That last one doesn’t fit
        in a single bit, so the answer needs two outputs — a <strong>Sum</strong> and a <strong>Carry</strong>.
      </p>
      <Table
        head={["A", "B", "Carry", "Sum"]}
        rows={[["0", "0", "0", "0"], ["0", "1", "0", "1"], ["1", "0", "0", "1"], ["1", "1", "1", "0"]]}
      />
      <p>
        Look at the Sum column: 1 exactly when A and B differ — that is XOR. The Carry column: 1 only when both are
        1 — that is AND. So a <strong>half adder</strong> is one XOR and one AND. Nothing else.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)]">
        Sum = A ⊕ B &nbsp;&nbsp;&nbsp; Carry = A · B
      </div>

      <h3>Why “half”? Because you can’t chain it</h3>
      <p>
        When you add multi-bit numbers by hand, each column receives a carry from the column to its right. A half
        adder has nowhere to put that. A <strong>full adder</strong> adds a third input C<sub>in</sub>:
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        Sum &nbsp;= A ⊕ B ⊕ C<sub>in</sub><br />
        C<sub>out</sub> = A·B + C<sub>in</sub>(A ⊕ B) &nbsp;&nbsp;or equivalently&nbsp;&nbsp; A·B + A·C<sub>in</sub> + B·C<sub>in</sub>
      </div>
      <p>
        In words: the sum bit is 1 when an <em>odd</em> number of the three inputs are 1; the carry is 1 when at least
        <em> two</em> of them are. A full adder can be built from two half adders and an OR gate.
      </p>

      <h3>The parallel (ripple-carry) adder</h3>
      <p>
        Chain n full adders, each one’s C<sub>out</sub> into the next one’s C<sub>in</sub>, with the least significant
        C<sub>in</sub> tied to 0. All n bits are presented simultaneously, which is why it is called a
        <em> parallel</em> adder — but the carry still has to travel from right to left.
      </p>
      <Callout kind="key" title="Carry propagation is the bottleneck">
        The worst case is a carry generated at the LSB that has to reach the MSB. For an n-bit adder that is
        <strong> n gate delays</strong>. A 64-bit ripple adder with 1 ns stages takes 64 ns — about 15 MHz, which is
        hopeless. The fix is <strong>carry look-ahead</strong>: for each bit compute
        <em> generate</em> G = A·B and <em>propagate</em> P = A ⊕ B, then work out every carry in parallel from those.
        Constant time, at the price of many more gates. Speed traded for area, again.
      </Callout>
      <ToolLink slug="adder-lab">Step the carry through a ripple adder one stage at a time</ToolLink>

      <h2>Now, how do you say “minus”?</h2>
      <p>
        Bits have no minus sign, so we have to spend one bit on the sign and agree what the rest means.
        Three schemes exist historically; two of them are dead, but you must know why.
      </p>

      <h3>1 · Sign-magnitude</h3>
      <p>
        MSB is the sign (0 = +, 1 = −), the remaining bits are the plain magnitude. <code>1101</code> = −5 in 4 bits.
        Easy to read, and hopeless to compute with: there are <strong>two zeros</strong> (<code>0000</code> and
        <code> 1000</code>), and adding requires comparing signs, comparing magnitudes and possibly subtracting —
        a pile of hardware.
      </p>

      <h3>2 · 1’s complement</h3>
      <p>
        Negate by flipping every bit. −5 in 4 bits is <code>1010</code>. Better, but still two zeros
        (<code>0000</code> and <code>1111</code>), and addition needs an <em>end-around carry</em>: if the sum produces
        a carry out, you must add it back into the LSB.
      </p>

      <h3>3 · 2’s complement — the one everyone uses</h3>
      <p>
        Negate by flipping every bit <strong>and adding 1</strong>. −5 in 4 bits: 5 = <code>0101</code>, flip to
        <code> 1010</code>, add 1 → <code>1011</code>.
      </p>
      <Callout kind="key" title="The better way to think about it">
        In an n-bit 2’s complement number, the MSB carries a <strong>negative</strong> weight of −2ⁿ⁻¹ and every other
        column is normal. So <code>1011</code> = −8 + 0 + 2 + 1 = −5. Converting back to decimal needs no flipping and
        no adding 1 — just weigh the columns with the leftmost one negative. Use this in the exam; it is much faster
        and much harder to get wrong.
      </Callout>
      <p>Why it won:</p>
      <ul>
        <li><strong>One zero.</strong> Comparisons are trivial.</li>
        <li><strong>Ordinary addition just works.</strong> The same adder handles any mix of positive and negative operands, with no sign logic at all.</li>
        <li><strong>Subtraction disappears.</strong> A − B is computed as A + (−B). You never build a subtractor.</li>
      </ul>
      <p>
        The one oddity: the range is asymmetric. An n-bit 2’s complement number covers
        <strong> −2ⁿ⁻¹ to +2ⁿ⁻¹ − 1</strong> — for 8 bits, −128 to +127. There is no +128, because the pattern that
        would have been the second zero was given to the negative side instead.
      </p>

      <h3>The one-pass negation trick</h3>
      <p>
        Scanning from the right: copy bits until you have copied the first <code>1</code>, then invert everything to
        the left of it. <code>0101100</code> → copy <code>100</code>, invert the rest → <code>1010100</code>.
        Same answer as flip-and-add-1, in a single pass.
      </p>
      <ToolLink slug="signed-numbers">See all three representations side by side for any value</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W3 · 2's complement arithmetic                                           */
/* ======================================================================== */

export function TwosComplementArithmetic() {
  return (
    <>
      <h2>Sign extension</h2>
      <p>
        To widen a 2’s complement number from 4 bits to 8, you cannot just pad with zeros — that turns
        <code> 1011</code> (−5) into <code>00001011</code> (+11). Instead you <strong>copy the sign bit</strong> into
        every new position.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        +5 : 0101 → <span className="text-[var(--color-warn)]">0000</span>0101  ✓ still +5<br />
        −5 : 1011 → <span className="text-[var(--color-warn)]">1111</span>1011  ✓ still −5<br />
        −5 : 1011 → <span className="text-[var(--color-bad)]">0000</span>1011  ✗ this is +11
      </div>
      <p>
        It works because of the negative-MSB view. In 4 bits, <code>1011</code> = −8+2+1 = −5. In 8 bits,
        <code>11111011</code> = −128+64+32+16+8+2+1 = −5. Each extra leading 1 adds a negative weight that is exactly
        cancelled by the positive weights below it. Zero-extension is for <em>unsigned</em> numbers only.
      </p>

      <h2>Addition and subtraction</h2>
      <p>
        Add the two n-bit patterns exactly as if they were unsigned, and <strong>discard any carry out of the MSB</strong>.
        The result is already correct in 2’s complement. That is the whole algorithm.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        &nbsp;&nbsp;0101&nbsp;&nbsp;(+5)<br />
        + 1101&nbsp;&nbsp;(−3)<br />
        ------<br />
        <span className="text-[var(--color-ink-faint)]">1</span>&nbsp;0010&nbsp;&nbsp;(+2) ✓ &nbsp;— the leading carry is thrown away
      </div>
      <p>
        For subtraction, negate the second operand and add: A − B = A + (−B). The hardware does this with one XOR
        per bit plus a carry-in of 1, which you will build in the next lesson.
      </p>

      <h2>Overflow — the thing everybody gets wrong</h2>
      <p>
        Overflow means the true answer is outside the range the width can hold, so the bits wrap round and the
        result is <em>silently wrong</em>. In 4-bit 2’s complement (range −8…+7): 5 + 4 = 9, which does not fit,
        and the hardware reports −7.
      </p>
      <Callout kind="key" title="Two equivalent tests — learn both">
        <p><strong>Carry rule (what hardware uses):</strong> V = C<sub>in</sub>(into MSB) ⊕ C<sub>out</sub>(of MSB).
        If the carry going into the sign column differs from the carry coming out, you have overflowed.</p>
        <p className="mt-2"><strong>Sign rule (what you use by eye):</strong> overflow happens only when the two
        operands have the <em>same</em> sign and the result has the <em>opposite</em> sign.</p>
      </Callout>
      <p>
        The sign rule has a useful corollary: <strong>adding two numbers of opposite signs can never overflow</strong>.
        The answer is always smaller in magnitude than the larger operand, so it must fit. If an exam question gives
        you a positive plus a negative, you can state “no overflow possible” immediately.
      </p>

      <h3>Carry-out is not overflow</h3>
      <p>
        This is the trap. They are different flags for different interpretations of the same bits:
      </p>
      <Table
        head={["Flag", "Means", "Matters when you are treating the bits as"]}
        rows={[
          ["Carry out (C)", "The unsigned result needed one more bit", "UNSIGNED"],
          ["Overflow (V)", "The signed result fell outside −2ⁿ⁻¹ … 2ⁿ⁻¹−1", "SIGNED (2's complement)"],
        ]}
      />
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        4-bit:  1001 + 1000<br />
        as unsigned: 9 + 8 = 17, needs 5 bits → <span className="text-[var(--color-warn)]">C = 1</span><br />
        as signed:  −7 + (−8) = −15, below −8 → <span className="text-[var(--color-bad)]">V = 1</span><br /><br />
        4-bit:  0101 + 1101<br />
        as unsigned: 5 + 13 = 18 → <span className="text-[var(--color-warn)]">C = 1</span><br />
        as signed:  5 + (−3) = 2, fits fine → <span className="text-[var(--color-hi)]">V = 0</span>
      </div>
      <p>
        The processor computes both flags on every addition and lets the <em>program</em> decide which one it cares
        about. The hardware has no idea whether your bits are signed.
      </p>
      <ToolLink slug="twos-calc">Add and subtract with both flags computed and explained</ToolLink>

      <Callout kind="warn" title="Exam checklist for any signed-arithmetic question">
        <ul className="list-disc pl-5 space-y-1">
          <li>State the width and therefore the range before you start.</li>
          <li>Convert negatives properly (flip and add 1) and show that step.</li>
          <li>Add the full patterns; write the carry row.</li>
          <li>Discard the final carry, then check overflow with <em>both</em> rules — they must agree.</li>
          <li>Convert the answer back to decimal and sanity-check against the arithmetic you'd do in your head.</li>
        </ul>
      </Callout>
    </>
  );
}

/* ======================================================================== */
/* W3 · Arithmetic circuits                                                 */
/* ======================================================================== */

export function ArithmeticCircuits() {
  return (
    <>
      <h2>One circuit that adds and subtracts</h2>
      <p>
        Recall two facts: XOR with 0 passes a bit through, XOR with 1 inverts it; and 2’s complement negation is
        “invert, then add 1”. Put them together and the adder-subtractor practically designs itself.
      </p>
      <Steps items={[
        { title: "Take an n-bit ripple-carry adder", body: "It already computes A + B." },
        { title: "Put an XOR gate on every bit of B", body: <>The other input of every XOR is one shared control line, <code>SUB</code>.</> },
        { title: "Feed SUB into C₀ as well", body: <>SUB = 0: B passes through and C₀ = 0, so you get <strong>A + B</strong>.<br />SUB = 1: B is inverted and C₀ = 1 adds the “+1”, so you get <strong>A + (−B) = A − B</strong>.</> },
      ]} />
      <p>
        Cost: n XOR gates and one wire. That is the entire difference between an adder and an adder-subtractor,
        and it is a favourite exam question precisely because it looks like it should be harder.
      </p>
      <ToolLink slug="addsub-circuit">Toggle SUB and watch the same hardware change operation</ToolLink>

      <h3>Overflow detection in the circuit</h3>
      <p>
        Tap the carry into and out of the most significant full adder and XOR them:
        <code> V = C<sub>n</sub> ⊕ C<sub>n−1</sub></code>. One extra gate for the overflow flag.
        The carry out C<sub>n</sub> itself is the unsigned carry flag. Both come essentially free.
      </p>

      <h2>Parallel addition with registers</h2>
      <p>
        In a real datapath the operands live in <strong>registers</strong> — rows of flip-flops that capture their
        inputs on a clock edge. A typical accumulate loop is: registers → adder → result register, with the result
        fed back round.
      </p>
      <Callout kind="key">
        The clock period must be at least the <strong>worst-case path</strong>: register output delay + full carry
        ripple through the adder + register setup time. This is why carry propagation matters commercially —
        shortening it directly raises the clock speed of the whole machine.
      </Callout>

      <h2>Multiplication</h2>
      <p>
        Binary long multiplication is easier than decimal, because each multiplier digit is 0 or 1. Every partial
        product is therefore either zero or a shifted copy of the multiplicand. No times tables.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        &nbsp;&nbsp;&nbsp;1101&nbsp;&nbsp;(13)<br />
        × &nbsp;&nbsp;1011&nbsp;&nbsp;(11)<br />
        --------<br />
        &nbsp;&nbsp;&nbsp;1101&nbsp;&nbsp;← b₀=1, shift 0<br />
        &nbsp;&nbsp;11010&nbsp;&nbsp;← b₁=1, shift 1<br />
        &nbsp;00000&nbsp;&nbsp;&nbsp;← b₂=0<br />
        1101000&nbsp;&nbsp;← b₃=1, shift 3<br />
        --------<br />
        10001111&nbsp;&nbsp;= 143 ✓
      </div>
      <p>Two ways to build it:</p>
      <ul>
        <li><strong>Shift-and-add (sequential).</strong> One adder, one shift register, n clock cycles. Cheap, slow.</li>
        <li><strong>Array multiplier (combinational).</strong> Each partial-product bit is just <code>Aᵢ·Bⱼ</code> — one AND gate — so lay out n² AND gates and a mesh of adders. One cycle, lots of silicon.</li>
      </ul>
      <Callout kind="warn">
        An n × n product needs <strong>2n bits</strong>. 8 × 8 can reach 65025, which needs 16. Truncating back to n
        bits silently destroys the answer — a real bug and a common exam trap.
      </Callout>
      <ToolLink slug="multiplier">Watch the partial products build up</ToolLink>

      <h2>BCD addition</h2>
      <p>
        BCD stores each decimal digit in its own 4 bits. A plain 4-bit adder wraps at 16, but a decimal digit must
        wrap at 10. That mismatch of 6 is the whole problem — and the whole fix.
      </p>
      <Steps items={[
        { title: "Add the two BCD digits with a normal 4-bit adder", body: "Plus any carry from the digit to the right." },
        { title: "Test the result", body: <>If the sum is greater than 9, <em>or</em> the 4-bit adder produced a carry out, the result is not a valid BCD digit.</> },
        { title: "If so, add 0110 (6)", body: "This skips over the six illegal codes 1010–1111 and pushes a carry into the next digit at the right moment." },
        { title: "Carry on to the next digit", body: "The corrected carry-out becomes the next digit's carry-in." },
      ]} />
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        7 + 8 in BCD:<br />
        &nbsp;&nbsp;0111<br />
        + 1000<br />
        ------<br />
        &nbsp;&nbsp;1111 &nbsp;= 15, which is not a legal BCD digit<br />
        + 0110 &nbsp;add 6<br />
        ------<br />
        1&nbsp;0101 &nbsp;= carry 1, digit 5 → “15” ✓
      </div>
      <p>
        The correction condition, as a Boolean expression on the raw sum bits S₃S₂S₁S₀ with carry C₄, is
        <code> Fix = C₄ + S₃S₂ + S₃S₁</code>. So a one-digit BCD adder is: a 4-bit binary adder, that small piece of
        logic, and a second 4-bit adder to add the 6.
      </p>
      <ToolLink slug="bcd-adder">Watch the +6 correction trigger digit by digit</ToolLink>
    </>
  );
}
