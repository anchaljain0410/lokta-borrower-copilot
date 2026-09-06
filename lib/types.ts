// Domain types for the Borrower Copilot rules engine.
// See RULES.md for the reasoning behind every value referenced here.

export type EmploymentType = "salaried" | "self_employed" | "informal";

export type IncomeProofType = "payslip" | "itr" | "bank_statement" | "none";

export type CreditTier = "high" | "mid" | "low";

export type ProductType = "personal" | "business" | "lap" | "gold" | "vehicle";

export type LoanPurpose =
  | "wedding"
  | "medical"
  | "education"
  | "home_improvement"
  | "vehicle"
  | "business_expansion"
  | "debt_consolidation"
  | "other";

export interface ExistingLoan {
  emi: number;
  ratePct: number;
  lenderType: "formal" | "informal_app" | "moneylender";
}

export interface Collateral {
  type: "property" | "gold";
  value: number;
  documented: boolean;
}

// Raw answers as captured from the question flow. Must-tier fields are
// required; everything else is optional and, when absent, simply leaves
// the relevant output at its wider default (see RULES.md §7).
export interface Answers {
  // --- must-tier ---
  purpose: LoanPurpose;
  amountWanted: number;
  loanTypeHint: ProductType;
  employmentType: EmploymentType;
  incomeProofType: IncomeProofType;
  netMonthlyIncome: number;
  existingEmiTotal: number;
  housingCost: number; // 0 if owned outright / living with family
  monthlyExpenses: number;
  age: number;
  creditScore: number | "unknown";

  // --- additional-tier ---
  yearsAtCurrentEmployerOrBusiness?: number;
  variableIncomeSharePct?: number; // salaried: bonus/commission share of income
  incomeStability?: "stable" | "somewhat_variable" | "highly_variable"; // informal/self-employed
  itrAnnualIncome?: number; // self-employed: what's declared on ITR
  existingLoans?: ExistingLoan[];
  cardUtilizationPct?: number;
  recentBounce?: boolean; // EMI/cheque bounce in last 6 months
  emergencySavingsMonths?: number | "unknown";
  collateral?: Collateral;
  vehiclePrice?: number; // on-road price, when purpose/loanTypeHint is vehicle
  coApplicantIncome?: number;
  upcomingLargeExpense?: number;
  loanWillEarnMonthly?: number; // productive/business use
  offerReceivedRatePct?: number; // rate a lender has already quoted, for the Negotiation Card
}

export type ConfidenceLabel = "Low" | "Medium" | "High";

export type OutputKey = "amount" | "rate" | "emi" | "verdict";

export interface RateRange {
  low: number;
  high: number;
}

export interface VerdictOutput {
  verdict: "borrow" | "borrow_less" | "dont_borrow";
  reason: string;
  alternative?: string;
  confidence: ConfidenceLabel;
}

export interface AmountOutput {
  lenderMax: number;
  safeMax: number;
  recommended: number;
  reason: string;
  confidence: ConfidenceLabel;
  rangeWidthPct: number;
}

export interface RateOutput {
  product: ProductType;
  nominalBand: RateRange;
  aprBand: RateRange;
  reason: string;
  confidence: ConfidenceLabel;
}

export interface TenureOption {
  years: number;
  emi: number;
}

export interface StressResult {
  description: string;
  holds: boolean;
  adjustedPrincipal?: number;
}

export interface EmiOutput {
  ceiling: number;
  tenureOptions: TenureOption[];
  stress: StressResult;
  reason: string;
  confidence: ConfidenceLabel;
}

export interface EvaluationResult {
  verdict: VerdictOutput;
  amount: AmountOutput;
  rate: RateOutput;
  emi: EmiOutput;
  productRouted: ProductType;
  routingReason: string;
  hasRedFlag: boolean;
  creditTier: CreditTier;
}
