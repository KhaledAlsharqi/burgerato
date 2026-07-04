#!/usr/bin/env bash
# Sequential generation of the REMAINING images only — skips existing files,
# waits out the grace daily limit (30-min sleeps), never wastes quota on retries of the same rejection.
cd "$(dirname "$0")" || exit 1
mkdir -p gen assets/seq-src
MASTER="20ac79f3-af1a-492e-a119-5fce5c35391e"
HASHI="0b3a2a35-8b10-4796-8982-257efdb7ee97"

SHARED="Deep espresso near-black #0B0805 background fading to the same tone at every edge and corner, single dramatic warm raking light from the upper left, faint steam, editorial luxury food photography, hyper-detailed, no extra text, no watermark, no logo, no people."
IDENT="Keep the EXACT identity of the reference burger: glossy toasted brioche bun, two smashed beef patties with crispy lacy edges, molten cheddar cascading, creamy spice-flecked special sauce. No redesign."

# try_gen <name> <outfile> <model> [args...] -> 0 ok / 1 grace-locked / 2 other-fail
try_gen() {
  local name="$1" out="$2" model="$3"; shift 3
  higgsfield generate create "$model" "$@" --wait --wait-timeout 25m --json > "gen/out-$name.json" 2>"gen/err-$name.log"
  if grep -q "grace_daily_limit_reached" "gen/err-$name.log" 2>/dev/null; then return 1; fi
  local url
  url=$(grep -oE '"result_url":[[:space:]]*"[^"]+"' "gen/out-$name.json" | grep -oE 'https://[^"]+' | head -1)
  if [ -n "$url" ]; then
    for d in 1 2 3; do curl -fsSL "$url" -o "$out" && [ -s "$out" ] && break; sleep 3; done
    [ -s "$out" ] && { echo "[$(date '+%H:%M')] OK $name"; return 0; }
  fi
  echo "[$(date '+%H:%M')] transient fail $name"; return 2
}

# run <name> <outfile> <model> [args...] — loops until the file exists
run() {
  local name="$1" out="$2"; shift 2
  [ -s "$out" ] && { echo "SKIP $name (exists)"; return 0; }
  local waits=0 fails=0
  while true; do
    try_gen "$name" "$out" "$@"
    case $? in
      0) return 0 ;;
      1) waits=$((waits+1)); [ $waits -gt 96 ] && { echo "GIVE UP (48h) $name"; return 1; }
         echo "[$(date '+%H:%M')] grace-locked, sleeping 30m ($name)"; sleep 1800 ;;
      2) fails=$((fails+1)); [ $fails -gt 4 ] && { echo "FAIL $name after 4 transient errors"; return 1; }
         sleep 10 ;;
    esac
  done
}

run k5 assets/seq-src/k5.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The completed double smash burger, EXACTLY the reference burger, centered in a hero pose with gentle steam. $IDENT $SHARED"
run k1 assets/seq-src/k1.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "A single loosely-packed ball of fresh raw ground beef resting on a hot dark steel griddle, oil shimmer and faint smoke, the beef matching the reference burger's meat. $SHARED"
run k4 assets/seq-src/k4.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The same two seared smashed patties now stacked with molten cheddar between them and creamy spice-flecked special sauce flowing on top, sitting on the toasted bottom brioche bun on dark slate; the glossy brioche crown hovers slightly above, about to land. $IDENT $SHARED"
run ed2 gen/edition-2-gen.jpg nano_banana_2 --image "$MASTER" --image "$HASHI" --aspect_ratio 4:3 --resolution 2k \
  --prompt "Both reference burgers side by side as a duo combo hero shot - the golden-bun double smash burger on the left and the black-bun camel burger on the right, a small pile of golden crispy fries between them on dark wood. $IDENT $SHARED"
[ -s gen/edition-2-gen.jpg ] && cp gen/edition-2-gen.jpg assets/edition-2.jpg && echo "edition-2.jpg replaced with generated version"

echo "=== ALL REMAINING IMAGES DONE — verify k1/k4/k5 visually, then bash gen-videos.sh ==="
ls -la assets/seq-src assets/edition-2.jpg
