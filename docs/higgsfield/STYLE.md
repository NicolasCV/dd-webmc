# The house style

One source of truth. `brief.sh` prepends this to every brief, so a subagent that runs
`./brief.sh <id>` gets a complete prompt and needs nothing else.

Do not paraphrase it per batch. Drift between batches is the failure the whole programme exists to
prevent.

## §0 — Style block

```
STYLE — do not deviate:

Nineteenth-century steel engraving and pen-and-ink crosshatch, in the manner of a
plate cut for a printed book. Fine parallel hatching and cross-hatching describe
every form and every tone. Tone comes from line density alone. Occasional flat
ink wash only where a fabric is genuinely black.

NO soft airbrush shading, NO digital gradients, NO glow, NO bloom, NO lens blur,
NO depth of field, NO rim light, NO cinematic colour grade.

Ink is warm sepia-black, bistre, near-monochrome. One desaturated brass note
(#B0873C) is the only colour permitted, and only on an object that is actually
brass. No other colour anywhere in the image.

Ground: aged laid paper, warm cream (#F2E6CF), visible fibre, a few scattered
foxing spots, one faint water stain, one soft fold. The paper is the artwork's
own ground, not a background and not a border. No frame, no ruled edge, no drawn
deckle, no torn corner.

The subject vignettes into the paper: hatching thins and dissolves before it
reaches any edge of the image. No filled rectangle. No background scene. No
horizon line. Bare paper reaches the edge on every side.

Light from the upper left, single source.

Overall the image must stay LIGHT: paper dominates, ink is the minority. Deep
black only in the few places genuinely unlit.

NO TEXT anywhere — no letters, numerals, captions, labels, titles, signatures,
plate numbers or watermarks.

Flat scan of a printed plate. Not a photograph of a book. No page curl, no
camera shadow, no 3D mockup, no desk, no hands, no frame around the image.
```

## §0b — Negative prompt

```
colour, colourful, vibrant, saturated, digital painting, airbrush, soft shading,
gradient, glow, bloom, neon, watercolour wash, oil painting, anime, 3d render,
octane, photorealistic, photograph, dark background, black background, filled
background, vignette frame, border, ornate frame, text, letters, caption,
signature, watermark, logo, page curl, book mockup, hands, torn paper
```

## The anchor — run this before anything else

Nothing else gets generated until this passes. It proves the style transfers to a subject the model
has *not* been shown, which is what every remaining plate is.

```
[§0]

FRAMING: single object centred on bare paper, square 1:1. Specimen plate. No
ground line, no cast shadow beyond a light hatched one.

SUBJECT: a stub of a tallow candle, burnt down to about two inches, standing in
a plain iron dish. Cold, unlit, wick blackened and bent. A run of hardened wax
down one side.
```

Iterate until it is indistinguishable from `public/art/{brakka,wen,ilke}.webp`. Save the winner as
`refs/anchor.jpg`. Every brief attaches it from then on.

## Acceptance

Plates are composited with `mix-blend-mode: multiply` onto vellum `#D9D2C2`. Multiply keeps the
light half and darkens the rest, so a light paper ground disappears into the sheet and the ink stays
— and a dark or filled background turns to mud. This is the whole constraint.

Measured on the three plates that already work:

| | mean | stddev |
|---|---|---|
| brakka | 189 | 76 |
| wen | 175 | 80 |
| ilke | 171 | 79 |

**Band: mean 160–200, stddev ≥ 65.** `encode.sh` prints both and refuses outside it. `proof.html`
computes the same numbers in-browser and renders candidates at real size on real vellum.

The band does not catch a **sepia-toned master**, which passes on the gray numbers and still lands as
a yellow slab: `.plate` adds `sepia(0.22)` of its own, and multiply cannot lift saturated paper off
the vellum. Scene plates come out of the generator warmer than the portraits, so they get a pre-pass
before `encode.sh`:

```sh
magick master.webp -modulate 100,15 -level 10%,98% -sigmoidal-contrast 3,50% neutral.png
```

Saturation down to a stain, paper up to near-white, ink back to crosshatch weight.

## Standing rejection list

Reject and rerun rather than trying to patch in an edit:

1. **Filled or dark background.** Bare paper must reach all four edges.
2. **Mean under 160.** Fine on a white gallery card, a smudge on the sheet.
3. **Stddev under 65.** Tone made of wash, not of lines. Wrong medium.
4. **Any text.** Including a signature or a plate number the model added helpfully.
   Sole exception: `ledger-closed` and `prop-ledger`, illegible script only.
5. **Colour beyond the one brass note.**
6. **A drawn border, frame, deckle or torn edge.** The sheet already frames it.
7. **A face in a room plate.** Architecture only, except the named figure in the cistern.
8. **Registration drift on a `-open` twin.** The head must not move by one pixel between the closed
   and open frame. See `dispatch.md`.
