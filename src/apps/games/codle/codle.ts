// Codle (a Wordle-style game) rules, free of React. Words come from src/content/codle.ts.

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/** How one letter of a guess did: right spot, in the word elsewhere, or not in the word (any more). */
export type Mark = "correct" | "present" | "absent";

/**
 * Marks a guess against the answer. Repeated letters count only as often as they appear in the answer, and exact
 * matches claim their letter first: guessing SPEED for ABIDE marks one E present and the other absent.
 */
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(WORD_LENGTH).fill("absent");
  const unmatched = new Map<string, number>();
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) marks[i] = "correct";
    else unmatched.set(answer[i], (unmatched.get(answer[i]) ?? 0) + 1);
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    const left = unmatched.get(guess[i]) ?? 0;
    if (marks[i] === "correct" || left === 0) continue;
    marks[i] = "present";
    unmatched.set(guess[i], left - 1);
  }
  return marks;
}

const RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };

/** The best mark each letter has earned so far, for colouring the on-screen keyboard. */
export function keyMarks(guesses: readonly string[], answer: string): Record<string, Mark> {
  const keys: Record<string, Mark> = {};
  for (const guess of guesses) {
    scoreGuess(guess, answer).forEach((mark, i) => {
      const letter = guess[i];
      if (!keys[letter] || RANK[mark] > RANK[keys[letter]]) keys[letter] = mark;
    });
  }
  return keys;
}

/** Any 5 letters A–Z count as a guess; with a small themed word list, a dictionary check would only frustrate. */
export const isGuess = (text: string) => new RegExp(`^[A-Z]{${WORD_LENGTH}}$`).test(text);

/** A random index into a list of `count` words, different from `previous` when there is a choice. */
export function pickIndex(count: number, previous: number | null, rand: () => number = Math.random): number {
  if (count <= 1 || previous === null) return Math.floor(rand() * count);
  const i = Math.floor(rand() * (count - 1));
  return i >= previous ? i + 1 : i;
}
