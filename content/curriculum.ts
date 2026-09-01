// The syllabus from "key concepts (week 1-6)", turned into a learning path.
// Every bullet in the PDF maps to a lesson section and, where it helps, a tool.

export type LessonMeta = {
  slug: string;
  week: number;
  source: string;      // which lecture / PDF this came from
  title: string;
  hook: string;        // one line, plain English
  minutes: number;
  concepts: string[];  // verbatim-ish from the key-concepts sheet
  tools: string[];     // tool slugs
};

export const LESSONS: LessonMeta[] = [
  {
    slug: "what-is-digital",
    week: 1,
    source: "1_Introduction",
    title: "What “digital” actually means",
    hook: "Why we throw away infinite detail and keep only two voltages — and why that turns out to be a superpower.",
    minutes: 12,
    concepts: [
      "Representing analog quantities in digital form",
      "Representing numbers in digital form",
      "Electrical voltage in digital design",
      "Software for digital design",
      "Integrated logic circuits (SSI → VLSI)",
      "Programmable logic devices",
      "Serial vs parallel data transfer",
    ],
    tools: ["voltage-levels", "serial-parallel"],
  },
  {
    slug: "number-systems",
    week: 1,
    source: "2a_Number Systems",
    title: "Binary, octal, decimal, hex",
    hook: "Four ways of writing the same number. Learn one trick and all six conversions fall out.",
    minutes: 18,
    concepts: ["Binary", "Octal", "Decimal", "Hexadecimal", "Conversions between all four bases"],
    tools: ["base-converter"],
  },
  {
    slug: "codes",
    week: 1,
    source: "2b_Codes",
    title: "Codes: BCD, Gray, ASCII, parity",
    hook: "Binary that isn’t a number. Each code is a different deal you strike with the hardware.",
    minutes: 15,
    concepts: ["Straight binary", "Binary-coded decimal (BCD)", "Gray code", "ASCII code", "Parity bit"],
    tools: ["code-explorer", "parity-lab"],
  },
  {
    slug: "logic-gates",
    week: 1,
    source: "L1",
    title: "The basic gates & truth tables",
    hook: "AND, OR, NOT, buffer. Five minutes of rules that the whole rest of the course is built on.",
    minutes: 20,
    concepts: [
      "Basic logic gates: AND, OR, NOT, buffer",
      "Truth table",
      "Logic (Boolean) expression",
      "Timing waveform: rise time, fall time, propagation delay",
      "Logic circuit diagram",
    ],
    tools: ["gate-lab", "truth-table", "timing-lab"],
  },
  {
    slug: "boolean-algebra",
    week: 1,
    source: "L2",
    title: "Boolean algebra & universal gates",
    hook: "The 12 theorems you may not look up in the exam, plus why NAND alone can build a computer.",
    minutes: 22,
    concepts: [
      "Single-variable Boolean theorems",
      "Multi-variable Boolean theorems",
      "DeMorgan’s theorems",
      "NAND and NOR gates",
      "NAND-only and NOR-only implementations",
    ],
    tools: ["boolean-laws", "universal-gates", "truth-table"],
  },
  {
    slug: "alt-symbols-xor",
    week: 2,
    source: "L3",
    title: "Alternate symbols, XOR & parity",
    hook: "Every gate has two faces. Learn to read the second one and circuit diagrams stop being scary.",
    minutes: 18,
    concepts: [
      "Alternate logic symbols (DeMorgan equivalents)",
      "XOR and XNOR gates",
      "Parity generator / checker",
      "Logic components connection diagram",
    ],
    tools: ["alt-symbols", "parity-lab", "gate-lab"],
  },
  {
    slug: "adders",
    week: 2,
    source: "L4",
    title: "Adders & signed numbers",
    hook: "Build addition out of gates, then work out how to say “minus”.",
    minutes: 25,
    concepts: [
      "Half adder",
      "Full adder",
      "Parallel (ripple-carry) adder",
      "Carry propagation",
      "Sign-magnitude representation",
      "2’s complement representation",
    ],
    tools: ["adder-lab", "signed-numbers"],
  },
  {
    slug: "twos-complement-arithmetic",
    week: 3,
    source: "L5",
    title: "2’s complement arithmetic & overflow",
    hook: "Subtraction without a subtractor — and the one exam question everybody gets wrong: overflow.",
    minutes: 22,
    concepts: ["Sign extension for 2’s complement numbers", "2’s complement add/subtract", "Arithmetic overflow"],
    tools: ["twos-calc", "signed-numbers"],
  },
  {
    slug: "arithmetic-circuits",
    week: 3,
    source: "L6",
    title: "Arithmetic circuits: add/sub, multiply, BCD",
    hook: "One adder, one XOR row, one control line — and you have an adder-subtractor.",
    minutes: 24,
    concepts: [
      "Circuit for 2’s complement add/subtract",
      "Parallel addition with registers",
      "Binary multiplication",
      "BCD addition (and the +6 fix)",
    ],
    tools: ["addsub-circuit", "multiplier", "bcd-adder"],
  },
  {
    slug: "minterms-sop-pos",
    week: 4,
    source: "L7",
    title: "Minterms, maxterms, SOP & POS",
    hook: "How to turn any truth table into an equation, mechanically, with zero cleverness required.",
    minutes: 22,
    concepts: [
      "Minterm and maxterm",
      "Canonical Boolean expressions",
      "SOP and POS expressions",
      "Active-high and active-low logic signals",
    ],
    tools: ["truth-table", "kmap"],
  },
  {
    slug: "karnaugh-maps",
    week: 4,
    source: "L8",
    title: "Karnaugh maps",
    hook: "Draw the boxes, circle the biggest blobs of 1s, read off the answer. That’s the whole method.",
    minutes: 26,
    concepts: [
      "Karnaugh map to simplify Boolean expressions",
      "Grouping rules (powers of two, wrap-around)",
      "What to do with don’t-cares",
      "How to enable or disable a circuit",
    ],
    tools: ["kmap", "enable-lab"],
  },
  {
    slug: "ttl-cmos",
    week: 5,
    source: "L9",
    title: "TTL vs CMOS & the transistor switch",
    hook: "Under every gate are transistors acting as light switches. Here’s the whole idea in one picture.",
    minutes: 20,
    concepts: [
      "Difference between TTL and CMOS",
      "Transistor on/off behaviour",
      "Active-high, active-low, asserted, negated",
    ],
    tools: ["cmos-lab", "active-levels"],
  },
  {
    slug: "bubble-matching",
    week: 5,
    source: "L10",
    title: "Bubble-to-bubble matching & CMOS analysis",
    hook: "A drawing convention that lets you read a circuit’s meaning off the page without any algebra.",
    minutes: 20,
    concepts: [
      "Bubble-to-bubble matching in logic circuit diagrams",
      "Functional analysis of simple CMOS logic circuits",
    ],
    tools: ["alt-symbols", "cmos-lab"],
  },
  {
    slug: "electrical-characteristics",
    week: 6,
    source: "L11",
    title: "Real chips: noise margin, fan-out, power, speed",
    hook: "The datasheet numbers, what each one means, and the three formulas you will be asked to compute.",
    minutes: 24,
    concepts: [
      "Voltage parameters and noise margin",
      "Current parameters and fan-out",
      "Power dissipation",
      "Switching speed and propagation delay",
      "Rise time and fall time",
      "Tri-state output and open-drain output",
    ],
    tools: ["noise-margin", "fanout", "power-calc", "timing-lab", "tristate-lab"],
  },
  {
    slug: "schmitt-pla-float",
    week: 6,
    source: "L12",
    title: "Schmitt triggers, PLAs & number formats",
    hook: "Cleaning up ugly signals, programmable logic, and how a computer stores 3.14.",
    minutes: 22,
    concepts: [
      "Schmitt-trigger input and hysteresis",
      "Programmable logic array (PLA / PAL / ROM)",
      "Fixed-point numbers",
      "Floating-point numbers (IEEE-754)",
    ],
    tools: ["schmitt-lab", "pla-builder", "float-lab"],
  },
];

export type ToolMeta = {
  slug: string;
  name: string;
  blurb: string;
  week: number;
  icon: string;
  group: "Numbers" | "Logic" | "Arithmetic" | "Simplification" | "Hardware";
};

export const TOOLS: ToolMeta[] = [
  { slug: "base-converter", name: "Base Converter", blurb: "Binary ⇄ octal ⇄ decimal ⇄ hex with the full hand-working shown.", week: 1, icon: "⇄", group: "Numbers" },
  { slug: "code-explorer", name: "Code Explorer", blurb: "One number, shown at once as straight binary, BCD, Gray code and ASCII.", week: 1, icon: "🔤", group: "Numbers" },
  { slug: "parity-lab", name: "Parity Lab", blurb: "Generate a parity bit, then inject an error and watch the checker catch it.", week: 1, icon: "✓", group: "Numbers" },
  { slug: "voltage-levels", name: "Voltage Level Explorer", blurb: "Drag a voltage and see when a chip calls it 0, 1, or “undefined”.", week: 1, icon: "⚡", group: "Hardware" },
  { slug: "serial-parallel", name: "Serial vs Parallel", blurb: "Animated side-by-side of the two ways to move a byte.", week: 1, icon: "⇉", group: "Hardware" },
  { slug: "gate-lab", name: "Gate Lab", blurb: "Click inputs on live gate symbols. All 8 gates, both symbol styles.", week: 1, icon: "⊕", group: "Logic" },
  { slug: "truth-table", name: "Truth Table Builder", blurb: "Type any Boolean expression → truth table, minterms, SOP, POS and the minimal form.", week: 1, icon: "▦", group: "Logic" },
  { slug: "timing-lab", name: "Timing & Delay Lab", blurb: "Rise time, fall time and propagation delay measured on a real-looking waveform.", week: 1, icon: "〜", group: "Hardware" },
  { slug: "boolean-laws", name: "Boolean Law Reference", blurb: "All the theorems with a proof table for each, generated live.", week: 1, icon: "§", group: "Logic" },
  { slug: "universal-gates", name: "NAND / NOR Builder", blurb: "See any gate rebuilt from NANDs only or NORs only, step by step.", week: 1, icon: "⌗", group: "Logic" },
  { slug: "alt-symbols", name: "Alternate Symbol Flipper", blurb: "Flip any gate to its DeMorgan twin and check bubble-to-bubble matching.", week: 2, icon: "◑", group: "Logic" },
  { slug: "adder-lab", name: "Adder Lab", blurb: "Half adder, full adder and a 4/8-bit ripple-carry adder with carry animation.", week: 2, icon: "＋", group: "Arithmetic" },
  { slug: "signed-numbers", name: "Signed Number Explorer", blurb: "Sign-magnitude vs 1’s vs 2’s complement, side by side, for any value.", week: 2, icon: "±", group: "Arithmetic" },
  { slug: "twos-calc", name: "2’s Complement Calculator", blurb: "Add or subtract signed numbers with overflow detection and sign extension.", week: 3, icon: "∓", group: "Arithmetic" },
  { slug: "addsub-circuit", name: "Adder-Subtractor Circuit", blurb: "The one-control-line circuit that does both operations.", week: 3, icon: "⊞", group: "Arithmetic" },
  { slug: "multiplier", name: "Binary Multiplier", blurb: "Long multiplication in binary, one partial product at a time.", week: 3, icon: "×", group: "Arithmetic" },
  { slug: "bcd-adder", name: "BCD Adder", blurb: "Watch the “add 6” correction trigger, and understand why it exists.", week: 3, icon: "⑥", group: "Arithmetic" },
  { slug: "kmap", name: "Karnaugh Map Solver", blurb: "2–5 variables, don’t-cares, drawn groups, minimal SOP and POS.", week: 4, icon: "▩", group: "Simplification" },
  { slug: "enable-lab", name: "Enable / Disable Lab", blurb: "How AND, OR, NAND and NOR are used as gates that switch a signal on and off.", week: 4, icon: "⎇", group: "Logic" },
  { slug: "cmos-lab", name: "CMOS Transistor Lab", blurb: "Build and analyse pull-up / pull-down networks; see the truth table appear.", week: 5, icon: "⧉", group: "Hardware" },
  { slug: "active-levels", name: "Active-High / Low Decoder", blurb: "Asserted vs negated, overbars, and what a bubble on a pin really means.", week: 5, icon: "‾", group: "Hardware" },
  { slug: "noise-margin", name: "Noise Margin Calculator", blurb: "V_OH, V_IH, V_IL, V_OL → the two noise margins, drawn to scale.", week: 6, icon: "⌇", group: "Hardware" },
  { slug: "fanout", name: "Fan-out Calculator", blurb: "Current budget in both states — how many inputs one output can drive.", week: 6, icon: "⑂", group: "Hardware" },
  { slug: "power-calc", name: "Power & Speed Calculator", blurb: "Static vs dynamic power, CV²f, and the speed-power product.", week: 6, icon: "🔋", group: "Hardware" },
  { slug: "tristate-lab", name: "Tri-state & Open-drain Lab", blurb: "Share one wire between many drivers without letting the smoke out.", week: 6, icon: "⎓", group: "Hardware" },
  { slug: "schmitt-lab", name: "Schmitt Trigger Lab", blurb: "Feed a noisy signal into a normal input and a Schmitt input, and compare.", week: 6, icon: "⎗", group: "Hardware" },
  { slug: "pla-builder", name: "PLA Builder", blurb: "Program an AND plane and an OR plane and watch the outputs follow.", week: 6, icon: "▤", group: "Simplification" },
  { slug: "float-lab", name: "Fixed & Floating Point", blurb: "IEEE-754 bit-by-bit, plus fixed-point Q-format, with the arithmetic shown.", week: 6, icon: "·", group: "Numbers" },
];

export const WEEKS = [
  { n: 1, title: "Foundations", blurb: "What digital is, how to write numbers, and the gates everything is made of." },
  { n: 2, title: "Symbols & Adding", blurb: "Reading circuit diagrams properly, XOR, and building an adder." },
  { n: 3, title: "Signed Arithmetic", blurb: "Negative numbers, overflow, multiplication and BCD." },
  { n: 4, title: "Simplification", blurb: "Truth table → equation → smallest possible circuit." },
  { n: 5, title: "Inside the Chip", blurb: "Transistors, CMOS, TTL and the active-high/low convention." },
  { n: 6, title: "Real-World Limits", blurb: "Noise, current, power, speed, and programmable logic." },
];

export const lessonBySlug = (s: string) => LESSONS.find((l) => l.slug === s);
export const toolBySlug = (s: string) => TOOLS.find((t) => t.slug === s);
