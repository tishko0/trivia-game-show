import { describe, expect, it } from "vitest";
import { maxBetFor, isSpectating, isPhaseOver } from "./selectors";
import { createLobbyWithPlayers, makePlayer } from "./testHelper";
import { DEFAULT_SETTINGS } from "./types";

describe("maxBetFor", () => {
  it.each([
    [1000, 500], // capped at maxBet
    [500, 500], // exactly maxBet
    [333, 320], // rounded down to a valid step
    [70, 60], // only the minimum fits
    [60, 60], // exactly the minimum
    [59, 0], // can't afford the minimum
  ])("with %i points, the max bet is %i", (points, expected) => {
    expect(maxBetFor(points, DEFAULT_SETTINGS)).toBe(expected);
  });

  it("respects minBet when it isn't a multiple of betStep", () => {
    const settings = { ...DEFAULT_SETTINGS, minBet: 50, betStep: 20 };
    // valid bets: 50, 70, 90, ...
    expect(maxBetFor(95, settings)).toBe(90);
  });
});

describe("isSpectating", () => {
  it("is false when there is no round yet", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "ana" }));
    expect(isSpectating(lobby, "ana")).toBe(false);
  });

  it("is true for a player with no bet in the current round", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "ana" }));
    const state = {
      ...lobby,
      round: {
        category: "Space",
        questions: [],
        bets: {},
        answers: {},
        roundNumber: 1,
      },
    };
    expect(isSpectating(state, "ana")).toBe(true);
  });

  it("is false for a player with a bet in the current round", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "ana" }));
    const state = {
      ...lobby,
      round: {
        category: "Space",
        questions: [],
        bets: { ana: { amount: 100, locked: true } },
        answers: {},
        roundNumber: 1,
      },
    };
    expect(isSpectating(state, "ana")).toBe(false);
  });
});

describe("isPhaseOver", () => {
  const lobby = createLobbyWithPlayers(makePlayer({ id: "p1" }));
  const timed = { ...lobby, phaseEndsAt: 1_000_000 };

  it("is false when the phase has no deadline", () => {
    expect(isPhaseOver(lobby, 9_999_999)).toBe(false);
  });

  it.each([
    [999_999, false],
    [1_000_000, true],
    [1_000_001, true],
  ])("at now=%i returns %s", (now, expected) => {
    expect(isPhaseOver(timed, now)).toBe(expected);
  });
});
