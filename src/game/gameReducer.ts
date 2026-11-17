import type { GameAction } from "./actions";
import { assertNever } from "../lib/assertNever";
import {
  handlePlayerJoined,
  handlePlayerReady,
  handleStartRequested,
} from "./handlers/lobby";
import { handleCategoryPicked, handleTimeUp } from "./handlers/round";
import type { GameSettings, GameState } from "./types";

export function createInitialState(settings: GameSettings): GameState {
  return {
    phase: "LOBBY",
    players: {},
    round: null,
    questionIndex: 0,
    phaseEndsAt: null,
    settings,
    readyPlayerIds: {},
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "PLAYER_JOINED":
      return handlePlayerJoined(state, action);
    case "START_REQUESTED":
      return handleStartRequested(state, action);
    case "PLAYER_READY":
      return handlePlayerReady(state, action);
    case "CATEGORY_PICKED":
      return handleCategoryPicked(state, action);
    case "TIME_UP":
      return handleTimeUp(state, action);

    // TODO: not implemented yet
    case "BET_SELECTED":
    case "BET_LOCKED":
    case "ANSWER_SELECTED":
    case "ANSWER_LOCKED":
    case "PLAYER_LEFT":
      return state;

    default:
      return assertNever(action);
  }
}
