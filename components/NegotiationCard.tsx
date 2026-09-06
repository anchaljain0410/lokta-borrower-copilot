"use client";

import { Answers, EvaluationResult } from "@/lib/types";
import { formatINR, PRODUCT_LABELS, VERDICT_LABELS } from "@/lib/format";

export function NegotiationCard({
  answers,
  result,
  onBack,
}: {
  answers: Answers;
  result: EvaluationResult;
  onBack: () => void;
}) {
  const { verdict, amount, rate, emi } = result;

  const shareText = [
    "Borrower Copilot — Negotiation Card",
    `Verdict: ${VERDICT_LABELS[verdict.verdict]}`,
    verdict.alternative ? `→ ${verdict.alternative}` : null,
    `Ask for: ${formatINR(amount.recommended)} | Max EMI: ${formatINR(emi.ceiling)}/mo`,
    `Fair rate: ${rate.nominalBand.low}%–${rate.nominalBand.high}% (APR ${rate.aprBand.low}%–${rate.aprBand.high}%)`,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 py-10">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to results
        </button>
        <div className="flex gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Share on WhatsApp
          </a>
          <button onClick={() => window.print()} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-900 p-6">
        <div className="mb-4 flex flex-col gap-0.5 border-b border-slate-200 pb-3">
          <h1 className="text-lg font-bold text-slate-900">Negotiation Card</h1>
          <span className="text-xs uppercase tracking-wide text-slate-500">{PRODUCT_LABELS[rate.product]}</span>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Verdict</div>
          <div className="text-base font-semibold text-slate-900">{VERDICT_LABELS[verdict.verdict]}</div>
          <p className="mt-1 text-sm text-slate-600">{verdict.reason}</p>
          {verdict.alternative && <p className="mt-1 text-sm font-medium text-slate-900">→ {verdict.alternative}</p>}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Ask for</div>
            <div className="text-xl font-bold text-slate-900">{formatINR(amount.recommended)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Max EMI</div>
            <div className="text-xl font-bold text-slate-900">{formatINR(emi.ceiling)}/mo</div>
          </div>
        </div>

        <div className="mb-4 border-t border-slate-200 pt-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Fair for your profile</div>
          <div className="text-xl font-bold text-slate-900">
            {rate.nominalBand.low}% – {rate.nominalBand.high}%
          </div>
          <div className="text-sm text-slate-600">
            All-in cost (APR) {rate.aprBand.low}% – {rate.aprBand.high}% — includes processing fee
          </div>
        </div>

        {answers.offerReceivedRatePct !== undefined && (
          <div className="mb-4 rounded-lg bg-slate-900 p-3 text-sm text-white">
            Lender quoted <b>{answers.offerReceivedRatePct}%</b> — fair for me is{" "}
            <b>
              {rate.nominalBand.low}–{rate.nominalBand.high}%
            </b>
            .{" "}
            {answers.offerReceivedRatePct > rate.nominalBand.high
              ? "That quote is above fair. I'd like it revised."
              : "That quote is within fair range."}
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
          Based on your income, obligations and credit profile as you described them. Not a loan offer — a
          self-assessment to negotiate with.
        </div>
      </div>
    </div>
  );
}
