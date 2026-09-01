import { Suspense } from "react";
import PracticeClient from "./PracticeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice",
  description: "Randomly generated SC1005 practice questions with full worked solutions.",
};

export default function PracticePage() {
  return (
    <>
      <div className="pt-12 pb-8 border-b border-[var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6 grid-paper">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Practice</h1>
        <p className="mt-3 text-[var(--color-ink-dim)] max-w-2xl leading-relaxed">
          Fresh questions every time you press generate, with the full working revealed after you have had a go.
          Do them <strong className="text-[var(--color-ink)]">on paper first</strong> — reading a solution feels like
          learning and isn’t.
        </p>
      </div>
      <Suspense fallback={<div className="mt-8 text-[var(--color-ink-faint)]">Loading…</div>}>
        <PracticeClient />
      </Suspense>
    </>
  );
}
