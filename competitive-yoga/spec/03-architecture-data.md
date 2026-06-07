# 03 — System Architecture & Data Model

> Internal build spec — forza.ventures Competitive Yoga platform.
> Audience: FE / BE / AI-ML engineers. Status: design-locked for Solo pilot (P1).

## 1. Architecture principles

1. **Officiating loop is on-prem / edge.** The live + adjudicated scoring path must never depend on a cloud uplink. An uplink failure mid-final is unacceptable. Cloud is for post-live analytics, second-screen fan-out, and the data flywheel only.
2. **Two-tier inference (Hawk-Eye/DRS pattern).** A fast LIVE tier drives broadcast AR (~60–90 ms end-to-end glass-to-glass) and referee alerts (~40–60 ms inference-to-alert). A heavy ADJUDICATED tier produces the official, replayable, signed deduction. The live tier is **advisory only** and never deducts of record — exactly because its accuracy envelope (see §3a) is wider than the adjudicated tier.
3. **Camera-only at competition.** 6–8 PTP-synced machine-vision cameras → 2D keypoints → triangulation → 3D mm-space. Wearables are training/calibration only.
4. **Determinism over cleverness.** The scoring engine is rules-as-DSL, versioned, append-only, and bit-reproducible **within a pinned execution environment** (model weights, kernels, rule set, calibration). A protest 6 weeks later must replay to within the documented determinism tolerance (§4a), and the *deduction decisions* must be identical.
5. **Graceful degradation.** On camera drop or low triangulation confidence, the system flags reduced-confidence and falls back to human-only for affected criteria — it never silently guesses. The degradation matrix (§4b) is normative, not best-effort.
6. **Defensible accuracy, calibrated abstention.** No deduction is ever issued on a joint-angle difference inside the measurement noise floor (~5°, see §3a). The system reports calibrated confidence and *abstains* rather than scoring near its own error bars. Accuracy claims in this spec are stated as RMSE envelopes against ground truth, never as point "accuracy %".

## 2. End-to-end pipeline (ASCII)

```
            ┌──────────────────────── VENUE EDGE (on-prem, one flight case) ────────────────────────┐
            │                                                                                        │
 6–8 cams   │  ┌─────────┐   ┌──────────────┐   ┌───────────────────────────┐   ┌────────────────┐  │
 (Basler/   │  │ CAPTURE │──▶│ INGEST +     │──▶│ GPU INFERENCE (per-cam)    │──▶│ MULTI-VIEW     │  │
  FLIR,     │  │ genlock │   │ PTP TIME-SYNC│   │ 2D RTMPose / ViTPose       │   │ TRIANGULATION  │  │
  PTZ+lens  │  │ + lens  │   │ frame-stamp  │   │ TensorRT (FP16/INT8)       │   │ (calibrated)   │  │
  encoders) │  └─────────┘   └──────────────┘   └───────────────────────────┘   └───────┬────────┘  │
            │                                                                            ▼           │
            │  ┌────────────────┐   ┌───────────────────┐   ┌───────────────────┐  ┌──────────────┐ │
            │  │ REFEREE        │◀──│ DETERMINISTIC     │◀──│ TEMPORAL FILTER   │◀─│ 3D SKELETON  │ │
            │  │ DASHBOARD      │   │ SCORING ENGINE    │   │ (Kalman/1-Euro,   │  │ (mm-space)   │ │
            │  │ (override,     │   │ rules-DSL,        │   │ jitter subtract)  │  └──────────────┘ │
            │  │  replay)       │   │ append-only ledger│   └───────────────────┘                   │
            │  └───────┬────────┘   └─────────┬─────────┘                                           │
            │          │                      │                                                     │
            │          ▼                      ▼                                                     │
            │  ┌────────────────┐   ┌───────────────────┐   ┌───────────────────────────────────┐  │
            │  │ GRAPHICS       │   │ REPLAY / SIMULCAM │   │ EVENT LOG (signed, append-only)   │  │
            │  │ COMPOSITOR     │   │ STORE (NVMe)      │   │ + pose_frames cold-store ref       │  │
            │  │ (AR overlays)  │   └───────────────────┘   └───────────────────────────────────┘  │
            │  └───────┬────────┘                                                                   │
            └──────────┼───────────────────────────────────────────────────────────────────────────┘
                       │ SRT / NDI / SDI
                       ▼
              ┌──────────────────┐                    ┌──────────────────── CLOUD (post-live) ───────────────────┐
              │ OB VAN /         │   batch sync ───▶  │ DATA PLATFORM (OLAP mirror)  │  SECOND-SCREEN API (WS)   │
              │ VISION MIXER     │   (after final)    │ object store (frames)        │  fan leaderboard / replay │
              └──────────────────┘                    └───────────────────────────────────────────────────────────┘
```

## 2a. Camera rig geometry & redundancy (the part that makes 3D defensible)

The whole system stands or falls on the rig. Triangulation error scales inversely with the *parallax angle* between the two best-viewing cameras of a joint, so geometry is a first-class spec, not an install detail.

**Capture volume.** Competition mat + safety margin = **3 m × 3 m floor, 2.6 m height** working volume. All keypoints must be seen by ≥2 cameras with adequate parallax everywhere a body can legally be (including supine, inverted, deep backbend).

**Camera count & placement.**
- **8 cameras** for finals/official (6 is the floor for pilot, accepting wider error and less occlusion redundancy).
- Arranged on a **ring + height stagger**: 4 at ~2.8 m height, 4 at ~1.4 m, distributed roughly every 45° in azimuth so no two adjacent cameras share a near-parallel optical axis. This guarantees, for any joint, at least one camera pair with **parallax ≥ 30°** (target 60–90° for the best pair).
- **Baseline:** adjacent same-height cameras sit ~3.0–4.0 m apart (chord of the ring); the working ring radius is ~3.5–4.5 m from volume center. Baseline/depth ratio kept ≥ 0.5 for the primary pairs.
- **Occlusion redundancy:** design target is **≥3 cameras** with clear line-of-sight to every joint in canonical asanas, so losing one camera (or one occluded limb) still leaves a valid triangulation pair. Inversions and twists are the stress cases — the height stagger exists specifically for these.

**Lens / FOV.** Fixed focal length on the official rig (no zoom drift). FOV chosen so the working volume fills ~70–80% of the frame at the ring radius (typ. ~8–12 mm on the chosen sensor — final value set during the lens study, recorded in `calibration_sets.lens_encoder_map`). Global shutter mandatory (rolling shutter corrupts a moving limb's geometry). **PTZ/tracked cameras are broadcast-only and are never inputs to triangulation** — only the fixed metric rig feeds the officiating loop.

**Calibration.** Charuco-board intrinsics per camera + bundle-adjusted extrinsics. Acceptance gate: **mean reprojection error < 0.5 px and < 1.5 mm at volume center**, stored with a signed hash in `calibration_sets`. A calibration that fails the gate cannot be promoted to an event (enforced in code).

## 2b. Time-sync budget (why sub-frame matters, with the math)

A limb tip in a dynamic transition moves on the order of **2–4 m/s**. If two cameras are not sampling the same instant, the triangulated point is the intersection of rays to *two different positions*, injecting depth error.

- At 3 m/s, **1 ms of inter-camera skew = 3 mm of positional disagreement** at the limb tip; at 100 fps a full frame (10 ms) = 30 mm. That 30 mm at a 0.5 m lever arm is **~3.4° of spurious joint-angle error** — i.e. it alone can manufacture a false deduction near the noise floor.
- **Budget:** total inter-camera capture skew must be **≤ 250 µs (1σ)**, target ≤ 100 µs. At 3 m/s that caps sync-induced positional error at < 1 mm, well under the calibration floor.
- **Mechanism:** hardware **genlock** (shared sync generator / tri-level or PTP-driven trigger) for shutter alignment, **PTP (IEEE-1588) with a hardware grandmaster + boundary/transparent clock NICs** for timestamping into the ingest layer. Genlock aligns *exposure*; PTP aligns the *timestamp ledger* the scoring engine trusts. Software NTP is explicitly insufficient and prohibited on the officiating path.
- **Drift detection:** PTP offset/path-delay per camera is logged every second into the event log; a strobe/clap "sync witness" is captured at round start. If any camera's PTP offset exceeds **±150 µs** or genlock lock is lost, that camera is auto-demoted (degradation matrix, §4b) and the referee console raises a sync alarm. Sync state per round is part of the signed record.

## 3. Two-tier inference detail

| | LIVE tier | ADJUDICATED tier |
|---|---|---|
| Model | RTMPose (2D), TensorRT FP16 | ViTPose + volumetric refinement |
| Budget | ~40–60 ms referee alert / ~60–90 ms broadcast AR | seconds (off the critical broadcast path) |
| Output | provisional criterion values, AR overlay, instant deduction *alert* | official signed deduction, replayable evidence |
| Trigger | every frame, streaming | on hold-window completion + on protest |
| Authority | advisory (referee sees it) | of record (after judge confirm/override) |

Both tiers consume the **same calibration set** and write to the **same event log**; the adjudicated value supersedes the live value via an explicit `supersedes` link, never by mutation.

## 3a. Accuracy envelope & the noise floor (the honest numbers)

We do **not** claim "X% accurate". We claim joint-angle RMSE against ground truth, and we never deduct inside the noise floor.

- **Multi-view 3D markerless** (our method) achieves roughly **3–8° RMSE on large sagittal-plane angles** (flexion/extension at hip, knee, elbow, shoulder elevation) and **5–15° RMSE on rotational / axial angles** (internal-external rotation, spine twist) — the latter are intrinsically harder for vision because they are weakly constrained by surface keypoints.
- **The noise floor.** Even marker-based Vicon **self-disagrees by 2–5°** on repeated trials (soft-tissue artifact, marker placement, model). This is the irreducible measurement noise of the *ground truth itself*.
- **Normative rule:** **no automatic deduction is issued on a joint-angle difference < 5°.** Differences in the 5°–noise band are reported as "within tolerance" and contribute no magnitude. This is enforced inside every alignment rule in the DSL and is a fairness invariant tested in 11.
- **Per-axis budgets** (target, set as DSL parameters per criterion): sagittal alignment deduction threshold ≥ 8°; rotational thresholds ≥ 12°; thresholds widen automatically when `triangulation_confidence` or `num_cams_used` drops (confidence-gated, §4c).
- **Live vs adjudicated envelope.** The live RTMPose tier runs ~1–3° wider RMSE than the adjudicated ViTPose+volumetric tier and is advisory-only for exactly this reason. The adjudicated tier's envelope is the one the deduction thresholds are calibrated against.

## 3b. Temporal filtering spec (latency vs smoothness, with parameters)

Per-frame 3D estimates jitter; raw jitter both looks bad on broadcast and corrupts stability scoring. We filter, but filtering trades latency for smoothness and must be specified and *versioned* so replay is exact.

- **Live tier — One-Euro filter** per coordinate (low latency, adaptive). Starting params, tuned per venue and pinned per event: `min_cutoff = 1.0 Hz`, `beta = 0.007`, `d_cutoff = 1.0 Hz`. One-Euro is chosen for the broadcast path because its latency stays bounded during fast motion (raises cutoff when velocity rises).
- **Adjudicated tier — fixed-interval RTS Kalman smoother** (constant-velocity per joint, measurement covariance scaled by per-camera reprojection residual and `triangulation_confidence`). Because adjudication is off the real-time path it smooths **acausally** (uses future frames), which a live filter cannot — yielding the lower-jitter, replayable official skeleton.
- **Filter params are part of `rule_version`'s pinned environment** — a replay re-runs the identical filter with identical params, or it is not a valid replay.
- **Estimator-jitter subtraction.** Stability scoring (§4 / criterion `stability`) must not punish the *estimator's* noise as if it were athlete sway. We characterize estimator jitter from a static rigid-body capture, store its spectrum, and **subtract that noise floor** before computing the COM-sway / jitter-spectral stability proxy. Audio cues fire on **discrete instability events only**, never continuously.

## 4. Scoring engine design

- **Rules-as-DSL.** Each criterion (alignment deviation, stability, hold, etc.) is a versioned DSL rule: `inputs → predicate/curve → magnitude`. Rules are content-addressed (`rule_version` = hash of the compiled rule + parameters). Reference form is a **distribution of judge-ratified joint-angle bands** with tolerances; comparison uses Procrustes alignment + anthropometric normalization + DTW for time alignment.
- **Append-only event log.** Every input frame-batch hash, rule evaluation, machine score, judge action, and override is an immutable, signed event. Nothing is updated in place.
- **Hybrid machine + judge merge.** Machine emits a score with `confidence`. Judge may confirm or override; the override carries authority and is logged with judge identity, timestamp, and reason. Final criterion value = last authoritative event in the merge chain.
- **Bit-reproducible replay.** Given (calibration_set, pose_frames cold-store refs, rule_versions, event log), the engine re-derives every machine score byte-identically. This is the artifact protests are adjudicated against. Replay is a first-class testable build output (see 07).
- **Hybrid 4-criteria × 10 = 40/round** scoring model is the aggregation layer on top of per-criterion scores.

## 4a. Determinism & reproducibility strategy

"Bit-reproducible" must survive GPUs. Naive FP16 TensorRT inference is **not** bit-identical across GPU architectures (different SM counts, kernel autotuning, reduction order). We therefore separate the *non-deterministic estimation* from the *deterministic decision*:

1. **Pin the environment.** A replay manifest pins: model weights hashes (RTMPose / ViTPose / volumetric), TensorRT engine build + GPU arch, CUDA/cuDNN versions, filter params, calibration_set hash, rule_set hash, and quantization profile. Stored in `model_registry` / `rule_registry` (data model below) and referenced from every `criteria_score` and `deduction`.
2. **Two-stage equivalence.** The official artifact is not the raw GPU tensor — it is the **post-filter 3D skeleton (mm-space) frozen in cold storage**. Adjudication and replay run the deterministic scoring engine over those *frozen skeletons*. The scoring engine (DSL evaluation, Procrustes, anthropometric normalization, DTW, thresholding) is **pure integer/double-precision CPU code with fixed reduction order → bit-identical**.
3. **Replay equivalence test (normative).** Given (calibration_set, frozen pose_frames, rule_versions, model manifest), re-running must produce **byte-identical scores and an identical set of deductions**. This is a CI gate (golden-round suite, see 11).
4. **Re-inference tolerance.** If frozen skeletons are unavailable and we must re-run inference on a *different* GPU, results are required to match only within a **documented tolerance** (joint position ≤ 2 mm, derived angle ≤ 1°) **and produce the identical deduction set**. Any divergence that would flip a deduction is a release-blocking bug. This is why we always persist frozen skeletons for anything that could be protested.

## 4b. Graceful degradation matrix (normative)

| Trigger | Detection | System action | Officiating effect |
|---|---|---|---|
| 1 camera drops (still ≥3 LoS / valid pair on all joints) | heartbeat + frame-gap watchdog | re-triangulate on remaining cams; widen confidence bands | `confidence_state = full`, flag noted in log |
| Camera drop reduces a joint to <2 LoS or <30° parallax | per-joint visibility check | mark affected joints/criteria reduced | `confidence_state = reduced`; affected criteria → human-only |
| Lost / low-confidence 2D keypoint | per-keypoint conf < τ | drop that observation from triangulation; if pair lost, treat as occlusion | reduced for that joint-frame |
| `triangulation_confidence` below floor | per-frame metric | rule **abstains** (no machine magnitude) | criterion deferred to judge |
| PTP offset > ±150 µs / genlock unlock | sync monitor | demote camera, raise sync alarm | reduced or human-only per coverage |
| Calibration drift detected mid-event (§4c) | live reprojection monitor | freeze machine deductions for affected volume | human-only until recalibrated |
| Whole-rig failure | edge health | machine officiating offline | full human-only fallback; event continues |

**Invariant:** the system **abstains** rather than guessing. Every degradation is written to `audit_log` and surfaced on the referee console; a `reduced`/`human_only` performance is visibly marked in evidence and broadcast.

## 4c. Confidence calibration & calibration-drift detection

- **Calibrated confidence, not raw softmax.** Per-criterion `confidence` is mapped through a fitted reliability curve (isotonic / temperature scaling) so that "0.9 confidence" empirically means ~90% agreement with adjudicated ground truth. The calibration map is itself versioned (in `model_registry`). Confidence drives the abstain gate and the threshold-widening in §3a.
- **Live calibration-drift detection.** A continuous **reprojection-residual monitor** compares each frame's triangulated joints back into each camera; if median residual exceeds the calibration baseline (e.g. >1.5× the captured `reprojection_error_mm`), drift is flagged — a bumped tripod, thermal shift, or vibration. The affected volume goes `reduced`, and a recalibration is requested at the next break. Drift events are first-class log entries.
- **Per-venue revalidation** of confidence calibration is a go/no-go item (see 11).

## 4d. Explainability evidence captured per deduction ("show me why")

Every `deduction` carries, *as captured data* (not LLM-generated), the evidence needed to defend it. The LLM only renders this into prose — it is never the source of truth.

Captured per deduction (`deductions.evidence` jsonb + frozen frame ref):
- the **criterion + rule_version** and the human-readable rule text at that version;
- the **measured joint angle(s)** and the **reference band** they violated, with the **delta** and the threshold;
- which **noise-floor / tolerance** check was applied (proving delta > 5° and > criterion threshold);
- **frozen 3D skeleton frame ref** + the camera frames that triangulated the offending joint (the "evidence_frame");
- `triangulation_confidence`, `num_cams_used`, calibrated `confidence`, and `confidence_state` at that instant;
- the **Procrustes/anthropometric-normalized** athlete pose vs reference, so the explanation is body-size-fair;
- the **t_ms window** and the DTW alignment used.

This is what powers replay, protest, and the "show me why" overlay, and it is what 11's fairness tests assert on.

## 5. Tech stack

| Layer | Tech | Reuse |
|---|---|---|
| Front-ends (referee console, graphics control, second-screen, athlete/coach) | Next.js 14 + TS | reuse AsanaAI shell, auth, charts |
| Back-end APIs / ledger / data platform | Express (NestJS-style modular) + Drizzle + self-hosted Postgres + JWT | reuse existing backend |
| GPU inference services | Python, gRPC (RTMPose/ViTPose + TensorRT) | NEW |
| Asana segmentation | AsanaAI classifier **reused as an asana segmenter** (labels the sequence into per-asana windows that the scoring engine scores against the right `asana_template`) | REUSE (repurposed) |
| Live feeds | WebSocket (referee/graphics/second-screen state) | NEW (state shape reuses score-display patterns) |
| Frame storage | S3-class object store + NVMe edge replay store | NEW |
| Analytics | OLAP mirror of Postgres | NEW |

## 6. Data model (Drizzle / Postgres)

> Hot transactional state in Postgres. 3D skeleton frames in object store (cold), referenced by URI. OLAP mirror is read-only for analytics. `audit_log` is append-only + signed.

```ts
// athletes — consent is first-class (broadcast/data/biometric scopes)
athletes(
  id uuid pk, display_name text, dob date, country text,
  anthropometrics jsonb,                 // limb lengths for normalization
  consent_broadcast bool, consent_data_flywheel bool,
  consent_biometric_estimation bool,     // rPPG/breathing broadcast est.
  consent_signed_at timestamptz, consent_version text,
  created_at timestamptz
)

events(
  id uuid pk, name text, venue text, starts_at timestamptz,
  calibration_set_id uuid fk -> calibration_sets.id,  // intrinsics+extrinsics+PTP profile
  status text                            // setup|live|adjudication|closed
)

calibration_sets(
  id uuid pk, event_id uuid, captured_at timestamptz,
  intrinsics jsonb,                      // Charuco per-cam
  extrinsics jsonb,                      // bundle-adjusted
  ptp_profile jsonb, lens_encoder_map jsonb,
  reprojection_error_mm numeric, signed_hash text
)

rounds(
  id uuid pk, event_id uuid fk,
  format text,                           // solo|pair|group
  category text,                         // musical|non_musical
  asana_template_id uuid fk -> asana_templates.id,
  sequence int
)

asana_templates(
  id uuid pk, name text,
  reference_bands jsonb,                 // DISTRIBUTION of judge-ratified joint-angle bands (mean+spread per joint)
  tolerances jsonb,                      // per-joint deviation tolerances; min 5° noise floor enforced
  hold_requirement_ms int,
  segmenter_label text,                  // AsanaAI classifier label used to SEGMENT this asana in the sequence
  ratified_by text, ratified_at timestamptz, version text
)

// MODEL REGISTRY — pins the exact inference/filter/calibration environment for replay
model_registry(
  id uuid pk,
  kind text,                             // 'pose_2d_rtmpose'|'pose_2d_vitpose'|'volumetric'|'segmenter_asanaai'|'confidence_calibration'
  weights_hash text,                     // content hash of weights
  framework_build text,                  // tensorrt build + gpu_arch + cuda/cudnn versions
  quant_profile text,                    // FP16 / INT8 profile id
  filter_params jsonb,                   // One-Euro / Kalman params pinned for this env
  notes text, created_at timestamptz
)

// RULE REGISTRY — content-addressed compiled DSL rules + parameters
rule_registry(
  id uuid pk,
  rule_version text unique,              // = hash(compiled rule + params)  (referenced by criteria_scores.rule_version)
  criterion text,
  source_dsl text,                       // human-readable rule text at this version
  params jsonb,                          // thresholds (>=5° floor), curves, DTW config
  ratified_by text, ratified_at timestamptz
)

performances(
  id uuid pk, round_id uuid fk, athlete_id uuid fk,
  started_at timestamptz, ended_at timestamptz,
  confidence_state text,                 // full|reduced|human_only (camera-drop degradation)
  status text                            // recording|scored|published
)

criteria_scores(
  id uuid pk, performance_id uuid fk,
  criterion text,                        // alignment_deviation|stability|hold|...
  source text,                           // 'machine' | 'judge'
  tier text,                             // 'live' | 'adjudicated'
  value numeric, max_value numeric,
  rule_version text fk -> rule_registry.rule_version,
  model_manifest_id uuid fk -> model_registry.id,  // pinned env for replay
  confidence numeric,                    // CALIBRATED (isotonic/temp-scaled), not raw softmax
  abstained bool,                        // true => no machine magnitude (noise floor / low conf)
  supersedes uuid,                       // links live->adjudicated / machine->override
  created_at timestamptz
)

pose_frames(
  id uuid pk, performance_id uuid fk,
  t_ms int,                              // PTP-aligned time
  skeleton_uri text,                     // cold-store ref to 3D skeleton (mm-space)
  tier text,                             // 'live' | 'adjudicated'
  triangulation_confidence numeric, num_cams_used int
)

deductions(
  id uuid pk, performance_id uuid fk,
  t_ms int, rule_id text,
  rule_version text fk -> rule_registry.rule_version,
  model_manifest_id uuid fk -> model_registry.id,
  magnitude numeric, criterion text,
  evidence_frame_ref text,               // FROZEN 3D skeleton + contributing camera frames
  evidence jsonb,                        // §4d: measured angle, reference band, delta, threshold,
                                         //      noise-floor check, normalized poses, DTW window
  tier text, confidence numeric,         // calibrated
  triangulation_confidence numeric, num_cams_used int, confidence_state text,
  status text                            // proposed|confirmed|overridden|withdrawn
)

audit_log(                               // APPEND-ONLY, SIGNED
  id uuid pk, seq bigserial,             // monotonic
  actor text,                            // judge id | system | service name
  action text,                           // score|override|confirm|protest|replay
  subject_type text, subject_id uuid,
  payload jsonb, prev_hash text,         // hash chain
  signature text, created_at timestamptz
)
```

### Second-screen / fan tables
```ts
fan_users(id uuid pk, handle text, email text, created_at timestamptz)

second_screen_sessions(
  id uuid pk, event_id uuid fk, fan_user_id uuid,
  device text, joined_at timestamptz
)

fan_leaderboard_snapshots(             // published, fan-safe projection
  id uuid pk, round_id uuid fk, athlete_id uuid,
  rank int, total numeric, published_at timestamptz
)

fan_predictions(                        // engagement / flywheel
  id uuid pk, fan_user_id uuid, round_id uuid,
  predicted_athlete_id uuid, created_at timestamptz, correct bool
)
```

## 7. Storage boundaries

- **Postgres (edge + cloud mirror):** transactional records above. Edge instance owns the live officiating loop; cloud mirror receives a one-way batch sync **after the final closes**.
- **Object store (S3-class):** 3D skeleton frames, evidence clips, Simulcam ghosts. Referenced by URI from `pose_frames` / `deductions`. Edge NVMe holds the hot replay set for the event; cold copy lands in S3.
- **OLAP mirror:** read-optimized copy of Postgres + frame metadata for the data-flywheel analytics, talent funnel, and fan analytics. Never on the officiating critical path.

## 8. Storage & throughput math (sizing the rig honestly)

Assume **8 cameras @ 100 fps, 1080p mono/Bayer global-shutter, ~12-bit → ~2 MB/frame raw**.

**Capture ingest (transient, not all persisted):**
- 8 × 100 × 2 MB ≈ **1.6 GB/s** sustained raw into the ingest/inference layer. This drives NIC (≥25 GbE per few cams, or camera-link/CoaXPress) and PCIe sizing, not long-term storage — raw camera frames are ring-buffered, only retained for protest-window clips.

**Inference throughput:** 8 × 100 = **800 keypoint-inferences/sec** on the live tier (RTMPose), plus adjudicated re-runs on hold windows. GPU sizing math is detailed in 06 §1a.

**Persisted officiating artifacts (the durable cost):**
- **Frozen 3D skeleton frames:** ~33 joints × (xyz + conf) ≈ ~0.5–1 KB/frame after encoding. At 100 fps that is ~50–100 KB/s per performance, ~**6 MB/min**. A full day of competition (say 8 h of active capture) ≈ **~3 GB of skeleton frames** — trivially cheap; we keep these *forever* because they are the replay substrate.
- **Evidence camera clips** (only around deductions/protests, e.g. 8 cams × 6 s windows, lightly compressed): order **tens of GB per event**. Retained per protest/retention policy (default 3 years for official rounds).
- **Edge NVMe hot replay set** must hold one full event's frozen skeletons + evidence clips: provision **≥4 TB NVMe** per flight case (headroom for raw ring buffer + multi-day events).
- **Cold (S3-class):** after the final, skeletons + evidence sync to object store. Yearly all-in (frames + clips + metadata) is single-digit TB/season — dominated by evidence clips, not skeletons.

**Retention:** signed `audit_log` + frozen skeletons + rule/model manifests are retained for the full appeal/record period (≥3 years); raw camera ring-buffer frames are discarded after the protest window unless promoted to an evidence clip.
