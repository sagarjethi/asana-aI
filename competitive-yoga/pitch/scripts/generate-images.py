#!/usr/bin/env python3
"""
Generate pitch images via the X.AI (grok-imagine-image-quality) API.

Reads XAI_API_KEY from the environment (load your .env first):
    set -a && . ./.env && set +a && python3 competitive-yoga/pitch/scripts/generate-images.py

Images and a prompt manifest are written to competitive-yoga/pitch/images/.
Prompts are deliberately detailed + product-accurate and share one visual
language (warm "sunrise" palette to match the AsanaAI brand) so the deck
feels like one coherent product.
"""
import json, os, sys, time, urllib.request, pathlib

API = "https://api.x.ai/v1/images/generations"
MODEL = "grok-imagine-image-quality"
KEY = os.environ.get("XAI_API_KEY")
OUT = pathlib.Path(__file__).resolve().parents[1] / "images"
OUT.mkdir(parents=True, exist_ok=True)

if not KEY:
    sys.exit("XAI_API_KEY not set. Run: set -a && . ./.env && set +a && python3 ...")

# (filename, aspect_ratio, slide, prompt)
SHOTS = [
    ("01-hero.jpg", "16:9", "Title / hook",
     "Cinematic wide hero shot for a sports-technology pitch: a single elite "
     "competitive yoga athlete holding a powerful, graceful one-legged balance "
     "pose at the centre of a circular illuminated competition stage; faint, "
     "tasteful futuristic augmented-reality joint-tracking lines and a small "
     "glowing alignment-score badge overlaid on her body; a large arena with a "
     "softly blurred cheering audience and stage spotlights behind; warm golden "
     "sunrise palette of amber, orange and soft peach; premium broadcast "
     "production quality, dramatic rim lighting, photorealistic, 16:9"),

    ("02-problem.jpg", "16:9", "The problem",
     "Editorial photograph illustrating the problem of subjective sports "
     "judging: a row of focused competition judges seated at a scoring table "
     "holding paper scorecards, watching an out-of-focus yoga performer; "
     "expressions of concentration and faint uncertainty, conveying how hard it "
     "is to score subtle body alignment by eye; muted neutral tones with warm "
     "accents, natural documentary lighting, photorealistic, 16:9"),

    ("03-capture-3d.jpg", "16:9", "How it works — multi-camera 3D",
     "Clean sports-tech product visualisation of a markerless multi-camera 3D "
     "motion-capture rig: a circular competition yoga mat encircled by several "
     "professional machine-vision cameras on slim tripods; above the mat a "
     "translucent glowing 3D skeletal wireframe of the athlete's pose is "
     "reconstructed in mid-air with bright joint markers; modern technical "
     "broadcast venue, dark uncluttered background with warm amber accent "
     "lighting, high-end render, photorealistic, 16:9"),

    ("04-referee-console.jpg", "16:9", "Trust — referee dashboard",
     "High-fidelity user-interface mockup of a referee scoring dashboard for "
     "competitive yoga shown on a large monitor: on the left, video of an "
     "athlete in a pose with precise measured joint-angle overlays; on the "
     "right, a panel listing candidate point deductions each with a confidence "
     "percentage and clear Approve and Override buttons; a header reading "
     "'AI SUGGESTS — JUDGE CONFIRMS'; dark professional officiating interface "
     "with a warm orange accent colour, crisp data-dense dashboard design, "
     "clean screenshot style, 16:9"),

    ("05-broadcast-ar.jpg", "16:9", "Broadcast experience",
     "A live television broadcast frame of a competitive yoga performance "
     "enhanced with real-time augmented-reality graphics: clean alignment-angle "
     "indicators tracing the athlete's limbs, a small centre-of-gravity balance "
     "marker, and a polished lower-third showing a live score breakdown and a "
     "leaderboard; broadcast motion-graphics quality, warm sunrise colour "
     "scheme, photorealistic athlete and lighting, 16:9"),

    ("06-show-me-why.jpg", "16:9", "Explainable 'show me why'",
     "An explainable-AI broadcast replay graphic for competitive yoga: a "
     "slow-motion freeze-frame of an athlete's pose with one knee joint "
     "highlighted by a glowing measurement arc; a clean annotation callout "
     "reads 'STANDING KNEE FLEXED 8 deg — ALIGNMENT DEDUCTION -0.3' with a small "
     "confidence indicator beside it; premium sports-analysis replay aesthetic "
     "with subtle scan lines, warm accent colours on a dark frame, "
     "photorealistic, 16:9"),

    ("07-second-screen.jpg", "9:16", "Fan engagement — second screen",
     "Photorealistic mockup of a smartphone held in a hand showing a "
     "second-screen fan app for a competitive yoga broadcast: a live "
     "win-probability bar at the top, a 'JUDGE ALONG' mini-game where the fan "
     "taps to score the athlete, prediction buttons, and a live leaderboard "
     "below; warm sunrise UI theme with soft rounded cards and clean modern "
     "typography; a blurred living-room television in the background, 9:16"),

    ("08-ecosystem.jpg", "9:16", "The moat — consumer flywheel",
     "Warm aspirational lifestyle photograph of a person practising yoga at "
     "home in a sunlit room in the morning, a smartphone on a small stand in "
     "front of them displaying a real-time pose-tracking app with a circular "
     "alignment-score ring overlaid on their live camera image; cosy golden "
     "morning light through a window, healthy modern wellness mood, "
     "photorealistic, 9:16"),
]

manifest = []
for i, (fn, ar, slide, prompt) in enumerate(SHOTS, 1):
    body = json.dumps({"prompt": prompt, "model": MODEL, "n": 1,
                       "aspect_ratio": ar, "resolution": "1k"}).encode()
    req = urllib.request.Request(API, data=body, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {KEY}"})
    print(f"[{i}/{len(SHOTS)}] {fn}  ({ar})  — {slide}")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
        url = data["data"][0]["url"]
        img = urllib.request.urlopen(url, timeout=120).read()
        (OUT / fn).write_bytes(img)
        print(f"      saved {len(img)//1024} KB")
        manifest.append({"file": fn, "aspect_ratio": ar, "slide": slide,
                         "prompt": prompt})
    except Exception as e:
        print(f"      FAILED: {e}")
    time.sleep(1)

(OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
print(f"\nDone. {len(manifest)}/{len(SHOTS)} images in {OUT}")
