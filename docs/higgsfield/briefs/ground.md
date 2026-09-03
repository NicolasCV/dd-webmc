# family: ground

Page furniture: the surface everything sits on, the two dice faces worth drawing, the closing plate,
and the essay hero.

## _defaults

`4:3` · `1024` · `refs: styleboard, paper, anchor`

## _framing


## table

`tier 3` · `16:9` · `2560` · `→ public/art/table.webp` · `refs: none` · `style: none`

**Breaks §0.** This is a photograph, not a plate. Use only §0b, the negative prompt.

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

The quiet centre is load-bearing: the sheets sit on top with heavy drop shadows, and grain fighting
them reads as noise. Current file is 33K behind a `0.55` black scrim; ~60K is a fair budget.

## table-portrait

`tier 4` · `9:16` · `1440` · `→ public/art/table-portrait.webp` · `refs: table`

Edit of `table`, reframed. The mobile branch currently crops the landscape plate to `30% 0`, which
works but wastes it.

```
Reframe this exact table top as a tall vertical photograph, same wood, same wax,
same raking light from the upper left, same ring stain. Nothing on the table.
The centre must stay quiet and even; keep the interesting grain to the top and
bottom edges.
```

Wire-in — three lines in `index.css`, replacing the existing mobile branch:

```css
@media (max-width: 640px) {
  body::before { background-image: linear-gradient(…), url(/art/table-portrait.webp); }
}
```

## die-20

`tier 4` · `1:1` · `768` · `→ public/art/die-20.webp` · `refs: styleboard, paper, anchor`

Renders beside a natural 20 only. Twenty faces would be silly; two are a beat.

```
FRAMING: single object centred on bare paper, square 1:1. Specimen plate. No
ground line, no cast shadow beyond a light hatched one.

SUBJECT: a twenty-sided die cut from bone, resting on bare paper, seen from
slightly above so one triangular face is presented flat to the viewer. The
presented face carries the numeral 20, incised into the bone and inked dark. This
numeral is the ONLY text permitted in the image — no other numbers on any other
visible face, which are left blank. Worn edges, a hairline crack, one corner
stained from handling.
```

## die-1

`tier 4` · `1:1` · `768` · `→ public/art/die-1.webp` · `refs: die-20`

Edit of `die-20`, so it is unmistakably the same die.

```
Keep this exact die, the same bone, the same wear, the same crack, the same
angle and lighting. Change only the numeral on the presented face: it now reads
1. No other numerals anywhere.
```

## ledger-closed

`tier 3` · `4:3` · `1024` · `→ public/art/ledger-closed.webp` · `refs: styleboard, paper, anchor`

The end-card, above *"The account is closed"*. The ledger with two names, one struck out, is
simultaneously the ending of the story and a picture of the core mechanic. Best single-image payoff
in the programme.

**Text exception**, illegible script only.

```
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

A notched wooden tally-stick lies across the gutter of the book. A steel pen
rests in the fold.
```

Two failure modes to pre-empt: the model wants the script legible, and it wants the strike neat.
Reject legible words; reject a ruled-looking strike. It has to look drawn by a hand, because the
app's own `.strike-rule` is.

## hero-band

`tier 4` · `20:7` · `2000` · `→ public/art/hero-band.webp` · `refs: styleboard, paper, anchor`

`why.html` is 841 lines of essay with three portraits and no hero.

```
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

The struck rule is the point. If it does not come out heavier than the ruling around it, reject —
the plate is illustrating unregistration.
