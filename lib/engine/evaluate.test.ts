import { describe, it, expect } from "vitest";
import { evaluate } from "./evaluate";
import { priya, ravi, anita } from "./personas";

describe("Priya — salaried, clean profile", () => {
  const result = evaluate(priya);

  it("gets borrow-less — her rent + car EMI already eat most of her safe capacity", () => {
    expect(result.verdict.verdict).toBe("borrow_less");
    expect(result.amount.recommended).toBeLessThan(priya.amountWanted);
  });

  it("routes to a personal loan (no collateral)", () => {
    expect(result.productRouted).toBe("personal");
  });

  it("shows a lender-max at or above the safe-max", () => {
    expect(result.amount.lenderMax).toBeGreaterThanOrEqual(result.amount.safeMax);
  });

  it("prices a top credit-tier rate band", () => {
    expect(result.rate.nominalBand.low).toBeCloseTo(10.5, 1);
  });

  it("stress-tests against a rate shock, not an income shock", () => {
    expect(result.emi.stress.description).toMatch(/interest rate/);
  });
});

describe("Ravi — self-employed, has collateral, no bureau score", () => {
  const result = evaluate(ravi);

  it("is routed to LAP because collateral covers 2x+ the ask", () => {
    expect(result.productRouted).toBe("lap");
  });

  it("treats an unknown score as moderate, not worst-case", () => {
    expect(result.creditTier).toBe("mid");
  });

  it("does not get punished with the worst rate band", () => {
    expect(result.rate.nominalBand.high).toBeLessThanOrEqual(12.0);
  });

  it("stress-tests against an income shock, not a rate shock", () => {
    expect(result.emi.stress.description).toMatch(/income/);
  });

  it("can comfortably get the ₹15L he asked for via LAP", () => {
    expect(result.verdict.verdict).toBe("borrow");
  });
});

describe("Anita — informal income, active bounce, existing high-cost debt", () => {
  const result = evaluate(anita);

  it("fires don't-borrow, not a sized loan", () => {
    expect(result.verdict.verdict).toBe("dont_borrow");
  });

  it("always gives an alternative alongside a negative verdict", () => {
    expect(result.verdict.alternative).toBeTruthy();
  });

  it("flags the red flag", () => {
    expect(result.hasRedFlag).toBe(true);
  });

  it("is access-constrained, not affordability-constrained — the lender cap binds, not the safe cap", () => {
    // No income proof pushes the income-multiple cap (3x) below what she
    // could actually service — the reason text must attribute this correctly.
    expect(result.amount.lenderMax).toBeLessThan(result.amount.safeMax);
    expect(result.amount.reason).toMatch(/access|policy caps/i);
  });
});

describe("Confidence widens with silence, never narrows without basis", () => {
  it("a fuller answer set is never less confident than a must-only answer set", () => {
    const sparse = evaluate(priya);
    const fuller = evaluate({
      ...priya,
      cardUtilizationPct: 20,
      existingLoans: [{ emi: 14000, ratePct: 9, lenderType: "formal" }],
      collateral: undefined,
    });
    const rank = { Low: 0, Medium: 1, High: 2 } as const;
    expect(rank[fuller.rate.confidence]).toBeGreaterThanOrEqual(rank[sparse.rate.confidence]);
  });

  it("must-tier-only is deliberately stricter than the same profile with stability answered (RULES.md §3.1.1)", () => {
    const mustTierOnly = evaluate({
      ...priya,
      yearsAtCurrentEmployerOrBusiness: undefined,
      emergencySavingsMonths: undefined,
    });
    const withStabilityAnswered = evaluate(priya); // has 5yrs tenure + 2 months savings

    // Same borrower, same income and obligations — only the presence of
    // stability evidence differs. The sparser read must never be more
    // permissive than the fuller one.
    expect(mustTierOnly.amount.safeMax).toBeLessThanOrEqual(withStabilityAnswered.amount.safeMax);
    expect(mustTierOnly.verdict.verdict).toBe("dont_borrow");
    expect(withStabilityAnswered.verdict.verdict).toBe("borrow_less");
  });

  it("an unanswered credit score widens the amount band versus a known score", () => {
    const known = evaluate(ravi);
    const unknown = evaluate({ ...ravi, creditScore: "unknown" });
    expect(unknown).toBeTruthy();
    expect(known).toBeTruthy();
    // Ravi's own score is already unknown — assert against Priya instead for a real contrast.
    const priyaKnown = evaluate(priya);
    const priyaUnknown = evaluate({ ...priya, creditScore: "unknown" });
    expect(priyaUnknown.amount.rangeWidthPct).toBeGreaterThanOrEqual(priyaKnown.amount.rangeWidthPct);
  });
});
