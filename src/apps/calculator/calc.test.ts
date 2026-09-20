import { expect, test } from "bun:test";
import { calcReducer, clearLabel, formatNumber, initialCalc, withCommas, type CalcAction, type CalcState } from "./calc";

/** Presses keys written as "2 + 3 =" (digits, ".", + − × ÷, =, C, ±, %). */
function press(keys: string): CalcState {
  const map: Record<string, CalcAction> = {
    ".": { type: "dot" }, "=": { type: "equals" }, C: { type: "clear" }, "±": { type: "negate" }, "%": { type: "percent" },
    "+": { type: "op", op: "+" }, "−": { type: "op", op: "−" }, "×": { type: "op", op: "×" }, "÷": { type: "op", op: "÷" },
  };
  return keys.replace(/\s/g, "").split("").reduce((s, k) => calcReducer(s, map[k] ?? { type: "digit", digit: k }), initialCalc);
}
const shown = (keys: string) => press(keys).display;

test("basic arithmetic", () => {
  expect(shown("2+3=")).toBe("5");
  expect(shown("9−4=")).toBe("5");
  expect(shown("6×7=")).toBe("42");
  expect(shown("8÷4=")).toBe("2");
});

test("no floating-point noise", () => {
  expect(shown("0.1+0.2=")).toBe("0.3");
  expect(formatNumber(0.1 + 0.2)).toBe("0.3");
  expect(formatNumber(1 / 3)).toBe("0.333333333");
});

test("operations run left to right, like the phone calculator", () => {
  expect(shown("2+3×4=")).toBe("20");
  expect(shown("2+3×")).toBe("5"); // pressing the next operator shows the running result
});

test("changing the operator before the next number swaps it", () => {
  expect(shown("5+×3=")).toBe("15");
});

test("'=' repeats the last operation; '5 + =' uses 5 on both sides", () => {
  expect(shown("2+3==")).toBe("8");
  expect(shown("2+3===")).toBe("11");
  expect(shown("5+=")).toBe("10");
});

test("typing a number after '=' starts a new calculation", () => {
  expect(shown("2+3=7+1=")).toBe("8");
});

test("digits and the decimal point", () => {
  expect(shown("007")).toBe("7");
  expect(shown("1.5")).toBe("1.5");
  expect(shown("1.2.3")).toBe("1.23"); // second dot ignored
  expect(shown(".5")).toBe("0.5");
  expect(shown("1234567890")).toBe("123456789"); // 9 digits max
});

test("sign and percent", () => {
  expect(shown("5±")).toBe("-5");
  expect(shown("5±±")).toBe("5");
  expect(shown("50%")).toBe("0.5");
  expect(shown("0±")).toBe("0");
});

test("division by zero is an error, and the next key starts over", () => {
  expect(shown("9÷0=")).toBe("Error");
  expect(shown("9÷0=4")).toBe("4");
});

test("C clears the entry, then AC clears everything", () => {
  const typing = press("5+7");
  expect(clearLabel(typing)).toBe("C");
  const afterC = calcReducer(typing, { type: "clear" });
  expect(afterC.display).toBe("0");
  expect(afterC.op).toBe("+"); // the pending "5 +" survives a C
  expect(clearLabel(afterC)).toBe("AC");
  expect(calcReducer(afterC, { type: "clear" })).toEqual(initialCalc);
});

test("big and tiny results use exponents; thousands separators are display-only", () => {
  expect(shown("999999999×9=")).toBe("8.99999999e+9"); // 8,999,999,991 has 10 digits: keep 9 significant
  expect(formatNumber(1e21)).toBe("1e+21");
  expect(formatNumber(0.0000005)).toBe("5e-7");
  expect(withCommas("1234567.5")).toBe("1,234,567.5");
  expect(withCommas("-1000")).toBe("-1,000");
  expect(withCommas("12")).toBe("12");
  expect(withCommas("Error")).toBe("Error");
});
