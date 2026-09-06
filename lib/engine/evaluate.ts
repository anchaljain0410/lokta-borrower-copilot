// Orchestrates the pure rule modules into the four outputs. This is the
// only place that combines them — every individual rule stays testable
// and readable in isolation under lib/rules/.

import { Answers, EvaluationResult, TenureOption } from "../types";
import { routeProduct } from "../rules/productRouting";
import { rateBand, rateMidpoint } from "../rules/rateBand";
import { aprFromNominal } from "../rules/apr";
import { lenderMaxPrincipal } from "../rules/lenderMax";
import { safeEmiCeiling } from "../rules/safeCarry";
import { principalForEmi, emiForPrincipal } from "../rules/emiMath";
import { maxTenureMonths } from "../rules/tenure";
import { runStressTest } from "../rules/stress";
import { evaluateVerdict } from "../rules/verdict";
import { resolveCreditTier, hasRedFlag } from "../rules/creditTier";
import { outputConfidence, bandWidthPct } from "../rules/confidence";
import { roundAmountDown, roundEmiDown, roundRate } from "../rules/rounding";

const TENURE_STEPS_YEARS = [2, 3, 5];

export function evaluate(answers: Answers): EvaluationResult {
  const routing = routeProduct(answers);
  const product = routing.product;

  const nominal = rateBand(product, answers);
  const midpoint = rateMidpoint(nominal);

  const referenceTenureMonths = maxTenureMonths(answers.employmentType, answers.age, product);

  const lenderMax = lenderMaxPrincipal(answers, product, midpoint, referenceTenureMonths);
  const safeEmiCeilingValue = safeEmiCeiling(answers);
  const safeMax = principalForEmi(safeEmiCeilingValue, midpoint, referenceTenureMonths);

  const recommended = roundAmountDown(Math.min(lenderMax, safeMax));

  const verdict = evaluateVerdict(answers, safeEmiCeilingValue, lenderMax, safeMax);

  const aprLow = aprFromNominal(nominal.low, product, recommended, referenceTenureMonths);
  const aprHigh = aprFromNominal(nominal.high, product, recommended, referenceTenureMonths);

  const tenureOptions: TenureOption[] = TENURE_STEPS_YEARS.filter(
    (years) => years * 12 <= referenceTenureMonths
  ).map((years) => ({
    years,
    emi: roundEmiDown(emiForPrincipal(recommended, midpoint, years * 12)),
  }));
  if (tenureOptions.length === 0) {
    const years = Math.max(1, Math.round(referenceTenureMonths / 12));
    tenureOptions.push({
      years,
      emi: roundEmiDown(emiForPrincipal(recommended, midpoint, referenceTenureMonths)),
    });
  }

  const rawStress = runStressTest(
    answers,
    recommended,
    safeEmiCeilingValue,
    midpoint,
    referenceTenureMonths
  );
  const stress = {
    ...rawStress,
    adjustedPrincipal:
      rawStress.adjustedPrincipal !== undefined ? roundAmountDown(rawStress.adjustedPrincipal) : undefined,
  };

  const amountConfidence = outputConfidence(answers, "amount");
  const rateConfidence = outputConfidence(answers, "rate");
  const emiConfidence = outputConfidence(answers, "emi");

  return {
    verdict,
    amount: {
      lenderMax: roundAmountDown(lenderMax),
      safeMax: roundAmountDown(safeMax),
      recommended,
      reason:
        safeMax < lenderMax
          ? "A lender may approve more, but what you can safely repay is lower once your rent/EMIs and a savings buffer are accounted for — use the safe number to negotiate."
          : safeMax > lenderMax
            ? "You could safely repay more, but a lender's own policy caps (credit history, income proof) limit what's actually available — access, not affordability, is the constraint here."
            : "Your lender-approved amount and your safe-repayment capacity land on the same number.",
      confidence: amountConfidence,
      rangeWidthPct: bandWidthPct(answers, "amount"),
    },
    rate: {
      product,
      nominalBand: { low: roundRate(nominal.low), high: roundRate(nominal.high) },
      aprBand: { low: roundRate(aprLow), high: roundRate(aprHigh) },
      reason: "Based on your credit tier and product routing, this is the band a fair lender should quote you.",
      confidence: rateConfidence,
    },
    emi: {
      ceiling: roundEmiDown(safeEmiCeilingValue),
      tenureOptions,
      stress,
      reason: "This is your safe monthly ceiling — the same number driving your safe-carry amount above.",
      confidence: emiConfidence,
    },
    productRouted: product,
    routingReason: routing.reason,
    hasRedFlag: hasRedFlag(answers),
    creditTier: resolveCreditTier(answers),
  };
}
