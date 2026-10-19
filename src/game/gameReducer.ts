import type { GameAction } from "./actions";
import type { GameSettings, GameState } from "./types";

export function createInitialState(settings: GameSettings): GameState {
  return {
    phase: "LOBBY",
    players: {},
    round: null,
    questionIndex: 0,
    phaseEndsAt: null,
    settings: settings,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "PLAYER_JOINED") {
    if (state.players[action.player.id]) return state;
    return {
      ...state,
      players: {
        ...state.players,
        [action.player.id]: action.player,
      },
    };
  }
  return state;
}
