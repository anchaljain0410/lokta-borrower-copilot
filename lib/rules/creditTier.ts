// Credit tier resolution, including the unknown-score rule.
// RULES.md §6.4 — unknown is treated as "mid," never "low," unless a red
// flag (recent bounce or existing high-cost debt) is also present.

import { Answers, CreditTier } from "../types";

export function hasHighCostDebt(answers: Answers): boolean {
  return (answers.existingLoans ?? []).some((loan) => loan.ratePct > 24);
}

export function hasRedFlag(answers: Answers): boolean {
  return Boolean(answers.recentBounce) || hasHighCostDebt(answers);
}

export function resolveCreditTier(answers: Answers): CreditTier {
  const flagged = hasRedFlag(answers);
  if (answers.creditScore !== "unknown") {
    if (answers.creditScore >= 750) return "high";
    if (answers.creditScore >= 650) return "mid";
    return "low";
  }
  return flagged ? "low" : "mid";
}
