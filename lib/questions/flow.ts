// Adaptive sequencing: filters the question bank by employment branch and
// by each question's own visibleIf, then hands back whatever's next.
// Must-tier questions are listed first in schema.ts, so employmentType
// (which gates every appliesTo filter) is always answered before any
// additional-tier question is ever reached.

import { Answers } from "../types";
import { QuestionDef, MUST_QUESTIONS, ADDITIONAL_QUESTIONS } from "./schema";

export function isVisible(q: QuestionDef, answers: Partial<Answers>): boolean {
  if (q.appliesTo && answers.employmentType && !q.appliesTo.includes(answers.employmentType)) {
    return false;
  }
  if (q.visibleIf && !q.visibleIf(answers)) {
    return false;
  }
  return true;
}

// Presence, not value, marks a question as resolved — "skip, I don't
// know" stores the key with an explicit `undefined` value so the flow
// moves on, while a key that was never touched stays entirely absent.
export function isAnswered(answers: Partial<Answers>, id: keyof Answers): boolean {
  return id in answers;
}

export function visibleQuestions(answers: Partial<Answers>): QuestionDef[] {
  return [...MUST_QUESTIONS, ...ADDITIONAL_QUESTIONS].filter((q) => isVisible(q, answers));
}

export function nextQuestion(answers: Partial<Answers>): QuestionDef | null {
  return visibleQuestions(answers).find((q) => !isAnswered(answers, q.id)) ?? null;
}

export function progress(answers: Partial<Answers>): { answered: number; total: number; onMustTier: boolean } {
  const visible = visibleQuestions(answers);
  const answered = visible.filter((q) => isAnswered(answers, q.id)).length;
  const next = nextQuestion(answers);
  return {
    answered,
    total: visible.length,
    onMustTier: next ? next.tier === "must" : false,
  };
}

export function isMustTierComplete(answers: Partial<Answers>): boolean {
  return MUST_QUESTIONS.every((q) => isAnswered(answers, q.id));
}

export function assertMustTierComplete(answers: Partial<Answers>): asserts answers is Answers {
  if (!isMustTierComplete(answers)) {
    throw new Error("Must-tier questions are not yet complete.");
  }
}
