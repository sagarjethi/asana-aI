# Yoga Drishti — What it actually uses (AI + APIs)

A plain map of the AI/ML and the API surface the pilot runs on — so the landing
page and any pitch describe the product **truthfully**.

## AI / ML (what's real)
| Capability | How | Where |
|---|---|---|
| **Pose estimation** | **TensorFlow.js + MoveNet (SINGLEPOSE_LIGHTNING)** in the browser — camera frames never leave the device | `lib/pose/detector.ts` (lazy-loaded) |
| **Joint-angle measurement** | Vector geometry (angle at a vertex from 3 keypoints) | `lib/scoring/geometry.ts` |
| **Pose-template deviation** | Athlete angles vs **judge-ratified angle bands** (a distribution, not one "golden" pose) | `lib/sample/templates.ts` + `lib/scoring/index.ts` |
| **Stability** | Centre-of-mass sway + high-frequency micro-movement → 0–1 score | `lib/scoring/index.ts` |
| **Deductions** | Declarative **rules-DSL**; only deducts beyond tolerance **and** beyond a **5° measurement noise floor** | `lib/scoring/rules.ts` |
| **Trust controls** | Calibrated **confidence**; **abstains** below threshold (defers to human); plain-English explanations | `lib/scoring/*` |
| **Principle** | **AI suggests, the judge confirms** — every machine output is advisory; human override always wins; deterministic & replayable | engine-wide |

Simulated for the pilot (need hardware): multi-camera **3D triangulation** and the
broadcast **Simulcam** compositor.

## API surface (Next.js route handlers)
- **Auth** — `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` (JWT)
- **Events** — `GET/POST /api/events`, `GET /api/events/[id]`, `POST /api/events/[id]/enroll`, `POST /api/events/[id]/rounds`
- **Rounds** — `GET /api/rounds/[id]`, `POST /api/rounds/[id]/start`, `POST /api/rounds/[id]/publish`, `GET /api/judge/rounds`
- **Scoring** — `POST /api/score` (stateless practice), `POST /api/perform` (compete → score → persist), `POST /api/judge/override`
- **Live** — `GET /api/live` (Server-Sent-Events `LiveEvent` stream)
- **Results** — `GET /api/results`, `GET /api/me/performances`, `GET /api/leaderboard`, `GET /api/templates`

Data layer: an in-memory `store` (demo, no DB) with a Drizzle/Postgres path for production.
