#!/bin/sh
# Master -> shipping webp, with the acceptance check the sheet actually cares about.
# usage: ./encode.sh <master> <width> <out.webp> [quality]
set -e

[ $# -ge 3 ] || { echo "usage: $0 <master> <width> <out.webp> [quality]" >&2; exit 2; }

magick "$1" -resize "$2x" -quality "${4:-80}" -define webp:method=6 "$3"

set -- "$3" "$(du -h "$3" | cut -f1)" \
  $(magick "$3" -colorspace gray -format "%[fx:int(mean*255)] %[fx:int(standard_deviation*255)]" info:)

printf '%s  %s  mean %s  stddev %s  ' "$1" "$2" "$3" "$4"
# Plates are multiplied onto vellum, so a dark plate reads as a smudge however good it looks alone.
if [ "$3" -lt 160 ] || [ "$3" -gt 200 ]; then
  echo "** mean outside 160-200 — will go muddy under multiply, reject **"
elif [ "$4" -lt 65 ]; then
  echo "** stddev under 65 — flat shading, not crosshatch, reject **"
else
  echo "OK"
fi
