export type PlayerId = string;
export type QuestionId = string;
export type PlayerAnswer = {
  answer: string;
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
  bets: Record<PlayerId, number>;
  answers: Record<PlayerId, Record<QuestionId, PlayerAnswer>>;
  roundNumber: number;
};

export type Phase =
  | "LOBBY"
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
  betSliderStep: number;
};

export const DEFAULT_SETTINGS: GameSettings = {
  rounds: 10,
  questionTimerSeconds: 20,
  betTimerSeconds: 15,
  questionsPerRound: 5,
  minBet: 60,
  maxBet: 500,
  getReadyCountdown: 3,
  betSliderStep: 20,
};

export type GameState = {
  phase: Phase;
  players: Record<PlayerId, Player>;
  round: Round | null;
  currentQuestion: number;
  questionsPerRound: number;
  phaseEnd: number | null;
  settings: GameSettings;
};
