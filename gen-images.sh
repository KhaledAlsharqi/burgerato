#!/usr/bin/env bash
# Burgerato — parallel image generation (kit: memory/06)
cd "$(dirname "$0")" || exit 1
mkdir -p gen assets/seq-src
MASTER="20ac79f3-af1a-492e-a119-5fce5c35391e"
HASHI="0b3a2a35-8b10-4796-8982-257efdb7ee97"

SHARED="Deep espresso near-black #0B0805 background fading to the same tone at every edge and corner, single dramatic warm raking light from the upper left, faint steam, editorial luxury food photography, hyper-detailed, no extra text, no watermark, no logo, no people."
SHAREDH="Deep espresso near-black #0B0805 background fading to the same tone at every edge and corner, single dramatic warm raking light from the upper left, editorial luxury food photography, hyper-detailed, no extra text, no watermark, no logo."
IDENT="Keep the EXACT identity of the reference burger: glossy toasted brioche bun, two smashed beef patties with crispy lacy edges, molten cheddar cascading, creamy spice-flecked special sauce. No redesign."

# gen <name> <outfile> <model> [extra args...]
gen() {
  local name="$1" out="$2" model="$3"; shift 3
  for attempt in 1 2 3 4; do
    higgsfield generate create "$model" "$@" --wait --wait-timeout 25m --json > "gen/out-$name.json" 2>"gen/err-$name.log"
    local url
    url=$(grep -oE '"result_url":[[:space:]]*"[^"]+"' "gen/out-$name.json" | grep -oE 'https://[^"]+' | head -1)
    if [ -n "$url" ]; then
      for d in 1 2 3; do
        curl -fsSL "$url" -o "$out" && [ -s "$out" ] && break
        sleep 3
      done
      [ -s "$out" ] && { echo "OK  $name -> $out"; return 0; }
    fi
    echo "RETRY($attempt) $name"; sleep 5
  done
  echo "FAIL $name"; return 1
}

gen k1 assets/seq-src/k1.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "A single loosely-packed ball of fresh raw ground beef resting on a hot dark steel griddle, oil shimmer and faint smoke, the beef matching the reference burger's meat. $SHARED" &
gen k2 assets/seq-src/k2.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The same beef now smashed flat on the same hot dark steel griddle by a heavy steel spatula still pressing at the frame edge, crispy caramelized lacy edges forming, sizzling, a small burst of steam. $SHARED" &
gen k3 assets/seq-src/k3.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The same seared smashed beef patty alone on the same dark griddle with a thick slice of cheddar draping mid-melt over it, molten cheddar drips matching the reference burger's cheese tone. $SHARED" &
gen k4 assets/seq-src/k4.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The same two seared smashed patties now stacked with molten cheddar between them and creamy spice-flecked special sauce flowing on top, sitting on the toasted bottom brioche bun on dark slate; the glossy brioche crown hovers slightly above, about to land. $IDENT $SHARED" &
gen k5 assets/seq-src/k5.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "The completed double smash burger, EXACTLY the reference burger, centered in a hero pose with gentle steam. $IDENT $SHARED" &
gen ritual assets/ritual.jpg nano_banana_2 --image "$MASTER" --aspect_ratio 16:9 --resolution 2k \
  --prompt "Two hands in black nitrile gloves presenting the exact reference burger on a dark rustic wooden board, rising steam, blurred dark restaurant background with warm amber bokeh lights. Only the gloved hands and forearms are visible, no faces, no other people. $IDENT $SHAREDH" &
gen ed1 assets/edition-1.jpg nano_banana_2 --image "$HASHI" --aspect_ratio 4:3 --resolution 2k \
  --prompt "The exact same camel-meat burger from the reference image - black sesame charcoal bun, thick seared camel patty, melted cheese, caramelized onions, smoky sauce, arugula - recomposed as a centered hero shot on a clean espresso ground with nothing else in frame. $SHARED" &
gen ed2 assets/edition-2.jpg nano_banana_2 --image "$MASTER" --image "$HASHI" --aspect_ratio 4:3 --resolution 2k \
  --prompt "Both reference burgers side by side as a duo combo hero shot - the golden-bun double smash burger on the left and the black-bun camel burger on the right, a small pile of golden crispy fries between them on dark wood. $IDENT $SHARED" &
gen cut assets/product-cut.png image_background_remover --image "$MASTER" &

wait
echo "=== DONE ==="
ls -la assets/seq-src assets/*.jpg assets/*.png 2>/dev/null
