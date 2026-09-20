import { getTerm, terms } from "../../content/terms";
import type { TermMember, TermSummary } from "../../content/types";

// The Executive Board app reads through these two functions only. They are async on purpose:
// if rosters ever move to Firestore/Postgres, only this file changes.

/** All terms, newest first. */
export async function listTerms(): Promise<TermSummary[]> {
  return terms.map(({ id, year, semester, members }) => ({ id, year, semester, memberCount: members.length }));
}

/** One term's members, in display order. */
export async function getRoster(termId: string): Promise<TermMember[]> {
  return getTerm(termId)?.members ?? [];
}
