#!/usr/bin/env bash
# Generate pitch images via the X.AI grok-imagine-image-quality API.
# Network is done with curl (Python is used only for local JSON encode/decode).
#
# Usage:
#   set -a && . ./.env && set +a && bash competitive-yoga/pitch/scripts/generate-images.sh
#
# Prompts are detailed + product-accurate and share one visual language
# (warm "sunrise" palette to match the AsanaAI brand) so the deck feels
# like one coherent product. Output -> competitive-yoga/pitch/images/
set -uo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
IMG="$DIR/images"; mkdir -p "$IMG"
: "${XAI_API_KEY:?set XAI_API_KEY first: run  set -a && . ./.env && set +a}"
MODEL="grok-imagine-image-quality"
MANIFEST="$IMG/manifest.json"; echo "[" > "$MANIFEST"; FIRST=1

gen () {
  local fn="$1" ar="$2" slide="$3" prompt="$4"
  echo "generating $fn ($ar) — $slide"
  local body resp url
  body=$(python3 -c 'import json,sys;print(json.dumps({"prompt":sys.argv[1],"model":sys.argv[2],"n":1,"aspect_ratio":sys.argv[3],"resolution":"1k"}))' "$prompt" "$MODEL" "$ar")
  resp=$(curl -s https://api.x.ai/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XAI_API_KEY" -d "$body")
  url=$(printf '%s' "$resp" | python3 -c 'import sys,json
try: print(json.load(sys.stdin)["data"][0]["url"])
except Exception: pass' 2>/dev/null)
  if [ -z "$url" ]; then echo "  FAILED: $resp"; return 1; fi
  curl -s -o "$IMG/$fn" "$url"
  echo "  saved $(du -h "$IMG/$fn" | cut -f1)"
  [ $FIRST -eq 0 ] && echo "," >> "$MANIFEST"; FIRST=0
  python3 -c 'import json,sys;print(json.dumps({"file":sys.argv[1],"aspect_ratio":sys.argv[2],"slide":sys.argv[3],"prompt":sys.argv[4]},indent=2))' "$fn" "$ar" "$slide" "$prompt" >> "$MANIFEST"
}

gen "01-hero.jpg" "16:9" "Title / hook" \
"Cinematic wide hero shot for a sports-technology pitch: a single elite competitive yoga athlete holding a powerful, graceful one-legged balance pose at the centre of a circular illuminated competition stage; faint, tasteful futuristic augmented-reality joint-tracking lines and a small glowing alignment-score badge overlaid on her body; a large arena with a softly blurred cheering audience and stage spotlights behind; warm golden sunrise palette of amber, orange and soft peach; premium broadcast production quality, dramatic rim lighting, photorealistic, 16:9"

gen "02-problem.jpg" "16:9" "The problem" \
"Editorial photograph illustrating the problem of subjective sports judging: a row of focused competition judges seated at a scoring table holding paper scorecards, watching an out-of-focus yoga performer; expressions of concentration and faint uncertainty, conveying how hard it is to score subtle body alignment by eye; muted neutral tones with warm accents, natural documentary lighting, photorealistic, 16:9"

gen "03-capture-3d.jpg" "16:9" "How it works - multi-camera 3D" \
"Clean sports-tech product visualisation of a markerless multi-camera 3D motion-capture rig: a circular competition yoga mat encircled by several professional machine-vision cameras on slim tripods; above the mat a translucent glowing 3D skeletal wireframe of the athlete pose is reconstructed in mid-air with bright joint markers; modern technical broadcast venue, dark uncluttered background with warm amber accent lighting, high-end render, photorealistic, 16:9"

gen "04-referee-console.jpg" "16:9" "Trust - referee dashboard" \
"High-fidelity user-interface mockup of a referee scoring dashboard for competitive yoga shown on a large monitor: on the left, video of an athlete in a pose with precise measured joint-angle overlays; on the right, a panel listing candidate point deductions each with a confidence percentage and clear Approve and Override buttons; a header reading AI SUGGESTS JUDGE CONFIRMS; dark professional officiating interface with a warm orange accent colour, crisp data-dense dashboard design, clean screenshot style, 16:9"

gen "05-broadcast-ar.jpg" "16:9" "Broadcast experience" \
"A live television broadcast frame of a competitive yoga performance enhanced with real-time augmented-reality graphics: clean alignment-angle indicators tracing the athlete limbs, a small centre-of-gravity balance marker, and a polished lower-third showing a live score breakdown and a leaderboard; broadcast motion-graphics quality, warm sunrise colour scheme, photorealistic athlete and lighting, 16:9"

gen "06-show-me-why.jpg" "16:9" "Explainable show-me-why" \
"An explainable-AI broadcast replay graphic for competitive yoga: a slow-motion freeze-frame of an athlete pose with one knee joint highlighted by a glowing measurement arc; a clean annotation callout reads STANDING KNEE FLEXED 8 deg ALIGNMENT DEDUCTION minus 0.3 with a small confidence indicator beside it; premium sports-analysis replay aesthetic with subtle scan lines, warm accent colours on a dark frame, photorealistic, 16:9"

gen "07-second-screen.jpg" "9:16" "Fan engagement - second screen" \
"Photorealistic mockup of a smartphone held in a hand showing a second-screen fan app for a competitive yoga broadcast: a live win-probability bar at the top, a JUDGE ALONG mini-game where the fan taps to score the athlete, prediction buttons, and a live leaderboard below; warm sunrise UI theme with soft rounded cards and clean modern typography; a blurred living-room television in the background, 9:16"

gen "08-ecosystem.jpg" "9:16" "The moat - consumer flywheel" \
"Warm aspirational lifestyle photograph of a person practising yoga at home in a sunlit room in the morning, a smartphone on a small stand in front of them displaying a real-time pose-tracking app with a circular alignment-score ring overlaid on their live camera image; cosy golden morning light through a window, healthy modern wellness mood, photorealistic, 9:16"

gen "09-world-scale.jpg" "16:9" "The world - scale" \
"A vast breathtaking elevated photograph of hundreds of people practising yoga together in unison on a huge outdoor plaza at sunrise, neat rows stretching toward the horizon, warm golden morning light and long soft shadows, a sense of a massive global movement, photorealistic, aspirational, 16:9"

gen "10-why-now.jpg" "16:9" "Why now - the moment" \
"A dramatic sports-technology moment: a giant modern stadium screen displaying glowing augmented-reality performance graphics over a yoga athlete, a packed silhouetted crowd below with phone lights raised, the feeling of a niche activity becoming a major televised sport, warm cinematic amber and orange lighting, photorealistic, 16:9"

gen "11-solution.jpg" "16:9" "The solution - pose to score" \
"An elegant minimal product-hero concept: on the left a yoga athlete in a clean studio holding a pose, transitioning on the right into a glowing translucent 3D wireframe skeleton with a single clear circular alignment-score badge, smooth warm sunrise gradient background, premium tech-product aesthetic conveying turning a pose into a trustworthy number, high-end render, 16:9"

gen "12-market.jpg" "16:9" "The market - opportunity" \
"A sophisticated optimistic investor-deck illustration: a stylised glowing globe with bright arcs connecting cities and a subtle upward-rising line-graph motif, faint elegant yoga-pose silhouettes integrated, warm amber and orange accents on a clean deep-charcoal background, premium, uncluttered, 16:9"

gen "13-vision-arena.jpg" "16:9" "The vision - arena" \
"An epic wide cinematic shot of a packed futuristic arena hosting a competitive yoga world championship, athletes on a central illuminated circular stage, giant screens showing live augmented-reality scores and leaderboards, a roaring diverse crowd, the grandeur of a major global sporting event, warm dramatic stage lighting, photorealistic, 16:9"

gen "14-traction-app.jpg" "9:16" "Traction - the app" \
"A photorealistic close-up of a smartphone held in two hands showing a consumer yoga app: a live camera view of the user in a pose with a circular alignment-score ring and the pose name, clean warm sunrise interface, a polished shipped consumer product, bright modern mobile UI, softly blurred sunlit home background, 9:16"

echo "]" >> "$MANIFEST"
echo "Done. Images in $IMG"; ls -1 "$IMG"
