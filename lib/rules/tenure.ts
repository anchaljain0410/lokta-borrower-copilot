// Tenure caps. RULES.md §9.1 (age-based) plus a product-typical ceiling —
// a personal/business/vehicle/gold loan doesn't run 20 years just because
// the borrower is young; LAP is the one product priced for a long tenure.

import { EmploymentType, ProductType } from "../types";

export function maxAgeAtLoanEnd(employmentType: EmploymentType): number {
  return employmentType === "salaried" ? 60 : 65;
}

export function productTenureCapMonths(product: ProductType): number {
  switch (product) {
    case "lap":
      return 180; // 15 years
    case "gold":
      return 36; // 3 years
    default:
      return 60; // 5 years — personal, business, vehicle
  }
}

export function maxTenureMonths(
  employmentType: EmploymentType,
  age: number,
  product: ProductType
): number {
  const ageCapMonths = Math.max(12, (maxAgeAtLoanEnd(employmentType) - age) * 12);
  return Math.min(ageCapMonths, productTenureCapMonths(product));
}
