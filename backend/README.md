# asanaai-backend

Self-hosted **Express + PostgreSQL + Drizzle** backend that replaces
Supabase for AsanaAI. NestJS-style modular layout — every feature owns
its own `service`, `controller`, `routes`, `schema`, `constants`, and is
mounted from a single `app.ts` factory.

---

## Quickstart

```bash
cp .env.example .env                # then set JWT_SECRET
docker compose up -d postgres       # Postgres on :5432
npm install
npm run db:generate                 # (first-time) generate SQL from schema
npm run db:migrate                  # apply migrations
npm run db:seed                     # seeds test@asanaai.local / test1234 + pose data
npm run dev                         # API on :8080
```

The Next.js frontend points here via `NEXT_PUBLIC_API_BASE_URL`
(default `http://localhost:8080`).

To run the whole backend in Docker (app + postgres):

```bash
docker compose up -d                # builds the image, runs both
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

---

## Layout

```
backend/
├── src/
│   ├── config/                 # env (zod-validated) + app constants
│   ├── common/
│   │   ├── errors/             # AppError hierarchy
│   │   ├── middleware/         # async-handler, error-handler, request-logger
│   │   ├── types/              # express.d.ts request augmentation
│   │   └── utils/              # pino logger
│   ├── db/
│   │   ├── schema/             # one file per table
│   │   ├── client.ts           # pg Pool + Drizzle instance
│   │   ├── migrate.ts          # `npm run db:migrate`
│   │   └── seed.ts             # `npm run db:seed`
│   ├── modules/                # feature modules
│   │   ├── auth/               # constants, schema, service, middleware, controller, routes
│   │   ├── users/
│   │   ├── poses/
│   │   ├── leaderboard/
│   │   ├── diet/
│   │   ├── achievements/
│   │   ├── db-passthrough/     # generic Supabase-shim adapter
│   │   └── health/             # /health + /health/ready
│   ├── app.ts                  # Express factory (testable, no listen)
│   └── server.ts               # process entry: app + listen + graceful shutdown
├── drizzle/                    # generated SQL migrations
├── Dockerfile                  # multi-stage build, non-root runtime
├── docker-compose.yml          # postgres + backend
├── .env.example
└── package.json
```

The pattern in every module:

| File | Responsibility |
|---|---|
| `<m>.constants.ts` | Named errors, static data, magic strings |
| `<m>.schema.ts`    | Zod input schemas + inferred input types |
| `<m>.service.ts`   | All business logic, talks to Drizzle, throws `AppError` |
| `<m>.controller.ts`| Thin Express handlers — parse, call service, respond |
| `<m>.routes.ts`    | `Router()` wiring (middleware + asyncHandler) |
| `index.ts`         | Public exports (just the router for most modules) |

---

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET    | `/health` | – | Liveness |
| GET    | `/health/ready` | – | Readiness (`select 1` on DB) |
| POST   | `/api/auth/signup` | – | `{email, password, name?}` → `{token, user}` |
| POST   | `/api/auth/login`  | – | `{email, password}` → `{token, user}` |
| POST   | `/api/auth/logout` | – | Clears cookie |
| GET    | `/api/auth/session` | – | Returns `{session, user}` or nulls |
| GET    | `/api/auth/user` | required | Current user |
| POST   | `/api/auth/exchange` | – | `410 Gone` (legacy OAuth) |
| GET    | `/api/users/:id` | – | Public profile |
| PATCH  | `/api/users/me` | required | `{name?, avatarUrl?, country?, profileType?}` |
| POST   | `/api/poses/log` | required | `{poseId, accuracy 0..1, durationMs}` |
| GET    | `/api/poses/catalog` | – | Static pose list |
| POST   | `/api/pose/log` | required | Legacy alias for `/api/poses/log` |
| GET    | `/api/pose/catalog` | – | Legacy alias |
| GET    | `/api/leaderboard` | – | Weekly board, top 100 |
| GET    | `/api/diet/me` | required | Current user's diet entries |
| POST   | `/api/diet/me` | required | `{mealId, calories?, notes?}` |
| DELETE | `/api/diet/me/:id` | required | – |
| GET    | `/api/achievements/me` | required | Current user's unlocks |
| POST   | `/api/achievements/unlock` | required | `{code}` — idempotent |
| POST   | `/api/db` | optional | Generic allowlisted shim passthrough |

### Auth model

JWT (HS256) signed with `JWT_SECRET`, **7-day** TTL, delivered as an
HTTP-only cookie (`aa_session`) **and** in the response body so clients
that prefer header auth can use `Authorization: Bearer …`.

### Error envelope

All errors are returned as:

```json
{ "error": "code", "message": "human-readable", "details": { ... } }
```

The global error handler maps `AppError` subclasses to status codes
(400 BadRequest, 401 Unauthorized, 403 Forbidden, 404 NotFound,
409 Conflict, 410 Gone). Zod validation issues come back as
`{ error: 'invalid_body', issues: [...] }` with a 400.

---

## Operational

- **Logging:** `pino` (pretty in dev, JSON in prod) + `pino-http` for request logging. `/health` is excluded from the access log.
- **Graceful shutdown:** SIGINT/SIGTERM close the HTTP server, then drain the PG pool.
- **CORS:** Origin pinned to `FRONTEND_ORIGIN` env, credentials allowed (cookies traverse).
- **Security:** `helmet`, `x-powered-by` disabled, `trust proxy` on.

## Env

```env
NODE_ENV=development
PORT=8080
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=postgres://asanaai:asanaai@localhost:5432/asanaai
JWT_SECRET=replace-me-with-a-long-random-string
LOG_LEVEL=info
```

All env values are validated by `zod` on startup; an invalid env exits the process with a clear list of the offending fields.

---

## Scripts

```bash
npm run dev          # tsx watch + pino-pretty
npm run build        # tsc -> dist/
npm run start        # node dist/server.js (production)
npm run typecheck    # tsc --noEmit
npm run db:generate  # drizzle-kit generate
npm run db:migrate   # apply pending migrations
npm run db:seed      # seed test user + pose data
```
