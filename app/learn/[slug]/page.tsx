import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS, TOOLS, lessonBySlug } from "@/content/curriculum";
import LessonHost from "./LessonHost";
import type { Metadata } from "next";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = lessonBySlug(slug);
  return l ? { title: l.title, description: l.hook } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();

  const idx = LESSONS.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

  return (
    <>
      <div className="pt-10 pb-7 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <Link href="/learn" className="text-[var(--color-ink-faint)] hover:text-[var(--color-accent)]">← all lessons</Link>
          <span className="text-[var(--color-ink-faint)]">/</span>
          <span className="font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">Week {lesson.week}</span>
          <span className="font-mono px-1.5 py-0.5 rounded border border-[var(--color-line)] text-[var(--color-ink-faint)]">{lesson.source}</span>
          <span className="text-[var(--color-ink-faint)] font-mono">{lesson.minutes} min read</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 leading-tight">{lesson.title}</h1>
        <p className="mt-3 text-[17px] text-[var(--color-ink-dim)] max-w-2xl leading-relaxed">{lesson.hook}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-10 mt-8">
        <article className="lesson min-w-0 max-w-3xl">
          <LessonHost slug={slug} />

          <div className="mt-14 panel p-5">
            <h3 className="font-bold text-base mb-3 mt-0">Concepts this lesson covers</h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-0">
              {lesson.concepts.map((c) => (
                <li key={c} className="text-[13.5px] text-[var(--color-ink-dim)] flex gap-2 list-none">
                  <span className="text-[var(--color-hi)] shrink-0">✓</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)] mb-2.5">Tools for this lesson</div>
              <div className="space-y-1.5">
                {lesson.tools.map((t) => {
                  const tool = TOOLS.find((x) => x.slug === t);
                  if (!tool) return null;
                  return (
                    <Link key={t} href={`/tools/${t}`} className="flex items-center gap-2.5 rounded-lg border border-[var(--color-line)] bg-[#0f1520] p-2.5 hover:border-[var(--color-accent)] transition group">
                      <span className="text-[var(--color-accent)] text-sm shrink-0">{tool.icon}</span>
                      <span className="text-[12.5px] font-medium group-hover:text-[var(--color-accent)] transition leading-tight">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)] mb-2.5">Test yourself</div>
              <Link href={`/practice?week=${lesson.week}`} className="block rounded-lg border border-[var(--color-line)] bg-[#0f1520] p-3 hover:border-[var(--color-accent)] transition text-[12.5px]">
                Week {lesson.week} practice questions →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <nav className="mt-14 grid sm:grid-cols-2 gap-3 border-t border-[var(--color-line)] pt-6">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="panel p-4 hover:border-[var(--color-accent)] transition">
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-ink-faint)]">← Previous</div>
            <div className="font-semibold mt-1 text-[15px]">{prev.title}</div>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/learn/${next.slug}`} className="panel p-4 hover:border-[var(--color-accent)] transition sm:text-right">
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-ink-faint)]">Next →</div>
            <div className="font-semibold mt-1 text-[15px]">{next.title}</div>
          </Link>
        )}
      </nav>
    </>
  );
}
