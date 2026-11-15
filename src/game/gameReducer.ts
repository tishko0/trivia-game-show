import type { ActionOf, GameAction } from "./actions";
import { isEveryoneReady } from "./selectors";
import type { GameSettings, GameState, PlayerId } from "./types";

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

    // TODO: not implemented yet
    case "CATEGORY_PICKED":
    case "BET_SELECTED":
    case "BET_LOCKED":
    case "ANSWER_SELECTED":
    case "ANSWER_LOCKED":
    case "TIME_UP":
    case "PLAYER_LEFT":
      return state;

    default:
      return assertNever(action);
  }
}

function handlePlayerJoined(
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

function handleStartRequested(
  state: GameState,
  action: ActionOf<"START_REQUESTED">,
): GameState {
  if (state.phase !== "LOBBY") return state;
  if (!state.players[action.playerId]) return state;
  if (Object.keys(state.players).length < state.settings.minPlayersToStart) {
    return state;
  }

  return {
    ...state,
    phase: "READY_CHECK",
    phaseEndsAt: action.now + state.settings.readyCheckSeconds * 1000,
    readyPlayerIds: { [action.playerId]: true },
  };
}

function handlePlayerReady(
  state: GameState,
  action: ActionOf<"PLAYER_READY">,
): GameState {
  if (state.phase !== "READY_CHECK") return state;
  if (!state.players[action.playerId]) return state;

  const readyPlayerIds: Record<PlayerId, true> = {
    ...state.readyPlayerIds,
    [action.playerId]: true,
  };

  if (isEveryoneReady(state.players, readyPlayerIds)) {
    return {
      ...state,
      phase: "PICKING_CATEGORY",
      phaseEndsAt: null,
      readyPlayerIds: {},
    };
  }

  return { ...state, readyPlayerIds };
}

function assertNever(action: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
}
