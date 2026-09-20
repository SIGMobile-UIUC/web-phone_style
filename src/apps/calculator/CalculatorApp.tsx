import { useEffect, useReducer } from "react";
import { useStatusBarStyle } from "../../system/useStatusBarStyle";
import { calcReducer, clearLabel, initialCalc, withCommas, type CalcAction, type Op } from "./calc";
import "./calculator.css";

type Key = { label: string; aria?: string; action: CalcAction | "clear"; kind: "fn" | "op" | "num"; wide?: boolean };

const digit = (d: string): Key => ({ label: d, action: { type: "digit", digit: d }, kind: "num" });
const op = (o: Op, aria: string): Key => ({ label: o, aria, action: { type: "op", op: o }, kind: "op" });

// Rows of the keypad, top to bottom. The first key's label ("AC"/"C") is filled in from the state.
const rows: Key[][] = [
  [{ label: "AC", action: "clear", kind: "fn" }, { label: "±", aria: "plus minus", action: { type: "negate" }, kind: "fn" }, { label: "%", aria: "percent", action: { type: "percent" }, kind: "fn" }, op("÷", "divide")],
  [digit("7"), digit("8"), digit("9"), op("×", "multiply")],
  [digit("4"), digit("5"), digit("6"), op("−", "subtract")],
  [digit("1"), digit("2"), digit("3"), op("+", "add")],
  [{ ...digit("0"), wide: true }, { label: ".", aria: "decimal point", action: { type: "dot" }, kind: "num" }, { label: "=", aria: "equals", action: { type: "equals" }, kind: "op" }],
];

const KEYBOARD: Record<string, CalcAction> = {
  ".": { type: "dot" }, "+": { type: "op", op: "+" }, "-": { type: "op", op: "−" }, "*": { type: "op", op: "×" }, "/": { type: "op", op: "÷" },
  "=": { type: "equals" }, Enter: { type: "equals" }, "%": { type: "percent" }, c: { type: "clear" }, C: { type: "clear" },
};

/** A working calculator (logic in calc.ts). Also responds to the keyboard. */
export default function CalculatorApp() {
  useStatusBarStyle("light");
  const [state, dispatch] = useReducer(calcReducer, initialCalc);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) dispatch({ type: "digit", digit: e.key });
      else if (KEYBOARD[e.key]) dispatch(KEYBOARD[e.key]);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const text = withCommas(state.display);
  // Long numbers shrink so they always fit on one line.
  const size = text.length <= 6 ? 88 : text.length <= 8 ? 74 : text.length <= 10 ? 60 : 48;

  return (
    <div className="calc">
      <div className="calc__display" role="status" aria-label="Display" style={{ fontSize: `calc(${size} * var(--u))` }}>
        {text}
      </div>
      <div className="calc__pad">
        {rows.flat().map((k) => {
          const isClear = k.action === "clear";
          const label = isClear ? clearLabel(state) : k.label;
          const active = k.kind === "op" && k.label === state.op && state.fresh;
          return (
            <button
              key={k.label + (k.aria ?? "")}
              type="button"
              className={`calc-key calc-key--${k.kind}${k.wide ? " calc-key--wide" : ""}${active ? " is-active" : ""}`}
              aria-label={isClear ? (label === "C" ? "clear entry" : "all clear") : k.aria}
              onClick={() => dispatch(isClear ? { type: "clear" } : (k.action as CalcAction))}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
