import { createInitialState, gameReducer } from "./gameReducer";
import { PlayerId } from "./types";
import {
  DEFAULT_SETTINGS,
  type GameState,
  playerId,
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
  let state = createInitialState(DEFAULT_SETTINGS);

  for (const player of players) {
    state = gameReducer(state, { type: "PLAYER_JOINED", player });
  }
  state = gameReducer(state, {
    type: "START_REQUESTED",
    playerId: playerId,
    now: 1_000_000,
  });

  const [first, ...rest] = players;
  if (!first)
    throw new Error("createGameAtPickingCategory needs at least one player");

  for (const player of rest) {
    state = gameReducer(state, {
      type: "PLAYER_READY",
      playerId: player.id,
      now: 1_000_001,
    });
  }

  return state;
}
