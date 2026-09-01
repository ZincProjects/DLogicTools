import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: { default: "SC1005 Digital Logic — Learn It From Zero", template: "%s · SC1005 Digital Logic" },
  description:
    "Every concept from weeks 1–6 of SC1005 Digital Logic, explained in plain English, with 28 interactive tools: base converter, truth tables, K-map solver, adders, CMOS lab, noise margin and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">{children}</main>
        <footer className="border-t border-[var(--color-line)] mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-[var(--color-ink-faint)] flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>Built for NTU SC1005 Digital Logic · weeks 1–6 key concepts.</span>
            <span>Study aid only — always check against your lecture notes.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
