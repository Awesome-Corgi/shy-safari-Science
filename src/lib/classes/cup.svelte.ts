/**
 * The Class Cup scores, remembered per Class on this computer.
 *
 * Lives next to the Class's animals and Notes, under the same storage prefix,
 * so deleting a Class takes its score with it. Only what changed is written,
 * and only every couple of seconds: a Session adds a frame at a time, and
 * localStorage is far too slow for that.
 *
 * Everything is read once, at startup, rather than class by class on demand:
 * a score is shown while the teacher is choosing a Class or looking at the
 * board, and reading storage from inside a view's reactive expression would
 * make that view rewrite the state it is reading.
 */

import { browser } from "$app/environment";
import { CLASS_STORAGE_PREFIX, classStorageKey } from "./classList";
import {
  addMonitored,
  emptyScore,
  parseCupScore,
  roundedPercent,
  type CupScore,
} from "./cup";

/** How the score is filed, beside the Scene's animals and the Class's Notes. */
const PART = "cup";

/** Long enough not to thrash storage, short enough to lose nothing noticeable. */
const SAVE_EVERY_MS = 2000;

/** Every Class's saved score, keyed by Class id. */
function loadAll(): Record<string, CupScore> {
  const scores: Record<string, CupScore> = {};
  if (!browser) return scores;
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(CLASS_STORAGE_PREFIX) || !key.endsWith(`:${PART}`))
        continue;
      const id = key.slice(CLASS_STORAGE_PREFIX.length, -(PART.length + 1));
      if (!id) continue;
      const saved = parseCupScore(
        JSON.parse(localStorage.getItem(key) ?? "null"),
      );
      if (saved) scores[id] = saved;
    }
  } catch {
    // Unreadable storage: every Class starts its Cup run from nothing rather
    // than taking the page down with it.
  }
  return scores;
}

class Cup {
  #scores = $state<Record<string, CupScore>>(loadAll());
  #savedAt = new Map<string, number>();

  /** What the Class has recorded; nothing at all until it has been monitored. */
  score(id: string): CupScore {
    return this.#scores[id] ?? emptyScore();
  }

  /** Its percentage of monitored time under the line, or null if none yet. */
  percent(id: string): number | null {
    return roundedPercent(this.score(id));
  }

  /**
   * One frame of judged time for the Class on screen. Called from the same
   * loop that judges the room, so a score can never count a moment the
   * microphone was not listening to.
   */
  tally(id: string, deltaMs: number, quiet: boolean) {
    this.#scores = {
      ...this.#scores,
      [id]: addMonitored(this.score(id), deltaMs, quiet),
    };
    if (Date.now() - (this.#savedAt.get(id) ?? 0) >= SAVE_EVERY_MS) {
      this.#save(id);
    }
  }

  /** Write everything still only in memory: at the end of a Session, or a visit. */
  flush() {
    for (const id of Object.keys(this.#scores)) this.#save(id);
  }

  #save(id: string) {
    this.#savedAt.set(id, Date.now());
    if (!browser) return;
    try {
      localStorage.setItem(
        classStorageKey(id, PART),
        JSON.stringify(this.score(id)),
      );
    } catch {
      // Browsing privately: the Cup still works for this visit.
    }
  }
}

export const cup = new Cup();

// A closed tab is the usual way a Session ends, and the last couple of
// seconds are not worth losing to it.
if (browser) addEventListener("pagehide", () => cup.flush());
