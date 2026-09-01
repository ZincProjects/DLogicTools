"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel, Label, Chip, NumberStepper } from "@/components/UI";
import { GENERATORS, generateSet, Question } from "@/lib/practice";
import { WEEKS } from "@/content/curriculum";

export default function PracticeClient() {
  const params = useSearchParams();
  const [weeks, setWeeks] = useState<number[]>([]);
  const [count, setCount] = useState(6);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shown, setShown] = useState<Set<number>>(new Set());

  useEffect(() => {
    const w = params.get("week");
    const initial = w ? [parseInt(w, 10)] : [];
    setWeeks(initial);
    setQuestions(generateSet(initial, 6));
  }, [params]);

  const regenerate = (ws = weeks, n = count) => {
    setQuestions(generateSet(ws, n));
    setShown(new Set());
  };

  const toggleWeek = (n: number) => {
    const next = weeks.includes(n) ? weeks.filter((w) => w !== n) : [...weeks, n];
    setWeeks(next);
    regenerate(next, count);
  };

  const reveal = (i: number) => setShown(new Set([...shown, i]));

  return (
    <div className="mt-8 space-y-5">
      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Weeks (leave blank for everything)</Label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKS.map((w) => (
                <button key={w.n} onClick={() => toggleWeek(w.n)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                    weeks.includes(w.n)
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[#06111f]"
                      : "border-[var(--color-line)] text-[var(--color-ink-dim)] hover:border-[var(--color-accent)]"
                  }`}>
                  W{w.n}
                </button>
              ))}
              {weeks.length > 0 && (
                <button onClick={() => { setWeeks([]); regenerate([], count); }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-line)] text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
                  clear
                </button>
              )}
            </div>
          </div>
          <NumberStepper label="How many" value={count} onChange={(n) => { setCount(n); regenerate(weeks, n); }} min={1} max={20} />
          <button onClick={() => regenerate()}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-[#06111f] font-semibold text-sm hover:brightness-110 transition">
            ↻ Generate new set
          </button>
          <button onClick={() => setShown(new Set(questions.map((_, i) => i)))}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-line)] text-sm hover:border-[var(--color-accent)] transition">
            Reveal all
          </button>
        </div>
        <div className="mt-4 text-xs text-[var(--color-ink-faint)]">
          Question types available: {GENERATORS.filter((g) => weeks.length === 0 || weeks.includes(g.week)).map((g) => g.label).join(" · ")}
        </div>
      </Panel>

      {questions.map((q, i) => (
        <Panel key={i}>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="w-7 h-7 rounded-lg bg-[#12253a] border border-[var(--color-accent)] text-[var(--color-accent)] grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
            <Chip tone="accent">Week {q.week}</Chip>
            <Chip>{q.topic}</Chip>
          </div>

          <p className="text-[16px] leading-relaxed">{q.prompt}</p>

          {!shown.has(i) ? (
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button onClick={() => reveal(i)}
                className="px-4 py-2 rounded-lg border border-[var(--color-line)] text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition">
                Show answer &amp; working
              </button>
              {q.hint && <span className="text-[13px] text-[var(--color-ink-faint)]">💡 {q.hint}</span>}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-[var(--color-hi)] bg-[rgba(74,222,128,0.06)] p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-hi)] mb-1.5">Answer</div>
                <div className="font-mono text-[15px] text-[var(--color-ink)] break-words">{q.answer}</div>
              </div>
              <div className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink-faint)] mb-2.5">Working</div>
                <ol className="space-y-1.5">
                  {q.working.map((w, j) => (
                    <li key={j} className="text-[13.5px] text-[var(--color-ink-dim)] font-mono leading-relaxed flex gap-2.5">
                      <span className="text-[var(--color-ink-faint)] shrink-0">{j + 1}.</span>
                      <span className="min-w-0 break-words">{w}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </Panel>
      ))}

      {questions.length === 0 && (
        <Panel><p className="text-[var(--color-ink-dim)]">No question types for that selection. Pick another week.</p></Panel>
      )}
    </div>
  );
}
