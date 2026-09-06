// Product routing. RULES.md §4 — routes to a cheaper secured path when
// one genuinely applies, overriding the borrower's stated preference
// (the app explains why rather than silently substituting it).

import { Answers, ProductType } from "../types";

export interface RoutingResult {
  product: ProductType;
  reason: string;
}

export function routeProduct(answers: Answers): RoutingResult {
  const { collateral, amountWanted, loanTypeHint, vehiclePrice, employmentType } = answers;

  if (collateral?.type === "property" && collateral.value >= amountWanted * 2) {
    return {
      product: "lap",
      reason:
        "You have property collateral worth at least twice your ask — secured pricing runs roughly half of unsecured business-loan pricing, so this is routed to a loan against property instead.",
    };
  }

  if (collateral?.type === "gold" && collateral.value > 0) {
    return {
      product: "gold",
      reason:
        "Gold collateral is the cheapest, fastest secured option available without formal income proof.",
    };
  }

  if (
    (loanTypeHint === "vehicle" || answers.purpose === "vehicle") &&
    vehiclePrice &&
    amountWanted <= vehiclePrice
  ) {
    return {
      product: "vehicle",
      reason:
        "The vehicle being purchased acts as collateral for its own loan, which prices lower than a general unsecured loan.",
    };
  }

  const defaultProduct: ProductType = employmentType === "salaried" ? "personal" : "business";
  return {
    product: defaultProduct,
    reason:
      "No collateral or asset-linked path applies here, so this is priced as a standard unsecured loan for your profile.",
  };
}
