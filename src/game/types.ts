export type PlayerId = string;
export type QuestionId = string;
export type PlayerAnswer = {
  answer: string;
  locked: boolean;
};
export type PlayerBet = {
  amount: number;
  locked: boolean;
};

export type Question = {
  id: string;
  correctAnswer: string;
  wrongAnswers: string[];
  text: string;
  category: string;
};

export type Player = {
  id: string;
  name: string;
  gamePoints: number;
  wallet: number;
  startingPoints: number;
};

export type Round = {
  category: string;
  questions: Question[];
  bets: Record<PlayerId, PlayerBet>;
  answers: Record<PlayerId, Record<QuestionId, PlayerAnswer>>;
  roundNumber: number;
};

export type Phase =
  | "LOBBY"
  | "READY_CHECK"
  | "PICKING_CATEGORY"
  | "SPIN"
  | "BETS"
  | "GET_READY"
  | "QUESTIONS"
  | "ANSWERREVEAL"
  | "FINAL_SCORE";

export type GameSettings = {
  rounds: number;
  questionTimerSeconds: number;
  betTimerSeconds: number;
  questionsPerRound: number;
  minBet: number;
  maxBet: number;
  getReadyCountdown: number;
  betStep: number;
  minPlayersToStart: number;
  readyCheckSeconds: number;
  spinSeconds: number;
  answerRevealSeconds: number;
};

export const DEFAULT_SETTINGS: GameSettings = {
  rounds: 10,
  questionTimerSeconds: 20,
  betTimerSeconds: 15,
  questionsPerRound: 5,
  minBet: 60,
  maxBet: 500,
  getReadyCountdown: 3,
  betStep: 20,
  minPlayersToStart: 1,
  readyCheckSeconds: 60,
  spinSeconds: 5,
  answerRevealSeconds: 8,
};

export type GameState = {
  phase: Phase;
  players: Record<PlayerId, Player>;
  round: Round | null;
  questionIndex: number;
  phaseEndsAt: number | null;
  settings: GameSettings;
  readyPlayerIds: Record<PlayerId, true>;
};
