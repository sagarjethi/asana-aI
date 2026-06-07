# Yoga Drishti — Platform (Pilot)

Production-grade **Next.js 14 (App Router, TypeScript)** implementation of the competitive-yoga
officiating & broadcast platform, built from `competitive-yoga/spec`. This is the **W4 product build**
(separate from the pitch). It implements the *software* core of the Phase-1 Solo pilot.

## What's real vs simulated
| Layer | Status |
|-------|--------|
| Deterministic **scoring engine** (angles, deviation, stability, deductions, rules-DSL) | ✅ real, unit-tested |
| **Data model** (Drizzle/Postgres) + **API** (route handlers + SSE) + **auth/roles** | ✅ real |
| **Referee console**, **leaderboard**, **athlete**, **coach** UIs | ✅ real |
| **Monocular pose** (TF.js/MoveNet keypoints → angles) | ✅ real (browser) |
| **Multi-camera 3D triangulation**, **broadcast graphics/Simulcam hardware** | 🟦 simulated/stubbed (needs cameras/GPU/OB van) |

Demo mode (`NEXT_PUBLIC_DEMO_MODE=1`) runs the whole scoring pipeline against bundled **sample
keypoints**, so it works with no camera and no database.

## Architecture
```
lib/contracts   ← shared domain types + zod (the single source of truth)
lib/scoring     ← deterministic scoring engine + rules DSL (+ tests)
lib/pose        ← keypoints → joint angles; monocular detector + simulation
lib/db          ← Drizzle schema + client + queries
lib/auth        ← JWT + role guards
app/api         ← REST route handlers + SSE live feed
app/referee     ← officiating console (AI suggests, judge confirms)
app/leaderboard ← live standings
app/athlete     ← practice + scoring
app/coach       ← analytics
components       ← shared UI (sun design system)
scripts/seed.ts ← sample athletes/events/rounds/templates
```

## Run it
```bash
cd competitive-yoga/platform
cp .env.example .env        # demo mode works without a real DB
npm install
npm run dev                 # http://localhost:3000
npm test                    # scoring-engine unit tests
npm run typecheck
npm run build
```
With a Postgres DB: set `DATABASE_URL`, then `npm run db:push && npm run db:seed`.

## Principles carried from the spec
- **AI suggests, the judge confirms** — machine output is *advisory*; the human has final authority,
  and every override is logged.
- **Never deduct below the ~5° noise floor**; abstain (defer to human) below the confidence threshold.
- **Deterministic & replayable** — same frames + same engine version → same score.
