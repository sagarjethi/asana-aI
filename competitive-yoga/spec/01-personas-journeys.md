# 01 — Personas & User Journeys

*Who uses this, what they're trying to do, what frustrates them, and the exact step-by-step path they walk. Read File 00 first if you haven't — it explains the sport.*

Each persona has **Goals**, **Pains**, **Context/Devices**, then a **numbered journey** with the emotional/trust moments called out, because those moments are where good UX is won or lost.

---

## 1. The Competitive Athlete — "Maya, 24"

**Goals:** Compete well, understand *exactly why* she got the score she got, and improve between events.
**Pains:** Today she gets a number with no explanation. She can't tell if she lost a point on alignment or stability. She feels judged unfairly and can't prove it.
**Context/Devices:** Phone (registration, history, second-screen). At the venue she's on the stage — camera-only, no devices on her body during the round. Wearables allowed only in warm-up/calibration.

**Journey:**
1. **Registers** for an event in the app (reuses AsanaAI profile). Picks her format (Solo) and category (Non-Musical).
2. **Calibration capture** in a quiet booth: she does a few reference poses while multiple cameras (and optional warm-up wearables) "learn" her body proportions. *Trust moment: she must feel this is fair to her body, not a generic template — show "calibrated to YOU."*
3. **Warm-up** with live feedback in training mode (the familiar AsanaAI practice flow). *Emotional moment: nerves; the UI should feel calming and familiar, the "sun" warmth.*
4. **Performs her round** on stage. No screens, just her and the cameras. The system silently records and measures every hold and vinyasa.
5. **Sees her explained score.** Not "32/40" — instead: *Alignment 8.5, Stability 7.0 (−1.0 here: 1.8° spine sway at 0:42, see frame), Difficulty 9, Artistry 7.5.* With the actual evidence frame. *This is THE trust moment of the whole product — she sees the deduction, sees the frame, and nods instead of protesting.*
6. **Reviews history** later: longitudinal profile, "your stability is up 12% since March," head-to-head vs. rivals, benchmarking against her division.

---

## 2. The Coach — "Devraj, 41"

**Goals:** Prepare his athletes, monitor them live, and find precisely what to drill next.
**Pains:** Vague feedback ("she wobbled") with no data. Can't compare an athlete to her past self or to opponents objectively.
**Context/Devices:** Laptop/tablet at the venue and in the studio. Wants dense data but readable at a glance.

**Journey:**
1. **Pre-match prep:** opens athlete dashboards, reviews weakness flags from training data, sets focus areas. Studies head-to-head data on the next opponent.
2. **Live monitoring:** during Maya's round, watches a real-time feed of objective values (sway, hold times, angle deviations) as they happen. *Emotional moment: helpless from the sidelines — the screen is his only window in.*
3. **Post-match analysis:** the system surfaces **weakness detection** — "3 of last 4 rounds: left-knee alignment loss in backbends." *Trust moment: the insight must be specific and actionable, with video evidence, or he won't believe it.*
4. **Plans next training block** by pushing focus drills back into the athlete's training mode.

---

## 3. The Referee / Judge — "Lena, 38" (the most important UX in the product)

**Goals:** Score fairly, fast, and with confidence; defend any score with evidence.
**Pains:** Cognitive overload; fear of being wrong on TV; protests with no proof.
**Context/Devices:** A dedicated **Referee Console** (fixed screen/tablet at the judging table). Dense, fast, no fluff.

**Journey — built entirely around "AI suggests, human confirms":**
1. **Logs in** at her console; her identity is tied to every score she'll sign.
2. **Calibrates confidence in the system:** before scoring counts, she watches a few sample holds where the AI shows its measurement *and* she sees the live pose — she learns when to trust it and when to look closer. *Trust moment: she must believe the tool before she leans on it.*
3. **Live round — the core loop:** for each hold, the AI **suggests** objective sub-scores (alignment deviation, sway, hold time) with a **confidence indicator** (high/medium/low). Lena **confirms** with one tap when she agrees.
4. **Override when she disagrees:** she opens the override modal, sets her own value, and **must enter a reason** (logged). *Critical UX: overriding must be easy and never feel like fighting the machine — the AI is an assistant, she is the authority.*
5. **Low-confidence handling:** when the system flags low confidence (e.g., a contact pose or inversion the camera can't resolve), the UI explicitly says "human judgement required" and offers no number to anchor her. *This is how we keep the honest line — the machine admits what it can't see.*
6. **Handles a dispute:** an athlete protests. Lena pulls up the **replay view** — synced video plus the measurement overlay at the exact frame. The evidence resolves it. *Emotional moment: calm instead of conflict.*

---

## 4. The Head Judge / Scoring Director — "Anand, 55"

**Goals:** Run a clean panel, resolve protests, publish trustworthy results.
**Pains:** Reconciling disagreeing judges; defending the event's integrity publicly.
**Context/Devices:** Supervisory console with panel-wide visibility.

**Journey:**
1. **Oversees the panel:** sees all judges' scores side-by-side in real time, with outlier flags (one judge way off the others).
2. **Resolves protests:** when escalated, reviews the signed score, the AI measurement, the override log, and the replay together. Upholds or adjusts.
3. **Publishes results:** locks the round, signs off, releases the leaderboard to broadcast and fans. *Trust moment: publishing is irreversible and signed — the UI must make him slow down and confirm deliberately.*

---

## 5. Broadcast Director / Producer + AR Graphics Operator — "Sofia (Director) & Tom (AR Op)"

**Goals:** Make the broadcast thrilling and *clear*; show the audience why scores happen.
**Pains:** Live timing pressure; risk of putting a wrong/unlabeled graphic on air; mislabeling "estimated" data as fact.
**Context/Devices:** **Broadcast Graphics Control** — a control-room surface, multi-monitor, latency-sensitive.

**Journey:**
1. **Pre-show:** Sofia sets up the rundown; Tom loads athlete data and preps overlay packages (alignment lines, CoG markers, score breakdowns).
2. **Cue overlays live:** as Maya holds a pose, Tom toggles the alignment-angle overlay so viewers see the 3° spine deviation. *Emotional moment: the "aha" he's giving millions of viewers.*
3. **Trigger Simulcam:** for two athletes who did the same pose, Tom fires the **ghost overlay** comparing them superimposed. *Signature TV moment.*
4. **Manage estimated visuals:** when he shows a heart-rate or muscle-heatmap graphic, the "ESTIMATED" label is baked in and non-removable. *Trust/integrity moment: the system must make it impossible to present estimates as measurements.*
5. **Drive the leaderboard:** updates standings as the head judge publishes.

---

## 6. Broadcast Viewer (passive) + Second-Screen Fan — "Grandpa Joe (TV) & Priya, 19 (phone)"

**Joe's Goals:** Just enjoy and *understand* the sport without effort.
**Joe's Pains:** "Why did she win? They looked the same to me." Solved entirely by on-screen broadcast graphics — no app needed.
**Joe's Context:** Living-room TV, passive. Everything must be self-explanatory on screen.

**Priya's Goals:** Engage deeply — judge along, predict, compete socially.
**Priya's Pains:** Passive TV is boring for her generation.
**Priya's Context:** Phone, second-screen, alongside the TV.

**Priya's Journey:**
1. **Opens the second-screen app** (reuses AsanaAI leaderboard/profile patterns), synced to the live broadcast.
2. **Judge-along:** she scores each hold herself before the real judges reveal theirs. *Emotional hook: "Am I a good judge?"*
3. **Predictions & win-probability:** she predicts the winner; a live win-probability bar updates as rounds finish. *Engagement moment: stakes and suspense.*
4. **Highlight feed:** she shares the best holds and Simulcam clips. *This is the fan-acquisition loop feeding back to the flywheel.*

---

## 7. Event Organiser / Federation Admin — "Reena, 47"

**Goals:** Stand up an event that runs flawlessly and is legally/ethically clean.
**Pains:** Logistics chaos; camera setup errors that ruin measurements; consent and governance liability.
**Context/Devices:** Admin console, desktop, pre-event and on-site.

**Journey:**
1. **Creates the event:** formats, categories, schedule, divisions.
2. **Seeds athletes:** imports/links AsanaAI profiles, sets brackets and start order.
3. **Manages venue calibration:** confirms every camera rig passes a calibration check so 3D measurement is trustworthy. *Trust moment: a "calibration green/red" status board — no round starts on a red rig.*
4. **Governance & consent:** captures athlete consent for biometric-style estimated visuals on broadcast, manages data-use governance. *Integrity moment: consent is a gate, not a checkbox buried in settings.*
5. **Publishes results & archives:** after the head judge signs off, releases official standings and the signed, replayable record for posterity and any future appeals.

---

### The thread through all of them
Every official-facing persona shares one promise: **the AI proposes, the human decides, the record is signed and replayable.** Every fan-facing persona shares the opposite delight: **the invisible made visible and playable.** Design each surface to serve whichever side of that line it sits on.
