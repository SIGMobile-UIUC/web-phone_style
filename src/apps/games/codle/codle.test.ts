import { expect, test } from "bun:test";
import { isGuess, keyMarks, pickIndex, scoreGuess } from "./codle";

const short = (guess: string, answer: string) =>
  scoreGuess(guess, answer)
    .map((m) => (m === "correct" ? "G" : m === "present" ? "Y" : "-"))
    .join("");

test("letters are marked correct, present or absent", () => {
  expect(short("SWIFT", "SWIFT")).toBe("GGGGG");
  expect(short("REACT", "TRACE")).toBe("YYGGY");
  expect(short("MUTEX", "SWIFT")).toBe("--Y--");
});

test("repeated letters count only as often as they are in the answer", () => {
  expect(short("SPEED", "ABIDE")).toBe("--Y-Y"); // one E in ABIDE: the first E gets it
  expect(short("EERIE", "THERE")).toBe("Y-Y-G"); // the exact match claims an E first
  expect(short("ARRAY", "RADAR")).toBe("YYYG-"); // two Rs in RADAR, so both R guesses count
  expect(short("LLAMA", "HELLO")).toBe("YY---");
});

test("the keyboard shows each letter's best mark so far", () => {
  const keys = keyMarks(["TRACE", "REACT"], "REACT");
  expect(keys.R).toBe("correct"); // present in TRACE, correct in REACT
  expect(keys.T).toBe("correct");
  expect(keyMarks(["MUTEX"], "SWIFT")).toEqual({ M: "absent", U: "absent", T: "present", E: "absent", X: "absent" });
});

test("a guess is any five letters A–Z", () => {
  expect(isGuess("XCODE")).toBe(true);
  expect(isGuess("ABCDE")).toBe(true);
  expect(isGuess("CODE")).toBe(false);
  expect(isGuess("C0DES")).toBe(false);
  expect(isGuess("codes")).toBe(false);
});

test("the next word is never the same as the last one", () => {
  expect(pickIndex(100, null, () => 0.5)).toBe(50);
  for (const r of [0, 0.3, 0.999]) expect(pickIndex(3, 0, () => r)).not.toBe(0);
  expect(pickIndex(3, 1, () => 0.5)).toBe(2);
  expect(pickIndex(1, 0, () => 0.7)).toBe(0);
});
