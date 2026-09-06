// Lender-likely-sanction. RULES.md §2 — the lower of the FOIR-implied
// capacity and the income-multiple (or LTV) cap.

import { Answers, ProductType } from "../types";
import { foirCeiling } from "./foir";
import { incomeMultipleCap } from "./incomeMultiple";
import { resolveCreditTier, hasRedFlag } from "./creditTier";
import { principalForEmi } from "./emiMath";
import { effectiveMonthlyIncome } from "./effectiveIncome";

const LTV_CAP_FORMAL = 0.6;
const LTV_CAP_INFORMAL = 0.5;

export function lenderMaxEmi(answers: Answers): number {
  const income = effectiveMonthlyIncome(answers);
  const ceiling = foirCeiling(answers.incomeProofType);
  const coApplicant = answers.coApplicantIncome ?? 0;
  return Math.max(0, ceiling * (income + coApplicant) - answers.existingEmiTotal);
}

export function lenderMaxPrincipal(
  answers: Answers,
  product: ProductType,
  rateMidpointPct: number,
  tenureMonths: number
): number {
  const emiCap = lenderMaxEmi(answers);
  const principalFromFoir = principalForEmi(emiCap, rateMidpointPct, tenureMonths);

  if (product === "lap") {
    const ltvCap = answers.incomeProofType === "itr" || answers.incomeProofType === "payslip"
      ? LTV_CAP_FORMAL
      : LTV_CAP_INFORMAL;
    const collateralValue = answers.collateral?.value ?? 0;
    return Math.min(principalFromFoir, ltvCap * collateralValue);
  }

  const tier = resolveCreditTier(answers);
  const flagged = hasRedFlag(answers);
  const multiple = incomeMultipleCap(answers.employmentType, tier, flagged, answers.incomeProofType);
  const income = effectiveMonthlyIncome(answers);
  return Math.min(principalFromFoir, multiple * income);
}
