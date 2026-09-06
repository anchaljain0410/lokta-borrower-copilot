// The question bank. Every additional-tier question carries a `tightens`
// tag naming the output(s) it moves — the same map the confidence engine
// uses (see TIGHTENS in lib/rules/confidence.ts) — so a question that
// can't name an output was cut before it got here (RULES.md §1.2).

import { Answers, EmploymentType, OutputKey } from "../types";

export type InputSpec =
  | { kind: "select"; options: { value: string; label: string }[] }
  | { kind: "number"; min?: number; max?: number; prefix?: string; suffix?: string }
  | { kind: "boolean" }
  | { kind: "creditScore" }
  | { kind: "emergencySavings" }
  | { kind: "collateralGroup" }
  | { kind: "existingLoanGroup" };

export interface QuestionDef {
  id: keyof Answers;
  tier: "must" | "additional";
  label: string;
  help?: string;
  appliesTo?: EmploymentType[]; // undefined = shown to everyone
  visibleIf?: (a: Partial<Answers>) => boolean;
  tightens?: OutputKey[];
  input: InputSpec;
}

const employmentOptions = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self-employed / business owner" },
  { value: "informal", label: "Informal income (gig, daily wage, cash work)" },
];

const productOptions = [
  { value: "personal", label: "Personal loan" },
  { value: "business", label: "Business loan" },
  { value: "lap", label: "Loan against property" },
  { value: "gold", label: "Gold loan" },
  { value: "vehicle", label: "Vehicle loan" },
];

const purposeOptions = [
  { value: "wedding", label: "Wedding" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "home_improvement", label: "Home improvement" },
  { value: "vehicle", label: "Buying a vehicle" },
  { value: "business_expansion", label: "Business / working capital" },
  { value: "debt_consolidation", label: "Paying off existing debt" },
  { value: "other", label: "Other" },
];

const incomeProofOptions = [
  { value: "payslip", label: "Payslip / Form 16" },
  { value: "itr", label: "ITR (income tax return)" },
  { value: "bank_statement", label: "Bank statements only" },
  { value: "none", label: "No formal proof" },
];

export const MUST_QUESTIONS: QuestionDef[] = [
  {
    id: "purpose",
    tier: "must",
    label: "What's this loan for?",
    input: { kind: "select", options: purposeOptions },
  },
  {
    id: "amountWanted",
    tier: "must",
    label: "How much do you want to borrow?",
    input: { kind: "number", prefix: "₹", min: 1000 },
  },
  {
    id: "loanTypeHint",
    tier: "must",
    label: "What type of loan are you thinking of?",
    help: "We may suggest a cheaper option if one applies to you.",
    input: { kind: "select", options: productOptions },
  },
  {
    id: "employmentType",
    tier: "must",
    label: "How do you earn?",
    help: "This changes which questions we ask next — the rest of this form adapts to your answer.",
    input: { kind: "select", options: employmentOptions },
  },
  {
    id: "incomeProofType",
    tier: "must",
    label: "What income proof can you show a lender?",
    help: "Lenders trust some proof more than others — this changes how much they'll offer.",
    input: { kind: "select", options: incomeProofOptions },
  },
  {
    id: "netMonthlyIncome",
    tier: "must",
    label: "What's your net monthly income (take-home, or your best estimate)?",
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "existingEmiTotal",
    tier: "must",
    label: "What's the total of all your existing EMIs per month, if any?",
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "housingCost",
    tier: "must",
    label: "What do you pay monthly for housing (rent)?",
    help: "Enter 0 if you own your home outright or live with family and pay nothing.",
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "monthlyExpenses",
    tier: "must",
    label: "Roughly what are your other monthly household expenses?",
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "age",
    tier: "must",
    label: "What's your age?",
    input: { kind: "number", min: 18, max: 75 },
  },
  {
    id: "creditScore",
    tier: "must",
    label: "Do you know your credit score (CIBIL or similar)?",
    help: "If you don't know it, say so — we won't assume the worst.",
    input: { kind: "creditScore" },
  },
];

export const ADDITIONAL_QUESTIONS: QuestionDef[] = [
  {
    id: "yearsAtCurrentEmployerOrBusiness",
    tier: "additional",
    label: "How many years have you been with your current employer / running this business?",
    tightens: ["verdict", "rate"],
    input: { kind: "number", min: 0, max: 50 },
  },
  {
    id: "variableIncomeSharePct",
    tier: "additional",
    label: "What share of your income is variable (bonus, commission, incentives)?",
    appliesTo: ["salaried"],
    tightens: ["amount"],
    input: { kind: "number", min: 0, max: 100, suffix: "%" },
  },
  {
    id: "incomeStability",
    tier: "additional",
    label: "How would you describe your income month to month?",
    appliesTo: ["self_employed", "informal"],
    tightens: ["amount", "emi"],
    input: {
      kind: "select",
      options: [
        { value: "stable", label: "Fairly stable" },
        { value: "somewhat_variable", label: "Somewhat variable" },
        { value: "highly_variable", label: "Highly variable" },
      ],
    },
  },
  {
    id: "itrAnnualIncome",
    tier: "additional",
    label: "What annual income does your ITR show?",
    appliesTo: ["self_employed"],
    visibleIf: (a) => a.incomeProofType === "itr",
    tightens: ["amount"],
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "cardUtilizationPct",
    tier: "additional",
    label: "Roughly what % of your credit card limit do you usually carry?",
    appliesTo: ["salaried", "self_employed"],
    tightens: ["rate"],
    input: { kind: "number", min: 0, max: 100, suffix: "%" },
  },
  {
    id: "recentBounce",
    tier: "additional",
    label: "Have you missed or bounced an EMI/cheque payment in the last 6 months?",
    tightens: ["verdict", "rate"],
    input: { kind: "boolean" },
  },
  {
    id: "existingLoans",
    tier: "additional",
    label: "Do you have any existing loan or app-loan charging more than 24% interest?",
    help: "Include app-based instant loans, BNPL, or moneylender debt.",
    tightens: ["verdict", "rate"],
    input: { kind: "existingLoanGroup" },
  },
  {
    id: "emergencySavingsMonths",
    tier: "additional",
    label: "If your income stopped today, how many months of expenses could you cover from savings?",
    tightens: ["amount"],
    input: { kind: "emergencySavings" },
  },
  {
    id: "collateral",
    tier: "additional",
    label: "Do you have property or gold you could offer as collateral?",
    appliesTo: ["self_employed", "informal"],
    tightens: ["verdict", "amount", "rate"],
    input: { kind: "collateralGroup" },
  },
  {
    id: "vehiclePrice",
    tier: "additional",
    label: "What's the on-road price of the vehicle you're buying?",
    visibleIf: (a) => a.purpose === "vehicle" || a.loanTypeHint === "vehicle",
    tightens: ["rate"],
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "coApplicantIncome",
    tier: "additional",
    label: "Does anyone else's income count toward this loan (spouse, co-applicant)?",
    help: "Enter their net monthly income, or 0 if none.",
    tightens: ["amount", "emi"],
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "upcomingLargeExpense",
    tier: "additional",
    label: "Any large expense you know is coming up in the next year?",
    help: "Enter the amount, or 0 if none.",
    tightens: ["emi"],
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "loanWillEarnMonthly",
    tier: "additional",
    label: "If this loan is for business use, how much extra could it earn you per month?",
    appliesTo: ["self_employed", "informal"],
    tightens: ["verdict"],
    input: { kind: "number", prefix: "₹", min: 0 },
  },
  {
    id: "offerReceivedRatePct",
    tier: "additional",
    label: "Has a lender already quoted you a rate? If so, what was it?",
    help: "We'll compare it directly on your Negotiation Card.",
    input: { kind: "number", min: 0, max: 60, suffix: "%" },
  },
];

export const ALL_QUESTIONS = [...MUST_QUESTIONS, ...ADDITIONAL_QUESTIONS];
