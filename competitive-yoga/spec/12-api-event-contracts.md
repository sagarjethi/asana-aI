# 12 — API & Event Contracts

> Internal build spec — forza.ventures Competitive Yoga platform.
> Audience: FE / BE / AI-ML engineers. The contracts between tiers: REST/RPC for state, the real-time event schema published by the scoring engine, and the on-prem↔cloud boundary. Consistent with the data model in 03-architecture-data.md and the surfaces in 02-screens-IA.md.

## 1. Surfaces & base URLs

| Tier | Base | Transport | Reuses |
|---|---|---|---|
| Edge officiating API | `https://edge.local/api/v1` (on-prem LAN, mTLS) | REST + WSS | Express (NestJS-style) + Drizzle + Postgres (AsanaAI backend) |
| Cloud API (post-live, fan) | `https://api.cy.forza.ventures/v1` | REST + WSS | same backend, cloud mirror |
| Scoring engine event bus | `wss://edge.local/feed/v1` | WSS (decimated + event channels) | NEW |

**Versioning is in the path** (`/v1`) for REST. Event payloads carry their own `schema` semver (§5). Edge and cloud expose the *same* REST shapes; the cloud mirror is read-only for officiating data and only serves data that has crossed the boundary (§8).

## 2. Auth & roles

JWT (reuse AsanaAI JWT/JWKS). Claims: `sub`, `roles[]`, `event_id?`, `scope[]`. Roles: `athlete`, `coach`, `judge`, `head_judge`, `director` (broadcast), `ar_operator`, `admin` (organiser), `fan`. Edge endpoints additionally require **mTLS client certs** issued per-console at venue provisioning — a JWT alone cannot write to the ledger. Every write that touches the ledger is attributed to the authenticated `sub` and recorded in `audit_log.actor` (03/§6).

Role enforcement is per-endpoint (§3–§4). Principle: **machine proposes, only `judge`/`head_judge` confirm or override; only `head_judge` publishes; only `admin` arms/configures.**

## 3. REST / RPC endpoints

Roles in brackets are the *minimum* required. All list endpoints are cursor-paginated (`?cursor=&limit=`). All responses include `schema` and `etag`.

```
# Athletes (reuse AsanaAI; competition extends)
GET    /athletes/:id                      [coach,judge,admin] public-safe by default
GET    /athletes/:id/history              [athlete(self),coach,admin]
PATCH  /athletes/:id/consent              [athlete(self),admin]   consent scopes (03/§6)

# Events / rounds / calibration
POST   /events                            [admin]
GET    /events/:id                        [any authed]
POST   /events/:id/rounds                 [admin]
GET    /rounds/:id                        [any authed]
POST   /rounds/:id/arm                    [admin]      blocked if any rig red (02 §e)
GET    /events/:id/calibration            [admin,judge] per-rig status

# Performances & scores (the officiating loop — EDGE only for writes)
POST   /rounds/:id/performances           [admin]      open a performance (status=recording)
GET    /performances/:id                  [judge,head_judge,admin]
GET    /performances/:id/scores           [judge,head_judge,admin]
POST   /performances/:id/criteria/:c/confirm   [judge]    confirm machine value
POST   /performances/:id/criteria/:c/override  [judge]    value + MANDATORY reason
POST   /performances/:id/deductions/:d/resolve [judge,head_judge]
POST   /performances/:id/publish          [head_judge] sign-off → signed record

# Replay / protest
GET    /performances/:id/replay           [judge,head_judge,admin]  signed bundle ref
POST   /performances/:id/protest          [coach,head_judge,admin]
GET    /replay/:id/verify                 [any authed]  re-derive & check hash chain

# Second-screen (CLOUD only — fan-safe projections, 03/§7)
GET    /second-screen/:event_id/leaderboard   [fan]
GET    /second-screen/:event_id/feed          [fan]   read-only published projection
POST   /second-screen/:event_id/predictions   [fan]   idempotent (Idempotency-Key)
POST   /second-screen/:event_id/judge-along    [fan]
```

`confirm`/`override` write append-only events; they **never mutate** an existing `criteria_scores` row — the new row carries `supersedes` (03/§4, §6). Override response is `pending` until the signed `audit_log` ack returns (matches the confirmed-state UX in 02 §b).

Example override request/response:

```jsonc
// POST /performances/{id}/criteria/stability/override
// Headers: Authorization: Bearer <jwt>, Idempotency-Key: 9f1c-...
{ "value": 8.5, "max_value": 10, "reason": "wobble at 0:14 within human tolerance",
  "supersedes": "cs_01H...machine" }
// 201 Created
{ "id": "cs_01H...override", "source": "judge", "value": 8.5,
  "rule_version": "rv_3a9f", "actor": "judge_27", "audit_seq": 80421,
  "audit_hash": "sha256:7c1e...", "state": "committed", "schema": "scores/1.4.0" }
```

## 4. Error model

All errors share one envelope:

```jsonc
{ "error": { "code": "CONSENT_REQUIRED", "message": "biometric estimation not consented",
             "retriable": false, "trace_id": "tr_01H...", "schema": "error/1.0.0" } }
```

HTTP maps: `400` validation, `401` unauthenticated, `403` role/consent, `404`, `409` conflict/ordering (stale `supersedes` or `etag`), `422` rule/domain error, `423` locked (round not armed / rig red), `429` rate-limited, `500/503`. Codes are stable strings (e.g. `RIG_RED`, `ROUND_NOT_ARMED`, `STALE_SUPERSEDES`, `OVERRIDE_REASON_REQUIRED`, `IDEMPOTENCY_CONFLICT`). `retriable` tells the client whether backoff-retry is safe.

## 5. Real-time event schema (scoring engine → clients)

The engine publishes over `wss://edge.local/feed/v1`. On connect, the client negotiates: `{ "subscribe": ["events","numeric"], "decimation_hz": 10, "since_seq": 80420 }`. Two logical channels (02 global coalescing rule):

- **numeric** — decimated (default 4–10 Hz), latest-wins, droppable under backpressure.
- **events** — immediate, **guaranteed-delivery, ordered**.

Every event has a common header:

```jsonc
{ "type": "...", "schema": "feed/2.1.0", "seq": 80421,        // monotonic per stream
  "event_id": "ev_...", "performance_id": "pf_...",
  "tier": "live|adjudicated", "emitted_at": "2026-06-07T10:14:02.331Z" }
```

### Event types

`pose-frame-summary` (numeric channel — decimated, never raw 60fps frames):
```jsonc
{ "type": "pose-frame-summary", "t_ms": 14210, "triangulation_confidence": 0.94,
  "num_cams_used": 7, "summary": { "sway_mm": 6.2, "hold_elapsed_ms": 9100 } }
```

`candidate-deduction` (events channel — advisory, live tier):
```jsonc
{ "type": "candidate-deduction", "deduction_id": "dd_...", "t_ms": 14210,
  "criterion": "alignment_deviation", "rule_version": "rv_3a9f",
  "magnitude": 0.4, "confidence": 0.62, "confidence_band": "medium",
  "evidence_frame_ref": "s3edge://frames/pf_.../14210.json", "status": "proposed" }
```

`criterion-score` (events — machine value emitted on hold-window completion):
```jsonc
{ "type": "criterion-score", "criterion": "stability", "source": "machine",
  "value": 8.1, "max_value": 10, "rule_version": "rv_3a9f",
  "confidence": 0.88, "confidence_band": "high", "score_id": "cs_...machine" }
```

`judge-override` (events — authoritative; mirrors §3 write):
```jsonc
{ "type": "judge-override", "criterion": "stability", "source": "judge",
  "value": 8.5, "actor": "judge_27", "reason": "wobble within tolerance",
  "supersedes": "cs_...machine", "score_id": "cs_...override",
  "audit_seq": 80421, "audit_hash": "sha256:7c1e..." }
```

`round-state` (events — lifecycle):
```jsonc
{ "type": "round-state", "round_id": "rd_...", "state": "armed|recording|adjudication|published",
  "confidence_state": "full|reduced|human_only" }   // drives 02 §b degraded UX
```

`leaderboard-update` (events — published projection, post head-judge publish):
```jsonc
{ "type": "leaderboard-update", "round_id": "rd_...",
  "entries": [ { "athlete_id": "at_...", "rank": 1, "total": 38.5 } ],
  "published_at": "2026-06-07T10:20:00Z" }
```

**Scores are locale-invariant** on the wire (canonical decimal, dot separator) — formatting happens only at render (02 i18n rule).

## 6. Versioning strategy

- **REST:** path version `/v1`; additive changes are minor (no bump), breaking changes ship `/v2` with `/v1` supported through a deprecation window.
- **Event payloads:** independent **semver** per `type` family in the `schema` field (`feed/2.1.0`, `scores/1.4.0`). MINOR = additive optional field (consumers ignore unknowns); MAJOR = breaking. Clients pin a **compatible major range** in the handshake and the server rejects an unsupported major with `426 Upgrade Required`.
- **Schema registry.** All event + DTO schemas are versioned JSON Schema in a registry package (`@cy/contracts`), CI-validated against both producer (engine) and consumers (Next.js front-ends). A producer cannot ship an event the registry doesn't know.
- **Graphics:** `graphics_pack_version` travels with on-air overlays; an overlay fails closed if it sees data from a newer schema major than it understands (02 schema-versioned-graphics rule).
- **Rules:** `rule_version` is a content hash (03/§4), already immutable — never "versioned" by mutation.

## 7. Idempotency & ordering guarantees

- **Ordering.** Every feed event carries a monotonic `seq` from the append-only `audit_log` (03/§6). The **events** channel is delivered **in `seq` order, exactly-once**; the **numeric** channel is latest-wins and may skip `seq` values (decimation/backpressure). Clients render numbers by interpolation, never by assuming contiguity.
- **Resume after disconnect.** Reconnect with `since_seq`; the server replays missed **events** from the log (idempotent — re-applying a known `seq` is a no-op) and resumes numeric from latest. No flood, no double-apply (matches the Referee Console reconnection in 02 §b).
- **Write idempotency.** All mutating REST calls accept an `Idempotency-Key` header; a retried key returns the original result (`200` with original body), never a duplicate ledger entry. `supersedes` provides optimistic-concurrency: a stale link → `409 STALE_SUPERSEDES`.
- **Backpressure.** Slow consumers drop intermediate **numeric** samples (server-side, latest-wins); **events are never dropped** — if a client cannot keep up with the events channel it is disconnected and must resume via `since_seq`.

## 8. On-prem ↔ cloud boundary

Consistent with 03/§1 and 06/§3. **The officiating loop never depends on the uplink.**

| Crosses to cloud | When | Never leaves venue |
|---|---|---|
| Published leaderboard / fan-safe projections | real-time during broadcast | Raw 3D skeleton frames (only URI refs sync later) |
| Signed ledger + scores + deductions + audit chain | **batch, one-way, after final closes** | Live raw camera feeds |
| Frame *metadata* + cold-store object refs | post-final batch | In-flight `pose-frame-summary` (edge only) |
| Replay bundles (signed, for verify) | post-final | mTLS client certs / officiating LAN identities |

**Hard rules:** (1) Second-screen WSS terminates in the **cloud**, fed only fan-safe published projections — fans never connect to the edge. (2) Biometric/estimated visuals cross only when `consent_biometric_estimation` is set and always carry the `ESTIMATED` flag. (3) The cloud copy of officiating data is **read-only**; corrections are made on the edge ledger and re-synced, never edited cloud-side. (4) Replay verification (`/replay/:id/verify`) re-derives scores byte-identically from `(calibration_set, frame refs, rule_versions, event log)` (03/§4) and confirms the `audit_log` hash chain — this is the artifact protests are adjudicated against.

## 9. Rate limits

Per-role token-bucket at both API tiers. Edge officiating writes (`confirm`/`override`/`publish`) are **not** throttled for `judge`/`head_judge` during a live round (correctness > limits) but are logged for anomaly detection. Cloud fan endpoints: `GET` leaderboard/feed 60 req/min/user (served from cache/CDN); `POST` predictions/judge-along 30 req/min/user, idempotent. `429` responses carry `Retry-After`. WSS connections are capped per IP at the cloud edge; fan fan-out scales horizontally behind the cloud service, never touching the edge.
