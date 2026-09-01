import Link from "next/link";
import { LESSONS, WEEKS, TOOLS } from "@/content/curriculum";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "All lessons" };

export default function LearnIndex() {
  return (
    <>
      <div className="pt-12 pb-8 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6 grid-paper">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Lessons</h1>
        <p className="mt-3 text-[var(--color-ink-dim)] max-w-2xl leading-relaxed">
          Fifteen lessons covering all six weeks. Each one maps directly onto a lecture from the key-concepts sheet,
          and lists the exact concepts it covers so you can tick them off.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {WEEKS.map((w) => (
          <section key={w.n}>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#12253a] border border-[var(--color-accent)] text-[var(--color-accent)]">WEEK {w.n}</span>
              <h2 className="text-lg font-bold">{w.title}</h2>
            </div>
            <p className="text-sm text-[var(--color-ink-faint)] mb-5">{w.blurb}</p>

            <div className="space-y-3">
              {LESSONS.filter((l) => l.week === w.n).map((l) => (
                <Link key={l.slug} href={`/learn/${l.slug}`} className="panel p-5 block hover:border-[var(--color-accent)] transition group">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">{l.source}</span>
                        <h3 className="font-bold text-[17px] group-hover:text-[var(--color-accent)] transition">{l.title}</h3>
                      </div>
                      <p className="text-[14px] text-[var(--color-ink-dim)] mt-1.5 leading-relaxed max-w-2xl">{l.hook}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--color-ink-faint)] shrink-0">{l.minutes} min</span>
                  </div>

                  <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                    {l.concepts.map((c) => (
                      <li key={c} className="text-[13px] text-[var(--color-ink-faint)] flex gap-2">
                        <span className="text-[var(--color-accent)] mt-0.5">·</span>{c}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {l.tools.map((t) => (
                      <span key={t} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">
                        {TOOLS.find((x) => x.slug === t)?.name ?? t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
