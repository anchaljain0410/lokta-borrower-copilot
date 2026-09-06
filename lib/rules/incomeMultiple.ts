// Income-multiple cap — the second, independent lender-side ceiling.
// RULES.md §2.2. The binding lender cap is whichever of FOIR-implied
// capacity and this multiple is lower.

import { Answers, CreditTier, EmploymentType } from "../types";

export function incomeMultipleCap(
  employmentType: EmploymentType,
  creditTier: CreditTier,
  flagged: boolean,
  incomeProofType: Answers["incomeProofType"]
): number {
  if (employmentType === "salaried") {
    if (flagged) return 6;
    switch (creditTier) {
      case "high":
        return 15;
      case "mid":
        return 10;
      case "low":
        return 6;
    }
  }
  // self-employed / informal
  return incomeProofType === "itr" ? 6 : 3;
}
