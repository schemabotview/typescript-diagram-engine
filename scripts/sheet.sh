#!/usr/bin/env bash
# Contact sheets of a course's shots, four per sheet (2×2 at 1920×1080 each), to LOOK at quickly.
set -euo pipefail
dir="scripts/out/shots-4k/$1"; i=0; set -- "$dir"/[0-9]*.png
while [ $# -gt 0 ]; do
  ins=(); for k in 1 2 3 4; do [ $# -gt 0 ] && { ins+=(-i "$1"); shift; } || ins+=(-f lavfi -i "color=c=black:s=3840x2160:d=1"); done
  i=$((i+1))
  ffmpeg -v error -y "${ins[@]}" -filter_complex "[0]scale=1920:1080[a];[1]scale=1920:1080[b];[2]scale=1920:1080[c];[3]scale=1920:1080[d];[a][b][c][d]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0" -frames:v 1 "$dir/sheet-$i.png"
  echo "$dir/sheet-$i.png"
done
