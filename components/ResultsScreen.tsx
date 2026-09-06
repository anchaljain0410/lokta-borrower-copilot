"use client";

import { Answers, EvaluationResult } from "@/lib/types";
import { formatINR, PRODUCT_LABELS, VERDICT_LABELS } from "@/lib/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

const VERDICT_STYLES: Record<EvaluationResult["verdict"]["verdict"], string> = {
  borrow: "bg-emerald-50 border-emerald-200 text-emerald-900",
  borrow_less: "bg-amber-50 border-amber-200 text-amber-900",
  dont_borrow: "bg-rose-50 border-rose-200 text-rose-900",
};

export function ResultsScreen({
  answers,
  result,
  onShowCard,
  onRestart,
  onEditLast,
}: {
  answers: Answers;
  result: EvaluationResult;
  onShowCard: () => void;
  onRestart: () => void;
  onEditLast: () => void;
}) {
  const { verdict, amount, rate, emi } = result;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Your results</h1>
        <div className="flex gap-4">
          <button onClick={onEditLast} className="text-sm text-slate-500 hover:text-slate-900">
            Edit last answer
          </button>
          <button onClick={onRestart} className="text-sm text-slate-500 hover:text-slate-900">
            Start over
          </button>
        </div>
      </div>

      <section className={`rounded-xl border p-5 ${VERDICT_STYLES[verdict.verdict]}`}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">{VERDICT_LABELS[verdict.verdict]}</h2>
          <ConfidenceBadge level={verdict.confidence} />
        </div>
        <p className="text-sm">{verdict.reason}</p>
        {verdict.alternative && <p className="mt-2 text-sm font-medium">→ {verdict.alternative}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">How much</h2>
          <ConfidenceBadge level={amount.confidence} />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">A lender may offer</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{formatINR(amount.lenderMax)}</div>
          </div>
          <div className="rounded-lg bg-slate-900 p-3 text-white">
            <div className="text-xs uppercase tracking-wide text-slate-300">You should ask for</div>
            <div className="mt-1 text-lg font-semibold">{formatINR(amount.recommended)}</div>
          </div>
        </div>
        <p className="text-sm text-slate-600">{amount.reason}</p>
        <p className="mt-1 text-xs text-slate-400">Shown with roughly ±{amount.rangeWidthPct}% uncertainty given what you&apos;ve told us.</p>
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Fair rate — {PRODUCT_LABELS[rate.product]}</h2>
          <ConfidenceBadge level={rate.confidence} />
        </div>
        <div className="mb-2 flex flex-wrap gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Nominal rate</div>
            <div className="text-lg font-semibold text-slate-900">
              {rate.nominalBand.low}% – {rate.nominalBand.high}%
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">All-in (APR)</div>
            <div className="text-lg font-semibold text-slate-900">
              {rate.aprBand.low}% – {rate.aprBand.high}%
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600">{rate.reason}</p>
        {answers.offerReceivedRatePct !== undefined && (
          <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm">
            You were quoted <b>{answers.offerReceivedRatePct}%</b> —{" "}
            {answers.offerReceivedRatePct > rate.nominalBand.high
              ? "that's above fair for your profile. Push back."
              : "that's within (or below) fair for your profile."}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Monthly EMI ceiling</h2>
          <ConfidenceBadge level={emi.confidence} />
        </div>
        <div className="mb-3 text-2xl font-semibold text-slate-900">{formatINR(emi.ceiling)}/month</div>
        <p className="mb-3 text-sm text-slate-600">{emi.reason}</p>
        <div className="mb-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                <th className="pb-1 pr-4">Tenure</th>
                <th className="pb-1">EMI at recommended amount</th>
              </tr>
            </thead>
            <tbody>
              {emi.tenureOptions.map((t) => (
                <tr key={t.years} className="border-t border-slate-100">
                  <td className="py-1.5 pr-4">{t.years} yrs</td>
                  <td className="py-1.5">{formatINR(t.emi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`rounded-lg p-3 text-sm ${emi.stress.holds ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          <b>Stress check:</b> {emi.stress.description} —{" "}
          {emi.stress.holds
            ? "you'd still be within your safe ceiling."
            : `you'd need to drop to about ${formatINR(emi.stress.adjustedPrincipal ?? 0)} to stay safe.`}
        </div>
      </section>

      <button onClick={onShowCard} className="rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white">
        Show my Negotiation Card
      </button>
    </div>
  );
}
