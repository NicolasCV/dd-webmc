# What to actually make

29 of the 123. `./brief.sh --ship` prints them in order; stop wherever you run out of day and the
thing still hangs together.

The full programme in `briefs/` stays where it is — it is the plan for a week, not for tonight.

## The cut, and why

**Everything kept is either on screen constantly or makes the argument.** Everything cut is
decoration, or costs more in wiring and risk than it returns.

| Cut | Count | Why |
|---|---|---|
| mouth-open twins | 19 | Doubles the character work, needs a per-plate diff check, and only shows with sound on. A drifting twin makes the head twitch, which looks worse than no motion at all. The act plates already give a face that changes every utterance — that is most of the aliveness at half the cost and none of the jitter. |
| archetypes `type-*` | 16 | `type-none` alone fixes the grey monogram box, with no risk of a face contradicting the character the player just wrote. One asset instead of sixteen. |
| prop plates | 12 | 180px of garnish. No argument value. |
| `doing-*` | 10 | Makes the asymmetric-capability point the act plates already make better, and needs a new render path. |
| map glyphs | 5 | Five plates and a `clipPath` for an 86px surface, against a live state layer that already works. Most likely change to make a good component worse. |
| flag variants (3 of 4) | 3 | `room-landing-open` carries the idea. The other three are the same trick again. |
| seq, dice, hero, map-surveyed, table-portrait | 8 | Nice. Not tonight. |

`table` is the one judgement call I'd defend either way — one asset, zero wiring, same filename, but
it sits behind a 0.55 black scrim doing very little. Left out; add it if everything else lands.

## The order

### A · Foundation — 8 assets

Biggest visible change for the least work, and it unblocks everything else.

```
char-brakka  char-wen  char-ilke
room-landing  room-hall  room-cistern  room-vault
type-none
```

The three character re-renders are the parents every act plate is edited from, and they fix the
crop — at 96px Brakka currently shows mostly forehead. **Only ship a re-render if it is clearly
better than what is there**; these three already work and the downside of a worse master propagates
to five children.

Four room plates turn "walk into the next room and the whole set turns over" from a heading and a
paragraph into something that actually turns over.

`type-none` is the empty engraved cartouche, with the monogram letter set inside it. It kills the
grey box on every character the player invents.

Stop here and the app is already materially better.

### B · Faces that change — 10 assets

The idea worth the day: the plate is keyed to the speech act the tool call produced, so the plate
set is the tool set.

Ordered by what the eval says actually gets called — across both runs only four acts ever fired
(`refuse_flatly` 58, `state_flatly` 47, `dismiss` 23, `mock` 22) and the other nine fired zero
times. All four sit in the always-open families, which is why they dominate.

```
char-brakka-state_flatly   char-brakka-refuse_flatly
char-brakka-dismiss        char-brakka-mock
char-ilke-state_flatly     char-ilke-refuse_flatly
char-ilke-dismiss
char-wen-state_flatly      char-wen-insist          char-wen-reassure
```

Wen has no Deflect or Refuse acts at all — her set is Assert plus Support plus Disclose — so
`insist` and `reassure` are her equivalents of the four, and without them she is the one character
whose face never moves.

### C · The ending — 4 assets

```
char-brakka-impossible  char-wen-impossible  char-ilke-impossible
ledger-closed
```

The three impossible plates are the thesis as an image: the same person wearing the expression the
registry will not let them have, struck through with the rule the sheet already uses to unregister a
tool. Seen once, at the end, and it is the frame a judge screenshots.

`ledger-closed` is the ending of the story and a picture of the mechanic in one plate.

### D · Completion — 7 assets

```
char-brakka-threaten     char-ilke-mock       char-ilke-change_subject
char-ilke-goad           char-wen-admit_fear  char-wen-share_memory
room-landing-open
```

Fills in every registered act so no character ever falls back to neutral mid-scene, and adds the one
flag-keyed room — the door you just shouldered open, open.

## If you want the mouths after all

Do three twins, not nineteen: `char-brakka-state_flatly-open`, `char-wen-state_flatly-open`,
`char-ilke-state_flatly-open`. That is the most-called act on every character, so it covers most
speech, and `Portrait` simply does not flap when a twin is missing.

Do not do the neutrals — the act plate is what is on screen while they talk, so a twin of the
neutral would never be seen.

## Budget

29 assets at ~4 candidates each is roughly 120 generations. The constraint is your review time, not
Higgsfield's.

Wiring is three touch points, all small: `Portrait` takes the sheet and an act;
`Room.plate` plus the existing `isRoomName` branch in `Line`; two images in the `over` block. The
speaking-mode plumbing in `README.md` is only needed if you do the optional twins.
