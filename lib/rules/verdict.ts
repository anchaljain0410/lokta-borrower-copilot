// Verdict decision tree. RULES.md §8 — four branches, first match wins,
// every borrower can be told exactly which rule fired.

import { Answers, VerdictOutput } from "../types";
import { hasHighCostDebt } from "./creditTier";
import { outputConfidence } from "./confidence";
import { roundAmountDown } from "./rounding";

export function evaluateVerdict(
  answers: Answers,
  safeEmiCeiling: number,
  lenderMax: number,
  safeMax: number
): VerdictOutput {
  const confidence = outputConfidence(answers, "verdict");

  if (safeEmiCeiling <= 0) {
    return {
      verdict: "dont_borrow",
      reason:
        "Your existing EMIs and housing cost already use up your safe limit, leaving no room for a new EMI.",
      alternative:
        "Look at reducing or restructuring an existing obligation before taking on a new loan.",
      confidence,
    };
  }

  const recentBounce = Boolean(answers.recentBounce);
  const highCostDebt = hasHighCostDebt(answers);
  if (recentBounce && highCostDebt) {
    return {
      verdict: "dont_borrow",
      reason:
        "You're already carrying high-cost debt (above 24% APR) with a recent missed payment.",
      alternative:
        "Consolidating that existing debt is likely to help more than taking on a new loan right now.",
      confidence,
    };
  }

  const recommended = roundAmountDown(Math.min(lenderMax, safeMax));
  if (answers.amountWanted > recommended * 1.2) {
    return {
      verdict: "borrow_less",
      reason: `What you can safely carry comes to about ₹${recommended.toLocaleString("en-IN")} — well below your ₹${answers.amountWanted.toLocaleString("en-IN")} ask.`,
      confidence,
    };
  }

  return {
    verdict: "borrow",
    reason: "Your requested amount fits within what you can safely carry.",
    confidence,
  };
}
