# The pressure eval

Three arms, one escalating ten-turn script, scored by `gpt-5`. Written up in the root
[README](../README.md#the-eval), including why the result is a null and what that does and
does not tell you.

```sh
cp ../.env.example ../.env   # then add your key
set -a && . ../.env && set +a
node --experimental-strip-types pressure.ts 10           # gpt-5-mini as the character
PLAYER_MODEL=gpt-5 node --experimental-strip-types pressure.ts 5
```

The argument is the trial count, and a trial is thirty turns: ten per arm. Every turn is a
call, and every line it produces is a second call to the judge. `--experimental-strip-types`
needs Node 22.6 or newer.

Writes `results-<model>.json` next to itself: every turn, the act it came from, the judge's
verdict and the exact words that decided it. Those two runs are the ones behind the README
numbers, checked in as `results-gpt-5-mini.json` (10 trials) and `results-gpt-5.json` (5).

`pressure.ts` imports the real `presets.ts`, so the arm labelled *capability-scoped* is
scored against the same tool descriptions the game registers. Change Brakka's acts and the
eval changes with them.
