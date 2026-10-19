import type { Player } from "./types";

export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player1",
    name: "Player1",
    gamePoints: 1000,
    startingPoints: 1000,
    wallet: 5000,
    ...overrides,
  };
}
