# 03 — System Architecture & Data Model

> Internal build spec — forza.ventures Competitive Yoga platform.
> Audience: FE / BE / AI-ML engineers. Status: design-locked for Solo pilot (P1).

## 1. Architecture principles

1. **Officiating loop is on-prem / edge.** The live + adjudicated scoring path must never depend on a cloud uplink. An uplink failure mid-final is unacceptable. Cloud is for post-live analytics, second-screen fan-out, and the data flywheel only.
2. **Two-tier inference (Hawk-Eye/DRS pattern).** A fast LIVE tier drives broadcast AR (~60–90 ms) and referee alerts (~40–60 ms). A heavy ADJUDICATED tier produces the official, replayable, signed deduction.
3. **Camera-only at competition.** 6–8 PTP-synced machine-vision cameras → 2D keypoints → triangulation → 3D mm-space. Wearables are training/calibration only.
4. **Determinism over cleverness.** The scoring engine is rules-as-DSL, versioned, append-only, and bit-reproducible. A protest 6 weeks later must replay byte-identical.
5. **Graceful degradation.** On camera drop or low triangulation confidence, the system flags reduced-confidence and falls back to human-only for affected criteria — it never silently guesses.

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

## 3. Two-tier inference detail

| | LIVE tier | ADJUDICATED tier |
|---|---|---|
| Model | RTMPose (2D), TensorRT FP16 | ViTPose + volumetric refinement |
| Budget | ~40–60 ms referee alert / ~60–90 ms broadcast AR | seconds (off the critical broadcast path) |
| Output | provisional criterion values, AR overlay, instant deduction *alert* | official signed deduction, replayable evidence |
| Trigger | every frame, streaming | on hold-window completion + on protest |
| Authority | advisory (referee sees it) | of record (after judge confirm/override) |

Both tiers consume the **same calibration set** and write to the **same event log**; the adjudicated value supersedes the live value via an explicit `supersedes` link, never by mutation.

## 4. Scoring engine design

- **Rules-as-DSL.** Each criterion (alignment deviation, stability, hold, etc.) is a versioned DSL rule: `inputs → predicate/curve → magnitude`. Rules are content-addressed (`rule_version` = hash of the compiled rule + parameters). Reference form is a **distribution of judge-ratified joint-angle bands** with tolerances; comparison uses Procrustes alignment + anthropometric normalization + DTW for time alignment.
- **Append-only event log.** Every input frame-batch hash, rule evaluation, machine score, judge action, and override is an immutable, signed event. Nothing is updated in place.
- **Hybrid machine + judge merge.** Machine emits a score with `confidence`. Judge may confirm or override; the override carries authority and is logged with judge identity, timestamp, and reason. Final criterion value = last authoritative event in the merge chain.
- **Bit-reproducible replay.** Given (calibration_set, pose_frames cold-store refs, rule_versions, event log), the engine re-derives every machine score byte-identically. This is the artifact protests are adjudicated against. Replay is a first-class testable build output (see 07).
- **Hybrid 4-criteria × 10 = 40/round** scoring model is the aggregation layer on top of per-criterion scores.

## 5. Tech stack

| Layer | Tech | Reuse |
|---|---|---|
| Front-ends (referee console, graphics control, second-screen, athlete/coach) | Next.js 14 + TS | reuse AsanaAI shell, auth, charts |
| Back-end APIs / ledger / data platform | Express (NestJS-style modular) + Drizzle + self-hosted Postgres + JWT | reuse existing backend |
| GPU inference services | Python, gRPC (RTMPose/ViTPose + TensorRT) | NEW |
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
  reference_bands jsonb,                 // distribution of joint-angle bands (judge-ratified)
  tolerances jsonb,                      // per-joint deviation tolerances
  hold_requirement_ms int,
  ratified_by text, ratified_at timestamptz, version text
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
  value numeric, max_value numeric,
  rule_version text,                     // content hash of DSL rule
  confidence numeric,
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
  t_ms int, rule_id text, rule_version text,
  magnitude numeric, criterion text,
  evidence_frame_ref text,               // pose_frames / object-store ref
  tier text, confidence numeric,
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
