// The three reference borrowers from the brief, encoded as answer sets.
// Used by both the test suite and RUNTHROUGHS.md generation.

import { Answers } from "../types";

export const priya: Answers = {
  purpose: "wedding",
  amountWanted: 800000,
  loanTypeHint: "personal",
  employmentType: "salaried",
  incomeProofType: "payslip",
  netMonthlyIncome: 110000,
  existingEmiTotal: 14000,
  housingCost: 28000,
  monthlyExpenses: 35000,
  age: 29,
  creditScore: 780,
  yearsAtCurrentEmployerOrBusiness: 5,
  recentBounce: false,
  emergencySavingsMonths: 2,
};

export const ravi: Answers = {
  purpose: "business_expansion",
  amountWanted: 1500000,
  loanTypeHint: "business",
  employmentType: "self_employed",
  incomeProofType: "itr",
  netMonthlyIncome: 60000, // midpoint of stated ₹40k-80k cash income
  existingEmiTotal: 0,
  housingCost: 0, // owns the shop premises, no rent
  monthlyExpenses: 30000,
  age: 42,
  creditScore: "unknown",
  yearsAtCurrentEmployerOrBusiness: 14,
  itrAnnualIncome: 420000,
  recentBounce: false,
  collateral: { type: "property", value: 4500000, documented: true },
  coApplicantIncome: 18000,
  emergencySavingsMonths: "unknown",
};

export const anita: Answers = {
  purpose: "vehicle",
  amountWanted: 150000,
  loanTypeHint: "vehicle",
  employmentType: "informal",
  incomeProofType: "none",
  netMonthlyIncome: 28000, // midpoint of stated ₹26k-30k
  existingEmiTotal: 3500, // the app-loan EMI below, counted in full for capacity math
  housingCost: 0,
  monthlyExpenses: 22000,
  age: 35,
  creditScore: "unknown",
  incomeStability: "highly_variable",
  recentBounce: true,
  existingLoans: [{ emi: 3500, ratePct: 30, lenderType: "informal_app" }],
  vehiclePrice: 150000,
  emergencySavingsMonths: 0,
  loanWillEarnMonthly: 8000,
};
