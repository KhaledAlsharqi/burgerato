#!/usr/bin/env bash
# Burgerato — boundary-matched clips (run AFTER verifying the keyframes visually)
# ثم: python extract-film.py  (يستخرج التسلسل ويحدّث FRAME_COUNT تلقائياً)
cd "$(dirname "$0")" || exit 1
mkdir -p gen

for k in k1 k2 k3 k4 k5; do
  [ -s "gen/seq-src/$k.jpg" ] || { echo "MISSING gen/seq-src/$k.jpg — run gen-images.sh first"; exit 1; }
done

VOPTS=(--aspect_ratio 16:9 --resolution 1080p --duration 5 --bitrate_mode high --generate_audio false --mode std)

gen() {
  local name="$1" out="$2"; shift 2
  for attempt in 1 2 3 4; do
    higgsfield generate create seedance_2_0 "$@" "${VOPTS[@]}" --wait --wait-timeout 25m --json > "gen/out-$name.json" 2>"gen/err-$name.log"
    local url
    url=$(grep -oE '"result_url":[[:space:]]*"[^"]+"' "gen/out-$name.json" | grep -oE 'https://[^"]+' | head -1)
    if [ -n "$url" ]; then
      for d in 1 2 3; do curl -fsSL "$url" -o "$out" && [ -s "$out" ] && break; sleep 3; done
      [ -s "$out" ] && { echo "OK  $name -> $out"; return 0; }
    fi
    echo "RETRY($attempt) $name"; sleep 8
  done
  echo "FAIL $name"; return 1
}

LOCK="Locked camera, slow motion, no cuts, no flicker, no morphing artifacts."

gen v1 assets/v1.mp4 --start-image gen/seq-src/k1.jpg --end-image gen/seq-src/k2.jpg \
  --prompt "The steel spatula slowly smashes the beef ball flat on the hot dark griddle; crispy lacy edges spread outward; sizzling steam. $LOCK" &
gen v2 assets/v2.mp4 --start-image gen/seq-src/k2.jpg --end-image gen/seq-src/k3.jpg \
  --prompt "A slice of cheddar is laid onto the seared smashed patty and slowly begins to melt and drape over it. $LOCK" &
wait
gen v3 assets/v3.mp4 --start-image gen/seq-src/k3.jpg --end-image gen/seq-src/k4.jpg \
  --prompt "The molten-cheese patty is stacked onto the second patty on the toasted bottom bun; creamy special sauce pours slowly on top; the glossy brioche crown enters hovering above. $LOCK" &
gen v4 assets/v4.mp4 --start-image gen/seq-src/k4.jpg --end-image gen/seq-src/k5.jpg \
  --prompt "The glossy brioche crown lands softly on the stack; gentle steam wisps; a slight pull-back reveals the completed double smash burger hero. $LOCK" &
wait
gen cta assets/cta.mp4 --start-image gen/seq-src/k5.jpg --end-image gen/seq-src/k5.jpg \
  --prompt "The completed double smash burger rotates very slowly in place, gentle steam wisps rise, a soft light sheen sweeps across the glossy bun. Seamless loop feel, locked framing, no cuts, no flicker."

echo "=== VIDEOS DONE ==="
ls -la assets/v*.mp4 assets/cta.mp4 2>/dev/null
