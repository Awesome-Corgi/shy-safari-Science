/**
 * Each Scene's artwork, fetched when its Scene is first used rather than
 * bundled into the page that loads first.
 *
 * Every Creature is inline SVG source, so CSS can reach inside it and animate
 * its parts (ADR 0002). Between the eight Scenes that is well over a megabyte
 * of source, and it used to sit in the one script the start card waited for:
 * art for seven worlds nobody had asked for yet. Each Scene's art is a dynamic
 * import of its own now, so the page paints with the default Scene's share and
 * the rest arrive when a teacher switches to them.
 *
 * What has arrived is state, so whatever is on screen draws itself the moment
 * its art lands. A chunk that fails is retried twice before the Scene admits
 * it and offers to try again, and the stage keeps the last Scene's picture up
 * meanwhile, so a slow or dropped connection never empties the screen.
 */

import type { Component } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { SceneId } from "./types";

export interface SceneArt {
  /** Creature art by slug: inline SVG source, drawn with `{@html}`. */
  creatureArt: Record<string, string>;
  /**
   * The same Creatures facing out of the screen, to swap in while Paused so
   * the class sees them listening too. Keyed by slug, and only for those
   * drawn so far.
   */
  listeningArt: Record<string, string>;
  /** The backdrop and the Ambient Life, by slug. */
  ambientArt: Record<string, string>;
  /** The Scene's living scenery, as a component. */
  Ambient: Component;
}

type ArtworkModule = {
  CREATURE_ART: Record<string, string>;
  LISTENING_ART?: Record<string, string>;
  AMBIENT_ART: Record<string, string>;
};

function together(
  artwork: Promise<ArtworkModule>,
  ambient: Promise<{ default: Component }>,
): Promise<SceneArt> {
  return Promise.all([artwork, ambient]).then(([source, scene]) => ({
    creatureArt: source.CREATURE_ART,
    // Only Scenes with someone drawn facing out of the screen have these:
    // nothing a telescope picks up in deep space has a face to turn.
    listeningArt: source.LISTENING_ART ?? {},
    ambientArt: source.AMBIENT_ART,
    Ambient: scene.default,
  }));
}

const LOADERS: Record<SceneId, () => Promise<SceneArt>> = {
  savanna: () =>
    together(
      import("./savanna/artwork"),
      import("./savanna/AmbientLife.svelte"),
    ),
  reef: () =>
    together(import("./reef/artwork"), import("./reef/AmbientLife.svelte")),
  space: () =>
    together(import("./space/artwork"), import("./space/AmbientLife.svelte")),
  prehistoric: () =>
    together(
      import("./prehistoric/artwork"),
      import("./prehistoric/AmbientLife.svelte"),
    ),
  forest: () =>
    together(import("./forest/artwork"), import("./forest/AmbientLife.svelte")),
  jungle: () =>
    together(import("./jungle/artwork"), import("./jungle/AmbientLife.svelte")),
  arctic: () =>
    together(import("./arctic/artwork"), import("./arctic/AmbientLife.svelte")),
  halloween: () =>
    together(
      import("./halloween/artwork"),
      import("./halloween/AmbientLife.svelte"),
    ),
};

const loaded = $state<Partial<Record<SceneId, SceneArt>>>({});
/** Scenes already on their way, so a second call joins the first fetch. */
const pending = new SvelteMap<SceneId, Promise<SceneArt | undefined>>();
/** Scenes that could not be fetched even after the automatic retries. */
const failed = $state<Partial<Record<SceneId, boolean>>>({});
/** Tries so far, per Scene, so the retries can back off and then stop. */
const tries = new SvelteMap<SceneId, number>();

/**
 * Waits before each automatic retry. Two of them, because a chunk that fails
 * is usually a dropped connection rather than a missing file; past that the
 * Scene says so and leaves the decision to the teacher.
 */
const RETRY_DELAYS_MS = [600, 2400];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A Scene's art, once it has arrived; undefined while it is still on its way. */
export function sceneArt(id: SceneId): SceneArt | undefined {
  return loaded[id];
}

/**
 * Whether a Scene's art could not be fetched at all, after the retries. The
 * Scene shows a way to try again rather than staying blank.
 */
export function sceneArtFailed(id: SceneId): boolean {
  return failed[id] === true;
}

/**
 * Fetch a Scene's art, once. Safe to call on every render: a Scene already
 * loaded resolves at once, and one already on its way is not fetched twice.
 *
 * Never rejects. A Scene that cannot load is a state the stage draws (see
 * `Scene.svelte`), not an error to raise at every caller.
 */
export async function loadSceneArt(id: SceneId): Promise<SceneArt | undefined> {
  const ready = loaded[id];
  if (ready) return ready;
  const inFlight = pending.get(id);
  if (inFlight) return inFlight;
  failed[id] = false;
  const promise = attempt(id).finally(() => pending.delete(id));
  pending.set(id, promise);
  return promise;
}

/**
 * One Scene's fetch, with its automatic retries. Gives up after the last
 * delay, marking the Scene as failed so the stage can offer a button.
 */
async function attempt(id: SceneId): Promise<SceneArt | undefined> {
  for (;;) {
    try {
      const art = await LOADERS[id]();
      loaded[id] = art;
      tries.delete(id);
      return art;
    } catch {
      const made = (tries.get(id) ?? 0) + 1;
      tries.set(id, made);
      const delay = RETRY_DELAYS_MS[made - 1];
      if (delay === undefined) {
        failed[id] = true;
        return undefined;
      }
      await wait(delay);
    }
  }
}

/** Try a Scene's art again, on the teacher's word, after it failed. */
export function retrySceneArt(id: SceneId): Promise<SceneArt | undefined> {
  tries.delete(id);
  return loadSceneArt(id);
}
