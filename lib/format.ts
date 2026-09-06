export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

// Live-formats digits as the borrower types, Indian grouping (lakh/crore):
// "800000" -> "8,00,000". Keeps at most one decimal point, digits only.
export function formatIndianDigits(rawDigits: string): string {
  const cleaned = rawDigits.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  const safe =
    firstDot === -1 ? cleaned : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  const [intPart, decPart] = safe.split(".");
  if (!intPart) return decPart !== undefined ? `.${decPart}` : "";
  const lastThree = intPart.length > 3 ? intPart.slice(-3) : intPart;
  const rest = intPart.length > 3 ? intPart.slice(0, -3) : "";
  const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = rest ? `${restGrouped},${lastThree}` : lastThree;
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

export function stripToDigits(value: string): string {
  return value.replace(/[^0-9.]/g, "");
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const PRODUCT_LABELS: Record<string, string> = {
  personal: "Personal loan",
  business: "Business loan",
  lap: "Loan against property",
  gold: "Gold loan",
  vehicle: "Vehicle loan",
};

export const VERDICT_LABELS: Record<string, string> = {
  borrow: "You can borrow",
  borrow_less: "Borrow less than you asked",
  dont_borrow: "Don't borrow right now",
};
