import type { ActionOf } from "../actions";
import { assertNever } from "../../lib/assertNever";
import { isPhaseOver } from "../selectors";
import type { GameState } from "../types";
import { toPickingCategory } from "./lobby";

export function handleCategoryPicked(
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

export function handleTimeUp(
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
      return toGetReady(state, deadline);
    case "GET_READY":
      return {
        ...state,
        phase: "QUESTIONS",
        questionIndex: 0,
        phaseEndsAt: deadline + state.settings.questionTimerSeconds * 1000,
      };
    case "QUESTIONS": {
      return toNextQuestion(state, deadline);
    }
    case "ANSWERREVEAL":
      return state;
    case "LOBBY":
    case "PICKING_CATEGORY":
    case "FINAL_SCORE":
      return state;
    default:
      return assertNever(state.phase);
  }
}

export function toNextQuestion(state: GameState, startAt: number): GameState {
  const round = state.round;
  if (!round) return state;

  if (state.questionIndex + 1 < round.questions.length) {
    return {
      ...state,
      questionIndex: state.questionIndex + 1,
      phaseEndsAt: startAt + state.settings.questionTimerSeconds * 1000,
    };
  }

  return {
    ...state,
    phaseEndsAt: startAt + state.settings.answerRevealSeconds * 1000,
    phase: "ANSWERREVEAL",
  };
}

export function toGetReady(state: GameState, startAt: number): GameState {
  return {
    ...state,
    phase: "GET_READY",
    phaseEndsAt: startAt + state.settings.getReadyCountdown * 1000,
  };
}
