// Confidence & band widening. RULES.md §7 — silence never narrows a
// range. Each output's confidence is based on how many *relevant*
// additional questions were answered for that output specifically.

import { Answers, ConfidenceLabel, OutputKey } from "../types";

type FieldKey = keyof Answers;

// Which output(s) each additional-tier question tightens, per RULES.md §1.2.
const TIGHTENS: Partial<Record<FieldKey, OutputKey[]>> = {
  yearsAtCurrentEmployerOrBusiness: ["verdict", "rate"],
  variableIncomeSharePct: ["amount"],
  incomeStability: ["amount", "emi"],
  itrAnnualIncome: ["amount"],
  existingLoans: ["verdict", "rate"],
  cardUtilizationPct: ["rate"],
  recentBounce: ["verdict", "rate"],
  emergencySavingsMonths: ["amount"],
  collateral: ["verdict", "amount", "rate"],
  coApplicantIncome: ["amount", "emi"],
  upcomingLargeExpense: ["emi"],
  loanWillEarnMonthly: ["verdict"],
};

function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null || value === "unknown") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function countRelevantAnswered(answers: Answers, output: OutputKey): number {
  return (Object.keys(TIGHTENS) as FieldKey[]).filter((field) => {
    const outputs = TIGHTENS[field];
    return outputs?.includes(output) && isAnswered(answers[field]);
  }).length;
}

export function confidenceLabel(count: number): ConfidenceLabel {
  if (count <= 2) return "Low";
  if (count <= 5) return "Medium";
  return "High";
}

// Credit score is the one field whose *absence* actively widens a band
// rather than merely failing to tighten it (RULES.md §7).
export function bandWidthPct(answers: Answers, output: OutputKey): number {
  const count = countRelevantAnswered(answers, output);
  const unknownScorePenalty = answers.creditScore === "unknown" ? 5 : 0;
  const width = 20 - count * 3 + unknownScorePenalty;
  return Math.max(5, width);
}

export function outputConfidence(answers: Answers, output: OutputKey): ConfidenceLabel {
  return confidenceLabel(countRelevantAnswered(answers, output));
}
