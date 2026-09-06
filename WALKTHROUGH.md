# Walkthrough (~5 minutes)

Written version — read as-is, or use it as a script if recording. Rough timing in brackets.

## What this is [30s]

Borrower Copilot is a self-assessment a borrower fills out before walking into a lender. It's not a credit model — there's no bureau pull, no ML, nothing saved. It's the reasoning a good loan officer would apply, made visible and runnable by the borrower themselves, ending in a one-page Negotiation Card they can hold up in a branch.

## A tour, through Priya [90s]

She opens the app, hits "Get started," and answers eleven must-tier questions: purpose, amount, loan type, how she earns, income proof, income, existing EMIs, rent, expenses, age, credit score. That's enough to produce all four outputs — just with wide ranges and low confidence, which the app says outright.

At the checkpoint, she can stop there or answer optional questions. Every optional question is tagged in code (`lib/questions/schema.ts`, the `tightens` field) with which specific output it moves — if a question can't name one, it isn't in the app. Because she's salaried, she never sees self-employed-only questions like ITR income or collateral; the question set adapts to the branch, not just to prior answers.

Her result is the case I most wanted to nail: a 780-score, 5-year-tenure, textbook-approvable borrower who a lender might sanction ₹16.5L for — but who can safely carry only about ₹3.4L once her rent and existing car EMI are honestly counted. The app tells her which number to actually use, and why they diverge. She was quoted 14% by a lender; the card tells her fair is 10.5–12.5% and to push back.

## Ravi and Anita — the two rules I care most about [90s]

Ravi owns his shop premises outright. The moment he mentions that collateral, the app silently reroutes him from "business loan" to "loan against property" — before pricing, not after — because LAP at 10.5–12% is roughly half what an unsecured business loan would cost a self-employed applicant with no bureau score. His unknown credit score is treated as *moderate*, not worst-case, since he has no bounce or high-cost debt — no history isn't bad history.

Anita is the harder case. She has an active bounce and an existing 30%-APR app loan. The verdict engine has a four-branch decision tree, evaluated in a fixed order, and her profile trips branch two regardless of whether she could technically service a new EMI: **don't borrow**, with one concrete alternative — consolidate the debt she already has. I built this specifically so "don't borrow" is a real, reachable answer, not a token option nobody hits.

One thing that only showed up once I ran her numbers: her lender-approved amount is actually *lower* than what she could safely repay, because a no-income-proof applicant gets capped hard on the lender side. The copy checks which side actually binds before writing the sentence — a hardcoded "the safe number is always the tight one" assumption would have told her the wrong story.

## How it's built [60s]

`lib/rules/` is pure TypeScript, no UI imports — FOIR, income multiples, rate bands, APR, the verdict tree, confidence widening, each in its own file, each mapped to a numbered section of `RULES.md`. `lib/engine/evaluate.ts` is the only place they're combined. A test suite (`lib/engine/evaluate.test.ts`) runs Priya, Ravi, and Anita through the real engine on every change — it's how I caught both the binding-side bug above and an earlier one where an over-strict safe-ceiling gave Priya a "don't borrow" verdict no loan officer would issue. Both are documented in `RULES.md §11.0` rather than quietly fixed and forgotten.

## What I'd build next

- **Multiple simultaneous debts modeled individually**, not just summed — right now two informal loans at different rates get flattened into one high-cost flag.
- **A real "why this number" trace UI** — the reasoning already exists as data (every question tags what it tightens); it's not yet surfaced as an expandable "why" under each output.
- **Joint-applicant-aware FOIR** — co-applicant income currently just adds to capacity; a fuller model would give joint applications their own ceiling logic.
- **Regional language support** — the personas here are English-literate; a large share of the intended audience (Anita's profile especially) may not be.

## What I'd cut if I had less time

- The tenure/EMI trade-off table (§9) — useful, but the ceiling number alone carries most of the value.
- The Negotiation Card's print styling — nice for a real branch visit, not load-bearing for the assessment logic itself.
- Collateral and existing-loan detail as single-entry forms rather than repeatable lists — fine for these three personas, would need generalizing for someone with three different debts.

What I would **not** cut: the persona test suite. It's what turned two real bugs from "found by a reviewer" into "found and fixed before submission."
