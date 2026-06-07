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

## 6. RACI (key activities)

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

R = Responsible, A = Accountable, C = Consulted, I = Informed.
