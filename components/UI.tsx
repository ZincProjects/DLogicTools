"use client";
import React from "react";

export function Panel({ children, className = "", pad = true }: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return <div className={`panel ${pad ? "p-5" : ""} ${className}`}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)] mb-2">{children}</div>;
}

export function Field({
  label, value, onChange, placeholder, mono = true, className = "", error,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; className?: string; error?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      {label && <Label>{label}</Label>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`w-full rounded-lg bg-[#0d1219] border px-3 py-2.5 text-[15px] outline-none transition
          ${mono ? "font-mono tracking-wide" : ""}
          ${error ? "border-[var(--color-bad)]" : "border-[var(--color-line)] focus:border-[var(--color-accent)]"}
          placeholder:text-[var(--color-ink-faint)]`}
      />
    </label>
  );
}

export function NumberStepper({
  label, value, onChange, min, max,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-lg border border-[var(--color-line)] bg-[#0d1219] hover:border-[var(--color-accent)] transition text-lg leading-none">−</button>
        <div className="w-12 text-center font-mono text-lg">{value}</div>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 rounded-lg border border-[var(--color-line)] bg-[#0d1219] hover:border-[var(--color-accent)] transition text-lg leading-none">+</button>
      </div>
    </div>
  );
}

export function Seg<T extends string | number | boolean>({
  options, value, onChange, size = "md",
}: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-1 gap-1 flex-wrap">
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)}
          className={`rounded-md transition font-medium ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"}
            ${value === o.v ? "bg-[var(--color-accent)] text-[#06111f]" : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] hover:bg-[#1a2130]"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Bit({ v, onClick, size = "md", tone }: { v: 0 | 1 | "x" | "-"; onClick?: () => void; size?: "sm" | "md" | "lg"; tone?: "accent" | "warn" }) {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-12 h-12 text-lg" : "w-9 h-9 text-sm";
  const on = v === 1;
  const dc = v === "x" || v === "-";
  return (
    <button onClick={onClick} disabled={!onClick}
      className={`${dim} rounded-md font-mono font-bold border grid place-items-center transition
        ${dc ? "bg-[#2a2416] border-[var(--color-warn)] text-[var(--color-warn)]"
          : on ? (tone === "accent" ? "bg-[#12304a] border-[var(--color-accent)] text-[var(--color-accent)]" : "bg-[#10301f] border-[var(--color-hi)] text-[var(--color-hi)]")
               : "bg-[#0d1219] border-[var(--color-line)] text-[var(--color-ink-faint)]"}
        ${onClick ? "cursor-pointer hover:brightness-125" : "cursor-default"}`}>
      {dc ? "X" : v}
    </button>
  );
}

export function Callout({ kind = "tip", title, children }: { kind?: "tip" | "warn" | "key"; title?: string; children: React.ReactNode }) {
  const c = {
    tip:  { b: "#60a5fa", bg: "rgba(96,165,250,0.07)",  icon: "💡", t: "Think of it like this" },
    warn: { b: "#fbbf24", bg: "rgba(251,191,36,0.07)",  icon: "⚠️", t: "Exam trap" },
    key:  { b: "#a78bfa", bg: "rgba(167,139,250,0.07)", icon: "🔑", t: "Must remember" },
  }[kind];
  return (
    <div className="my-5 rounded-xl px-4 py-3.5" style={{ borderLeftColor: c.b, background: c.bg, border: `1px solid ${c.b}33`, borderLeftWidth: 3 }}>
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: c.b }}>{c.icon} {title ?? c.t}</div>
      <div className="text-[var(--color-ink-dim)] text-[15px] leading-relaxed [&_p]:my-1.5 [&_code]:font-mono [&_strong]:text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

export function Table({ head, rows, highlight }: { head: React.ReactNode[]; rows: React.ReactNode[][]; highlight?: (i: number) => boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-line)]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#0d1219]">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-semibold text-[var(--color-ink-faint)] text-[11px] uppercase tracking-wider border-b border-[var(--color-line)] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-[var(--color-line-soft)] last:border-0 ${highlight?.(i) ? "bg-[rgba(96,165,250,0.09)]" : "hover:bg-[#151b26]"}`}>
              {r.map((c, j) => <td key={j} className="px-3 py-2 font-mono text-[13px] whitespace-nowrap">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Result({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "good" | "bad" | "accent" }) {
  const col = tone === "good" ? "var(--color-hi)" : tone === "bad" ? "var(--color-bad)" : tone === "accent" ? "var(--color-accent)" : "var(--color-ink)";
  return (
    <div className="rounded-lg bg-[#0d1219] border border-[var(--color-line)] px-3.5 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">{label}</div>
      <div className="font-mono text-lg mt-1 break-all" style={{ color: col }}>{value}</div>
      {sub && <div className="text-xs text-[var(--color-ink-faint)] mt-1 font-mono break-all">{sub}</div>}
    </div>
  );
}

export function Chip({ children, tone = "n" }: { children: React.ReactNode; tone?: "n" | "good" | "bad" | "warn" | "accent" }) {
  const m = {
    n: "border-[var(--color-line)] text-[var(--color-ink-dim)] bg-[#0d1219]",
    good: "border-[var(--color-hi)] text-[var(--color-hi)] bg-[#10301f]",
    bad: "border-[var(--color-bad)] text-[var(--color-bad)] bg-[#301616]",
    warn: "border-[var(--color-warn)] text-[var(--color-warn)] bg-[#2a2416]",
    accent: "border-[var(--color-accent)] text-[var(--color-accent)] bg-[#12253a]",
  }[tone];
  return <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${m}`}>{children}</span>;
}

export function Steps({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-[#12253a] border border-[var(--color-accent)] text-[var(--color-accent)] grid place-items-center text-xs font-bold mt-0.5">{i + 1}</span>
          <div className="min-w-0">
            <div className="font-semibold text-[15px]">{s.title}</div>
            <div className="text-[var(--color-ink-dim)] text-sm mt-0.5 [&_code]:font-mono">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
