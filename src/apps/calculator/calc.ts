// Calculator engine (pure, no UI). Behaves like the phone calculator: operations run left to right
// ("2 + 3 × 4 =" is 20), pressing "=" again repeats the last operation, and results show at most 9 digits.

export type Op = "+" | "−" | "×" | "÷";

export type CalcState = {
  /** What the screen shows, unformatted (no thousands separators). */
  display: string;
  /** Left-hand value waiting for the next number, once an operator was pressed. */
  acc: number | null;
  op: Op | null;
  /** The next digit starts a new number instead of extending the display. */
  fresh: boolean;
  /** For repeated "=": the operator and right-hand value of the last calculation. */
  last: { op: Op; operand: number } | null;
};

export type CalcAction =
  | { type: "digit"; digit: string }
  | { type: "dot" }
  | { type: "op"; op: Op }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "negate" }
  | { type: "percent" };

export const initialCalc: CalcState = { display: "0", acc: null, op: null, fresh: false, last: null };

const MAX_DIGITS = 9;
const ERROR = "Error";

function apply(a: number, op: Op, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return a / b;
  }
}

/** A number as the screen shows it: at most 9 significant digits, no float noise (0.1+0.2 -> "0.3"). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return ERROR;
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e9 || abs < 1e-6)) return n.toExponential(MAX_DIGITS - 1).replace(/\.?0+e/, "e");
  return String(Number(n.toPrecision(MAX_DIGITS)));
}

/** "1234567.5" -> "1,234,567.5" (display only). */
export function withCommas(display: string): string {
  if (display === ERROR || display.includes("e")) return display;
  const [int, frac] = display.split(".");
  const sign = int.startsWith("-") ? "-" : "";
  const grouped = int.replace("-", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac === undefined ? sign + grouped : `${sign}${grouped}.${frac}`;
}

const isError = (s: CalcState) => s.display === ERROR;
const show = (s: CalcState, n: number): CalcState => ({ ...s, display: formatNumber(n) });
const digitCount = (d: string) => d.replace(/[-.]/g, "").length;

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  const s = isError(state) ? initialCalc : state; // any key after an error starts over

  switch (action.type) {
    case "digit": {
      if (s.fresh) return { ...s, display: action.digit, fresh: false };
      if (s.display === "0") return { ...s, display: action.digit };
      if (digitCount(s.display) >= MAX_DIGITS) return s;
      return { ...s, display: s.display + action.digit };
    }

    case "dot": {
      if (s.fresh) return { ...s, display: "0.", fresh: false };
      if (s.display.includes(".")) return s;
      return { ...s, display: s.display + "." };
    }

    case "op": {
      // Changing your mind about the operator before typing the next number just swaps it.
      if (s.acc !== null && s.op !== null && s.fresh) return { ...s, op: action.op };
      const current = Number(s.display);
      const acc = s.acc !== null && s.op !== null ? apply(s.acc, s.op, current) : current;
      if (!Number.isFinite(acc)) return { ...initialCalc, display: ERROR };
      return { display: formatNumber(acc), acc, op: action.op, fresh: true, last: null };
    }

    case "equals": {
      const current = Number(s.display);
      let result: number;
      let last = s.last;
      if (s.op !== null && s.acc !== null) {
        const operand = s.fresh ? s.acc : current; // "5 + =" uses 5 on both sides
        result = apply(s.acc, s.op, operand);
        last = { op: s.op, operand };
      } else if (s.last) {
        result = apply(current, s.last.op, s.last.operand);
      } else {
        return s;
      }
      if (!Number.isFinite(result)) return { ...initialCalc, display: ERROR };
      return { display: formatNumber(result), acc: null, op: null, fresh: true, last };
    }

    case "clear":
      // "C" clears just the number being typed; once it is already clear ("AC") everything resets.
      return s.display !== "0" && !s.fresh ? { ...s, display: "0" } : initialCalc;

    case "negate":
      return s.display === "0" ? s : { ...s, display: s.display.startsWith("-") ? s.display.slice(1) : `-${s.display}` };

    case "percent":
      return { ...show(s, Number(s.display) / 100), fresh: true };
  }
}

/** The clear key reads "C" while there is something typed to clear, otherwise "AC". */
export const clearLabel = (s: CalcState): "C" | "AC" => (s.display !== "0" && !s.fresh && !isError(s) ? "C" : "AC");
