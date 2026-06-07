# 02 — Screen Inventory & Information Architecture

*The actual surfaces we build, the key screens inside each, and how they're navigated. For every surface we note what **REUSES AsanaAI** (the existing Next.js 14 consumer app with its warm "sun" design) versus what is **NEW** and needs a denser, data-heavy "officiating" look.*

A quick orientation on the two visual worlds:

- **The "sun" world (warm, reused).** AsanaAI's existing language — Fraunces/Inter type, warm tones, calm, phased, friendly. Used for athletes, coaches, fans, and training. Roughly **70% reuse.**
- **The "officiating" world (dense, new).** High-information-density, fast, neutral, evidence-first. Used for the Referee Console, Broadcast Graphics Control, and the Admin console. These are *tools*, not experiences. Built fresh, sharing only base design-system primitives (tokens, buttons, tables) with the sun world.

There are **five surfaces.**

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

---

## Shared design-system notes

- **Shared primitives across all five surfaces:** design tokens, buttons, inputs, tables, modals, the score-breakdown component, leaderboard component, athlete card. Build these once.
- **Sun visual language carries over** to: Athlete/Coach App, Second-Screen Fan App, and the *output* of Broadcast Graphics (overlays should feel warm and branded on air).
- **Denser officiating UI required** for: Referee Console, Broadcast Graphics Control inputs, Organiser/Admin Console — these prioritise information density, speed, and evidence over warmth.
- **The "ESTIMATED" stamp** and the **confidence badge** are reusable, non-optional components wherever estimated data or AI suggestions appear — they are how the product keeps its honest line and its trust.
- **Reuse summary:** Athlete/Coach ~90% reuse, Fan ~60% reuse (patterns + new mechanics), Referee/Broadcast/Admin ~0% screen reuse (primitives only). Overall ~70% reuse of AsanaAI across the athlete/coach/fan/training/data tiers, as targeted.
