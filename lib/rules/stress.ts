// Stress test. RULES.md §9 — one deterministic shock per employment
// type, re-run through the same math, not a disclaimer.

import { Answers, StressResult } from "../types";
import { emiForPrincipal, principalForEmi } from "./emiMath";
import { effectiveMonthlyIncome } from "./effectiveIncome";
import { safeCeilingPct, savingsBufferPenalty } from "./safeCarry";

const RATE_SHOCK_PP = 1.5;
const INCOME_SHOCK_PCT = 0.2;

export function runStressTest(
  answers: Answers,
  recommendedPrincipal: number,
  currentSafeEmiCeiling: number,
  rateMidpointPct: number,
  tenureMonths: number
): StressResult {
  if (answers.employmentType === "salaried") {
    const stressedRate = rateMidpointPct + RATE_SHOCK_PP;
    const stressedEmi = emiForPrincipal(recommendedPrincipal, stressedRate, tenureMonths);
    const holds = stressedEmi <= currentSafeEmiCeiling;
    return {
      description: `If your interest rate rose by ${RATE_SHOCK_PP} percentage points`,
      holds,
      adjustedPrincipal: holds
        ? undefined
        : principalForEmi(currentSafeEmiCeiling, stressedRate, tenureMonths),
    };
  }

  // self-employed / informal: income shock is the dominant real risk
  const income = effectiveMonthlyIncome(answers);
  const stressedIncome = income * (1 - INCOME_SHOCK_PCT);
  const ceilingPct = safeCeilingPct(answers.employmentType, answers.yearsAtCurrentEmployerOrBusiness);
  const penalty = savingsBufferPenalty(answers.emergencySavingsMonths);
  const effectivePct = Math.max(0, ceilingPct - penalty);
  const coApplicant = answers.coApplicantIncome ?? 0;
  const stressedCeiling = Math.max(
    0,
    effectivePct * (stressedIncome + coApplicant) - answers.existingEmiTotal - answers.housingCost
  );

  const currentEmi = emiForPrincipal(recommendedPrincipal, rateMidpointPct, tenureMonths);
  const holds = currentEmi <= stressedCeiling;

  return {
    description: `If your income dropped ${INCOME_SHOCK_PCT * 100}%`,
    holds,
    adjustedPrincipal: holds ? undefined : principalForEmi(stressedCeiling, rateMidpointPct, tenureMonths),
  };
}
