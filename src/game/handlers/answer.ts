import type { ActionOf } from "../actions";
import {
  answerOptions,
  isEveryoneLocked,
  isPhaseOver,
  isSpectating,
} from "../selectors";
import type { GameState } from "../types";
import { toNextQuestion } from "./round";

export function handleAnswerSelected(
  state: GameState,
  action: ActionOf<"ANSWER_SELECTED">,
): GameState {
  if (state.phase !== "QUESTIONS") return state;
  if (isPhaseOver(state, action.now)) return state;
  if (!state.round) return state;
  if (isSpectating(state, action.playerId)) return state;

  const question = state.round.questions[state.questionIndex];
  if (!question) return state;
  if (action.questionId !== question.id) return state;
  if (!answerOptions(question).includes(action.answer)) return state;

  const existingAnswer =
    state.round.answers[action.playerId]?.[action.questionId];
  if (existingAnswer?.locked) return state;

  return {
    ...state,
    round: {
      ...state.round,
      answers: {
        ...state.round.answers,
        [action.playerId]: {
          ...state.round.answers[action.playerId],
          [action.questionId]: {
            answer: action.answer,
            locked: false,
          },
        },
      },
    },
  };
}

export function handleAnswerLocked(
  state: GameState,
  action: ActionOf<"ANSWER_LOCKED">,
): GameState {
  if (state.phase !== "QUESTIONS") return state;
  if (isPhaseOver(state, action.now)) return state;
  if (!state.round) return state;
  if (isSpectating(state, action.playerId)) return state;

  const question = state.round.questions[state.questionIndex];
  if (!question) return state;
  if (action.questionId !== question.id) return state;

  const existingAnswer =
    state.round.answers[action.playerId]?.[action.questionId];
  if (!existingAnswer) return state;
  if (existingAnswer.locked) return state;

  const next = {
    ...state,
    round: {
      ...state.round,
      answers: {
        ...state.round.answers,
        [action.playerId]: {
          ...state.round.answers[action.playerId],
          [action.questionId]: {
            ...existingAnswer,
            locked: true,
          },
        },
      },
    },
  };

  if (isEveryoneLocked(next)) return toNextQuestion(next, action.now);

  return next;
}
