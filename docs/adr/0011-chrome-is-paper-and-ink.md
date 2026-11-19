# The chrome is paper and ink, taken from the Scene

Every surface the teacher touches — the start card, the corner buttons, the
control bar, the Timer, the Settings and Animals panels, the guide, the about
and privacy pages — is now warm paper (`#fdf8ec`) on warm ink (`#262633`), with
a single ochre accent (`#c07f36`) borrowed from the logo's disc. The previous
`white/95` and `slate` greys are gone from the chrome. The Scene's own artwork,
colours and motion are untouched.

## Why

The Scene is hand-drawn and warm; the chrome on top of it was the browser's
default furniture, white cards and grey text with no relationship to the
picture underneath. On the savanna's gold it read as a form; on the reef's
blue, as a form in the wrong room. Paper and ink sit legibly on all three
backdrops, so the panels feel like part of the same world rather than a
utility layer over it.

It also fixes three smaller things at once: elevation is now declared once per
surface (a shadow with a real offset and blur, never a shadow plus a hairline
border), section labels share one treatment, and the browser's own surfaces —
text selection, focus rings, scrollbars, carets — are drawn from the palette
instead of Chrome's defaults.

## Considered options

- **A scene-aware chrome that recolours per Scene.** Rejected: the teacher
  changes Scene mid-lesson, and a palette that shifts under them would make
  the controls feel unreliable. One warm chrome over all of them stays put.
- **A new display typeface, at first put off** because it meant self-hosting a
  font file. Taken up on the second pass and settled on Newsreader: the
  rounded system stack was the platform's voice, not the product's, and a
  display role is what makes a title read as a title. Self-hosted rather than
  served from a CDN, so a classroom with a flaky filter still gets it.
- **Fraunces.** Tried, then dropped: its current ubiquity is exactly the
  sameness a display face is supposed to fix.
- **Redesigning the artwork to match.** Out of scope: the drawings are the
  product's identity (ADR 0002), not chrome.

## The sheet, the scale and the display voice

A second pass tightened the composition and gave the app a display voice.

**The start screen is a spread, not a form.** One sheet, read from its own
left edge: the title, the Scene's own line, an ochre rule, and one button;
the places to choose between sit on the right as an index, and choosing one
repaints the Scene behind the sheet, so the teacher sees the world they are
choosing before the Session starts. On a phone the two halves stack and the
places wrap into a stamp sheet. The nested `bg-paper-deep` box that held the
hint is gone — a card inside a card read as a form — and the veil over the
artwork became a vignette that darkens the edges and leaves the middle of the
picture its colour.

**Titles speak in Newsreader** (`static/fonts/`, self-hosted, SIL OFL, 220 KB
for Latin and Latin-ext, `font-display: swap`). It has a variable optical
axis, so a 3.5rem title is drawn for its size rather than enlarged from
reading text, and its warm, slightly old-fashioned cut belongs to the same
storybook world as the drawings. Everything a teacher operates — labels,
buttons, settings, the Notes — stays in the rounded sans, which was already
the app's voice. Two families, two jobs, no third.

**The control bar** became a single pill: one filled primary action, quiet
text buttons for the rest, a hairline between them. **The meter's** green,
amber and red are the creature palette's own teal, yellow and red rather than
Tailwind's defaults, so the one place the app is allowed to shout uses the
same colours as the animals. **The about and privacy pages** dropped their
cards for rule-separated sections on one 65ch measure, since they are read
rather than operated.

## Consequences

`layout.css` gains the paper/ink tokens, two shadow tokens, a panel radius, the
rounded `--font-sans`, and a single `rise` entrance used by the start card and
the dialogs. `prefers-reduced-motion` turns that entrance off.

The chrome is now muted on purpose: the animals are the loud thing on screen,
and the controls should never compete with them for a child's attention. Any
future surface — a new panel, a new dialog — should use the tokens rather than
`white` and `slate`, or it will look like a different app.
