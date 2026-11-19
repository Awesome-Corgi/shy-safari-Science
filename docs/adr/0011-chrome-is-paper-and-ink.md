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
- **A new display typeface.** Rejected for now: it would mean self-hosting a
  font file. The rounded stack the Notes already speak in is the app's own
  voice, so the chrome now uses it too and the two sound like one product.
- **Redesigning the artwork to match.** Out of scope: the drawings are the
  product's identity (ADR 0002), not chrome.

## Consequences

`layout.css` gains the paper/ink tokens, two shadow tokens, a panel radius, the
rounded `--font-sans`, and a single `rise` entrance used by the start card and
the dialogs. `prefers-reduced-motion` turns that entrance off.

The chrome is now muted on purpose: the animals are the loud thing on screen,
and the controls should never compete with them for a child's attention. Any
future surface — a new panel, a new dialog — should use the tokens rather than
`white` and `slate`, or it will look like a different app.
