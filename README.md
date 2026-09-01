# SC1005 Digital Logic — Learn It From Zero

An interactive study site covering **every concept on the NTU SC1005 "key concepts (week 1–6)" sheet**,
written for someone with no prior electronics background.

- **15 lessons** — one per lecture (1_Introduction, 2a/2b, L1–L12), in plain English
- **28 interactive tools** — every one shows its working, not just an answer
- **Practice** — randomly generated questions with full worked solutions
- **Cheat sheet** — every formula and rule from the six weeks on one printable page

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4. Entirely static — no backend, no database.

## Layout

```
app/            routes: /, /learn, /learn/[slug], /tools, /tools/[slug], /practice, /cheatsheet
components/     UI primitives, SVG gate symbols
components/tools/   the 28 tools, grouped by topic
content/        curriculum metadata + lesson bodies (lessons-a, lessons-b)
lib/boolean.ts  Boolean expression tokeniser / parser / evaluator
lib/kmap.ts     Quine-McCluskey minimiser + K-map geometry
lib/numbers.ts  base conversion, signed representations, codes, IEEE-754
lib/practice.ts question generators
scripts/        self-tests for the maths
```

## Develop

```bash
npm install
npm run dev
```

## Verify the maths

```bash
npx tsx scripts/selftest.ts       # parser, minimiser, number conversions (incl. 400 randomised functions)
npx tsx scripts/practicetest.ts   # 3400 generated questions, checked for malformed output
```

## Deploy

```bash
vercel --prod
```
