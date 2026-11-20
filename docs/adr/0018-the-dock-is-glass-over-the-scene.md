# 0018 — The dock is glass over the Scene

- **Status:** Accepted
- **Date:** 2026-11-20
- **Supersedes:** [0011](0011-chrome-is-paper-and-ink.md) in part. Extends
  [0017](0017-both-themes-from-one-set-of-tokens.md).

## Context

While a Session runs, the teacher's controls were spread across the bottom
edge: a wide pill with Start / Reset / Pause / Settings, a Cup percentage chip
in one corner and an arrival counter in the other. Every one of them was a white
pill floating on the artwork. On the savanna they read as stickers; in Deep
space they were the brightest thing in a dark room, and the arrival's progress —
the thing the whole app is built on — was only visible as a number that went up.

Nothing on screen is the lesson. The Scene is. So the chrome has to be quiet
enough to disappear and precise enough to read at a glance from the back of the
room when it is there.

## Decision

1. **One dock holds the Session.** `src/lib/components/Dock.svelte` replaces
   the control bar and both corner chips: the Cup percentage and place, the live
   Noise Meter against the goal, how long until the next arrival, the animals in
   the Scene (when the teacher asked for the count), Pause, Reset and Settings.
   Reset still confirms, in a card above the dock. The Scene picker, animals,
   help and language stay in the corners.
2. **All floating chrome is one surface, `.chrome`.** A token-driven glass:
   `--color-paper` at 88%, a hairline of `--color-line`, `--shadow-lift`, and a
   10px backdrop blur. Chips, the meter, the pause pill, the class picker, the
   timer card and the dock all wear it, so they read as one material. It lives
   in `@layer components`, so a component can still override it with a utility
   (an open menu goes solid ink).
3. **Deep space is genuinely translucent.** `html[data-scene="space"] .chrome`
   drops to night-blue at 42% with a 20px blur, a starlight hairline, an inset
   top highlight and a faint glow: the Scene's stars run on behind the panel.
   Space is the one Scene where the chrome is see-through.
4. **The savanna is dry and opaque.** `html[data-scene="savanna"] .chrome` is
   flat dust-paper with no blur at all, plus a warm shadow. Nothing of the
   artwork shows through a panel standing in the savanna, which is also why its
   accent tokens move from sage to ochre.
5. **One meter on screen at a time.** While the dock is up it carries the meter.
   The compact meter chip at the top appears only once the chrome has faded, and
   only if the teacher turned it on, so the room keeps its live level when the
   class is looking at the Scene.

## Consequences

- The Cup percentage and the arrival counter no longer stay up on their own:
  they appear with the chrome and fade with it. The always-on reading is the
  meter chip, which is what a teacher watching from across the room needs.
- Every new floating element gets `.chrome` rather than `bg-paper/95`, and a
  Scene that must not show the artwork through its panels adds a rule to the
  block above, not a variant in a component.
- The dock is a single flex row on a computer and stacks above the corner chips
  on a phone, where it takes the full width for the meter.
