import type { ActionOf, GameAction } from "./actions";
import { isEveryoneReady, isPhaseOver, toPickingCategory } from "./selectors";
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

function withReadyPlayers(
  state: GameState,
  readyPlayerIds: Record<PlayerId, true>,
): GameState {
  if (isEveryoneReady(state.players, readyPlayerIds)) {
    return toPickingCategory(state);
  }
  return { ...state, readyPlayerIds };
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

  const readyCheck: GameState = {
    ...state,
    phase: "READY_CHECK",
    phaseEndsAt: action.now + state.settings.readyCheckSeconds * 1000,
  };

  return withReadyPlayers(readyCheck, { [action.playerId]: true });
}

function handlePlayerReady(
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

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

function handleCategoryPicked(
  state: GameState,
  action: ActionOf<"CATEGORY_PICKED">,
): GameState {
  if (state.phase !== "PICKING_CATEGORY") return state;

  return {
    ...state,
    phase: "SPIN",
    phaseEndsAt: action.now + state.settings.spinSeconds * 1000,
    questionIndex: 0,
    round: {
      category: action.category,
      questions: action.questions,
      bets: {},
      answers: {},
      roundNumber: (state.round?.roundNumber ?? 0) + 1,
    },
  };
}

function handleTimeUp(
  state: GameState,
  action: ActionOf<"TIME_UP">,
): GameState {
  if (!isPhaseOver(state, action.now)) return state;
  const deadline = state.phaseEndsAt;

  switch (state.phase) {
    case "READY_CHECK":
      return toPickingCategory(state);
    case "SPIN":
      return {
        ...state,
        phase: "BETS",
        phaseEndsAt: deadline + state.settings.betTimerSeconds * 1000,
      };
    case "BETS":
      return {
        ...state,
        phase: "GET_READY",
        phaseEndsAt: deadline + state.settings.getReadyCountdown * 1000,
      };
    case "GET_READY":
      return {
        ...state,
        phase: "QUESTIONS",
        questionIndex: 0,
        phaseEndsAt: deadline + state.settings.questionTimerSeconds * 1000,
      };

    //todo
    case "LOBBY":
    case "PICKING_CATEGORY":
    case "QUESTIONS": // next step
    case "ANSWERREVEAL":
    case "FINAL_SCORE":
      return state;
    default:
      return assertNever(state.phase);
  }
}
