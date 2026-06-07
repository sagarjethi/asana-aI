# Competitive Yoga — Officiating & Broadcast Technology Partnership
## Executive Summary

### The problem worth solving

Competitive yoga has a credibility problem and a watchability problem, and they are the same problem. The discipline that makes the sport beautiful — millimetric alignment, held stillness, controlled transitions — is invisible to a television audience and difficult to score consistently between human judges. A viewer cannot see why one athlete's *Natarajasana* scores higher than another's. A federation cannot easily defend a contested deduction. Both gaps erode the asset you are trying to build: a televised, sponsorable, *trusted* competitive format.

forza.ventures has correctly framed this as two jobs, and we have built our proposal around the same split:

- **Layer A — Competitive / Scoring-Support.** Referee-facing, objective measurement: skeletal and joint tracking, deviation from a ratified reference form, joint-angle measurement, stability and micro-movement analysis, threshold-based candidate deductions, and a Simulcam ghost overlay comparing two competitors. This feeds a scoring dashboard that fuses objective values with human-judge marks.
- **Layer B — Broadcast / Fan-Engagement.** Real-time AR overlays (alignment and angle indicators, centre-of-gravity markers, live score breakdowns, leaderboards), camera-derived physiological visualisations clearly labelled as *estimates*, and a second-screen companion app.

### Our stance on credibility — augment, never replace

We will say this plainly, because it is the difference between a system a federation can stand behind and one it cannot: **the machine assists the judge; it does not replace the judge.** The system surfaces objective measurements and *candidate* deductions with confidence values. A qualified human retains final scoring authority and can override any machine output. Every official number is **explainable** (which joints, which tolerances, which frames) and **auditable** (versioned rules, signed, bit-reproducible for protest review).

This is not modesty — it is engineering honesty. Markerless 3D capture resolves large joint angles to roughly 3-8°, and even marker-based laboratory systems disagree by 2-5°. We will therefore never let the platform emit a deduction off a sub-5° difference, and where a camera drops or confidence falls we flag "reduced confidence / human-only" rather than print a wrong number. A federation's reputation is the product. We protect it by knowing exactly what the technology can and cannot measure.

### Our unfair advantage — the AsanaAI flywheel

A pure broadcast-graphics vendor arrives with cameras and an empty model. We arrive with a moat:

> **AsanaAI consumer app → pose-labelled session data → better models → surfaces competition-ready amateurs (a talent funnel) → competitive platform → broadcast → fans download the practice app ↻**

AsanaAI is a live consumer product (Next.js, TF.js pose models, self-hosted Postgres, full athlete data surfaces). It already produces labelled yoga-pose data at scale, gives us pre-trained pose understanding, and — critically — supplies an **audience funnel** that turns viewers into participants and participants into competitors. Roughly 70% of our fan, training and athlete-data tiers reuse existing AsanaAI assets. The competitive measurement path is purpose-built new IP. The result: faster time-to-pilot, a fairer model (because we can build a labelled, diverse dataset), and a self-reinforcing audience that no broadcast-tech competitor can replicate.

### What we propose to deliver

A phased programme that earns trust before it scales:

| Phase | Scope | Outcome |
|-------|-------|---------|
| **0 — Training mode** | Wearable-assisted calibration, dataset building, model hardening | A diverse, labelled dataset and a calibrated pipeline |
| **1 — Solo pilot** | 4 cameras, one GPU box, 1-2 objective criteria, one AR overlay, one Simulcam ghost | Proven latency and auditability on a real feed |
| **2 — Multi-format** | 6-8 cameras, Pair + Musical beat-sync, full referee dashboard | Production-grade officiating for 1-2 athletes |
| **3 — Group** | Group-of-5, multi-person tracking (contact poses stay human-judged at launch) | Full-format coverage |

### The ask

We propose a **funded Solo pilot engagement** (Phases 0-1): a fixed-scope deployment on a real competition feed that proves glass-to-glass AR latency, capture-to-alert officiating latency, and end-to-end auditability — the three things a federation must verify before committing to a televised season.

### Value statement

We give judges a defensible instrument, give broadcasters a sport that finally explains itself on screen, and give the federation a growing pipeline of athletes and fans — built on a data flywheel only we own.
