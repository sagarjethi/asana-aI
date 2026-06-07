# 08 — Non-Functional Requirements, Reliability & SLOs

> Engineering-grade reliability spec for the Competitive Yoga platform. Audience: SRE / BE / AI-ML / Broadcast. Reads against `03-architecture-data.md` (two-tier inference, on-prem edge officiating loop, append-only signed ledger) and `07-team-process-sdlc.md` (environments, freeze, on-call).

The product earns revenue on three surfaces (federation officiating contracts, the SaaS data platform, second-screen). The officiating contract is the one with **integrity and uptime obligations during a live broadcast**, so the SLOs are split into **live-event-critical** and **post-event analytics** classes, with very different error budgets.

## 1. SLOs

### 1.1 The critical window

The "availability target" for officiating is **not** a calendar-month 99.x figure. It is **availability during the critical window** — from first performance to final score published, per event. A 10-minute outage at 02:00 between events costs nothing; a 10-second officiating stall during a final is a contractual failure. We therefore budget per-event.

### 1.2 Live-event-critical SLOs

| SLO | Target | Measured as | Error budget (per event) |
|---|---|---|---|
| Officiating-loop latency (inference → referee alert) | p99 ≤ 60 ms, p50 ≤ 40 ms | capture timestamp → alert render on referee console | ≤ 1% of frames over 60 ms |
| AR overlay latency (glass-to-glass) | p99 ≤ 90 ms, p50 ≤ 60 ms | camera shutter → composited overlay on program feed | ≤ 1% of frames over 90 ms; AR is advisory/cosmetic, never blocks the deduction |
| Adjudicated-tier turnaround | ≤ 8 s p95 per hold-window | hold-window close → signed deduction available | ≤ 5% over 8 s |
| Officiating availability (critical window) | ≥ 99.95% of the live window with a usable scoring path | seconds the system can produce/confirm an authoritative score (incl. graceful human-only) | ≤ ~3 s "no usable path" per event-hour |
| Ledger write success | 100% (no lost authoritative event) | every score/override/confirm durably committed + hash-chained | **zero**; a lost authoritative event is a SEV-1 |
| Audit-ledger durability | 11 nines design target (≥ 99.999999999%) | post-event replicated copies + offsite | zero acceptable loss; protest-grade |

Note the asymmetry: **latency may degrade to human-only and still count as "available"** (the head judge can score), but **the ledger may never lose or mutate an authoritative event**. Integrity is non-negotiable; latency is degradable.

### 1.3 Post-event analytics SLOs (prod-cloud)

| SLO | Target |
|---|---|
| Second-screen API availability | 99.9% monthly |
| Second-screen leaderboard freshness | ≤ 5 s after authoritative publish |
| OLAP / data-flywheel pipeline | 99.5% monthly; freshness ≤ 1 h after final closes |
| Cloud sync of edge ledger → cloud mirror | completes ≤ 30 min after final; verified hash-equal |

These run on standard monthly error budgets and a normal on-call rotation. They are explicitly **off the officiating critical path** (03 §1), so a cloud outage never affects scoring.

## 2. Reliability architecture

The officiating loop has **no single point of failure**. Every stage from capture to ledger has redundancy or a defined degradation.

- **Dual capture / camera redundancy.** 6–8 cameras give geometric over-determination: triangulation needs ≥ 2 views per joint, so the rig tolerates camera loss. On drop, per-joint `triangulation_confidence` falls and the degradation matrix (03 §4b) flags affected criteria reduced-confidence.
- **Dual GPU inference.** Primary and standby GPU inference nodes run the identical pinned TensorRT engines. The standby is **hot** (warmed, engines loaded, consuming the same PTP-stamped stream in shadow) so failover is a feed-switch, not a cold start.
- **Hot/warm standby edge stack.** Primary edge stack (capture, inference, scoring engine, edge Postgres, NVMe replay) has a **warm-standby** twin running the same signed bundle (07 §6.2). The scoring engine + ledger writer are hot-replicated; failover promotes the standby and is itself a ledger event.
- **Ledger has no SPOF.** The append-only signed ledger is written to edge Postgres with synchronous replication to the standby before the write is acknowledged authoritative. Hash-chaining (`prev_hash`) makes any gap or reordering detectable.
- **Graceful degradation to human-only judging.** The terminal fallback is always the head judge. If inference, triangulation, or confidence collapses, affected criteria drop to `human_only` (03 §5); the system **abstains rather than guesses**, and officiating remains "available" because a human scoring path exists. This is the ultimate redundancy and the reason availability can stay ≥ 99.95% even through hardware failure.
- **PTP/genlock redundancy.** Grandmaster clock with a backup time source; loss of sync flags frames rather than scoring on skewed timestamps.

## 3. Capacity planning

Worked numbers for the design point (8 cameras, 4K, 60 fps). Treat as the sizing envelope; the pilot (P1 Solo) runs a smaller rig but the same math.

**Capture bandwidth (raw, uncompressed).** 4K (3840×2160) × 3 ch × ~10-bit ≈ 4 B/px → 3840×2160×4 ≈ **33.2 MB/frame**. At 60 fps: ~1.99 GB/s per camera → **~16 GB/s for 8 cameras** on the internal capture fabric. This is why capture/inference is on-prem on a dedicated fabric (10/25/100 GbE or CoaXPress), not a cloud uplink. Compressed transport (SRT/NDI) to the OB van is a fraction of this; the raw firehose stays inside the flight case.

**GPU compute.** 2D pose (RTMPose-class, TensorRT FP16/INT8) costs on the order of single-digit GFLOPs/inference at the working resolution. 8 streams × 60 fps = **480 inferences/s** plus triangulation + temporal filtering. Budget the inference tier at the order of **a few hundred TFLOP/s sustained** to hold the p99 ≤ 60 ms latency with headroom — i.e. 1–2 modern data-center-class GPUs per node, doubled for the hot standby (so ~2–4 GPUs total in the flight case). INT8 on the live tier buys the latency headroom; the adjudicated tier (ViTPose + volumetric) runs off the critical path and can take seconds.

**Storage / retention.**
- *3D skeleton frames:* a frame of ~30 joints × (x,y,z mm + confidence) ≈ a few KB JSON / <1 KB packed. 60 fps × ~hundreds of s of performance per round → tens of MB per athlete-round. Cheap; kept long for the data flywheel.
- *Raw/near-raw video (evidence):* the real cost. At ~1–2 GB/s per camera, even compressed evidence clips for protest windows are GB-scale per round. Edge NVMe holds the **hot replay set for the live event** (size the NVMe for one full event of evidence clips + skeletons, low TB); cold copies batch to S3-class object store after the final (03 §7).
- *Retention:* skeletons + ledger retained per the governance schedule (09); raw evidence video retained only as long as the protest window + governance retention require, then deleted — see 09 retention/erasure. Retention is both a cost lever and a privacy obligation.

## 4. Observability

Three pillars, with event-time alerting distinct from background alerting.

- **Metrics:** per-stage latency histograms (capture, inference, triangulation, scoring, ledger commit), per-camera reprojection error, frame-drop rate, GPU/PTP health, ledger write latency, failover state, machine-vs-judge divergence.
- **Logs:** structured per stage; the **signed append-only ledger is itself the authoritative officiating log** (replay-grade, not just diagnostic).
- **Traces:** a single capture frame's path through inference → scoring → console/AR, to localize latency-budget breaches.

**Alarm DURING a live event** (paged to live-event on-call, 07 §6.3): officiating-loop p99 latency breach; any ledger write failure or hash-chain discontinuity (SEV-1); failover triggered; camera/PTP loss crossing the degradation threshold; **calibration drift** (rising reprojection error → recalibrate / degrade); **confidence-distribution shift** (the machine's confidence histogram moving away from its validated shape, the early-warning that the model is operating off-distribution — abstain rather than guess). Cosmetic AR/second-screen degradation pages only as SEV-2/3.

**Background alarms:** cloud sync lag, OLAP freshness, second-screen API SLO burn — normal rotation.

## 5. Disaster recovery & backup (audit ledger)

The audit ledger is the product's integrity asset — protests are adjudicated against it, and its credibility is what the federation is buying.

- **3-2-1 for the ledger:** synchronous edge replica (primary+standby) during the event; one-way verified batch sync to the cloud mirror after the final (hash-equal check); at least one offsite/immutable (WORM/object-lock) copy.
- **Tamper-evidence:** hash chain + signatures (09) make any post-hoc edit detectable; backups preserve the chain so a restored ledger is still verifiable.
- **DR targets:** ledger **RPO = 0** (synchronous replication, no acknowledged-but-lost authoritative event); ledger **RTO ≤ failover window** at the edge (seconds, warm standby). Cloud-mirror RPO ≤ 30 min / RTO ≤ a few hours (analytics, non-critical).
- **Replay DR:** because replay is deterministic from (calibration_set, pose_frames refs, rule_versions, ledger), the protest-replay capability survives any single-site loss as long as one verified ledger copy + its referenced cold frames survive.

## 6. Performance budgets

End-to-end budgets are owned per stage so a regression is attributable: capture+sync ≤ ~10 ms, inference ≤ ~25 ms, triangulation+filter ≤ ~15 ms, scoring+alert render ≤ ~10 ms → within the ≤ 60 ms officiating-alert envelope; the AR compositing path carries the extra to ≤ 90 ms glass-to-glass. CI acceptance gates (07 §4) fail any build that exceeds its stage budget or the judge-agreement threshold. Performance budgets are versioned with the rule set so a model/rule change that buys accuracy at a latency cost is an explicit, reviewed trade — never a silent regression.
