import { expect, test } from "bun:test";
import { faq } from "../content/faq";
import { PLACEHOLDERS, fillAnswer, remainingQuestions } from "./faq";

const values = { meeting: "Wednesdays 6:00–8:00 PM CT · Location TBA", term: "Fall 2026", projects: "A, B" };

test("placeholders are filled; unknown ones are left alone", () => {
  expect(fillAnswer("We meet {{meeting}}.", values)).toBe("We meet Wednesdays 6:00–8:00 PM CT · Location TBA.");
  expect(fillAnswer("{{term}}: {{projects}}", values)).toBe("Fall 2026: A, B");
  expect(fillAnswer("Hello {{nope}}", values)).toBe("Hello {{nope}}");
});

test("remaining questions shrink as they are asked", () => {
  expect(remainingQuestions(faq, []).length).toBe(faq.length);
  expect(remainingQuestions(faq, [faq[0].id]).map((f) => f.id)).not.toContain(faq[0].id);
  expect(remainingQuestions(faq, faq.map((f) => f.id))).toEqual([]);
});

test("content/faq.ts: unique ids, real text, only known placeholders", () => {
  expect(new Set(faq.map((f) => f.id)).size).toBe(faq.length);
  for (const f of faq) {
    expect(f.question.trim(), `question of "${f.id}"`).not.toBe("");
    expect(f.answer.trim(), `answer of "${f.id}"`).not.toBe("");
    for (const m of f.answer.matchAll(/\{\{(\w+)\}\}/g)) {
      expect(PLACEHOLDERS as readonly string[], `unknown placeholder {{${m[1]}}} in "${f.id}"`).toContain(m[1]);
    }
  }
});
