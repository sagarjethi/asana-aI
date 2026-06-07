# Competitive Yoga — Technology Partnership Program

> Our end-to-end response to the **forza.ventures "Competitive Yoga Technology"** brief —
> built by extending our existing real-time pose product, **AsanaAI**.
>
> Two deliverables in one folder:
> **`proposal/`** = the client-facing pitch (why partner with us, what we'll build, what it costs).
> **`spec/`** = the internal, buildable analysis & roadmap for the front-end / back-end / AI team.

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
| 06 | [`spec/06-integrations.md`](spec/06-integrations.md) | Third-party tech (Vizrt/Unreal, Mo-Sys, cameras, GPU, LLM, TTS) + data boundaries |
| 07 | [`spec/07-team-process-sdlc.md`](spec/07-team-process-sdlc.md) | Analyst ⇄ builder ⇄ client review loop, SDLC, change control, RACI |

---

## How to read this, by role

- **forza.ventures / client decision-maker** → `proposal/00` then `proposal/03` (the demos).
- **UI/UX designer** → `spec/00` (understand the sport), then `spec/01` and `spec/02`.
- **Front-end / back-end engineer** → `spec/03`, `spec/04`, `spec/05`.
- **AI/ML engineer** → `spec/03` (two-tier inference), `spec/05` (ML workstream), `proposal/01`.
- **Project analyst / delivery lead** → `spec/07` and `proposal/05`.

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

Draft v1 — analysis & proposal complete, ready for stakeholder review.
**Next step after review:** turn `spec/04` + `spec/05` into a concrete implementation plan for the
Solo pilot. Contact for the brief: `forza@forza.ventures`.
