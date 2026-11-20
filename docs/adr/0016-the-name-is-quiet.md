# The name is `Quiet`

The product is called **Quiet**: one word, capital Q, no hyphen. That spelling
is the brand wherever it is written — the start sheet, page titles, social
cards, the guide and the docs. It lives at `https://qui-et.pages.dev`, and
`SITE_URL` in `src/lib/site.ts` is the only place the absolute address is
written down; the sitemap, canonical links, social previews and structured data
all derive from it.

This supersedes ADR 0013, which named the product `qui-et`.

## Why the plain word

`qui-et` was read as a typo as often as it was read as a name. Middle schoolers
say it, spell it and search for it, and a hyphen they have to remember costs
more than the two beats it bought. `Quiet` is the thing the app asks for, in
the word a class already uses, and it survives being typed into a search box or
written on a board.

The quietness the lowercase once provided is now carried by the mark: a
waveform that stops short of its centre, with nothing in the middle. The logo
is in `src/lib/brand/logo.svg`; the favicon is the same bars on an ink tile.
The wordmark is set in the app's display face wherever the name is written, so
it is never a picture of a word and always selectable, translatable text.

## What was deliberately left alone

- **Storage keys.** Every saved Scene, Volume Goal, Class, Note and Cup score
  lives under `class-noise-level:*` in localStorage. Renaming the prefix would
  strand that data: every returning class would open to an empty Scene. The
  prefix is an address, not branding, and it stays until there is a migration
  worth writing.
- **The canonical origin.** `qui-et.pages.dev` still contains the old spelling.
  Moving origin is the one rename with a real cost, because settings and Notes
  are per-origin, so the address stays and the name changes above it.
- **The package and Worker names.** `package.json` is still
  `class-noise-level`, invoked by that name from the workspace's shared
  dev-server script, and `wrangler.jsonc` is still `qui-et`, which is the
  deployed Worker. Neither is shown to a teacher.

## Consequences

The name is one word in every sentence: `Quiet`, never `quiet` mid-brand and
never `Quietly`. Prose that uses "quiet" as the ordinary adjective is
unaffected, which is why the Volume Goal preset stays "Silent" and the Cup copy
says "under the line" rather than "quiet time" where the name would be
ambiguous.

The `EdTech-a-thon` logo and prose in the README and `llms.txt` are a credit,
not a former name, and stay as they are.
