import { useEffect, useRef, useState } from "react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import logo from "../../assets/logo_white.png";
import { faq, greeting, type Faq } from "../../content/faq";
import { site } from "../../content/site";
import { terms } from "../../content/terms";
import { fillAnswer, remainingQuestions } from "../../lib/faq";
import { formatPlace, formatTermLabel, formatTimeRange, formatWeekdayPlural } from "../../lib/format";
import { nextMeeting } from "../../lib/schedule";
import { useReducedMotionPref } from "../../system/PrefsProvider";
import "./messages.css";

type Message = { id: number; from: "me" | "bot"; text: string; cta?: Faq["cta"] };

const CTA = {
  discord: { label: "Join our Discord", href: site.links.discord, Icon: FaDiscord },
  instagram: { label: "Follow us on Instagram", href: site.links.instagram, Icon: FaInstagram },
} as const;

/** The values that answers can reference ({{meeting}}, {{term}}, {{projects}}). */
function answerValues() {
  const next = nextMeeting(terms, new Date());
  const term = terms[0];
  return {
    meeting: next
      ? `${formatWeekdayPlural(next.occurrence.start)} ${formatTimeRange(next.occurrence)} · ${formatPlace(next.occurrence.place)}`
      : "not scheduled yet — check back soon",
    term: formatTermLabel(term),
    projects: term.projects.map((p) => p.name).join(", "),
  };
}

/** A scripted "Join us" chat: tap a question, get an answer (with a typing pause first). Wording: content/faq.ts. */
export default function MessagesApp() {
  const reduced = useReducedMotionPref();
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: greeting }]);
  const [asked, setAsked] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, typing, reduced]);

  const ask = (q: Faq) => {
    if (typing) return;
    setAsked((a) => [...a, q.id]);
    setMessages((m) => [...m, { id: m.length, from: "me", text: q.question }]);
    setTyping(true);
    timer.current = window.setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [...m, { id: m.length, from: "bot", text: fillAnswer(q.answer, answerValues()), cta: q.cta }]);
      },
      reduced ? 150 : 850,
    );
  };

  const left = remainingQuestions(faq, asked);

  return (
    <div className="msg">
      <header className="msg__head">
        <span className="msg__avatar">
          <img src={logo} alt="" />
        </span>
        <div className="msg__who">SIGMobile</div>
        <div className="msg__sub">Join us</div>
      </header>

      <div className="msg__list" ref={listRef} role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((m) => (
          <div className={`msg-row msg-row--${m.from}`} key={m.id}>
            <div className="msg-bubble">{m.text}</div>
            {m.cta && (
              <a className="msg-cta" href={CTA[m.cta].href} target="_blank" rel="noopener noreferrer">
                {(() => {
                  const { Icon } = CTA[m.cta!];
                  return <Icon aria-hidden />;
                })()}
                {CTA[m.cta].label}
              </a>
            )}
          </div>
        ))}
        {typing && (
          <div className="msg-row msg-row--bot" aria-label="SIGMobile is typing">
            <div className="msg-bubble msg-typing" aria-hidden>
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>

      <div className="msg__chips">
        {left.length === 0 ? (
          <p className="msg__done">That's everything. See you at a meeting!</p>
        ) : (
          left.map((q) => (
            <button type="button" key={q.id} className="msg-chip" disabled={typing} onClick={() => ask(q)}>
              {q.question}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
