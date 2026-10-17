# Game rules

## Points
- Each player has a persistent wallet balance, with a daily top-up (amount decided in Stage 2).
- A game is played with the player's wallet balance; the result is saved back at the end.
- Players are ranked by net earnings in this game, not by total balance.

## Game structure
A game has N rounds (default 10). Each round:

SPIN → WAGER → GET_READY → 5 × QUESTION → ROUND_RESULT

## Wager (15 s)
- Every player must bet: minimum 60, maximum 500, in steps of 20.
- If a player has less than 500 points, their maximum is their points, rounded down to a valid step (e.g. 333 → 320).
- If a player doesn't choose, the minimum bet of 60 is placed automatically.
- The phase ends early when every player has bet.
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

## End of game
After the last round, players are ranked by points won or lost in this game.

## Settings (may change)
| Setting | Default |
|---|---|
| Rounds per game | 10 |
| Questions per round | 5 |
| Wager time | 15 s |
| Get-ready countdown | 3 s |
| Question time | 20 s |
| Minimum / maximum bet | 60 / 500 |
| Bet step | 20 |
