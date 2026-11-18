import type { Player, PlayerId, Question, QuestionId } from "./types";

export type GameAction =
  | { type: "PLAYER_JOINED"; player: Player }
  | { type: "START_REQUESTED"; playerId: PlayerId; now: number }
  | { type: "PLAYER_READY"; playerId: PlayerId; now: number }
  | {
      type: "CATEGORY_PICKED";
      category: string;
      questions: Question[];
      now: number;
    }
  | { type: "BET_SELECTED"; playerId: PlayerId; amount: number }
  | { type: "BET_LOCKED"; playerId: PlayerId; now: number }
  | {
      type: "ANSWER_SELECTED";
      playerId: PlayerId;
      questionId: QuestionId;
      answer: string;
      now: number;
    }
  | {
      type: "ANSWER_LOCKED";
      playerId: PlayerId;
      questionId: QuestionId;
      now: number;
    }
  | { type: "TIME_UP"; now: number }
  | { type: "PLAYER_LEFT"; playerId: PlayerId; now: number };

export type ActionOf<T extends GameAction["type"]> = Extract<
  GameAction,
  { type: T }
>;
