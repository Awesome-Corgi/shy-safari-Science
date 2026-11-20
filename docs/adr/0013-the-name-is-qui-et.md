# The name is `qui-et`, and the old names stay in storage

> Superseded by [ADR 0016](0016-the-name-is-quiet.md): the product is now
> called `Quiet`. The storage keys, package name and origin described below
> still stand.

The product is called **qui-et**: lowercase, with a hyphen between the two
syllables, and that spelling is the brand wherever it is written — the start
sheet, page titles, social cards, the guide and the docs. It lives at
`https://qui-et.pages.dev`, and `SITE_URL` in `src/lib/site.ts` is the only
place the absolute address is written down; the sitemap, canonical links,
social previews and structured data all derive from it.

Three things still say `class-noise-level`, deliberately.

## Why the hyphen and the lowercase

The name is the instruction the app gives: _quiet_, broken into two beats so it
is read as a name rather than as the adjective. Lowercase keeps it quiet on a
page of sentence-case copy, and stops the wordmark from shouting at a class
that is being asked to be calm. The hyphen is part of the word, not decoration
around it, so it is never dropped in prose (`qui-et`, never `quiet` or
`Quietly`).

## What was deliberately left alone

- **Storage keys.** Every saved Scene, Volume Goal, Class and Note lives under
  `class-noise-level:*` in localStorage. Renaming the prefix would not migrate
  that data, it would strand it: every returning class would open to an empty
  Scene. The prefix is an address, not branding, and it stays until there is a
  migration worth writing.
- **The package name.** `package.json` is still `class-noise-level` because the
  workspace's shared dev-server script is invoked by that name, and it is never
  shown to a teacher.
- **The canonical origin's history.** Earlier addresses
  (`www.shysafari.com`, `shy-safari-science.cooltest.workers.dev`) are gone
  rather than redirected. Nothing links to them but old browser history.

## Consequences

Moving origin is the one rename with a real cost: settings and Notes are
per-origin, so a class that used an earlier address starts fresh at
`qui-et.pages.dev`. That is acceptable once, during a rebrand, and it is the
reason `SITE_URL` should change rarely and never casually after launch.

The `EdTech-a-thon` logo and prose in the README and `llms.txt` are a credit,
not a former name, and stay as they are.
