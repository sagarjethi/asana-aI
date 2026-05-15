# AsanaAI

> An AI-powered yoga companion. Pick a pose, turn on your camera, and get
> real-time alignment feedback. Pose estimation runs entirely in your
> browser — your camera frames never leave the device.

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white"/>
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white"/>
  <img alt="TensorFlow.js" src="https://img.shields.io/badge/TensorFlow.js-4-FF6F00?logo=tensorflow&logoColor=white"/>
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white"/>
</p>

---

## What's inside

- **Real-time pose estimation** — a TensorFlow.js model runs locally in
  the browser, watches your form, and reports a per-frame alignment
  score.
- **Calm UX, warm visual language** — sun palette, Fraunces display
  serif, Inter body, breath pacer, voice-led practice sessions.
- **Phased practice flow** — Arrive (welcome + breath) → Practice
  (camera + live alignment ring) → Release.
- **Mobile-first** — portrait camera framing, thumb-reach control dock,
  bottom-sheet pose picker, info panel.
- **Authenticated app surfaces** — Dashboard, Stats, Achievements,
  Diet, Leaderboard, public Profile pages.

---

## Branches

| Branch | Backing data layer |
|---|---|
| **`main`** | Supabase (auth + Postgres) and Upstash Redis. This is the production branch. |
| **`feature/postgres-backend`** | Self-hosted PostgreSQL + Express + JWT + Drizzle. Experimental work-in-progress. |

---

## Quickstart

```bash
git clone https://github.com/sagarjethi/asana-aI.git
cd asana-aI
npm install
cp .env.local.example .env.local   # fill in Supabase keys
npm run dev
# → http://localhost:3000
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
UPSTASH_REDIS_REST_URL=https://<your-instance>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-token>
NEXT_AUTH_COOKIE_KEY=aa_session
NEXT_PUBLIC_AES_SALT=<a-long-random-string>
```

A working `.env.local.example` is checked into the repo.

---

## Project layout

```
.
├── app/                              Next.js App Router
│   ├── (landing)         page.tsx + Home components
│   ├── dashboard/        tabbed authenticated dashboard
│   ├── practice/         camera + pose estimation cockpit
│   ├── leaderboard/      weekly board
│   ├── diet/             recipes + plans
│   ├── profile/[id]/     public profile
│   ├── login/, auth/     Supabase OAuth flow
│   └── api/              Route handlers (db, leaderboard, pose, etc.)
├── components/                       shadcn/ui primitives
├── hooks/, lib/, utils/              Shared client utilities + Redux store
├── public/
│   ├── pose/             pose imagery + tutorial assets
│   ├── model/            in-browser TF.js model shards
│   └── …
├── backend/                          Express scaffold (deploy target: EC2)
├── infra/
│   ├── amplify-setup.md              Frontend deploy guide
│   ├── ec2-deploy.md                 Backend deploy guide
│   └── nginx.conf.example
├── amplify.yml                       AWS Amplify build config
└── tailwind.config.ts                Sun design tokens + Fraunces/Inter wiring
```

---

## Design system

The cream/sun palette is defined in `tailwind.config.ts` and exposed
through Tailwind utilities:

| Token | Hex | Where it shows up |
|---|---|---|
| `cream-50` | `#FFFBF4` | Page background |
| `sun-600` | `#F77F00` | Primary warm accent |
| `ember-600` | `#FF6B35` | Action / CTA |
| `sage-600` | `#5C8A60` | Success / grounding |
| `ink-900` | `#15100C` | Primary text |

Typography uses **Fraunces** (display serif) and **Inter** (body) wired
through `next/font/google` as CSS variables. Reusable surface class
`.sun-card` lives in `app/globals.css`.

---

## Practice flow

The `/practice` route is a small state machine:

1. **Arrive** — quiet welcome card, breath pacer (4s inhale, 4s exhale),
   single `Begin practice` button. Heavy modules are not loaded yet.
2. **Practice** — webcam viewport hero with a live alignment ring overlay
   (sage → sun → ember as you drift). Bottom dock holds Pause / Pose
   picker / Info — all thumb-reach. Tutorial and tabs live in a
   pull-up sheet on mobile, side rail on desktop.

`@tensorflow/tfjs`, the webcam component, and the tabs panel are all
`dynamic({ ssr: false })` and only mount once the user taps `Begin
practice` — keeping the initial HTML around 22 KB.

---

## Deployment

| Layer | Target | How |
|---|---|---|
| Frontend | **AWS Amplify** | Push to GitHub → Amplify auto-builds via [`amplify.yml`](amplify.yml). Walkthrough: [`infra/amplify-setup.md`](infra/amplify-setup.md). |
| Backend  | **AWS EC2** | Ubuntu + Node 20 + PM2 + nginx + Let's Encrypt. Walkthrough: [`infra/ec2-deploy.md`](infra/ec2-deploy.md). |

Set `NEXT_PUBLIC_API_BASE_URL` in Amplify to your EC2 domain once the
backend is up.

---

## Scripts

```bash
npm run dev          # Next.js dev server
npm run build-next   # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run prettier     # Prettier --write across the tree
```

---

## License

Private. All rights reserved.
