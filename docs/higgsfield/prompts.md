# Prompts

Copy-paste ready. Every prompt is **§0 + the family framing + the subject**, in that order, with
`refs/styleboard.jpg`, `refs/paper.jpg` and `refs/anchor.jpg` attached.

Read [`README.md`](README.md) first — the workflow matters more than the wording.

---

## §0 — The style block

Verbatim, above every subject, every time.

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

**Universal negative prompt**, if the field is available:

```
colour, colourful, vibrant, saturated, digital painting, airbrush, soft shading,
gradient, glow, bloom, neon, watercolour wash, oil painting, anime, 3d render,
octane, photorealistic, photograph, dark background, black background, filled
background, vignette frame, border, ornate frame, text, letters, caption,
signature, watermark, logo, page curl, book mockup, hands, torn paper
```

---

## §1 — The anchor test

Run this first. Nothing else gets generated until it passes.

```
[§0 STYLE BLOCK]

FRAMING: single object centred on bare paper, square 1:1. Specimen plate. No
ground line, no cast shadow beyond a light hatched one.

SUBJECT: a stub of a tallow candle, burnt down to about two inches, standing in
a plain iron dish. Cold, unlit, wick blackened and bent. A run of hardened wax
down one side.
```

Approve when it is indistinguishable from the three existing plates. Save as `refs/anchor.jpg` and
attach it to everything from here on.

---

## §2 — Room plates · 5

Aspect **2:1**, generate 1600×800.

```
FRAMING: wide architectural interior vignette, 2:1 landscape. No people, no
figures, no animals. The scene occupies the centre and dissolves into bare paper
at the left and right edges — hatching thins out and stops, no scene reaching
the frame. Viewer stands at the room's entrance at standing eye height.
```

### R1 · The Sealed Landing — sealed

```
SUBJECT: the bottom of a short flight of six worn stone steps that descend from a
doorway which is no longer there — above the top step is only broken masonry and
fallen ceiling. The far wall is filled by an enormous slab of a door, banded
across with wide iron straps corroded to the colour of dried blood. Rubble heaped
against the base of the wall. An empty iron lantern bracket juts from the left
wall, and the stone behind it is scorched in a neat oval.
```

### R2 · The Sealed Landing — forced

Attach the approved R1 and prompt as an edit, so the room stays the same room.

```
Keep this exact scene, camera and lighting. Change only the door: one iron band
has sheared through and the great slab has swung inward, standing half open. Cold
flat darkness beyond the gap, drawn as dense crosshatch, no light source inside.
Fresh dust and grit thrown across the floor in front of it. The rubble, the
bracket, the scorch mark and the steps are unchanged.
```

### R3 · The Long Hall

```
SUBJECT: a long processional corridor, far taller than it is wide, receding to a
dark end. Both side walls are covered floor to ceiling in painted murals rendered
as flat panelled registers — figures in procession, all in the same engraved
line, no colour. A cold iron brazier on a tripod stands against the right wall.
A scatter of bones lies against the left wall at the base. Narrow grated slots in
the floor at intervals; water somewhere below them.
```

### R4 · The Drowned Cistern

```
SUBJECT: a vast low vaulted cistern, heavy round brick arches on squat piers
marching back into darkness. Black standing water covers the floor to ankle
depth, dead flat and unrippled, reflecting the vault ribs in perfect stillness.
In the middle distance, standing alone in the water, one thin motionless human
figure with its back three-quarters to us, holding a long notched stick at its
side. Do not render its face. Nothing else in the water.
```

### R5 · The Vault of Small Hours

```
SUBJECT: a small close chamber lined on three walls with shelving from floor to
ceiling. Every shelf is packed with identical squat stoppered glass jars, hundreds
of them, each sealed with wax and a cord. One shelf at chest height, centre, is
completely empty and swept clean — bare wood, a clean line in the dust. A reading
stand with a large open book on it stands in the middle of the floor. The book's
pages are blank — draw no writing.
```

---

## §3 — Prop plates · 10

Aspect **4:3**, generate 768×576. These ship small, ~180px on the page.

```
FRAMING: a single object isolated on bare paper, 4:3 landscape. Specimen plate
from a field guide. No room, no scene, no ground line, no cast shadow beyond a
light hatched one. The object floats on the paper and its hatching dissolves
before the edge.
```

| file | subject |
|---|---|
| `prop-door_seal` | `SUBJECT: a detail of a great door's iron face, showing a seal of concentric rings of script incised into the metal — cut in, not raised. The characters are an invented dead script, angular, and must be illegible marks rather than any real alphabet. Corrosion in the grooves.` |
| `prop-rubble` | `SUBJECT: a heap of fallen ceiling masonry — broken dressed stone blocks, splintered timber, mortar dust. From beneath one slab, the toe of a boot. Nothing else of the body visible.` |
| `prop-bracket` | `SUBJECT: an empty wrought-iron lantern bracket bolted to a section of bare stone wall. The bracket holds nothing. The stone directly behind and above it is scorched in a clean oval, rendered as dense hatching that fades at its own edge.` |
| `prop-murals` | `SUBJECT: one panel of a painted wall mural, drawn as flat engraved line. A row of stiff processional figures carrying goods toward a seated figure — a ledger scene, debts paid in kind. At the panel's right end, a hand presses a round sigil into the face of a door. No colour, no text.` |
| `prop-bones` | `SUBJECT: a human skeleton seated with its back against the foot of a wall, slumped but composed, hands in its lap, undisturbed. No violence, nothing broken, no weapon. Scraps of cloth still on it. Recent — the bone is clean and pale, not ancient.` |
| `prop-brazier` | `SUBJECT: a squat cold iron brazier on three legs, seen slightly from above so its bowl is visible. The bowl is full of fine grey ash, long dead. Half buried in the ash, a scatter of human teeth.` |
| `prop-water` | `SUBJECT: a close view of shallow black standing water lying over old flagstones, seen from above at an angle. Absolutely flat, no ripple, no disturbance — the reflection in it is perfectly sharp. The edge of one boot at the frame's corner. Rendered almost entirely in dense crosshatch for the water against bare paper elsewhere.` |
| `prop-scribe` | `SUBJECT: a standing corpse in the dress of a clerk — long coat, ink-horn on a cord, a satchel — preserved and upright, not decayed to a skeleton. It holds a long notched wooden tally-stick upright at its side. Head turned to face the viewer directly. Eyes open and fixed. Expressionless, not monstrous, no gore.` |
| `prop-reliquary` | `SUBJECT: a single empty wooden shelf, seen straight on, with a few identical squat stoppered jars pushed to the far ends of it. The centre is bare and recently swept — the dust has a clean edge where something was dragged out.` |
| `prop-ledger` | `SUBJECT: a large ledger book lying open on a wooden reading stand, seen from the front and slightly above. The visible page carries two short ruled entries. The writing is illegible engraved copperplate strokes, not readable words. Everything else on the page is blank ruling. A notched wooden tally-stick lies across the gutter.` |

---

## §4 — Character re-renders · 3

Aspect **1:1**, generate 4096×4096 masters, ship 640×640.

Run these as **edits of the existing plate**, not fresh generations. Attach `public/art/<name>.webp`
as the primary reference alongside the style refs.

```
FRAMING: head-and-shoulders bust, square 1:1. The eyes sit at roughly 38% down
from the top edge and the head occupies the upper 60% of the frame; the lower
third is shoulders dissolving into bare paper. Three-quarter turn toward the
viewer, eyes to camera.
```

### Brakka

```
Redraw this exact plate at full resolution, keeping the same man, the same face
and the same pose. Preserve every identifying feature: heavyset, late forties,
close-cropped hair, thick neck, broad flattened nose, deep vertical frown lines,
the scar crossing the left brow and cheek, small pale eyes, the sour set of the
mouth. Mail coif and a standing leather-and-mail gorget closed at the throat by a
single brass clasp. Deepen and sharpen the crosshatching; do not restyle, do not
prettify, do not change his age, weight or expression.

Recompose only the framing: bring the eyes to 38% down from the top edge so the
head sits in the upper portion of the square.
```

### Sister Wen

```
Redraw this exact plate at full resolution, keeping the same woman, the same face
and the same pose. Preserve every identifying feature: sixties, long face, hollow
cheeks, grey hair scraped back, pale steady level eyes, a mouth that has stopped
expecting much. Deep hood of dark wool worn up and thrown back off the face, heavy
dark travelling mantle, a broad leather strap across the chest with a brass
buckle. Deepen and sharpen the crosshatching; keep the soft ink wash in the
mantle. Do not restyle, do not soften her, do not change her age.

Recompose only the framing: bring the eyes to 38% down from the top edge.
```

### Ilke

```
Redraw this exact plate at full resolution, keeping the same person, the same face
and the same pose. Preserve every identifying feature: lean, thirties, sharp
cheekbones, dark hair falling across the forehead, one eyebrow raised, the faint
one-sided knowing half-smile. Deep pointed hood worn up, a wound scarf at the
throat, a leather chest strap with two slender lockpicks hanging from a thong.
Deepen and sharpen the crosshatching. Do not restyle, do not change the
expression — the half-smile is the whole character.

Recompose only the framing: bring the eyes to 38% down from the top edge.
```

---

## §5 — Archetype plates · 17

Aspect **1:1**, generate 1024×1024.

These stand in for characters the player invents, so the set has to read as **seventeen different
people**, not one face in seventeen hats. Vary age, build, sex and colouring deliberately, and
generate them in one sitting so the model holds the spread.

```
FRAMING: head-and-shoulders bust, square 1:1. Eyes at roughly 38% down from the
top edge, head in the upper 60% of the frame, lower third dissolving into bare
paper. Three-quarter turn toward the viewer, eyes to camera. One person only.
```

Each subject line is prefixed by the disposition, which is doing the real work:

- **cold** → `The face is closed. No warmth in the eyes, no softness in the mouth. Not snarling, not villainous — simply unavailable.`
- **warm** → `The face is open and legible. Some warmth around the eyes. Not smiling for the viewer — at ease, and willing to be read.`

| file | subject |
|---|---|
| `type-force-cold` | a thickset woman in her fifties, jaw set, cropped grey hair, a leather-and-plate pauldron on one shoulder, one front tooth broken |
| `type-force-warm` | a big young man, sunburned and open-faced, sleeveless mail, a linen bandage wound around one forearm |
| `type-stealth-cold` | a narrow-faced person of indeterminate age, hood up, half the face lost in shadow hatching, high buttoned collar, nothing ornamental anywhere |
| `type-stealth-warm` | a small wiry woman in her twenties, hood pushed back, freckled, faintly amused, a smudge of soot along one cheekbone |
| `type-lockpicking-cold` | a gaunt man in his sixties, a jeweller's loupe pushed up onto his forehead, thin mouth, fingerless gloves, one hand raised near the chin |
| `type-lockpicking-warm` | a young person with hair pinned up by a slender lockpick, collar open, the beginning of a grin |
| `type-lore-cold` | an austere man in his forties, small round spectacles, a high buttoned scholar's collar, ink-stained fingers |
| `type-lore-warm` | a round-faced woman in her seventies, unruly white hair, spectacles low on the nose, half a smile, a book strap crossing the shoulder |
| `type-perception-cold` | a weathered hunter of about fifty, hooded deep-set eyes, a hawk's feather in the hatband, gaze fixed slightly off to one side |
| `type-perception-warm` | a wind-burned young scout, hood down, hair blown across the brow, a coil of thin line over one shoulder, looking straight at the viewer |
| `type-medicine-cold` | a severe woman in her forties, hair fully covered, an apron strap over one shoulder, a flat case of surgeon's blades at her chest, no warmth in the mouth at all |
| `type-medicine-warm` | an old man with a soft heavy face, spectacles, a satchel strap across the chest, tired kind eyes |
| `type-persuasion-cold` | a sleek person in their forties, high embroidered collar, a signet on a fine chain, wearing a courtier's flat professional smile that does not reach the eyes |
| `type-persuasion-warm` | a broad-shouldered woman in her fifties, deep laughing lines, coat open at the throat, a merchant's brass token on a cord |
| `type-intimidation-cold` | a scarred bald man, heavy studded gorget, a broken nose badly set, no expression whatsoever |
| `type-intimidation-warm` | a heavyset woman in her sixties in a butcher's leather apron bib, direct and openly amused stare |

### `type-none` · the unclaimed seat

The fallback when there is no dominant skill — and the whole set, if you would rather not put a
face on a character the player imagined.

```
[§0 STYLE BLOCK]

FRAMING: square 1:1, centred.

SUBJECT: an empty oval portrait cartouche — a plain engraved oval rule with a
narrow hatched border, of the kind a printer leaves blank for a plate not yet
cut. The oval is completely empty: bare cream paper inside, no face, no figure,
no silhouette, no shadow, nothing drawn within the oval at all. Faint pencil
guide-lines, barely visible, cross the empty space where a head would have been
laid in. No text.
```

---

## §6 — The table ground · 1

Aspect **16:9**, generate 2560×1440. **This one breaks the style block** — it is a photograph, not
a plate. Use §0's negative prompt only.

```
An overhead flat-lay photograph of a large old dark walnut table top, filling the
frame edge to edge. Deep brown, almost black in the grain, waxed and worn, with a
few pale scuffs and one old ring stain. Strong raking light from the upper left
throwing long low shadow across the grain, falling off to near darkness at the
lower right corner. Absolutely nothing on the table — bare wood only. No objects,
no props, no dice, no paper, no hands, no cloth. Shallow contrast, muted, no
colour cast, no vignette filter. Sharp across the whole frame.

The centre two thirds must stay visually quiet and even — no knots, no strong
figure, no bright highlight. Keep any interesting grain to the left third and the
outer edges.
```

The quiet centre is load-bearing: sheets sit on top of it with heavy drop shadows, and grain
fighting them reads as noise. The mobile branch crops to `30% 0`, so the left third is what phones
see.

---

## §7 — why.html hero band · 1

Aspect ~**20:7**, generate 2000×700. Also a plate, but a wide one.

```
[§0 STYLE BLOCK]

FRAMING: wide horizontal vignette, roughly 20:7. Overhead three-quarter view
looking down at a table top. The scene occupies the centre and dissolves into
bare paper at both ends.

SUBJECT: two sheets of paper lying side by side on a dark wooden table, seen from
above and slightly to one side, overlapping at the corners. Each sheet is ruled
into a grid of faint squares and divided into blocks and short ruled lines, in
the manner of a filled-in form or character sheet — but every line is left blank,
with no writing anywhere. Across the middle of the right-hand sheet, one long
hand-drawn horizontal rule has been struck through a block of the ruling, drawn
freehand and slightly wavering, noticeably heavier and darker than every other
line on either sheet. A pencil lies across the top corner. No text, no letters,
no numbers.
```

The struck rule is the point of the image. If it does not come out heavier than the ruling around
it, reject and rerun — the plate is illustrating unregistration.

---

## §8 — End-card: the closed account · 1

Aspect **4:3**, generate 1024×768. Renders above *"The account is closed"*.

**This prompt deliberately relaxes §0's no-text rule** to illegible script. Everything else holds.

```
[§0 STYLE BLOCK — except that the NO TEXT rule is relaxed exactly as described
below]

FRAMING: 4:3, the book seen from the front and slightly above, filling most of
the frame and dissolving into bare paper at the edges.

SUBJECT: a large ledger book lying open on a plain wooden stand. The visible page
is ruled into narrow accounting columns, all of them empty except for two short
entries one above the other near the top.

The two entries are written in engraved copperplate script that must be
ILLEGIBLE — flowing pen strokes with the rhythm and slant of handwriting but
forming no readable letters and no real words in any language. No other writing
anywhere on the page. No printed text, no numerals, no headings, no page number.

Through the lower of the two entries, a single hand-drawn horizontal rule has
been struck — freehand, slightly wavering, in a darker heavier ink than the
writing, running the full width of that entry and a little past it at both ends.
The upper entry is untouched.

A notched wooden tally-stick lies across the gutter of the book. A steel pen rests
in the fold.
```

Two failure modes worth pre-empting: the model wants to make the script legible, and it wants to
make the strike neat. Reject legible words; reject a ruled-looking strike. It has to look drawn by
a hand, because the app's own strike rule is.

---

## Standing rejection list

Applies to every family. Reject on sight and rerun rather than trying to fix in an edit:

1. **Filled or dark background.** Dies under `mix-blend-mode: multiply`. Bare paper must reach all
   four edges.
2. **Mean luminance under 160.** `encode.sh` prints it. Looks fine on a white gallery card, reads
   as a smudge on the vellum.
3. **Any text.** Including a signature, a plate number, or a caption the model added helpfully.
   Exception: §8, illegible script only.
4. **Colour beyond the one brass note.** Any blue, green or red at all.
5. **A drawn border, frame, deckle or torn edge.** The sheet already frames it.
6. **Soft airbrush shading.** If the tone is not made of visible lines, it is the wrong image.
7. **Rooms with people in them.** §2 is architecture only — except R4's drowned figure, which is
   the scribe and is named.
8. **A face on the wrong archetype.** Seventeen plates, seventeen distinct people. If two could be
   siblings, rerun one.
