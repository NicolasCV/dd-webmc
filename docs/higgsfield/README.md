# Higgsfield plate programme

123 assets for one day of unlimited Nano Banana Pro, each one individually dispatchable.

The style is not up for discussion: `public/art/{brakka,wen,ilke}.webp` already set it and they are
good. Everything here has to pass for a fourth plate cut by the same hand.

**Short on time? [`SHIP.md`](SHIP.md) cuts this to the 29 that matter** — `./brief.sh --ship`. The
rest of this file is the full programme.

| | |
|---|---|
| [`SHIP.md`](SHIP.md) | the 29-asset cut, in order, with what was dropped and why |
| [`STYLE.md`](STYLE.md) | the locked style block, the acceptance band, the rejection list |
| [`briefs/`](briefs/) | eight families, one section per asset |
| [`brief.sh`](brief.sh) | `./brief.sh <id>` → a complete self-contained prompt |
| [`dispatch.md`](dispatch.md) | the subagent template and the dependency waves |
| [`refs/`](refs/) | reference images to attach |
| [`proof.html`](proof.html) | candidates under the real CSS, with the real numbers |
| [`encode.sh`](encode.sh) | master → shipping webp, refuses anything out of band |

```sh
./brief.sh --count            # 123
./brief.sh --list 1           # tier 1 only
./brief.sh --ship             # the 29 worth making, in order
./brief.sh --waves            # 44 / 61 / 17 / 1, parallel within a wave
./brief.sh char-brakka-mock   # the whole prompt, ready to paste
```

---

## The four ideas

### 1. The plate set is the tool set

The portrait is keyed to the speech act the tool call produced. Brakka calls `mock`, you get the
mocking plate. He calls `threaten`, you get that one.

Which means he has no `reassure` plate for exactly the reason he has no `reassure` tool: it was never
registered. The art is scoped by the same gate as the API — a closed family is closed on the sheet,
in the registry, and on his face. Nothing new has to be enforced; `sheet.speechActs` already decides
which plates can ever be reached.

16 act plates across the three characters, plus a face for `wait_for_moment`, which is the one act
where saying nothing is the move.

### 2. `char-*-impossible`

At the end of a run the app says *"{name} never once had `reassure` `encourage` `apologize`. Not
declined — **not registered**."*

Three plates of that sentence: Brakka being kind, Wen being cruel, Ilke with her guard down. The same
person, unmistakably, wearing an expression that does not belong to them — rendered once, at the
end, under the same `.strike-rule` the sheet uses to unregister a tool.

It is the only image in the set that shows something the system cannot produce. Never rendered during
play, which is the entire point.

### 3. The mouth moves while they speak

Two frames per speakable plate, alternating every ~130ms for the duration of the TTS. Engraved
cutout animation — the Gilliam register, which happens to be period-correct for the medium.

The twins are generated as localised edits of their approved parent and checked with an image diff,
because a twin that drifts by three pixels reads as the whole head twitching rather than a mouth
opening. `brief.sh` prints that check for every `-open` id.

### 4. Art reconciles against world state

`room-landing` and `room-landing-open` are the same room either side of the `door_open` flag. Same for
the hall and its sigil, the cistern and its tally, the vault and its ledger — and the drowned scribe,
who has one plate for being intimidated aside and a different one for being talked around, because
the cistern is the room with two solutions.

The plate is chosen by `flags.includes(...)`. Same mechanism as the tool registry, different surface.

---

## Wire-in

Eight touch points. None of them is large.

### Speaking

`speak()` is the single choke point and `play()` already awaits the audio element.

```ts
// store.ts
speaking: false,

// audio.ts, inside play()
useGame.setState({ speaking: voice !== NARRATOR })   // before await a.play()
…
finally { useGame.setState({ speaking: false }) }
```

Narrator lines must not move the companion's mouth, which is what the `voice` comparison is for. It
holds for the three presets (`onyx`, `shimmer`, `nova`) and for every generated character except one:
`create.ts` lets the sheet-writer pick `fable`, which is the narrator's own voice. Such a character
would sound exactly like the narrator and, once this lands, would also never open their mouth. Drop
`fable` from that enum — it was already the wrong option to offer.

### Portrait

```tsx
// Sheet.tsx — Portrait takes the sheet, not just a name
const STEM: Record<string, string> = { Brakka: 'brakka', 'Sister Wen': 'wen', Ilke: 'ilke' }

const stemOf = (s: Sheet) =>
  STEM[s.name] ?? (s.skills[0] ? `type-${s.skills[0]}-${s.disposition.warmth < 40 ? 'cold' : 'warm'}` : 'type-none')

export function Portrait({ sheet, act, className = '' }: { sheet: Sheet; act?: string; className?: string }) {
  const speaking = useGame((s) => s.speaking)
  const [flap, setFlap] = useState(false)

  useEffect(() => {
    if (!speaking || matchMedia('(prefers-reduced-motion: reduce)').matches) return setFlap(false)
    const id = setInterval(() => setFlap((f) => !f), 130)
    return () => { clearInterval(id); setFlap(false) }
  }, [speaking])

  const stem = stemOf(sheet)
  // Only the hand-drawn three have act plates, and only for acts they actually registered.
  const named = STEM[sheet.name] && act && sheet.speechActs.some((a) => a.name === act)
  const src = `/art/${named ? `${stem}-${act}` : stem}${flap ? '-open' : ''}.webp`
  …
}
```

Call site passes the act off the transcript — no new state:

```tsx
const act = useGame((s) => [...s.bubbles].reverse().find((b) => b.who === 'companion')?.act)
```

**Preload the twin** when the character is picked, or the first flap flashes a gap:

```ts
new Image().src = src.replace('.webp', '-open.webp')
```

### Rooms and props

Resolve the plate **when the bubble is created, not when it renders**. The transcript is a log: a
room you entered three moves ago must keep the plate it had then, not pick up the current flags.

```ts
// world.ts
type Room = { …, plate?: string; plateWhen?: Record<string, string> }

export const plateFor = (o: { plate?: string; plateWhen?: Record<string, string> }, flags: string[]) =>
  Object.entries(o.plateWhen ?? {}).find(([f]) => flags.includes(f))?.[1] ?? o.plate
```

```ts
// tools.ts — go() and examineProp() stamp it onto the bubble
g.say('world', room.description, { act: room.name, source: src(), plate: plateFor(room, g.flags) })
```

`Bubble` gains `plate?: string`; `Line` renders it in the two branches it already has — full width
above the room description, and ~180px beside the examine text.

### Map glyphs

`Room.tsx` keeps every bit of its state layer. The glyph goes *under* it, clipped to the same wobbly
rectangle the cell already draws, and only once the room is surveyed:

```tsx
{seen && (
  <>
    <clipPath id={`c-${id}`}><path d={sketch(x, y, k + 1)} /></clipPath>
    <image href={`/art/${glyphFor(id, flags)}.webp`} x={x} y={y} width={W} height={H}
           clipPath={`url(#c-${id})`} opacity={0.5}
           style={{ mixBlendMode: 'multiply' }} preserveAspectRatio="xMidYMid slice" />
  </>
)}
```

Fog-of-war, lock crosses, prop pips and the token all still draw on top. The map gains a surveyor's
drawing and loses nothing.

### The closing screen

Three plates land at once in `Chat.tsx`'s `over` block: `ledger-closed` above *"The account is
closed"*, `map-surveyed` beside the run statistics, and `char-<name>-impossible` behind the withheld
line, struck with the existing `StrikeRule`.

---

## Weight

~5 MB across all 123 files, which is fine in the repo and would be absurd on the wire. It never is,
because the app only ever reaches for a fraction:

- one character's plates — 8 to 16 files, and only that character's
- one room plate at a time
- one archetype, out of 33
- props only once examined

Realistic session transfer is 600–900 KB. The rules that keep it there: every plate except the
current portrait pair carries `loading="lazy"`, and the only thing ever preloaded is the `-open` twin
of the plate on screen.

Per-file budgets are in each brief; `encode.sh` prints the actual bytes.

---

## Where not to generate

Four places where an image makes this worse, listed because "unlimited" is a strong temptation.

1. **The map's state layer.** Glyphs go underneath it. Fog-of-war, the lock crosses, the prop pips
   and the token are live state and stay SVG.
2. **Speech-act icons.** The interface's whole typographic argument is that mono type *is* the visual
   language for tool names, without exception. Pictograms beside `state_flatly` break the one rule the
   design is actually making a case about.
3. **Diagrams, and anything with real text.** Nano Banana Pro renders text well and will still
   eventually hand you `document.modelContent`. Generate the ground, set the type in HTML, screenshot
   it.
4. **`docs/start.png`, `docs/strike.png`, `og.jpg`.** Screenshots, and they should stay screenshots —
   their job is to prove the thing runs. The README's open TODO
   (`<!-- still to shoot: one frame from the 1100ms strike window -->`) is a capture, not a render.
   `favicon.svg` is a hand-authored mark; an `apple-touch-icon` should be rasterised from it.

---

## Order of work

1. **The anchor**, by hand, until it is indistinguishable from the existing three. Everything
   downstream inherits its judgement. `STYLE.md` has it.
2. **Wave 0** (44) — rooms, props, glyphs, archetypes, ground. Nothing blocks them.
3. **Wave 1** (61) — act plates, flag variants, the impossible three.
4. **Wave 2** (17) — the mouth twins, each diff-checked against its parent.
5. **Wave 3** (1) — `seq-create-3`.

Tier 1 and 2 are what change how the app feels. If the day runs short, stop after wave 1.
