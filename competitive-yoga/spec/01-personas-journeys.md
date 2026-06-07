# 01 — Personas & User Journeys

*Who uses this, what they're trying to do, what frustrates them, and the exact step-by-step path they walk. Read File 00 first if you haven't — it explains the sport.*

Each persona has **Goals**, **Pains**, **Context/Devices**, then a **numbered journey** with the emotional/trust moments called out, because those moments are where good UX is won or lost. Every journey also lists explicit **failure / recovery branches** (because real events break — cameras fault, networks drop, athletes withdraw, scores get disputed) and **success metrics** so we can tell whether the surface actually works. A cross-cutting **accessibility & internationalisation** section closes the file; treat it as a requirement on every persona, not an afterthought.

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

**Failure / recovery branches:**
- **Camera fault mid-round.** A rig drops or loses calibration during her hold. *Recovery:* the system must NOT silently produce a degraded measurement. It flags the affected holds as "measurement unavailable — human-judged," and the head judge decides re-run vs. judge-from-video per federation rule. *Trust moment: Maya is told plainly what happened, not handed a mysteriously low score.*
- **She disagrees with the explained score.** *Recovery:* a clear "request review" path from her score screen that routes to the judge/head-judge dispute flow — not a dead-end. She sees the status of her protest.
- **Low-confidence pose (her routine includes an inversion).** *Recovery:* her score screen labels those holds "human-judged," so she never expects a machine number that isn't coming. Sets correct expectations before the result, not after.
- **Withdrawal / injury before or during her round.** *Recovery:* a dignified withdrawal flow; her slot is handled cleanly, partial data is retained or discarded per consent, and she is not left with a public "DNF" she can't explain.

**Success metrics for Maya:** share of her holds that arrive with a frame-backed explanation; protests she files that are resolved on evidence (vs. left ambiguous); measurable improvement signal she can act on between events; she reports feeling the score was *fair* even when she lost points.

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

**Failure / recovery branches:**
- **Live feed drops on his tablet mid-round.** *Recovery:* the console shows a clear "feed lost — reconnecting" state (never a frozen-but-pretending-live screen), and the round's data is intact server-side, so he reviews it fully post-match. He is never tricked into reacting to stale data.
- **Weakness insight looks wrong / spurious.** *Recovery:* every insight is one tap from its video evidence; he can mark an insight "not useful," which feeds back to tune detection. An unbacked insight he can't verify is treated as a bug, not a feature.
- **Opponent data unavailable** (new athlete, no history). *Recovery:* the head-to-head view degrades gracefully to "limited data" rather than inventing a comparison.

**Success metrics for Devraj:** insights that come with usable video evidence; weakness flags he acts on that show measurable improvement next event; he can compare an athlete to her past self and to rivals without manual video scrubbing.

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

**Failure / recovery branches:**
- **AI suggestion never arrives / arrives late** (compute hiccup, camera fault). *Recovery:* the console must degrade to manual scoring with a visible "no AI suggestion — score manually" state, never block her or stall the round. The show goes on; the human is always sufficient on her own.
- **Suggestion conflicts sharply with what her eyes see.** *Recovery:* override is one obvious action with a fast reason picker (common reasons pre-listed + free text). She must never feel she's "fighting the machine" to disagree.
- **She mis-taps confirm.** *Recovery:* a short, clearly bounded correction window before the score locks; after lock, it becomes a logged override, not a silent edit. Every change is in the audit trail.
- **Console crashes / she's logged out mid-round.** *Recovery:* on re-login her in-progress scoring state is restored from server, tied to her signed identity; no holds are lost or orphaned.
- **Disputed score escalates beyond her.** *Recovery:* a clear "escalate to head judge" handoff that passes the full context (suggestion, her override + reason, replay) upward — she isn't left personally defending it alone. *Trust moment: the system has her back with evidence.*

**Success metrics for Lena:** confirm-without-override rate on measurable holds (high and steady = she trusts the tool); 100% of overrides carry a reason; time-to-resolve a protest at her table; she reports lower cognitive load and lower fear-of-being-wrong-on-TV.

---

## 4. The Head Judge / Scoring Director — "Anand, 55"

**Goals:** Run a clean panel, resolve protests, publish trustworthy results.
**Pains:** Reconciling disagreeing judges; defending the event's integrity publicly.
**Context/Devices:** Supervisory console with panel-wide visibility.

**Journey:**
1. **Oversees the panel:** sees all judges' scores side-by-side in real time, with outlier flags (one judge way off the others).
2. **Resolves protests:** when escalated, reviews the signed score, the AI measurement, the override log, and the replay together. Upholds or adjusts.
3. **Publishes results:** locks the round, signs off, releases the leaderboard to broadcast and fans. *Trust moment: publishing is irreversible and signed — the UI must make him slow down and confirm deliberately.*

**Failure / recovery branches:**
- **An error is found AFTER publish** (judge miscalculation, late protest upheld). *Recovery:* publishing is irreversible, but there must be a governed **correction/amendment flow** — a new signed result that supersedes the old, with both versions retained in the audit trail and a clear "corrected" notice to broadcast and fans. We never silently rewrite history.
- **A judge withdraws / their console dies mid-event.** *Recovery:* documented rule for scoring with a reduced panel; the UI shows panel composition explicitly so the result records who actually scored.
- **Camera-fault holds (flagged by the system).** *Recovery:* he sees which holds were measurement-unavailable and applies the federation rule (re-run vs. judge-from-video) before locking. No round is published over an unresolved fault.
- **Two judges in stubborn disagreement.** *Recovery:* outlier flag + side-by-side replay gives him the tools to reconcile or invoke the panel rule, on evidence.

**Success metrics for Anand:** every published round signed and replayable; protests resolved within event timeline; corrections (when needed) issued cleanly with full provenance; he can publicly defend event integrity with the record alone.

---

## 5. Broadcast Director / Producer + AR Graphics Operator — "Sofia (Director) & Tom (AR Op)"

**Goals:** Make the broadcast thrilling and *clear*; show the audience why scores happen.
**Pains:** Live timing pressure; risk of putting a wrong/unlabeled graphic on air; mislabeling "estimated" data as fact.
**Context/Devices:** **Broadcast Graphics Control** — a control-room surface, multi-monitor, latency-sensitive. Real-world truth: this often runs in an **OB (outside-broadcast) truck** with finite GPU, a fixed video chain, vision-mixer integration, talkback in their ears, and a hard rule that *nothing* may freeze or stall the program feed. Overlays must key cleanly over live video and be killable in one action.

**Journey:**
1. **Pre-show:** Sofia sets up the rundown; Tom loads athlete data and preps overlay packages (alignment lines, CoG markers, score breakdowns).
2. **Cue overlays live:** as Maya holds a pose, Tom toggles the alignment-angle overlay so viewers see the 3° spine deviation. *Emotional moment: the "aha" he's giving millions of viewers.*
3. **Trigger Simulcam:** for two athletes who did the same pose, Tom fires the **ghost overlay** comparing them superimposed. *Signature TV moment.*
4. **Manage estimated visuals:** when he shows a heart-rate or muscle-heatmap graphic, the "ESTIMATED" label is baked in and non-removable. *Trust/integrity moment: the system must make it impossible to present estimates as measurements.*
5. **Drive the leaderboard:** updates standings as the head judge publishes.

**Failure / recovery branches:**
- **Overlay data is late or missing** for the pose currently on air. *Recovery:* graphics fail to a clean "no overlay" state — never a wrong line on the wrong limb, never a spinner over live talent. A late overlay simply doesn't fire; better blank than wrong.
- **Wrong athlete data loaded** (rundown drift after a schedule change). *Recovery:* overlays show the athlete name/ID they're bound to so Tom can catch a mismatch before air; a visible "data unconfirmed" state when binding is uncertain.
- **Estimated graphic at risk of looking like fact.** *Recovery:* the "ESTIMATED" stamp is baked in and non-removable by design; there is no UI path to strip it. If it can't be labelled, it can't go on air.
- **System overload in the truck.** *Recovery:* graceful degradation — drop the heaviest visuals (heatmaps, Simulcam) first, keep the program feed and the score breakdown last. The broadcast survives even if the eye-candy doesn't.
- **Head judge issues a post-publish correction.** *Recovery:* Tom gets a clear "result amended" signal to update the on-air leaderboard, so broadcast never lingers on a superseded standing.

**Success metrics for Sofia & Tom:** zero misleading-graphic incidents (estimated shown as fact = P0); overlays land within the agreed latency budget or don't fire; the program feed never stalls because of our graphics; measurable viewer "aha" lift in audience testing.

---

## 6. Broadcast Viewer (passive) + Second-Screen Fan — "Grandpa Joe (TV) & Priya, 19 (phone)"

**Joe's Goals:** Just enjoy and *understand* the sport without effort.
**Joe's Pains:** "Why did she win? They looked the same to me." Solved entirely by on-screen broadcast graphics — no app needed.
**Joe's Context:** Living-room TV, passive. Everything must be self-explanatory on screen. Joe may also be **hard of hearing** (relies on captions / on-screen text, not commentary) and may watch on a **low-bandwidth or older TV** where fine overlay detail is lost. Graphics must read at a glance, survive compression, and never depend on audio commentary to make sense.

**Priya's Goals:** Engage deeply — judge along, predict, compete socially.
**Priya's Pains:** Passive TV is boring for her generation.
**Priya's Context:** Phone, second-screen, alongside the TV.

**Priya's Journey:**
1. **Opens the second-screen app** (reuses AsanaAI leaderboard/profile patterns), synced to the live broadcast.
2. **Judge-along:** she scores each hold herself before the real judges reveal theirs. *Emotional hook: "Am I a good judge?"*
3. **Predictions & win-probability:** she predicts the winner; a live win-probability bar updates as rounds finish. *Engagement moment: stakes and suspense.*
4. **Highlight feed:** she shares the best holds and Simulcam clips. *This is the fan-acquisition loop feeding back to the flywheel.*

**Failure / recovery branches (second-screen):**
- **Network loss / desync from the broadcast.** *Recovery:* the app shows a clear "reconnecting — catching up to live" state and re-syncs to the correct hold; it must never let her "judge along" against a stale pose and then feel cheated at the reveal. If she missed the window to score a hold, say so kindly.
- **Broadcast is ahead of / behind her stream.** *Recovery:* a visible sync indicator; judge-along submission is locked to the actual current hold, not her drifted view.
- **Result amended after she predicted.** *Recovery:* her prediction/standing view updates with a gentle "result corrected" note rather than silently changing under her.
- **Low connectivity.** *Recovery:* a lightweight mode that drops heavy video/animations but keeps the core judge-along and leaderboard usable.

**Success metrics — fans:** Joe can correctly say who scored higher and roughly why, from on-screen graphics alone (validated in testing, incl. captions-only viewing); Priya's judge-along participation rate per round and round-over-round retention; highlight shares that convert to new app installs (flywheel signal); viewers correctly distinguish "estimated" from measured numbers.

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

**Failure / recovery branches:**
- **A camera rig goes red after the event starts.** *Recovery:* the calibration board flips that rig red live; affected rounds are held or routed to the camera-fault rule before any score is trusted. The gate isn't a one-time pre-check — it's continuous.
- **An athlete revokes consent mid-event.** *Recovery:* a clear path to honour revocation — estimated visuals for that athlete stop, and data-use is adjusted — without breaking the running competition.
- **Schedule chaos** (late athlete, withdrawal, re-seed). *Recovery:* re-ordering brackets propagates cleanly to judging consoles, broadcast rundown, and second-screen, so no surface shows a stale start order.
- **Power / network outage at venue.** *Recovery:* in-progress signed records survive locally and reconcile on recovery; nothing already scored is lost.

**Success metrics for Reena:** zero rounds started on a red rig; 100% of athletes with consent captured before any estimated visual airs; events that complete on schedule despite re-seeds; a complete signed archive available for any future appeal.

---

## 8. Federation Legal / Governance Owner — "Fatima, 50"

*The person who is personally accountable if the sport gets sued, an athlete's biometric data is mishandled, or a result can't be defended in an appeal. Officiating tech lives or dies on her sign-off — she was missing from this spec and shouldn't be.*

**Goals:** Keep the federation legally and ethically clean; ensure every result is defensible in a formal appeal; own the consent, data-use, and governance rules the rest of the product implements.
**Pains:** Consent treated as a buried checkbox; biometric-style "estimated" visuals creating liability; results that can't be reconstructed when challenged; unclear authority chain in disputes; cross-border data rules.
**Context/Devices:** Desktop, pre-event policy setup and post-event review. Not at the judging table — but every table follows her rules.

**Journey:**
1. **Defines the governance rules** the product enforces: what athletes consent to, how consent is revoked, data-retention periods, who may access the signed record, and the dispute-escalation chain (judge → head judge → formal appeal).
2. **Sets the consent gate** that organisers operate — she owns the *policy*, Reena operates the *gate*. *Integrity moment: consent wording and scope are hers to define, not engineering's.*
3. **Audits an event after the fact / during an appeal:** pulls the complete signed, replayable record — suggestions, overrides + reasons, panel composition, corrections — and confirms the result is defensible. *Trust moment: the record either holds up or it doesn't; the UI must make a full, tamper-evident reconstruction effortless.*
4. **Handles a formal appeal** that escalated past the head judge: reviews provenance end-to-end and renders a federation-level decision recorded against the result.

**Failure / recovery branches:**
- **Record incomplete or signature unverifiable.** *Recovery:* this is a P0 — the system must surface any gap loudly; a result that can't be reconstructed cannot be defended, and she needs to know *before* an appeal, not during.
- **Consent dispute** ("I never agreed to my heart rate on TV"). *Recovery:* she can show exactly what was consented, when, and by whom, from the governance log.
- **Cross-jurisdiction data conflict.** *Recovery:* retention/access policy is configurable per event/region rather than hard-coded.

**Success metrics for Fatima:** 100% of results reconstructable and signature-verifiable; consent provenance retrievable for every athlete; appeals decided on the record within policy timelines; zero data-use incidents.

---

## 9. Sponsor / Commercial Stakeholder — "Marcus, 44"

*The reason there's a budget. Forza.ventures wants this on TV; TV needs sponsors. A spec that ignores the commercial surface ships a product that can't pay for itself.*

**Goals:** Reach a measurable, engaged audience; get clean, brand-safe integration into broadcast and second-screen; prove ROI.
**Pains:** Vague audience numbers; brand placed next to something embarrassing (a misleading graphic, a dispute meltdown); no measurable engagement; estimated-data controversy splashing onto his brand.
**Context/Devices:** Dashboards (pre-deal and post-event reporting); reviews the broadcast/second-screen surfaces where his brand appears.

**Journey:**
1. **Evaluates the opportunity** with audience and engagement projections (second-screen participation, highlight-share reach).
2. **Defines brand-safe placements** in broadcast graphics and second-screen — clearly demarcated as sponsorship, never disguised as officiating data. *Integrity moment: a sponsor logo must never sit where it could be mistaken for a score or a measurement.*
3. **Watches the event** and sees real-time engagement reach.
4. **Reviews post-event reporting:** audience, second-screen engagement, highlight virality, attributable installs into AsanaAI.

**Failure / recovery branches:**
- **Brand shown beside a controversy** (e.g., an on-air dispute). *Recovery:* placement rules let sensitive moments suppress sponsor overlays automatically; brand safety is a rule, not a hope.
- **Estimated-data controversy.** *Recovery:* because estimated visuals are permanently, visibly labelled, the sponsor isn't tarred by an "AI faked the data" story — the integrity line protects the commercial line too.
- **Reported numbers questioned.** *Recovery:* engagement metrics trace to real, auditable second-screen events, not inflated vanity figures.

**Success metrics for Marcus:** verifiable audience and engagement figures; zero brand-safety incidents; attributable flywheel impact (installs/follows from his activation); renewed/expanded sponsorship.

---

## Accessibility & internationalisation (applies to every surface)

This is not a "phase two" appendix — it's a cross-cutting requirement, and it was absent from the original personas. Bake it in from the first screen.

**Accessibility:**
- **Colour-blind-safe overlays.** Alignment lines, deduction markers, and CoG cues must never rely on colour alone (red/green is the worst offender). Use shape, label, and position too. Roughly 1 in 12 men is colour-blind — that includes judges and viewers.
- **Captions & no-audio comprehension.** Broadcast graphics must be fully understandable with sound off / captions on. Joe (hard of hearing) and any muted viewer must still get "who scored higher and why."
- **Screen-reader support** on app surfaces (registration, second-screen, athlete/coach dashboards): proper labels, focus order, and announced score updates so a blind athlete or fan can use them.
- **Motion & contrast.** Respect reduced-motion preferences (Simulcam ghosts, animated bars); meet contrast minimums on dense official consoles where misreading a number has consequences.
- **Official-console legibility under pressure.** Lena scores fast under stress — large tap targets, high contrast, no ambiguity. Accessibility here *is* error-prevention.

**Internationalisation:**
- **Multi-language athletes, fans, and officials.** Competition is global; the federation is global. UI strings, score explanations, override reasons, and consent wording must be localisable — not hard-coded English.
- **The score-explanation language must translate without losing meaning.** "1.8° spine sway at 0:42" should read correctly in any locale (number/decimal/time formats included).
- **Names, scripts, and direction.** Support non-Latin scripts and RTL layouts for athlete names and UI.
- **Consent in the athlete's language.** Consent that isn't understood isn't consent — wording must be available in the athlete's language (ties to Fatima's governance rules).
- **Launch scope is an open question** (see File 00) — but the *architecture* must assume localisation from day one; retrofitting i18n is far costlier than designing for it.

---

### The thread through all of them
Every official-facing persona shares one promise: **the AI proposes, the human decides, the record is signed and replayable.** Every fan-facing persona shares the opposite delight: **the invisible made visible and playable.** Design each surface to serve whichever side of that line it sits on.
