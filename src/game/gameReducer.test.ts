import { describe, expect, it } from "vitest";
import {
  createGameAtPickingCategory,
  createGameAtQuestions,
  createGameAtSpin,
  createLobbyWithPlayers,
  makePlayer,
  makeQuestion,
  timeUp,
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
    const player = makePlayer({ id: "p1" });
    const other = makePlayer({ id: "p2" });

    const lobby = gameReducer(
      gameReducer(state, { type: "PLAYER_JOINED", player }),
      { type: "PLAYER_JOINED", player: other },
    );
    const startPhase = gameReducer(lobby, {
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
    const readyCheck = createLobbyWithPlayers(
      makePlayer({ id: "p1" }),
      makePlayer({ id: "p2" }),
    );
    const started = gameReducer(readyCheck, {
      type: "START_REQUESTED",
      playerId: "p1",
      now: 1_000_000,
    });
    expect(started.phase).toBe("READY_CHECK");

    const next = gameReducer(started, {
      type: "START_REQUESTED",
      playerId: "p2",
      now: 1_010_000,
    });

    expect(next).toBe(started);
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
    expect(state.phase).toBe("PICKING_CATEGORY");

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

  it("goes straight to PICKING_CATEGORY when the only player presses Start", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "p1" }));

    const next = gameReducer(lobby, {
      type: "START_REQUESTED",
      playerId: "p1",
      now: 1_000_000,
    });

    expect(next.phase).toBe("PICKING_CATEGORY");
    expect(next.phaseEndsAt).toBe(null);
  });

  it("moves to SPIN with a deadline when a category is picked", () => {
    const state = createGameAtPickingCategory(
      makePlayer({ id: "p1" }),
      makePlayer({ id: "p2" }),
    );
    expect(state.phase).toBe("PICKING_CATEGORY");

    const next = gameReducer(state, {
      type: "CATEGORY_PICKED",
      category: "Geography",
      questions: [makeQuestion()],
      now: 1_000_000,
    });

    expect(next.phase).toBe("SPIN");
    expect(next.phaseEndsAt).toBe(
      1_000_000 + DEFAULT_SETTINGS.spinSeconds * 1000,
    );
  });

  it("ignores a picked category outside PICKING_CATEGORY", () => {
    const lobby = createLobbyWithPlayers(makePlayer({ id: "p1" }));

    const next = gameReducer(lobby, {
      type: "CATEGORY_PICKED",
      category: "Geography",
      questions: [makeQuestion()],
      now: 1_000_000,
    });

    expect(next).toBe(lobby);
  });

  describe("TIME_UP", () => {
    it("ignores a TIME_UP that arrives before the deadline", () => {
      const spin = createGameAtSpin(makePlayer({ id: "p1" }));

      const next = gameReducer(spin, {
        type: "TIME_UP",
        now: (spin.phaseEndsAt ?? 0) - 1,
      });

      expect(next).toBe(spin);
    });

    it("ignores a TIME_UP in a phase without a deadline", () => {
      const lobby = createLobbyWithPlayers(makePlayer({ id: "p1" }));

      const next = gameReducer(lobby, { type: "TIME_UP", now: 9_999_999 });

      expect(next).toBe(lobby);
    });

    it("ends the ready check when time runs out", () => {
      const readyCheck = gameReducer(
        createLobbyWithPlayers(
          makePlayer({ id: "p1" }),
          makePlayer({ id: "p2" }),
        ),
        { type: "START_REQUESTED", playerId: "p1", now: 1_000_000 },
      );
      expect(readyCheck.phase).toBe("READY_CHECK");

      const next = timeUp(readyCheck);

      expect(next.phase).toBe("PICKING_CATEGORY");
      expect(next.phaseEndsAt).toBe(null);
      expect(next.readyPlayerIds).toEqual({});
    });

    it("moves from SPIN to BETS", () => {
      const spin = createGameAtSpin(makePlayer({ id: "p1" }));

      const next = timeUp(spin);

      expect(next.phase).toBe("BETS");
      expect(next.phaseEndsAt).toBe(
        (spin.phaseEndsAt ?? 0) + DEFAULT_SETTINGS.betTimerSeconds * 1000,
      );
    });

    it("moves from BETS to GET_READY", () => {
      const bets = timeUp(createGameAtSpin(makePlayer({ id: "p1" })));
      expect(bets.phase).toBe("BETS");

      const next = timeUp(bets);

      expect(next.phase).toBe("GET_READY");
      expect(next.phaseEndsAt).toBe(
        (bets.phaseEndsAt ?? 0) + DEFAULT_SETTINGS.getReadyCountdown * 1000,
      );
    });

    it("moves from GET_READY to the first question", () => {
      const getReady = timeUp(
        timeUp(createGameAtSpin(makePlayer({ id: "p1" }))),
      );
      expect(getReady.phase).toBe("GET_READY");

      const next = timeUp(getReady);

      expect(next.phase).toBe("QUESTIONS");
      expect(next.questionIndex).toBe(0);
      expect(next.phaseEndsAt).toBe(
        (getReady.phaseEndsAt ?? 0) +
          DEFAULT_SETTINGS.questionTimerSeconds * 1000,
      );
    });

    it("ignores other actions sent after the deadline", () => {
      const spin = createGameAtSpin(makePlayer({ id: "p1" }));

      const next = gameReducer(spin, {
        type: "BET_LOCKED",
        playerId: "p1",
        now: (spin.phaseEndsAt ?? 0) + 1,
      });

      expect(next).toBe(spin);
    });

    it("chains the next deadline from the previous one, not from a late timer", () => {
      const spin = createGameAtSpin(makePlayer({ id: "p1" }));
      const deadline = spin.phaseEndsAt ?? 0;

      const next = gameReducer(spin, { type: "TIME_UP", now: deadline + 300 });

      expect(next.phaseEndsAt).toBe(
        deadline + DEFAULT_SETTINGS.betTimerSeconds * 1000,
      );
    });

    it("moves to the next question when time runs out", () => {
      const first = createGameAtQuestions(makePlayer({ id: "p1" }));
      expect(first.phase).toBe("QUESTIONS");
      expect(first.questionIndex).toBe(0);

      const next = timeUp(first);

      expect(next.phase).toBe("QUESTIONS");
      expect(next.questionIndex).toBe(1);
      expect(next.phaseEndsAt).toBe(
        (first.phaseEndsAt ?? 0) + DEFAULT_SETTINGS.questionTimerSeconds * 1000,
      );
    });

    it("moves to ANSWERREVEAL after the last question", () => {
      let state = createGameAtQuestions(makePlayer({ id: "p1" }));
      for (let i = 0; i < 4; i++) state = timeUp(state);
      expect(state.questionIndex).toBe(4);

      const next = timeUp(state);

      expect(next.phase).toBe("ANSWERREVEAL");
      expect(next.phaseEndsAt).toBe(
        (state.phaseEndsAt ?? 0) + DEFAULT_SETTINGS.answerRevealSeconds * 1000,
      );
    });
  });
});
