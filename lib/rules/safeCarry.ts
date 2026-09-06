// Borrower-side protective ceiling. RULES.md §3 — deliberately stricter
// than the lender's FOIR: folds in housing cost and a savings-buffer
// penalty that a bank's FOIR math usually ignores.

import { Answers, EmploymentType } from "../types";
import { effectiveMonthlyIncome } from "./effectiveIncome";

export function safeCeilingPct(
  employmentType: EmploymentType,
  yearsAtCurrent: number | undefined
): number {
  if (employmentType === "salaried") {
    return (yearsAtCurrent ?? 0) >= 2 ? 0.5 : 0.45;
  }
  if (employmentType === "self_employed") return 0.45;
  return 0.4; // informal
}

export function savingsBufferPenalty(months: number | "unknown" | undefined): number {
  if (months === undefined || months === "unknown") return 0.1;
  if (months >= 3) return 0;
  if (months >= 1) return 0.05;
  return 0.1;
}

export function safeEmiCeiling(answers: Answers): number {
  const income = effectiveMonthlyIncome(answers);
  const ceilingPct = safeCeilingPct(answers.employmentType, answers.yearsAtCurrentEmployerOrBusiness);
  const penalty = savingsBufferPenalty(answers.emergencySavingsMonths);
  const effectivePct = Math.max(0, ceilingPct - penalty);
  const coApplicant = answers.coApplicantIncome ?? 0;

  return Math.max(
    0,
    effectivePct * (income + coApplicant) - answers.existingEmiTotal - answers.housingCost
  );
}
