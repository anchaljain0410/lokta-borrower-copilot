"use client";

import { useMemo, useState } from "react";
import { Answers } from "@/lib/types";
import { evaluate } from "@/lib/engine/evaluate";
import { isMustTierComplete, nextQuestion, assertMustTierComplete } from "@/lib/questions/flow";
import { QuestionFlow } from "@/components/QuestionFlow";
import { ResultsScreen } from "@/components/ResultsScreen";
import { NegotiationCard } from "@/components/NegotiationCard";

type Phase = "intro" | "questions" | "checkpoint" | "results" | "card";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [history, setHistory] = useState<(keyof Answers)[]>([]);

  function handleAnswer<K extends keyof Answers>(id: K, value: Answers[K]) {
    const wasMustComplete = isMustTierComplete(answers);
    const updated: Partial<Answers> = { ...answers, [id]: value };
    setAnswers(updated);
    setHistory((h) => [...h, id]);

    if (!wasMustComplete && isMustTierComplete(updated)) {
      setPhase("checkpoint");
    } else if (!nextQuestion(updated)) {
      setPhase("results");
    }
  }

  function popLastAnswer() {
    const last = history[history.length - 1];
    if (last === undefined) return;
    setAnswers((a) => {
      const copy = { ...a };
      delete copy[last];
      return copy;
    });
    setHistory((h) => h.slice(0, -1));
  }

  function handleBack() {
    popLastAnswer();
  }

  function handleEditLast() {
    popLastAnswer();
    setPhase("questions");
  }

  function handleRestart() {
    setPhase("intro");
    setAnswers({});
    setHistory([]);
  }

  const result = useMemo(() => {
    if (phase !== "results" && phase !== "card") return null;
    assertMustTierComplete(answers);
    return evaluate(answers);
  }, [phase, answers]);

  if (phase === "intro") {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center gap-6 px-5 py-16">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Borrower Copilot</span>
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            Know what&apos;s fair before you walk into a branch.
          </h1>
          <p className="text-base text-slate-600">
            Answer some questions about your income and expenses. No login, no bureau pull, nothing saved —
            you&apos;ll get a verdict, a safe amount, a fair rate, and an EMI ceiling you can hold a lender to.
          </p>
        </div>
        <button
          onClick={() => setPhase("questions")}
          className="rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white"
        >
          Get started
        </button>
        <p className="text-xs text-slate-400">
          Takes about 3–5 minutes. Answering a few extra questions can tighten your ranges — you can stop any time.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "Verdict", desc: "Borrow, borrow less, or don't" },
            { label: "Amount", desc: "Lender max vs. what's safe" },
            { label: "Fair rate", desc: "A band, plus all-in APR" },
            { label: "EMI ceiling", desc: "With a stress-test check" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-900">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "questions") {
    return <QuestionFlow answers={answers} history={history} onAnswer={handleAnswer} onBack={handleBack} />;
  }

  if (phase === "checkpoint") {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Got the essentials.</h2>
        <p className="text-sm text-slate-600">
          We can show your results now — with wider ranges since we don&apos;t know much about you yet — or you can
          answer a few optional questions to tighten every number.
        </p>
        <button onClick={() => setPhase("questions")} className="rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white">
          Answer more questions
        </button>
        <button onClick={() => setPhase("results")} className="rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700">
          See my results now
        </button>
      </div>
    );
  }

  if (phase === "results" && result) {
    assertMustTierComplete(answers);
    return (
      <ResultsScreen
        answers={answers}
        result={result}
        onShowCard={() => setPhase("card")}
        onRestart={handleRestart}
        onEditLast={handleEditLast}
      />
    );
  }

  if (phase === "card" && result) {
    assertMustTierComplete(answers);
    return <NegotiationCard answers={answers} result={result} onBack={() => setPhase("results")} />;
  }

  return null;
}
