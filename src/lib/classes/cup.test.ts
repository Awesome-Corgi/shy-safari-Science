import { describe, expect, it } from "bun:test";
import {
  addMonitored,
  catchUpMs,
  emptyScore,
  formatQuiet,
  hasTime,
  parseCupScore,
  percent,
  placeOf,
  roundedPercent,
} from "./cup";

describe("addMonitored", () => {
  it("counts quiet and loud time towards the total", () => {
    let score = emptyScore();
    score = addMonitored(score, 1000, true);
    score = addMonitored(score, 3000, false);
    expect(score).toEqual({ quietMs: 1000, totalMs: 4000 });
  });

  it("ignores a frame with no time in it", () => {
    const score = { quietMs: 5, totalMs: 10 };
    expect(addMonitored(score, 0, true)).toBe(score);
    expect(addMonitored(score, -20, true)).toBe(score);
  });
});

describe("percent", () => {
  it("is the share of monitored time under the line", () => {
    expect(percent({ quietMs: 30_000, totalMs: 120_000 })).toBe(25);
    expect(roundedPercent({ quietMs: 20_000, totalMs: 30_000 })).toBe(67);
  });

  it("is unknown until the class has been monitored", () => {
    expect(percent(emptyScore())).toBeNull();
    expect(roundedPercent(emptyScore())).toBeNull();
    expect(hasTime(emptyScore())).toBe(false);
  });
});

describe("catchUpMs", () => {
  it("solves for the quiet time needed to reach the leader", () => {
    // 40% of ten minutes, chasing 80%: (0.8 × 10 − 4) / 0.2 = 20 minutes.
    expect(catchUpMs({ quietMs: 240_000, totalMs: 600_000 }, 80)).toBe(
      1_200_000,
    );
  });

  it("needs nothing from a class already tied for first", () => {
    expect(catchUpMs({ quietMs: 60_000, totalMs: 60_000 }, 100)).toBeNull();
    expect(catchUpMs({ quietMs: 500, totalMs: 1000 }, 50)).toBe(0);
    expect(catchUpMs({ quietMs: 900, totalMs: 1000 }, 50)).toBe(0);
  });

  it("cannot be done from nothing, or against a perfect leader", () => {
    expect(catchUpMs(emptyScore(), 50)).toBeNull();
    expect(catchUpMs({ quietMs: 999, totalMs: 1000 }, 100)).toBeNull();
  });
});

describe("formatQuiet", () => {
  it("reads as whole seconds and minutes, never a stopwatch", () => {
    expect(formatQuiet(0)).toBe("1 s");
    expect(formatQuiet(45_000)).toBe("45 s");
    expect(formatQuiet(125_000)).toBe("2 min");
  });

  it("switches to hours rather than counting past sixty minutes", () => {
    expect(formatQuiet(3_600_000)).toBe("1 h");
    expect(formatQuiet(13_661_500)).toBe("3 h 48 min");
  });

  it("counts in days once a long catch-up runs past two of them", () => {
    expect(formatQuiet(172_800_000)).toBe("2 d");
    expect(formatQuiet(216_000_000)).toBe("2 d 12 h");
  });
});

describe("placeOf", () => {
  it("counts the classes ahead, sharing a place on equal percentages", () => {
    expect(placeOf(87, [87, 67, 50])).toBe(1);
    expect(placeOf(67, [87, 67, 50])).toBe(2);
    expect(placeOf(50, [87, 67, 50])).toBe(3);
    expect(placeOf(87, [87, 87, 50])).toBe(1);
    expect(placeOf(87, [87, 87, 50])).toBe(1);
  });

  it("ignores classes with no score yet", () => {
    expect(placeOf(50, [87, null, 50, 49])).toBe(2);
    expect(placeOf(72, [null, null])).toBe(1);
  });
});

describe("parseCupScore", () => {
  it("accepts what was saved", () => {
    expect(parseCupScore({ quietMs: 10, totalMs: 20 })).toEqual({
      quietMs: 10,
      totalMs: 20,
    });
  });

  it("keeps quiet time inside the total and drops nonsense", () => {
    expect(parseCupScore({ quietMs: 40, totalMs: 20 })).toEqual({
      quietMs: 20,
      totalMs: 20,
    });
    expect(parseCupScore({ quietMs: -40, totalMs: -20 })).toEqual({
      quietMs: 0,
      totalMs: 0,
    });
    expect(parseCupScore(null)).toBeNull();
    expect(parseCupScore({ quietMs: "many" })).toBeNull();
  });
});
