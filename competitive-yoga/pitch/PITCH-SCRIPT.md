# Drishti — Spoken Pitch Script

> The words to say over each slide. ~6 minutes at a calm pace. **[CUE]** = delivery / wow moment.
> Two openers provided: investor-flavoured and federation/client-flavoured. Pick per room.

---

## Cold open (choose one)

**Investor version:**
> "Every few decades a sport gets a technology that makes it suddenly *watchable* — Hawk-Eye for tennis, DRS for cricket, the virtual first-down line for football. Each one minted a category. **[CUE: pause]** We're going to do that for yoga — a discipline a *billion* people already practise, that has never had a way to be fairly judged or properly televised."

**Federation / client version:**
> "Your athletes train for years to hold a pose to the millimetre. And the audience at home can't see *any* of it — and honestly, neither can the judges, not reliably. **[CUE: pause]** We built the technology that makes that precision visible, and the scoring defensible."

---

## Slide 1 — Title *(hero image)*
> "This is **Drishti**. In yoga, *drishti* is the point of focused gaze. Our Drishti is the system's gaze — it makes the invisible scorable, and it makes competitive yoga finally watchable. We're the team behind AsanaAI, and we built this to be pilot-ready."

## Slide 2 — The Problem *(judges image)*
> "Competitive yoga has two problems that are really one problem. It's **beautiful to do, almost impossible to judge, and hard to watch.** The alignment, the stillness, the control — invisible on camera. Judges disagree on tiny deviations, and a contested deduction can't be defended on air. And a fan can't see *why* one athlete won. **[CUE]** No 'why', no fans, no sport."

## Slide 3 — Why Now
> "Why hasn't this been built? Because until recently it couldn't be. Three things just changed. Fans already *trust* machine-assisted officiating — Hawk-Eye proved that. Markerless 3D pose estimation is finally accurate enough to measure a real joint angle from cameras alone. And — crucially — **we already shipped the hard part.** AsanaAI runs real-time pose tech in production today."

## Slide 4 — The Solution
> "Drishti is one platform with two layers. **Layer A** gives referees objective, camera-only measurement — and every number is explainable and replayable. **Layer B** gives broadcasters and fans real-time graphics that make the sport legible. **[CUE: slow down, this is the thesis]** And it's built on one principle: *augment, never replace.* The machine suggests. The human judge confirms. Always."

## Slide 5 — How It Works *(capture rig image)*
> "Under the hood: six to eight synchronised cameras triangulate a true 3D skeleton — no wearables, no depth a single camera could fake. And like cricket's DRS, we run two tiers: a **live tier** for the on-air feel in under a tenth of a second, and an **adjudicated tier** that computes the official, signed, replayable deduction in a short review window."

## Slide 6 — The Trust Backbone *(referee console image)* — **★ key slide**
> "This is the most important screen in the company. **[CUE: let them read it]** The referee sees the measured angles, the candidate deductions, and a *confidence* for each. Approve, or override — one tap. If the system isn't sure, it *abstains* and hands it to the human. Every override is logged. Every score is reproducible. **This is the feature that gets a federation to say yes.**"

## Slide 7 — Broadcast Experience *(AR overlay image)*
> "For the audience, the performance finally explains itself: alignment indicators, a balance marker, live scores and leaderboards — keyed straight into the broadcast feed, broadcast-grade."

## Slide 8 — The Wow Moment *(show-me-why image)* — **★ the demo**
> "And here's the moment that wins the room. **[CUE: point at screen]** You tap any score, and the replay shows you the exact joint, the exact angle, and the exact reason — *'standing knee flexed eight degrees, minus zero-point-three.'* **[CUE: pause]** A black-box score gets rejected. *Evidence* is undeniable. We turn disputes into highlights."

## Slide 9 — Fan Engagement *(second-screen image)*
> "Then we turn watching into playing. On a second screen, fans **judge along** — and compare their call to the AI and the real judges. Live win-probability, predictions, instant shareable highlights. It's engagement *and* it teaches people how to watch the sport — which is how a niche becomes a category."

## Slide 10 — The Moat *(ecosystem image)* — **★ why us**
> "Now, why us and not a broadcast-graphics vendor? **[CUE]** Because of this loop. Our consumer app, AsanaAI, generates labelled pose data, which makes our models better, which surfaces competition-ready amateurs, who feed the competitive platform, which creates fans, who download the app. A vendor shows up with cameras and an empty model. **We show up with a trained model *and* an audience.** That's a moat that compounds."

## Slide 11 — Business Model
> "Six revenue streams: platform licences to organisers, a data-analytics SaaS for teams and coaches, fan and sponsorship revenue on the second screen, the consumer app subscriptions that *are* the funnel, anonymised benchmark licensing, and integration services. Indicative program two to three-and-a-half million, pilot to full. And we *buy* the broadcast graphics and *build* the defensible IP — so the margin is protected."

## Slide 12 — Traction
> "This is not slideware. AsanaAI is **live in production.** Behind this pitch is a thirty-nine-thousand-word, senior-reviewed build spec — reliability, security, validation, API contracts, a risk register. The Solo pilot is fully scoped and costed. We can stand it up in weeks."

## Slide 13 — Roadmap
> "We earn trust before we scale. Phase zero builds a fair, diverse dataset. Phase one is the Solo pilot — and proves latency and auditability on a *real* feed. Then multi-format, then group. We deliberately keep contact poses human-judged until the science is undeniable. **[CUE]** That honesty is a feature, not a limitation."

## Slide 14 — The Ask
> "So here's the ask. **[CUE: confident, direct]** Fund a Solo pilot. Let us prove three things on a real feed — on-air latency, officiating latency, and end-to-end auditability — the exact three things you need to verify before betting a televised season on it. **[CUE: final line, slow]** We give judges a defensible instrument, broadcasters a sport that explains itself, and you a flywheel only we own. Let's build it."

---

## Anticipated Q&A (have these ready)
- **"Can a camera really replace a judge?"** → "It doesn't. It *assists*. Humans keep authority on every call; the system abstains when unsure. That's the whole design."
- **"What about accuracy / fairness?"** → "We never deduct on differences below the measurement noise floor (~5°), we normalise for body type, and we validate against expert-judge consensus and publish stratified bias audits. (Detail in `spec/11`.)"
- **"Why not just buy off-the-shelf?"** → "The graphics, yes — we buy those. The scoring engine, the data platform, and the consumer flywheel are the defensible IP. That's what we build."
- **"What's the data/privacy story?"** → "Biometric data is treated as GDPR special-category: explicit consent, retention limits, athlete erasure rights. Governance is a selling point. (`spec/09`.)"
- **"What do you need from us?"** → "Decisions on scoring-criteria ownership, thresholds, data ownership, and the v1 asana set — all listed in `spec/13` — plus pilot venue access and athlete consent."
