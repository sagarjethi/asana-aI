# 05 — Team, Delivery Process & Responsible AI

## (a) Team & qualifications

We field a tight, senior team built around the reality that this is three disciplines in one programme — research-grade computer vision, production software, and live broadcast integration — held together by disciplined client-facing delivery.

| Role | Responsibility on this engagement |
|------|-----------------------------------|
| **Senior Project Analyst (client-facing lead)** | Single point of accountability to forza.ventures. Owns scope, the review loop, change control and the path to the production "end game." Translates federation and broadcast requirements into engineering work. |
| **Solutions Architect** | Owns the end-to-end design: the two-tier inference path, the deterministic scoring engine, the edge/on-prem officiating loop, the audit/replay system, and how bought graphics/tracking plug in. |
| **CV / ML researchers (2–4 across phases)** | 3D pose reconstruction, triangulation, the live-vs-adjudicated model tiers, the rules-as-DSL scoring engine, difficulty/flow scoring, and the fairness work. The hardest and most defensible part of the build. |
| **Full-stack builders (2–3)** | Referee dashboard, second-screen, data platform, copilot UIs, APIs — much of it extended from the existing AsanaAI codebase. |
| **Broadcast-integration engineer (1–2)** | Vizrt / Unreal + Zero Density graphics, Mo-Sys / Stype camera tracking, PTP sync, live AR overlay timing, run-of-show integration. |
| **Data / governance lead** | Consent, biometric handling, retention, bias/fairness audits, the signed audit trail, and the separation of officiating vs training data. |
| **UX designer** | Judge ergonomics under time pressure, the "show me why" explainer, fan second-screen, and on-air graphic legibility. |

**Proof we can do this.** We already ship **AsanaAI**, a real-time, in-browser pose product (Next.js 14 + TensorFlow.js) with a production backend (Express, Drizzle, Postgres, JWT) and a full feature surface — dashboard, stats, achievements, leaderboard, profile. It demonstrates, in production, that this team can deliver real-time pose inference, a working data platform and a polished consumer product. The officiating-grade 3D judging model is new build; the *capability* to ship real-time pose technology is already proven, not promised.

---

## (b) Delivery process

### Discovery → pilot → iterate → scale

1. **Discovery / briefing.** Confirm formats, venue, camera count, broadcast partners, rules, and the precise definition of each scoring criterion. Output: firm SOW and acceptance gates.
2. **Pilot (P0/P1).** Build the foundation and the Solo single-mat live system. Prove the hard parts on real footage before scaling.
3. **Iterate.** Tighten accuracy and latency against acceptance gates; run judge-agreement studies; refine the rules DSL with the federation.
4. **Scale (P2/P3).** Multi-format, multi-camera, then Group — each behind a phase gate the client controls.

### The client review loop

Work moves on a tight triangle: **Analyst ⇄ Builder ⇄ Client reviewer.** The analyst frames each increment, the builder ships it to a review environment, and a named client reviewer signs off against the agreed definition. Changes flow through **formal change control** so scope creep is visible and the trajectory toward the production end game stays intentional rather than accidental. Nothing reaches the live officiating path without client sign-off.

### Production engineering practices

- **CI/CD** with automated build, test and deploy to staging.
- **Automated testing** — unit tests on the scoring rules, and a **regression suite of labelled clips** so any model or rules change is re-scored against known-correct results before release. A scoring engine that silently changes its answers is unacceptable; the test suite is how we prevent it.
- **The replay / audit system** — every decision is recorded, signed and hash-chained, and the entire event can be re-scored deterministically from raw capture. This is both an engineering safety net and a governance feature.
- **Staged / canary releases** — new scoring-engine versions run in *shadow* against live events (producing numbers without affecting results) before promotion. Versioned engine; no silent updates.
- **Observability** — latency, dropped frames, camera-sync health, GPU load and per-criterion confidence are monitored live, with alerts to on-site crew.

### Latency & accuracy acceptance gates

We commit to explicit, measurable gates agreed in discovery and enforced in CI and live monitoring — for example: live-tier score latency within a defined broadcast budget; adjudicated-tier within the review window; keypoint/3D accuracy thresholds on the validation set; and a **minimum human-judge agreement rate** on auto-scorable poses. A phase does not pass until its gates are met on real data. Gates that are missed trigger re-scoping, not quiet shipping.

---

## (c) Responsible AI & data governance

### Augment, not replace, judges

This is the headline and the design principle. The machine produces evidence and proposed scores; **the human judge retains authority and override**, especially on Pair/Group contact, inversions, artistry and any near-noise-floor case. We are explicit about the boundary: auto-scoring covers Solo held upright asanas, stability, hold-duration and audio events; everything else is machine-assisted human judgement. We will never market autonomous artistry scoring, because it would be dishonest and it would erode the federation's trust in the whole system.

### Athlete consent and data rights

- **Explicit, informed consent** for capture and for each use of the data (officiating, training, broadcast, research) — opt-in, not buried.
- **GDPR special-category handling.** Pose, physiology and biometric data are special-category personal data; we treat them accordingly — lawful basis, minimisation, encryption at rest and in transit, and access controls.
- **Retention and export rights.** Defined retention windows, athlete right to access and export their own data, and deletion on request consistent with sporting-record obligations.

### Separation of live-officiating and training data

Data captured for **live officiating** is kept in a controlled, auditable store and is **not** silently recycled into model training. Training data is a separate, consented pipeline. This separation protects athletes, keeps the officiating record clean, and prevents the conflict of a system that "learns" from the very results it is supposed to adjudicate.

### Bias, fairness and human-judge agreement

- **Published bias / fairness audits** across body type, height, flexibility and other morphological factors — supported by the body-matched ideal-form normalisation described in doc 03, which reduces template bias by design.
- **Human-judge agreement studies** — regular, documented comparison of machine output against expert panels, with disagreement analysed rather than hidden. These studies are the evidence behind our accuracy gates.

### Physiology is estimated, not medical

All camera-derived physiology — rPPG heart rate, breathing, muscle heatmaps — is **clearly labelled "estimated, not medical,"** used only as broadcast enrichment, and **never** as a scoring input. We will resist any pressure to let estimated physiology influence results.

### Governance as a sellable trust feature

For a federation putting its credibility on televised results, this governance stack is not overhead — it is a **product**. The signed, replayable audit trail; the published fairness audits; the consent and data-rights framework; and the explicit human-override design together let the federation defend every result publicly, satisfy regulators, and tell athletes their data is handled with care. A pure broadcast-tech competitor can render a pretty overlay; the trust infrastructure that makes machine assistance *acceptable* to judges, athletes and regulators is what we sell, and it is hard to copy.
