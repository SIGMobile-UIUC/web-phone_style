import { useRef, useState, type CSSProperties } from "react";
import type { TermMember, Rarity } from "../../content/types";
import { useReducedMotionPref } from "../../system/PrefsProvider";
import logo from "../../assets/logo_white.png";
import { useActiveCard } from "./ActiveCard";
import { rarityMark, roleStyle, standingHp } from "./roles";
import { requestOrientationPermission, useCardTilt } from "./useCardTilt";
import "./card/index.css";

type Props = {
  member: TermMember;
  rarity: Rarity;
  /** 1-based position in the roster and roster size, shown as a collector number ("001/005"). */
  number: number;
  total: number;
  showcase?: boolean;
};

const pad = (n: number) => String(n).padStart(3, "0");

const Energy = () => <span className="sigcard__energy" />;

export default function MemberCard({ member, rarity, number, total, showcase = false }: Props) {
  const { icon: RoleIcon, glow, type } = roleStyle(member.role);
  const hp = standingHp(member.standing);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPref();
  const { active: activeMember, toggle } = useActiveCard();
  const active = activeMember?.id === member.id;

  // Random per-card offset into the cosmos foil texture, fixed for the card's lifetime.
  const [cosmosBg] = useState(() => `${Math.floor(Math.random() * 734)}px ${Math.floor(Math.random() * 1280)}px`);

  const tilt = useCardTilt(ref, {
    active,
    blocked: !!activeMember && !active,
    showcase,
    reducedMotion,
  });

  // The rotator is a <button>, so its content is phrasing-only (spans, no headings/links).
  return (
    <div
      ref={ref}
      className={`sigcard interactive${active ? " active" : ""}`}
      data-rarity={rarity}
      style={
        {
          "--card-glow": glow,
          "--type-color": type.color,
          "--paper-1": type.paper[0],
          "--paper-2": type.paper[1],
          "--cosmosbg": cosmosBg,
        } as CSSProperties
      }
    >
      <div className="sigcard__translater">
        <button
          type="button"
          className="sigcard__rotator"
          aria-expanded={active}
          onClick={() => {
            requestOrientationPermission();
            toggle(member);
          }}
          {...tilt}
        >
          <span className="sigcard__back">
            <img src={logo} alt="" />
            <span className="sigcard__back-text">SIGMobile</span>
          </span>

          <span className="sigcard__front">
            <span className="sigcard__paper" />

            <span className="sigcard__head">
              <span className="sigcard__stage">{member.standing}</span>
              <span className="sigcard__name">{member.name}</span>
              {hp && (
                <span className="sigcard__hp">
                  <small>HP</small>
                  {hp}
                </span>
              )}
              <span className="sigcard__type" title={`${type.name} type`}>
                <RoleIcon size="1em" aria-hidden />
              </span>
            </span>

            <span className="sigcard__art">
              {member.photo ? (
                <img src={member.photo} alt="" />
              ) : (
                <span className="sigcard__initial" aria-hidden>
                  {member.name[0]}
                </span>
              )}
            </span>

            <span className="sigcard__strip">
              NO. {pad(number)} · {member.role}
              {member.pronouns && ` · ${member.pronouns}`}
            </span>

            <span className="sigcard__ability">
              <span className="sigcard__ability-tag">Major</span>
              <span className="sigcard__ability-text">{member.major}</span>
            </span>

            <span className="sigcard__moves">
              {member.favLang && (
                <span className="sigcard__move">
                  <span className="sigcard__cost">
                    <Energy />
                  </span>
                  <span className="sigcard__move-name">{member.favLang}</span>
                  <span className="sigcard__move-note">Favorite language</span>
                </span>
              )}
              <span className="sigcard__move">
                <span className="sigcard__cost">
                  <Energy />
                  <Energy />
                </span>
                <span className="sigcard__move-name">Interests</span>
                <span className="sigcard__move-desc">{member.interests.join(", ")}</span>
              </span>
            </span>

            <span className="sigcard__rules">
              <span>weakness</span>
              <span className="sigcard__rules-sep" />
              <span>resistance</span>
              <span className="sigcard__rules-retreat">retreat</span>
            </span>

            <span className="sigcard__foot">
              <span className="sigcard__foot-left">
                <span>
                  {pad(number)}/{pad(total)} {rarityMark(rarity)}
                </span>
                {member.email && <span>✉ {member.email}</span>}
              </span>
              {member.funFact && <span className="sigcard__flavor">{member.funFact}</span>}
            </span>

            <span className="sigcard__shine" />
            <span className="sigcard__glare" />
          </span>
        </button>
      </div>
    </div>
  );
}
