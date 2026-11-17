import type { ActionOf } from "../actions";
import { isEveryoneReady } from "../selectors";
import type { GameState, PlayerId } from "../types";

export function handlePlayerJoined(
  state: GameState,
  action: ActionOf<"PLAYER_JOINED">,
): GameState {
  if (state.players[action.player.id]) return state;

  return {
    ...state,
    players: {
      ...state.players,
      [action.player.id]: action.player,
    },
  };
}

export function handleStartRequested(
  state: GameState,
  action: ActionOf<"START_REQUESTED">,
): GameState {
  if (state.phase !== "LOBBY") return state;
  if (!state.players[action.playerId]) return state;
  if (Object.keys(state.players).length < state.settings.minPlayersToStart) {
    return state;
  }

  const readyCheck: GameState = {
    ...state,
    phase: "READY_CHECK",
    phaseEndsAt: action.now + state.settings.readyCheckSeconds * 1000,
  };

  return withReadyPlayers(readyCheck, { [action.playerId]: true });
}

export function handlePlayerReady(
  state: GameState,
  action: ActionOf<"PLAYER_READY">,
): GameState {
  if (state.phase !== "READY_CHECK") return state;
  if (!state.players[action.playerId]) return state;

  return withReadyPlayers(state, {
    ...state.readyPlayerIds,
    [action.playerId]: true,
  });
}

export function toPickingCategory(state: GameState): GameState {
  return {
    ...state,
    phase: "PICKING_CATEGORY",
    phaseEndsAt: null,
    readyPlayerIds: {},
  };
}

function withReadyPlayers(
  state: GameState,
  readyPlayerIds: Record<PlayerId, true>,
): GameState {
  if (isEveryoneReady(state.players, readyPlayerIds)) {
    return toPickingCategory(state);
  }
  return { ...state, readyPlayerIds };
}
