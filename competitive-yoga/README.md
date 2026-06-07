# Competitive Yoga — Technology Partnership Program

> Our end-to-end response to the **forza.ventures "Competitive Yoga Technology"** brief —
> built by extending our existing real-time pose product, **AsanaAI**.
>
> Deliverables in one folder:
> **`proposal/`** = the client-facing written proposal (why partner with us, what we'll build, cost).
> **`spec/`** = the internal, buildable analysis & roadmap for the front-end / back-end / AI team.
> **`pitch/`** = the investor / client **pitch deck** (`pitch/index.html`) + spoken script + product images.
> **`PROJECT-STATUS.md`** = the project-manager's live tracker of what's done vs not (read this to orient).

---

## The one-paragraph story

Competitive yoga is hard to **judge fairly** and hard to **follow on TV** — and those are the same
problem: the discipline that makes it beautiful (millimetric alignment, held stillness, controlled
transitions) is *invisible*. We make it visible and the scoring transparent, with a **two-layer**
system — objective **scoring support** for referees and **AR broadcast graphics** for fans — built on
the honest principle of **machine-assisted human judging** ("AI suggests, the judge confirms"). Our
unfair advantage is the **AsanaAI flywheel**: a live consumer app that already produces labelled pose
data, gives us pre-trained models, and funnels amateurs into the competitive format — a moat no pure
broadcast-tech vendor can copy.

---

## The honest technical truth (read this first)

- Competitive **scoring** needs **multi-camera 3D** (6–8 synced cameras → triangulated skeleton). A
  single webcam cannot measure depth, and yoga is full of foreshortening, twists and inversions.
- Our existing AsanaAI model is a pose **classifier** (asana + confidence %), **not** a joint-angle
  measurer. It is reused as an **asana segmenter** (picks which scoring template applies), not as the
  measurement. **~70%** of AsanaAI reuses for the fan / training / athlete-data tiers; the judging
  inference path is **new IP**.
- We run **two tiers, like Hawk-Eye / DRS**: a fast **live** tier for on-air feel, and a heavy
  **adjudicated** tier that computes the official, replayable, signed deduction.
- We separate **real measurement** (Solo held upright joint angles, stability/sway, hold time) from
  **convincing visualisation** (rPPG heart rate, breathing, "muscle heatmap" — all labelled *estimated*,
  never scored). Some things stay **human-judged** (Pair/Group contact poses, inversions, artistry).

---

## `proposal/` — the client pitch (A)

Maps directly to the brief's required "Next Steps" sections.

| # | File | What it covers |
|---|------|----------------|
| 00 | [`proposal/00-exec-summary.md`](proposal/00-exec-summary.md) | The one-pager: problem, two-layer solution, the moat, the ask |
| 01 | [`proposal/01-tech-approach.md`](proposal/01-tech-approach.md) | Technical approach & architecture, multi-cam 3D, two-tier inference, build-vs-buy |
| 02 | [`proposal/02-latency-calib-deploy.md`](proposal/02-latency-calib-deploy.md) | Latency budgets, calibration method, phased deployment + edge footprint |
| 03 | [`proposal/03-demos-differentiators.md`](proposal/03-demos-differentiators.md) | The 5 day-one demos + everything we add beyond the brief |
| 04 | [`proposal/04-budget-phasing.md`](proposal/04-budget-phasing.md) | Indicative pilot vs full-deployment budget, operating cost, licensing |
| 05 | [`proposal/05-team-process-ai-ethics.md`](proposal/05-team-process-ai-ethics.md) | Team, delivery process, responsible-AI & data governance |

## `spec/` — the buildable analysis & roadmap (D)

| # | File | What it covers |
|---|------|----------------|
| 00 | [`spec/00-project-analysis.md`](spec/00-project-analysis.md) | **The sport in plain language** (instructor/organiser voice) + glossary |
| 01 | [`spec/01-personas-journeys.md`](spec/01-personas-journeys.md) | 7 personas (athlete, coach, referee, head judge, director, fan, organiser) + journeys |
| 02 | [`spec/02-screens-IA.md`](spec/02-screens-IA.md) | Screen inventory & navigation per surface; AsanaAI reuse callouts |
| 03 | [`spec/03-architecture-data.md`](spec/03-architecture-data.md) | System architecture diagram + full Postgres/Drizzle data model |
| 04 | [`spec/04-reuse-pilot.md`](spec/04-reuse-pilot.md) | Reuse map + the precise Solo pilot scope (in/out, success criteria) |
| 05 | [`spec/05-roadmap-workstreams.md`](spec/05-roadmap-workstreams.md) | Phased roadmap + FE / BE / AI-ML task checklists |
| 06 | [`spec/06-integrations.md`](spec/06-integrations.md) | Third-party tech (Vizrt/Unreal, Mo-Sys, cameras, GPU sizing, LLM, TTS) + data boundaries |
| 07 | [`spec/07-team-process-sdlc.md`](spec/07-team-process-sdlc.md) | Analyst ⇄ builder ⇄ client review loop, SDLC, change control, live-event freeze, RACI |
| 08 | [`spec/08-nfr-reliability-slo.md`](spec/08-nfr-reliability-slo.md) | Non-functional requirements, SLOs, redundancy/failover, capacity math, observability, DR |
| 09 | [`spec/09-security-privacy.md`](spec/09-security-privacy.md) | RBAC, threat model, cryptographic integrity chain, GDPR biometric governance |
| 10 | [`spec/10-commercial-model.md`](spec/10-commercial-model.md) | Revenue streams, pricing tiers, unit economics, the moat as a commercial asset, GTM |
| 11 | [`spec/11-validation-and-testing.md`](spec/11-validation-and-testing.md) | How we prove scoring is correct: accuracy validation, judge-agreement, test strategy, go/no-go |
| 12 | [`spec/12-api-event-contracts.md`](spec/12-api-event-contracts.md) | REST/RPC + real-time event schemas, versioning, idempotency, on-prem↔cloud boundary |
| 13 | [`spec/13-risks-and-open-questions.md`](spec/13-risks-and-open-questions.md) | Risk register + open questions / decisions needed (the honest first-build gaps) |

---

## How to read this, by role

- **forza.ventures / client decision-maker** → `proposal/00` then `proposal/03` (the demos).
- **UI/UX designer** → `spec/00` (understand the sport), then `spec/01` and `spec/02`.
- **Front-end / back-end engineer** → `spec/03`, `spec/04`, `spec/05`.
- **AI/ML engineer** → `spec/03` (two-tier inference), `spec/11` (validation), `spec/05` (ML workstream), `proposal/01`.
- **Platform / SRE / security** → `spec/08` (reliability/SLOs), `spec/09` (security/privacy), `spec/12` (contracts).
- **Project analyst / delivery lead** → `spec/07`, `spec/13` (risks & open questions), `proposal/05`.
- **Commercial / founder** → `spec/10` (revenue model) and `proposal/04` (budget).

## The delivery & review loop

```
Senior Project Analyst  ⇄  Builder / Tech Lead  ⇄  Client (third-party reviewer)
   (client-facing,            (owns delivery &        (reviews increments,
    requirements &             technical decisions)    requests changes)
    change control)
        │                                                     │
        └──────  Discovery → Pilot → Iterate → Scale  ◄───────┘
                 every change reviewed, scoped, and folded
                 toward the production "end game"
```

Detail in [`spec/07-team-process-sdlc.md`](spec/07-team-process-sdlc.md).

---

## Status

**Draft v2 — senior-engineer hardening pass complete.** v1 analysis + proposal, then a principal-level
review-and-harden pass that added production concerns a first draft always misses: reliability/SLOs (08),
security & biometric privacy (09), the commercial/revenue model (10), accuracy validation & testing (11),
API/event contracts (12), and an explicit risk + open-questions register (13). Specs 00–07 were upgraded
in place (failure/recovery journeys, defensible accuracy claims, determinism/replay rigor, honest reuse
effort, critical-path roadmap, live-event ops). ~39,000 words total.

**Open decisions for the client live in [`spec/13`](spec/13-risks-and-open-questions.md)** — review these first.
**Next step after review:** turn `spec/04` + `spec/05` into a concrete implementation plan for the
Solo pilot. Contact for the brief: `forza@forza.ventures`.
