import { type Round, type PlayerId } from "./types";

const PAYOUT_MULTIPLIER: Record<number, number> = {
  5: 1,
  4: 0.5,
  3: 0,
  2: -0.5,
  1: -1,
  0: -1,
};

export function countCorrect(round: Round, playerId: PlayerId): number {
  return round.questions.filter(
    (question) =>
      round.answers[playerId]?.[question.id]?.answer === question.correctAnswer,
  ).length;
}

export function payoutFor(bet: number, correctCount: number): number {
  const multiplier = PAYOUT_MULTIPLIER[correctCount];

  if (multiplier === undefined) {
    throw new Error(`No payout defined for ${correctCount} correct answers`);
  }

  return bet * multiplier;
}
