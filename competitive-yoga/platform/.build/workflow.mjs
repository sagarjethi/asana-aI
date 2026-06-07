export const meta = {
  name: 'yoga-drishti-build',
  description: 'SDST build of the Yoga Drishti pilot platform (Next.js) from the spec',
  phases: [
    { title: 'Architect', detail: 'shared db / auth / templates / ui + build plan' },
    { title: 'Build', detail: 'scoring · pose · api · frontend in parallel' },
    { title: 'QA', detail: 'seed, install, typecheck, test, next build, fix to green' },
  ],
}

const ROOT = '/Users/sagarjethi/project/product2026/product/yogatraing/competitive-yoga/platform'
const SPEC = '/Users/sagarjethi/project/product2026/product/yogatraing/competitive-yoga/spec'

const CTX = `
PROJECT: "Yoga Drishti" pilot platform — a Next.js 14 (App Router, TypeScript, Tailwind) app at:
  ${ROOT}
The FOUNDATION already exists and MUST keep compiling: package.json, tsconfig.json, next.config.mjs,
tailwind.config.ts, postcss.config.mjs, vitest.config.ts, drizzle.config.ts, app/globals.css,
app/layout.tsx, app/page.tsx, lib/utils.ts, and — most important — the shared domain contracts at
  ${ROOT}/lib/contracts/index.ts
READ lib/contracts/index.ts FIRST. Import ALL shared types from "@/lib/contracts". The "@/..." alias
maps to the platform root. Spec docs (read what you need) are at: ${SPEC}

HARD RULES (all agents):
- Do NOT modify: package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs,
  vitest.config.ts, drizzle.config.ts, lib/contracts/index.ts, app/layout.tsx, app/globals.css.
  (If a dependency seems missing, note it in your summary; do not edit package.json.)
- Only WRITE files inside your assigned directories. Never edit another agent's files.
- Everything must TYPECHECK (tsc strict). Import shared types; do not redefine them.
- Pilot scope = SOLO format, monocular pose MVP, deterministic scoring. Multi-camera 3D and broadcast
  hardware are SIMULATED. Demo mode (NEXT_PUBLIC_DEMO_MODE) must let everything run with sample data,
  no camera and no database.
- Use only already-listed deps: next, react, drizzle-orm, pg, zod, jsonwebtoken, bcryptjs, clsx,
  tailwind-merge, lucide-react, recharts, nanoid, @tensorflow/tfjs, @tensorflow-models/pose-detection.

FIXED PUBLIC SIGNATURES (implement/consume EXACTLY these so parallel modules link):
- lib/scoring/index.ts:
    export const RULES_VERSION: string
    export function scorePerformance(template: AsanaTemplate, frames: PoseFrame[], opts?: { judgeOverrides?: Record<string, number> }): PerformanceScore
    export function computeAngles(frame: PoseFrame, targets: AngleTarget[]): JointAngle[]
- lib/sample/templates.ts (ARCHITECT):
    export const TEMPLATES: AsanaTemplate[]
    export function getTemplate(id: string): AsanaTemplate | undefined
- lib/sample/keypoints.ts (POSE agent):
    export function sampleFrames(templateId: string): PoseFrame[]
- lib/pose/detector.ts (POSE agent, "use client"):
    export async function createDetector(): Promise<any>
    export function toKeypoints(pose: any): Keypoint[]
- lib/db/schema.ts, lib/db/index.ts (ARCHITECT): drizzle tables + "export const db" (lazy; never throws without DATABASE_URL) + "export const hasDb: boolean"
- lib/auth/index.ts (ARCHITECT):
    export function signToken(p: { sub: string; role: Role }): string
    export function verifyToken(t: string): { sub: string; role: Role } | null
    export function requireRole(req: Request, roles: Role[]): { sub: string; role: Role } | null
    export const DEMO_USERS: { email: string; password: string; role: Role }[]
- components/ui.tsx (ARCHITECT): export Button, Card, Badge, Stat (typed React components, Tailwind sun theme, cn from "@/lib/utils")

DETERMINISM: scoring + sample data must be reproducible — derive any "noise" from a seeded integer
function, never from wall-clock time or a random generator.
`

phase('Architect')
const arch = await agent(`${CTX}

YOU ARE THE ARCHITECT (runs first, alone). Create the SHARED foundations every other agent imports.
WRITE ONLY:
1. ${ROOT}/lib/db/schema.ts — Drizzle pg tables for the entities in lib/contracts + spec/03:
   athletes, events, rounds, asanaTemplates, performances, criteriaScores, deductions, auditLog,
   plus users (id,email,passwordHash,role). Use drizzle-orm/pg-core; export every table.
2. ${ROOT}/lib/db/index.ts — node-postgres client; LAZY (build the Pool only when DATABASE_URL is set);
   "export const db" = drizzle(pool, { schema }); importing must NOT throw when there is no DB;
   "export const hasDb: boolean".
3. ${ROOT}/lib/auth/index.ts — JWT helpers (jsonwebtoken), requireRole reading "Authorization: Bearer"
   from a Request, JWT_SECRET from env with a dev fallback, and DEMO_USERS (athlete/coach/referee/
   head_judge/admin) for login without a DB.
4. ${ROOT}/lib/sample/templates.ts — >=2 real AsanaTemplate objects ("Natarajasana", "Vrksasana") with
   criteria: "alignment" (machine, max 10) carrying realistic AngleTarget[] (tolerances ~5-12°, weights),
   "stability" (machine, max 10), "grace" (judge, max 10); holdSeconds ~20; getTemplate(id). Use the exact
   JointName values from contracts.
5. ${ROOT}/components/ui.tsx — Button, Card, Badge, Stat (Tailwind sun theme, cn()).
6. ${ROOT}/BUILD-PLAN.md — one-page module map + the fixed signatures + data flow
   (pose → angles → scoring → api → console/leaderboard).
Keep it internally type-consistent. Return a short bullet summary.`,
  { label: 'architect', phase: 'Architect' })

phase('Build')
const build = await parallel([
  () => agent(`${CTX}

YOU ARE THE SCORING-ENGINE ENGINEER. WRITE ONLY files under ${ROOT}/lib/scoring/. Pure functions, no I/O.
- geometry.ts: angle (degrees) at a vertex from three keypoints; center-of-mass estimate from keypoints.
- rules.ts: export RULES_VERSION; a declarative deduction-rule model + evaluator ("if deviation exceeds
  tolerance AND exceeds NOISE_FLOOR_DEGREES => deduction proportional to severity"; cap per criterion).
  Use NOISE_FLOOR_DEGREES & CONFIDENCE_ABSTAIN_THRESHOLD from contracts.
- index.ts: computeAngles(frame, targets); stability over frames (sway RMS + micro-movement →
  StabilityMetrics); scorePerformance(template, frames, opts) → full PerformanceScore: per-criterion
  CriterionScore, Deduction[] (plain-English reasons, calibrated confidence, abstained flag), stability,
  total/maxTotal, confidenceState (ok/reduced/human_only from mean detector confidence), engineVersion =
  ENGINE_VERSION. judgeOverrides replace a criterion value (source -> "judge"). Fully deterministic.
- index.test.ts + geometry.test.ts (vitest): right angle = 90°; a perfect pose ≈ max score & no
  deductions; a clearly-off pose deducts; sub-5° diffs do NOT deduct (noise floor); scoring reproducible
  across two runs.
Import from "@/lib/contracts" and TEMPLATES/getTemplate from "@/lib/sample/templates". Return a short summary.`,
    { label: 'scoring', phase: 'Build' }),

  () => agent(`${CTX}

YOU ARE THE AI / POSE ENGINEER. WRITE ONLY files under ${ROOT}/lib/pose/ and the single file
${ROOT}/lib/sample/keypoints.ts.
- lib/sample/keypoints.ts: sampleFrames(templateId) → PoseFrame[] (~60 frames) of a synthetic hold of
  the template's target pose, with small controlled wobble from a SEEDED integer function (reproducible;
  no wall-clock, no random generator). Cover all JointName joints; normalized 0..1 coordinates; produces a
  realistic, repeatable score with a few small deductions.
- lib/pose/detector.ts ("use client"): thin wrapper over @tensorflow-models/pose-detection MoveNet —
  createDetector() and toKeypoints(pose) → our Keypoint[] (map detector joints to our JointName set).
  Lazy-import tfjs/pose-detection inside the functions so nothing runs at build time.
- lib/pose/index.ts: re-export sampleFrames + meanConfidence(frame).
- lib/pose/keypoints.test.ts: sampleFrames is reproducible (two calls deep-equal) and returns valid
  keypoints for a known template.
Import types from "@/lib/contracts", templates from "@/lib/sample/templates". Return a short summary.`,
    { label: 'pose', phase: 'Build' }),

  () => agent(`${CTX}

YOU ARE THE BACKEND ENGINEER. WRITE ONLY files under ${ROOT}/app/api/. Next.js App Router Route Handlers
(export async GET/POST). All must work in DEMO MODE (sample data, no DB). Import: contracts; scorePerformance
from "@/lib/scoring"; TEMPLATES/getTemplate from "@/lib/sample/templates"; sampleFrames from
"@/lib/sample/keypoints"; signToken/verifyToken/requireRole/DEMO_USERS from "@/lib/auth"; db/hasDb from "@/lib/db".
Endpoints:
- app/api/templates/route.ts       GET -> TEMPLATES
- app/api/auth/login/route.ts      POST {email,password} (zLogin) -> validate vs DEMO_USERS -> {token, role}
- app/api/score/route.ts           POST (zScoreRequest) -> getTemplate -> scorePerformance -> PerformanceScore
- app/api/judge/override/route.ts  POST (zJudgeOverride) -> requireRole [referee, head_judge] -> recompute -> PerformanceScore
- app/api/leaderboard/route.ts     GET ?roundId -> LeaderboardRow[] (demo: score sample athletes from sampleFrames + small per-athlete offsets, sort + rank)
- app/api/live/route.ts            GET ?templateId -> Server-Sent-Events (ReadableStream, content-type text/event-stream). Replay sampleFrames, emitting LiveEvent JSON: round_state, periodic pose_frame_summary (computeAngles), candidate_deduction(s) from scorePerformance, final leaderboard_update; monotonic seq; ~10-15s then close.
Validate bodies with the zod schemas in contracts; return NextResponse.json with status codes; consistent
{error} shape. Return a short summary.`, { label: 'api', phase: 'Build' }),

  () => agent(`${CTX}

YOU ARE THE FRONTEND ENGINEER. WRITE ONLY files under ${ROOT}/app/referee/, ${ROOT}/app/leaderboard/,
${ROOT}/app/athlete/, ${ROOT}/app/coach/, and NEW component files under ${ROOT}/components/ (do NOT edit
components/ui.tsx — import Button/Card/Badge/Stat from "@/components/ui"). Sun design system: warm for
athlete/coach, the dark ".bg-console" theme for the referee console. Import shared types from
"@/lib/contracts". Talk to the backend via fetch to /api/* (endpoints per the backend task). Add
"use client" where needed.
Pages:
- app/referee/page.tsx: officiating console. Open an EventSource to /api/live?templateId=...; render live
  angle readouts, a feed of candidate deductions (reason + confidence + Approve and Override controls;
  Override opens an input and POSTs /api/judge/override), a running per-criterion score panel, and a
  confidenceState indicator. Header: "AI suggests · the judge confirms".
- app/leaderboard/page.tsx: fetch /api/leaderboard, ranked rows, auto-refresh.
- app/athlete/page.tsx ("use client"): Practice view. Demo path: POST sampleFrames to /api/score, show an
  alignment ScoreRing + per-criterion bars + explainable deductions ("show me why"). Optional webcam button
  via lib/pose/detector, but the demo must work with no camera.
- app/coach/page.tsx: recharts analytics — score-trend line + weakness list + head-to-head card
  (plausible sample data shaped from contracts).
- components/: ScoreRing.tsx, DeductionCard.tsx, CriterionBar.tsx (client where needed).
Clean, responsive, production-looking. Return a short summary.`, { label: 'frontend', phase: 'Build' }),
])

phase('QA')
const qa = await agent(`${CTX}

YOU ARE THE QA / INTEGRATION ENGINEER (runs last). Make the whole app GREEN.
1. WRITE ${ROOT}/scripts/seed.ts — if hasDb, insert TEMPLATES + a few sample athletes/events/rounds via
   drizzle; else print "demo mode — no seed needed" and exit 0.
2. From ${ROOT} (use Bash with that absolute cwd), run in order:
     npm install            (allow several minutes)
     npx tsc --noEmit
     npm test
     npm run build
3. FIX every error — you MAY edit any file to resolve type errors, missing imports, route-handler
   signatures, SSE typing, or client/server boundary problems. Re-run until tsc, tests, and "next build"
   ALL pass. Gotchas: EventSource is browser-only (referee page "use client"); tfjs lazy-imported;
   route handlers must not import client components; recharts only inside "use client" components.
4. Only THIS agent may edit package.json — add a dependency only if genuinely required, then re-install.
Return a precise report: final tsc / npm test / npm run build results (pass/fail + numbers), what you
fixed, and any remaining known issues.`, { label: 'qa', phase: 'QA' })

return { architect: arch, build, qa }
