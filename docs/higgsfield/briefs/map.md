# family: map

`Room.tsx` draws a live map: fog-of-war on unvisited cells, oxblood cross-marks on locked exits,
prop pips, a token where you are. **None of that gets replaced.** The SVG stays exactly as it is.

What these plates do is fill in the *inside* of a room cell — the parchment content — while the SVG
keeps drawing the state layer on top of it. Image underneath, state above. The map gains a
surveyor's drawing and loses nothing.

Glyphs are plan views: looking straight down at the room, the way a dungeon map is drawn.

## _defaults

`1:1` · `512` · `refs: styleboard, paper, anchor`

## _framing

```
FRAMING: overhead plan view, looking straight down. Square 1:1, drawn as a
surveyor's ink plan — walls in double line, hatched fill for solid rock, open
floor left as bare paper. Small, spare, legible at 90 pixels across: no fine
detail that would close up at that size. Nothing but the room's own footprint.
The drawing dissolves into bare paper at the edges. No compass rose, no scale
bar, no north arrow, no text, no numbers.
```

Every glyph renders at ~86×54 CSS px inside the map cell. Test at that size before accepting: a
plan that is beautiful at 512 and mush at 86 is a fail.

## glyph-landing

`tier 2` · `1:1` · `512` · `→ public/art/glyph-landing.webp` · `refs: styleboard, paper, anchor`

```
SUBJECT: the plan of a small square landing chamber. A flight of six stair treads
enters from one side, drawn as parallel lines, and stops dead at a wall of rubble
hatched solid. The opposite wall is broken by one very thick double-line door,
drawn closed — a heavy bar across it. Loose rubble stippled along one wall.
```

## glyph-landing-open

`tier 3` · `1:1` · `512` · `→ public/art/glyph-landing-open.webp` · `refs: glyph-landing` · `flag: door_open`

Edit of `glyph-landing`.

```
Keep this exact plan. Change only the door: the bar is gone and the thick door
leaf has swung inward on its hinge, drawn as an arc of dashed line showing the
swing. Everything else is unchanged.
```

## glyph-hall

`tier 2` · `1:1` · `512` · `→ public/art/glyph-hall.webp` · `refs: styleboard, paper, anchor`

```
SUBJECT: the plan of a long narrow corridor running the width of the square, far
longer than it is wide. Both long walls are drawn with a fine inner hatched band
against them, marking the murals. Three small rectangular floor grates spaced
along the centre line. A door at each short end.
```

## glyph-cistern

`tier 2` · `1:1` · `512` · `→ public/art/glyph-cistern.webp` · `refs: styleboard, paper, anchor`

```
SUBJECT: the plan of a broad rectangular vaulted chamber. A regular grid of small
solid square piers marches across the whole floor. The floor between them is
filled with the fine horizontal parallel ruling that means standing water on a
survey plan. One small circle marks a single figure standing near the centre.
```

## glyph-vault

`tier 2` · `1:1` · `512` · `→ public/art/glyph-vault.webp` · `refs: styleboard, paper, anchor`

```
SUBJECT: the plan of a small squarish chamber. Three of the four walls carry a
thick banded strip drawn tight against them, marking shelving, ruled into many
small even divisions. The fourth wall has a single door. A small rectangle stands
alone in the middle of the floor — a reading stand.
```

## map-ground

`tier 3` · `16:7` · `1600` · `→ public/art/map-ground.webp` · `refs: paper`

The ground the whole map strip sits on. Nothing drawn — a surface, not a picture.

```
[§0 applies, except that this plate has NO SUBJECT and nothing drawn on it.]

SUBJECT: bare aged survey paper and nothing else. Heavier and more used than the
portrait plates: two soft crease lines from being folded and unfolded many times,
a broad faint tea-coloured stain across one corner, scattered foxing, visible
laid fibre, one worn patch where a thumb has rested for years.

Absolutely nothing is drawn on it. No map, no lines, no marks, no border, no
text, no figures. It is a blank sheet.
```

Reject anything with a drawn line on it. The model will want to add a map; it must not.

## map-surveyed

`tier 3` · `4:3` · `2000` · `→ public/art/map-surveyed.webp` · `refs: styleboard, paper, anchor`

The end-of-run reward: the map as the player finished it. Renders once, on the closing screen,
beside the run's statistics.

```
FRAMING (overrides the family framing): a complete finished dungeon survey on one
sheet, 4:3. Plan view throughout. The drawing dissolves into bare paper at the
edges.

SUBJECT: an ink survey of four connected chambers, drawn as one plate by one
hand. Arranged as: a small square landing at upper left; a long narrow corridor
running right from it across the top; a squarish shelved chamber at upper right
at the corridor's far end; and a broad pillared chamber below the middle of the
corridor, connected up to it.

The landing has stair treads and a heavy door. The corridor has hatched mural
bands along both long walls and floor grates down its centre. The lower chamber
has a grid of square piers and horizontal ruling for standing water. The upper
right chamber has banded shelving on three walls and a small stand in the middle.

Passages between chambers are drawn as short double-line corridors. Walls in
double line, solid rock hatched, floors left as bare paper.

NO text, NO room names, NO labels, NO numbers, NO compass rose, NO scale bar,
NO legend, NO title cartouche, NO key. The drawing alone.
```

The no-labels rule is doing real work here — the app sets the room names in Fraunces over the top,
and a plate that arrives with its own hand-lettered names cannot be used.
