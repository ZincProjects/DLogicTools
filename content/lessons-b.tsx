"use client";
import { Callout, Table, Steps } from "@/components/UI";
import { GateSymbol } from "@/components/Gates";
import ToolLink from "@/components/ToolLink";

/* ======================================================================== */
/* W4 · Minterms, maxterms, SOP, POS                                        */
/* ======================================================================== */

export function MintermsSopPos() {
  return (
    <>
      <h2>From a truth table to an equation, mechanically</h2>
      <p>
        Design usually starts with a specification in words, which becomes a truth table. You then need an equation
        so you can build gates. There are two systematic recipes, and neither requires any insight — which is the
        point. Insight is unreliable under exam conditions; recipes are not.
      </p>

      <h3>Minterms</h3>
      <p>
        A <strong>minterm</strong> is an AND term containing <em>every</em> variable exactly once, either plain or
        complemented. With n variables there are 2ⁿ minterms, and each one is true for exactly <strong>one</strong> row
        of the truth table.
      </p>
      <Table
        head={["Row", "A B C", "Minterm", "Written"]}
        rows={[
          ["0", "0 0 0", "A′B′C′", "m₀"],
          ["1", "0 0 1", "A′B′C", "m₁"],
          ["2", "0 1 0", "A′BC′", "m₂"],
          ["3", "0 1 1", "A′BC", "m₃"],
          ["4", "1 0 0", "AB′C′", "m₄"],
          ["5", "1 0 1", "AB′C", "m₅"],
          ["6", "1 1 0", "ABC′", "m₆"],
          ["7", "1 1 1", "ABC", "m₇"],
        ]}
      />
      <Callout kind="key" title="The minterm rule">
        In a minterm, a variable whose row-value is <strong>1</strong> appears <strong>plain</strong>, and a variable
        whose row-value is <strong>0</strong> appears <strong>complemented</strong>. Row 5 is A=1, B=0, C=1, so
        m₅ = AB′C.
      </Callout>

      <h3>Canonical SOP — sum of minterms</h3>
      <p>
        OR together the minterms for every row where the output is 1. The result is true for exactly those rows and no
        others, so it must be the right function.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        If F = 1 on rows 1, 3, 5, 7:<br />
        F = Σm(1, 3, 5, 7) = A′B′C + A′BC + AB′C + ABC
      </div>
      <p>
        This form is <em>guaranteed correct</em> and <em>guaranteed inefficient</em> — you will simplify it afterwards.
        Getting a correct canonical form first, then minimising, is a far safer exam strategy than trying to be clever
        immediately. (That example simplifies to just <code>C</code>, incidentally: look at the rows.)
      </p>

      <h3>Maxterms and canonical POS</h3>
      <p>
        A <strong>maxterm</strong> is an OR term containing every variable once. Each is false for exactly one row.
        The rule for writing one is the <em>mirror</em> of the minterm rule:
      </p>
      <Callout kind="key" title="The maxterm rule — note it is inverted">
        In a maxterm, a variable whose row-value is <strong>0</strong> appears <strong>plain</strong>, and a variable
        whose row-value is <strong>1</strong> appears <strong>complemented</strong>. Row 5 (A=1, B=0, C=1) gives
        M₅ = A′ + B + C′.
      </Callout>
      <p>
        AND together the maxterms for every row where the output is <strong>0</strong>. Each maxterm kills exactly one
        zero-row and leaves all the others untouched.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        Same function, F = 0 on rows 0, 2, 4, 6:<br />
        F = ΠM(0, 2, 4, 6) = (A+B+C)(A+B′+C)(A′+B+C)(A′+B′+C)
      </div>
      <p>
        The two forms describe the same function. They are related by
        <code> Σm(list) = ΠM(everything not in the list)</code> — so once you have one, the other is free.
      </p>

      <h3>Which form should you use?</h3>
      <Table
        head={["", "SOP", "POS"]}
        rows={[
          ["Built from", "Rows where F = 1", "Rows where F = 0"],
          ["Structure", "AND gates feeding one OR", "OR gates feeding one AND"],
          ["Convert to one gate type with", "NAND only", "NOR only"],
          ["Prefer when", "The function is mostly 0s (few 1-rows to cover)", "The function is mostly 1s (few 0-rows to cover)"],
        ]}
      />
      <p>
        In practice you compute both, count the literals, and pick the smaller. The tools below do that for you so you
        can check your hand work.
      </p>
      <ToolLink slug="truth-table">Type an expression and get its minterms, maxterms, SOP and POS</ToolLink>

      <h2>Active-high and active-low signals</h2>
      <p>
        A separate idea, but this is where the course introduces it because it changes how you read an equation.
        A signal’s <strong>active level</strong> is the voltage at which it is doing its job.
      </p>
      <ul>
        <li><strong>Active-HIGH:</strong> asserted when the wire is 1. Written plainly: <code>ENABLE</code>.</li>
        <li><strong>Active-LOW:</strong> asserted when the wire is 0. Written with an overbar, apostrophe or _n suffix: <code>RESET̅</code>, <code>RESET&apos;</code>, <code>reset_n</code>.</li>
      </ul>
      <Callout kind="tip" title="Keep two vocabularies apart">
        <p><strong>HIGH / LOW</strong> is about voltage — physical.</p>
        <p><strong>Asserted / negated</strong> is about meaning — logical.</p>
        <p className="mt-2">&ldquo;RESET̅ is asserted&rdquo; and &ldquo;RESET̅ is LOW&rdquo; describe the same event.
        &ldquo;RESET̅ is HIGH&rdquo; means the system is <em>not</em> being reset. Mixing these up is the most common
        source of confusion in week 5.</p>
      </Callout>
      <ToolLink slug="active-levels">Toggle a wire and see asserted vs negated update</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W4 · Karnaugh maps                                                       */
/* ======================================================================== */

export function KarnaughMaps() {
  return (
    <>
      <h2>Simplification you can see</h2>
      <p>
        Boolean algebra works, but it is error-prone: you have to spot which theorem applies, and there is no way to
        know when you are finished. A Karnaugh map turns the same job into a picture, where the simplification is
        obvious and you can tell at a glance that you are done.
      </p>

      <h3>Why the funny row order</h3>
      <p>
        A K-map is a truth table redrawn as a grid, with the rows and columns labelled in
        <strong> Gray code</strong> — 00, 01, 11, 10 — not in binary counting order. That is the whole trick:
        Gray code means adjacent squares differ in exactly one variable.
      </p>
      <Callout kind="key">
        Two adjacent 1s mean <em>&ldquo;the variable that changes between these two squares doesn’t matter&rdquo;</em>.
        That is the theorem <code>AB + AB′ = A</code>, drawn. Circling a group of <strong>2ᵏ</strong> cells eliminates
        <strong> k</strong> variables from that term.
      </Callout>
      <Table
        head={["Group size", "Variables eliminated", "Literals left (4-var map)"]}
        rows={[
          ["1 cell", "0", "4 — a full minterm"],
          ["2 cells", "1", "3"],
          ["4 cells", "2", "2"],
          ["8 cells", "3", "1"],
          ["16 cells", "4", "0 — the function is just 1"],
        ]}
      />

      <h3>The rules, in the order you apply them</h3>
      <Steps items={[
        { title: "Fill in the map from the truth table", body: "One cell per minterm. Be careful: the cell order is Gray, not binary." },
        { title: "Circle groups of 1s", body: "Sizes must be powers of two: 1, 2, 4, 8, 16. Never 3 or 6." },
        { title: "Make every group as LARGE as possible", body: "Bigger group ⇒ fewer literals in that term. This is the step people under-do." },
        { title: "Remember the map wraps around", body: "Left edge is adjacent to right edge; top to bottom; and all four corners are mutually adjacent." },
        { title: "Overlap freely", body: "Reusing a 1 in two groups costs nothing." },
        { title: "Use the FEWEST groups that cover every 1", body: "Stop the moment all 1s are covered. Every group must contain at least one 1 that no other group covers." },
        { title: "Read off the answer", body: "For each group, keep only the variables that stay CONSTANT across it. Constant 1 ⇒ plain; constant 0 ⇒ complemented. OR the terms together." },
      ]} />

      <h3>Reading a group — the step people fumble</h3>
      <p>
        Look at the group and ask, variable by variable: <em>does this variable have the same value in every cell of
        the group?</em> If yes, it appears in the term (plain if that value is 1, complemented if 0).
        If it takes both values, it is eliminated and does not appear at all.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        A group of 4 covering cells where A=1 always, B=1 always,<br />
        and C, D each take both values<br />
        ⇒ the term is  A·B   (C and D are eliminated)
      </div>

      <h3>Don’t-cares</h3>
      <p>
        Sometimes an input combination can never happen — a BCD decoder never sees 1010 through 1111 — or the output
        genuinely doesn’t matter. Mark those cells <strong>X</strong>. You may then treat each X as whichever value
        makes your groups bigger, deciding independently for each one.
      </p>
      <Callout kind="tip">
        You are never <em>obliged</em> to cover an X. Include one only if it enlarges a group you were making anyway.
        Don’t-cares are free real estate, and using them well often halves a circuit.
      </Callout>

      <h3>POS from a K-map</h3>
      <p>
        Group the <strong>0s</strong> instead of the 1s. Then invert the reading rule: a variable constant at
        <strong> 0</strong> appears plain, a variable constant at <strong>1</strong> appears complemented, and you OR
        within a group and AND between groups.
      </p>
      <Callout kind="warn">
        The inverted reading rule for POS is the most-missed mark in this topic. Do the grouping exactly as for SOP —
        only the way you write down the answer changes.
      </Callout>
      <ToolLink slug="kmap">2–5 variables, don’t-cares, drawn groups, minimal SOP and POS</ToolLink>

      <h3>What K-maps cannot do</h3>
      <p>
        Beyond 4 variables they get awkward (5 is two maps side by side), and beyond 6 they are unusable — human
        pattern-matching runs out. Real tools use the <strong>Quine-McCluskey</strong> algorithm, which is the same
        idea done exhaustively by a computer, or heuristics like Espresso for very large functions.
        For SC1005, 4 variables by hand is the target skill.
      </p>

      <h2>Enabling and disabling a circuit</h2>
      <p>
        The other half of L8, and it follows directly from the single-variable theorems. Two gates have a
        <strong> controlling value</strong> that forces the output regardless of the other input:
      </p>
      <Table
        head={["Gate", "Control value", "Output when disabled", "Output when enabled"]}
        rows={[
          ["AND", "control = 0", "0 (held low)", "passes the data through"],
          ["OR", "control = 1", "1 (held high)", "passes the data through"],
          ["NAND", "control = 0", "1 (held high)", "passes the INVERTED data"],
          ["NOR", "control = 1", "0 (held low)", "passes the INVERTED data"],
        ]}
      />
      <p>
        This is how chip-enable pins, clock gating and bit masking all work. And XOR gives you a fourth, subtler
        option: <strong>programmable inversion</strong> — control = 0 passes the data, control = 1 inverts it,
        which is exactly the mechanism behind the adder-subtractor from week 3.
      </p>
      <ToolLink slug="enable-lab">See all four gates used as switches on a live waveform</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W5 · TTL vs CMOS, transistors                                            */
/* ======================================================================== */

export function TtlCmos() {
  return (
    <>
      <h2>What is under a gate symbol</h2>
      <p>
        Everything so far has been abstract. Now we open the box. Inside every gate are transistors acting as
        <strong> switches</strong> — nothing more exotic than that.
      </p>

      <h3>The MOSFET as a switch</h3>
      <Table
        head={["Type", "Conducts when its gate is", "Good at pulling the output", "Symbol clue"]}
        rows={[
          ["NMOS", "HIGH (1)", "DOWN to 0 V (ground)", "no bubble on the gate terminal"],
          ["PMOS", "LOW (0)", "UP to V_DD", "bubble on the gate terminal"],
        ]}
      />
      <p>
        Each is only good in one direction — an NMOS passes a strong 0 but a weak 1, and vice versa. That is precisely
        why they are always used in complementary pairs, which is what the C in CMOS stands for.
      </p>

      <h3>The CMOS recipe</h3>
      <p>Every static CMOS gate has exactly two halves:</p>
      <ul>
        <li>A <strong>pull-up network (PUN)</strong> of PMOS transistors between V<sub>DD</sub> and the output.</li>
        <li>A <strong>pull-down network (PDN)</strong> of NMOS transistors between the output and ground.</li>
      </ul>
      <p>
        They are <em>duals</em>: wherever the NMOS are in series, the PMOS are in parallel, and vice versa. This
        guarantees that for any input combination, exactly one network conducts. The output is therefore always
        firmly connected to one rail — and, crucially, there is <strong>never a path from V<sub>DD</sub> to ground</strong>,
        which is why an idle CMOS gate draws essentially zero current.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        Series NMOS  = AND     (both must be on to conduct)<br />
        Parallel NMOS = OR      (either one conducting is enough)<br /><br />
        NAND: NMOS in SERIES,   PMOS in PARALLEL<br />
        NOR:  NMOS in PARALLEL, PMOS in SERIES
      </div>

      <Callout kind="key" title="CMOS is always inverting">
        The pull-down network pulls the output <em>low</em> when its condition is met, so the output is always the
        <strong> complement</strong> of the function the NMOS network computes. You cannot build a plain AND in one
        CMOS stage — an AND is a NAND followed by an inverter, costing two extra transistors and one extra gate delay.
        This is the real reason NAND and NOR are the &ldquo;native&rdquo; gates of digital design.
      </Callout>

      <h3>Analysing any CMOS circuit in four steps</h3>
      <Steps items={[
        { title: "Ignore the PMOS half entirely", body: "Look only at the NMOS pull-down network." },
        { title: "Write its condition", body: "Series = AND, parallel = OR. Call the result F." },
        { title: "The output is F′", body: "The PDN pulls the output to 0 whenever F is true." },
        { title: "Check the PUN is the dual", body: "If the PMOS structure isn't the mirror image (series ↔ parallel), the circuit is wrong." },
      ]} />
      <ToolLink slug="cmos-lab">Toggle inputs and watch individual transistors switch on and off</ToolLink>

      <h3>Transistor counts</h3>
      <p>
        A simple CMOS gate uses <strong>2 transistors per input</strong>: an inverter is 2, a 2-input NAND is 4, a
        3-input NOR is 6. Complex gates that combine AND and OR in one stage (AND-OR-Invert, or AOI) are cheaper than
        building the same function from separate gates — an AOI21 computing <code>(A·B + C)′</code> takes 6
        transistors, where a discrete AND + OR + inverter would take 14.
      </p>

      <h3>TTL vs CMOS</h3>
      <Table
        head={["", "TTL (bipolar)", "CMOS"]}
        rows={[
          ["Devices", "Bipolar junction transistors", "MOSFETs in complementary pairs"],
          ["Static power", "High — current flows continuously", "Near zero — no VDD-to-ground path when idle"],
          ["Dynamic power", "Less dominant", "Dominant: P = C·V²·f"],
          ["Input current", "Real, in mA — inputs load the driver", "Essentially zero — an input is a capacitor"],
          ["Fan-out limit", "Set by input current (~10)", "Set by capacitance, i.e. by speed, not by voltage"],
          ["Noise margin (5 V)", "≈ 0.4 V", "≈ 1.45 V"],
          ["Supply voltage", "5 V, fairly strict", "1.2 V – 15 V depending on family"],
          ["Density", "Low", "Very high — this is why CMOS won"],
          ["Static discharge", "Robust", "Fragile: thin gate oxide punches through easily"],
        ]}
      />
      <p>
        Modern digital design is essentially all CMOS. TTL matters because its numbers appear in exam questions,
        because the 7400-series pinouts are still the lab standard, and because its asymmetric drive strength is the
        historical reason so many signals are active-low.
      </p>

      <h2>Active-high, active-low, asserted, negated</h2>
      <p>Four words, two independent ideas. Keep them separate:</p>
      <Table
        head={["Term", "About", "Meaning"]}
        rows={[
          ["HIGH / LOW", "Voltage", "Physically near V_DD, or physically near 0 V."],
          ["Active-HIGH / Active-LOW", "Design choice", "Which voltage counts as 'doing the job' for this particular signal."],
          ["Asserted", "State", "The signal is at its active level — the thing is happening."],
          ["Negated", "State", "The signal is at the other level — idle."],
        ]}
      />
      <p>Why active-low is so common:</p>
      <ul>
        <li><strong>Drive strength.</strong> TTL outputs sink far more current than they source, so LOW is the strong, reliable state. Put the important event on the strong level.</li>
        <li><strong>Shared lines.</strong> With open-drain outputs, many devices can pull a line low and none can force it high — perfect for shared interrupt or I²C lines.</li>
        <li><strong>Fail-safe.</strong> A pull-up resistor holds a disconnected active-low input negated. A broken wire reads as &ldquo;idle&rdquo;, not &ldquo;reset the system&rdquo;.</li>
      </ul>
      <ToolLink slug="active-levels">Practise until asserted/negated is automatic</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W5 · Bubble matching                                                     */
/* ======================================================================== */

export function BubbleMatching() {
  return (
    <>
      <h2>A drawing convention that does your algebra for you</h2>
      <p>
        A circuit diagram is not just a wiring list — it is a piece of writing, and it can be written clearly or
        badly. Bubble-to-bubble matching is the convention that makes a schematic <em>readable</em>.
      </p>

      <h3>The rule</h3>
      <Callout kind="key">
        Choose each gate’s symbol (standard or alternate) so that a <strong>bubbled output feeds a bubbled input</strong>,
        and a <strong>plain output feeds a plain input</strong>. Two bubbles on the same wire cancel, so you can then
        read the logic straight through, left to right, without inverting anything in your head.
      </Callout>
      <p>
        Nothing electrical changes. You are choosing which of a gate’s two legal symbols to draw, based on what the
        neighbouring gates look like.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
        <div className="panel p-4">
          <div className="text-xs font-mono text-[var(--color-ink-faint)] mb-2">Two ways to draw the SAME NAND</div>
          <div className="flex gap-4 flex-wrap items-center">
            <GateSymbol kind="NAND" width={130} labels={["A", "B"]} />
            <GateSymbol kind="NAND" alt width={130} labels={["A", "B"]} />
          </div>
          <div className="text-[13px] text-[var(--color-ink-dim)] mt-3">
            Left: &ldquo;goes LOW when both inputs are HIGH.&rdquo; Right: &ldquo;goes HIGH when either input is LOW.&rdquo;
            Identical chip; pick whichever sentence you want your reader to follow.
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-xs font-mono text-[var(--color-ink-faint)] mb-2">What a bubble on a pin means</div>
          <ul className="text-[13px] text-[var(--color-ink-dim)] space-y-2 list-disc pl-5 mt-2">
            <li><strong>Output bubble</strong> — this output is active-LOW: it asserts by going to 0.</li>
            <li><strong>Input bubble</strong> — this input expects an active-LOW signal: it responds to a 0.</li>
            <li><strong>No bubble</strong> — active-HIGH, on either side.</li>
          </ul>
        </div>
      </div>

      <h3>Worked reading of a circuit</h3>
      <p>
        Suppose a memory chip has an active-low chip-enable <code>CE̅</code>, and you want to enable it when
        <code> ADDR_VALID</code> and <code>READ</code> are both HIGH.
      </p>
      <Steps items={[
        { title: "The destination is active-low", body: <>CE̅ must go <em>LOW</em> to select the chip, so the gate driving it needs a <strong>bubbled output</strong>.</> },
        { title: "The sources are active-high", body: "ADDR_VALID and READ assert by going HIGH, so the gate needs plain inputs." },
        { title: "Plain inputs, bubbled output, condition is 'both'", body: <>That is a <strong>NAND</strong> drawn in its standard form. Reads directly as: &ldquo;when both are HIGH, pull CE̅ LOW.&rdquo;</> },
        { title: "Check the bubbles", body: "The NAND's output bubble meets CE̅'s input bubble. Matched — no mental inversion needed anywhere." },
      ]} />

      <h3>Spotting a mismatch</h3>
      <p>
        If you find a bubbled output driving a plain input, the circuit still <em>works</em> — but the drawing is
        lying to you about its intent, and you will have to carry an inversion in your head every time you read it.
        Redraw the receiving gate in its alternate form and the bubbles will line up.
      </p>
      <ToolLink slug="alt-symbols">Flip gates and see matched vs mismatched wiring side by side</ToolLink>

      <h3>Where this pays off: NAND-only conversion</h3>
      <p>
        Bubble matching is also the reason the NAND conversion trick works. Take an SOP circuit — AND gates feeding
        one OR gate. Add a bubble to each AND output and a matching bubble to each OR input: the pairs cancel, so the
        function is unchanged. But now every AND-with-bubbled-output is a NAND, and the OR-with-bubbled-inputs is
        <em> also</em> a NAND by DeMorgan. Every gate in the circuit has become a NAND, and you did no algebra at all.
      </p>
      <Callout kind="warn">
        The cancellation only happens on gate-to-gate wires. A single literal feeding the final OR directly has no
        bubble to cancel against, so it needs its own inverter.
      </Callout>
      <ToolLink slug="universal-gates">See the full NAND-only and NOR-only conversions</ToolLink>

      <h3>Analysing a CMOS circuit you have never seen</h3>
      <p>
        The same left-to-right discipline applies at transistor level. Read the NMOS network (series = AND, parallel =
        OR), complement it, and you have the function. Then verify the PMOS network is its dual. Two minutes,
        no guessing.
      </p>
      <ToolLink slug="cmos-lab">Practise on an AND-OR-Invert gate</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W6 · Electrical characteristics                                          */
/* ======================================================================== */

export function ElectricalCharacteristics() {
  return (
    <>
      <h2>The datasheet, decoded</h2>
      <p>
        Up to now a gate has been a perfect logical device. A real one has limits on voltage, current, power and
        speed, and every one of those limits has a symbol and a formula. This lesson is the whole set.
      </p>

      <h2>1 · Voltage parameters and noise margin</h2>
      <Table
        head={["Symbol", "Name", "Means"]}
        rows={[
          ["V_OH", "Output HIGH (min)", "The lowest voltage the driver promises to produce for a 1."],
          ["V_IH", "Input HIGH (min)", "The lowest voltage the receiver promises to read as a 1."],
          ["V_IL", "Input LOW (max)", "The highest voltage the receiver promises to read as a 0."],
          ["V_OL", "Output LOW (max)", "The highest voltage the driver promises to produce for a 0."],
        ]}
      />
      <Callout kind="key" title="The two noise margins">
        <p className="font-mono text-[15px] my-1">NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub></p>
        <p className="font-mono text-[15px] my-1">NM<sub>L</sub> = V<sub>IL</sub> − V<sub>OL</sub></p>
        <p className="mt-2">The circuit’s real immunity is the <strong>smaller</strong> of the two. A negative margin
        means the two families cannot be wired together at all.</p>
      </Callout>
      <p>
        For 5 V TTL: NM<sub>H</sub> = 2.4 − 2.0 = 0.4 V and NM<sub>L</sub> = 0.8 − 0.4 = 0.4 V. For 5 V CMOS both come
        out around 1.45 V — over three times better, because CMOS outputs swing nearly rail to rail and its thresholds
        sit near V<sub>DD</sub>/2.
      </p>
      <ToolLink slug="noise-margin">Calculate and see the margins drawn to scale</ToolLink>

      <h2>2 · Current parameters and fan-out</h2>
      <Table
        head={["Symbol", "Means", "Sign convention"]}
        rows={[
          ["I_OH", "Current the output can SOURCE while still meeting V_OH", "flows out of the driver"],
          ["I_OL", "Current the output can SINK while still meeting V_OL", "flows into the driver"],
          ["I_IH", "Current one input draws when it is HIGH", "flows into the load"],
          ["I_IL", "Current one input pushes back when it is LOW", "flows out of the load"],
        ]}
      />
      <Callout kind="key">
        <p className="font-mono text-[15px] my-1">fan-out = min( I<sub>OH</sub>/I<sub>IH</sub> , I<sub>OL</sub>/I<sub>IL</sub> ), rounded DOWN</p>
        <p className="mt-2">Check <strong>both</strong> states. A driver is usually far better at one of them, and the
        weaker one sets the limit.</p>
      </Callout>
      <p>
        In CMOS the DC answer is enormous (inputs draw almost no current), so the real limit is
        <strong> capacitive</strong>: each extra input adds a few pF, the driver has to charge all of it, and the rise
        time stretches in proportion. So CMOS fan-out is a <em>speed</em> limit; TTL fan-out is a <em>voltage</em> limit.
        Know which the question is about.
      </p>
      <ToolLink slug="fanout">Work out both budgets and see which one bites</ToolLink>

      <h2>3 · Power dissipation</h2>
      <Callout kind="key">
        <p><strong>Static:</strong> P<sub>S</sub> = V<sub>DD</sub> × I<sub>CC</sub> — burned just sitting there.</p>
        <p><strong>Dynamic:</strong> P<sub>D</sub> = C × V<sub>DD</sub>² × f — burned charging and discharging capacitance.</p>
      </Callout>
      <p>
        In CMOS the dynamic term dominates completely in any active chip. Three consequences follow from that one
        formula, and all three are examinable:
      </p>
      <ul>
        <li><strong>Power is proportional to clock frequency.</strong> Double the clock, double the power. This is why phones throttle.</li>
        <li><strong>Power is proportional to V².</strong> Halving the supply quarters the power — by far the most effective saving available, and the reason supply voltages have fallen from 5 V to under 1 V.</li>
        <li><strong>Power is proportional to capacitance.</strong> Smaller transistors and shorter wires save energy on every single transition.</li>
      </ul>

      <h2>4 · Switching speed</h2>
      <Table
        head={["Quantity", "Measured", "Note"]}
        rows={[
          ["Rise time t_r", "10% → 90% of a rising edge", "Set by load capacitance and available drive current"],
          ["Fall time t_f", "90% → 10% of a falling edge", "Usually shorter than t_r in CMOS: NMOS is stronger than PMOS"],
          ["t_PLH", "50% in → 50% out, output going LOW to HIGH", "Charging through the PMOS"],
          ["t_PHL", "50% in → 50% out, output going HIGH to LOW", "Discharging through the NMOS"],
          ["t_pd", "(t_PLH + t_PHL) / 2", "The single number quoted on datasheets"],
        ]}
      />
      <Callout kind="key" title="Speed-power product">
        Power alone is a poor comparison, because a slow chip burns less simply by doing less. The figure of merit is
        <strong> P × t<sub>pd</sub></strong>, measured in joules (usually pJ) — the energy per operation. Lower is better,
        and it is the honest way to compare two logic families.
      </Callout>
      <ToolLink slug="power-calc">Compute static, dynamic and speed-power product</ToolLink>
      <ToolLink slug="timing-lab">Measure t_r, t_f and t_pd on a waveform</ToolLink>

      <h2>5 · Tri-state and open-drain outputs</h2>
      <p>
        A normal (totem-pole) output always drives — it is either pushing to V<sub>DD</sub> or pulling to ground.
        Tie two of them together with different values and you create a short circuit through both transistors.
        But buses need many devices on one wire, so there are two solutions.
      </p>
      <Table
        head={["", "Tri-state", "Open-drain / open-collector"]}
        rows={[
          ["Third state", "Hi-Z — both transistors off, pin disconnected", "The output can only pull LOW, or let go"],
          ["The HIGH comes from", "The gate's own pull-up transistor", "An external pull-up resistor"],
          ["Multiple drivers", "Only ONE may be enabled — otherwise bus contention (a short)", "Any number, safely — nobody can force a HIGH"],
          ["Free logic", "None", "Wired-AND: the line is 1 only if every driver lets go"],
          ["Speed", "Fast in both directions", "Slow rising edge — the resistor must charge the bus (t_r = RC)"],
          ["Typical use", "Data buses, memory outputs", "Shared interrupt lines, I²C, level shifting"],
        ]}
      />
      <Callout kind="warn">
        Two dangers to name in an exam: <strong>contention</strong> (two enabled tri-state drivers disagreeing — a
        direct short that can destroy the chips) and <strong>floating</strong> (no driver enabled, so the bus drifts
        into the undefined region, reads randomly and wastes power). Real designs prevent the first with a decoder
        that can only assert one enable, and the second with a weak bus-hold or pull-up.
      </Callout>
      <ToolLink slug="tristate-lab">Create contention on purpose and see what happens</ToolLink>
    </>
  );
}

/* ======================================================================== */
/* W6 · Schmitt, PLA, number formats                                        */
/* ======================================================================== */

export function SchmittPlaFloat() {
  return (
    <>
      <h2>1 · Schmitt-trigger inputs</h2>
      <p>
        An ordinary logic input has one threshold. Feed it a slow or noisy signal and, as the voltage wobbles across
        that threshold, the output produces a burst of spurious edges — which a counter downstream will dutifully count.
      </p>
      <Callout kind="key">
        A <strong>Schmitt-trigger</strong> input has <em>two</em> thresholds: a higher one, V<sub>T+</sub>, for
        switching on the way up, and a lower one, V<sub>T−</sub>, for switching on the way down. Once it has
        switched, the input must travel all the way back past the <em>other</em> threshold to switch again.
        The gap V<sub>H</sub> = V<sub>T+</sub> − V<sub>T−</sub> is called <strong>hysteresis</strong>, and any noise
        smaller than it is simply ignored.
      </Callout>
      <p>
        On a transfer characteristic this shows up as a loop: the output depends not only on the input now, but on
        which direction the input came from. The symbol for a Schmitt input is that little loop drawn inside the gate.
      </p>
      <p>Where you meet one:</p>
      <ul>
        <li><strong>Switch debouncing</strong> — mechanical contacts bounce for milliseconds; a Schmitt input plus an RC turns that mess into one clean edge.</li>
        <li><strong>Slow signals</strong> — anything through an RC filter or a long cable. Feeding a slow edge into an ordinary CMOS gate makes both transistors conduct at once for a long time, wasting power and heating the chip.</li>
        <li><strong>Noisy lines</strong> — sensors, ribbon cables, anything near a motor.</li>
        <li><strong>Relaxation oscillators</strong> — a Schmitt inverter with RC feedback oscillates by itself.</li>
      </ul>
      <ToolLink slug="schmitt-lab">Feed the same noisy signal to a plain and a Schmitt input</ToolLink>

      <h2>2 · Programmable logic arrays</h2>
      <p>
        Any Boolean function can be written as a sum of products. So a chip containing an <strong>AND plane</strong>
        followed by an <strong>OR plane</strong>, with programmable connections, can implement anything — you choose
        the wiring instead of choosing the chips.
      </p>
      <Table
        head={["Device", "AND plane", "OR plane", "Trade-off"]}
        rows={[
          ["PROM / ROM", "Fixed — a full decoder generating all 2ⁿ minterms", "Programmable", "Simplest, but the decoder doubles in size with every extra input. No minimisation needed at all."],
          ["PLA", "Programmable", "Programmable", "Most flexible; product terms can be shared between outputs. Slowest and priciest."],
          ["PAL", "Programmable", "Fixed — each output gets its own fixed set of terms", "Cheaper and faster than a PLA; you lose term sharing."],
        ]}
      />
      <p>
        A ROM is worth a second look: address in, data out, is literally a stored truth table. That is why
        &ldquo;use a ROM as a lookup table&rdquo; is a legitimate answer to a combinational-design question — and why
        logic minimisation only saves you money in the PLA/PAL world.
      </p>
      <p>
        Modern <strong>CPLDs</strong> are essentially arrays of PAL-like blocks; <strong>FPGAs</strong> replace the
        planes entirely with thousands of small lookup tables plus programmable routing and flip-flops.
      </p>
      <ToolLink slug="pla-builder">Program both planes and watch the truth table appear</ToolLink>

      <h2>3 · Fixed-point numbers</h2>
      <p>
        Store the number as a plain 2’s complement integer and <em>pretend</em> there is a binary point at a fixed
        position. Nothing in the hardware knows about the point — it is bookkeeping you do in your head, and the
        ordinary integer adder works unchanged.
      </p>
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        Q8.8 format — 8 integer bits, 8 fraction bits, 16 bits total<br />
        stored value = round(real × 2⁸)<br /><br />
        3.75 → round(3.75 × 256) = 960 → 0000 0011 . 1100 0000<br />
        resolution = 2⁻⁸ = 0.0039<br />
        range = −128.0 … +127.996
      </div>
      <ul>
        <li><strong>Good:</strong> arithmetic is just integer arithmetic. Fast, cheap, exactly predictable rounding.</li>
        <li><strong>Bad:</strong> small range, and the resolution is the same whether the number is 0.01 or 100 — which is wasteful at one end and inadequate at the other.</li>
      </ul>

      <h2>4 · Floating-point numbers (IEEE-754)</h2>
      <p>
        Store the digits and separately store <em>where the point goes</em> — binary scientific notation.
        The layout for single precision (32 bits):
      </p>
      <Table
        head={["Field", "Bits (single)", "Bits (double)", "Purpose"]}
        rows={[
          ["Sign S", "1", "1", "0 = positive, 1 = negative"],
          ["Exponent E", "8", "11", "Stored with a bias: 127 for single, 1023 for double"],
          ["Mantissa M", "23", "52", "The fraction part; the leading 1 is implied, not stored"],
        ]}
      />
      <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 my-4 text-[var(--color-ink-dim)] leading-relaxed">
        value = (−1)<sup>S</sup> × 1.M × 2<sup>(E − bias)</sup>
      </div>
      <Callout kind="key" title="Two design decisions worth understanding">
        <p><strong>The hidden 1.</strong> A normalised binary number always starts &ldquo;1.something&rdquo;, so storing that
        leading 1 would waste a bit. It is implied — which buys one extra bit of precision for free, and is why zero
        needs a special encoding.</p>
        <p className="mt-2"><strong>The bias.</strong> Exponents must be able to go negative. Rather than using 2’s
        complement, IEEE-754 adds a bias (127 for single) so the stored exponent is always non-negative. Handy
        side-effect: floats can then be compared as if they were integers.</p>
      </Callout>
      <p>To convert 12.375 to single precision by hand:</p>
      <Steps items={[
        { title: "Convert to binary", body: <>12.375 = 1100.011₂</> },
        { title: "Normalise", body: <>1100.011 = 1.100011 × 2³. The exponent is 3.</> },
        { title: "Bias the exponent", body: <>3 + 127 = 130 = 10000010₂</> },
        { title: "Take the mantissa", body: <>Everything after the leading 1: 100011, padded with zeros to 23 bits.</> },
        { title: "Assemble", body: <>S=0, E=10000010, M=10001100000000000000000</> },
      ]} />
      <Callout kind="warn">
        Floating point trades exactness for range. 0.1 has no exact binary representation — the stored value is
        slightly off, forever — which is why you never compare floats with <code>==</code>, and why financial software
        uses fixed point or BCD instead.
      </Callout>
      <ToolLink slug="float-lab">Pull any number apart into its sign, exponent and mantissa</ToolLink>
    </>
  );
}
