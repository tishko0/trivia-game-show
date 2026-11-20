import { describe, expect, it } from "vitest";
import { gameReducer } from "./../gameReducer";
import {
  createGameAtBets,
  createGameAtQuestionsWithBets,
  makePlayer,
  placeBet,
  timeUp,
} from "./testHelper";
import { DEFAULT_SETTINGS, type GameState, type PlayerId } from "./../types";

const p1 = makePlayer({ id: "p1" });
const p2 = makePlayer({ id: "p2" });

function createPlayingGame(): GameState {
  return createGameAtQuestionsWithBets([p1, p2], ["p1", "p2"]);
}

function beforeDeadline(state: GameState): number {
  return (state.phaseEndsAt ?? 0) - 1;
}

function select(
  state: GameState,
  playerId: PlayerId,
  answer: string,
  questionId = "q1",
): GameState {
  return gameReducer(state, {
    type: "ANSWER_SELECTED",
    playerId,
    questionId,
    answer,
    now: beforeDeadline(state),
  });
}

function lock(
  state: GameState,
  playerId: PlayerId,
  questionId = "q1",
): GameState {
  return gameReducer(state, {
    type: "ANSWER_LOCKED",
    playerId,
    questionId,
    now: beforeDeadline(state),
  });
}

describe("ANSWER_SELECTED", () => {
  it("stores the selection as not locked", () => {
    const next = select(createPlayingGame(), "p1", "Paris");

    expect(next.round?.answers.p1?.q1).toEqual({
      answer: "Paris",
      locked: false,
    });
  });

  it("replaces an earlier selection", () => {
    const first = select(createPlayingGame(), "p1", "Paris");

    const next = select(first, "p1", "Berlin");

    expect(next.round?.answers.p1?.q1?.answer).toBe("Berlin");
  });

  it("copies only the changed player's path; other answers, bets and players stay the same objects", () => {
    const withP2 = select(createPlayingGame(), "p2", "London");

    const next = select(withP2, "p1", "Paris");

    expect(next.round?.answers.p2).toBe(withP2.round?.answers.p2);
    expect(next.round?.bets).toBe(withP2.round?.bets);
    expect(next.players).toBe(withP2.players);
  });

  it("ignores a selection outside QUESTIONS", () => {
    const spin = placeBet(createGameAtBets(p1, p2), "p1");

    const next = select(spin, "p1", "Paris");

    expect(next).toBe(spin);
  });

  it("ignores a late selection on the last question during ANSWERREVEAL", () => {
    let state = createPlayingGame();
    for (let i = 0; i < 5; i++) state = timeUp(state);
    expect(state.phase).toBe("ANSWERREVEAL");

    const next = select(state, "p1", "Paris", "q5");

    expect(next).toBe(state);
  });

  it("ignores a selection after the deadline", () => {
    const state = createPlayingGame();

    const next = gameReducer(state, {
      type: "ANSWER_SELECTED",
      playerId: "p1",
      questionId: "q1",
      answer: "Paris",
      now: state.phaseEndsAt ?? 0,
    });

    expect(next).toBe(state);
  });

  it("ignores a selection from a spectator", () => {
    const state = createGameAtQuestionsWithBets([p1, p2], ["p1"]);

    const next = select(state, "p2", "Paris");

    expect(next).toBe(state);
  });

  it("ignores a selection for a question that isn't the current one", () => {
    const state = createPlayingGame();

    const next = select(state, "p1", "Paris", "q2");

    expect(next).toBe(state);
  });

  it("ignores an answer that isn't one of the options", () => {
    const state = createPlayingGame();

    const next = select(state, "p1", "banana");

    expect(next).toBe(state);
  });

  it("ignores a selection after the answer is locked", () => {
    const locked = lock(select(createPlayingGame(), "p1", "Paris"), "p1");

    const next = select(locked, "p1", "Berlin");

    expect(next).toBe(locked);
  });
});

describe("ANSWER_LOCKED", () => {
  it("locks the selected answer", () => {
    const selected = select(createPlayingGame(), "p1", "Paris");

    const next = lock(selected, "p1");

    expect(next.round?.answers.p1?.q1).toEqual({
      answer: "Paris",
      locked: true,
    });
  });

  it("ignores a lock without a selection", () => {
    const state = createPlayingGame();

    const next = lock(state, "p1");

    expect(next).toBe(state);
  });

  it("ignores locking twice", () => {
    const locked = lock(select(createPlayingGame(), "p1", "Paris"), "p1");

    const next = lock(locked, "p1");

    expect(next).toBe(locked);
  });

  it("ignores a lock after the deadline", () => {
    const selected = select(createPlayingGame(), "p1", "Paris");

    const next = gameReducer(selected, {
      type: "ANSWER_LOCKED",
      playerId: "p1",
      questionId: "q1",
      now: selected.phaseEndsAt ?? 0,
    });

    expect(next).toBe(selected);
  });
  it("waits for the other players when only one has locked", () => {
    const next = lock(select(createPlayingGame(), "p1", "Paris"), "p1");

    expect(next.phase).toBe("QUESTIONS");
    expect(next.questionIndex).toBe(0);
  });

  it("moves to the next question as soon as everyone has locked", () => {
    let state = createPlayingGame();
    state = lock(select(state, "p1", "Paris"), "p1");
    state = select(state, "p2", "Berlin");
    const now = beforeDeadline(state);

    const next = gameReducer(state, {
      type: "ANSWER_LOCKED",
      playerId: "p2",
      questionId: "q1",
      now,
    });

    expect(next.questionIndex).toBe(1);
    expect(next.phaseEndsAt).toBe(
      now + DEFAULT_SETTINGS.questionTimerSeconds * 1000,
    );
  });

  it("ignores spectators when deciding whether everyone has locked", () => {
    const state = createGameAtQuestionsWithBets([p1, p2], ["p1"]);

    const next = lock(select(state, "p1", "Paris"), "p1");

    expect(next.questionIndex).toBe(1);
  });

  it("everyone has locked the last question and the game moves to ANSWERREVEAL", () => {
    let state = createPlayingGame();
    for (let i = 0; i <= 4; i++) {
      state = lock(select(state, "p1", "Paris", `q${i}`), "p1", `q${i}`);
      state = lock(select(state, "p2", "Berlin", `q${i}`), "p2", `q${i}`);
    }
    state = lock(select(state, "p1", "Paris", "q5"), "p1", "q5");
    state = select(state, "p2", "Berlin", "q5");
    expect(state.questionIndex).toBe(4);

    const now = beforeDeadline(state);

    const next = gameReducer(state, {
      type: "ANSWER_LOCKED",
      playerId: "p2",
      questionId: "q5",
      now,
    });

    expect(next.phase).toBe("ANSWERREVEAL");
    expect(next.phaseEndsAt).toBe(
      now + DEFAULT_SETTINGS.answerRevealSeconds * 1000,
    );
  });
});
