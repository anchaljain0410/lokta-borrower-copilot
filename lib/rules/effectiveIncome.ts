// Effective income adjustments used everywhere net income feeds a
// capacity calculation. RULES.md §1.3 — documents these exact weights.

import { Answers } from "../types";

export function effectiveMonthlyIncome(answers: Answers): number {
  const { employmentType, netMonthlyIncome } = answers;

  if (employmentType === "salaried" && answers.variableIncomeSharePct) {
    const variableShare = Math.min(100, Math.max(0, answers.variableIncomeSharePct)) / 100;
    return netMonthlyIncome * (1 - variableShare);
  }

  if (employmentType === "self_employed" && answers.itrAnnualIncome) {
    const itrMonthly = answers.itrAnnualIncome / 12;
    return 0.5 * netMonthlyIncome + 0.5 * itrMonthly;
  }

  if (employmentType === "informal" && answers.incomeStability) {
    const haircut =
      answers.incomeStability === "highly_variable"
        ? 0.2
        : answers.incomeStability === "somewhat_variable"
          ? 0.1
          : 0;
    return netMonthlyIncome * (1 - haircut);
  }

  return netMonthlyIncome;
}
