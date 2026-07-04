#!/usr/bin/env bash
# Probe Higgsfield every 30 min; when unlocked, run the full image pipeline.
cd "$(dirname "$0")" || exit 1
for i in $(seq 1 48); do  # up to 24h
  higgsfield generate create nano_banana_2 \
    --prompt "a single sesame brioche burger bun on a deep espresso near-black background, warm raking light, editorial food photography" \
    --aspect_ratio 1:1 --resolution 1k --wait --wait-timeout 10m --json > gen/probe.json 2>gen/probe-err.log
  url=$(grep -oE '"result_url":[[:space:]]*"[^"]+"' gen/probe.json | grep -oE 'https://[^"]+' | head -1)
  if [ -n "$url" ]; then
    echo "[$(date '+%H:%M')] UNLOCKED — running gen-images.sh"
    bash gen-images.sh
    echo "=== IMAGES PIPELINE FINISHED — verify visually, then run gen-videos.sh ==="
    exit 0
  fi
  echo "[$(date '+%H:%M')] still locked (attempt $i/48)"
  sleep 1800
done
echo "gave up after 24h"
exit 1
