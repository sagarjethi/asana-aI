# 04 — Reuse Map & Pilot Scope

> What we reuse from AsanaAI vs what is genuinely new, and the exact boundary of the P1 Solo pilot.

## 1. Reuse map by tier

AsanaAI baseline: Next.js 14 + TS shell, JWT auth, leaderboard, profiles/stats/achievements/diet, charts, self-hosted Postgres + Drizzle patterns, react-webcam capture, score-display state, and a TF.js **pose classifier** (asana + confidence — NOT a joint-angle regressor). The classifier is reused as an **asana SEGMENTER** (which pose is being held, when it starts/ends), never as a measurement source.

| Tier | Reuses from AsanaAI | New build |
|---|---|---|
| **Competitive inference** (2D→3D→scoring path) | classifier → **asana segmenter** only; react-webcam capture pattern (concept) | ~everything: multi-cam calibration, RTMPose/ViTPose TensorRT, triangulation, temporal filter, mm-space skeleton. **~0% of the inference path reuses.** |
| **Scoring engine** | Postgres/Drizzle persistence patterns, score-display state shape | rules-as-DSL, versioned/append-only signed ledger, hybrid machine+judge merge, bit-reproducible replay |
| **Referee dashboard** | Next.js shell, JWT auth, charts, score-display state, design system | judge roles, override UI, replay/Simulcam viewer, confidence/degradation indicators, WebSocket live state |
| **Broadcast graphics** | score-display state shape (source of truth for lower-thirds) | AR overlay compositor integration, Simulcam ghost, "show me why" explainer, graphics-control surface |
| **Second-screen** | Next.js shell, JWT auth, **leaderboard component**, charts, profiles | real-time fan service, fan predictions, fan-safe published projections, WebSocket fan-out |
| **Data platform** | Postgres/Drizzle schema patterns, existing migrations workflow | OLAP mirror, object-store frame pipeline, flywheel/analytics models, batch edge→cloud sync |
| **Training / calibration mode** | dashboard, stats, achievements, diet, profile, **phased practice flow**, classifier, react-webcam, charts | single-cam→multi-cam calibration tooling, deviation feedback UI, optional wearable/IMU ingest (training only) |

Net: **~70% reuse** across athlete/coach/fan/training/data tiers; **~0% reuse** on the competitive inference path. Reuse concentrates in shells, auth, charts, leaderboard, and persistence patterns — not in measurement.

## 2. Pilot scope (P1 — Solo)

The pilot proves the hard, novel core end-to-end at the smallest defensible scale: one mat, one athlete, the full two-tier loop on a narrow but real criterion set, with auditable replay and a referee override.

### Physical / infra
- **Solo format**, single mat, **4 calibrated cameras** (machine-vision, PTP-synced, genlock).
- **1 GPU box, 2× NVIDIA L40S**, TensorRT.
- PTP/genlock clock + NVMe replay store. Whole rig = **one flight case**.
- Charuco intrinsics + bundle-adjustment extrinsics + owned competition-zone lighting; ~2 hr per-venue setup.

### Functional
- **Both tiers live:** RTMPose live tier (AR + referee alert) + ViTPose adjudicated tier (signed deduction).
- **1–2 objective criteria only:** (1) **alignment deviation** vs judge-ratified reference bands; (2) **stability** (jitter spectral analysis with estimator-jitter subtraction + COM-sway proxy).
- **ONE AR overlay** (alignment deviation visualized on the broadcast feed).
- **ONE Simulcam ghost** (athlete vs reference form).
- **"Show me why" explainer** for the displayed deduction (deviation map + plain-language rationale).
- **Minimal referee console:** live score, confidence/degradation indicator, **judge override** (logged with authority), and **replay** of the adjudicated evidence.
- **Basic second-screen leaderboard** (published fan-safe projection, real-time).

### Pipeline used
Capture → PTP sync → per-cam RTMPose (TensorRT) → 4-view triangulation → 3D skeleton → temporal filter → scoring engine (2 rules, DSL, signed ledger) → referee console + graphics compositor + NVMe replay. Adjudicated ViTPose pass on hold-window completion / on protest.

## 3. IN-SCOPE (P1)
- Solo, single mat, 4 cams, 1 GPU box (2× L40S).
- Two-tier inference for **alignment deviation + stability**.
- Calibration tooling (Charuco + bundle adjustment + PTP) and ~2 hr setup runbook.
- Deterministic scoring engine with rules-DSL (2 rules), versioned + append-only signed ledger.
- Bit-reproducible replay of those 2 criteria.
- One AR overlay, one Simulcam ghost, one "show me why" explainer.
- Referee console: live view, confidence/degradation state, override (logged), replay.
- Second-screen leaderboard (real-time, fan-safe projection).
- Graceful degradation on camera drop (flag reduced-confidence / human-only).
- Training mode reuse for athlete data capture feeding the dataset.

## 4. OUT-OF-SCOPE (P1)
- Pair / Group / Musical formats (P2/P3).
- Full 4-criteria × 10 = 40/round model (only 1–2 criteria scored by machine in pilot).
- 6–8 camera array (4 only).
- Physiology broadcast estimates (rPPG HR, breathing, muscle heatmap) — P2+.
- Audio-driven instability events — P2+.
- Vizrt/Unreal+Zero Density full graphics integration — OBS/vMix stand-in for pilot.
- Mo-Sys/Stype camera tracking for PTZ AR — fixed/locked cams in pilot.
- OB van / vision-mixer integration — pilot uses OBS/vMix.
- Wearables/IMU/force-plate/EMG at competition (training/calibration only, and optional even there).
- Full cloud OLAP analytics product and fan prediction game economy.
- Talent-funnel and monetization surfaces.

## 5. Pilot success criteria
1. **Latency targets met:** referee alert ~40–60 ms; broadcast AR ~60–90 ms on the live tier, measured end-to-end at the rig.
2. **Judge-agreement validated:** machine vs panel on the 2 criteria meets the agreed inter-rater threshold (ICC / Krippendorff α) on a labelled solo dataset, with stratified (per-demographic, per-anthropometric) error reporting — no unacceptable subgroup gap.
3. **Auditable replay demonstrated:** a deduction is re-derived **bit-identically** from (calibration_set, pose_frames, rule_versions, event log) after the fact, and a referee override is shown fully logged with authority in the signed ledger.
4. **Graceful degradation demonstrated:** pull one camera live → system flags reduced-confidence / human-only for affected criterion without crashing or silently guessing.
5. **On-prem independence:** full officiating loop runs with the cloud uplink physically disconnected.
6. **Setup feasibility:** ~2 hr calibration runbook executed by the broadcast engineer at a non-home venue.
