# 07 — Team, Roles & Software-Development Process

> The client-facing review loop, team roles, SDLC, engineering practices, and change-control process.

## 1. The client-facing review loop

The stakeholder asked for a tight loop where a client-facing analyst owns requirements and translates client feedback into scoped changes that move toward the production "end game", a builder/tech lead owns delivery and technical decisions, and the client (or a third-party reviewer) reviews each increment and requests changes.

```
        ┌───────────────────────────────────────────────────────────┐
        │                                                           │
        ▼                                                           │
 ┌──────────────────────┐    scoped change requests / specs   ┌──────────────────────┐
 │  SENIOR PROJECT       │ ──────────────────────────────────▶│  BUILDER / TECH LEAD  │
 │  ANALYST              │                                     │  (owns delivery &     │
 │  (client-facing;      │ ◀──────────────────────────────────│   technical decisions)│
 │   owns requirements,  │   estimates, feasibility, demos     └──────────┬───────────┘
 │   change requests,    │                                                │ ships increment
 │   end-game roadmap)   │                                                ▼
 └──────────┬───────────┘                                     ┌──────────────────────┐
            │  presents increment + collects feedback         │  WORKING INCREMENT    │
            ▼                                                  │  (pilot build, demo)  │
 ┌──────────────────────┐    reviews, requests changes        └──────────┬───────────┘
 │  CLIENT / 3RD-PARTY   │ ◀──────────────────────────────────────────────┘
 │  REVIEWER             │ ──────────────────────────────────▶  feedback back to ANALYST
 └──────────────────────┘   (loop repeats toward production end-game)
```

The analyst is the single client interface: requirements in, demos out, change requests scoped. The tech lead is the single delivery authority: estimates, feasibility, and technical decisions. The client reviews increments and requests changes; nothing reaches the build queue unscoped.

## 2. Roles

| Role | Owns |
|---|---|
| **Senior Project Analyst** (client-facing) | Requirements, change requests, client communication, roadmap toward production end-game, acceptance sign-off coordination |
| **Builder / Tech Lead** | Technical decisions, architecture adherence, delivery, estimates, breaking work into the three workstreams |
| **Front-End Engineer(s)** | Referee console, graphics control, second-screen, athlete/coach app, design system, WebSocket state, replay viewer |
| **Back-End Engineer(s)** | Scoring engine + DSL, audit ledger, data platform/Drizzle, APIs, auth/roles, second-screen service, governance |
| **AI/ML Engineer(s)** | Calibration/triangulation, RTMPose/ViTPose tiers, segmenter, deviation+stability scoring, explainability, dataset/eval, fairness, drift |
| **Broadcast Engineer** | Cameras, genlock/PTP, transport (SDI/NDI/SRT), graphics/camera-tracking integration, ~2 hr venue setup runbook |
| **UX Designer** | Referee/judge flows, AR overlay + explainer UX, second-screen, design-system additions |
| **QA Engineer** | Test strategy, latency/accuracy acceptance gates, replay/audit as testable artifact, regression suite |
| **Data-Governance Lead** | Consent scopes, fairness/bias study oversight, biometric-estimation policy, audit/retention |

## 3. SDLC

1. **Discovery** — analyst + tech lead capture requirements, constraints (camera-only, on-prem, latency, auditability) and the production end-game with the client.
2. **Design / Spec** — these spec documents (03–07). Tech lead locks architecture; analyst confirms scope with client.
3. **Pilot build** — P0 data foundation then P1 Solo pilot per file 05; workstreams run in parallel against pilot-critical (`★`) tasks.
4. **Client review & change control** — client/3rd-party reviewer reviews each increment; change requests enter the change-management process (§5).
5. **Iterate** — scoped changes built, re-demoed, re-reviewed; loop toward acceptance.
6. **Scale to production** — P2 multi-format → P3 Group, each gated by its exit criteria and the latency/accuracy acceptance gates.

## 4. Engineering practices

- **Git branching** — trunk-based with short-lived feature branches off `main`; PR + review required; no direct pushes to `main`.
- **CI/CD** — automated build/lint/test on every PR; tagged releases per phase milestone.
- **Automated tests** — unit (scoring DSL, triangulation math), integration (gRPC inference ↔ scoring ↔ ledger), end-to-end (capture → score → console).
- **Replay/audit as a first-class testable artifact** — golden test set: stored (calibration_set, pose_frames, rule_versions, ledger) must re-derive **bit-identical** scores in CI. Any rule change that alters historical scores fails CI unless it ships a new `rule_version` (old versions remain reproducible). This guarantees protest-grade reproducibility.
- **Staged / canary releases** — new rule versions and models run in **shadow mode** (scored, logged, not authoritative) against live performances before promotion; promotion is explicit and logged.
- **Observability / monitoring** — latency per pipeline stage, per-cam reprojection error, machine-vs-judge divergence (drift), GPU/PTP health; alerting at the edge.
- **Latency & accuracy acceptance gates** — a build cannot promote unless it meets the latency budgets (~40–60 ms alert / ~60–90 ms AR) and the judge-agreement threshold (ICC/Krippendorff α) with acceptable stratified subgroup error.

## 5. Change-management process

```
CLIENT REQUEST
     │  (analyst captures)
     ▼
ANALYSIS  ── analyst + tech lead assess scope, impact, fairness/audit implications
     │
     ▼
ESTIMATE  ── tech lead sizes effort, identifies workstream(s), risks, dependencies
     │
     ▼
APPROVAL  ── analyst presents scope+estimate to client; client approves / defers / rejects
     │  (approved)
     ▼
BUILD     ── branch → implement (★pilot-critical prioritized) → tests + acceptance gates
     │
     ▼
REVIEW    ── demo increment to client/3rd-party reviewer
     │
     ├── changes requested ──▶ back to ANALYSIS (loop)
     └── accepted ──────────▶ merge, release (canary→full), update roadmap
```

A change is never built before it is analyzed, estimated, and approved. Anything touching scoring rules additionally requires a new `rule_version` and a shadow-mode run before becoming authoritative — protecting reproducibility and protest integrity.

### 5a. Change-control under a live-event freeze

The analyst⇄builder⇄client loop is overlaid by a **freeze calendar** keyed to the federation's event schedule. A change request does not flow freely; it flows against the calendar:

```
                 ┌──────────────────── FREEZE CALENDAR (event-keyed) ────────────────────┐
   T-14d  ──────▶│ FEATURE FREEZE  : no new scope into the venue build; bugfix-only       │
   T-7d   ──────▶│ RULE FREEZE     : rule_version locked; no new authoritative rule/model │
   T-72h  ──────▶│ CONFIG FREEZE   : calibration plan, env config, secrets rotated+pinned │
   T-0    ──────▶│ HARD FREEZE     : event live — change board only; on-site rollback only │
   T+24h  ──────▶│ THAW            : post-event retro → change requests resume normal flow │
                 └────────────────────────────────────────────────────────────────────────┘
```

- A client change request received inside a freeze window is **captured and scoped by the analyst as normal**, but its APPROVAL gate is annotated with the freeze tier it lands in. The tech lead does not queue it for the imminent event; it targets the next thaw or a named future event.
- **Emergency exception:** a P1/safety/integrity defect inside Rule or Config freeze requires sign-off from tech lead + analyst + Data-Governance Lead (the **change board**, §7.3), a regression + shadow run, and an explicit ledger entry recording who authorized the in-freeze change.
- The freeze calendar is a shared artifact owned by the analyst (calendar) and tech lead (technical gates); the client sees freeze status on every change-request estimate.

## 6. Operational readiness

A v1 SDLC ends at "merged + released". This product is **deployed at the edge, at a live broadcast event, where you cannot hotfix mid-final**. Operational readiness is therefore a first-class part of the process, not an afterthought.

### 6.1 Environments

| Environment | Purpose | Topology | Data | Promotion in |
|---|---|---|---|---|
| **dev** | Local + CI; engineers and ML iterate | Cloud / laptop GPUs; synthetic + recorded clips | Synthetic, anonymized | PR + CI green |
| **staging** | Production-faithful rehearsal; full pipeline replay; acceptance gates | Mirrors edge flight-case spec (same GPU class, same TensorRT, same Postgres/Drizzle) | De-identified golden replay sets | Tagged release + gates pass |
| **venue-edge** | The on-prem officiating loop deployed in the flight case at the venue | 6–8 cams, dual GPU, edge Postgres, NVMe replay store | Live event data (special-category) | **Pinned** release promoted from staging only, before Config freeze |
| **prod-cloud** | Post-live analytics, second-screen fan-out, OLAP, data flywheel | Cloud (AsanaAI stack: Next.js/Express/Drizzle/Postgres/JWT) | One-way batch sync after final closes | Independent cadence — never on officiating critical path |

Key rule: **venue-edge and prod-cloud release on different clocks.** Edge is frozen and pinned for the event; cloud (second-screen, analytics) can ship continuously because it is off the officiating critical path. The two never share a deploy pipeline.

### 6.2 Release management for an edge-at-a-live-event system

- **Immutable pinned build.** The venue-edge release is a pinned bundle: app images, model weights, TensorRT engines, kernel/driver versions, rule_version set, and config — all content-addressed and signed. The exact bundle that passed staging acceptance is the bundle that ships; nothing is built on-site.
- **Pre-event freeze.** Governed by §5a. By Config freeze (T-72h) the bundle is sealed and identical on primary and standby hardware.
- **On-site rollback, not roll-forward.** During the event the only intervention is **rollback to the last-known-good pinned bundle** (kept warm on the standby) and **failover**. No new code is compiled, patched, or pulled at the venue. Roll-forward fixes are forbidden until thaw.
- **Dual-system redundancy.** Primary and warm-standby edge stacks run the identical pinned bundle (hot/warm per 08). Failover is a runbook step, sub-event-window, and produces a ledger entry. See `08-nfr-reliability-slo.md` for the redundancy/SLO detail.
- **Promotion record.** Every promotion to venue-edge is logged with the bundle hash, the staging acceptance run it passed, and the authorizing tech lead + governance sign-off.

### 6.3 Incident management & on-call during live events

- **Two on-call planes.** (1) **Live-event on-call** — physically/remotely staffed for the critical window only: broadcast engineer (cameras/transport), an edge/back-end on-call (scoring loop, ledger), and an ML on-call (calibration drift, confidence). (2) **Standing on-call** — for prod-cloud (second-screen, analytics) on the normal rotation.
- **Severity ladder (event-time):** SEV-1 = officiating loop or ledger integrity at risk → immediate failover + head-judge informed, fall back to human-only judging if needed; SEV-2 = AR overlay / second-screen degraded (broadcast cosmetic) → degrade gracefully, no officiating impact; SEV-3 = post-event/analytics. Live officiating SEV-1 always outranks any broadcast-cosmetic issue.
- **Decision authority during the event sits with the head judge for officiating outcomes** — engineering proposes (failover / degrade to human-only), the head judge owns the call of record. This mirrors the machine-assisted-human-judging ground truth.
- **Comms.** A single event incident channel + a known bridge; the analyst owns client/federation comms during an incident so engineers stay heads-down.
- **Blameless post-event review** at thaw (T+24h) feeds the change calendar and runbooks.

### 6.4 Runbook culture

Every operational procedure is a **versioned, rehearsed runbook**, tested in staging dress-rehearsal before each event — not written during an incident:

- Venue setup & teardown (the ~2 hr broadcast setup), calibration capture & validation (reprojection-error gate).
- Primary→standby failover; camera-drop degradation to reduced-confidence / human-only.
- On-site rollback to last-known-good bundle.
- Ledger integrity check & protest-replay procedure.
- Secrets rotation and key-ceremony steps.
- Each runbook names an owner, prerequisites, exact steps, the expected ledger/observable signal, and an abort/rollback path. Runbooks are dry-run at the staging dress rehearsal that gates every event.

### 6.5 Configuration & secrets management

- **Config as code, environment-scoped.** dev/staging/venue-edge/prod-cloud configs are versioned and content-addressed; the venue-edge config is pinned at Config freeze and part of the signed bundle. No console/manual config drift at the venue.
- **Secrets** (ledger signing keys, JWT secrets, camera/transport creds, cloud sync creds) live in a managed secrets store, never in the repo or images; injected at deploy. Rotated and re-pinned before each event. The **ledger signing key is handled by the key-management process in `09-security-privacy.md`** (HSM/managed KMS, key ceremony, rotation with key-id in the chain).
- **Separation of duties:** the person who can deploy the edge bundle is not the sole holder of the ledger signing key. Full RBAC/secrets handling is specified in 09.

## 7. RACI (key activities)

| Activity | Analyst | Tech Lead | FE | BE | ML | Broadcast | QA | Gov |
|---|---|---|---|---|---|---|---|---|
| Requirements / change requests | **A/R** | C | I | I | I | C | I | C |
| Architecture decisions | C | **A/R** | C | C | C | C | I | C |
| Scoring engine + DSL | I | A | I | **R** | C | I | C | C |
| Inference + 3D pipeline | I | A | I | C | **R** | C | C | I |
| Referee console / second-screen | I | A | **R** | C | I | I | C | I |
| Graphics / camera / transport | I | C | C | I | C | **R/A** | I | I |
| Dataset / fairness / judge-agreement | C | C | I | I | **R** | I | C | **A** |
| Replay/audit reproducibility | I | A | I | **R** | C | I | **R** | C |
| Latency/accuracy acceptance gates | I | A | C | C | C | C | **R** | I |
| Consent / governance / retention | C | C | I | C | C | I | I | **A/R** |
| Client demo / acceptance sign-off | **A/R** | C | I | I | I | I | C | C |
| Freeze calendar & change board | **A** | **R** | I | I | I | C | I | C |
| Venue-edge release pinning / promotion | I | **A/R** | C | C | C | C | C | C |
| On-site failover / rollback (event) | I | A | I | **R** | C | **R** | I | I |
| Live-event incident command | C | **A** | I | R | R | R | I | I |
| Runbooks (author + dry-run) | I | A | C | C | C | **R** | **R** | C |
| Config & secrets management | I | **A** | I | **R** | I | C | I | C |

R = Responsible, A = Accountable, C = Consulted, I = Informed. Officiating-outcome authority *during* a live event rests with the head judge (machine-assisted human judging); the table above covers engineering/process accountability.
