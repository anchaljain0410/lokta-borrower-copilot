// Display rounding conventions. RULES.md §10 — always rounds in the
// borrower's favor (down on amounts they can borrow / EMI ceilings).

export function roundAmountDown(amount: number): number {
  return Math.max(0, Math.floor(amount / 5000) * 5000);
}

export function roundEmiDown(emi: number): number {
  return Math.max(0, Math.floor(emi / 500) * 500);
}

export function roundRate(rate: number): number {
  return Math.round(rate * 10) / 10;
}
