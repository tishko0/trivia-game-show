# Game rules

## Points
- Each player has a persistent wallet balance, with a daily top-up (amount decided in Stage 2).
- A game is played with the player's wallet balance; the result is saved back at the end.
- Players are ranked by net earnings in this game, not by total balance.

## Starting a game
- There is no host. Any player in the lobby can press **Start** once the lobby has at least 1 player (a setting; may become 2 later).
- Pressing Start begins a **ready check**: a 60 s countdown. The player who pressed Start is automatically ready.
- During the ready check, players press **Ready**, or **Leave** to leave the lobby. New players can still join, and see the same countdown.
- The game starts when every player in the lobby is ready, or when the 60 s run out.
- Players who weren't ready (AFK) stay in the game as spectators, like late arrivals: they play from the first round they bet in.

Flow: LOBBY → READY_CHECK → first round

## Screens
- Every player sees the same show on their own device: wheel, question, answers, timer, reveals.
- The lower part of the screen shows every player in the game (avatar, name, points).
- A player's own selection is highlighted only on their screen. Others only see that a player has locked in, never what they picked.

## Game structure
A game has N rounds (default 10). Each round:

SPIN → WAGER → GET_READY → 5 × QUESTION → ROUND_RESULT

## Spin (5 s)
- The category and the round's 5 questions are picked **before** the wheel spins.
- Every player's wheel animates for 5 s and lands on that same category. The animation never decides anything.

## Wager (15 s)
- Every player must bet: minimum 60, maximum 500, in steps of 20.
- If a player has less than 500 points, their maximum is their points, rounded down to a valid step (e.g. 333 → 320).
- Players choose an amount with a slider and confirm it with the **Bet** button. A confirmed bet is final.
- When time runs out, the current selection counts even if it isn't confirmed. If the slider was never moved, the minimum bet of 60 counts.
- The phase ends early when every player has confirmed their bet.
- A player with fewer than 60 points is out and spectates.

## Questions (20 s each)
- 5 multiple-choice questions per round, all from the category picked by the wheel.
- Players can change their selection until they press **Lock in**. A locked answer is final.
- A question ends early when every active player has locked in.
- When time runs out, the selected answer counts even if it isn't locked. With no selection, the question counts as wrong.
- Correct answers are not shown until the round result.

## Round result
The correct answers are revealed, then the bet is settled:

| Correct | Payout |
|---|---|
| 5 | +100% of bet |
| 4 | +50% |
| 3 | 0 |
| 2 | −50% |
| 0–1 | −100% |

## Joining and leaving
- Only players with a bet in the current round play that round.
- A player who joins during a game spectates until the next round's betting phase.
- A player who leaves loses their current bet. Their remaining game points go back to their wallet, they're removed from the game, and they don't appear in the final results.
- They can come back later from a "recent lobbies" list if there's a free spot. They join as a new player, with a new buy-in.

### Disconnects (Stage 3)
- A lost connection has a grace period of 2 minutes.
- If the player reconnects within it, they continue as if they never left. Questions that ended while they were away count with whatever was selected, or as wrong.
- After 2 minutes without reconnecting, they're treated as having left.

## End of game
After the last round, players are ranked by points won or lost in this game.

## Settings (may change)
| Setting | Default |
|---|---|
| Minimum players to start | 1 |
| Ready check time | 60 s |
| Spin time | 5 s |
| Rounds per game | 10 |
| Questions per round | 5 |
| Wager time | 15 s |
| Get-ready countdown | 3 s |
| Question time | 20 s |
| Minimum / maximum bet | 60 / 500 |
| Bet step | 20 |
