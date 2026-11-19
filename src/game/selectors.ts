import type {
  GameSettings,
  GameState,
  Player,
  PlayerId,
  Question,
} from "./types";

export function isEveryoneReady(
  players: Record<PlayerId, Player>,
  readyPlayerIds: Record<PlayerId, true>,
): boolean {
  return Object.keys(players).every((id) => readyPlayerIds[id]);
}

export function maxBetFor(points: number, settings: GameSettings): number {
  const { minBet, maxBet, betStep } = settings;
  if (points < minBet) return 0;

  const capped = Math.min(points, maxBet);
  const steps = Math.floor((capped - minBet) / betStep);

  return minBet + steps * betStep;
}

export function isSpectating(state: GameState, playerId: PlayerId): boolean {
  const round = state.round;
  if (!round) return false;

  return round.bets[playerId] === undefined;
}

export function isPhaseOver(
  state: GameState,
  now: number,
): state is GameState & { phaseEndsAt: number } {
  return state.phaseEndsAt !== null && now >= state.phaseEndsAt;
}

export function answerOptions(question: Question): string[] {
  return [question.correctAnswer, ...question.wrongAnswers];
}

export function isEveryoneLocked(state: GameState): boolean {
  const round = state.round;
  if (!round) return false;
  const firstQuestion = round.questions[state.questionIndex];

  return Object.keys(round.bets).every((playerId) => {
    if (!firstQuestion) return false;

    return round.answers[playerId]?.[firstQuestion.id]?.locked === true;
  });
}
