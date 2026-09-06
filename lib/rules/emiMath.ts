// Standard reducing-balance annuity math. Exact — not a judgement call.
// RULES.md §2.4

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 12 / 100;
}

export function emiForPrincipal(
  principal: number,
  annualRatePct: number,
  months: number
): number {
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export function principalForEmi(
  emi: number,
  annualRatePct: number,
  months: number
): number {
  if (emi <= 0) return 0;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return emi * months;
  const factor = Math.pow(1 + r, months);
  return (emi * (factor - 1)) / (r * factor);
}
