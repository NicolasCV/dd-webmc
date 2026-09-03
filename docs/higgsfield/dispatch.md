# Dispatch

123 assets, each one a self-contained unit of work. `./brief.sh <id>` prints everything needed to
generate it — style block, framing, subject, references, output path, encode command. A subagent
gets one id and needs nothing else.

```sh
./brief.sh --count            # 123
./brief.sh --list             # every id with its tier
./brief.sh --list 1           # just tier 1
./brief.sh --waves            # dependency-ordered; a wave runs in parallel
./brief.sh char-brakka-mock   # the full prompt
```

## Before any dispatch

**Generate the anchor yourself and approve it by eye.** It is in `STYLE.md`, it takes about twenty
attempts, and it is the one thing that cannot be delegated — every subagent inherits its judgement
from that file, and a loose anchor means 123 loose plates. Save the winner to `refs/anchor.jpg`.

## The waves

```
wave 0   44 assets   nothing blocks them — rooms, props, glyphs, archetypes, ground
wave 1   61 assets   need an approved parent (act plates, flag variants, the -open twins' parents)
wave 2   17 assets   the mouth-open twins
wave 3    1 asset    seq-create-3
```

Everything inside a wave is independent, so a wave is one fan-out. Do not start a wave until the
previous one's outputs are approved and on disk — the whole point of the dependency graph is that
`char-brakka-mock` is an edit of the *approved* `char-brakka`, not of a candidate.

## Subagent prompt

One agent, one id. Paste this with `<ID>` filled in:

```
Generate the Party of Two plate `<ID>`.

1. Run: docs/higgsfield/brief.sh <ID>
   That prints the complete prompt, the reference images to attach, the output
   path and the encode command. Follow it exactly. Do not improvise on style,
   framing or subject — the wording is deliberate and has been tuned.

2. Attach the reference images it names, from docs/higgsfield/refs/ and
   public/art/. Attach nothing else.

3. Generate 4-6 candidates in Higgsfield with Nano Banana Pro at the aspect
   ratio and resolution the brief gives.

4. Reject against STYLE.md's standing rejection list. The three that catch most
   failures: a filled or dark background (dies under multiply), any text the
   model added, and tone made of soft shading instead of visible lines.

5. Encode the best one:
     docs/higgsfield/encode.sh <master> <size> <the brief's output path>
   It prints mean luminance and stddev and refuses anything outside
   mean 160-200, stddev >= 65. If it refuses, the plate is wrong — go back to
   step 3, do not adjust the thresholds.

6. Keep the 4K master OUT of the repo. Only the encoded webp is committed.

7. Report: the output path, the encode line, and one sentence on what you
   rejected and why.
```

For a `-open` twin the brief prints an extra registration check. It is not optional — a twin that
drifts makes the head twitch, and it is the single most likely failure in the whole programme.

## Rules for the fan-out

**One id per agent.** Two ids in one context means the second inherits the first's drift.

**Never let an agent write its own style text.** If a brief seems to be missing something, fix the
brief and re-dispatch. Style lives in `STYLE.md`; that is the only place it lives.

**Approve before you build on it.** A parent plate that is merely "good enough" propagates to five
act plates and five mouth twins.

**Same sitting for the archetypes.** `type-*` has to read as sixteen different people. Dispatching
them across sixteen fresh contexts is the way to get sixteen versions of the same face — run them in
one session, or check the contact sheet afterwards and rerun the duplicates.

## Proof and encode

`proof.html` renders candidates at real size on real vellum under the real
`mix-blend-mode: multiply`, and computes the same mean/stddev `encode.sh` does. Open it, drop a
folder of candidates, judge them there. A gallery card on white is not the test.

```sh
python3 -m http.server 8777          # from the repo root
open http://localhost:8777/docs/higgsfield/proof.html
```

## Budget

At ~4 candidates per keeper, 123 assets is roughly 500 generations. Waves 0 and 1 are 105 of them;
if the day runs short, tier 1 and tier 2 are the ones that change how the app feels.

| tier | count | what |
|---|---|---|
| 1 | 11 | room plates, the three character masters |
| 2 | 57 | act plates, props, glyphs, doing plates |
| 3 | 16 | flag variants, map, end-card |
| 4 | 39 | archetypes, mouth twins, dice, hero |
