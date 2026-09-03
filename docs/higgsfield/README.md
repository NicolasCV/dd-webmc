# Higgsfield plate programme

One day of unlimited Nano Banana Pro, spent on the art this repo already has a slot for.

The style is not up for discussion: `public/art/{brakka,wen,ilke}.webp` already set it, and they
are good. Everything generated here has to pass for a fourth plate cut by the same hand. That is
the whole constraint, and it is why the workflow below front-loads a style anchor instead of
starting with the assets we actually want.

- Prompts: [`prompts.md`](prompts.md)
- Reference images to drag into Higgsfield: [`refs/`](refs/)
- Proof sheet — candidates under the real app CSS: [`proof.html`](proof.html)
- Master → shipping webp: [`encode.sh`](encode.sh)

---

## What the app does to an image

Non-negotiable, because it decides whether a plate survives contact with the page.

```css
.plate { filter: sepia(0.22) contrast(1.06); mix-blend-mode: multiply; }
```

Plates are **multiplied onto vellum `#D9D2C2`**, not composited over white. Multiply keeps the
light half of the image and darkens everything else, so:

- A plate with a **light paper ground survives**; the paper vanishes into the sheet and the ink
  stays. That is the effect the three existing plates get, and it is why they look tipped-in
  rather than pasted-on.
- A plate with a **dark or filled background turns to mud**. Any full-bleed scene, any black
  rectangle, any "dramatic lighting" render is dead on arrival.

Measured on the three plates that already work:

| | mean luminance | std dev | paper | size |
|---|---|---|---|---|
| brakka.webp | 189 | 76 | `#F2E6CF` | 78K |
| wen.webp | 175 | 80 | | 61K |
| ilke.webp | 171 | 79 | | 72K |

**Acceptance band: mean 165–195, std dev 70–90.** `encode.sh` prints both. Anything below 160
mean will read as a smudge on the sheet no matter how good it looks in the Higgsfield gallery.

---

## Workflow

Six stages. Stages 0–2 are the whole game; skipping them is how you end up with forty plates that
are each fine and collectively look like a stock pack.

### 0 — Reference stack

Attach on **every** generation, in this order:

1. `refs/styleboard.jpg` — the three existing plates side by side. Carries hatching density,
   ink temperature, vignette behaviour, face rendering.
2. `refs/paper.jpg` — top and bottom edge strips of all three plates. Carries the ground: laid
   fibre, foxing, a fold, and — importantly — how hatching *dissolves* into paper instead of
   stopping at a border.
3. `refs/anchor.jpg` — produced in stage 2, empty until then.

Individual character refs live at `public/art/*.webp`; attach the specific one when re-rendering
that character.

### 1 — Paste the style block

`prompts.md` §0. It goes in verbatim, every time, above the subject. Do not paraphrase it between
batches — drift between batches is exactly the failure this is preventing.

### 2 — The anchor

Generate one subject that is **not** on the asset list: a tallow candle stub on a bare shelf.
Iterate until it is indistinguishable from the three existing plates — same ink weight, same
paper, same dissolve. Nothing else gets generated until this passes.

The approved candle becomes `refs/anchor.jpg` and rides along as a reference for everything after.
It is doing something the styleboard can't: proving the style transfers to a subject the model has
not been shown, which is what all thirty-odd remaining plates are.

### 3 — Batch by family

One family at a time, one template, one variable slot. Families do not get mixed in a session —
the model carries context between generations and a room prompt after a portrait prompt produces a
room with a face in it.

Generate 4–6 candidates per slot. The keep rate on the existing plates was roughly 1 in 4, so
budget ~160 generations for ~40 keepers.

### 4 — Proof

Drop candidates in `proof.html` and open it. It renders them at real size on the real vellum with
the real filter, on the real table background. A plate that looks superb on a white gallery card
and dies under multiply is the common failure, and this is the only place it shows up.

### 5 — Encode

```sh
./encode.sh masters/brakka.png 640 ../../public/art/brakka.webp
```

Masters stay **out of the repo** — 4K PNGs are not what git is for. Keep them wherever you keep
work files; only the encoded webp is committed.

---

## Asset ledger

Priority is by how much the page gains, not by how fun the prompt is.

| # | Slot | Count | Source size | Ships to | Wire-in |
|---|---|---|---|---|---|
| **P1** | Room plates | 5 | 1600×800 | `public/art/room-*.webp` | `world.ts`, `Chat.tsx` |
| **P1** | Archetype plates | 17 | 1024×1024 | `public/art/type-*.webp` | `Sheet.tsx` |
| **P2** | Prop plates | 10 | 768×576 | `public/art/prop-*.webp` | `world.ts`, `Chat.tsx` |
| **P2** | Character re-renders | 3 | 1024×1024 | replaces `public/art/*.webp` | none |
| **P3** | Table ground | 1 | 2560×1440 | `public/art/table.webp` | none |
| **P3** | End-card | 1 | 1024×768 | `public/art/ledger.webp` | `Chat.tsx` |
| **P3** | why.html hero band | 1 | 2000×700 | `public/art/hero.webp` | `why.html` |

~38 keepers.

### P1 — Room plates (the biggest gap)

"Walk into the next room and the whole set turns over" is the line the README leads with, and in
the transcript that turnover is currently **a heading and a paragraph of prose**. The map redraws,
the chips change, the tools restrike — and the scene itself doesn't move.

Five plates: four rooms, plus a second Sealed Landing for after the door gives.

That second one is the interesting one. `door_open` is already a world flag; keying a plate to it
means **the art reconciles against world state the same way the tool registry does**. Same
mechanism, different surface. It is one extra image and one `flags.includes()`.

```ts
// world.ts
type Room = { …, plate?: string; plateWhen?: Record<string, string> }

landing: { …, plate: '/art/room-landing.webp',
           plateWhen: { door_open: '/art/room-landing-open.webp' } }
```

```tsx
// Chat.tsx — the existing isRoomName(b.act) branch, ~line 27
<div className="mb-2 flex items-center gap-3">…</div>
{plate && <img src={plate} alt="" loading="lazy" className="plate mb-3 w-full" />}
<p className="text-body leading-relaxed text-pencil">{b.text}</p>
```

Transcript column is `max-w-[44rem]` (704px), so 1600×800 masters encode to 1408×704.

### P1 — Archetype plates (the weakest surface in the app)

"Or write one, and watch the API get built" is the demo's second act. It ends on
`Monogram` — a grey box with one letter in it. Every generated character gets the same grey box.

17 plates: eight skills × cold/warm, plus one unclaimed seat.

```tsx
// Sheet.tsx — Portrait takes the sheet, not just the name
const archetype = (s: Sheet) =>
  `/art/type-${s.skills[0] ?? 'none'}-${s.disposition.warmth < 40 ? 'cold' : 'warm'}.webp`

export function Portrait({ sheet, className }: { sheet: Sheet; className?: string }) {
  const src = PLATES[sheet.name] ?? archetype(sheet)
  …
}
```

Both call sites (`Start.tsx`, `Sheet.tsx`) already hold the sheet, so this is a prop change and
nothing else.

**The honest tradeoff:** the face won't match the name the player invented, and occasionally it
will contradict what they pictured. A grey letter never contradicts anything. If that bothers you,
generate **plate 17 only** — an empty engraved cartouche with the monogram set in the middle of it.
One asset, no mismatch, still a hundred times better than `bg-ink/5`. Prompt is in §5.

### P2 — Prop plates

Ten props, one per `onExamine`. Examining is half the player's verbs and it renders as prose only.
Specimen plates, field-guide framing — an object isolated on bare paper, which is also the framing
that survives multiply best.

`Prop` gets `plate?`, and `Line` gets a branch on `b.act?.startsWith('examine_')`. Render small
(~180px, floated or above the text) — these are marginalia, not illustrations.

Ten more images on the wire is real weight: keep each under 25K and `loading="lazy"` them. Nothing
loads until the player examines something.

### P2 — Character re-renders

The three portraits are 640×640 and there is no master. Any future crop — Devpost banner, a slide,
a print — upscales. Re-render each at 4K **as an edit of the existing plate**, not a fresh
generation, so the face survives. Ship the same 640×640; bank the master.

While re-rendering, fix one real defect: at `size-24` (96px) with `object-cover object-top`,
Brakka's plate shows mostly forehead. Compose so the **eyes sit at ~38% from the top** and it
crops correctly at both sizes with no CSS change.

### P3 — Table, end-card, hero

**Table** — currently 1920×1072 at 33K, behind a `0.55` black scrim, so it is doing very little
work. A proper walnut grain at 2560×1440 costs maybe 60K and the whole page sits on it. Keep the
centre quiet: the sheets sit on top with heavy drop shadows and grain fighting them reads as noise.
The mobile branch crops to `30% 0`, so keep the left third worth looking at.

**End-card** — the game ends on *"The account is closed"*, and the ledger with two names, one
struck out, is both the ending and a picture of the core mechanic. Best single-image payoff in the
list. Needs the no-text rule relaxed to illegible engraved script — see §8.

**Hero band** — `why.html` is 841 lines of essay with three portraits and no hero. A wide plate of
the table with two sheets on it, one struck through.

---

## Where not to generate

Four places where an image makes this worse, listed because "unlimited" is a strong temptation.

1. **The room map** (`Room.tsx`). It is live SVG driven by `visited`/`flags` — fog-of-war,
   lock markers, the token showing where you are. A beautiful static map would delete a working
   state display.

2. **Speech-act icons.** The README's claim is that mono type *is* the visual language for tool
   names, absolutely and without exception. Pictograms next to `state_flatly` would break the one
   rule the interface is actually making an argument about.

3. **Diagrams and anything with real text in it.** Nano Banana Pro renders text well and will still
   eventually give you `document.modelContent`. Generate the ground, set the type in HTML,
   screenshot it.

4. **`docs/start.png`, `docs/strike.png`, `og.jpg`.** Screenshots, and they should stay screenshots —
   their job is to prove the thing runs. The README's open TODO
   (`<!-- still to shoot: one frame from the 1100ms strike window -->`) is a capture, not a render.
   Same for `favicon.svg`: it is a hand-authored mark, and an `apple-touch-icon` should be
   rasterised from it, not redrawn.

---

## Order of work

Anchor first, then straight down the priority column. If the day runs short, P1 alone is worth the
pass — rooms and archetypes are the two places the app currently has a hole.

```
stage 2   anchor                                    ~20 gens
P1        5 room plates                             ~30 gens
P1        17 archetype plates                       ~60 gens
P2        10 prop plates                            ~30 gens
P2        3 character re-renders                    ~15 gens
P3        table, end-card, hero                     ~15 gens
```
