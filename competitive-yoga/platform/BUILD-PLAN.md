# Yoga Drishti — Build Plan

One-page map of the shared foundation and the fixed contracts every engineer builds against.
All shared shapes live in **`lib/contracts/index.ts`** — import from `@/lib/contracts`, never redefine.

## Module map

| Module | Path | Owner | Responsibility |
| --- | --- | --- | --- |
| Contracts | `lib/contracts/index.ts` | (foundation) | Single source of truth for all domain types + Zod request schemas. |
| DB schema | `lib/db/schema.ts` | architect | Drizzle pg tables mirroring contracts + spec/03. |
| DB client | `lib/db/index.ts` | architect | Lazy node-postgres pool. `db` proxy + `hasDb`. |
| Auth | `lib/auth/index.ts` | architect | JWT sign/verify, `requireRole`, `DEMO_USERS`. |
| Templates | `lib/sample/templates.ts` | architect | `TEMPLATES`, `getTemplate` — reference asana forms. |
| UI kit | `components/ui.tsx` | architect | `Button`, `Card`, `Badge`, `Stat` (sun theme). |
| Scoring | `lib/scoring/index.ts` | scoring eng | `scorePerformance`, `computeAngles`, `RULES_VERSION`. |
| Pose / sim | `lib/pose/detector.ts`, `lib/sample/keypoints.ts` | pose eng | `createDetector`, `toKeypoints`, `sampleFrames`. |
| API + web | `app/**` | backend / frontend | Routes, console, leaderboard, athlete/coach. |

## Fixed public signatures

**Architect (this PR)**
- `lib/db/schema.ts` — exports: `athletes`, `events`, `rounds`, `asanaTemplates`, `performances`, `criteriaScores`, `deductions`, `stabilityMetrics`, `auditLog`, `users` (+ `*Row` inferred types).
- `lib/db/index.ts` — `export const db` (lazy proxy), `export const hasDb: boolean`, `closeDb()`, `schema`. Importing never throws without `DATABASE_URL`.
- `lib/auth/index.ts`
  - `signToken(p: { sub: string; role: Role }): string`
  - `verifyToken(t: string): { sub: string; role: Role } | null`
  - `requireRole(req: Request, roles: Role[]): { sub: string; role: Role } | null` (reads `Authorization: Bearer <jwt>`)
  - `bearerFrom(req)`, `findDemoUser(email, password)`
  - `export const DEMO_USERS: { email; password; role }[]` (athlete/coach/referee/head_judge/admin)
- `lib/sample/templates.ts` — `export const TEMPLATES: AsanaTemplate[]`; `getTemplate(id): AsanaTemplate | undefined`.
- `components/ui.tsx` — `Button`, `Card`, `Badge`, `Stat`.

**Relied on from peers (do not change these names)**
- `lib/scoring/index.ts`: `RULES_VERSION`; `scorePerformance(template, frames, opts?)`; `computeAngles(frame, targets)`.
- `lib/sample/keypoints.ts`: `sampleFrames(templateId): PoseFrame[]`.
- `lib/pose/detector.ts`: `createDetector()`; `toKeypoints(pose)`.

## Data flow

```
camera / sim                pose engine              scoring engine            api                 web
-----------                 -----------              --------------            ---                 ---
sampleFrames(templateId) -> PoseFrame[]  ----------> computeAngles(frame,      POST /api/score  -> referee console
createDetector()/toKeypoints(pose)                     targets) -> JointAngle[]   (zScoreRequest)    (CriterionScore,
                                                     scorePerformance(                                Deduction evidence)
                                                       template, frames)
                                                       -> PerformanceScore  --> persist via db    -> leaderboard
                                                          (criteria,            (when hasDb) +        (LeaderboardRow[])
                                                           deductions,          auditLog
                                                           confidenceState)
```

1. **Pose** — frames arrive (live detector or `sampleFrames`) as `PoseFrame[]`.
2. **Angles** — `computeAngles` turns each frame + a template's `AngleTarget[]` into `JointAngle[]` / `AngleDeviation[]`, honoring the 5° noise floor.
3. **Scoring** — `scorePerformance` produces a deterministic `PerformanceScore`: per-criterion values, `Deduction[]` with evidence, `stability`, `confidenceState`, `total`.
4. **API** — routes validate with the `z*` schemas, gate with `requireRole`, persist to Postgres when `hasDb` (else in-memory), and append to `auditLog`.
5. **Console / leaderboard** — surfaces live scores, deduction evidence, judge overrides, and ranked `LeaderboardRow[]` using the `components/ui.tsx` kit.

## Invariants

- **Determinism:** no wall-clock / RNG in scoring or templates. Any synthetic noise is a seeded integer function (pose engineer's concern).
- **Abstention:** never deduct on angle deltas below `NOISE_FLOOR_DEGREES` (5°); below `CONFIDENCE_ABSTAIN_THRESHOLD` (0.6) the engine abstains → `human_only`.
- **Auditability:** machine scores are reproducible; `auditLog` is append-only + hash-chained.
- **Graceful degradation without a DB:** every surface works against in-memory sample data when `hasDb` is false.
