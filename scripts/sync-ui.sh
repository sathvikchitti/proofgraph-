#!/usr/bin/env bash
# Re-copies the forked UI library (ui-library-hex; the original ui-library stays untouched) into src/ui. The library is the source of truth:
# fix elements there first, then run this. Never edit src/ui by hand.
set -euo pipefail
LIB="${UI_LIBRARY_PATH:-$HOME/Desktop/projects/edufrontfront/ui-library-hex}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/ui"
[ -d "$LIB/ui" ] || { echo "Library not found at $LIB" >&2; exit 1; }
rm -rf "$DEST"
mkdir -p "$DEST"
for d in ui blocks layout hooks lib skins tokens test fonts vendor; do cp -r "$LIB/$d" "$DEST/$d"; done
cp "$LIB/tailwind.css" "$DEST/tailwind.css"
echo "synced $LIB -> $DEST ($(date -u +%F))"
