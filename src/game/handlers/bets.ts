import type { ActionOf } from "../actions";
import { isEveryoneBetLocked, isPhaseOver, isValidBet } from "../selectors";
import type { GameState } from "../types";
import { toGetReady } from "./round";

export function handleBetSelected(
  state: GameState,
  action: ActionOf<"BET_SELECTED">,
): GameState {
  if (state.phase !== "BETS") return state;
  if (isPhaseOver(state, action.now)) return state;
  if (!state.round) return state;

  const player = state.players[action.playerId];
  if (!player) return state;
  if (!isValidBet(action.amount, player.gamePoints, state.settings)) {
    return state;
  }

  const existingBet = state.round.bets[action.playerId];
  if (existingBet?.locked) return state;

  return {
    ...state,
    round: {
      ...state.round,
      bets: {
        ...state.round.bets,
        [action.playerId]: { amount: action.amount, locked: false },
      },
    },
  };
}

export function handleBetLocked(
  state: GameState,
  action: ActionOf<"BET_LOCKED">,
): GameState {
  if (state.phase !== "BETS") return state;
  if (isPhaseOver(state, action.now)) return state;
  if (!state.round) return state;

  const existingBet = state.round.bets[action.playerId];
  if (!existingBet) return state;
  if (existingBet.locked) return state;

  const next: GameState = {
    ...state,
    round: {
      ...state.round,
      bets: {
        ...state.round.bets,
        [action.playerId]: { ...existingBet, locked: true },
      },
    },
  };

  if (isEveryoneBetLocked(next)) return toGetReady(next, action.now);
  return next;
}
