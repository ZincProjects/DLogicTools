"use client";
import Link from "next/link";
import { toolBySlug } from "@/content/curriculum";

/**
 * Inline or block link from a lesson into the tool that practises the idea.
 * Block form (default) is a full-width card; `inline` form sits inside a sentence.
 */
export default function ToolLink({ slug, children, inline }: { slug: string; children?: React.ReactNode; inline?: boolean }) {
  const t = toolBySlug(slug);
  if (!t) return <>{children}</>;

  if (inline) {
    return (
      <Link href={`/tools/${slug}`} className="text-[var(--color-accent)] underline underline-offset-4">
        {children ?? t.name}
      </Link>
    );
  }

  return (
    <Link href={`/tools/${slug}`}
      className="not-prose my-5 flex items-center gap-3.5 rounded-xl border border-[var(--color-line)] bg-[#0f1520] p-3.5 hover:border-[var(--color-accent)] transition group no-underline">
      <span className="w-10 h-10 shrink-0 rounded-lg bg-[#12253a] border border-[var(--color-line)] grid place-items-center text-[var(--color-accent)] text-lg">{t.icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">Open the tool</span>
        <span className="block font-semibold text-[15px] text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition leading-snug">
          {children ?? t.blurb}
        </span>
      </span>
      <span className="ml-auto text-[var(--color-ink-faint)] group-hover:text-[var(--color-accent)] transition shrink-0">→</span>
    </Link>
  );
}
