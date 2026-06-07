# 00 — The Project in Plain Language

*A briefing for the UI/UX and build team, written the way a yoga instructor and championship organiser would explain it to you over coffee. No assumptions about prior knowledge.*

---

## First, picture the sport

Imagine a stage, bright lights, and a single athlete in the centre. Music may or may not be playing. On a silent cue, they fold their body into a shape — a deep backbend, a one-legged balance, a full split held in mid-air on their hands. They hold it. Perfectly still. Then they flow into the next shape. Over a few minutes, they perform a sequence of these shapes, and a row of judges scores how good each one was.

That is **competitive yoga**. It is real, it is growing, and forza.ventures wants to put it on television. Our job is to build the technology that helps the judges score it fairly *and* helps the audience at home actually understand what they're watching.

Let me walk you through the world first, because you can't design for a sport you don't feel.

---

## The vocabulary you'll hear constantly (mini-glossary)

Keep this nearby. We use these words everywhere.

- **Asana** — a single yoga pose or shape. "Asana" literally means "seat" or "posture." Each pose has a name (e.g., *Natarajasana*, the dancer's pose). Think of an asana as one "move."
- **Hold** — the part where the athlete freezes in the asana and stays motionless. The longer and stiller the hold, the better. Holds are where most of the scoring happens.
- **Vinyasa** — the *transition* between two asanas — the flowing movement that connects shape A to shape B. In musical formats, vinyasa is choreography; it should look smooth and intentional, not wobbly.
- **Round** — one scored performance run by an athlete (or team). A competition is several rounds. Think of a round like a "lap" or an "innings." Each round produces a score.
- **Deduction** — points taken *away* for a flaw: a bent knee that should be straight, a foot that slips, a wobble during a hold. Judging is mostly about spotting deductions.
- **Alignment** — whether the body parts are in the geometrically correct positions (is the spine truly vertical? is the leg actually straight?). Hard to see with the naked eye from a distance.
- **Stability** — how still the athlete is during a hold. Tiny tremors and sway count against them. Often invisible to a TV viewer.
- **Centre of gravity (CoG)** — the balance point of the body. In balances, keeping it over the support point is the whole game.
- **Simulcam** — a broadcast trick (famous from Olympic skiing) where two performances are overlaid as "ghosts" on the same screen, so you can compare two athletes doing the same pose side-by-side, superimposed.
- **Calibration** — a short setup step where the system "learns" the athlete's body and the camera positions so its measurements are accurate.

---

## How a competition is actually structured

Two things vary, and they combine like a menu:

**Categories (the *vibe*):**
- **Non-Musical** — pure, quiet, technical. No soundtrack. It's about precision and control. Think gymnastics' compulsory routines.
- **Musical** — performed to music, with artistry, expression, and choreography. Think figure skating. Judges also weigh *how it made you feel*, not just the geometry.

**Formats (the *headcount*):**
- **Solo** — 1 athlete.
- **Pair** — 2 athletes, often in contact (one supporting the other, partner balances).
- **Group** — 5 athletes, building synchronised formations together.

So a single event might run "Non-Musical Solo," "Musical Pair," "Musical Group," and so on. **This matters for us:** a lone person doing an upright pose is something a computer can measure cleanly. Five people tangled together in a pyramid is something only a human can really judge. We'll come back to this honest line a lot.

---

## Scoring, in plain numbers

Our model is **hybrid scoring**: roughly **4 criteria, each worth up to 10 points, for 40 points per round.** The four criteria are things like *alignment/precision, stability/control, difficulty, and artistry/execution* (exact wording is the federation's call). The key idea for you: a score is never one mysterious number. It's **four explainable numbers that add up.** Our entire product philosophy hangs on making each of those four numbers *show its work*.

---

## Where judging hurts today (the problem we're solving)

Here's the honest truth from inside the judging booth. Yoga judging is **subjective and exhausting.** A judge watches a fast performance from one fixed seat and has to catch, in real time:

- A knee bent 8 degrees too much. From 15 metres away. While also watching the other leg.
- A 2-second micro-wobble during a hold that the audience never noticed.
- Whether *this* athlete's split is genuinely deeper than the previous one's, twenty minutes later, from memory.

Two specific pains dominate:

1. **Invisible differences.** Alignment and stability gaps are often too small or too fast for the human eye, especially on TV. The audience sees two "great" poses and has no idea why one scored 9 and the other 7. That erodes trust and makes for boring television.
2. **Subjectivity and disputes.** Different judges, different scores. Athletes protest. Without evidence, protests become arguments. The sport needs the equivalent of cricket's or tennis's **Hawk-Eye** — a neutral, replayable record that settles disputes calmly.

---

## What we are *really* building (and why)

We are building **machine-assisted human judging.** Read that phrase twice, because it is the soul of the whole product.

The single most important design principle: **the AI suggests, the human judge confirms.** The computer never decides the score. It measures what it *can* measure objectively (a joint angle, a sway amount, a hold duration), proposes a sub-score, and the human judge either accepts it or overrides it. **Every override is logged with a reason. Every score is replayable and cryptographically signed.** So when an athlete protests, we don't argue — we replay the moment, show the measurement, and the decision stands or is corrected on evidence.

We serve **two audiences at once:**

- **Officials** (judges, head judge, coaches, organisers) need a *dense, precise, trustworthy* tool. Numbers, evidence frames, audit trails.
- **Fans** (TV viewers and second-screen users) need the *opposite feel*: beautiful, simple, exciting overlays that make the invisible visible — "see that green line? her spine is 3 degrees off vertical, that's the deduction." We turn judging into something you can *watch and play along with*.

The mission in one sentence: **make performance quality visible and make scoring transparent.**

---

## Goals & non-goals (read this before you design a single screen)

Let's be blunt about what success means, so we don't drift into building a pretty toy.

**Our goals — what this product must do:**
1. **Make every score explainable.** A score is four numbers, each of which can show its work with a frame and a measurement. If a viewer or athlete can't see *why*, we've failed.
2. **Cut judge cognitive load and dispute time.** The judge should score faster and defend any score in seconds, not arguments.
3. **Settle disputes on evidence, not authority.** Replayable, signed record. A protest ends with "look at the frame," not "the judge said so."
4. **Make the invisible visible for fans.** The 3-degree spine deviation, the micro-wobble — turn them into something Grandpa Joe can see and Priya can play along with.
5. **Feed the flywheel.** Every competition produces clean data back into AsanaAI and athlete/coach profiles.

**Non-goals — what we deliberately do NOT do (and why):**
- **The AI does not decide scores.** Ever. It suggests; a human confirms. (Removing the human breaks trust, governance, and the whole "machine-assisted" promise.)
- **We do not measure what the camera can't honestly see.** Contact poses, deep inversions, and artistry stay human-judged. We will not fabricate precision.
- **We do not present estimated visuals as facts.** rPPG heart rate, breathing, muscle heatmaps are broadcast storytelling, permanently stamped "estimated."
- **We do not use wearables in live competition.** Live is camera-only. Wearables live in training/calibration only.
- **We are not replacing the federation's rulebook.** Exact criteria wording, weighting, and eligibility are the federation's call; we implement, we don't legislate.

## What "good" looks like — measurable success criteria

Voice stays warm, but the targets are concrete. These are the things we'll actually instrument.

**For officials (judges, head judge, organisers):**
- **Confirm rate without override** on measurable holds (Solo upright) is high *and* stable — the AI's suggestions are trusted enough to one-tap-confirm. Target a clear majority; track the trend, not a vanity number.
- **Override-with-reason completeness: 100%.** No override should ever land without a logged reason. This is non-negotiable, not a goal to "improve toward."
- **Time-to-resolve a protest** drops from "a tense conversation" to "pull the frame, decide" — measured in single-digit minutes, on evidence.
- **Zero unsigned published results.** Every published round carries a verifiable signature and a replayable record.
- **Calibration gate held: no round starts on a red rig.** Measured as count of rounds started on uncalibrated rigs = 0.

**For fans (TV + second-screen):**
- **"Now I get it" comprehension:** after a graphic plays, a viewer can correctly say which athlete scored higher and roughly why. Validate with audience testing, not assumption.
- **Second-screen judge-along engagement:** fans submit their own score before the reveal on a healthy share of holds; retention across rounds.
- **Estimated-vs-measured clarity:** in testing, viewers can correctly identify which on-screen numbers are "estimated." If they can't, the labelling has failed.
- **No misleading-graphic incidents on air:** an estimated visual presented as fact is a P0 integrity bug, not a polish item.

A note on honesty in metrics: we measure **confirm rate** and **trust**, but we do *not* chase "AI accuracy vs. the judge" as if the judge were ground truth on poses the camera can't see. On human-judged poses there is no machine "correct," so we don't score the machine against one.

## The honest line: real measurement vs. convincing visualisation

This is the most important thing for designers to internalise, so we never overpromise or mislabel.

Some things are **real measurement** — genuine numbers we'll stake a score on:
- Joint angles on **Solo, held, upright** poses (clean line of sight).
- **Stability / sway** during holds (we can track tremor).
- **Hold time** (a stopwatch is honest).

Some things stay **human judgement** — the AI assists but does not score:
- **Contact poses** in Pair/Group (bodies overlap, the camera can't tell whose limb is whose).
- **Inversions and extreme twists** (the body folds onto itself; cameras get confused by foreshortening).
- **Artistry** (no machine feels grace).

Some things are **broadcast-only visualisations** — eye candy, never scored, and **always labelled "estimated":**
- **Heart rate, breathing rate, muscle-effort heatmaps** derived from the camera. These are *impressive storytelling tools*, not facts. The UI must visibly stamp them "estimated" so no one mistakes a pretty heatmap for a measurement.

And one technical reality that shapes everything: **a single webcam cannot see depth.** Yoga is full of foreshortening, twists, and inversions — limbs pointing toward or away from the lens. To measure angles you can trust in competition, you need **multiple cameras producing a 3D reconstruction.** (Note for the build team: this is why *live competition needs multi-camera 3D*, while the everyday training app can survive on one camera with looser claims.) **Wearables** — heart-rate straps, motion sensors — are allowed *only in training and calibration*, never in live competition. **Live is camera-only.**

---

## The ecosystem flywheel — told as a story

Here's the part that makes this a *business*, not just a gadget.

We already own a consumer yoga app called **AsanaAI.** Millions of everyday people use it to practise at home; it watches them through their phone camera and tells them which pose they're in. Now imagine a talented amateur practising on AsanaAI. The app notices she's exceptional, and nudges her: *"You're in the top 1% — there's a regional competition near you."* She enters. At the venue, the same friendly visual language greets her. She competes; the broadcast makes her holds look spectacular on TV. Fans at home open the second-screen app, judge along, and become followers. Her competition data flows back into her athlete profile, which feeds her coach's dashboard, which makes her better, which makes better television.

That loop — **practise → discover talent → compete → broadcast → fans → data → better practice** — is the flywheel. AsanaAI is the funnel that feeds athletes in and the magnet that pulls fans in. It's why ~70% of the athlete, coach, fan, and training surfaces can *reuse* AsanaAI's existing screens and warm "sun" visual design, while only the high-stakes **officiating and broadcast-control** tools need to be built fresh and dense.

That's the project. A sport made fair for its judges and legible for its fans, with an app we already own as the engine underneath.

---

## Where the spec is still uncertain — open questions

Honesty again: these are unresolved, and pretending otherwise would mislead the build team. Treat each as a decision we owe ourselves before the relevant surface ships.

1. **Exact criteria & weighting.** We assume ~4 criteria ×10 = 40/round, but the precise wording, whether all four weigh equally, and whether weights differ by category (Musical vs Non-Musical) are the **federation's** call. Build the scoring UI to take weights as configuration, not as hard-coded constants.
2. **Confidence thresholds.** Where exactly does "high/medium/low confidence" fall, and at what point does the system stop suggesting a number and say "human judgement required"? These thresholds need real calibration data; ship them as tunable, not magic.
3. **Multi-camera reality at venues.** How many cameras, what rig, what minimum calibration quality counts as "green"? This depends on venue and broadcast-truck constraints we don't fully control. The calibration gate is firm; the hardware spec behind it is open.
4. **Latency budget.** Broadcast overlays and second-screen sync have a real time budget. We have not yet committed to a number. Until we do, treat "low latency" as a requirement to be measured, not a feeling.
5. **Estimated-visual accuracy bounds.** rPPG heart rate and breathing from camera vary with skin tone, lighting, and motion. We must document the conditions under which we'll even *show* them, and never imply a precision we don't have.
6. **Consent & data governance specifics.** What exactly do athletes consent to (estimated biometric visuals on air, data flowing into AsanaAI), how is it revoked, and what jurisdictions apply? Owned by the federation's legal/governance role — flagged, not yet answered (see Persona file).
7. **Dispute escalation authority.** The boundary between a judge's call, the head judge's override, and a formal federation appeal needs a documented chain. We sketch it in the journeys; the federation must ratify it.
8. **Accessibility & language scope.** Which languages at launch, and what accessibility conformance target (captions, screen-reader support, colour-blind-safe overlays)? Defaulting to "later" is how accessibility gets skipped — name a target.
