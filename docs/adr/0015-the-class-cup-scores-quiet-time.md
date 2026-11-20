# The Class Cup scores time under the line, as a share, per Class

Classes can now compete on something other than the animals they have earned:
a Class Cup, where each Class's score is the percentage of its monitored time
the room spent at or below the Volume Goal. The board opens from the top bar at
any time — before the lesson, to see where everyone stands, or during it, to
watch a class climb — and ranks every Class, marking first place and telling
everyone else how much more time under the line they need. Each Class carries
its place beside its percentage, so a class reads "2nd, 67%" without counting
rows. The Class on screen's percentage and place also stay in the corner of
the Scene, opposite the arrival counter, so a class can see its own share move
without anyone opening a panel. It reads the score and never writes one: only
the Session judges time.

The Session itself is unchanged. The Cup reads the level the Noise Meter
already reads and writes nothing to the Scene: no new signal, no new sound,
and no way for a noisy room to be more interesting than a quiet one
(ADR 0001).

## Why a share, not a count

Classes do not get equal time on the board. Period 2 has three lessons a week,
Period 5 has one, and a count of quiet minutes would rank the timetable rather
than the room. A share is fair to both: a Class that has been quiet for ten
minutes out of ten is level with one that has been quiet for an hour, and the
number means the same thing to the teacher reading it out.

It is also the only score a class can raise by being quiet _now_: every quiet
minute adds to the numerator and the denominator, so progress is visible within
seconds rather than at the end of the term.

## What counts as monitored time

A frame is added to the Class on screen's score only when all of these hold:

- a Session is running (`Start` has been pressed, and nothing has switched
  Class or Reset since), because time before Start belongs to no lesson;
- the microphone is on and the room is being judged — not Paused, not
  Calibrating, and not during the Timer's chime, which the microphone cannot
  tell from the class;
- the frame is not late by more than a second. A hidden or sleeping tab stops
  drawing frames, so the room was not being watched and no Class is credited
  or charged for it.

Quiet means the instantaneous level is at or below the Volume Goal, which is
the same line the meter draws. The debounced state that gates arrivals is
deliberately not used: the score should answer "how much of the lesson was
under the line" literally, and a class watching the score tick over learns
the rule faster than one waiting for a four-second debounce.

## The catch-up figure

For a Class with `quiet` and `total` milliseconds, reaching a leader at share
`p` by spending `x` more milliseconds entirely under the line means solving
`(quiet + x) / (total + x) = p`, so

```
x = (p × total − quiet) / (1 − p)
```

which is what the board shows. The target is the whole percentage printed
beside the leader's name, so two Classes showing the same number are tied and
the second reads "Tied for first" rather than a catch-up time of nothing. The
one exception is a lead the board rounds up to 100%: the sum then uses the
leader's unrounded share, because a Class at 99.6% can still be caught, and
only a Class that has never been over the line is genuinely out of reach.

A Class with no monitored time has nothing to build on and is listed under
"Not started yet" instead. The figure is said in words rather than as a
stopwatch — "28 min under the line to take first place", "3 h 48 min" past
the hour, "4 d 2 h" once a lead in the high nineties pushes it into days —
because nobody reads "227:42" at a glance, and the sentence is the
encouragement.

## Consequences

The score is cumulative across Sessions and visits, and is saved per Class
under the same storage prefix as its animals and Notes, so deleting a Class
deletes its Cup record too. `Reset` empties the Scene and does not touch the
Cup: one is about this lesson's animals, the other about the class's term. A
teacher who wants a fresh Cup therefore needs a new Class or a cleared browser
— a "reset the Cup" control is the obvious next step if it is asked for, and
is deliberately not being added before it is.

Every Class carries its place beside its percentage, and ties share one: two
Classes both showing 87% are both 1st, and the next is 3rd. The first of them
is drawn as first place, and the other reads "Tied for first" rather than a
catch-up time of nothing.
