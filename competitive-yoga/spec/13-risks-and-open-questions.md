# 13 — Risks & Open Questions

> The honest "this is our first time building this" register. Multi-camera 3D broadcast officiating for televised competitive yoga (forza.ventures) is novel; first-build specs always have gaps. This document names the real risks and forces the decisions we cannot make alone. It pairs with `proposal/04-budget-phasing.md` (program ≈ $2.0M–$3.5M, phased P0→P3) and `spec/04-reuse-pilot.md` (honest scoring scope).

## Part 1 — Risk register

Likelihood / impact scale: L / M / H.

| ID | Risk | Category | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | Multi-cam 3D under-delivers measurement accuracy (mm-space skeleton not good enough to score) | CV-accuracy | M | H | Two-tier stack (RTMPose live / ViTPose adjudicated) + triangulation; prove on narrow Solo criteria in P1 before scope expands; ICC/Krippendorff agreement gate as pilot success criterion | ML lead |
| R2 | Occlusion in Group format breaks tracking & scoring | CV-accuracy | H | H | Defer Group to P3; 6–8 cams + multi-athlete occlusion handling; keep contact/inversions human-judged-with-assist, not autonomous | ML lead |
| R3 | Per-venue calibration is fragile / drifts (lighting, rig knocks) | technical/hardware | M | H | Charuco intrinsics + bundle-adjustment extrinsics; owned competition-zone lighting; ~2 hr runbook; graceful degradation + recalibration check; calibration profile reuse across season | Broadcast-integration eng |
| R4 | Judges / federation reject machine scoring | commercial/reputational | M | H | Position as **machine-assisted human judging**, never autonomous; "show me why" explainer; judge override logged with authority; run judge-agreement study before live use | Head of Product / Governance lead |
| R5 | Disputed call live on TV (machine vs judge in front of audience) | reputational | M | H | Human judge is the authority of record; deductions are explainable and replayable; bit-reproducible audit trail; clear on-air protocol for protests | Governance lead |
| R6 | Bias / fairness controversy (subgroup error gap by body type/demographic) | reputational/legal | M | H | Stratified error reporting (per-demographic, per-anthropometric) as a hard pilot gate; fairness/bias audit pack in P3; no unacceptable subgroup gap before go-live | Governance lead |
| R7 | Biometric special-category data legal exposure (GDPR) | legal | M | H | Treat pose/physiology as special-category; explicit consent; data minimisation; physiology is broadcast-only "estimated", never stored as health record; DPA with federation; only aggregated/de-identified data licensed | Data/governance lead |
| R8 | Hardware procurement lead-times (GPUs, machine-vision cams, PTP gear) | hardware/delivery | M | M | Order long-lead items at phase start; single flight-case design bounds the BOM; identify second-source GPU (L40S-class) early | Delivery lead |
| R9 | Latency under real broadcast conditions exceeds targets | technical | M | H | TensorRT on edge; on-prem officiating loop (no cloud in live path); measure end-to-end at rig as a pilot gate (alert ~40–60 ms, AR ~60–90 ms) | Architect |
| R10 | Vendor lock-in to Vizrt / Unreal+Zero Density / Mo-Sys / Stype | commercial/technical | M | M | Keep scoring state shape as our source of truth (graphics-agnostic); OBS/vMix stand-in proves portability in pilot; abstraction layer at the compositor boundary | Architect |
| R11 | Training dataset too small / biased for reliable, fair models | CV-accuracy/data | H | H | AsanaAI consumer flywheel + training-mode capture grow the dataset; stratified sampling; start with narrow auto-scorable set; expand only as data supports | ML lead |
| R12 | Key-person dependency (small team holds the irreplaceable scoring IP) | delivery | M | H | Documentation, pair work, signed/versioned reproducible pipeline so knowledge is in artefacts not heads; cross-train across ML + integration | Delivery lead |
| R13 | Scope creep (full 40-cell model / Group / physiology pulled into pilot) | delivery/commercial | H | M | Explicit IN/OUT-of-scope per phase (see reuse-pilot doc); change-control at phase boundaries; every boundary is a real off-ramp | Head of Product |
| R14 | Revenue concentration on a single federation | commercial | H | H | Diversify via SaaS (coach/team), consumer (AsanaAI), and benchmark-data lines that don't depend on one organiser; pursue multi-federation in P3 | Head of Product |

## Part 2 — Open questions & decisions needed

Each is a concrete question for the client/stakeholder, with our **recommended default** where we have one.

### Scoring rules ownership
- **Who owns the official scoring rules and their authority — federation, us, or joint?** *Default:* federation owns the rules; we own the engine that encodes them as a versioned DSL. We do not set sporting law.
- **Who ratifies the reference bands (e.g. alignment tolerance) the machine measures against?** *Default:* a federation judge panel ratifies reference bands; we implement and version them.

### Exact criteria & thresholds
- **What is the deduction threshold per criterion (e.g. deviation beyond ~5°)? Who signs it off?** *Default:* start with the ~5° band from the pilot scope, judge-ratified, tuned against labelled data.
- **What inter-rater agreement threshold (ICC / Krippendorff α) counts as "machine agrees with judges"?** *Default:* agree a numeric floor with the panel before P1 go-live; no go-live below it.

### Wearables in training
- **Are wearables / IMU / force-plate / EMG allowed in training, and ever at competition?** *Default:* optional in training/calibration only; **never** in the competition officiating path.

### Venue / lighting control
- **Do we control competition-zone lighting and rig placement at the venue?** *Default:* yes — we require owned, characterised lighting for the scoring zone; this is a precondition, not a nice-to-have.

### Data ownership (us vs federation)
- **Who owns event footage, pose data, scores, and the derived dataset?** *Default:* federation owns its event data and brand; we own the platform IP and the **aggregated, de-identified** benchmark dataset, governed by a DPA.

### IP / licensing terms
- **Do we license the platform, sell a build, or do a hybrid (discounted build for multi-season licence)?** *Default:* hybrid — aligns our incentives with the competition's growth and the data flywheel; we retain core inference/scoring IP.

### Target broadcast spec
- **What is the target deliverable spec — resolution, frame rate, OB-van vs OBS/vMix, AR overlay count, which graphics partner?** *Default:* pilot uses OBS/vMix with fixed cams and one AR overlay; confirm broadcast partner, channel reach, and graphics licence (Vizrt/Unreal+Zero Density vs Mo-Sys/Stype) in paid discovery, as it swings the budget six figures.

### Accessibility / localization
- **What accessibility and language/localization targets must the fan and referee surfaces hit?** *Default:* English-first, WCAG AA on fan/referee UIs for the pilot; localize to the host market's primary language in the season expansion.

### Auto-scorable asana set v1
- **Which asanas are in the v1 machine-scored set?** *Default:* **Solo, held, upright asanas only** (deviation, stability, hold-duration). Contact, inversions, and artistry stay human-judged-with-assist; physiology (rPPG HR, breathing, muscle heatmap) is **broadcast-only, labelled "estimated", never scoring**. Expand the auto-scorable set only as dataset and agreement data justify it.
