# The start screen shows the whole Cast; the Session still starts empty

Behind the start card, the Scene now shows one of every animal in its Roster,
wandering the place, instead of an empty landscape. Choosing another place
repaints it with that place's Cast. Starting the Session still begins from an
empty Scene, which fills one shy animal at a time.

## Why

The empty backdrop was the first thing a teacher saw, and it made the product
look like a placeholder: a landscape with an empty middle, an unreadable
button, and no evidence of what the class was about to earn. The animals are
the product (ADR 0002); showing them before the lesson explains the whole idea
without a word of copy, and it makes switching Scene on the card immediately
legible — the place changes, and so does everyone who lives in it.

Starting empty is the other half of the same decision. The game is that animals
come out for a quiet room; if the class began with the whole Roster on screen,
every arrival would already have happened, and the first minutes — the ones
that teach the rule — would have nothing to show. The Cast is therefore a
picture, not a head start.

## Considered options

- **Carry the Cast into the Session.** Rejected: it would hand the class every
  animal, including the rares, before they had been quiet for a second, and
  remove the reward the rest of the app is built around.
- **An empty Scene with a label or illustration on the card.** Rejected: more
  chrome explaining the product instead of the product showing it. The card is
  already a full sheet; the picture belongs behind it.
- **A separate preview image per Scene.** Rejected: it would be a second set
  of artwork to keep in step with the drawings, and would not move. The Cast is
  the same inline SVG the Session uses (ADR 0002), so it costs nothing extra
  once the Scene's art has arrived.
- **Replacing the card with a gallery of the animals.** Rejected: the card's
  job is still to start a Session; the Cast does the showing, quietly, behind
  it.

## Consequences

The cast is fixed by the Roster and placed deterministically, because the page
is prerendered with it and hydration must find the same one. Its ids are
negative so a preview animal can never be confused with one that really
arrives, and it is drawn with `restored: true`, so nobody glistens or gets an
entrance flourish for being there from the beginning.

A class that comes back to animals it earned still sees those behind the card,
not the whole Cast: `Session` restores them (ADR 0004), and Start keeps them.
The Cast only stands in while the Scene is genuinely empty.

The veil over the artwork was lightened to match: it still darkens the edges
for the corner buttons but leaves the animals their colour, which was the point
of showing them.
