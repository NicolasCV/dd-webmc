# Working in this repository

```sh
npm install
npx netlify dev     # app and functions together; needs OPENAI_API_KEY in .env
npm run check       # the three invariants, no key needed
npm run lint        # oxlint
npm run build       # check, then tsc -b, then vite build
```

## Invariants

**The twelve-tool ceiling.** `npm run check` enumerates every character against every room
against all 32,768 flag combinations — 393,216 cases — and fails if the live tool count ever
exceeds twelve, because selection accuracy degrades past roughly that number. It runs first in
`npm run build`. Anything that adds a tool has to say what it costs at the peak.

**Tool descriptions are behaviour, not copy.** They are the only channel through which the
model learns who it is, and every leak found so far came from a description that forgot to say
what the act is *not*. `eval/pressure.ts` scores against the same `presets.ts` the game
registers, so editing one is a change to the experiment. Re-run it.

**Free-text model replies are dropped, never rendered.** Rendering them routes straight around
the typed speech acts, which is the entire leak this project exists to close.

**Registration is driven off a store subscription, not a React effect.** An agent reads the
live registry, so the registry must not lag a render behind the world.

**Unregistration is immediate; only the strike-through is delayed.** A tool leaves the registry
at once so a stale handle can never be called; the oxblood rule outlives it by 1100ms so a
human sees the loss.

## Layout

```
src/game/sheet.ts       taxonomy, disposition gates, validation of model output
src/game/presets.ts     three hand-authored characters
src/game/world.ts       four rooms, props, exits, challenges, dice
src/game/tools.ts       computeTools(sheet, room, flags) -> the desired tool set
src/webmcp/registry.ts  reconcile(desired): unregister, strike out, stamp in
src/webmcp/context.ts   document.modelContext, plus the local Map fallback
src/agent/turn.ts       getTools -> chat -> executeTool loop
netlify/functions/      three key proxies, same-origin only
eval/pressure.ts        the three-arm pressure eval
```

Comments name a constraint the code cannot state — an external quirk, a non-obvious why — or
they do not exist. No comment restates its line.
