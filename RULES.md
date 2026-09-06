# RULES.md — Borrower Copilot

Every threshold, band, formula and assumption behind the four outputs, in one place. Format per row: **what · value · why · source or "my judgement."**

This is not a credit model. There is no bureau data and no outcomes dataset to validate against — precision here means *internally consistent, directionally realistic, and fully traceable*, not statistically accurate. Where a number is our own call rather than a documented industry norm, it says "my judgement" honestly, per the brief's explicit allowance.

---

## 0. Philosophy (the three calls everything below follows from)

| # | Decision | What it means in practice |
|---|---|---|
| 1 | **Judgment-first, not research-anchored** | Bands and ceilings are realistic ballparks grounded in general Indian lending norms (FOIR practice, common personal-loan pricing tiers, RBI's mandate that digital lenders disclose all-in APR via a Key Fact Statement). None are pulled from one specific lender's current live rate card — that would be false precision for a self-assessment tool. |
| 2 | **Safe-carry is protective, not lender-aligned** | The borrower's number is deliberately stricter than what a lender would approve — it counts rent/housing cost and a savings-buffer penalty that most lenders' FOIR math ignores. The gap between "lender will give you" and "you should take" is treated as a feature, not noise. |
| 3 | **A negative verdict gets one alternative, not a lecture** | When the answer is "don't borrow," the app names one concrete next step in a single sentence. It does not become a debt-restructuring planner. |

---

## 1. Inputs

### 1.1 Must-tier (mandatory — the app cannot produce an output without these)

| Field | Why mandatory |
|---|---|
| Purpose of loan | Drives product routing and whether the loan is "productive" (business/asset-generating income) vs consumption. |
| Amount wanted | The number every output is compared against. |
| Loan type / product hint | Borrower's own framing; may be overridden by product routing (§4). |
| Employment type (salaried / self-employed-formal / self-employed-informal / gig-informal) | Selects which FOIR ceiling, rate table, and question branch apply. Nothing downstream works without this. |
| Net monthly income | Both O2 numbers are directly derived from this. |
| Existing EMI obligations (total) | Directly subtracted from capacity in both FOIR calculations. |
| Monthly housing cost (rent, or "own, no EMI") | Feeds the protective safe-carry ceiling (§3), which a standard bank FOIR usually excludes. |
| Household/monthly expenses | Sanity-checks that income minus obligations minus expenses isn't already negative — a second, independent trigger for "don't borrow." |
| Age | Caps maximum tenure (loan must end by 60 for salaried / 65 for self-employed — standard lender practice) which affects the EMI/tenure trade-off. |
| Credit score | Is a must-question, but **"I don't know" is a first-class valid answer**, not a blocker. See §6.4. |

*Decision made explicitly with the client: rather than build a separate "infer the credit score from other signals" model, load-bearing fields are simply mandatory. Credit score is asked, but non-response ("don't know") is handled by widening (§7), never by imputing a value.*

### 1.2 Additional-tier (each one must tighten a specific output — enforced in code via a `tightens: Output[]` tag on every question)

| Field | Branch | Tightens |
|---|---|---|
| Years at current employer / in business | Salaried, self-employed | O1 (stability signal for verdict), O3 (rate tier) |
| Variable income share (bonus/commission %) | Salaried | O2 (only base counted toward capacity), confidence |
| Income stability / week-to-week variance | Informal, gig | O2 (haircut on declared income), O4 (which stress scenario applies) |
| ITR-declared income vs actual cash income | Self-employed | O2 (which figure to trust, and by how much), confidence |
| Detail of existing loans (rate, tenure, lender type) | All | O1 (high-cost debt trigger), O3 (comparison baseline) |
| Credit card utilisation % | Salaried, self-employed-formal | O3 (rate tier nudge) |
| Past bounces (EMI/cheque, last 6 months) | All | O1 (hard trigger), O3 (rate tier) |
| Emergency savings (months of expenses held) | All | O2 (safe-carry buffer penalty, §3.2) |
| Collateral available + documented value | Self-employed, informal | O1 and O2 (product routing to secured, §4), O3 (secured rate band) |
| Co-applicant income | All | O2 (combined capacity), O4 |
| Upcoming large known expense | All | O4 (near-term stress case) |
| What the loan will earn (for productive/business use) | Self-employed, informal | O1 (productive loans get more benefit of the doubt in the borderline "borrow less" band) |
| Offers already received (rate quoted) | All | Populates the Negotiation Card comparison directly |

Any question not in this table was cut during design because it didn't move a number.

---

## 2. Lender-likely-sanction (O2, lender side)

### 2.1 FOIR ceiling (caps total EMI, including the new loan, as % of net income)

| Employment type | FOIR ceiling | Source / why |
|---|---|---|
| Salaried, formal | 50% | Common upper bound used across Indian retail lenders for salaried personal loans (typical published range is 40–50%). |
| Self-employed, ITR/formal proof | 45% | Slightly stricter — income verified but less stable than a payslip. My judgement, consistent with typical self-employed underwriting being ~5pts tighter than salaried. |
| Self-employed / informal, bank-statement only | 40% | Further step down — income pattern inferable but not tax-verified. My judgement. |
| Informal / cash income, no formal proof | 35% | Most conservative formal-lending tier; below this, most lenders decline unsecured entirely and this is where product routing (§4) kicks in. My judgement. |

### 2.2 Income-multiple cap (a second, independent ceiling — the binding one is whichever is *lower*)

| Employment type × credit tier | Multiple of net monthly income | Source / why |
|---|---|---|
| Salaried, score 750+ | 15× | Reflects that prime salaried personal-loan offers commonly reach 12–24× monthly salary. My judgement, mid-range. |
| Salaried, score 650–749 | 10× | Standard mid-tier. |
| Salaried, score <650 or a hard red flag (recent bounce) | 6× | Conservative; reflects real credit tightening at this tier. |
| Salaried, score unknown, no red flags | 8× | Treated as moderate, not worst-case — see §6.4. |
| Self-employed, ITR/formal | 6× | Self-employed multiples run lower industry-wide due to income verification difficulty. |
| Self-employed / informal, no ITR | 3× | Heavily discounted; unsecured lending to this segment is genuinely scarce, and this cap reflects that rather than inventing false availability. |

### 2.3 Secured-product cap (LAP / gold) — used instead of §2.2 when product routing (§4) selects a secured product

| Collateral type | LTV cap | Why |
|---|---|---|
| Property (LAP), income formally documented | 60% of documented value | Below standard housing-loan LTVs (75–90%) since LAP serves working-capital/business use, higher risk than a home purchase. My judgement. |
| Property (LAP), income informal/undocumented | 50% of documented value | Extra 10pt haircut for income uncertainty. |
| Gold | 75% of assessed value | Aligned with RBI's LTV ceiling for gold loans. |

### 2.4 Lender-max formula

```
lender_max_EMI  = FOIR_ceiling × net_income − existing_EMI_total
lender_max_principal (unsecured) = min(
    EMI_to_principal(lender_max_EMI, assumed_rate_midpoint, assumed_tenure),
    income_multiple_cap × net_income
)
lender_max_principal (secured) = min(
    EMI_to_principal(lender_max_EMI, assumed_rate_midpoint, assumed_tenure),
    LTV_cap × collateral_value
)
```
`EMI_to_principal` is the standard reducing-balance annuity formula solved for principal — exact math, not a judgement call: `P = EMI × [(1+r)ⁿ−1] / [r(1+r)ⁿ]`, r = monthly rate, n = tenure months.

### 2.5 A note on which side actually binds

`recommended = min(lender_max, safe_max)` is usually `safe_max` (the protective number is the tighter one) — but not always. For a borrower with no income proof at all (§2.2's 3× multiple), the lender's own policy cap can land *below* what the borrower could genuinely service. In that case the honest story flips: the constraint isn't affordability, it's access — the borrower is being kept out by thin credit history, not by risk of over-borrowing. The app's copy checks which side actually bound before writing the sentence, rather than assuming the safe-side always does. This surfaced during testing on Anita's profile (§11) and is exactly the kind of case a hard-coded assumption would have gotten backwards.

---

## 3. Borrower-safe-carry (O2, borrower side — the protective number)

### 3.1 Safe ceiling (% of net income, *including* housing cost — this is the deliberate difference from §2.1)

The percentage itself is set close to the equivalent §2.1 lender ceiling — the "protective" effect does not come from an arbitrarily lower base rate. It comes from (a) housing cost now sitting inside the ceiling, where a bank's FOIR usually ignores it, and (b) the savings-buffer penalty in §3.2. Stacking a much-lower percentage *on top of* a broader base double-penalizes and produced unrealistic "don't borrow" results for ordinary salaried profiles during testing (see §11) — corrected once the persona test suite (`lib/engine/evaluate.test.ts`) caught it.

| Employment type / stability | Safe ceiling | Why |
|---|---|---|
| Salaried, ≥2 yrs current employer | 50% | Same figure as the lender ceiling (§2.1) — the protection comes from now including rent/housing in the base, not from a lower rate. |
| Salaried, <2 yrs, or self-employed formal | 45% | Small extra margin for income/tenure uncertainty. |
| Self-employed informal / gig | 40% | Widest margin — income volatility is highest here. |

### 3.1.1 Unanswered tenure defaults to the stricter bucket — on purpose

If "years at current employer/business" is left unanswered (must-tier-only path), `safeCeilingPct` uses the `<2 years` bucket, not the more generous `≥2 years` one. This looks, at first glance, like it contradicts §6.4's "unknown is never treated as worst-case" rule — it doesn't, and the distinction matters:

- §6.4's credit-score rule governs the **lender-access side** (income multiple, rate tier). Defaulting an unknown score to worst-case would unfairly restrict *access* for a thin-file borrower who has done nothing wrong.
- Tenure and the savings buffer (§3.2) govern the **protective safe-carry side**. Here, an unanswered stability signal isn't scored against the borrower's access — it just means the protective ceiling can't yet be loosened on the strength of evidence that hasn't been given. Defaulting to the stricter bucket is the same "absence of evidence of safety is itself the risk being protected against" logic already used for the savings buffer.

Practically: a borrower who answers only the must-tier questions can see a stricter verdict (even "don't borrow") than the same borrower who goes on to answer the optional stability/buffer questions — this is the intended shape of "confidence widens with silence," not a bug. See Priya in RUNTHROUGHS.md, who answers the optional tenure and savings questions and gets a materially looser result than a must-tier-only run of the same profile would produce.

### 3.2 Savings-buffer penalty

| Emergency savings held | Adjustment | Why |
|---|---|---|
| ≥3 months of expenses | none | Borrower has a shock absorber; no further penalty. |
| 1–2 months | −5 points off the safe ceiling % | Thin but present buffer. |
| <1 month / none / unknown | −10 points off the safe ceiling % | No shock absorber — treated as the risk it is. Unknown is treated the same as "none" here specifically because this is a case where the *absence of evidence of a buffer* is itself the risk being protected against (unlike credit score, this isn't a scored risk factor being imputed — it's a direct subtraction of an assumed safety margin). |

### 3.3 Safe-max formula

```
safe_EMI_ceiling = (safe_ceiling% − savings_penalty) × net_income
                    − existing_EMI_total − monthly_housing_cost
safe_max_principal = EMI_to_principal(safe_EMI_ceiling, fair_rate_midpoint (§5), assumed_tenure)
```
If `safe_EMI_ceiling ≤ 0`, this is the primary trigger for verdict = **Don't borrow** (§8).

**The output the borrower is told to actually use is `min(lender_max_principal, safe_max_principal)` — in practice almost always `safe_max_principal`.** The app states this explicitly rather than leaving the borrower to guess which number matters.

---

## 4. Product routing

| Condition | Routed product | Why |
|---|---|---|
| Usable collateral declared, value ≥ ~2× requested amount, and formal or semi-formal income | LAP (loan against property) | Secured pricing (§5) is roughly half of unsecured business-loan pricing for the same borrower; not offering it when collateral exists is a real disservice. This is the rule that routes Ravi to LAP instead of an unsecured business loan. |
| Gold available, no property, informal income | Gold loan | Fastest, cheapest secured option available to a purely informal-income borrower. |
| Loan is for a vehicle and amount ≤ vehicle's on-road price | Vehicle loan (two-wheeler/etc.) | The vehicle itself is quasi-collateral, priced accordingly (§5) — cheaper than a general unsecured personal loan for the same borrower profile. |
| None of the above | Personal / business unsecured, per employment type | Default when no collateral or asset-linked path exists. |

Routing overrides the borrower's stated "loan type" preference when a materially cheaper secured path exists — the app tells them why, it doesn't silently substitute it.

---

## 5. Fair interest rate (O3)

Rate is a lookup table (risk tier → band), not a formula — there is no equation for "fair," only comparable market pricing tiers. Bands are annual, reducing-balance, judgement-anchored to broadly known Indian pricing tiers, not one lender's live rate card.

| Product | Credit tier | Rate band |
|---|---|---|
| LAP (secured) | Score 750+ / clean | 9.0 – 10.5% |
| LAP (secured) | Score 650–749 / unknown-clean | 10.5 – 12.0% |
| LAP (secured) | Score <650 / red flag | 12.0 – 14.0% |
| Gold loan | Any | 9.0 – 12.0% |
| Vehicle loan | Formal income | 11.0 – 14.0% |
| Vehicle loan | Informal / gig, no bureau | 16.0 – 22.0% |
| Personal loan, salaried | 750+ | 10.5 – 12.5% |
| Personal loan, salaried | 650–749 | 13.0 – 16.0% |
| Personal loan, salaried | Unknown score, no red flags | 13.0 – 15.0% (treated as moderate — §6.4) |
| Personal loan, salaried | <650 or red flag | 18.0 – 24.0% |
| Business loan, self-employed formal | Proxy-moderate+ | 14.0 – 18.0% |
| Business loan, self-employed informal | No bureau | 22.0 – 30.0% — flagged as expensive; product routing (§4) is checked *before* this band is ever shown |

`fair_rate_midpoint` (used in §2.4 and §3.3 EMI math) = midpoint of the selected band.

### 5.1 All-in cost (APR)

| Item | Value | Why |
|---|---|---|
| Processing fee, secured | 1.0% of principal + 18% GST on the fee | Typical secured-product fee level. |
| Processing fee, unsecured | 2.0% of principal + 18% GST on the fee | Typical unsecured personal/business-loan fee level. |
| APR method | Solve for the flat rate that equates the EMI stream (computed on full principal at the nominal rate) to the *net disbursed* amount (principal − fee − GST on fee) | Mirrors the logic behind RBI's Key-Fact-Statement APR disclosure mandate for digital lending: nominal rate alone understates true cost once upfront fees are netted off disbursal. |

The Negotiation Card always shows nominal rate band *and* APR band side by side, so a lender's quoted rate can be compared against both.

---

## 6. Credit score handling

| Rule | Value | Why |
|---|---|---|
| 6.1 Score buckets | 750+, 650–749, <650 | Matches common Indian bureau-score risk tiering used across retail lending. |
| 6.2 Score is a must-question | — | It materially changes §2.2 and §5; the app cannot responsibly skip it. |
| 6.3 "I don't know" is a valid answer | — | Brief requirement: unknown is never zero. |
| 6.4 Unknown-score treatment | Treated as the **650–749 (moderate) tier**, never the worst tier, *provided* no other red flag (recent bounce, existing high-cost informal debt) is present. If a red flag is present alongside an unknown score, it drops to the <650 tier — the red flag, not the missing score, drives the downgrade. | A borrower with no credit history (e.g. Ravi, who has never taken a formal loan) is not the same risk as a borrower who has a *bad* history. Treating "no score" as "worst score" would punish exactly the informal-sector borrowers this app exists to help. The band is additionally widened (§7) to reflect the genuine extra uncertainty. |

---

## 7. Confidence & band widening

| Rule | Value | Why |
|---|---|---|
| Baseline width (must-tier only answered) | O2 and O4 shown at ±20% around the computed figure | Reflects that only the minimum viable inputs were given. |
| Each relevant additional question answered | −3 points off that output's ± width, floor of ±5% | Simple, uniform tightening step — documented as a deliberate simplification (a real model would weight questions differently; this app is transparent that it doesn't). |
| Unknown answer on a *load-bearing* additional question (e.g. no collateral info when self-employed) | No tightening applied for that question; if it's the credit score specifically, +5 points added back to width (does not stack below baseline) | Silence should never narrow a range — an explicit anti-overconfidence rule from the brief. |
| Confidence label (shown next to every output) | 0–2 additional answers → **Low**, 3–5 → **Medium**, 6+ → **High** | Arbitrary but simple, disclosed as judgement; gives the borrower an honest read on how much to trust the number without needing to understand the underlying math. |
| Rate band width | Not adjusted by the point system above — it only moves by *changing rows* in the §5 table (e.g. unknown-score row → confirmed-score row) | Rate is inherently a banded lookup, not a point estimate being narrowed; conflating the two mechanisms would be misleading. |

---

## 8. Verdict (O1)

Evaluated in this order — first match wins:

| # | Condition | Verdict | Alternative offered |
|---|---|---|---|
| 1 | `safe_EMI_ceiling ≤ 0` (existing obligations + housing already exceed the protective ceiling with zero room for a new EMI) | **Don't borrow** | "Your existing EMI and rent already use up your safe limit — look at reducing an existing obligation before taking on a new one." |
| 2 | Bounce in the last 6 months **and** existing high-cost debt present (any existing loan/BNPL at >24% APR) | **Don't borrow** | "You're already carrying high-cost debt with a recent missed payment — consolidating that debt is likely to help more than a new loan." |
| 3 | Requested amount > `min(lender_max, safe_max)` × 1.2 | **Borrow less** | States the recommended amount = `min(lender_max, safe_max)`, rounded per §9. |
| 4 | Otherwise | **Borrow** | Requested amount is shown alongside both O2 numbers for context; no cap applied since it already fits. |

This is a deliberately small, auditable tree (4 branches) rather than a scored model — every borrower can be told exactly which rule fired.

---

## 9. EMI ceiling, tenure trade-off & stress test (O4)

| Rule | Value | Why |
|---|---|---|
| EMI ceiling shown to borrower | `safe_EMI_ceiling` from §3.3, rounded down to nearest ₹500 | This *is* O4 — it is not computed separately from O2, it's the same underlying number presented as a monthly figure. |
| Tenure trade-off | Same principal re-run through the annuity formula at 2 / 3 / 5 years (capped by the age-based max tenure from §1.1) | Shows the borrower the EMI/tenure lever directly instead of just one fixed answer. |
| Stress scenario — salaried | Recompute §3.3 with rate +150 bps | Salaried income is relatively stable; interest-rate risk is the more realistic shock for this segment. |
| Stress scenario — self-employed / informal / gig | Recompute §3.3 with income −20% | Income volatility, not rate risk, is this segment's dominant real risk. |
| Stress result shown | Whether the current EMI still fits under the stressed ceiling; if not, the reduced EMI/amount that would | Makes the stress case concrete and actionable rather than a disclaimer. |

---

## 9.1 Maximum tenure by age

| Employment type | Max age at loan end |
|---|---|
| Salaried | 60 |
| Self-employed / informal | 65 |

Standard practice across Indian retail lenders; used only to cap the tenure options offered in §9, not otherwise load-bearing.

---

## 10. Rounding & display

| Item | Convention | Why |
|---|---|---|
| Loan amounts | Round down to nearest ₹5,000 | Avoids false precision (e.g. "₹6,53,214"). |
| EMI figures | Round down to nearest ₹500 | Same reason. |
| Rates | One decimal place | Matches how rates are actually quoted. |
| All roundings favor the borrower (round down on amounts they can borrow/must repay-ceiling) | — | Consistent with the protective philosophy in §0. |

---

## 11.0 What the persona test suite actually caught

`lib/engine/evaluate.test.ts` runs Priya, Ravi and Anita's answers through the real engine on every change. Two real bugs surfaced this way during the build rather than being found later:

1. **An over-punitive safe-ceiling.** The first draft set the protective ceiling (§3.1) well below the lender ceiling *and* added rent into the base — double-penalizing. Priya's rent + car EMI alone breached it, producing "don't borrow" for a borrower any loan officer would approve. Fixed by aligning the base percentage with the lender ceiling and letting §3.2's savings-buffer penalty carry the actual protective effect.
2. **An inverted binding-side assumption.** The Amount output's explanation text assumed the lender cap is always the looser one. Anita's no-income-proof profile breaks that assumption (§2.5) — her income-multiple cap binds tighter than her safe-carry number — and the first version of the copy told her the wrong story about why her number was small. Fixed to check which side actually binds before writing the sentence.

Left in here deliberately — it's evidence the numbers were checked against the personas, not just asserted.

## 11. Known limitations (stated deliberately, not discovered by accident)

- No real bureau or banking-data integration — every number is self-reported by the borrower and cannot be verified. The app is a self-assessment, not an underwriting decision.
- Rate bands are judgement-anchored to general market tiers, not a live feed from any specific lender. A real deployment would need this refreshed against actual current rate cards.
- The verdict tree has four branches; it does not model every possible combination of red flags (e.g. two simultaneous informal debts at different rates are summed, not individually reasoned about).
- Co-applicant income is added to capacity but does not adjust the FOIR/safe-ceiling percentages themselves — a fuller model might treat joint applications with their own ceiling logic.
- Confidence widening uses a flat ±3-point step per question rather than a weighted model — simple and transparent, but not sensitive to which question actually matters more for a given profile.
- Tax benefits (e.g. home loan interest deduction) are not modeled in affordability — would change effective safe-carry for home loans specifically.
