# 05 — Implementation Roadmap & Workstreams

> Phased delivery plan, the **critical path**, four engineering workstreams (FE / BE / AI-ML / **Data-Collection & Annotation**) as DoD-testable checklists, staffing, procurement risks, and phase gates.
> `★` = pilot-critical (must ship in P1). `▸` = later (P2+).

## 0. How to read this doc

- **Durations assume a stated team size.** They are *engineering* durations (build + test + integrate), not calendar wishes; calendar adds procurement lead time, hiring ramp, and venue scheduling, which are called out separately. With a smaller team, durations stretch roughly linearly on the non-parallelizable critical path.
- **Reuse from AsanaAI reduces *some* tasks (UI/shell/auth/persistence) but not the inference path** (file 04 §0). Do not schedule the inference path as if reuse helps it.
- **Definition of Done (DoD)** is attached to every major task. A task is not "done" until its DoD is demonstrable, not just code-complete.

## 1. Critical path (read this first)

The pilot's end-to-end critical path is a chain; each link gates the next and **cannot be parallelized away**:

```
HW procurement (cams, GPU box, PTP, NVMe)        ← longest lead time, start FIRST
        │
        ▼
Multi-cam CALIBRATION (Charuco + bundle adj + PTP sync, reproj-error gate)
        │
        ▼
3D pipeline (triangulation → mm-space skeleton → temporal filter w/ estimator-jitter model)
        │
        ▼
SCORING engine (2 DSL rules) + signed ledger + bit-repro replay
        │
        ▼
Referee CONSOLE (override + replay) ── Graphics overlay/Simulcam/explainer ── Second-screen
        │
        ▼
JUDGE-AGREEMENT validation (needs DATASET + judge panel)  → P1 exit gate
```

**Parallel long pole — gates the right-hand side, not the left:**

```
DATA-COLLECTION & ANNOTATION (P0, runs continuously)
   raw capture → consent/provenance → judge labelling → diverse, stratified, QA'd dataset
        └────────────────────────────► gates: model training, judge-agreement (Crit. #2), bias audit
```

**Critical-path truths:**
- **Hardware procurement is the first real dependency, not calibration.** You cannot calibrate cameras you don't have. Order on day 0; treat lead times as schedule risk (§6).
- **Calibration must pass its reprojection-error gate before any 3D or ML work is trusted.** ML built on bad geometry produces confident garbage.
- **The dataset gates the right half of the diagram.** Model training and the judge-agreement study cannot finish before a diverse, labelled, QA'd dataset exists. This is why P0 stands up data collection *before* P1 needs it. **It is the long pole — under-resourcing annotation is the single most common way this program slips.**
- **Scoring/ledger/replay precede the console** (the console renders and overrides scored events).
- **Group (P3) is last by design** (heaviest occlusion + synchrony).

## 2. Phased roadmap

| Phase | Name | Scope | Key milestones | Depends on | Duration (team) | Exit criteria (gate) |
|---|---|---|---|---|---|---|
| **P0** | Training mode & **data foundation** | Extend AsanaAI into training/calibration; stand up data platform; **stand up & run data-collection + annotation pipeline (long pole — start immediately)** | M0.1 asana segmenter from classifier; M0.2 deviation-feedback training UI; M0.3 Drizzle schema + object store + OLAP mirror; M0.4 **data-collection + labelling pipeline live**; M0.5 judge-agreement eval harness | AsanaAI baseline; judge panel committed; consent/governance | ~3–4 mo (2 BE + 1 FE + 1 ML + 0.5 data-eng + judge panel part-time) — **but dataset growth is continuous and runs into P1** | Diverse labelled dataset at/above eval-plan minimum size with stratification metadata + label-QA pass; eval harness emits ICC/α on demand; schema migrated; frames flowing to object store with provenance & consent tags |
| **P1** | Solo pilot ★ | 4 cams, 1 GPU (2× L40S), PTP, NVMe replay (one flight case); two-tier on alignment + stability; 1 AR overlay, 1 Simulcam, explainer, referee console, second-screen leaderboard | M1.1 calibration toolchain ★; M1.2 RTMPose live tier ★; M1.3 triangulation + 3D + temporal filter ★; M1.4 scoring engine + 2 DSL rules + signed ledger ★; M1.5 ViTPose adjudicated tier ★; M1.6 referee console (override+replay) ★; M1.7 graphics overlay + Simulcam + explainer ★; M1.8 second-screen leaderboard ★ | **HW received & burned-in**; P0 data + schema; P0 dataset at minimum size; judge panel; ratified reference bands | ~5–7 mo engineering on the critical path (2 ML + 2 BE + 2 FE + 1 infra/HW), **+ procurement lead time in parallel** | **All P1 success criteria (file 04 §6) PASS:** numeric latency, ICC/α ≥ threshold + subgroup parity, bit-identical replay, live degradation, on-prem independence, non-dev setup |
| **P2** | Multi-format (Pair + Musical) ▸ | 6–8 cams; full 4×10=40 criteria; physiology broadcast estimates; audio instability events; Vizrt/Unreal+Zero Density + Mo-Sys/Stype; OB-van transport | M2.1 6–8 cam array + multi-athlete triangulation; M2.2 Pair occlusion handling; M2.3 musical/audio criteria; M2.4 full criteria DSL set; M2.5 rPPG/breathing/heatmap broadcast est.; M2.6 pro graphics + camera-tracking integration; M2.7 SRT/NDI→OB van | **P1 proven** (all gates passed); P2 HW procured | ~6–9 mo (team grows: +1 ML for occlusion, +1 integration eng for BUY graphics/tracking) | Pair + Musical scored to spec at a real broadcast; pro graphics live; physiology estimates on air (labelled "estimated") |
| **P3** | Group ▸ | Hardest, last: many athletes, heavy occlusion, synchrony scoring | M3.1 N-athlete tracking + ID under heavy occlusion; M3.2 synchrony/formation criteria; M3.3 scale-out GPU + transport; M3.4 full fan-engagement product | P2 proven | ~9–12 mo (largest team; occlusion is a research-grade problem) | Group format scored reliably at full event scale |

## 3. Phase-gate checklist (entry/exit per phase)

A phase **may not begin** until the prior phase's exit gate is signed off. Gates are binary and witnessed.

| Phase | Entry criteria (must hold to start) | Exit criteria (must hold to finish) |
|---|---|---|
| **P0** | AsanaAI baseline stable; judge panel committed (≥3); consent/governance template approved; data-eng + annotation lead identified | Dataset ≥ eval-plan minimum, diverse + stratified + QA'd; eval harness produces ICC/α; schema migrated; object-store pipeline with provenance/consent live; segmenter re-validated for multi-cam timing |
| **P1** | **All file 04 §5 pre-conditions A1–A7 verified** (HW in hand & burned-in, venue + lighting, athlete consent, judge panel, dataset, ratified bands, on-prem self-sufficiency) | **All file 04 §6 criteria PASS** (numeric); contingency log reviewed; replay determinism proven on a clean machine |
| **P2** | P1 gates all green; P2 HW (6–8 cams) ordered with delivery dates; BUY graphics/tracking contracts signed; broadcast partner + OB-van slot booked | Pair + Musical to spec at a real broadcast; physiology on air labelled "estimated"; pro graphics + camera tracking integrated and operator-run |
| **P3** | P2 proven at a broadcast; occlusion/synchrony research spike de-risked; scale-out GPU + transport budgeted | Group scored reliably at full event scale; fan-engagement product live |

## 4. Workstreams (DoD-testable checklists)

> Each task: `[ ] ★/▸ Title — what it is. **DoD:** demonstrable pass condition.`
> Staffing per workstream is stated at the head of each section; durations in §2 assume these.

### 4.0 Workstream D — DATA-COLLECTION & ANNOTATION (the long pole — start in P0)

**Staffing:** 1 annotation/program lead, ≥3 qualified judge-labellers (part-time), 0.5 data engineer (pipeline + QA tooling). **Skills:** sports-judging domain expertise, annotation-tooling/ops, data engineering, basic stats for inter-rater reliability.
**Critical-path role:** gates model training, judge-agreement (Crit. #2), and bias audit. If this slips, P1 slips — no exceptions.

- [ ] ★ **Capture protocol & rig (training mode)** — define poses, angles, lighting, athlete diversity targets; capture via training/calibration mode. **DoD:** protocol document signed by head judge; a pilot capture session produces schema-valid, consented frames with full provenance.
- [ ] ★ **Consent & provenance plumbing** — every frame carries athlete consent scopes + capture metadata; biometric gated. **DoD:** a frame with revoked/absent consent is rejected at ingest; provenance is queryable per frame.
- [ ] ★ **Labelling tooling + protocol** — judges label criteria on captured holds; double-labelling for reliability. **DoD:** two judges independently label a sample and the tool computes their inter-rater agreement automatically.
- [ ] ★ **Diversity & stratification tracking** — live coverage dashboard by demographic/anthropometric strata. **DoD:** dashboard shows coverage gaps; dataset card auto-generated with size + strata.
- [ ] ★ **Label QA + gold set** — adjudicated gold labels; QA pass on each batch. **DoD:** a batch failing QA threshold is blocked from the training set; gold set held out for eval.
- [ ] ★ **Judge-ratified reference bands** — derive and version-pin the joint-angle bands for the 2 criteria. **DoD:** bands committed under a rule version and approved by head judge.
- [ ] ▸ **Ongoing collection at events** — flywheel from live events feeds dataset (consent-gated). **DoD:** post-event frames land in dataset with provenance and enter labelling queue.

### 4.1 Workstream A — FRONT-END

**Staffing:** 2 FE engineers. **Skills:** Next.js/TS, real-time WebSocket UI, broadcast/operator UX, design systems. Reuses AsanaAI shell/auth/charts/leaderboard.

- [ ] ★ **Referee console** — live score per criterion, confidence + degradation badge, judge **override** (writes authoritative event), reason capture. **DoD:** an override performed in the UI appears in the signed ledger with judge authority + reason; degradation badge flips when a camera is pulled.
- [ ] ★ **Replay viewer** — scrub adjudicated evidence frames, Simulcam ghost overlay, deduction timeline. **DoD:** judge can scrub to a deduction and the displayed evidence matches the bit-reproducible re-derivation.
- [ ] ★ **WebSocket live-state client** — single source-of-truth score-display state feeding console + graphics + second-screen (reuse AsanaAI pattern). **DoD:** all three surfaces show identical state within one tick; reconnect after drop recovers state without manual refresh.
- [ ] ★ **Broadcast graphics control surface** — operator triggers the ONE AR overlay + Simulcam + "show me why" (pilot: OBS/vMix; P2: Vizrt/Unreal). **DoD:** operator can show/hide each element on the live feed within latency budget.
- [ ] ★ **Second-screen app** — real-time fan leaderboard from published fan-safe projection (reuse leaderboard + charts + auth). **DoD:** fan view updates in real time and exposes *only* fan-safe fields (no raw officiating state).
- [ ] **Athlete/coach app extensions** — competitive history, deviation reports, training→competition continuity (reuse dashboard/stats/profile/phased flow). **DoD:** an athlete sees their pilot performance with deviation breakdown.
- [ ] **Design-system additions** — judge/confidence/degradation components, AR styling tokens, replay controls (extend sun design system). **DoD:** components in design system, used by console + graphics.
- [ ] ▸ **Fan prediction UI** (P2+). **DoD:** deferred — P2 spec.
- [ ] ▸ **Physiology broadcast widgets** (P2+) — HR/breathing/heatmap "estimated"-labelled overlays. **DoD:** deferred — P2 spec.

### 4.2 Workstream B — BACK-END

**Staffing:** 2 BE engineers (+0.5 infra shared). **Skills:** Postgres/Drizzle, append-only/hash-chained + signed data, gRPC↔Python, WebSocket fan-out, broadcast-grade reliability, security/roles.

- [ ] ★ **Scoring engine + rules DSL** — versioned, content-addressed rules; alignment-deviation (Procrustes + anthropometric norm + DTW vs ratified bands) + stability (jitter spectral analysis − estimator jitter + COM-sway proxy). **DoD:** same input + same rule version ⇒ identical deduction across runs/machines.
- [ ] ★ **Event/audit ledger** — append-only, hash-chained, signed; every score/override/confirm/protest/replay; `supersedes` linking for live→adjudicated and machine→override. **DoD:** any in-place mutation attempt is rejected; chain verification passes; override linkage queryable.
- [ ] ★ **Bit-reproducible replay service** — re-derive scores from (calibration_set, pose_frames, rule_versions, ledger). **DoD:** re-derivation on a clean machine is **bit-identical** (file 07); proven in CI on a fixture.
- [ ] ★ **Data platform + Drizzle schema** — tables per file 03; migrations; object-store frame pipeline; OLAP mirror + edge→cloud batch sync (after final). **DoD:** schema migrated forward+back; frames persist + retrieve at capture rate; sync runs without touching the live loop.
- [ ] ★ **APIs** — performance lifecycle, criteria scores, deductions, calibration sets; gRPC bridge to Python inference; WebSocket fan-out. **DoD:** inference→scoring round-trip works over gRPC under load; APIs contract-tested.
- [ ] ★ **Auth/roles** — extend JWT with judge / admin / broadcast-operator / fan; override authority gated to judge + logged. **DoD:** a non-judge override attempt is rejected and audited.
- [ ] ★ **Second-screen real-time service** — fan-safe projections + WebSocket fan-out, isolated from officiating loop. **DoD:** a fault injected in the fan service does not affect officiating; only fan-safe fields are published.
- [ ] ★ **Governance/consent** — consent scopes (broadcast/data/biometric) enforced at the API boundary; biometric gated. **DoD:** an API call exceeding granted consent scope is rejected.
- [ ] ▸ **Protest workflow** (P2 hardening) — protest → adjudicated re-run → signed resolution. **DoD:** deferred — P2.
- [ ] ▸ **Analytics/flywheel models** (P2+). **DoD:** deferred — P2.

### 4.3 Workstream C — AI/ML

**Staffing:** 2 ML engineers (one calibration/3D-geometry strong, one pose/training strong) + 1 infra/HW for TensorRT + rig. **Skills:** multi-view geometry, camera calibration, RTMPose/ViTPose + TensorRT, temporal filtering, inter-rater stats, bias/fairness eval.
**Hard dependency:** WS-C cannot validate anything before WS-D delivers a dataset and WS-C's own calibration passes its gate.

- [ ] ★ **Multi-cam calibration & triangulation** — Charuco intrinsics + bundle-adjustment extrinsics + PTP/genlock sync + lens-encoder ingest; reprojection-error gating; degradation on cam drop. **DoD:** calibration passes a reprojection-error threshold; pulling one cam triggers reduced-confidence/human-only without crash. **Blocks all downstream 3D/ML.**
- [ ] ★ **RTMPose live tier** — per-cam 2D, TensorRT FP16/INT8, meet ~40–60 ms (alert) / ~60–90 ms (AR). **DoD:** p95 within budget over ≥30 min continuous run at the rig.
- [ ] ★ **ViTPose adjudicated tier** — higher-accuracy 2D + volumetric refinement → signed deduction; runs on hold-window completion / on protest. **DoD:** adjudicated pass produces the deduction recorded in the ledger; demonstrably higher accuracy than live tier on gold set.
- [ ] ★ **3D pipeline** — triangulation to mm-space + temporal filter (Kalman / 1-Euro) with **estimator-jitter modelling** so stability isn't contaminated by tracker noise. **DoD:** on a static reference, residual estimator jitter is characterized and subtracted; stability output is stable for a known-still pose.
- [ ] ★ **Asana segmenter from existing classifier** — reuse TF.js classifier to mark held asana + hold-window boundaries (segmentation only). **DoD:** segmenter marks correct hold windows on multi-cam PTP-synced input; re-validated thresholds (old single-webcam thresholds rejected).
- [ ] ★ **Pose-template deviation scoring** — 3D skeleton vs judge-ratified joint-angle bands (Procrustes + anthropometric norm + DTW). **DoD:** deviation score correlates with judge labels on the gold set above the agreement threshold.
- [ ] ★ **Stability detection** — jitter spectral analysis (subtract estimator jitter) + COM-sway proxy. **DoD:** per-criterion stability value validated against judge labels on gold set.
- [ ] ★ **Explainability / deviation maps** — per-joint deviation viz + plain-language rationale powering "show me why" (LLM via model-agnostic gateway — file 06). **DoD:** for a real deduction, the explainer shows the responsible joints + a rationale a judge accepts as faithful.
- [ ] ★ **Judge-agreement eval** — ICC / Krippendorff α vs panel on the 2 criteria; per-athlete calibration; **stratified error reporting**. **DoD:** **P1 gate** — agreement ≥ pre-registered threshold AND subgroup parity within margin (file 04 §6 Crit. 2). Depends on WS-D dataset.
- [ ] ★ **Bias/fairness validation** — diverse coverage, per-athlete calibration, subgroup audit before any criterion goes live. **DoD:** no subgroup error exceeds the pre-registered margin; documented before go-live.
- [ ] **Drift monitoring** — track machine-vs-judge divergence + per-cam reprojection error over events; alert on drift. **DoD:** an injected drift triggers an alert.
- [ ] ▸ **Physiology estimation** (P2+) — rPPG HR, breathing, muscle-load heatmap (broadcast-only, "estimated", consent-gated). **DoD:** deferred — P2.
- [ ] ▸ **Audio instability events** (P2 musical) — discrete instability detection only. **DoD:** deferred — P2.
- [ ] ▸ **Pair/Group tracking** (P2/P3) — multi-athlete ID + occlusion + synchrony. **DoD:** deferred — P2/P3.

## 5. P1 entry gate — pre-conditions (mirror of file 04 §5)

P1 **does not start** until all of file 04 §5 A1–A7 are verified and signed off: HW in hand & burned-in (A1), venue + lighting (A2), athlete consent (A3), judge panel (A4), dataset at minimum size (A5), ratified reference bands (A6), on-prem self-sufficiency (A7). Owners and verification methods are in file 04 §5.

## 6. Procurement & lead-time risks (start day 0)

Procurement is **on the critical path** and the most common source of slip that engineering cannot recover. Order before, not after, the design is finalized where specs are stable.

| Item | Risk | Mitigation |
|---|---|---|
| **Machine-vision cameras (4 for P1, 6–8 for P2)** | Industrial cams + lenses have multi-week to multi-month lead times; B-stock scarcity. | Order P1 cams day 0; spec a model with stock availability; buy 1 spare; lock the same model for P2 to reuse calibration assumptions. |
| **GPU box (2× L40S)** | Datacenter GPU lead times and allocation are volatile. | Order day 0; have a fallback SKU (e.g., alternative Ada/Ampere) validated for TensorRT; cloud GPU only for *training*, never the on-prem loop. |
| **PTP grandmaster + genlock + capture/NVMe** | Sync hardware + high-throughput capture cards have lead time and integration quirks. | Order with cameras; bench-validate sync (A1) before any calibration work. |
| **Flight case / rig integration** | Custom rigging takes time; thermal/power in one case is non-trivial. | Prototype rig early; thermal-soak test before the pilot venue. |
| **BUY graphics (Vizrt/Unreal+Zero Density) & camera tracking (Mo-Sys/Stype)** | Licensing + integration lead time; vendor scheduling. | **Out of P1 critical path** (OBS/vMix + fixed cams). Start procurement/contracts during P1 so P2 is not blocked. |
| **Judge panel & venue** | People/venue scheduling, not hardware, but equally gating (A2, A4). | Book panel + venue + lighting at P0; they gate the dataset and the validation study. |

## 7. Staffing summary (minimum viable team for P0→P1)

| Workstream | P0 | P1 | Key skills |
|---|---|---|---|
| D — Data/Annotation | 1 lead + ≥3 judges (PT) + 0.5 data-eng | continues | judging domain, annotation ops, data eng, reliability stats |
| A — Front-end | 1 | 2 | Next.js/TS, real-time UI, broadcast UX |
| B — Back-end | 2 | 2 (+0.5 infra) | Postgres/Drizzle, signed/append-only data, gRPC, reliability |
| C — AI/ML | 1 | 2 + 1 infra/HW | multi-view geometry, calibration, TensorRT pose, fairness eval |

**Notes:** the single biggest under-staffing risk is treating **annotation** (WS-D) as a side task — it is the long pole and needs a dedicated lead plus committed judge time from P0. The second is assuming one ML engineer can own *both* calibration/3D-geometry and pose/training — these are distinct skill sets; split them.
