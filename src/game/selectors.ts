import type { GameSettings, GameState, Player, PlayerId } from "./types";

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
