import Link from "next/link";
import { LESSONS, TOOLS, WEEKS } from "@/content/curriculum";

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="grid-paper -mx-4 sm:-mx-6 px-4 sm:px-6 pt-14 pb-12 border-b border-[var(--color-line)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[#0f1520] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-hi)]" />
            NTU SC1005 · weeks 1–6 · assumes you know nothing
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Digital logic, explained like<br />
            <span className="text-[var(--color-accent)]">you have never seen a circuit.</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--color-ink-dim)] max-w-2xl">
            Every bullet point on your <em>key concepts</em> sheet, turned into a short plain-English lesson
            plus a tool you can poke at until it clicks. No prior electronics. No hand-waving.
            Start at the top and work down.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/learn/what-is-digital"
              className="rounded-xl bg-[var(--color-accent)] text-[#06111f] px-5 py-3 font-semibold text-[15px] hover:brightness-110 transition">
              Start lesson 1 →
            </Link>
            <Link href="/tools"
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-3 font-semibold text-[15px] hover:border-[var(--color-accent)] transition">
              Jump to the {TOOLS.length} tools
            </Link>
            <Link href="/cheatsheet"
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-3 font-semibold text-[15px] hover:border-[var(--color-accent)] transition">
              Cheat sheet
            </Link>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
            {[
              [String(LESSONS.length), "lessons"],
              [String(TOOLS.length), "interactive tools"],
              ["6", "weeks covered"],
              [String(LESSONS.reduce((s, l) => s + l.concepts.length, 0)), "concepts"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-2xl font-bold font-mono text-[var(--color-accent)]">{n}</dt>
                <dd className="text-xs uppercase tracking-[0.12em] text-[var(--color-ink-faint)] mt-0.5">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ the path */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">The learning path</h2>
        <p className="text-[var(--color-ink-dim)] mt-1.5">
          In order. Each lesson only uses ideas from the ones above it.
        </p>

        <div className="mt-8 space-y-10">
          {WEEKS.map((w) => {
            const ls = LESSONS.filter((l) => l.week === w.n);
            return (
              <div key={w.n}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#12253a] border border-[var(--color-accent)] text-[var(--color-accent)]">
                    WEEK {w.n}
                  </span>
                  <h3 className="text-lg font-bold">{w.title}</h3>
                  <span className="text-sm text-[var(--color-ink-faint)] hidden sm:block">{w.blurb}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {ls.map((l) => (
                    <Link key={l.slug} href={`/learn/${l.slug}`}
                      className="panel p-4 hover:border-[var(--color-accent)] transition group block">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-[15px] leading-snug group-hover:text-[var(--color-accent)] transition">{l.title}</h4>
                        <span className="shrink-0 text-[11px] font-mono text-[var(--color-ink-faint)] mt-0.5">{l.minutes} min</span>
                      </div>
                      <p className="text-[13.5px] text-[var(--color-ink-dim)] mt-1.5 leading-relaxed">{l.hook}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {l.tools.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">
                            {TOOLS.find((x) => x.slug === t)?.name ?? t}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------- how to use */}
      <section className="mt-16 panel p-6 sm:p-8">
        <h2 className="text-xl font-bold">How to actually use this</h2>
        <div className="mt-5 grid sm:grid-cols-3 gap-6">
          {[
            { n: "1", t: "Read the lesson once, fast", d: "Don't take notes yet. Just let the vocabulary wash over you so the words stop being foreign." },
            { n: "2", t: "Open the tool and break it", d: "Change an input. Predict the output before you look. Being wrong here is how the rule gets installed." },
            { n: "3", t: "Do the practice questions", d: "Generated fresh each time with full worked solutions. If you can do 5 in a row, you know it." },
          ].map((s) => (
            <div key={s.n}>
              <div className="w-8 h-8 rounded-lg bg-[#12253a] border border-[var(--color-accent)] text-[var(--color-accent)] grid place-items-center font-bold text-sm">{s.n}</div>
              <h3 className="font-semibold mt-3">{s.t}</h3>
              <p className="text-sm text-[var(--color-ink-dim)] mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
