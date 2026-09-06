// Fair interest rate lookup. RULES.md §5 — a table, not a formula: there
// is no equation for "fair," only comparable market pricing tiers.

import { Answers, CreditTier, ProductType, RateRange } from "../types";
import { resolveCreditTier, hasRedFlag } from "./creditTier";

export function rateBand(product: ProductType, answers: Answers): RateRange {
  const tier: CreditTier = resolveCreditTier(answers);
  const flagged = hasRedFlag(answers);
  const scoreUnknown = answers.creditScore === "unknown";

  switch (product) {
    case "lap":
      if (flagged || tier === "low") return { low: 12.0, high: 14.0 };
      if (tier === "mid") return { low: 10.5, high: 12.0 };
      return { low: 9.0, high: 10.5 };

    case "gold":
      return { low: 9.0, high: 12.0 };

    case "vehicle":
      return answers.incomeProofType === "none"
        ? { low: 16.0, high: 22.0 }
        : { low: 11.0, high: 14.0 };

    case "personal":
      if (flagged || tier === "low") return { low: 18.0, high: 24.0 };
      if (tier === "mid" && scoreUnknown) return { low: 13.0, high: 15.0 };
      if (tier === "mid") return { low: 13.0, high: 16.0 };
      return { low: 10.5, high: 12.5 };

    case "business":
      return answers.incomeProofType === "itr" || answers.incomeProofType === "payslip"
        ? { low: 14.0, high: 18.0 }
        : { low: 22.0, high: 30.0 };
  }
}

export function rateMidpoint(range: RateRange): number {
  return (range.low + range.high) / 2;
}
