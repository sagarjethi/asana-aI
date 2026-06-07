# 05 — Implementation Roadmap & Workstreams

> Phased delivery plan + three engineering workstreams (FE / BE / AI-ML) as task checklists.
> `★` = pilot-critical (must ship in P1).

## 1. Phased roadmap

| Phase | Name | Scope | Key milestones | Depends on | Exit criteria |
|---|---|---|---|---|---|
| **P0** | Training mode & data foundation | Extend AsanaAI into training/calibration; stand up data platform; begin labelled dataset | M0.1 asana segmenter from classifier; M0.2 deviation-feedback training UI; M0.3 Drizzle schema + object store + OLAP mirror; M0.4 dataset collection + labelling pipeline; M0.5 judge-agreement eval harness | AsanaAI baseline | Diverse labelled dataset growing; eval harness produces ICC/α; schema migrated; frames flowing to object store |
| **P1** | Solo pilot | 4 cams, 1 GPU (2× L40S), PTP, NVMe replay (one flight case); two-tier on alignment + stability; 1 AR overlay, 1 Simulcam, explainer, referee console, second-screen leaderboard | M1.1 calibration toolchain ★; M1.2 RTMPose live tier ★; M1.3 triangulation + 3D + temporal filter ★; M1.4 scoring engine + 2 DSL rules + signed ledger ★; M1.5 ViTPose adjudicated tier ★; M1.6 referee console (override+replay) ★; M1.7 graphics overlay + Simulcam + explainer ★; M1.8 second-screen leaderboard ★ | P0 data + schema | All P1 success criteria (file 04 §5) met: latency, judge-agreement, auditable replay, degradation, on-prem independence, ~2 hr setup |
| **P2** | Multi-format (Pair + Musical) | 6–8 cams; full 4×10=40 criteria; physiology broadcast estimates; audio instability events; Vizrt/Unreal+Zero Density + Mo-Sys/Stype; OB-van transport | M2.1 6–8 cam array + multi-athlete triangulation; M2.2 Pair occlusion handling; M2.3 musical/audio criteria; M2.4 full criteria DSL set; M2.5 rPPG/breathing/heatmap broadcast est.; M2.6 pro graphics + camera-tracking integration; M2.7 SRT/NDI→OB van | P1 proven | Pair + Musical scored to spec at a real broadcast; pro graphics live; physiology estimates on air |
| **P3** | Group | Hardest, last: many athletes, heavy occlusion, synchrony scoring | M3.1 N-athlete tracking + ID under heavy occlusion; M3.2 synchrony/formation criteria; M3.3 scale-out GPU + transport; M3.4 full fan-engagement product | P2 proven | Group format scored reliably at full event scale |

**Critical-path note:** P0 dataset + eval harness gate P1 judge-agreement validation; P1 two-tier loop gates everything. Group (P3) is deliberately last because occlusion + synchrony are the hardest problems.

## 2. Workstream A — FRONT-END

- [ ] ★ **Referee console** — live score per criterion, confidence + degradation state badge, judge **override** action (writes authoritative event), reason capture.
- [ ] ★ **Replay viewer** — scrub adjudicated evidence frames, Simulcam ghost overlay, deduction timeline; bit-reproducible replay surfaced to the judge.
- [ ] ★ **WebSocket live state client** — single source-of-truth score-display state (reuse AsanaAI score-display pattern) feeding console + graphics + second-screen.
- [ ] ★ **Broadcast graphics control surface** — operator control of the ONE AR overlay + Simulcam + "show me why" explainer trigger (pilot: drives OBS/vMix; P2: drives Vizrt/Unreal).
- [ ] ★ **Second-screen app** — real-time fan leaderboard from published fan-safe projection (reuse leaderboard + charts + auth).
- [ ] **Athlete/coach app extensions** — competitive performance history, deviation reports, training→competition continuity (reuse dashboard/stats/profile/phased practice flow).
- [ ] **Design-system additions** — judge/confidence/degradation components, AR-overlay styling tokens, replay controls (extend existing sun design system).
- [ ] **Fan prediction UI** (P2+) — predictions, engagement loop.
- [ ] **Physiology broadcast widgets** (P2+) — HR/breathing/heatmap "estimated" labelled overlays.

## 3. Workstream B — BACK-END

- [ ] ★ **Scoring engine + rules DSL** — versioned, content-addressed rules; alignment-deviation rule (Procrustes + anthropometric normalization + DTW vs ratified bands) + stability rule (jitter spectral analysis − estimator jitter + COM-sway proxy).
- [ ] ★ **Event/audit ledger** — append-only, hash-chained, signed; every score/override/confirm/protest/replay event; no in-place mutation; `supersedes` linking for live→adjudicated and machine→override.
- [ ] ★ **Bit-reproducible replay service** — re-derive scores from (calibration_set, pose_frames, rule_versions, ledger); expose as first-class testable artifact (see file 07).
- [ ] ★ **Data platform + Drizzle schema** — tables per file 03; migrations; object-store frame pipeline; OLAP mirror + edge→cloud batch sync (after final).
- [ ] ★ **APIs** — performance lifecycle, criteria scores, deductions, calibration sets; gRPC bridge to Python inference services; WebSocket fan-out for live state.
- [ ] ★ **Auth/roles** — extend JWT with judge / admin / broadcast-operator / fan roles; override authority gated to judge role and logged.
- [ ] ★ **Second-screen real-time service** — published fan-safe projections + WebSocket fan-out, isolated from the officiating loop.
- [ ] ★ **Governance/consent** — consent scopes (broadcast/data/biometric) enforced at the API boundary; biometric estimation gated on consent.
- [ ] **Protest workflow** (P2 hardening) — protest → adjudicated re-run → signed resolution.
- [ ] **Analytics/flywheel models** (P2+) — talent funnel, fan analytics on OLAP.

## 4. Workstream C — AI/ML

- [ ] ★ **Multi-cam calibration & triangulation** — Charuco intrinsics + bundle-adjustment extrinsics + PTP/genlock sync + lens-encoder ingest; reprojection-error gating; **graceful degradation** when a cam drops (flag reduced-confidence/human-only).
- [ ] ★ **RTMPose live tier** — per-cam 2D keypoints, TensorRT FP16/INT8, meet ~40–60 ms (alert) / ~60–90 ms (AR) budgets.
- [ ] ★ **ViTPose adjudicated tier** — higher-accuracy 2D + volumetric refinement → signed official deduction; runs on hold-window completion / on protest.
- [ ] ★ **3D pipeline** — triangulation to mm-space + temporal filter (Kalman / 1-Euro) with **estimator-jitter modelling** so stability isn't contaminated by tracker noise.
- [ ] ★ **Asana segmenter from existing classifier** — reuse TF.js pose classifier to mark which asana is held and hold-window boundaries (segmentation only, never measurement).
- [ ] ★ **Pose-template deviation scoring** — compare 3D skeleton to judge-ratified joint-angle band distributions (Procrustes + anthropometric normalization + DTW).
- [ ] ★ **Stability detection** — jitter spectral analysis (subtract estimator jitter) + COM-sway proxy; output per-criterion stability value.
- [ ] ★ **Explainability / deviation maps** — per-joint deviation visualization + plain-language rationale powering the "show me why" explainer (LLM via model-agnostic gateway — see file 06).
- [ ] ★ **Dataset collection + judge-agreement eval** — labelled **diverse** dataset; ICC / Krippendorff α study vs judge panel; per-athlete calibration; **stratified error reporting** (no unacceptable subgroup gap) = P1 gate.
- [ ] ★ **Bias/fairness validation** — diverse-dataset coverage, per-athlete calibration, subgroup error audit before any criterion goes live.
- [ ] **Drift monitoring** — track machine-vs-judge divergence and per-cam reprojection error over events; alert on drift.
- [ ] **Physiology estimation** (P2+) — rPPG HR, breathing, estimated muscle-load heatmap (broadcast-only, labelled "estimated", consent-gated).
- [ ] **Audio instability events** (P2 musical) — discrete instability detection only.
- [ ] **Pair/Group tracking** (P2/P3) — multi-athlete ID + occlusion handling + synchrony scoring.
