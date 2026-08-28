# The pressure eval

Three arms, one escalating ten-turn script, scored by `gpt-5`. Written up in the root
[README](../README.md#the-eval), including why the result is a null and what that does and
does not tell you.

```sh
set -a && . ../.env && set +a
node --experimental-strip-types pressure.ts 5            # gpt-5-mini as the character
PLAYER_MODEL=gpt-5 node --experimental-strip-types pressure.ts 5
```

Writes `eval-results.json` next to itself: every turn, the act it came from, the judge's
verdict and the exact words that decided it. The two runs behind the README numbers are
checked in as `results-gpt-5.json` and `results-gpt-5-mini.json`.

`pressure.ts` imports the real `presets.ts`, so the arm labelled *capability-scoped* is
scored against the same tool descriptions the game registers. Change Brakka's acts and the
eval changes with them.
