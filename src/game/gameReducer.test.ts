import { describe, expect, it } from "vitest";
import { makePlayer } from "./testHelper";
import { createInitialState, gameReducer } from "./gameReducer";
import { DEFAULT_SETTINGS } from "./types";

describe("gameReducer", () => {
  it("adds a player who joins the lobby", () => {
    const state = createInitialState(DEFAULT_SETTINGS);
    const player = makePlayer();

    const next = gameReducer(state, { type: "PLAYER_JOINED", player });

    expect(next.players[player.id]).toEqual(player);
  });
  it("adds the same player who joined the lobby", () => {
    const state = createInitialState(DEFAULT_SETTINGS);
    const player = makePlayer({ id: "ana", name: "Ana" });
    const duplicatePlayer = makePlayer({ id: "ana", name: "Impostor" });

    const firstPlayerState = gameReducer(state, {
      type: "PLAYER_JOINED",
      player: player,
    });
    const secondPlayerState = gameReducer(firstPlayerState, {
      type: "PLAYER_JOINED",
      player: duplicatePlayer,
    });

    expect(secondPlayerState.players[player.id]).toEqual(player);
  });
});
