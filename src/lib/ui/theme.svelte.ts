/**
 * Which theme the app is wearing.
 *
 * The teacher's choice is kept in settings (localStorage, like everything
 * else) and the resolved value is written to the document element before the
 * first paint by app.html, so a reload never flashes the other theme. Every
 * colour in layout.css is a token that both themes answer to; this module only
 * decides which set is live.
 *
 * See docs/adr/0017-both-themes-from-one-set-of-tokens.md.
 */

import { browser } from "$app/environment";
import { settings } from "$lib/settings/settings.svelte";

export type Theme = "light" | "dark";

let media: MediaQueryList | null = null;

/** The theme that is actually on screen, once System has been resolved. */
export function resolvedTheme(): Theme {
  if (!browser) return "light";
  if (settings.theme !== "system") return settings.theme;
  return (media ??= window.matchMedia("(prefers-color-scheme: dark)")).matches
    ? "dark"
    : "light";
}

/** Put the resolved theme on the document element. */
export function applyTheme() {
  if (!browser) return;
  document.documentElement.dataset.theme = resolvedTheme();
}

/**
 * Follow the computer's own light/dark setting while the teacher has chosen
 * System. Returns the unsubscribe, for onMount.
 */
export function watchSystemTheme() {
  if (!browser) return;
  media ??= window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => applyTheme();
  media.addEventListener("change", onChange);
  applyTheme();
  return () => media?.removeEventListener("change", onChange);
}
