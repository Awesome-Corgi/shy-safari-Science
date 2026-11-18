# Handoff

A note from the previous agent session to the next one: where the work stands,
how to check it, and how to use the design skill that was just installed.
This is session state, not project documentation — the glossary is
[CONTEXT.md](CONTEXT.md), decisions are in [docs/adr](docs/adr), the teacher-facing
description is [README.md](README.md), and the stack rules are [AGENTS.md](AGENTS.md).

Delete or rewrite this file once its contents have landed.

## Where the work stands

Everything below is committed and pushed on branch
`freebuff/d7092a46566305f0a5584574` (verified with `git ls-remote`):

- `2bf0f4e` Never leave the stage empty while scene art loads
- `ee82bac` Install the Impeccable design skill
- `e6d59d9` Pin critique, polish, layout and typeset as their own skills

New chats in this project start from `main`, which does **not** have these
commits. Either open the PR for that branch first
(https://github.com/Awesome-Corgi/shy-safari-Science/pull/new/freebuff/d7092a46566305f0a5584574)
or start the chat from the branch itself.

The working tree is clean except `artifacts/`, which holds two screenshots from
the last verification run and is deliberately untracked.

### What that commit changed

**Scene art is fetched per Scene, and a bad connection can no longer empty the
stage.** `src/lib/scenes/art.svelte.ts` replaces the single big import:

- `sceneArt(id)` — a Scene's art once it has arrived, else `undefined`.
- `loadSceneArt(id)` — fetches once, deduplicates concurrent calls, and
  **never rejects**: a Scene that cannot load is a state the stage draws, not an
  error every caller must handle.
- two automatic retries at 600 ms and 2400 ms, then `sceneArtFailed(id)` is
  true and `retrySceneArt(id)` is what the teacher's button calls.
- `src/lib/scenes/index.ts` is now only the list of what exists and stays small
  enough to load eagerly; each Scene's `artwork.ts` and `AmbientLife.svelte`
  arrive on demand. The route chunk went from ~1.95 MB to ~196 KB.

`src/lib/components/Scene.svelte` holds the last art it successfully drew
(`drawn`), so:

- switching Scenes never blanks the stage while the next picture loads;
- a Scene that has never been drawn shows its own icon pulsing
  (`scene.loading`);
- a Scene that failed shows a white card at `z-[2500]` with `role="alert"` and
  a "Try again" button (`scene.failed`), reusing `blocked.tryAgain` for the
  button label.

Other work that was in the same tree and shares the commit: the scene selector
no longer waits to be revealed before it can be clicked, a microphone that has
vanished since the last visit falls back to the default instead of leaving the
teacher stuck (`refreshDevices` never throws, `devicechange` listener,
`mic.permission` hint), `BrandChip` was deleted and its job moved into the info
drawer, and the on-screen counter counts the **creatures present** rather than
arrivals ([ADR 0010](docs/adr/0010-counter-shows-the-scene.md) supersedes ADR
0007).

### Verified, and how

- `bun run check` (0 errors), `bun run lint`, `bun test` (963 tests in 24
  files), `bun run build` — all green at `2bf0f4e`.
- In the browser, with a stubbed microphone: blocking `*scenes/space/*` and
  switching to Deep space kept the savanna art on the stage (backdrop unchanged
  across the whole failure window), then showed the failure card, and a real
  pointer click on **Try again** after unblocking replaced it with the deep
  space starfield (backdrop signature 5216 → 93,004 characters). Screenshots:
  `artifacts/retry-1-failed.png`, `artifacts/retry-2-recovered.png`.

### Known gaps — not bugs anyone has reported, just what is left

- **The failure card is behind the start card.** Before Start is pressed, the
  stage's retry card renders under the dimmed start overlay
  (`div.absolute.inset-0.z-40`), so its button is not clickable in that state;
  it becomes clickable as soon as the session starts. Hiding the card while the
  start overlay is up would be a small change if that state matters.
- `Collection.svelte` still shows empty slots for a Scene whose art has not
  arrived yet; it was left alone.
- The retry path was verified with blocked-then-unblocked requests, not by
  dropping a real connection mid-download.

## Running it

```sh
bun install --frozen-lockfile      # preserve the lockfile; do not upgrade deps
bun run dev --host 0.0.0.0 --port 3000
```

Checks, all of which must stay green:

```sh
bun run check     # svelte-check, 0 errors/warnings
bun run lint      # prettier --check . && eslint .
bun test          # bun's test runner
bun run build
```

In this cloud VM the preview hostname must be allowed on the dev server, and it
changes when the workspace is restored:

```sh
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$PREVIEW_HOST" \
  nohup bun run dev --host 0.0.0.0 --port 3000 > /tmp/dev.log 2>&1 &
curl -s -o /dev/null -w '%{http_code}\n' -H "Host: $PREVIEW_HOST" http://127.0.0.1:3000/
```

The preview host is a `*.style.dev` name that answers 403 to anything without
the owner's sign-in, so test it with the `Host` header on `127.0.0.1` and then
open it in the browser panel — a 403 from curl without that header is expected.

## Notes on testing this app in a browser

- **There is no microphone in the VM**, so Start never completes on its own.
  Stub it before the page loads:

  ```js
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      const osc = ctx.createOscillator();
      osc.connect(dest);
      osc.start();
      return dest.stream;
    };
  });
  ```

  and press Start with a real pointer click (a synthetic `.click()` is not a
  user gesture). The HUD buttons auto-hide after a few idle seconds, so move
  the mouse before clicking "Change scene".

- **Simulating a failed chunk:** DevTools `Network.setBlockedURLs` with a
  pattern such as `*scenes/space/*` works; `page.route` does not intercept these
  dynamic imports reliably. Blocks are per CDP session, so re-send them after
  creating a new one.
- The start screen renders a full `Scene` behind the start card, so
  `.scene-stage` exists there too — tell in-session apart by the
  `button[aria-label^="Change scene"]` chip.

## Impeccable (the design skill)

Installed as a vendored copy at `.agents/skills/impeccable/` — v4.9.2, 25
commands, byte-identical to upstream (https://github.com/pbakaus/impeccable).
Its launcher and bundled engine need no Node:

```sh
.agents/skills/impeccable/scripts/impeccable help
.agents/skills/impeccable/scripts/impeccable context --target src/routes/+page.svelte
.agents/skills/impeccable/scripts/impeccable detect src/lib/components src/routes
```

`context` currently answers `NO_PRODUCT_MD`: there is no PRODUCT.md yet. Narrow
refinements of existing screens may proceed on the code as the design authority
and offer `/impeccable init` afterwards; a **redesign or a new surface must run
`init` first**, which is a short interview that writes PRODUCT.md.

Four commands are also pinned as their own skills —
`.agents/skills/{critique,polish,layout,typeset}/SKILL.md`, each a one-file
shortcut that delegates to the umbrella skill — so they can be found by name.
Ignore settings: `.agents/` is excluded from Prettier and ESLint on purpose; it
is copied in from another repository, not ours to reformat.

The detector loads 62 rules but reports nothing on this Svelte codebase, so
expect the playbooks to fall back to reading code and looking at the rendered
page rather than automatically catching anti-patterns.

## House rules the next session should keep

- **Keep the app's existing visual style.** No redesigns, restyling or polish
  passes unless the user asks for one.
- **i18n must stay complete.** `src/lib/i18n/index.svelte.ts` holds `en`, `es`
  and `fr`; `en` is the source type, so a new key is a type error in the other
  two until it is translated. Nothing may ship half-translated.
- **New decisions get an ADR** in `docs/adr/` (`NNNN-short-name.md`, plain
  language, why over what), and a decision that changes an earlier one says so
  and points at it, as ADR 0010 does for ADR 0007.
- **CONTEXT.md is a glossary**: shared language only — no implementation, no
  decisions.
- DOM elements over canvas for anything a screen reader should reach; art is
  inline SVG so CSS can animate its parts ([ADR 0002](docs/adr/0002-svg-dom-scene.md)).
- Persistence is `localStorage` only — there are no accounts and no backend.
- **Do not commit or push unless the user asks.** When they do, this repo uses
  sentence-case imperative subjects with a short explanatory body.

## Map of the code

| Path                              | What lives there                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/routes/+page.svelte`         | The whole screen: Scene, Notes, start card, HUD                                           |
| `src/lib/app.svelte.ts`           | Session, Scene choice, microphone wiring, HUD state                                       |
| `src/lib/audio/`                  | `microphone.svelte.ts` (level + status), `calibration.ts`, `monitor.svelte.ts` (Too Loud) |
| `src/lib/scenes/`                 | `index.ts` (what exists), `art.svelte.ts` (art on demand), one folder per Scene           |
| `src/lib/components/Scene.svelte` | The stage: backdrop, Ambient Life, Creatures, loading and failure states                  |
| `src/lib/session/`                | Creatures arriving, running away, per-Class saving                                        |
| `src/lib/i18n/index.svelte.ts`    | `en` / `es` / `fr` strings                                                                |
| `docs/adr/`                       | Decisions, 0001–0010                                                                      |
