# family: char

**The idea worth the whole programme.** The portrait plate is keyed to the speech act the tool call
produced. Brakka calls `mock`, you get the mocking plate. He calls `threaten`, you get that one.

Which means the plate set *is* the tool set. Brakka has no `reassure` plate for the same reason he
has no `reassure` tool: it was never registered. The art is scoped by the same gate as the API, so
a closed family is closed on the sheet, in the registry, and on his face.

`char-<name>-impossible` is the one deliberate exception — the plate of the act that does not
exist, drawn so it can be struck through at the end of the run. See its brief.

Every act plate also gets a `-open` twin for the mouth flap during TTS; `brief.sh` synthesises those
from the parent, so do not write them here. Generate them as **localised edits of the approved
parent**, never fresh — see `dispatch.md`.

## _defaults

`1:1` · `1024` · `refs: styleboard, paper, anchor`

## _framing

```
FRAMING: head-and-shoulders bust, square 1:1. The eyes sit at roughly 38% down
from the top edge and the head occupies the upper 60% of the frame; the lower
third is shoulders dissolving into bare paper. Three-quarter turn toward the
viewer, eyes to camera. One person only.

The face carries the whole plate. Do not add props, weapons, gestures or scene —
only the head, the shoulders, and what is already worn.
```

---

# Brakka — gruff mercenary, warmth 15, nerve 80

Preserve across all eight plates: heavyset, late forties, close-cropped hair, thick neck, broad
flattened nose, deep vertical frown lines, a scar crossing the left brow and cheek, small pale eyes.
Mail coif, standing leather-and-mail gorget closed at the throat by a single brass clasp.

Only the expression changes. If he starts looking like a different man, reject.

## char-brakka

`tier 1` · `1:1` · `4096` · `→ public/art/brakka.webp` · `refs: styleboard, paper, anchor, brakka`

Re-render of the shipped plate at master resolution, and the reference every other Brakka plate
hangs off. Run it as an edit of `public/art/brakka.webp`.

```
Redraw this exact plate at full resolution, keeping the same man, the same face
and the same pose. Preserve every identifying feature listed above and the sour
set of the mouth. Deepen and sharpen the crosshatching. Do not restyle, do not
prettify, do not change his age, weight or expression.

Recompose only the framing: bring the eyes to 38% down from the top edge so the
head sits in the upper portion of the square.
```

## char-brakka-mock

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-mock.webp` · `refs: char-brakka`

```
SUBJECT: the same man, mocking. One eyebrow up, the scarred one. The mouth pulled
flat and slightly to one side — not a grin, not a sneer, the expression of a man
who has just said something short and is watching it land. Eyes half lidded and
entirely on you. He is not enjoying this especially; it is simply the setting he
has.
```

## char-brakka-threaten

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-threaten.webp` · `refs: char-brakka`

```
SUBJECT: the same man, promising violence. Absolutely still. The brows down and
level, the jaw set, the mouth closed and relaxed — no snarl, no bared teeth, no
theatre. The chin has come down a fraction so he is looking at you from slightly
under the brow. This is the face of someone stating a plan, and the plan is bad.
```

## char-brakka-state_flatly

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-state_flatly.webp` · `refs: char-brakka`

```
SUBJECT: the same man, stating a fact. Neutral, direct, unhurried. Eyes level and
straight at you, mouth closed and unexpressive, brows flat. Nothing is being
softened and nothing is being pressed. The most closed face in the set: it gives
away exactly the fact and nothing about how he feels about it.
```

## char-brakka-dismiss

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-dismiss.webp` · `refs: char-brakka`

```
SUBJECT: the same man, waving it off. The head turned a few degrees further away
than the eyes, so he is already half looking elsewhere. Eyelids lowered, one
corner of the mouth slack, brows slightly raised in the middle — the universal
face of not-worth-it. Bored rather than angry.
```

## char-brakka-refuse_flatly

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-refuse_flatly.webp` · `refs: char-brakka`

```
SUBJECT: the same man, refusing. Chin lifted very slightly, mouth firmly closed
in a straight line, eyes locked on yours without blinking. Brows level, not
lowered — this is not anger, it is a door. No explanation is coming and the face
says so before the word does.
```

## char-brakka-wait

`tier 3` · `1:1` · `1024` · `→ public/art/brakka-wait.webp` · `refs: char-brakka`

The companion can now call `wait_for_moment` — choose to say nothing. That is a move, and it
deserves a face.

```
SUBJECT: the same man, saying nothing on purpose. Looking slightly past you, off
to one side, mouth closed, entirely unhurried. Not avoiding your eye and not
meeting it either. The face of someone who has decided the moment is yours and is
prepared to wait through as much silence as it takes.
```

## char-brakka-impossible

`tier 2` · `1:1` · `1024` · `→ public/art/brakka-impossible.webp` · `refs: char-brakka`

**The best single image in the programme.** At the end of a run the app says *"{name} never once
had `reassure` `encourage` `apologize`. Not declined — not registered."* This is the plate of that
sentence: the face he structurally cannot make, drawn so it can be struck out.

```
SUBJECT: the same man — but kind. Genuinely, openly warm: the eyes creased at the
corners with real feeling, the brows lifted in the middle in sympathy, the mouth
softened into a small honest smile that reaches the eyes. Every hard line in the
face has gone slack. He looks like he is about to tell you it will be all right.

It must be unmistakably the SAME MAN — same scar, same nose, same build, same
gorget — wearing an expression that does not belong to him. That contradiction
is the entire image. Do not make him a different, gentler person; make this man
do a thing he cannot do.
```

Wire-in: rendered at game end under an oxblood strike rule, using the same `.strike-rule` path the
sheet uses to unregister a tool. Never rendered during play.

---

# Sister Wen — field medic, warmth 82, nerve 45

Preserve: sixties, long face, hollow cheeks, grey hair scraped back, pale steady level eyes. Deep
hood of dark wool worn up and thrown back off the face, heavy dark travelling mantle, a broad
leather strap across the chest with a brass buckle.

## char-wen

`tier 1` · `1:1` · `4096` · `→ public/art/wen.webp` · `refs: styleboard, paper, anchor, wen`

```
Redraw this exact plate at full resolution, keeping the same woman, the same face
and the same pose. Preserve every identifying feature listed above and the mouth
that has stopped expecting much. Deepen and sharpen the crosshatching; keep the
soft ink wash in the mantle. Do not restyle, do not soften her, do not change her
age.

Recompose only the framing: bring the eyes to 38% down from the top edge.
```

## char-wen-reassure

`tier 2` · `1:1` · `1024` · `→ public/art/wen-reassure.webp` · `refs: char-wen`

```
SUBJECT: the same woman, telling you the true thing that helps. Steady and level,
eyes fully on yours, brows relaxed. The mouth is not smiling — the comfort is in
the steadiness, not in a smile. This is a face that has said this over people who
did not live and is not going to start lying now. Warm, and completely without
sweetness.
```

## char-wen-admit_fear

`tier 2` · `1:1` · `1024` · `→ public/art/wen-admit_fear.webp` · `refs: char-wen`

```
SUBJECT: the same woman, saying plainly what frightens her. Eyes still level and
still on yours — she is not looking away, that is the point. A tightness at the
jaw and around the eyes that was not there before. She is not asking to be
comforted and the face is not asking either. She is levelling with you and it
costs something.
```

## char-wen-share_memory

`tier 2` · `1:1` · `1024` · `→ public/art/wen-share_memory.webp` · `refs: char-wen`

```
SUBJECT: the same woman, remembering. The focus has gone a little past you and
slightly down, seeing something that is not in this room. The face has opened and
softened, unguarded in a way it never is otherwise. No smile, no grief on
display — she is simply somewhere else for a moment, and she has let you see it.
```

## char-wen-state_flatly

`tier 2` · `1:1` · `1024` · `→ public/art/wen-state_flatly.webp` · `refs: char-wen`

```
SUBJECT: the same woman, giving the fact. Direct, calm, eyes to yours, mouth
closed and even. No softening and no hardening. The face of someone for whom the
fact is the kindest thing available, offering it as such.
```

## char-wen-insist

`tier 2` · `1:1` · `1024` · `→ public/art/wen-insist.webp` · `refs: char-wen`

```
SUBJECT: the same woman, saying it again the same way. Chin very slightly down,
eyes steady and unblinking, the mouth set with a small deliberate patience. No
heat, no frustration, no raised brow. She has been overruled by confident people
before and buried the result, and the face is entirely aware of that.
```

## char-wen-wait

`tier 3` · `1:1` · `1024` · `→ public/art/wen-wait.webp` · `refs: char-wen`

```
SUBJECT: the same woman, holding her peace. Attentive, wholly present, watching
you without any pressure in it. Mouth closed, hands not visible, brows relaxed.
The particular stillness of a medic waiting to see whether she is needed yet.
```

## char-wen-impossible

`tier 2` · `1:1` · `1024` · `→ public/art/wen-impossible.webp` · `refs: char-wen`

Wen's nerve is 45, so Provoke is closed: she is structurally unable to mock you.

```
SUBJECT: the same woman — but cruel. A hard bright edge in the eyes, one brow up,
the mouth curled into a small pleased sneer. Openly enjoying someone else's
discomfort. Every trace of the field medic's steadiness has gone out of the face.

It must be unmistakably the SAME WOMAN — same age, same hollow cheeks, same hood
and mantle and brass buckle — wearing an expression that does not belong to her.
Do not make her younger, harder-featured or a different person; make this woman
do a thing she cannot do.
```

---

# Ilke — second-storey specialist, warmth 55, nerve 65

Preserve: lean, thirties, sharp cheekbones, dark hair falling across the forehead, one eyebrow
naturally higher, a faint one-sided knowing half-smile. Deep pointed hood worn up, a wound scarf at
the throat, a leather chest strap with two slender lockpicks on a thong.

## char-ilke

`tier 1` · `1:1` · `4096` · `→ public/art/ilke.webp` · `refs: styleboard, paper, anchor, ilke`

```
Redraw this exact plate at full resolution, keeping the same person, the same
face and the same pose. Preserve every identifying feature listed above. Deepen
and sharpen the crosshatching. Do not restyle, do not change the expression —
the half-smile is the whole character.

Recompose only the framing: bring the eyes to 38% down from the top edge.
```

## char-ilke-change_subject

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-change_subject.webp` · `refs: char-ilke`

```
SUBJECT: the same person, pointing at something else. The eyes have gone off to
one side, bright and interested in whatever is over there, while the head is
still turned toward you — caught in the half-second of changing the subject. The
half-smile is still running. Smooth, practised, not remotely subtle if you were
watching for it.
```

## char-ilke-goad

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-goad.webp` · `refs: char-ilke`

```
SUBJECT: the same person, needling you into moving. Eyebrows up, eyes wide and
delighted, the half-smile widened into open provocation. Chin tipped slightly
forward. The face of someone who has just told you that you cannot do it and is
waiting, with enormous enjoyment, to be proved wrong.
```

## char-ilke-mock

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-mock.webp` · `refs: char-ilke`

```
SUBJECT: the same person, taking a quick shot. A short amused exhale caught in
the face — nose slightly wrinkled, one eye narrowed, the smile crooked and gone
almost as fast as it came. Affectionate. They like you. It is not going to stop
them.
```

## char-ilke-dismiss

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-dismiss.webp` · `refs: char-ilke`

```
SUBJECT: the same person, waving it off and already moving. The head turned
several degrees away, eyes forward and elsewhere, brows up in easy unconcern, the
mouth relaxed. Not a problem, and not a subject worth another second. Genuinely
unbothered rather than reassuring.
```

## char-ilke-state_flatly

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-state_flatly.webp` · `refs: char-ilke`

```
SUBJECT: the same person with the patter switched off. The half-smile is
completely gone — that absence is the whole plate. Eyes level and direct, mouth
straight, face still. It is startling on this face, and that is exactly why it
lands.
```

## char-ilke-refuse_flatly

`tier 2` · `1:1` · `1024` · `→ public/art/ilke-refuse_flatly.webp` · `refs: char-ilke`

```
SUBJECT: the same person refusing, lightly. The half-smile is still there and it
means nothing — the eyes underneath it are flat and immovable. Head tilted a
degree or two, brows relaxed. Pleasant, warm even, and absolutely closed. Nobody
has ever talked them out of one.
```

## char-ilke-wait

`tier 3` · `1:1` · `1024` · `→ public/art/ilke-wait.webp` · `refs: char-ilke`

```
SUBJECT: the same person, deliberately saying nothing. Eyebrows slightly raised,
mouth closed on the half-smile, watching you with open curiosity about what you
are going to do with the silence. Enjoying it a little. They can hold this a lot
longer than you can.
```

## char-ilke-impossible

`tier 3` · `1:1` · `1024` · `→ public/art/ilke-impossible.webp` · `refs: char-ilke`

Ilke's warmth is 55: Support opens at 60 and Disclose at 75. Both closed, by five points.

```
SUBJECT: the same person — but open. The hood pushed back off the head entirely,
the guard completely down, eyes wet and unhidden, mouth soft. Caught mid-sentence
in an admission they would never make. No smile, no deflection, nothing held in
reserve. Utterly sincere.

It must be unmistakably the SAME PERSON — same cheekbones, same hair, same scarf
and chest strap — with every defence removed. Do not make them a softer-looking
person; make this person do a thing they cannot do.
```
