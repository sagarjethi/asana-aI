# Technical Approach & Architecture

## Design principles

Three commitments shape every decision below:

1. **Measurement integrity over spectacle.** The officiating path must be defensible in a protest hearing. Broadcast graphics serve the audience; they never feed the official score.
2. **Two tiers, two jobs.** A fast tier paints the screen; a heavy tier renders the verdict. We do not compromise one for the other.
3. **Build the brain, buy the show.** We build the inference, scoring, data and dashboard IP. We buy mature, broadcast-grade graphics and camera-tracking hardware.

## End-to-end real-time pipeline

```
                          COMPETITION ZONE (on-prem / edge)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                                                                                │
 │  ┌──────────┐   ┌──────────────┐   ┌──────────────────────────────────────┐   │
 │  │ 4-8 machine│  │  INGEST &    │   │        GPU INFERENCE TIER            │   │
 │  │ vision cams│─▶│  TIME-SYNC   │──▶│  ┌────────────────┐  ┌────────────┐  │   │
 │  │ (genlock/  │  │  (PTP 1588,  │   │  │ LIVE tier      │  │ ADJUDICATED│  │   │
 │  │  PTZ enc.) │  │  frame align)│   │  │ RTMPose 2D     │  │ tier       │  │   │
 │  └──────────┘   └──────────────┘   │  │ per-cam ~fast  │  │ ViTPose +  │  │   │
 │       │                            │  └───────┬────────┘  │ volumetric │  │   │
 │       │ lens/encoder metadata      │          │           └─────┬──────┘  │   │
 │       ▼                            │          ▼                 ▼         │   │
 │  ┌──────────────┐                  │   ┌──────────────────────────────┐  │   │
 │  │ CAMERA TRACK │                  │   │   TRIANGULATION (multi-view  │  │   │
 │  │ (Mo-Sys/Stype│                  │   │   3D lift, bundle-calibrated)│  │   │
 │  └──────┬───────┘                  │   └───────────────┬──────────────┘  │   │
 │         │                          └───────────────────┼─────────────────┘   │
 │         │                                              ▼                       │
 │         │                          ┌──────────────────────────────────────┐   │
 │         │                          │   SCORING ENGINE (rules-as-DSL,      │   │
 │         │                          │   versioned, deterministic, signed)  │   │
 │         │                          └───┬──────────────┬───────────────┬───┘   │
 │         │                              │              │               │       │
 │         ▼                              ▼              ▼               ▼       │
 │  ┌─────────────┐            ┌──────────────┐  ┌──────────────┐ ┌───────────┐ │
 │  │ GRAPHICS    │            │   REFEREE    │  │  REPLAY /    │ │  CANDIDATE│ │
 │  │ COMPOSITOR  │◀───────────│   DASHBOARD  │  │  SIMULCAM    │ │  DEDUCTION│ │
 │  │ (Vizrt /    │            │ (obj + human │  │  STORE (NVMe,│ │  + CONF.  │ │
 │  │  Unreal+ZD) │            │  judge fuse) │  │  bit-repro.) │ └───────────┘ │
 │  └──────┬──────┘            └──────────────┘  └──────────────┘               │
 └─────────┼──────────────────────────────────────────────────────────────────┘
           │ AR-keyed program feed                    │ async, signed
           ▼                                          ▼
 ┌──────────────────┐                    ┌─────────────────────────────────────┐
 │ BROADCAST CHAIN  │                    │  CLOUD DATA PLATFORM                 │
 │ (delay line →    │                    │  athlete history, model training,    │
 │  air) + SECOND-  │                    │  AsanaAI flywheel, protest archive   │
 │  SCREEN APP      │                    │  (non-real-time)                     │
 └──────────────────┘                    └─────────────────────────────────────┘
```

The officiating-critical span — capture, sync, inference, triangulation, scoring, replay — lives **on-prem at the venue edge**. The cloud platform handles athlete history, model training and the consumer flywheel, none of which sit on the live officiating loop.

## Why multi-camera 3D is non-negotiable for judging

A single camera produces a 2D projection. Limbs pointing toward or away from the lens are *foreshortened*: the same elbow angle reads differently depending on body orientation, and monocular angle error on foreshortened limbs runs to 10-25°. That is fine for a coarse on-air indicator; it is indefensible for a deduction.

Multiple calibrated cameras let us **triangulate** true 3D joint positions, removing the depth ambiguity. Markerless multi-view 3D resolves large sagittal angles to roughly 3-8° RMSE and rotational angles to 5-15°. Crucially, even gold-standard marker-based systems (Vicon) disagree by 2-5° among themselves — that is the noise floor of the physical measurement. We design the scoring rules to respect it: **no deduction is ever triggered by a difference smaller than the measurement uncertainty.**

The "reference form" is therefore not a single golden skeleton. It is a **distribution of joint-angle targets with judge-ratified tolerance bands**. Deviation is computed as a weighted joint-angle distance, Procrustes-aligned and anthropometrically normalised, with Dynamic Time Warping for scoring transitions rather than static holds.

## The two-tier inference approach (the Hawk-Eye analogy)

This is the heart of the system, and the cleanest way to explain it is by analogy to tennis's Hawk-Eye / cricket's DRS: a fast on-screen graphic for the audience, and a separate, heavier, authoritative system for the official decision.

| | **LIVE tier** | **ADJUDICATED tier** |
|---|---|---|
| Model | RTMPose (real-time 2D per camera) | ViTPose + volumetric 3D fusion |
| Latency | ~60-90ms (on-air AR) | Seconds (replayable, off the live loop) |
| Purpose | AR overlays, instant indicators | Official, signed deduction |
| Audience | Viewers, broadcast | Referee, protest committee |
| Authority | None — cosmetic | Feeds the scoring engine |

The LIVE tier is optimised for the broadcast clock: it must land an overlay within the broadcast delay line so the graphic tracks the athlete on air. The ADJUDICATED tier is optimised for **accuracy and reproducibility**, not speed — exactly like DRS, which the audience waits a few seconds for because the verdict matters more than immediacy. The official deduction comes from the heavy tier, is replayable frame-by-frame, and is cryptographically signed.

## Deterministic, versioned scoring engine

Trust requires reproducibility. The scoring engine is built so that the same input frames *always* produce the same output score, for the lifetime of the season.

- **Rules-as-DSL.** Criteria, joint weightings and tolerance bands are expressed in a domain-specific rules language, ratified by the judging panel and **versioned**. A round is always scored against a specific, recorded ruleset version.
- **Hybrid machine + judge.** The engine produces objective values and *candidate* deductions with confidence. The dashboard fuses these with human-judge marks (the format's ~4 criteria × up to 10pts = 40/round structure).
- **Judge override authority.** Any machine output can be overridden by a qualified judge; the override, its author and its rationale are logged.
- **Bit-reproducible replay for protests.** Given the stored frames and the ruleset version, the engine re-derives an identical score. A protest hearing replays the exact computation, not an approximation.

## Multi-person handling — Solo, Pair, Group

- **Solo (1 athlete).** Clean single-subject triangulation; full objective scoring.
- **Pair (2 athletes).** Multi-person 2D detection with cross-view identity association before triangulation; Simulcam ghost overlay compares the two. Musical sub-category adds beat-sync alignment scoring.
- **Group of 5.** Multi-person tracking at the LIVE tier for graphics and per-athlete indicators. **Honest note:** contact and inter-athlete occlusion poses defeat reliable markerless 3D at launch, so **Group contact poses remain human-judged** initially. We will expand machine coverage only as the dataset and validation studies justify it — not before.

## Build vs buy

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Broadcast graphics / keying | **BUY** — Vizrt, or Unreal Engine + Zero Density | Mature, broadcast-certified render and chroma/key pipelines; reinventing is waste |
| Camera tracking (PTZ/lens) | **BUY** — Mo-Sys / Stype | Field-proven lens-encoder + tracking hardware for AR registration |
| Pose inference (live + adjudicated) | **BUILD** | Our IP; trained on the AsanaAI flywheel dataset |
| Triangulation + scoring engine | **BUILD** | The defensible measurement core; must be ours to audit |
| Referee dashboard | **BUILD** | Bespoke fusion of objective + human scores |
| Athlete data platform | **BUILD (≈70% reuse from AsanaAI)** | Existing surfaces and Postgres schema accelerate delivery |

We buy the parts a broadcast already trusts. We build the brain — the inference, the triangulation, the scoring engine, the dashboard and the data platform — because that is the IP, the moat and the thing a federation must be able to audit.
