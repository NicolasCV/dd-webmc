# family: type

Stand-ins for characters the player invents. `/api/create` turns a sentence into a sheet, and right
now that sheet's portrait is `Monogram` — a grey box with one letter in it, the same grey box every
time. This is the second act of the demo and it currently ends on nothing.

Keyed on `skills[0]` and a warmth band, so a cold lockpick and a warm lockpick are different people.

Seventeen plates have to read as **seventeen different people**. Age, build, sex and colouring are
varied on purpose below — generate the family in one sitting so the model holds the spread, and if
two of them could be siblings, rerun one.

Each gets a `-open` twin, synthesised by `brief.sh`.

## _defaults

`1:1` · `1024` · `refs: styleboard, paper, anchor`

## _framing

```
FRAMING: head-and-shoulders bust, square 1:1. The eyes sit at roughly 38% down
from the top edge and the head occupies the upper 60% of the frame; the lower
third is shoulders dissolving into bare paper. Three-quarter turn toward the
viewer, eyes to camera. One person only. No weapons drawn, no raised hands, no
scene.
```

All references: `styleboard, paper, anchor`. All `1:1`, `1024`, output `public/art/<id>.webp`.

## type-force-cold

`tier 4`

```
SUBJECT: a thickset woman in her fifties, jaw set, cropped grey hair, a
leather-and-plate pauldron on one shoulder, one front tooth broken.

The face is closed. No warmth in the eyes, no softness in the mouth. Not
snarling, not villainous — simply unavailable.
```

## type-force-warm

`tier 4`

```
SUBJECT: a big young man, sunburned and open-faced, sleeveless mail, a linen
bandage wound around one forearm.

The face is open and legible, with some warmth around the eyes. Not smiling for
the viewer — at ease, and willing to be read.
```

## type-stealth-cold

`tier 4`

```
SUBJECT: a narrow-faced person of indeterminate age, hood up, half the face lost
in shadow hatching, high buttoned collar, nothing ornamental anywhere.

The face is closed. No warmth in the eyes, no softness in the mouth. Not
snarling, not villainous — simply unavailable.
```

## type-stealth-warm

`tier 4`

```
SUBJECT: a small wiry woman in her twenties, hood pushed back, freckled, a smudge
of soot along one cheekbone.

The face is open and legible, faintly amused, with warmth around the eyes. Not
smiling for the viewer — at ease, and willing to be read.
```

## type-lockpicking-cold

`tier 4`

```
SUBJECT: a gaunt man in his sixties, a jeweller's loupe pushed up onto his
forehead, thin mouth, high collar.

The face is closed. No warmth in the eyes, no softness in the mouth. Not
snarling, not villainous — simply unavailable.
```

## type-lockpicking-warm

`tier 4`

```
SUBJECT: a young person with hair pinned up by a slender lockpick, collar open,
the beginning of a grin.

The face is open and legible, with warmth around the eyes. At ease, and willing
to be read.
```

## type-lore-cold

`tier 4`

```
SUBJECT: an austere man in his forties, small round spectacles, a high buttoned
scholar's collar, ink-stained fingers not visible.

The face is closed. No warmth in the eyes, no softness in the mouth. Not
snarling, not villainous — simply unavailable.
```

## type-lore-warm

`tier 4`

```
SUBJECT: a round-faced woman in her seventies, unruly white hair, spectacles low
on the nose, half a smile, a book strap crossing the shoulder.

The face is open and legible, with real warmth around the eyes. At ease, and
willing to be read.
```

## type-perception-cold

`tier 4`

```
SUBJECT: a weathered hunter of about fifty, hooded deep-set eyes, a hawk's feather
in the hatband, gaze fixed slightly off to one side.

The face is closed. No warmth in the eyes, no softness in the mouth. Not
snarling, not villainous — simply unavailable.
```

## type-perception-warm

`tier 4`

```
SUBJECT: a wind-burned young scout, hood down, hair blown across the brow, a coil
of thin line over one shoulder, looking straight at the viewer.

The face is open and legible, with warmth around the eyes. At ease, and willing
to be read.
```

## type-medicine-cold

`tier 4`

```
SUBJECT: a severe woman in her forties, hair fully covered, an apron strap over
one shoulder, a flat case of surgeon's blades at her chest.

The face is closed. No warmth in the eyes, no softness in the mouth at all. Not
snarling, not villainous — simply unavailable.
```

## type-medicine-warm

`tier 4`

```
SUBJECT: an old man with a soft heavy face, spectacles, a satchel strap across
the chest, tired kind eyes.

The face is open and legible, with warmth around the eyes. At ease, and willing
to be read.
```

## type-persuasion-cold

`tier 4`

```
SUBJECT: a sleek person in their forties, high embroidered collar, a signet on a
fine chain, wearing a courtier's flat professional smile that does not reach the
eyes.

The face is closed despite the smile. No warmth in the eyes. Not snarling, not
villainous — simply unavailable.
```

## type-persuasion-warm

`tier 4`

```
SUBJECT: a broad-shouldered woman in her fifties, deep laughing lines, coat open
at the throat, a merchant's brass token on a cord.

The face is open and legible, with real warmth around the eyes. At ease, and
willing to be read.
```

## type-intimidation-cold

`tier 4`

```
SUBJECT: a scarred bald man, heavy studded gorget, a broken nose badly set.

The face carries no expression whatsoever. No warmth, no anger, nothing.
Unavailable.
```

## type-intimidation-warm

`tier 4`

```
SUBJECT: a heavyset woman in her sixties in a butcher's leather apron bib, direct
and openly amused stare.

The face is open and legible, with warmth around the eyes. At ease, and entirely
willing to be read.
```

## type-none

`tier 3` · `→ public/art/type-none.webp`

The fallback when there is no dominant skill — **and the whole family, if you would rather not put a
face on a character the player imagined.** One asset, no mismatch, and still far better than
`bg-ink/5`. If you ship only this one, the monogram letter sets inside the empty oval.

```
FRAMING (overrides the family framing): square 1:1, the oval centred and filling
most of the frame.

SUBJECT: an empty oval portrait cartouche — a plain engraved oval rule with a
narrow hatched border, of the kind a printer leaves blank for a plate not yet
cut. The oval is completely empty: bare cream paper inside, no face, no figure,
no silhouette, no shadow, nothing drawn within the oval at all. Faint pencil
guide-lines, barely visible, cross the empty space where a head would have been
laid in. No text.
```
