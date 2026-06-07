# 04 — Reuse Map & Pilot Scope

> What we reuse from AsanaAI vs what is genuinely new, the *integration cost* of that reuse, and the exact boundary of the P1 Solo pilot — with falsifiable success criteria, pre-conditions, and contingencies.

## 0. Honest framing

Two claims in this doc are easy to over-sell and are corrected here:

1. **"Reuse %" is not "work avoided %."** Reuse means we don't re-architect a shell or re-derive a schema. It does **not** mean zero cost: every reused asset must be re-skinned for new roles, re-secured for new threat surfaces (judges/operators, not just fans), load-tested for live broadcast, and wired to the new inference path. The reuse table below adds an explicit **integration effort** column. Treat the headline number as "surface area we don't redesign," not "weeks saved."
2. **The competitive inference path is ~all new and is the long pole.** No amount of AsanaAI reuse de-risks calibration, triangulation, two-tier pose, or the judge-agreement study. The pilot lives or dies on that path and on the **dataset** (file 05, WS-D), which gates everything downstream.

## 1. Reuse map by tier

AsanaAI baseline: Next.js 14 + TS shell, JWT auth, leaderboard, profiles/stats/achievements/diet, charts, self-hosted Postgres + Drizzle patterns, react-webcam capture, score-display state, and a TF.js **pose classifier** (asana + confidence — NOT a joint-angle regressor). The classifier is reused as an **asana SEGMENTER** (which pose is being held, when it starts/ends), never as a measurement source.

Integration effort legend: **S** = days, **M** = 1–3 weeks, **L** = 3–6 weeks, **XL** = new subsystem (months). Effort is *integration of the reused part only* — net-new build is sized in file 05.

| Tier | Reuses from AsanaAI | Integration effort of the reuse | New build |
|---|---|---|---|
| **Competitive inference** (2D→3D→scoring path) | classifier → **asana segmenter** only; react-webcam capture pattern (concept) | **M** — segmenter must be re-validated against PTP-synced multi-cam timing, not single-webcam; old confidence thresholds invalid | ~everything: multi-cam calibration, RTMPose/ViTPose TensorRT, triangulation, temporal filter, mm-space skeleton. **~0% of the inference path reuses.** |
| **Scoring engine** | Postgres/Drizzle persistence patterns, score-display state shape | **M** — patterns reused; but append-only + hash-chain + signing is a different write model than AsanaAI's mutable rows | rules-as-DSL, versioned/append-only signed ledger, hybrid machine+judge merge, bit-reproducible replay |
| **Referee dashboard** | Next.js shell, JWT auth, charts, score-display state, design system | **L** — shell reused but auth gains judge/operator roles + override authority audit; new real-time WS state; broadcast-grade reliability needs | judge roles, override UI, replay/Simulcam viewer, confidence/degradation indicators, WebSocket live state |
| **Broadcast graphics** | score-display state shape (source of truth for lower-thirds) | **L** — state shape reused; everything that *renders* it (compositor, ghost, explainer) is new and integration with OBS/vMix (pilot) is non-trivial | AR overlay compositor integration, Simulcam ghost, "show me why" explainer, graphics-control surface |
| **Second-screen** | Next.js shell, JWT auth, **leaderboard component**, charts, profiles | **M** — components reused; fan-out at broadcast scale + strict isolation from officiating loop + fan-safe projection filter are new | real-time fan service, fan predictions, fan-safe published projections, WebSocket fan-out |
| **Data platform** | Postgres/Drizzle schema patterns, existing migrations workflow | **L** — schema/migration *workflow* reused; OLAP mirror, object-store frame pipeline (high-volume binary), and edge→cloud sync are net-new subsystems | OLAP mirror, object-store frame pipeline, flywheel/analytics models, batch edge→cloud sync |
| **Training / calibration mode** | dashboard, stats, achievements, diet, profile, **phased practice flow**, classifier, react-webcam, charts | **M** — UI reused heavily; the data it now produces must be schema-correct, consented, and dataset-eligible (provenance/labels), which is new plumbing | single-cam→multi-cam calibration tooling, deviation feedback UI, optional wearable/IMU ingest (training only) |

**Net (honest):** AsanaAI reuse covers **~70% of the *UI/shell/auth/persistence surface area*** across athlete/coach/fan/training/data tiers — i.e., we don't redesign those. It reuses **~0% of the competitive inference path** and saves **roughly 30–40% of *engineering effort* on the reusing tiers** (not 70%), because integration, hardening, and security re-work are real. The headline 70% is a *scope/surface* claim, not a schedule claim.

## 2. Pilot scope (P1 — Solo)

The pilot proves the hard, novel core end-to-end at the smallest defensible scale: one mat, one athlete, the full two-tier loop on a narrow but real criterion set, with auditable replay and a referee override.

**Why this is the minimal defensible scope:** it is the smallest configuration that still exercises *every* genuinely risky subsystem at least once — multi-cam 3D, two-tier inference, deterministic scoring + ledger, replay, degradation, and a human override path. Cutting any of these would prove a demo, not the system. Cutting the *number* of formats (Solo only), criteria (1–2), cameras (4), AR overlays (1), and graphics integration (OBS/vMix stand-in) is where we keep scope minimal — not by cutting risky subsystems.

### Honest scoring scope (what the machine actually scores in P1)
- **Auto-scorable in P1:** Solo, **held upright** poses on the **2 objective criteria** (alignment deviation, stability). This is the only thing the machine produces a *signed deduction* for.
- **Human-judged (machine assist only):** contact poses, inversions, transitions, and artistry — out of machine scoring for P1; machine may show overlays but issues no deduction.
- **Broadcast-only / estimated (not in P1):** physiology (HR, breathing, muscle load) — P2+, always labelled "estimated," never affects score.

### Physical / infra
- **Solo format**, single mat, **4 calibrated cameras** (machine-vision, PTP-synced, genlock).
- **1 GPU box, 2× NVIDIA L40S**, TensorRT.
- PTP/genlock clock + NVMe replay store. Whole rig = **one flight case**.
- Charuco intrinsics + bundle-adjustment extrinsics + owned competition-zone lighting; ~2 hr per-venue setup (target — see contingency C6).

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
- Two-tier inference for **alignment deviation + stability** (held-upright poses only).
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
- Contact poses, inversions, transitions, artistry as *machine-scored* (human-judged in P1).
- 6–8 camera array (4 only).
- Physiology broadcast estimates (rPPG HR, breathing, muscle heatmap) — P2+.
- Audio-driven instability events — P2+.
- Vizrt/Unreal+Zero Density full graphics integration — OBS/vMix stand-in for pilot.
- Mo-Sys/Stype camera tracking for PTZ AR — fixed/locked cams in pilot.
- OB van / vision-mixer integration — pilot uses OBS/vMix.
- Wearables/IMU/force-plate/EMG at competition (training/calibration only, and optional even there).
- Full cloud OLAP analytics product and fan prediction game economy.
- Talent-funnel and monetization surfaces.

## 5. Pilot pre-conditions & assumptions

The pilot **cannot start** (and the success criteria are not interpretable) unless these hold. Each is owned and checked at the P1 entry gate (file 05 §5).

| # | Pre-condition / assumption | Why it gates the pilot | Owner | Verified by |
|---|---|---|---|---|
| A1 | **Hardware in hand & burned-in:** 4 machine-vision cams, GPU box (2× L40S), PTP grandmaster/genlock, NVMe store — procured, received, and bench-validated. | Long lead items (see file 05 procurement risks); 3D is impossible without synced cams. | Hardware lead | Bench test: 4-cam PTP sync within tolerance, sustained capture to NVMe. |
| A2 | **Venue access with lighting control** for setup + dry-run + pilot dates, contractually confirmed. | Calibration accuracy and pose quality depend on controlled, owned lighting; uncontrolled venue light invalidates reference bands. | Program lead | Signed venue agreement + lighting rig confirmed on site. |
| A3 | **Athlete consent** (broadcast + data/biometric scopes) signed by all pilot athletes; ethics/governance sign-off for the dataset. | Legal pre-req for capture, dataset use, and any biometric; consent gating is enforced in-product. | Legal/governance | Signed consent records linked to athlete IDs. |
| A4 | **Judge panel committed** (≥3 qualified judges) for the labelling study and the judge-agreement validation. | No panel ⇒ no ground truth ⇒ criterion #2 (judge-agreement) is untestable. | Program lead | Panel scheduled; labelling protocol agreed. |
| A5 | **Labelled solo dataset exists and is diverse** (P0 deliverable) with stratification metadata (demographic/anthropometric) — meets the minimum size agreed in the eval plan. | Models cannot be trained or validated without it; it gates judge-agreement and bias checks. | ML lead | Dataset card: size, diversity coverage, label QA pass. |
| A6 | **Judge-ratified reference bands** for the 2 criteria exist and are version-pinned. | Deviation scoring compares against these; unratified bands make deductions indefensible. | Head judge + ML lead | Ratified bands committed under a rule version. |
| A7 | **On-prem network is self-sufficient** (officiating loop needs no cloud at runtime). | Criterion #5 (on-prem independence) and broadcast reliability. | Infra lead | Loop runs with uplink physically pulled (dry run). |

Standing assumptions: (i) two-tier inference (live RTMPose / adjudicated ViTPose) is the chosen approach; (ii) multi-camera 3D is required (no monocular fallback for scoring); (iii) graphics and camera-tracking are **BUY** (Vizrt/Unreal+Zero Density, Mo-Sys/Stype) and out of the P1 critical path via OBS/vMix + fixed cams; (iv) inference/scoring/data/dashboards are **BUILD**.

## 6. Pilot success criteria (measurable & falsifiable)

Each criterion is PASS/FAIL with a number or a demonstrable artifact. "Validated to the panel's satisfaction" is **not** a criterion.

1. **Latency targets met (numeric, end-to-end at the rig).**
   - PASS: live-tier **referee alert p95 ≤ 60 ms** (target 40–60) and **broadcast AR p95 ≤ 90 ms** (target 60–90), measured glass-to-glass over ≥30 min of continuous operation.
   - FAIL: p95 over budget, or only mean (not p95) achievable.
2. **Judge-agreement validated (numeric threshold, pre-registered).**
   - PASS: machine vs panel on each of the 2 criteria reaches **ICC(2,k) ≥ 0.75** (or Krippendorff α ≥ 0.75 for ordinal deductions) on the held-out labelled solo set, **and** no demographic/anthropometric subgroup's error exceeds the overall error by more than a pre-registered margin (e.g., ≤ 1.5×).
   - FAIL: either the agreement threshold or the subgroup-parity margin is missed. *(Threshold value to be fixed with the head judge before the study — pre-registered, not tuned after seeing results.)*
3. **Auditable replay demonstrated (bit-identical, witnessed).**
   - PASS: a recorded deduction is re-derived **bit-identically** from `(calibration_set, pose_frames, rule_versions, event_log)` on a clean machine, **and** a referee override is shown fully logged with judge authority and `supersedes` linkage in the signed ledger.
   - FAIL: any non-determinism in re-derivation, or any override missing authority/audit.
4. **Graceful degradation demonstrated (live, no crash, no silent guess).**
   - PASS: one camera is physically pulled mid-run → system flags reduced-confidence / human-only for the affected criterion within a bounded window, continues for unaffected criteria, and never emits a confident score it cannot support.
   - FAIL: crash, hang, or a confident score on degraded input.
5. **On-prem independence demonstrated.**
   - PASS: full officiating loop (capture→score→ledger→console→graphics→replay) runs with the cloud uplink **physically disconnected** for the duration of a full performance.
   - FAIL: any officiating function requires the uplink.
6. **Setup feasibility demonstrated.**
   - PASS: the calibration runbook is executed by the **broadcast engineer** (not the dev team) at a **non-home venue** and reaches "ready to score" with calibration passing reprojection-error gates. Record actual wall-clock time.
   - FAIL: cannot be completed by non-dev staff, or calibration fails the gate. *(Target ~2 hr; the binary pass is "non-dev completion + calibration gate," with measured time reported — see C6 if it overruns.)*

## 7. Contingencies — what we do if the pilot misses a criterion

The pilot is a *learning instrument*, not a launch. Each criterion has a defined response so a miss is informative, not fatal.

| Crit. | If missed | Response |
|---|---|---|
| C1 (latency) | Live tier over budget | Drop AR overlay to "alert-only" mode; profile pipeline; try INT8 RTMPose / smaller input res / batched triangulation; raise alert-only as the broadcast-acceptable floor before adding AR back. |
| C2 (judge-agreement) | Threshold or subgroup parity missed | Keep that criterion **machine-assist, human-decides** (no signed deduction); expand/rebalance dataset (WS-D); per-athlete calibration; re-run study. Ship only the criterion that passes — even one passing criterion validates the loop. |
| C3 (replay) | Non-determinism found | Hard stop on shipping signed deductions until fixed; determinism is non-negotiable for officiating. Pin library/CUDA versions, eliminate nondeterministic kernels, snapshot full input set. |
| C4 (degradation) | Crash / silent guess | Hard stop; add explicit confidence-floor + camera-health watchdog; degradation must be a designed state, not an emergent one. |
| C5 (on-prem) | Needs uplink | Identify the cloud dependency and move it on-prem or cache it; broadcast officiating must never depend on a network. |
| C6 (setup) | Overruns ~2 hr or needs dev help | Acceptable to ship pilot at longer setup time if calibration gate passes; track as a productization item (better runbook, jigs, pre-rigged flight case) for P2. Not a pilot blocker by itself. |
| **Multi-cam 3D underperforms overall** (root cause behind C1/C2) | 4-view triangulation too noisy/occluded for defensible mm-space scoring | **Fallback ladder:** (a) add a 5th–6th camera at the worst occlusion angle (cheap relative to redesign); (b) restrict P1 scoring to the pose set where 4-view geometry is well-conditioned and defer the rest; (c) lean harder on the adjudicated ViTPose + volumetric refinement tier and make the *live* tier alert-only; (d) if none suffice, re-scope P1 to a single criterion + assist mode and treat full auto-scoring as a P2 research item. There is **no monocular fallback** — Solo auto-scoring requires multi-cam 3D, so the fallback is *more cameras / narrower pose set / human-decides*, never single-camera. |
