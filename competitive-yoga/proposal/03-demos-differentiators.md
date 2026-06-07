# 03 — Demonstrations & Differentiators

The fastest way to win a room is to let them *see* the system reason. Below are the five demonstrations we would bring to day one of the engagement — each runnable on real or staged footage — followed by the innovations we propose **beyond the brief** and the concrete evidence that we can already build at this level.

---

## The five pitch-winning demos

### 1. "Show me why" — the live deduction explainer

**What the audience sees.** A score appears on screen. A presenter taps it. The frame freezes, the athlete's skeleton lights up, the offending joint pair pulses red, and a plain-English caption reads: *"−0.4 — front knee 12° past vertical at peak hold; template tolerance is 5°."* A second tap shows the rule that fired and the exact frame range it was measured over.

**The AI under it.** Multi-camera 2D keypoints (RTMPose live tier) triangulated to a 3D skeleton, compared against the versioned pose-template DSL. Every deduction is a deterministic rule evaluation, so the explanation is the *cause*, not a post-hoc guess. The annotated frame and reason are emitted by the same scoring engine that produced the number.

**Why it lands.** It converts "trust the black box" into "audit the math." Federations, judges and broadcasters all fear opaque automation; this demo removes the fear in ten seconds. It is the single most persuasive thing we can show because it makes our explainability backbone tangible.

### 2. 3D Simulcam ghost + live AR scoring overlay

**What the audience sees.** The current athlete holds a pose while a translucent "ghost" of the ideal template — or a reigning champion's recorded attempt — is superimposed in correct 3D perspective as the broadcast camera moves. Alignment guides, a centre-of-gravity marker and the live criterion scores float in the scene and stay locked to the body.

**The AI under it.** 3D pose reconstruction feeds a body-matched ideal-form model so the ghost is scaled to *this* athlete, not a generic mannequin. Camera-tracking metadata (Mo-Sys / Stype) anchors the AR; the graphics are rendered through a bought broadcast engine (Vizrt or Unreal + Zero Density).

**Why it lands.** This is the televisual money shot — the thing that makes competitive yoga *look* like a premium, data-rich sport. It signals we understand broadcast, not just computer vision.

### 3. Auto highlight reel + AI co-commentary

**What the audience sees.** Seconds after a routine ends, a 30-second highlight clip plays, cut to the moments where scores swung most, with on-screen call-outs and a generated voice line: *"Watch the recovery here — she claws back 1.1 points on stability after a shaky entry."*

**The AI under it.** The scoring engine already emits a timestamped *score-event stream* (entry, peak hold, sway spike, deduction, recovery). A generative layer turns that structured stream into edit decisions and grounded commentary copy. Because the language model only narrates numbers the engine produced, it cannot invent a score.

**Why it lands.** It shows the data platform pays for itself in content. One scoring run produces officiating, AR, *and* social-ready media — three products from one pipeline.

### 4. Judge-along second screen + prediction game

**What the audience sees.** On a phone, a viewer scores the routine themselves before the official result lands, sees how close they were to the panel, and climbs a live leaderboard. Push alerts fire on big swings.

**The AI under it.** This is largely the AsanaAI fan/data tier re-skinned: the same Next.js + Postgres stack, the same leaderboard and profile primitives, now fed by the live score-event stream over a real-time channel.

**Why it lands.** It proves the fan-engagement category is low-risk and near-ready, and it demonstrates the audience channel that a pure broadcast-tech vendor has to build from zero.

### 5. The ecosystem demo — one account, two surfaces, one model

**What the audience sees.** A single user logs in to the AsanaAI practice app on a laptop, performs an asana, and gets segmented and scored. Then the *same account* appears on the competition platform, scored by the *same model family*, with practice history visible to the broadcast graphics ("ranked #3 nationally in her training cohort").

**The AI under it.** Shared pose backbone and shared data model across consumer and competition tiers; the practice app's segmenter and the competition engine's scorer are lineage-linked.

**Why it lands.** This is the moat made live. It shows the data flywheel, the talent funnel and the audience channel as one continuous product — something a competitor with only a broadcast graphics stack structurally cannot replicate.

---

## Beyond the brief

The brief asks for referee support and broadcast AR. We propose to extend it along five axes that turn a tooling contract into a defensible platform.

### Explainable judging — the trust backbone

Every score is reproducible, every deduction traceable to a rule and a frame, and every officiating decision replayable. This underwrites demos 1 and 2 and is the precondition for any federation to adopt machine assistance. It is also what lets us run human-judge agreement studies (see doc 05) with real numbers.

### Generative broadcast

The score-event stream is a content factory: auto highlights, AI co-commentary, auto-generated lower-thirds and shareable per-athlete cards. Generative components *describe* and *edit* — they never *score*. This separation keeps broadcast creativity and officiating integrity in different lanes.

### The copilot layer — RAG-grounded, role-specific

| Role | What the copilot does | Grounding |
|------|----------------------|-----------|
| Referee | "Why was this flagged?", surface comparable past cases, draft override rationale | RAG over the live score-event log + rules DSL |
| Coach | Post-event breakdown vs template and vs athlete's own history | Athlete training + competition records |
| Organizer | Run-of-show status, scoring queue, exception alerts | Operations telemetry |
| Fan | "What just happened?" natural-language recap | Public score-event stream |

Every copilot is **retrieval-grounded**: it answers only from logged numbers and rules, so it cannot hallucinate a score or a deduction. Unknown answers return "not in the record," never a guess.

### Integrity & anti-cheat

- **Illegal-assist detection** — flag external support, prohibited contact in Solo, or out-of-bounds aids via the 3D scene.
- **Signed, hash-chained audit trail** — each scoring decision is cryptographically signed and chained to the previous one; tampering breaks the chain. This is replayable end-to-end.
- **Anomaly flagging** — statistical outliers (impossible kinematics, sensor dropouts, score patterns inconsistent with history) are surfaced for human review, not auto-actioned.

### Research-grade scoring

- **Difficulty-adjusted scoring** — credit weighted by pose difficulty, not just deviation.
- **Transition / flow quality** — score the *movement between* poses, not only static holds, opening artistic-merit signals that judges currently assess by feel.
- **Generative body-matched ideal-form overlay** — the same model that drives the Simulcam ghost also improves *fairness*: by normalising the "ideal" to each athlete's morphology, it reduces bias against different body types in template comparison.

---

## Relevant capability evidence

We are not pitching vapourware. **We already ship AsanaAI** — a real-time, in-browser pose application (Next.js 14 + TensorFlow.js) with live inference, plus a production backend (Express, Drizzle, Postgres, JWT) powering dashboard, stats, achievements, diet, leaderboard and profile features.

What this proves, concretely:

- We can run **real-time pose inference in production**, in the browser, today.
- We have a **shipped data platform** — auth, profiles, leaderboards, stats — that is ~70% reusable for the fan, training and data tiers of this engagement.
- We understand the **full product loop**, from model to UI to retention features.

We are explicit about the gap: AsanaAI's model is a *pose classifier*, reusable here as an **asana segmenter**, not as the joint-angle judging regressor. The multi-camera 3D judging inference is **new build** — and it is exactly the work this proposal scopes. What AsanaAI removes is the *capability risk*: the question is no longer "can this team build real-time pose products," it is "how fast do we extend a proven team to the officiating-grade pipeline." The next two documents answer that.
