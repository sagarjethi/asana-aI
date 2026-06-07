# 📊 PROJECT STATUS — Competitive Yoga Technology Program

> **Project-manager's single source of truth.** What is done, what is in progress, what is
> not started. Update this file whenever a doc or workstream changes state.
>
> **Last updated:** 2026-06-07 · **Branch:** `docs/competitive-yoga-program` · **PM:** Claude (pitch agent)

---

## 1. Workstreams (the big picture)

| # | Workstream | Owner / "agent" | Status | Notes |
|---|-----------|-----------------|--------|-------|
| W1 | **Analysis & Client Proposal** (A) | analyst + architect team | ✅ **Done** | 6 proposal docs, committed `32db9f3` |
| W2 | **Build Spec & Roadmap** (D) | architect + senior-review team | ✅ **Done** | 14 spec docs, hardened to v2, committed `b33de2e` |
| W3 | **Investor / Client Pitch** | 🎤 **pitch agent (this one)** | 🟡 **In progress** | This workstream: deck + speech + 8 product images |
| W4 | **Product Build** | 🏗️ **product-build agent (SEPARATE — not started)** | ⬜ **Not started** | A *different* agent + full SDLC team. Begins only after pitch + go-ahead. See §5. |

> **Important separation (per stakeholder):** the **pitch agent** (W3) and the **product-build
> agent** (W4) are deliberately different jobs. This document and the pitch are W3. W4 is a clean,
> separate effort with its own team and lifecycle — do **not** start building the product inside
> the pitch workstream.

---

## 2. Document register — done vs not done

### `proposal/` — client pitch pack (W1) ✅ complete
| Doc | Status | Last touched |
|-----|--------|--------------|
| 00-exec-summary | ✅ Done | v1 |
| 01-tech-approach | ✅ Done | v1 |
| 02-latency-calib-deploy | ✅ Done | v1 |
| 03-demos-differentiators | ✅ Done | v1 |
| 04-budget-phasing | ✅ Done | v1 |
| 05-team-process-ai-ethics | ✅ Done | v1 |

### `spec/` — buildable spec (W2) ✅ complete (hardened v2)
| Doc | Status | Last touched |
|-----|--------|--------------|
| 00-project-analysis | ✅ Done | v2 (goals/non-goals, success criteria, open Qs) |
| 01-personas-journeys | ✅ Done | v2 (failure paths, +3 personas, a11y/i18n) |
| 02-screens-IA | ✅ Done | v2 (non-functional UX, WCAG, transport, tokens) |
| 03-architecture-data | ✅ Done | v2 (rig geometry, time-sync math, determinism, registries) |
| 04-reuse-pilot | ✅ Done | v2 (honest reuse effort, PASS/FAIL criteria, contingency) |
| 05-roadmap-workstreams | ✅ Done | v2 (critical path, data-collection WS, DoD per task) |
| 06-integrations | ✅ Done | v2 (hardware specs, GPU sizing, signal path) |
| 07-team-process-sdlc | ✅ Done | v2 (live-event freeze, env/release/on-call) |
| 08-nfr-reliability-slo | ✅ Done | v2 (new) |
| 09-security-privacy | ✅ Done | v2 (new) |
| 10-commercial-model | ✅ Done | v2 (new) |
| 11-validation-and-testing | ✅ Done | v2 (new) |
| 12-api-event-contracts | ✅ Done | v2 (new) |
| 13-risks-and-open-questions | ✅ Done | v2 (new) — **client decisions live here** |

### `pitch/` — investor / client pitch (W3) 🟡 in progress
| Asset | Status | Notes |
|-------|--------|-------|
| images/ (8 product images) | ✅ Done | Generated via X.AI grok-imagine-image-quality; reproducible script |
| scripts/generate-images.sh | ✅ Done | curl-based generator + manifest |
| PITCH-DECK.md | ✅ Done | Slide-by-slide content (best-practice investor + product structure) |
| PITCH-SCRIPT.md | ✅ Done | Spoken narration + wow-moment cues + timing |
| index.html | ✅ Done | Self-contained presentation (the "PPT"), embeds the images |
| README.md (pitch) | ✅ Done | How to present + convert to PPTX |

### Root
| Asset | Status |
|-------|--------|
| README.md (index) | ✅ Done |
| PROJECT-STATUS.md (this) | ✅ Done (living doc) |

---

## 3. What is DONE
- Full project analysis (plain-language + technical).
- Client-facing proposal mapped to the brief's required sections.
- Production-grade, senior-reviewed build spec (~39k words, 14 docs).
- Reliability/SLOs, security/privacy, commercial model, validation, API contracts, risk register.
- Investor/client pitch: deck, speech, and 8 accurate product images.

## 4. What is NOT done (open)
- **Client decisions** in `spec/13-risks-and-open-questions.md` (scoring-criteria ownership,
  thresholds, data ownership, IP terms, v1 auto-scorable asana set). These gate the build.
- **The product itself** — see §5. Not started, by design.

## 5. Next workstream — W4 Product Build (SEPARATE agent)
A distinct **product-build agent** with a full SDLC team (FE, BE, ML, broadcast, QA, data-gov,
delivery lead) executes the Solo pilot from `spec/04` + `spec/05`. Entry conditions:
1. Pitch delivered and partner/investor go-ahead obtained.
2. Open decisions in `spec/13` resolved with the client.
3. Hardware procurement + venue/lighting + athlete consent secured (pilot pre-conditions, `spec/04`).

Until those are met, W4 stays **Not started**. The pitch agent does not build the product.

---

## 6. Change log
| Date | Change | Commit |
|------|--------|--------|
| 2026-06-07 | W1 proposal pack created | `32db9f3` |
| 2026-06-07 | W2 spec hardened to v2 (+6 docs) | `b33de2e` |
| 2026-06-07 | W3 pitch: 8 images + deck + speech + HTML | _this commit_ |
