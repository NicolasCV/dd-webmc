#!/bin/sh
# Compose one complete, self-contained generation prompt for one asset id.
#
#   ./brief.sh --list [tier]     every id, tab-separated with its tier
#   ./brief.sh --count           how many assets the programme is
#   ./brief.sh <id>              the full prompt for that id
#
# A subagent needs nothing but the output of this command. STYLE.md is the single
# source of truth for the style block; briefs/*.md hold framing and subjects.
set -e

here=$(dirname "$0")
style="$here/STYLE.md"

# Body of one "## <heading>" section, up to the next h1/h2.
section() {
  awk -v want="## $2" '
    $0 == want { on = 1; next }
    on && (/^# / || /^## /) { exit }
    on && $0 != "---" { print }
  ' "$1"
}

# Contents of every fenced block on stdin, fences dropped.
fences() { awk '/^```/ { inb = !inb; next } inb { print }'; }

# Everything outside the fences — the notes a human wrote around the prompt.
notes() { awk '/^```/ { inb = !inb; next } !inb { print }' | grep -v '^`tier' | sed '/^[[:space:]]*$/d'; }

file_for() { grep -lx "## $1" "$here"/briefs/*.md 2>/dev/null | head -1; }

# Metadata lines are `a` · `b` · `c`; pull the first token matching a pattern.
tok() { printf '%s\n' "$1" | tr '·' '\n' | tr -d '`' | sed 's/^ *//; s/ *$//' | grep -E "$2" | head -1; }

meta_of() { section "$1" "$2" | grep -m1 '^`' || true; }

ids() { grep -hx '## [a-z0-9_-]*' "$here"/briefs/*.md | sed 's/^## //' | grep -v '^_'; }

# A plate gets a mouth-open twin only if somebody speaks through it.
speakable() {
  case "$1" in
    type-none | *-impossible | *-wait | *-open) return 1 ;;
    char-* | type-*) return 0 ;;
    *) return 1 ;;
  esac
}

all_ids() {
  ids
  ids | while read -r id; do speakable "$id" && echo "$id-open"; done
}

tier_of() {
  f=$(file_for "${1%-open}") || true
  [ -n "$f" ] && tok "$(meta_of "$f" "${1%-open}")" '^tier ' | sed 's/tier //' || echo 4
}

# Ids this one is blocked on: any ref that is itself an asset id.
deps_of() {
  case "$1" in *-open) [ -z "$(file_for "$1")" ] && { echo "${1%-open}"; return; } ;; esac
  f=$(file_for "$1") || return 0
  [ -n "$f" ] || return 0
  tok "$(meta_of "$f" "$1")" '^refs: ' | sed 's/refs: *//' | tr ',' '\n' | sed 's/^ *//; s/ *$//' |
    while read -r r; do [ -n "$(file_for "$r")" ] && echo "$r"; done
  return 0
}

case "$1" in
  --count) all_ids | wc -l | tr -d ' '; exit 0 ;;
  # The 29 worth making, in order. SHIP.md's fenced blocks are the list.
  # Drops the optional mouth twins (synthesised, no section) but keeps room-landing-open, which has one.
  --ship)
    fences < "$here/SHIP.md" | tr ' ' '\n' | grep -v '^$' |
      while read -r id; do [ -n "$(file_for "$id")" ] && echo "$id"; done
    exit 0 ;;
  # Dependency waves: everything in a wave can be generated in parallel.
  --waves)
    done_ids=" "; left=$(all_ids | sort); w=0
    while [ -n "$left" ]; do
      ready=; rest=
      for id in $left; do
        blocked=0
        for d in $(deps_of "$id"); do
          case "$done_ids" in *" $d "*) ;; *) blocked=1 ;; esac
        done
        [ "$blocked" = 0 ] && ready="$ready $id" || rest="$rest $id"
      done
      [ -n "$ready" ] || { echo "cycle among:$rest" >&2; exit 1; }
      for id in $ready; do printf 'wave %s\t%s\ttier %s\n' "$w" "$id" "$(tier_of "$id")"; done
      for id in $ready; do done_ids="$done_ids$id "; done
      left=$rest; w=$((w + 1))
    done
    exit 0 ;;
  --list)
    all_ids | sort | while read -r id; do printf '%s\ttier %s\n' "$id" "$(tier_of "$id")"; done |
      if [ -n "$2" ]; then grep "tier $2\$"; else cat; fi
    exit 0 ;;
esac

id=$1
[ -n "$id" ] || { echo "usage: $0 <id> | --list [tier] | --count" >&2; exit 2; }

banner() {
  printf '================================================================\n'
  printf '  %s\n  family: %s   tier %s   %s   %spx\n  output: %s\n  refs:   %s\n' "$@"
  printf '================================================================\n\n'
}

# ---- mouth-open twins are synthesised from their parent, never hand-written ----
# A hand-written section always wins: room-landing-open and glyph-landing-open are
# real briefs whose -open means a world flag, not a mouth.
if [ "${id%-open}" != "$id" ] && [ -z "$(file_for "$id")" ]; then
  parent=${id%-open}
  pf=$(file_for "$parent")
  [ -n "$pf" ] || { echo "no such id: $id  (try --list)" >&2; exit 1; }
  speakable "$parent" || { echo "$parent gets no mouth-open twin" >&2; exit 1; }
  pmeta=$(meta_of "$pf" "$parent")
  dmeta=$(section "$pf" '_defaults' | grep -m1 '^`')
  pout=$(tok "$pmeta" '^→ ' | sed 's/→ *//')
  [ -n "$pout" ] || pout="public/art/$parent.webp"
  size=$(tok "$pmeta" '^[0-9]+$'); [ -n "$size" ] || size=$(tok "$dmeta" '^[0-9]+$')
  out=$(printf '%s' "$pout" | sed 's/\.webp$/-open.webp/')

  banner "$id" "$(basename "$pf" .md)" "$(tier_of "$parent")" "1:1" "$size" "$out" "$pout — the approved parent plate, and nothing else"
  cat <<EOF
Edit of $pout. Attach that approved plate as the ONLY reference image. Do not
attach the styleboard, the paper or the anchor — they pull the drawing off
register, and register is the entire job here.

Keep this plate absolutely identical in every respect: same person, same framing,
same crop, same head position, same scale, same angle, same hatching, same paper,
same foxing, same stains.

Change ONE thing. The mouth is open, caught mid-word: the jaw has dropped a short
way, the lips are parted, and a little dark shows between them. Draw the change in
exactly the same hatching weight as the surrounding plate.

Nothing else moves. Not the eyes, not the brows, not the head, not the hood, not
the collar, not one line of the paper. If any feature other than the mouth has
shifted by a hair, the frame is wrong and the flap will jitter.

----------------------------------------------------------------
  registration check — this twin gets animated against its parent
----------------------------------------------------------------
The two frames alternate every ~130ms while the character speaks, so any drift
reads as the whole head twitching. Before accepting:

  magick $pout $out -resize 512x -compose difference -composite \\
    -colorspace gray -auto-level /tmp/reg.png

Open /tmp/reg.png. The mouth should glow; everything else should be black. If the
eyes, the jawline or the hood edge show up, reject and regenerate.

----------------------------------------------------------------
  ./encode.sh <master> $size ../../$out
EOF
  exit 0
fi

# ---- ordinary brief ----
f=$(file_for "$id")
[ -n "$f" ] || { echo "no such id: $id  (try --list)" >&2; exit 1; }
body=$(section "$f" "$id")
meta=$(printf '%s\n' "$body" | grep -m1 '^`' || true)
dmeta=$(section "$f" '_defaults' | grep -m1 '^`')

pick() { v=$(tok "$meta" "$1"); [ -n "$v" ] || v=$(tok "$dmeta" "$1"); printf '%s' "$v"; }
out=$(pick '^→ ' | sed 's/→ *//'); [ -n "$out" ] || out="public/art/$id.webp"
size=$(pick '^[0-9]+$'); aspect=$(pick '^[0-9]+:[0-9]+$'); refs=$(pick '^refs: ' | sed 's/refs: *//')
flag=$(tok "$meta" '^flag: ')

banner "$id" "$(basename "$f" .md)" "$(tier_of "$id")" "$aspect" "$size" "$out" "$refs"
[ -z "$flag" ] || printf '  world %s — this plate replaces its base once that flag is set\n\n' "$flag"

n=$(printf '%s\n' "$body" | notes)
[ -z "$n" ] || { printf '%s\n' "$n" | sed 's|^|  # |'; echo; }

echo "----------------------------------------------------------------"
# `style: none` is for the one asset that is a photograph, not a plate.
[ "$(tok "$meta" '^style: none$')" ] || { section "$style" '§0 — Style block' | fences; echo; }
fr=$(section "$f" '_framing' | fences)
[ -z "$fr" ] || printf '%s\n\n' "$fr"
printf '%s\n' "$body" | fences
printf '\n----------------------------------------------------------------\nnegative prompt:\n'
section "$style" '§0b — Negative prompt' | fences
printf '\n----------------------------------------------------------------\n  ./encode.sh <master> %s ../../%s\n' "$size" "$out"
