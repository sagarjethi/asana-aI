# asanaai-backend

Self-hosted Express + PostgreSQL + Drizzle backend that replaces Supabase for AsanaAI.

## Quickstart

```bash
cp .env.example .env            # then edit JWT_SECRET, etc.
docker compose up -d            # postgres on :5432
npm install
npm run db:generate             # generate SQL migrations from drizzle schema (first time)
npm run db:migrate              # apply migrations
npm run db:seed                 # seed test@asanaai.local / test1234 + pose data
npm run dev                     # API on :8080
```

The Next.js frontend points to this server via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`).

## Endpoints

### Auth
- `POST /api/auth/signup` { email, password, name? } -> { token, user }
- `POST /api/auth/login` { email, password } -> { token, user }
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/auth/user`
- `POST /api/auth/exchange` (410 Gone — legacy OAuth)

### Users
- `GET /api/users/:id`
- `PATCH /api/users/me`

### Poses / Practice
- `POST /api/poses/log` (auth) — writes pose_logs + upserts pose_performance
- `GET /api/poses/catalog`

### Leaderboard
- `GET /api/leaderboard`

### Diet
- `GET /api/diet/me` (auth)
- `POST /api/diet/me` (auth)
- `DELETE /api/diet/me/:id` (auth)

### Achievements
- `GET /api/achievements/me` (auth)
- `POST /api/achievements/unlock` (auth)

### Generic shim passthrough
- `POST /api/db` — used by the Supabase compatibility shim. Body:
  `{ table, op: 'select'|'insert'|'update'|'delete', filters?, values?, single? }`
  Only the allowlisted tables in `src/routes/db.ts` are accepted.

## Auth model

JWT (HS256) signed with `JWT_SECRET`, 7-day TTL, delivered as HTTP-only cookie `aa_session` AND returned in the JSON body so client storage works.

## Notes

If Docker isn't available you can point `DATABASE_URL` at any reachable Postgres 14+ instance — migrations and seed work the same.
