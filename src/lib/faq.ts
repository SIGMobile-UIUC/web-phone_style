import type { Faq } from "../content/faq";

export const PLACEHOLDERS = ["meeting", "term", "projects"] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];

/** Replaces {{meeting}} / {{term}} / {{projects}} in an answer. Unknown placeholders are left as they are. */
export function fillAnswer(answer: string, values: Record<Placeholder, string>): string {
  return answer.replace(/\{\{(\w+)\}\}/g, (whole, key: string) => (key in values ? values[key as Placeholder] : whole));
}

/** Questions that have not been asked yet, in the order they are written in content/faq.ts. */
export const remainingQuestions = (faq: Faq[], askedIds: string[]): Faq[] => faq.filter((f) => !askedIds.includes(f.id));
