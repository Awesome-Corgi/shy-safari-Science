# The counter shows the Creatures in the Scene, not the ones that arrived

The on-screen counter (ADR 0007) now says how many Creatures are out there
right now, rather than how many have arrived since the Session began. It still
sits in the bottom left, still shows only when the teacher turns it on in
Settings, and is still remembered on this computer — the toggle is relabelled
"Count the animals in the scene", and in deep space "Count the sightings in
view". It goes down as well as up: one that Runs Away lowers it, and Reset
empties it along with the Scene.

## Why

The number a teacher wants at a glance is the Scene as it stands. A running
total for the whole Session answered a question nobody was asking — it was
already large an hour into the day, and said nothing about whether the room had
just lost half its animals. This was asked for by the product owner while
taking the app on for long-term hosting.

## Considered options

- **Both numbers, arrivals above and present below.** Rejected: two counts in
  one small pill is more to read from the back of the room than either is
  worth, and the arrival total was the one nobody used.
- **Leave it as ADR 0007 had it.** Rejected by the same request. But note what
  that ADR rejected: a count of the Creatures present, because a number that
  falls is a live readout of the noise (ADR 0001). That risk is real and is
  accepted here.

## Consequences

The counter is no longer "a score that only goes up". It moves only when a
Creature actually arrives or leaves: at the pace of the arrival clock (minutes)
and of the flee waves (one warning departure three seconds into Too Loud, then
a fifth every five seconds). It is a fragment of the Scene's own story, not a
needle that twitches with the meter, and it is still off unless the teacher
asks for it. The Collection remains the long-running record of everything a
Class has ever spotted.

The Session's arrival tally is no longer kept: `Session.arrived` and its stored
count are gone, so the stored `arrived` key is left behind in existing
browsers, harmlessly, rather than migrated.
