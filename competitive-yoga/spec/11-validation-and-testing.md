# 11 — Validation & Testing

> Internal build spec — forza.ventures Competitive Yoga platform.
> How we **prove** the system is correct enough to score a real competition. Audience: AI-ML / BE / QA / officiating leadership.
> Principle: we ship deductions of record. The bar is not "looks good on a demo" — it is **"measurably within human inter-rater variance, with calibrated abstention below the noise floor."** Nothing in 03/06 is "done" until it passes the gates here.

## 1. Accuracy validation (vs ground truth)

We characterise the estimator's error envelope before we ever let it deduct.

**Ground-truth capture (training/calibration environments only — never the competition floor).**
- **Marker-based optical (Vicon/OptiTrack class)** as primary biomechanical ground truth for joint angles.
- **IMU suits** for high-rate angular velocity / dynamic transitions where marker dropout is likely (inversions, deep twists).
- **Force plates** for centre-of-pressure → the stability / COM-sway proxy validation.
- Captures are **synchronised to our camera rig** (shared trigger + PTP) so each frame has a paired (markerless, ground-truth) sample.

**Targets (joint-angle RMSE vs ground truth, adjudicated tier):**
- Large **sagittal** angles (hip/knee/elbow/shoulder flexion-extension): **≤ 8° RMSE** (stretch ≤ 5°).
- **Rotational / axial** angles (internal-external rotation, spine twist): **≤ 15° RMSE**, target ≤ 12°. These are intrinsically harder and the deduction thresholds are set accordingly.
- Live tier is allowed ~1–3° wider and is **advisory only**.

**The ~5° noise-floor rule (normative).** Marker-based Vicon **self-disagrees 2–5°** on repeat trials — that is the irreducible measurement noise of the *ground truth itself*. Therefore:
- We **report RMSE with the ground-truth noise band subtracted/annotated**, never as if the camera error were absolute.
- **No deduction is issued on a joint-angle difference < 5°.** Validation explicitly verifies that the alignment rules never produce a magnitude inside the noise floor.

**Stratified error reporting (mandatory).** A single global RMSE hides bias. We report RMSE stratified by:
- **body type / anthropometrics** (limb-length ratios, BMI bands),
- **skin tone** (Fitzpatrick-binned) — keypoint detectors are known to degrade on underrepresented tones; this is a fairness, not just accuracy, requirement,
- **asana class** and **orientation** (upright / inverted / supine / prone / deep backbend),
- **camera-degradation state** (full / reduced).
A stratum that exceeds its RMSE target is a **release blocker for that stratum**, even if the global number passes.

## 2. Judge-agreement studies

The honest benchmark is not "perfect" — it is **"at least as consistent as human judges are with each other."**

- **Inter-rater reliability among humans first.** A panel of certified judges independently scores a held-out set; we compute **ICC(2,k)** for continuous criterion values and **Krippendorff's α** for ordinal/categorical decisions. This establishes the *human inter-rater variance band* — the floor we must reach.
- **Machine-vs-consensus protocol.** The machine score (adjudicated tier) is compared against the **judge consensus** (median / ratified value), blind — judges do not see the machine value when forming consensus.
- **Acceptance threshold:** machine-vs-consensus disagreement must fall **within the human inter-rater variance band** (its ICC/α with consensus ≥ the median human judge's). If the machine agrees with consensus *as well as a typical judge does*, it is fit to advise/deduct under judge confirmation.
- Studies are **re-run per major rule_version and per asana template set**, and the results are attached to the ratification record.

## 3. Scoring-engine test strategy

The scoring engine is pure, deterministic, and the part a protest is litigated against — it gets the heaviest test discipline.

- **Deterministic replay tests.** Given (calibration_set, frozen pose_frames, rule_versions, model manifest) the engine must reproduce **byte-identical scores and an identical deduction set** (doc 03 §4a). This runs in CI on every change.
- **Golden-round regression suite.** A library of fully-captured rounds with frozen skeletons + ratified expected scores/deductions. Any code/rule change is diffed against the golden outputs; an unexpected score change must be explained and re-ratified, never silently accepted.
- **Rule-DSL unit tests.** Each compiled rule has unit tests over its boundary behaviour: at-threshold, just-below-threshold (must NOT deduct), well-over, and noise-floor (<5° must NOT deduct). Threshold edges are tested to the parameter, not approximately.
- **Simulation / synthetic-data testing.** Programmatically generated skeletons with *known* injected deviations validate that a 10° hip deviation yields the expected magnitude, that DTW aligns time-warped holds correctly, and that anthropometric normalization removes body-size effects.
- **Property-based / fairness-invariant tests.** Generators assert invariants that must hold for *all* inputs:
  - **same form, different body → same score** (scale/limb-length-invariant after Procrustes + anthropometric normalization),
  - **mirror invariance** (left/right symmetric form scores symmetrically),
  - **monotonicity** (larger deviation never yields a smaller deduction),
  - **noise-floor invariance** (sub-5° perturbations never change a score),
  - **abstention safety** (low confidence / missing joint never fabricates a magnitude).
  Any counter-example found is a hard bug.

## 4. Real-time / load testing

- **Latency SLO verification.** Measure end-to-end on the pinned engine: referee alert **≤ 40–60 ms (p99)**, broadcast AR **≤ 60–90 ms glass-to-glass (p99)**. Reported as distributions, not means.
- **Soak tests.** Multi-hour continuous capture at full fps to catch memory growth, GPU thermal throttling (flight-case thermals), PTP drift accumulation, and ring-buffer/NVMe saturation.
- **Camera-failure chaos tests.** Inject camera drops, frame gaps, dropped keypoints, PTP-offset spikes, genlock unlock, and calibration drift **mid-round**; assert the §4b degradation matrix fires exactly — re-triangulation on remaining cams, correct `confidence_state` transitions, abstention rather than guessing, and referee alarms. The system must **never silently produce a deduction in a degraded state**.

## 5. Bias / fairness audit (release gate)

A formal bias audit is a **named release gate**, not a courtesy.
- Run the stratified accuracy (§1) and fairness-invariant (§3) suites across the demographic strata.
- **Gate:** no stratum's RMSE or false-deduction rate may exceed the global figure by more than a defined margin; the "same form / different body → same score" invariant must hold with zero counter-examples.
- Failing the audit **blocks release** regardless of aggregate metrics. The audit result and its remediation are recorded against the release.

## 6. Drift monitoring in production

Validation does not stop at ship — venues differ and rigs move.
- **Per-venue calibration validation** at install: reprojection error within gate (< 0.5 px / < 1.5 mm), sync-witness within budget (≤ 250 µs), confidence-calibration spot-check against a known reference pose. All recorded, signed.
- **Live calibration-drift monitor** (doc 03 §4c): continuous reprojection-residual check; >1.5× baseline → affected volume goes `reduced`, recalibration requested, drift logged.
- **Confidence-distribution monitoring.** The runtime distribution of calibrated confidence and abstention rate is compared to the validation baseline; an unexpected shift (e.g. abstention rate spikes, confidence skews high) raises an **alert** to the officiating operator and is a signal of lens/lighting/occlusion conditions outside the validated envelope.
- **Alerting** routes sync alarms, drift flags, and confidence-shift alerts to the referee console in real time.

## 7. Pilot exit criteria (measurable)

The Solo pilot (P1) is "successful" only if **all** hold on held-out data:
1. Adjudicated-tier joint-angle RMSE within §1 targets, **stratified** (no failing stratum).
2. Machine-vs-consensus agreement **within human inter-rater variance** (§2) on the pilot asana set.
3. **Zero** deductions issued inside the 5° noise floor across the golden-round + pilot corpus.
4. Latency SLOs met at p99 over a full pilot day soak.
5. Degradation matrix verified by chaos tests; **zero** silent deductions in degraded state.
6. Replay-equivalence: every pilot round replays to identical deductions; bias audit passed as a gate.
7. Judge panel signs off that machine-advised deductions are defensible with the §4d evidence.

## 8. Pre-event "go / no-go" checklist

Run on-site before the first scored round. Any **NO** = machine officiating is downgraded to advisory/human-only.
- [ ] Calibration captured this venue; reprojection error within gate; signed hash recorded.
- [ ] PTP grandmaster locked; per-camera offset ≤ ±150 µs; genlock locked on all metric cams.
- [ ] Sync-witness (clap/strobe) captured and within ≤ 250 µs budget.
- [ ] All 8 (or ≥6) cameras streaming at target fps; per-joint coverage (≥3 LoS) verified for canonical + inverted asanas.
- [ ] Pinned model manifest + rule_set loaded; hashes match the validated release; replay-equivalence smoke test passes on a reference round.
- [ ] Confidence-calibration spot-check passes on reference pose.
- [ ] Latency SLO smoke test passes on the live rig.
- [ ] Degradation drill: pull one camera, confirm correct `reduced` transition + referee alarm + no silent deduction.
- [ ] Edge NVMe free space ≥ one full event; audit-log signing key present; cloud sync confirmed **disabled** during live.
- [ ] Bias audit on file for this release; judge override path tested end-to-end.
