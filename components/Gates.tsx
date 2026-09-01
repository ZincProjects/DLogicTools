"use client";
import React from "react";

export type GateKind = "AND" | "OR" | "NOT" | "BUF" | "NAND" | "NOR" | "XOR" | "XNOR";

export const GATE_INFO: Record<GateKind, { name: string; plain: string; expr: string; rule: string; inputs: number }> = {
  AND:  { name: "AND",  plain: "Output is 1 only when EVERY input is 1.",      expr: "Y = A·B",     rule: "Any 0 in ⇒ output 0.", inputs: 2 },
  OR:   { name: "OR",   plain: "Output is 1 when AT LEAST ONE input is 1.",    expr: "Y = A + B",   rule: "Any 1 in ⇒ output 1.", inputs: 2 },
  NOT:  { name: "NOT",  plain: "Flips the bit. 0 becomes 1, 1 becomes 0.",     expr: "Y = A'",      rule: "Inverter.", inputs: 1 },
  BUF:  { name: "BUFFER", plain: "Copies the bit unchanged — used to boost drive strength.", expr: "Y = A", rule: "No logic change, more current.", inputs: 1 },
  NAND: { name: "NAND", plain: "AND then inverted. Output is 0 only when every input is 1.", expr: "Y = (A·B)'", rule: "Any 0 in ⇒ output 1.", inputs: 2 },
  NOR:  { name: "NOR",  plain: "OR then inverted. Output is 1 only when every input is 0.",  expr: "Y = (A+B)'", rule: "Any 1 in ⇒ output 0.", inputs: 2 },
  XOR:  { name: "XOR",  plain: "Output is 1 when the inputs are DIFFERENT.",   expr: "Y = A ⊕ B",   rule: "Odd number of 1s ⇒ 1.", inputs: 2 },
  XNOR: { name: "XNOR", plain: "Output is 1 when the inputs are the SAME.",    expr: "Y = (A⊕B)'",  rule: "Equality detector.", inputs: 2 },
};

export function evalGate(kind: GateKind, a: 0 | 1, b: 0 | 1): 0 | 1 {
  switch (kind) {
    case "AND": return (a && b) ? 1 : 0;
    case "OR": return (a || b) ? 1 : 0;
    case "NOT": return a ? 0 : 1;
    case "BUF": return a;
    case "NAND": return (a && b) ? 0 : 1;
    case "NOR": return (a || b) ? 0 : 1;
    case "XOR": return a !== b ? 1 : 0;
    case "XNOR": return a === b ? 1 : 0;
  }
}

/**
 * Distinctive-shape (ANSI) gate symbol.
 * Drawn in a 120x80 viewBox: inputs enter at x=0, output leaves at x=120.
 */
export function GateSymbol({
  kind, width = 132, inputs, output, labels, alt = false,
}: {
  kind: GateKind; width?: number;
  inputs?: (0 | 1)[]; output?: 0 | 1;
  labels?: string[]; alt?: boolean;
}) {
  const one = kind === "NOT" || kind === "BUF";
  const nIn = one ? 1 : 2;
  const yTop = 26, yBot = 54, yMid = 40;
  const ys = one ? [yMid] : [yTop, yBot];
  const bubbleOut = kind === "NAND" || kind === "NOR" || kind === "XNOR" || kind === "NOT";
  const stroke = "#8fa2bd";

  // In the DeMorgan "alternate" form we bubble the inputs and flip the body shape.
  const bodyKind: GateKind = alt
    ? ({ AND: "OR", OR: "AND", NAND: "OR", NOR: "AND", NOT: "NOT", BUF: "BUF", XOR: "XOR", XNOR: "XNOR" } as const)[kind]
    : kind;
  const altBubbleIn = alt && kind !== "NOT" && kind !== "BUF";
  const altBubbleOut = alt ? !bubbleOut : bubbleOut;

  const wireColor = (v?: 0 | 1) => (v === undefined ? stroke : v ? "var(--color-hi)" : "#4a5568");

  const body = () => {
    const k = bodyKind;
    if (k === "AND" || k === "NAND")
      return <path d="M38 16 H62 A24 24 0 0 1 62 64 H38 Z" fill="#151c28" stroke={stroke} strokeWidth="2.2" />;
    if (k === "OR" || k === "NOR" || k === "XOR" || k === "XNOR")
      return (
        <g>
          {(k === "XOR" || k === "XNOR") && <path d="M28 16 Q42 40 28 64" fill="none" stroke={stroke} strokeWidth="2.2" />}
          <path d="M36 16 Q56 16 86 40 Q56 64 36 64 Q50 40 36 16 Z" fill="#151c28" stroke={stroke} strokeWidth="2.2" />
        </g>
      );
    // NOT / BUF triangle
    return <path d="M40 16 L78 40 L40 64 Z" fill="#151c28" stroke={stroke} strokeWidth="2.2" />;
  };

  const bodyRight = bodyKind === "AND" || bodyKind === "NAND" ? 86 : bodyKind === "NOT" || bodyKind === "BUF" ? 78 : 86;
  const inX = altBubbleIn ? 26 : 12;

  return (
    <svg viewBox="0 0 132 80" width={width} className="overflow-visible select-none">
      {/* input wires */}
      {ys.map((y, i) => {
        const startX = bodyKind === "OR" || bodyKind === "NOR" || bodyKind === "XOR" || bodyKind === "XNOR" ? 44 : 38;
        return (
          <g key={i}>
            <line x1="2" y1={y} x2={altBubbleIn ? inX - 5 : startX} y2={y} stroke={wireColor(inputs?.[i])} strokeWidth="2.2" />
            {altBubbleIn && (
              <>
                <circle cx={inX} cy={y} r="5" fill="#151c28" stroke={stroke} strokeWidth="2" />
                <line x1={inX + 5} y1={y} x2={startX} y2={y} stroke={stroke} strokeWidth="2.2" />
              </>
            )}
            {labels?.[i] && <text x="0" y={y - 7} fill="#98a3b8" fontSize="11" fontFamily="var(--font-mono)">{labels[i]}</text>}
            {inputs?.[i] !== undefined && (
              <text x="4" y={y + 15} fill={wireColor(inputs[i])} fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">{inputs[i]}</text>
            )}
          </g>
        );
      })}
      {body()}
      {altBubbleOut && <circle cx={bodyRight + 6} cy={yMid} r="5" fill="#151c28" stroke={stroke} strokeWidth="2" />}
      <line x1={altBubbleOut ? bodyRight + 11 : bodyRight} y1={yMid} x2="130" y2={yMid} stroke={wireColor(output)} strokeWidth="2.2" />
      {output !== undefined && <text x="112" y={yMid - 7} fill={wireColor(output)} fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">{output}</text>}
    </svg>
  );
}

/** IEEE / rectangular (distinctive-shape's formal twin) — students see both in SC1005. */
export function IEEESymbol({ kind, width = 110 }: { kind: GateKind; width?: number }) {
  const one = kind === "NOT" || kind === "BUF";
  const ys = one ? [40] : [28, 52];
  const bubble = kind === "NAND" || kind === "NOR" || kind === "XNOR" || kind === "NOT";
  const qualifier = { AND: "&", NAND: "&", OR: "≥1", NOR: "≥1", XOR: "=1", XNOR: "=1", NOT: "1", BUF: "1" }[kind];
  const stroke = "#8fa2bd";
  return (
    <svg viewBox="0 0 120 80" width={width}>
      {ys.map((y, i) => <line key={i} x1="4" y1={y} x2="36" y2={y} stroke={stroke} strokeWidth="2.2" />)}
      <rect x="36" y="16" width="44" height="48" rx="2" fill="#151c28" stroke={stroke} strokeWidth="2.2" />
      <text x="58" y="46" textAnchor="middle" fill="#cbd5e1" fontSize="16" fontWeight="600" fontFamily="var(--font-mono)">{qualifier}</text>
      {bubble && <circle cx="86" cy="40" r="5" fill="#151c28" stroke={stroke} strokeWidth="2" />}
      <line x1={bubble ? 91 : 80} y1="40" x2="116" y2="40" stroke={stroke} strokeWidth="2.2" />
    </svg>
  );
}

/** A labelled wire/pin used inside hand-drawn circuit figures. */
export function Wire({ x1, y1, x2, y2, on }: { x1: number; y1: number; x2: number; y2: number; on?: 0 | 1 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on === undefined ? "#8fa2bd" : on ? "var(--color-hi)" : "#4a5568"} strokeWidth="2.2" strokeLinecap="round" />;
}
