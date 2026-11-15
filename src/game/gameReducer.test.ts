import { describe, expect, it } from "vitest";
import {
  createGameAtPickingCategory,
  createLobbyWithPlayers,
  makePlayer,
  makeQuestion,
} from "./testHelper";
import { createInitialState, gameReducer } from "./gameReducer";
import { DEFAULT_SETTINGS } from "./types";

describe("gameReducer", () => {
  it("adds a player who joins the lobby", () => {
    const state = createInitialState(DEFAULT_SETTINGS);
    const player = makePlayer();

    const next = gameReducer(state, { type: "PLAYER_JOINED", player });

    expect(next.players[player.id]).toEqual(player);
  });
  it("ignores same player joining twice", () => {
    const state = createInitialState(DEFAULT_SETTINGS);
    const player = makePlayer({ id: "ana", name: "Ana" });
    const duplicatePlayer = makePlayer({ id: "ana", name: "Impostor" });

    const firstPlayerState = gameReducer(state, {
      type: "PLAYER_JOINED",
      player: player,
    });
    const secondPlayerState = gameReducer(firstPlayerState, {
      type: "PLAYER_JOINED",
      player: duplicatePlayer,
    });

    expect(secondPlayerState.players[player.id]).toEqual(player);
  });
  it("starts ready check once a player presses start", () => {
    const now = 1_000_000;
    const state = createInitialState({
      ...DEFAULT_SETTINGS,
      readyCheckSeconds: 60,
    });
    const player = makePlayer();

    const next = gameReducer(state, { type: "PLAYER_JOINED", player });
    const startPhase = gameReducer(next, {
      type: "START_REQUESTED",
      now,
      playerId: player.id,
    });

    expect(startPhase.readyPlayerIds[player.id]).toBe(true);
    expect(startPhase.phase).toEqual("READY_CHECK");
    expect(startPhase.phaseEndsAt).toEqual(1_060_000);
  });

  it("marks a player as ready after pressing confirming ready check", () => {
    const p1 = makePlayer({ id: "p1" });
    const p2 = makePlayer({ id: "p2" });
    const p3 = makePlayer({ id: "p3" });

    const readyCheck = gameReducer(createLobbyWithPlayers(p1, p2, p3), {
      type: "START_REQUESTED",
      playerId: "p1",
      now: 1_000_000,
    });

    const next = gameReducer(readyCheck, {
      type: "PLAYER_READY",
      playerId: "p2",
      now: 1_005_000,
    });

    expect(next.readyPlayerIds).toEqual({ p1: true, p2: true });
  });

  it("ignores a start request when the ready check is already running", () => {
    const p1 = makePlayer({ id: "p1" });
    const p2 = makePlayer({ id: "p2" });
    const readyCheck = gameReducer(createLobbyWithPlayers(p1, p2), {
      type: "START_REQUESTED",
      playerId: "ana",
      now: 1_000_000,
    });

    const next = gameReducer(readyCheck, {
      type: "START_REQUESTED",
      playerId: "ben",
      now: 1_010_000,
    });

    expect(next).toBe(readyCheck);
  });

  it("ignores a start request from a player who isn't in the lobby", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "ana" }));

    const next = gameReducer(lobby, {
      type: "START_REQUESTED",
      playerId: "stranger",
      now: 1_000_000,
    });

    expect(next).toBe(lobby);
  });

  it("when all players have pressed Ready, phase becomes PICKING_CATEGORY", () => {
    const p1 = makePlayer({ id: "p1" });
    const p2 = makePlayer({ id: "p2" });
    const p3 = makePlayer({ id: "p3" });

    const readyCheck = gameReducer(createLobbyWithPlayers(p1, p2, p3), {
      type: "START_REQUESTED",
      playerId: "p1",
      now: 1_000_000,
    });

    const p1Ready = gameReducer(readyCheck, {
      type: "PLAYER_READY",
      playerId: "p2",
      now: 1_005_000,
    });

    const next = gameReducer(p1Ready, {
      type: "PLAYER_READY",
      playerId: "p3",
      now: 1_005_000,
    });

    expect(next.phase).toBe("PICKING_CATEGORY");
    expect(next.phaseEndsAt).toBe(null);
  });

  it("creates round 1 when a category is picked", () => {
    const state = createGameAtPickingCategory(makePlayer({ id: "p1" }));
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];

    const next = gameReducer(state, {
      type: "CATEGORY_PICKED",
      category: "Geography",
      questions,
      now: 1_000_000,
    });

    expect(next.round).toEqual({
      category: "Geography",
      questions,
      bets: {},
      answers: {},
      roundNumber: 1,
    });
  });
});
