import { createInitialState, gameReducer } from "./gameReducer";
import {
  DEFAULT_SETTINGS,
  type GameState,
  type Player,
  type Question,
} from "./types";

export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player1",
    name: "Player1",
    gamePoints: 1000,
    startingPoints: 1000,
    wallet: 5000,
    ...overrides,
  };
}

export function createLobbyWithPlayers(...players: Player[]): GameState {
  let state = createInitialState(DEFAULT_SETTINGS);

  for (const player of players) {
    state = gameReducer(state, { type: "PLAYER_JOINED", player });
  }

  return state;
}

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "question1",
    text: "What is the capital of France?",
    category: "Geography",
    correctAnswer: "Paris",
    wrongAnswers: ["London", "Berlin", "Madrid"],
    ...overrides,
  };
}

export function createGameAtPickingCategory(...players: Player[]): GameState {
  const [first, ...rest] = players;
  if (!first) {
    throw new Error("createGameAtPickingCategory needs at least one player");
  }

  let state = createLobbyWithPlayers(...players);
  state = gameReducer(state, {
    type: "START_REQUESTED",
    playerId: first.id,
    now: 1_000_000,
  });

  for (const player of rest) {
    state = gameReducer(state, {
      type: "PLAYER_READY",
      playerId: player.id,
      now: 1_000_001,
    });
  }

  return state;
}

export function createGameAtSpin(...players: Player[]): GameState {
  return gameReducer(createGameAtPickingCategory(...players), {
    type: "CATEGORY_PICKED",
    category: "Geography",
    questions: [1, 2, 3, 4, 5].map((n) => makeQuestion({ id: `q${n}` })),
    now: 2_000_000,
  });
}

export function timeUp(state: GameState): GameState {
  if (state.phaseEndsAt === null) {
    throw new Error("timeUp needs a phase with a deadline");
  }
  return gameReducer(state, { type: "TIME_UP", now: state.phaseEndsAt });
}

export function createGameAtQuestions(...players: Player[]): GameState {
  return timeUp(timeUp(timeUp(createGameAtSpin(...players))));
}
