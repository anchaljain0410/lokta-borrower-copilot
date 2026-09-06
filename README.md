# Borrower Copilot

A self-assessment for Indian borrowers, built for Lokta's build challenge. Answers four questions before a lender does: should you borrow, how much (lender-likely vs. safe-to-carry), what rate is fair, and what EMI to agree to — then hands over a one-page Negotiation Card.

No login, no bureau pull, no backend, nothing persisted. Everything runs client-side from what the borrower types in.

## Run it (under 2 minutes)

Requires Node 18+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Other commands

```bash
npm test        # unit tests — the rules engine checked against Priya, Ravi and Anita
npm run personas  # prints the full evaluate() output for all three personas as JSON
npm run build    # production build
npm run lint     # ESLint
```

## What to read, in order

1. **This README** — running it.
2. **[RULES.md](./RULES.md)** — every threshold, band, and formula behind the four outputs, with a reason for each. Read this before the code; the code is just RULES.md executed.
3. **[RUNTHROUGHS.md](./RUNTHROUGHS.md)** — Priya, Ravi, and Anita run through the actual app, with the questions each was asked and the outputs each got.
4. **[WALKTHROUGH.md](./WALKTHROUGH.md)** — a five-minute written walkthrough: what this is, what I'd build next, what I'd cut.

## How it's organized

```
lib/
  types.ts          Domain types shared by every rule and the UI
  rules/             Pure functions, no UI imports — each one maps to a section of RULES.md
  questions/         The question bank (schema.ts) and adaptive sequencing (flow.ts)
  engine/
    evaluate.ts       Orchestrates the rules into the four outputs
    personas.ts       Priya / Ravi / Anita as answer sets
    evaluate.test.ts  Runs the engine against all three personas
components/          UI only — reads from lib/, contains no domain logic
app/page.tsx         The four-phase flow: intro → questions → checkpoint → results/card
scripts/dump-personas.ts   Prints evaluate() output for all three personas (npm run personas)
```

The split is deliberate: every number the app shows can be traced to a named function in `lib/rules/`, and every one of those functions is tested against real borrower profiles, not just unit-level edge cases.
