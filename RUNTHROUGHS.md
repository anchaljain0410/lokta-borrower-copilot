# RUNTHROUGHS.md — Priya, Ravi, Anita

For each borrower: what the app asked, the four outputs, and the resulting Negotiation Card. Numbers are exactly what the engine produces — reproduce them yourself with `npm run personas` (runs `scripts/dump-personas.ts` against `lib/engine/personas.ts`, the same answer sets used here). Full reasoning behind every threshold is in `RULES.md`.

---

## Priya — 29, salaried, Bengaluru

### What the app asked

**Must-tier** (11 questions, adapted for "salaried"): purpose → *wedding*; amount wanted → ₹8,00,000; loan type → *personal loan*; how you earn → *salaried*; income proof → *payslip*; net monthly income → ₹1,10,000; existing EMI total → ₹14,000; housing cost → ₹28,000; monthly expenses → ₹35,000; age → 29; credit score → 780.

At the checkpoint, Priya chose to answer more. Because she's salaried, the app skipped self-employed/informal-only questions (ITR income, income stability, collateral, "what will the loan earn") and asked: years at employer → 5; recent bounce → No; existing high-cost debt → No; emergency savings → 2 months; a lender's already-quoted rate → 14%. She skipped variable-income-share, card utilisation, co-applicant income, and upcoming large expense.

### Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Borrow less.** "What you can safely carry comes to about ₹3,40,000 — well below your ₹8,00,000 ask." |
| **O2 — Amount** | Lender may offer up to **₹16,50,000** (FOIR + a 15× income-multiple cap for her 750+ score). She can safely carry **₹3,40,000** — that's the number to use. The gap is real: her rent (₹28,000) + existing car EMI (₹14,000) already use ~38% of her income before any new loan. |
| **O3 — Fair rate** | **10.5% – 12.5%** nominal, **11.5% – 13.6%** all-in (APR). The 14% she was quoted is above fair — the card tells her to push back. |
| **O4 — EMI ceiling** | **₹7,500/month.** At that ceiling: 2 yrs → ₹15,500/mo, 3 yrs → ₹11,000/mo, 5 yrs → ₹7,000/mo. Stress case (rate +1.5pp, since salaried income is the stable side): ceiling would drop to about **₹3,25,000** in loan terms — she'd need to borrow less if rates moved before she signs. |

This is the case the brief specifically wants surfaced: a clean, well-paid, textbook-approvable borrower who would still be over-borrowing if she took the ₹8L a lender might wave through, because her actual cash-flow room doesn't support it once rent is honestly counted.

**Try it with only the must-tier answers, skipping the checkpoint's optional questions entirely**, and the verdict gets stricter still — "don't borrow," not "borrow less." That's not a glitch: with no evidence of job stability or a savings buffer, the safe-carry ceiling defaults to its more protective bucket (RULES.md §3.1.1), the same "absence of evidence is itself the risk" logic already used for the savings buffer. Answering those two optional questions is what unlocks the looser, still-conservative "borrow less" read above.

### Negotiation Card

> **Verdict:** Borrow less than you asked — carry ~₹3,40,000, not ₹8,00,000.
> **Ask for:** ₹3,40,000 · **Max EMI:** ₹7,500/mo
> **Fair for your profile:** 10.5% – 12.5% (APR 11.5% – 13.6%)
> **Lender quoted 14%** — above fair. I'd like it revised.

---

## Ravi — 42, self-employed (kirana), Mysuru

### What the app asked

**Must-tier**, adapted for "self-employed": purpose → *business expansion*; amount → ₹15,00,000; loan type hint → *business loan*; how you earn → *self-employed*; income proof → *ITR*; net monthly income → ₹60,000 (midpoint of his stated ₹40k–80k cash range); existing EMI → ₹0; housing cost → ₹0 (owns premises); monthly expenses → ₹30,000; age → 42; credit score → **don't know**.

Additional, branch-specific: years in business → 14; ITR annual income → ₹4,20,000 (triggers the cash-vs-ITR blend, §1.3 in RULES.md); collateral → *property, ₹45,00,000, documented*; co-applicant income → ₹18,000 (wife's teaching income); recent bounce → No. The app never asked about card utilisation or variable income share — those are salaried-only questions that don't apply to him.

### Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Borrow.** His ₹15,00,000 ask fits comfortably within what he can safely carry. |
| **O2 — Amount** | Routed to **loan against property** the moment his collateral (₹45L) was declared at more than 2× his ask — the app doesn't wait for him to ask for LAP. Lender-side up to **₹25,55,000** (LTV-capped), safe-carry **₹19,85,000**. Either way, his ₹15L ask is well inside both. |
| **O3 — Fair rate** | **10.5% – 12.0%** nominal, **10.7% – 12.2%** all-in — secured LAP pricing, not the 18-30% he'd have faced as an unsecured business loan with no credit score. His unknown score was treated as **moderate** (not worst-case) since he has no red flags — just no formal borrowing history. |
| **O4 — EMI ceiling** | **₹22,500/month.** Tenure options run out to 5 years shown (2 yrs → ₹92,500/mo, 3 yrs → ₹65,000/mo, 5 yrs → ₹43,000/mo — LAP allows up to 15 years, so a longer real-world tenure would lower this further). Stress case (income −20%, the realistic shock for self-employed): he'd need to scale back to about **₹17,00,000** in loan terms to stay safe — worth knowing before he commits to the full amount. |

This is the case the brief specifically flags: is Ravi routed to a secured product? Yes — automatically, and the app tells him why, rather than pricing him as a thin-file business borrower at 3-4× the interest rate he actually qualifies for.

### Negotiation Card

> **Verdict:** You can borrow.
> **Ask for:** ₹19,85,000 (comfortably covers your ₹15,00,000 need) · **Max EMI:** ₹22,500/mo
> **Fair for your profile:** 10.5% – 12.0% (APR 10.7% – 12.2%) — loan against property
> *(No lender quote entered yet — bring this card as your opening reference.)*

---

## Anita — 35, informal income, Hubballi

### What the app asked

**Must-tier**, adapted for "informal": purpose → *buying a vehicle*; amount → ₹1,50,000; loan type → *vehicle loan*; how you earn → *informal*; income proof → *none*; net monthly income → ₹28,000 (midpoint of her stated range); existing EMI → ₹3,500 (her running app-loan EMI); housing cost → ₹0; monthly expenses → ₹22,000; age → 35; credit score → **don't know**.

Additional, informal-branch questions: income stability → *highly variable*; recent bounce → **Yes**; existing high-cost debt → **Yes, ₹3,500/month at 30%**; vehicle price → ₹1,50,000 (so the scooter itself is priced as partial collateral); emergency savings → 0 months; what the loan would earn → ₹8,000/month extra from more delivery runs. The app skipped ITR/collateral questions — she has neither.

### Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Don't borrow right now.** "You're already carrying high-cost debt (above 24% APR) with a recent missed payment." → **Alternative offered:** "Consolidating that existing debt is likely to help more than taking on a new loan right now." This fires regardless of whether she could technically afford the scooter loan — an active bounce plus existing 30% debt is a hard stop in the rules (§8, rule 2). |
| **O2 — Amount** | Lender-side just **₹65,000** — *lower* than her safe-carry figure of ₹1,20,000. This is the access-vs-affordability nuance from RULES.md §2.5: with no income proof at all, the lender's income-multiple cap (3×) is what's actually constraining her, not her ability to repay. The card is honest about which one binds. |
| **O3 — Fair rate** | **16.0% – 22.0%** nominal, **17.1% – 23.2%** all-in — vehicle-loan pricing for no-bureau/informal income. Still meaningfully cheaper than her existing 30% app loan, which is exactly why consolidation, not a new loan, is the alternative offered. |
| **O4 — EMI ceiling** | **₹3,000/month.** Even the stress case (income −20%) *holds* at this ceiling — the number is already conservative enough to survive a shock. That's cold comfort given the verdict is "don't borrow," but it shows the ceiling logic runs independently of the verdict gate. |

This is the case the brief specifically wants reachable: "don't borrow" as a legitimate, actionable answer — not a dead end, but a redirect toward fixing the debt she already has.

### Negotiation Card

> **Verdict:** Don't borrow right now.
> *You're already carrying high-cost debt (above 24% APR) with a recent missed payment.*
> → Consolidating that existing debt is likely to help more than taking on a new loan right now.
> **If proceeding anyway — ceiling:** ₹65,000 · **Max EMI:** ₹3,000/mo
> **Fair for your profile:** 16.0% – 22.0% (APR 17.1% – 23.2%) — still far below your current 30% app loan.
