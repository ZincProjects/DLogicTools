"use client";
import { TOOL_COMPONENTS } from "@/components/tools/registry";

export default function ToolHost({ slug }: { slug: string }) {
  const C = TOOL_COMPONENTS[slug];
  if (!C) return <div className="text-[var(--color-ink-faint)]">This tool isn’t wired up yet.</div>;
  return <C />;
}
