# 🎤 Pitch — Drishti (Competitive Yoga Technology)

One self-contained investor / client / federation pitch for the product we're building.
Best-practice deck structure, a spoken script, and 8 product-accurate images.

## What's here
| File | What it is |
|------|------------|
| **`index.html`** | The live presentation (the "PPT"). Open in any browser. |
| `PITCH-DECK.md` | Slide-by-slide content — rebuild in PowerPoint/Keynote/Slides from this. |
| `PITCH-SCRIPT.md` | The spoken script (~6 min) with delivery cues, two openers, and a Q&A bank. |
| `images/` | 8 generated product images + `manifest.json` (the exact prompts used). |
| `scripts/generate-images.sh` | Reproducible image generation (X.AI `grok-imagine-image-quality`). |

## Present it
1. Open `index.html` in a browser.
2. Press **F** for fullscreen.
3. Navigate with **← / →** (or space). `Home`/`End` jump to first/last.
4. Speaker notes live in `PITCH-SCRIPT.md` — keep it on a phone/second screen.

## Regenerate / tweak the images
```bash
set -a && . ./.env && set +a            # loads XAI_API_KEY
bash competitive-yoga/pitch/scripts/generate-images.sh
```
Edit the prompts inside the script to change a shot. Prompts are deliberately detailed and
share one visual language (warm "sunrise" palette) so the deck feels like one product.

## Convert to a real .pptx (optional)
The deck is intentionally plain so it converts cleanly:
- Paste `PITCH-DECK.md` into Google Slides via an import add-on, **or**
- Use a Markdown→deck tool (Marp / Slidev) on `PITCH-DECK.md`, **or**
- Drop the `images/` into a template manually using `PITCH-DECK.md` as the script.

## The 3 "wow" beats (don't bury them)
1. **Slide 6** — the referee console: *"AI suggests, judge confirms."*
2. **Slide 8** — *"Show me why"*: tap a score, see the exact reason.
3. **Slide 10** — the moat: the AsanaAI data + talent + audience flywheel.

---
*Scope note: this is the **pitch**. Building the product is a separate workstream (W4) owned by a
different product-build agent + the full SDLC team — see `../PROJECT-STATUS.md`.*
