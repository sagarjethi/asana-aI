# 02 — Screen Inventory & Information Architecture

*The actual surfaces we build, the key screens inside each, and how they're navigated. For every surface we note what **REUSES AsanaAI** (the existing Next.js 14 consumer app with its warm "sun" design) versus what is **NEW** and needs a denser, data-heavy "officiating" look.*

A quick orientation on the two visual worlds:

- **The "sun" world (warm, reused).** AsanaAI's existing language — Fraunces/Inter type, warm tones, calm, phased, friendly. Used for athletes, coaches, fans, and training. Roughly **70% reuse.**
- **The "officiating" world (dense, new).** High-information-density, fast, neutral, evidence-first. Used for the Referee Console, Broadcast Graphics Control, and the Admin console. These are *tools*, not experiences. Built fresh, sharing only base design-system primitives (tokens, buttons, tables) with the sun world.

There are **five surfaces.** Each surface section below carries a **Non-Functional UX** block (latency feel, update strategy, offline/degraded, error/empty/loading, accessibility, device target, real-time transport). Read those as binding acceptance criteria, not aspiration — the officiating surfaces in particular are judged on behaviour under load, not on look.

### How to read the Non-Functional UX blocks

Every surface declares the same eight axes so they are diff-able:

1. **Latency feel** — the perceived responsiveness target a user must subjectively experience, distinct from wire latency in 03/§3.
2. **Update strategy** — confirmed-state vs optimistic-UI, and how high-frequency feeds are coalesced so a judge is never flooded.
3. **Offline / degraded** — behaviour when the transport drops, a camera rig goes red, or triangulation confidence falls (ties to `performances.confidence_state` = `full|reduced|human_only` in 03/§6).
4. **Error / empty / loading** — the three states most specs forget; each surface must define all three.
5. **Accessibility** — WCAG 2.2 AA baseline; per-surface keyboard flows and colour-blind-safe overlay handling.
6. **Device / hardware target** — the actual hardware the surface is operated on, which dictates input model and breakpoints.
7. **Real-time transport** — WebSocket / WebRTC / WebTransport choice, reconnection, and backpressure (consistent with 12-api-event-contracts.md and 03/§5).
8. **Design-system governance** — which world (sun vs officiating), token set, and component ownership.

### Global non-functional baseline (applies to all five surfaces unless overridden)

- **Confirmed vs optimistic state.** *Officiating surfaces never use optimistic UI for anything that touches the scoring ledger.* A judge's confirm/override is rendered as `pending` (spinner + dimmed) until the signed `audit_log` ack returns, then `committed`. Sun-world surfaces (fan, athlete) may use optimistic UI freely for non-authoritative actions (predictions, likes). The rule: **optimism is allowed only where being wrong is free.**
- **Update coalescing at 60fps.** The scoring engine can emit `pose-frame-summary` at up to broadcast frame-rate. No human-facing surface re-renders at that rate. UIs subscribe to a **decimated channel** (default 4–10 Hz for numeric panels) and an **event channel** (deductions, state changes, fired immediately). Numeric values animate via interpolation between decimated samples so motion reads smooth without 60 re-renders/sec. See 12 for `decimation_hz` negotiation on the WS handshake.
- **Schema-versioned graphics.** Every broadcast graphic and overlay carries the `graphics_pack_version` it was authored against and the `rule_version`/`event schema version` of the data it renders. An overlay rendering data from a newer schema than it understands must fail closed (hide, log) rather than mis-draw on air.
- **Transport default.** **WebSocket (WSS)** is the baseline real-time transport for all state feeds (referee, graphics control, second-screen, admin), matching 03/§5. **WebTransport** is the P2+ upgrade path where head-of-line blocking on the decimated frame channel becomes visible. **WebRTC** is reserved for the *video* surfaces only (replay/Simulcam low-latency preview), never for state. Reconnection and backpressure policy is specified per surface and contracted in 12.
- **Design-token governance.** A single token source of truth (`@cy/tokens`, W3C Design Tokens JSON → CSS vars + TS) is consumed by both worlds. The sun world binds the warm AsanaAI semantic layer; the officiating world binds a neutral semantic layer over the *same* primitive ramp. **No surface hard-codes a hex value.** Overlay palettes (colour-blind-safe + high-contrast) are tokens, not per-component constants. Component ownership and the two-tier theme model are detailed in "Shared design-system notes" at the foot of this doc.
- **Localization.** All five surfaces are i18n-ready from day one via ICU MessageFormat (`next-intl`). Strings are externalised; no string concatenation. Officiating surfaces ship **en** at pilot but must not break on RTL or long-string (de/fi) locales — layouts are flex/grid, never fixed-width to a translated label. Numbers, scores, dates, and durations use `Intl` formatting per locale; **the scoring ledger and on-air score values are locale-invariant** (canonical decimal, dot separator) and only *formatted* at the edge of render. Locale never changes a stored or transmitted score.

---

## (a) Athlete / Coach App — *mostly REUSES AsanaAI (sun world)*

The home base for athletes and coaches. Phone-first for athletes, tablet/desktop for coaches. ~90% of these screens already exist in AsanaAI and are lightly extended for competition.

**Key screens & components:**
- **Profile** *(reuse)* — public/competitive identity; bio, division, records. Reuses AsanaAI public Profile.
- **History** *(reuse + extend)* — past rounds, longitudinal stats. Reuses Stats/Achievements; adds round-level explained scores.
- **Calibration Capture** *(reuse + extend)* — guided multi-pose capture; extends AsanaAI practice flow with multi-camera + warm-up wearable hooks.
- **Training Mode** *(reuse)* — the phased Arrive→Practice→Release flow, live pose classification feedback.
- **Weakness Dashboard** *(new content, reused shell)* — coach-facing: weakness detection, head-to-head, benchmarking. Built on AsanaAI Dashboard/Stats components.
- **Explained Score view** *(new component, sun-styled)* — the 4-criteria breakdown with evidence frames.

```
Athlete/Coach App  (sun world, phone + tablet)
├── Home / Dashboard
├── Profile (public)
├── History
│   ├── Round detail → Explained Score (4 criteria + frames)
│   └── Longitudinal stats / benchmarking
├── Calibration Capture (multi-pose guided)
├── Training Mode (Arrive → Practice → Release)
└── Coach View
    ├── Athlete roster
    ├── Weakness Dashboard
    └── Head-to-head / opponent prep
```

**Non-Functional UX (Athlete / Coach App)**

- **Latency feel.** Standard consumer-app responsiveness: interactions <100 ms, route transitions <300 ms. Training Mode pose feedback inherits AsanaAI's existing on-device classification budget; it is *not* on the competition officiating path.
- **Update strategy.** Optimistic UI is fine here (this is the sun world, non-authoritative). History/Explained Score read **published, immutable** projections — never live ledger writes — so they are cache-first (SWR/`stale-while-revalidate`). A round's Explained Score appears only after `performances.status = published`.
- **Offline / degraded.** Training Mode and Calibration Capture must work fully offline (PWA, queued upload) — athletes practise on poor connectivity. History/Profile degrade to last-cached view with a "showing saved data" banner. Calibration uploads resume on reconnect; never lose a capture.
- **Error / empty / loading.** *Loading:* skeleton screens reusing AsanaAI shells. *Empty:* a new athlete with no rounds gets a guided "complete your first calibration" empty state, not a blank table. *Error:* failed score fetch shows retry + cached fallback, never a stack trace.
- **Accessibility.** WCAG 2.2 AA. Explained Score evidence frames need text alternatives describing the flaw ("left knee bent 14° beyond tolerance"). Charts (weakness, longitudinal) must not encode meaning by colour alone — pair with shape/label. Full keyboard + screen-reader support reused from AsanaAI; new components inherit the same audit.
- **Device / hardware target.** Phone-first for athletes (375–430 px), tablet/desktop for coaches (Weakness Dashboard is comfortable ≥1024 px). Low-end Android is a first-class target for athletes in emerging markets — bundle budget and image weight matter.
- **Real-time transport.** Mostly request/response over HTTPS; no persistent socket required except an optional live notification channel (WSS) for "your round has been published / protest resolved." Reconnect is best-effort, lossy-OK.
- **Design-system governance.** **Sun world.** Reuses AsanaAI tokens and components wholesale; new components (Explained Score, Weakness Dashboard) are sun-styled and live in `@cy/sun`.

---

## (b) Referee Console — *NEW (officiating world)*

The most critical new build. A fixed-position, dense scoring tool. Every pixel earns trust. Embodies **"AI suggests, human confirms."** No sun warmth here — neutral, fast, evidence-first.

**Key screens & components:**
- **Live Scoring Dashboard** — per-criterion **objective values** (angle deviation, sway, hold time) shown alongside **judge input fields**; the round timeline; the current hold highlighted.
- **Deduction Feed** — a running list of detected flaws, each with an **evidence frame** (the exact still showing the bent knee / wobble) and timestamp.
- **Confidence Indicators** — high/medium/low badge on every AI suggestion; **low confidence visibly suppresses the suggested number** and prompts "human judgement required."
- **Override Modal** — judge sets her own value; **mandatory reason field**; logs identity + timestamp.
- **Replay / Protest View** — synced video + measurement overlay scrubbable to any frame; the dispute-resolution surface.
- **Confidence Calibration screen** — pre-round practice mode to build judge trust.

```
Referee Console  (officiating world, fixed screen/tablet)
├── Login (identity → signs every score)
├── Confidence Calibration (pre-round trust-building)
├── Live Scoring Dashboard
│   ├── Per-criterion: [AI objective value] + [Judge input] + [Confidence badge]
│   ├── Round timeline (current hold highlighted)
│   ├── Deduction Feed (evidence frames)
│   └── Confirm / Override
│       └── Override Modal (value + MANDATORY reason → logged)
└── Replay / Protest View (synced video + measurement overlay, frame scrub)
```

**Non-Functional UX (Referee Console) — the strictest block in this doc.**

- **Latency feel.** The judge's *own* actions (focus an input, open Override Modal, type a value) must respond in **<50 ms** — this is a fixed-position tool used under time pressure; any input lag erodes trust and slows the round. Incoming AI suggestions update on the **decimated numeric channel (~10 Hz)** with interpolated motion; deductions and confidence changes arrive on the immediate event channel. The console **never** re-renders at 60fps — see the global coalescing rule.
- **Update strategy — confirmed state only.** No optimistic UI on anything authoritative. Confirm/Override renders `pending` (dimmed + spinner, inputs locked) until the signed `audit_log` ack returns, then `committed` (timestamped, judge-attributed). If the ack times out (>2 s) the action shows `unconfirmed — retrying` and is **never** silently assumed successful. AI suggestions are clearly visually subordinate to confirmed values (weight, border, the confidence badge) so the judge always knows what is *suggested* vs *of record*.
- **Offline / degraded.** This surface is on the on-prem officiating LAN and must survive a *cloud* uplink cut with zero impact (per 03/§1). It must also tolerate a transient *LAN* socket drop: on disconnect it freezes the last known state behind a full-width amber **"FEED INTERRUPTED — scoring paused"** banner, queues nothing optimistically, and blocks confirm until reconnect. On camera-drop / low-triangulation (`confidence_state` = `reduced` or `human_only`), affected criteria visibly switch to **"human judgement required"**: the AI number is suppressed, the input is highlighted, and the criterion is tagged so the ledger records it was scored human-only. The console never invents a number to fill a gap.
- **Error / empty / loading.** *Loading:* the console boots into a locked pre-round state showing rig/calibration status; it will not present scoring inputs until the round is armed. *Empty:* between performances it shows the on-deck athlete and an empty, disabled scoring grid — not a blank screen. *Error:* a failed override write is a **blocking** modal ("score NOT recorded — retry") with no dismiss-and-forget path; an unrecoverable engine error escalates to the head judge and flags the round.
- **Accessibility — keyboard-first for judges under time pressure.** WCAG 2.2 AA, with these hard requirements: (1) **Full keyboard operation, no mouse required** — Tab order follows the criteria grid, number keys enter values, `Enter` confirms, a dedicated key opens Override, `Esc` cancels; shortcuts are shown inline and remappable. (2) **Visible focus indicator ≥3:1** (WCAG 2.2 *Focus Appearance*) so the active criterion is unmistakable at a glance. (3) **Confidence and confidence state must never rely on colour alone** — high/medium/low carry an icon + text label as well as a colour-blind-safe colour (deuteranopia/protanopia/tritanopia-checked); a high-contrast palette token set is selectable per judge. (4) **No timing trap** — WCAG 2.2 §2.2.x: the round clock is informational; it never auto-submits or auto-dismisses a judge's in-progress entry. (5) Target sizes ≥24×24 px (2.2 *Target Size*) even on the touch tablet variant.
- **Device / hardware target.** Primary: a **fixed-position judge console** — a wired desktop or kiosk-mounted landscape display (≥1920×1080) with a physical keyboard / optional numeric keypad on the officiating LAN. Secondary: a locked-down landscape **tablet** (10–12") for roaming/floor judges, same layout reflowed, with large touch targets and the same keyboard-shortcut model exposed via an on-screen keypad. Designed for venue lighting (high ambient) — hence the high-contrast palette requirement. No phone variant.
- **Real-time transport.** **WSS over the on-prem LAN** to the edge scoring engine (per 03/§5 and contracts in 12). Subscribes to: decimated numeric channel, immediate event channel (deductions/round-state), and an ack channel for its own writes. **Reconnection:** exponential backoff with jitter, max ~1 s on-LAN; on reconnect it **re-syncs from the last `seq`** of the append-only log (12 guarantees monotonic `seq` + idempotent resume) rather than replaying a flood. **Backpressure:** if the client falls behind, the server drops *intermediate decimated samples* (latest-wins) but **never** drops events — deductions/state/acks are guaranteed-delivery; numbers are best-effort-latest. The replay video pane uses a separate **WebRTC/low-latency** path, independent of the state socket.
- **Design-system governance.** **Officiating world.** Neutral semantic tokens over shared primitives; owns the `ConfidenceBadge`, `EstimatedStamp`, `OverrideModal`, `EvidenceFrame`, and `CriterionInput` components in `@cy/officiating`. These are the trust-bearing components and change only via design-review + version bump.

---

## (c) Broadcast Graphics Control — *NEW (officiating world, control-room)*

The control-room surface that drives what TV viewers see. Latency-sensitive, multi-monitor, operator-driven. Dense and toggle-heavy, but its *output* is the beautiful sun-adjacent broadcast overlays.

**Key screens & components:**
- **Overlay Toggles** — switch on/off alignment/angle lines, centre-of-gravity markers, live score breakdowns.
- **Simulcam Trigger** — select two performances, fire the ghost-overlay comparison.
- **Estimated-Visual Controls** — heart-rate / breath / muscle-heatmap toggles, each with a **non-removable "ESTIMATED" label** baked into the output.
- **Leaderboard Control** — push/update standings to air on head-judge publish.
- **Rundown / Preview** — preview-before-air monitor for every graphic.

```
Broadcast Graphics Control  (officiating world, control room)
├── Rundown / Preview (preview-before-air)
├── Overlay Toggles
│   ├── Alignment / angle lines
│   ├── Centre-of-gravity markers
│   └── Live score breakdown
├── Simulcam Trigger (pick 2 → ghost overlay)
├── Estimated-Visual Controls (HR / breath / heatmap — "ESTIMATED" locked)
└── Leaderboard Control (push to air)
```

**Non-Functional UX (Broadcast Graphics Control)**

- **Latency feel.** Operator control actions (toggle an overlay, fire Simulcam, push leaderboard) must feel **instant (<50 ms UI ack)**, but with an explicit **preview→program** model: the action lands on *preview* first; **nothing reaches air without a deliberate take.** The *output* graphics lock to camera/data within the broadcast AR budget (03/§3: ~60–90 ms) — that budget is owned by the compositor, not this control UI.
- **Update strategy — preview-before-air, confirmed.** No optimistic on-air mutation. Every graphic has three explicit states the operator sees: `preview`, `live` (on air), `taken-down`. Leaderboard pushes are gated on head-judge publish (a graphic cannot go to air ahead of the signed result). Data bound to overlays is the same decimated/event feed; the control surface shows the operator the *exact* values that will render so there are no on-air surprises.
- **Offline / degraded.** On state-feed loss the control room **holds last-good on-air graphics** (fail-frozen, not blank) and shows a prominent "data stale" indicator on the operator preview *only* (never burned into air). If a camera/AR track is lost, AR-locked overlays auto-hide rather than drift; this is fail-closed, matching the schema-versioned-graphics rule. The whole surface assumes the cloud may be gone — it is on-prem (03/§1).
- **Error / empty / loading.** *Loading:* boots to a rundown with all graphics in `preview`/off, nothing live. *Empty:* no active performance → leaderboard/standings graphics available, performance-bound overlays disabled with a reason. *Error:* a graphic that fails to render is pulled from air automatically and surfaced as a red rundown row; the "ESTIMATED"-stamp pipeline failing **disables that overlay entirely** (we never ship an estimated visual without its stamp).
- **Accessibility.** WCAG 2.2 AA for the operator UI (keyboard operable, visible focus, no colour-only state). Distinct concern for the **on-air output**: broadcast overlays must be **colour-blind-safe and legible at TV scale** — alignment/angle lines and the two Simulcam ghosts use a tokenised, CVD-checked palette with non-colour differentiators (line style, label); the "ESTIMATED" stamp meets contrast minimums against any background. The operator can preview overlays through a CVD-simulation toggle.
- **Device / hardware target.** A **multi-monitor control-room workstation** (operator UI + program/preview monitors), keyboard + optional hardware control surface / stream-deck-style buttons mapped to takes and toggles. Wide layouts (≥2× 1920 wide). Not responsive to small screens — this is a fixed installation.
- **Real-time transport.** **WSS** to the edge for state and rundown sync; **WebRTC/SRT low-latency** for the preview/program video the operator monitors. Reconnection: fast on-LAN backoff with last-good hold (above). Backpressure: latest-wins on the numeric data feed bound to overlays, guaranteed delivery on take/leaderboard-publish commands.
- **Design-system governance.** **Split.** The control *inputs* are officiating-world (dense, neutral, in `@cy/officiating`). The *output overlays* are sun-adjacent broadcast brand assets — a separately versioned **`@cy/broadcast-graphics` pack** carrying `graphics_pack_version`, owned by the broadcast design lead, with the shared `EstimatedStamp` token-driven and non-removable.

---

## (d) Second-Screen Fan App — *REUSES AsanaAI patterns + NEW engagement (sun world)*

The fan companion. Phone-first, synced to broadcast. Reuses AsanaAI's leaderboard and profile patterns; adds new engagement mechanics. Stays firmly in the warm sun world — this is delight, not officiating.

**Key screens & components:**
- **Live Leaderboard** *(reuse)* — reuses AsanaAI Leaderboard.
- **Athlete Profiles** *(reuse)* — reuses public Profile.
- **Judge-Along** *(new)* — score each hold yourself, compare to real judges.
- **Predictions & Win-Probability** *(new)* — predict winners; live probability bar.
- **Highlight Feed** *(new)* — best holds, Simulcam clips, shareable.

```
Second-Screen Fan App  (sun world, phone)
├── Live (synced to broadcast)
│   ├── Judge-Along (score the hold → reveal vs. judges)
│   ├── Win-Probability bar
│   └── Live score breakdowns
├── Predictions
├── Leaderboard
├── Athlete Profiles
└── Highlight Feed (share)
```

**Non-Functional UX (Second-Screen Fan App)**

- **Latency feel.** Sub-second perceived updates for the live leaderboard/score breakdowns, but **deliberately delayed to broadcast sync** — the fan app must not reveal a score *before* it airs (it follows the broadcast clock, not the officiating clock). Judge-Along reveals are gated on the on-air reveal.
- **Update strategy — optimistic where free, confirmed where it matters.** Fan-local actions (submit a Judge-Along guess, a prediction, a like) are optimistic and reconcile silently. Authoritative data (leaderboard, scores) is **read-only published projections** from the cloud second-screen service (03/§7: only fan-safe projections cross the boundary) — never the raw ledger. Win-probability animates between decimated samples like other numeric feeds.
- **Offline / degraded.** Tolerant by design (stadium Wi-Fi / congested cellular): aggressive caching, queue-and-retry for predictions, graceful "reconnecting…" without losing the user's place. On total loss it shows last-known leaderboard with a timestamp. Massive concurrent fan load is handled by the cloud service + CDN, never by touching the officiating edge.
- **Error / empty / loading.** *Loading:* skeletons, sun-styled. *Empty:* pre-event / between-rounds shows schedule and athlete profiles, not a void. *Error:* a failed prediction submit retries quietly; a failed leaderboard fetch shows cached + a soft retry — fans never see officiating-grade error language.
- **Accessibility.** WCAG 2.2 AA. Win-probability and score breakdowns must convey rank/lead without colour-only encoding; share images include alt text; Judge-Along is fully operable by keyboard and screen reader. Reuses AsanaAI's accessibility baseline.
- **Device / hardware target.** **Phone-first, low-end-friendly** (this is the highest-volume, most device-diverse surface — budget Android, older iOS, weak networks). Tight JS/image budgets; works as an installable PWA. Tablet/desktop are progressive enhancements.
- **Real-time transport.** **WSS** to the **cloud** second-screen service (not the edge), per 03/§4–§7 — fan fan-out is a cloud concern. Reconnection: lossy, best-effort, latest-wins; dropped frames are invisible to fans. Heavy backpressure handling at the service tier (the client just takes latest).
- **Design-system governance.** **Sun world.** Reuses AsanaAI Leaderboard/Profile; new engagement components (Judge-Along, Win-Probability, Highlight Feed) are sun-styled in `@cy/sun`. The `ConfidenceBadge`/`EstimatedStamp` appear here too wherever estimated visuals or AI scores are shown — same shared, non-optional components.

---

## (e) Organiser / Admin Console — *NEW (officiating world, desktop)*

The back-office that stands up and governs an event. Desktop, form- and status-heavy. Functional, not pretty.

**Key screens & components:**
- **Event Setup** — formats, categories, schedule, divisions.
- **Athlete Seeding** — import/link AsanaAI profiles, brackets, start order.
- **Venue Calibration Status** — per-camera-rig green/red board; **no round starts on red.**
- **Consent & Governance** — biometric/estimated-visual consent capture as a gate; data-use governance.
- **Results Publishing** — head-judge sign-off, signed/replayable record release, archive.

```
Organiser/Admin Console  (officiating world, desktop)
├── Event Setup (formats / categories / schedule)
├── Athlete Seeding (link AsanaAI profiles → brackets)
├── Venue Calibration Status (per-rig green/red gate)
├── Consent & Governance (consent as a gate)
└── Results Publishing (sign-off → signed record → archive)
```

**Non-Functional UX (Organiser / Admin Console)**

- **Latency feel.** Standard back-office responsiveness (<100 ms interactions). The one latency-critical view is **Venue Calibration Status**, which must reflect rig health in near-real-time — a green→red flip has to be visible *before* anyone starts a round.
- **Update strategy — confirmed.** All gating actions (publish results, open consent gate, arm a round) are confirmed, never optimistic. Results Publishing is the head-judge sign-off → signed, replayable record release; it shows `pending-signature` → `signed` and surfaces the `audit_log` hash-chain reference (03/§6) so release is auditable.
- **Offline / degraded.** On-prem; survives uplink loss (03/§1). Calibration Status is the safety gate: **no round starts on red** is enforced in the UI *and* server-side — a degraded camera rig hard-blocks arming. If the status feed itself drops, the gate **fails closed** (treated as red).
- **Error / empty / loading.** *Loading:* status board shows per-rig "checking…" not assumed-green. *Empty:* a fresh event walks the organiser through setup (formats → seeding → calibration → consent) as a checklist. *Error:* a failed publish is blocking and re-tryable, never partially committed; a consent-gate failure blocks the affected athlete from competing with a clear reason.
- **Accessibility.** WCAG 2.2 AA. The red/green calibration board must not rely on colour alone — pair with icon + text status ("RIG 3: OFFLINE"). Forms are fully keyboard-navigable with proper labels/error association. Visible focus, no colour-only validation.
- **Device / hardware target.** **Desktop, on the officiating LAN** (organiser laptop / back-office workstation, ≥1280 px). Form- and table-dense. No phone variant; a tablet read-only status view is a nice-to-have for floor walk-arounds.
- **Real-time transport.** **WSS** to the edge for Calibration Status and round/event state; request/response for setup/seeding CRUD. Reconnection: on-LAN backoff; status feed fails closed on disconnect.
- **Design-system governance.** **Officiating world.** Neutral, functional, in `@cy/officiating`; reuses shared table/form/modal primitives. Owns the `RigStatusBoard` and `ConsentGate` components.

---

## Shared design-system notes

- **Shared primitives across all five surfaces:** design tokens, buttons, inputs, tables, modals, the score-breakdown component, leaderboard component, athlete card. Build these once.
- **Sun visual language carries over** to: Athlete/Coach App, Second-Screen Fan App, and the *output* of Broadcast Graphics (overlays should feel warm and branded on air).
- **Denser officiating UI required** for: Referee Console, Broadcast Graphics Control inputs, Organiser/Admin Console — these prioritise information density, speed, and evidence over warmth.
- **The "ESTIMATED" stamp** and the **confidence badge** are reusable, non-optional components wherever estimated data or AI suggestions appear — they are how the product keeps its honest line and its trust.
- **Reuse summary:** Athlete/Coach ~90% reuse, Fan ~60% reuse (patterns + new mechanics), Referee/Broadcast/Admin ~0% screen reuse (primitives only). Overall ~70% reuse of AsanaAI across the athlete/coach/fan/training/data tiers, as targeted.

### Design-system governance (tokens, packages, ownership)

A single token pipeline feeds both worlds so they can never drift on the things that must stay shared (the trust components, spacing, type scale):

```
@cy/tokens        W3C Design Tokens JSON  →  CSS custom properties + TS consts
                  primitives (colour ramps, space, radii, type, motion)
                  + two semantic layers:
                      • sun    (warm AsanaAI mapping)
                      • officiating (neutral, high-density mapping)
                  + overlay palettes: default · colour-blind-safe (CVD) · high-contrast
@cy/sun           sun-world components  → Athlete/Coach, Fan, broadcast-overlay styling cues
@cy/officiating   dense-tool components → Referee, Graphics-control inputs, Admin
@cy/shared        trust + base primitives shared by BOTH worlds:
                      ConfidenceBadge · EstimatedStamp · ScoreBreakdown · Leaderboard
                      · AthleteCard · Button · Input · Table · Modal
@cy/broadcast-graphics   separately versioned on-air pack (graphics_pack_version)
```

- **No hard-coded values.** Colours, spacing, type, and motion come only from tokens. Overlay palettes (default / CVD-safe / high-contrast) are token sets switched at runtime, not forks of a component.
- **Ownership.** `@cy/shared` (the trust components) is owned by the design-systems lead and changes only via review + version bump — these are load-bearing for the product's honesty. `@cy/broadcast-graphics` is owned by the broadcast design lead and versioned independently so on-air changes never silently alter an officiating UI. Each world's package is owned by its respective squad.
- **Two worlds, one ramp.** The sun and officiating semantic layers map over the *same* primitive ramp, so the warm experience and the dense tool are siblings, not strangers — which is what keeps the broadcast output feeling branded while the tools stay neutral.

### Localization & internationalization (all surfaces)

- **ICU MessageFormat via `next-intl`**, strings externalised per surface; no concatenation, full plural/gender/select support.
- **Layout is locale-resilient:** flex/grid only, no fixed widths to a translated label; verified against a long-string pseudo-locale and at least one RTL locale before any new surface ships.
- **`Intl`-formatted** numbers, dates, durations, ranks per user locale at render time only.
- **Scores are locale-invariant on the wire and in the ledger** — canonical decimal (dot), formatted only at the render edge. A locale change never alters a stored, transmitted, or on-air score value. (Contract enforced in 12-api-event-contracts.md.)
- **Pilot ships `en`;** officiating surfaces are en-only at pilot but built i18n-clean so they don't break under other locales. Fan/athlete surfaces are the first to receive additional locales.
