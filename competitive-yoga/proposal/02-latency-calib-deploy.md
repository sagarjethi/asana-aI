# Latency, Calibration & Deployment

## (a) Latency expectations

There are two latency-critical paths, and they have **different budgets, different consumers and different failure consequences**. Conflating them is the most common mistake in sports-graphics tenders, so we separate them explicitly.

### Path 1 — Broadcast AR (glass-to-glass, ~60-90ms)

The AR overlay must appear locked to the athlete on the program feed. This is absorbed by the **broadcast delay line** — the few frames of buffering already present in any live broadcast chain. As long as our overlay lands inside that delay budget, it is invisible to the viewer.

| Stage | Budget |
|-------|--------|
| Camera capture + readout | ~8-16ms |
| Ingest, sync, colour | ~5-10ms |
| LIVE-tier inference (RTMPose) | ~20-35ms |
| Triangulation (live subset) + AR solve | ~10-15ms |
| Graphics composite + key | ~10-15ms |
| **Total glass-to-glass** | **~60-90ms** |

This comfortably fits within a standard broadcast delay line, so the overlay tracks the athlete on air without perceptible lag.

### Path 2 — Referee alert (capture → score, ~40-60ms)

The officiating loop does **not** render graphics; it computes a candidate value and surfaces it to the dashboard. It is shorter than the broadcast path because it skips compositing and keying.

| Stage | Budget |
|-------|--------|
| Capture + readout | ~8-16ms |
| Sync + ingest | ~5-10ms |
| Inference (live tier for alerts) | ~20-30ms |
| Triangulation + threshold check | ~7-14ms |
| **Total capture → alert** | **~40-60ms** |

Note: the *official* deduction comes from the **ADJUDICATED tier**, which is deliberately off the real-time clock (seconds, replayable) — accuracy over speed, as set out in the Technical Approach. The 40-60ms figure is for the *live alert* that draws a judge's attention; the binding number is computed and signed asynchronously.

### Why the officiating loop is on-prem / edge, not cloud

A cloud round-trip adds tens of milliseconds in the best case and, far worse, depends on an internet uplink. **An uplink failure mid-final is unacceptable** — the competition cannot stop because a connection dropped, and a contested score cannot hinge on a packet that did not arrive. The entire officiating-critical span (capture → sync → inference → triangulation → scoring → replay) therefore runs on venue edge hardware and continues to function with the uplink severed. The cloud platform receives signed results asynchronously for history, training and the consumer flywheel — never on the live loop.

## (b) Calibration approach

Calibration is where measurement credibility is won or lost. Our approach is a documented, repeatable per-venue procedure.

- **Per-camera intrinsics (Charuco).** Each camera's focal length, principal point and lens distortion are measured with a Charuco board. This corrects the lens before any 3D maths.
- **Extrinsics via bundle adjustment.** The relative position and orientation of every camera is solved jointly by bundle adjustment, producing a globally consistent multi-camera geometry — the prerequisite for accurate triangulation.
- **Hardware time-sync (PTP IEEE-1588 / genlock).** All cameras are frame-locked. Without sub-frame synchronisation, a moving limb is sampled at different instants by different cameras and triangulation smears. PTP (or genlock where the camera supports it) eliminates this.
- **Owning the lighting.** The venue specification mandates controlled, even lighting in the competition zone. We do not accept "whatever the arena has" — inconsistent or coloured stage lighting degrades pose estimation, so competition-zone lighting is part of the contract, not an afterthought.
- **Athlete-size variance — anthropometric normalisation.** Athletes differ in limb length and proportion. Scores are computed on **anthropometrically normalised** skeletons so a tall and a short athlete are judged on the same geometric basis, not on absolute distances.
- **PTZ lens-encoder data for AR.** For tracked/PTZ cameras feeding the broadcast overlay, real-time lens-encoder data (via Mo-Sys / Stype) keeps the AR graphics registered as the camera pans, tilts and zooms.
- **Per-venue setup ~2 hours + a calibration runbook.** Setup is roughly two hours, executed against a written runbook (board capture, bundle solve, sync verification, lighting check, validation pose). The runbook makes the process repeatable across venues and crews and produces a recorded calibration artefact stored with the event.
- **Graceful degradation.** If a camera drops or confidence falls below threshold (occlusion, glare, an athlete in a deep inversion), the system **flags "reduced confidence / human-only" rather than emitting a wrong number.** A missing camera narrows the reliable measurement set; the honest response is to defer to the human judge for affected criteria, not to guess.

A standing fairness commitment underpins all of the above: pose models degrade on darker skin tones, loose clothing and inversions, so we maintain a labelled diverse dataset, support per-athlete calibration, run a human-judge agreement study (ICC / Krippendorff α) and report error **stratified** across athlete demographics — not as a single headline number.

## (c) Deployment plan

We deploy in phases that build trust before they build scale.

### Phase 0 — Training / calibration mode
Reuse-heavy and dataset-building. Wearables are permitted here (training/calibration only — the live competition is camera-only). We harden the pipeline, build a diverse labelled dataset, validate the calibration runbook and run the initial human-judge agreement study. **Outcome:** a calibrated pipeline and a fairness baseline.

### Phase 1 — Solo pilot (the proof)
4 cameras, one GPU box, 1-2 objective criteria, one AR overlay, one Simulcam ghost. The goal is narrow and decisive: **prove latency and auditability on a real competition feed.** We demonstrate glass-to-glass AR inside the delay line, capture-to-alert officiating latency, and bit-reproducible replay of a signed deduction. **Outcome:** a federation-ratifiable proof on a live feed.

### Phase 2 — Multi-format
6-8 cameras. Add Pair, add Musical beat-sync scoring, deliver the full referee dashboard fusing objective values and human marks. **Outcome:** production-grade officiating for 1-2 athletes across both categories.

### Phase 3 — Group of 5
Multi-person tracking for graphics and per-athlete indicators. Contact poses remain human-judged at launch; machine coverage expands only as validation justifies. **Outcome:** full-format coverage.

### Venue edge hardware footprint (Phase 1 pilot)

Everything below ships in roughly **one flight case / rack**:

| Item | Spec | Role |
|------|------|------|
| GPU server | 1× server, 2× NVIDIA L40S | Live + adjudicated inference, triangulation, scoring |
| Ingest node | 1× | Camera ingest, PTP frame alignment, colour |
| PTP clock | IEEE-1588 grandmaster | Sub-frame camera synchronisation |
| Machine-vision cameras | ~4 | Multi-view capture |
| Graphics workstation | 1× | Vizrt / Unreal + Zero Density composite & key |
| NVMe replay store | High-throughput NVMe | Bit-reproducible replay / Simulcam, protest archive |

### Key milestones & dependencies

| Milestone | Depends on |
|-----------|-----------|
| Calibration runbook signed off | Phase 0 dataset + venue lighting spec agreed |
| Live-feed latency demonstrated | Edge hardware on site, PTP sync verified |
| Signed reproducible deduction | Scoring DSL ratified by judging panel |
| Judge-agreement study (ICC/α) | Diverse labelled dataset from Phase 0 |
| Phase 2 go / no-go | Federation sign-off on Phase 1 proof |

The critical dependencies are deliberately front-loaded: panel-ratified scoring rules, an agreed venue specification (lighting, power, camera positions) and a diverse dataset. Resolve those in Phase 0 and the later phases are execution, not invention.
