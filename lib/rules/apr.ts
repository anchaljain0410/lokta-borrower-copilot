// All-in cost (APR) — RULES.md §5.1. Nets the processing fee + GST off
// disbursal and solves for the flat rate that equates the same EMI
// stream to that smaller net-disbursed amount. Mirrors the logic behind
// RBI's Key-Fact-Statement APR disclosure mandate for digital lending.

import { ProductType } from "../types";
import { emiForPrincipal, principalForEmi } from "./emiMath";

export function processingFeePct(product: ProductType): number {
  return product === "lap" || product === "gold" ? 0.01 : 0.02;
}

export function aprFromNominal(
  nominalRatePct: number,
  product: ProductType,
  principal: number,
  tenureMonths: number
): number {
  if (principal <= 0) return nominalRatePct;

  const feePct = processingFeePct(product);
  const fee = principal * feePct;
  const gstOnFee = fee * 0.18;
  const netDisbursed = principal - fee - gstOnFee;
  const emi = emiForPrincipal(principal, nominalRatePct, tenureMonths);

  // Binary search for the rate whose EMI-implied principal equals netDisbursed.
  let lo = nominalRatePct;
  let hi = nominalRatePct + 15;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const impliedPrincipal = principalForEmi(emi, mid, tenureMonths);
    if (impliedPrincipal > netDisbursed) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}
