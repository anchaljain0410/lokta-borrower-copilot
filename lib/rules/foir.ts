// Lender-side FOIR ceiling. RULES.md §2.1 — keyed by how the income is
// proven, since that's what actually drives a lender's confidence.

import { IncomeProofType } from "../types";

export function foirCeiling(incomeProofType: IncomeProofType): number {
  switch (incomeProofType) {
    case "payslip":
      return 0.5;
    case "itr":
      return 0.45;
    case "bank_statement":
      return 0.4;
    case "none":
      return 0.35;
  }
}
