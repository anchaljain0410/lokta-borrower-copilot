"use client";

import { Answers } from "@/lib/types";
import { nextQuestion, progress } from "@/lib/questions/flow";
import {
  NumberInput,
  SelectInput,
  BooleanInput,
  CreditScoreInput,
  EmergencySavingsInput,
  CollateralInput,
  ExistingLoanInput,
} from "./QuestionInputs";

export function QuestionFlow({
  answers,
  history,
  onAnswer,
  onBack,
}: {
  answers: Partial<Answers>;
  history: (keyof Answers)[];
  onAnswer: <K extends keyof Answers>(id: K, value: Answers[K]) => void;
  onBack: () => void;
}) {
  const question = nextQuestion(answers);
  const { answered, total, onMustTier } = progress(answers);

  if (!question) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${total ? Math.round((answered / total) * 100) : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{onMustTier ? "The essentials" : "Optional — tightens your numbers"}</span>
          <span>
            {answered + 1} of {total}
          </span>
        </div>
      </div>

      <div key={question.id} className="animate-question-in flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">{question.label}</h2>
          {question.help && <p className="text-sm text-slate-500">{question.help}</p>}
        </div>
        <div>
          {question.input.kind === "select" && (
            <SelectInput options={question.input.options} onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
          {question.input.kind === "number" && (
            <NumberInput
              prefix={question.input.prefix}
              suffix={question.input.suffix}
              min={question.input.min}
              max={question.input.max}
              onSubmit={(v) => onAnswer(question.id, v as never)}
            />
          )}
          {question.input.kind === "boolean" && (
            <BooleanInput onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
          {question.input.kind === "creditScore" && (
            <CreditScoreInput onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
          {question.input.kind === "emergencySavings" && (
            <EmergencySavingsInput onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
          {question.input.kind === "collateralGroup" && (
            <CollateralInput onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
          {question.input.kind === "existingLoanGroup" && (
            <ExistingLoanInput onSubmit={(v) => onAnswer(question.id, v as never)} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {history.length > 0 ? (
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">
            ← Back
          </button>
        ) : (
          <span />
        )}
        {!onMustTier && (
          <button
            onClick={() => onAnswer(question.id, undefined as never)}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Skip — I don&apos;t know
          </button>
        )}
      </div>
    </div>
  );
}
