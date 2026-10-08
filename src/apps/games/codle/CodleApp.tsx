import { CornerDownLeft, Delete } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { codleWords } from "../../../content/codle";
import AppFrame from "../../../ui/AppFrame";
import { isGuess, keyMarks, MAX_GUESSES, pickIndex, scoreGuess, WORD_LENGTH, type Mark } from "./codle";
import "./codle.css";

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "+ZXCVBNM-"]; // + = Enter, - = Backspace
const PRAISE = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];

type Round = { index: number; guesses: string[]; typed: string };

const newRound = (previous: number | null = null): Round => ({ index: pickIndex(codleWords.length, previous), guesses: [], typed: "" });

/** Codle: guess the 5-letter CS / mobile word in six tries (Wordle-style). Logic in codle.ts, words in content/codle.ts. */
export default function CodleApp() {
  const [round, setRound] = useState(() => newRound());
  const [toast, setToast] = useState<string | null>(null);
  /** The row that was rejected, and a counter so the shake replays on every rejection. */
  const [shake, setShake] = useState({ row: -1, n: 0 });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { word: answer, hint } = codleWords[round.index];
  const won = round.guesses.at(-1) === answer;
  const done = won || round.guesses.length === MAX_GUESSES;
  const keys = keyMarks(round.guesses, answer);

  const say = (text: string) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const next = () => {
    setRound(newRound(round.index));
    setShake((s) => ({ row: -1, n: s.n }));
  };

  const press = (key: string) => {
    if (done) {
      if (key === "Enter") next();
      return;
    }
    if (key === "Backspace") setRound((r) => ({ ...r, typed: r.typed.slice(0, -1) }));
    else if (key === "Enter") {
      if (!isGuess(round.typed)) {
        say("Not enough letters");
        setShake((s) => ({ row: round.guesses.length, n: s.n + 1 }));
        return;
      }
      setRound((r) => ({ ...r, guesses: [...r.guesses, r.typed], typed: "" }));
    } else if (/^[A-Z]$/.test(key)) setRound((r) => (r.typed.length < WORD_LENGTH ? { ...r, typed: r.typed + key } : r));
  };

  const latest = useRef(press);
  useEffect(() => {
    latest.current = press;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (key !== "Enter" && key !== "Backspace" && !/^[A-Z]$/.test(key)) return;
      e.preventDefault(); // also stops Enter from clicking a focused button a second time
      latest.current(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AppFrame title="Codle">
      <div className="codle__grid">
        {Array.from({ length: MAX_GUESSES }, (_, row) => {
          const guess = round.guesses[row];
          const marks: (Mark | undefined)[] = guess ? scoreGuess(guess, answer) : [];
          const letters = guess ?? (row === round.guesses.length ? round.typed : "");
          const shaking = !guess && row === shake.row;
          return (
            <div
              key={shaking ? `row${row}-${shake.n}` : `row${row}`}
              className={`codle__row${shaking ? " is-shaking" : ""}`}
              aria-label={guess ? `${guess}: ${marks.join(", ")}` : undefined}
            >
              {Array.from({ length: WORD_LENGTH }, (_, i) => (
                <span
                  key={i}
                  className={`codle__tile${marks[i] ? ` is-${marks[i]}` : letters[i] ? " is-filled" : ""}`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {letters[i]}
                </span>
              ))}
            </div>
          );
        })}
        {toast && (
          <div className="codle__toast" role="status">
            {toast}
          </div>
        )}
      </div>

      {done ? (
        <div className="ui-card codle__result" role="status">
          <div className="codle__result-title">{won ? PRAISE[round.guesses.length - 1] : "Out of guesses"}</div>
          <div className="codle__answer">{answer}</div>
          <p className="ui-card__text">{hint}</p>
          <button type="button" className="ui-button" onClick={next}>
            Next word
          </button>
        </div>
      ) : (
        <div className="codle__keys" role="group" aria-label="Keyboard">
          {KEY_ROWS.map((row) => (
            <div className="codle__keyrow" key={row}>
              {[...row].map((k) => {
                const key = k === "+" ? "Enter" : k === "-" ? "Backspace" : k;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`codle__key${k === "+" || k === "-" ? " codle__key--wide" : ""}${keys[k] ? ` is-${keys[k]}` : ""}`}
                    aria-label={k === "+" ? "Enter" : k === "-" ? "Delete letter" : k}
                    onMouseDown={(e) => e.preventDefault()} // keep focus off the key, so a physical Enter doesn't press it again
                    onClick={() => press(key)}
                  >
                    {k === "+" ? <CornerDownLeft aria-hidden /> : k === "-" ? <Delete aria-hidden /> : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </AppFrame>
  );
}
