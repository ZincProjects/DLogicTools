import Link from "next/link";
import { TOOLS, LESSONS } from "@/content/curriculum";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "All tools" };

const GROUPS = ["Numbers", "Logic", "Arithmetic", "Simplification", "Hardware"] as const;

export default function ToolsIndex() {
  return (
    <>
      <div className="pt-12 pb-8 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6 grid-paper">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The toolbox</h1>
        <p className="mt-3 text-[var(--color-ink-dim)] max-w-2xl leading-relaxed">
          {TOOLS.length} interactive tools, one for every skill on the key-concepts sheet. Every one is a calculator
          <em> and</em> an explanation — they show the working, not just the answer, so you can copy the method into
          an exam where you have no computer.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {GROUPS.map((g) => {
          const list = TOOLS.filter((t) => t.group === g);
          return (
            <section key={g}>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-lg font-bold">{g}</h2>
                <span className="text-xs text-[var(--color-ink-faint)]">{list.length} tools</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((t) => (
                  <Link key={t.slug} href={`/tools/${t.slug}`} className="panel p-4 hover:border-[var(--color-accent)] transition group">
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-lg bg-[#12253a] border border-[var(--color-line)] grid place-items-center text-[var(--color-accent)] text-lg">{t.icon}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[15px] group-hover:text-[var(--color-accent)] transition leading-snug">{t.name}</h3>
                        <p className="text-[13px] text-[var(--color-ink-dim)] mt-1 leading-relaxed">{t.blurb}</p>
                        <span className="inline-block mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">week {t.week}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
