import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TOOLS, LESSONS, toolBySlug } from "@/content/curriculum";
import ToolHost from "./ToolHost";
import type { Metadata } from "next";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(slug);
  return t ? { title: t.name, description: t.blurb } : {};
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();

  const related = LESSONS.filter((l) => l.tools.includes(slug));
  const idx = TOOLS.findIndex((t) => t.slug === slug);

  return (
    <>
      <div className="pt-10 pb-6 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6">
        <Link href="/tools" className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-accent)]">← all tools</Link>
        <div className="flex items-start gap-4 mt-3">
          <span className="w-12 h-12 shrink-0 rounded-xl bg-[#12253a] border border-[var(--color-line)] grid place-items-center text-[var(--color-accent)] text-2xl">{tool.icon}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{tool.name}</h1>
            <p className="text-[var(--color-ink-dim)] mt-1.5 max-w-2xl">{tool.blurb}</p>
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[var(--color-ink-faint)] text-xs uppercase tracking-widest">Read first:</span>
            {related.map((l) => (
              <Link key={l.slug} href={`/learn/${l.slug}`} className="text-[var(--color-accent)] underline underline-offset-4 text-[13px]">{l.title}</Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="text-[var(--color-ink-faint)]">Loading…</div>}>
          <ToolHost slug={slug} />
        </Suspense>
      </div>

      <nav className="mt-12 flex justify-between gap-4 border-t border-[var(--color-line)] pt-6">
        {idx > 0 ? (
          <Link href={`/tools/${TOOLS[idx - 1].slug}`} className="text-sm text-[var(--color-ink-dim)] hover:text-[var(--color-accent)]">
            ← {TOOLS[idx - 1].name}
          </Link>
        ) : <span />}
        {idx < TOOLS.length - 1 && (
          <Link href={`/tools/${TOOLS[idx + 1].slug}`} className="text-sm text-[var(--color-ink-dim)] hover:text-[var(--color-accent)] text-right">
            {TOOLS[idx + 1].name} →
          </Link>
        )}
      </nav>
    </>
  );
}
