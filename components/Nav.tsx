"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Lessons" },
  { href: "/tools", label: "Tools" },
  { href: "/practice", label: "Practice" },
  { href: "/cheatsheet", label: "Cheat sheet" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(11,14,20,0.82)] border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="#12253a" stroke="#60a5fa" strokeWidth="1.5" />
            <path d="M9 11 h6 a5 5 0 0 1 0 10 h-6 z" fill="none" stroke="#60a5fa" strokeWidth="2" />
            <line x1="4" y1="13" x2="9" y2="13" stroke="#4ade80" strokeWidth="2" />
            <line x1="4" y1="19" x2="9" y2="19" stroke="#4ade80" strokeWidth="2" />
            <line x1="21" y1="16" x2="27" y2="16" stroke="#4ade80" strokeWidth="2" />
          </svg>
          <span className="font-bold tracking-tight text-[15px] group-hover:text-[var(--color-accent)] transition">
            SC1005<span className="text-[var(--color-ink-faint)] font-medium"> Digital Logic</span>
          </span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                active(l.href) ? "bg-[#1b2534] text-[var(--color-ink)]" : "text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] hover:bg-[#161d29]"
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => setOpen(!open)} className="ml-auto md:hidden w-9 h-9 grid place-items-center rounded-lg border border-[var(--color-line)]" aria-label="Menu">
          <div className="space-y-1">
            <span className="block w-4 h-0.5 bg-[var(--color-ink-dim)]" />
            <span className="block w-4 h-0.5 bg-[var(--color-ink-dim)]" />
            <span className="block w-4 h-0.5 bg-[var(--color-ink-dim)]" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[var(--color-line)] px-4 py-2 flex flex-col bg-[var(--color-panel)]">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm ${active(l.href) ? "text-[var(--color-accent)]" : "text-[var(--color-ink-dim)]"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
