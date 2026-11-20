# 0017 — Both themes come from one set of tokens

- **Status:** Accepted
- **Date:** 2026-11-20
- **Supersedes:** nothing. Extends [0016](0016-the-name-is-quiet.md).

## Context

The chrome was designed for one light palette: warm paper, dark ink, one ochre
accent, drawn from the savanna's own colours. Teachers use Quiet in rooms with
the lights off, on projectors, and late in the day, and a full-brightness sheet
of paper is the brightest thing in the room. Half the app is also the Scene,
which is dark in Deep space and bright on the Savanna, and the chrome has to sit
on both without one of them looking pasted on.

The app is a SvelteKit/Svelte 5 project with Tailwind 4. Every component already
asks for semantic names — `bg-paper`, `text-ink`, `bg-paper-deep` — rather than
hex values, and that is the fact the whole decision rests on.

## Decision

1. **One set of token names, two sets of values.** Light and dark are two
   blocks in `src/routes/layout.css` that answer to the same names. No component
   knows which theme is live; none carries a `dark:` variant. A new component is
   written once and works in both.
2. **The choice is a setting, applied before the first paint.** `theme` is
   `system | light | dark`, stored with the rest of the settings, resolved in
   `src/app.html` before the first paint so a reload never flashes the other
   theme, and kept live by `src/lib/ui/theme.svelte.ts` (including the
   computer's own change while System is chosen).
3. **Each Scene lends the chrome its temperature.** `html[data-scene]` overrides
   the same tokens: the savanna's panels are dust-paper and warm ink, Deep space
   is night-blue glass in either theme, because its Scene is dark in either
   theme. Scenes with no entry use the plain theme. The override is a handful of
   lines per Scene, not a component variant.
4. **Sage is a fill, never body text.** `--color-ochre` (#91AAA1) is the accent
   for bars, rules and marks; `--color-ochre-deep` (#4C675E on light, #A9C0B7 on
   dark) is the same hue dark enough to read. Text on a sage fill is `--color-ink`.
5. **Three faces, self-hosted.** Bricolage Grotesque for display, Instrument
   Sans for the interface, IBM Plex Mono for figures only. All SIL OFL, in
   `static/fonts`, latin and latin-ext, so en/es/fr are covered without a
   network request. Figures use `tabular-nums`.
6. **Motion is a token set too.** `--d-1`…`--d-5` and three curves; nothing
   overshoots, transforms and opacity only, and `prefers-reduced-motion`
   collapses entrances to opacity.

## Consequences

- The dark theme is a CSS block, not a second stylesheet, and adding a Scene's
  temperature is a few declarations.
- Anything hard-coded (`rgb()`, a Tailwind palette colour) escapes both themes.
  Reviewers should treat a raw colour in a component as a bug.
- Contrast is now a per-theme responsibility: sage-on-paper fails, so text uses
  `ochre-deep`, and dark mode lightens it. `docs/adr/0006-noise-meter-on-screen.md`
  and the Too Loud veil still use the artwork palettes, which are scene colours
  and deliberately not themed.
- Files: `src/routes/layout.css` (tokens), `src/app.html` (pre-paint),
  `src/lib/ui/theme.svelte.ts`, `src/lib/components/ThemeSwitch.svelte`.
