import { Code, Crown, Palette, Server, Terminal, type LucideIcon } from "lucide-react";
import type { TermMember, Rarity } from "../../content/types";

/** Pokémon-style "energy type": drives the badge, energy dots and card background tint. */
export type CardType = { name: string; color: string; paper: [string, string] };

const dragon: CardType = { name: "Dragon", color: "#c79a1f", paper: ["#fff4c2", "#f0d476"] };
const fairy: CardType = { name: "Fairy", color: "#e8709f", paper: ["#ffe6f0", "#f6b6d0"] };
const metal: CardType = { name: "Metal", color: "#4f86ad", paper: ["#e3f1fa", "#a9d4ee"] };
const grass: CardType = { name: "Grass", color: "#3f9a5f", paper: ["#e4f5e9", "#a8d9b8"] };
const colorless: CardType = { name: "Colorless", color: "#8a8f98", paper: ["#f4f5f7", "#d5d8dd"] };

type RoleStyle = { icon: LucideIcon; glow: string; rarity: Rarity; type: CardType };

// Roles are free-form strings in the data; card styling is decided here by keyword.
// First match wins, so put more specific patterns first ("Infra & Dev" is an infra card, not a dev one).
const roleStyles: [RegExp, RoleStyle][] = [
  [/president/i, { icon: Crown, glow: "hsl(47, 100%, 62%)", rarity: "rare rainbow", type: dragon }],
  [/design/i, { icon: Palette, glow: "hsl(323, 100%, 75%)", rarity: "rare secret", type: fairy }],
  [/infra/i, { icon: Server, glow: "hsl(205, 90%, 60%)", rarity: "rare holo cosmos", type: metal }],
  // Same pastel strength as the others, plain holo foil: it should sit among them, not above them.
  [/dev/i, { icon: Terminal, glow: "hsl(150, 60%, 58%)", rarity: "rare holo", type: grass }],
];
const fallback: RoleStyle = { icon: Code, glow: "hsl(175, 100%, 70%)", rarity: "rare holo", type: colorless };

export const roleStyle = (role: string): RoleStyle =>
  roleStyles.find(([re]) => re.test(role))?.[1] ?? fallback;

/** Explicit override > past terms get the muted foil > the role's default. */
export const rarityOf = (m: TermMember, isCurrentTerm: boolean): Rarity =>
  m.rarity ?? (isCurrentTerm ? roleStyle(m.role).rarity : "reverse holo");

// Class standing plays the part of HP: the further along, the sturdier the card.
const hpByStanding: Record<string, number> = { freshman: 60, sophomore: 90, junior: 120, senior: 150 };
export const standingHp = (standing: string): number | undefined => hpByStanding[standing.toLowerCase()];

export const rarityMark = (r: Rarity): string =>
  r === "reverse holo" ? "◆" : r === "rare rainbow" || r === "rare secret" ? "★★" : "★";
