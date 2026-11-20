/**
 * The Class Cup: how much of its monitored time a Class has kept the room
 * under the Noise Limit.
 *
 * Plain data and arithmetic only, so the rules are easy to test; the store
 * that remembers them is `cup.svelte.ts`. Time is only counted while a
 * Session is running and the microphone is judging the room (see `App.step`),
 * so a Class is never credited or charged for a lesson it was not part of.
 *
 * The score is a share, not a count: a Class that has been quiet for ten
 * minutes out of ten is level with one that has been quiet for an hour, which
 * is what makes a leaderboard across classes with different timetables fair.
 */

export interface CupScore {
  /** Milliseconds the room spent at or below the Noise Limit. */
  quietMs: number;
  /** Milliseconds judged at all, quiet or not. */
  totalMs: number;
}

export const EMPTY_SCORE: CupScore = { quietMs: 0, totalMs: 0 };

export function emptyScore(): CupScore {
  return { ...EMPTY_SCORE };
}

/** One frame of judged time, added to a Class's record. */
export function addMonitored(
  score: CupScore,
  deltaMs: number,
  quiet: boolean,
): CupScore {
  if (!(deltaMs > 0)) return score;
  return {
    quietMs: quiet ? score.quietMs + deltaMs : score.quietMs,
    totalMs: score.totalMs + deltaMs,
  };
}

/** False until the Class has been monitored at all: it has no score yet. */
export function hasTime(score: CupScore): boolean {
  return score.totalMs > 0;
}

/** The share of monitored time spent under the line, 0–100. */
export function percent(score: CupScore): number | null {
  return hasTime(score) ? (score.quietMs / score.totalMs) * 100 : null;
}

/** What the teacher actually reads: a whole percentage, or none yet. */
export function roundedPercent(score: CupScore): number | null {
  const share = percent(score);
  return share === null ? null : Math.round(share);
}

/**
 * How much more continuous quiet time a Class would need to reach the
 * leader's percentage with its own record.
 *
 * If the Class spends `x` more milliseconds all under the line, its score
 * becomes `(quiet + x) / (total + x)`. Solving that for the leader's share `p`
 * gives `x = (p * total - quiet) / (1 - p)`. Null means "cannot be done":
 * the Class has no monitored time to build on, or the leader is at exactly
 * 100%, which only a Class that has never been over the line could equal.
 */
export function catchUpMs(
  score: CupScore,
  leaderPercent: number,
): number | null {
  if (!hasTime(score)) return null;
  const leader = Math.min(100, Math.max(0, leaderPercent)) / 100;
  if (leader >= 1) return null;
  const needed = (leader * score.totalMs - score.quietMs) / (1 - leader);
  return Math.max(0, Math.round(needed));
}

/**
 * The place a Class holds among the board's shares: 1 for the highest, with
 * Classes on the same whole percentage sharing it ("1st, 1st, 3rd").
 */
export function placeOf(percent: number, shares: (number | null)[]): number {
  return 1 + shares.filter((share) => share !== null && share > percent).length;
}

/**
 * How long a Class still needs, in the way a teacher would say it: "40 s"
 * for a moment, "28 min" for a lesson, "3 h 48 min" once it runs past the
 * hour, and "4 d 2 h" once a lead in the high nineties pushes it into days.
 * Nobody reads 227:42 at a glance. Units are the short ones, which read the
 * same in every language the app speaks.
 */
export function formatQuiet(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    const spare = hours % 24;
    return spare === 0 ? `${days} d` : `${days} d ${spare} h`;
  }
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")} min`;
}

/** Whatever was saved for a Class, or null if it cannot be trusted. */
export function parseCupScore(saved: unknown): CupScore | null {
  if (!saved || typeof saved !== "object") return null;
  const { quietMs, totalMs } = saved as Partial<CupScore>;
  if (!Number.isFinite(quietMs) || !Number.isFinite(totalMs)) return null;
  const total = Math.max(0, totalMs as number);
  return {
    quietMs: Math.max(0, Math.min(total, quietMs as number)),
    totalMs: total,
  };
}
