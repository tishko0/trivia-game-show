import { describe, expect, it } from "vitest";
import { gameReducer } from "./../gameReducer";
import { isSpectating } from "./../selectors";
import {
  createGameAtBets,
  createGameAtSpin,
  makePlayer,
  timeUp,
} from "./testHelper";
import { DEFAULT_SETTINGS, type GameState, type PlayerId } from "./../types";

const p1 = makePlayer({ id: "p1" });
const p2 = makePlayer({ id: "p2" });

function beforeDeadline(state: GameState): number {
  return (state.phaseEndsAt ?? 0) - 1;
}

function selectBet(state: GameState, playerId: PlayerId, amount: number) {
  return gameReducer(state, {
    type: "BET_SELECTED",
    playerId,
    amount,
    now: beforeDeadline(state),
  });
}

function lockBet(state: GameState, playerId: PlayerId) {
  return gameReducer(state, {
    type: "BET_LOCKED",
    playerId,
    now: beforeDeadline(state),
  });
}

describe("BET_SELECTED", () => {
  it("stores the selection as not locked", () => {
    const next = selectBet(createGameAtBets(p1, p2), "p1", 100);

    expect(next.round?.bets.p1).toEqual({ amount: 100, locked: false });
  });

  it("replaces an earlier selection", () => {
    const first = selectBet(createGameAtBets(p1, p2), "p1", 100);

    const next = selectBet(first, "p1", 200);

    expect(next.round?.bets.p1?.amount).toBe(200);
  });

  it.each([
    [40, "below the minimum"],
    [70, "not on a step"],
    [520, "above the maximum"],
  ])("ignores %i (%s)", (amount) => {
    const state = createGameAtBets(p1, p2);

    expect(selectBet(state, "p1", amount)).toBe(state);
  });

  it("caps the bet at the player's points, rounded down to a step", () => {
    const poorer = makePlayer({ id: "p3", gamePoints: 333 });
    const state = createGameAtBets(poorer, p1);

    expect(selectBet(state, "p3", 320).round?.bets.p3?.amount).toBe(320);
    expect(selectBet(state, "p3", 340)).toBe(state);
  });

  it("ignores a selection outside BETS", () => {
    const spin = createGameAtSpin(p1);

    expect(selectBet(spin, "p1", 100)).toBe(spin);
  });

  it("ignores a selection after the deadline", () => {
    const state = createGameAtBets(p1, p2);

    const next = gameReducer(state, {
      type: "BET_SELECTED",
      playerId: "p1",
      amount: 100,
      now: state.phaseEndsAt ?? 0,
    });

    expect(next).toBe(state);
  });

  it("ignores a selection from a player who isn't in the game", () => {
    const state = createGameAtBets(p1, p2);

    expect(selectBet(state, "stranger", 100)).toBe(state);
  });

  it("ignores a selection after the bet is locked", () => {
    const locked = lockBet(
      selectBet(createGameAtBets(p1, p2), "p1", 100),
      "p1",
    );

    expect(selectBet(locked, "p1", 200)).toBe(locked);
  });
});

describe("BET_LOCKED", () => {
  it("locks the selected amount", () => {
    const selected = selectBet(createGameAtBets(p1, p2), "p1", 100);

    const next = lockBet(selected, "p1");

    expect(next.round?.bets.p1).toEqual({ amount: 100, locked: true });
  });

  it("ignores a lock without a selection", () => {
    const state = createGameAtBets(p1, p2);

    expect(lockBet(state, "p1")).toBe(state);
  });

  it("waits for the other players when only one has locked", () => {
    const next = lockBet(selectBet(createGameAtBets(p1, p2), "p1", 100), "p1");

    expect(next.phase).toBe("BETS");
  });

  it("moves to GET_READY as soon as everyone has locked", () => {
    let state = createGameAtBets(p1, p2);
    state = lockBet(selectBet(state, "p1", 100), "p1");
    state = selectBet(state, "p2", 60);
    const now = beforeDeadline(state);

    const next = gameReducer(state, {
      type: "BET_LOCKED",
      playerId: "p2",
      now,
    });

    expect(next.phase).toBe("GET_READY");
    expect(next.phaseEndsAt).toBe(
      now + DEFAULT_SETTINGS.getReadyCountdown * 1000,
    );
  });

  it("doesn't wait for players who can't afford the minimum bet", () => {
    const broke = makePlayer({ id: "broke", gamePoints: 40 });

    const next = lockBet(
      selectBet(createGameAtBets(p1, broke), "p1", 100),
      "p1",
    );

    expect(next.phase).toBe("GET_READY");
  });
});

describe("when the bet timer runs out", () => {
  it("counts a selection that wasn't locked", () => {
    const state = selectBet(createGameAtBets(p1, p2), "p1", 100);

    const next = timeUp(state);

    expect(next.phase).toBe("GET_READY");
    expect(isSpectating(next, "p1")).toBe(false);
    expect(next.round?.bets.p1?.amount).toBe(100);
  });

  it("makes a player who never bet a spectator for the round", () => {
    const state = selectBet(createGameAtBets(p1, p2), "p1", 100);

    const next = timeUp(state);

    expect(isSpectating(next, "p2")).toBe(true);
  });
});
