# Yoga Drishti — Product & Features

> The platform is **one data spine** with **six surfaces** — a purpose-built tool for every
> stakeholder. This is what's in the product walkthrough of the deck.

```
                 ┌───────────────────────── YOGA DRISHTI PLATFORM ─────────────────────────┐
   Athlete App ──┤  multi-cam 3D capture · two-tier inference · deterministic scoring engine │
 Coach Dashboard ┤  signed audit ledger · roles/RBAC · GDPR biometric governance             ├── Cloud analytics
 Referee Console ┤                                                                            │   + on-prem
 Broadcast/Simulcam ┤                                                                         │   officiating loop
 Fan Second-Screen ┤                                                                          │
 Organiser Admin ──┘                                                                          │
                 └────────────────────────────────────────────────────────────────────────┘
```

---

## 1 · Athlete App  *(mobile — consumer → competitor)*  · `images/15-athlete-app.jpg`
**"Every rep, scored and coached in real time."**
- Real-time pose tracking with on-device skeleton overlay
- Live alignment score (0–100) + hold-stability meter
- Guided practice flow (Arrive → Practice → Release) with breath pacer
- Per-pose micro-cues ("lift your hips") and post-session summary with tips
- Progress: streaks, score trends, personal bests
- Calibration / body-profile mode (wearables allowed in training only)
- **Competition-readiness** indicator → funnel into the competitive tier

## 2 · Coach & Athlete Dashboard  *(web / tablet)*  · `images/16-coach-dashboard.jpg`
**"See exactly where points are won and lost."**
- Longitudinal alignment & stability trends across weeks and seasons
- Body **heatmap** of weak joints / focus areas
- **Head-to-head** athlete comparison
- Field ranking & benchmarking vs personal bests and top percentile
- AI weakness detection + drill suggestions
- Session library + replay, exportable PDF reports, coach notes
- Injury-risk / asymmetry flags (wellness signal, not diagnosis)

## 3 · Referee / Officiating Console  *(on-prem web)*  · `images/17-referee-in-use.jpg`
**"Confirm, don't calculate."**
- Measured joint angles vs ratified template bands, live
- Candidate deductions each with a **confidence** value
- **Approve / Override** (override logged with a reason)
- Confidence-based **abstention** → defers to the human
- Frame-accurate **replay** & protest review
- **Signed, append-only audit ledger** — bit-reproducible
- Objective + human score merge; head-judge oversight & publishing

## 4 · Broadcast Graphics & Simulcam  *(live production)*  · `images/19-simulcam-compare.jpg`
**"Two athletes, one undeniable truth."**
- Real-time AR overlays: alignment/angle indicators, centre-of-gravity marker
- Live score breakdowns + leaderboards (lower-thirds)
- **Simulcam ghost overlay** — two athletes superimposed
- Side-by-side comparison metrics + a clear verdict badge
- **"Show me why"** explainable replay graphic
- Auto-generated highlights from the score event stream
- Operator control surface (overlay toggles, triggers)

## 5 · Fan Second-Screen App  *(mobile / web)*  · `images/18-fan-app.jpg`
**"Turn viewers into judges."**
- Live **win-probability**
- **Judge-Along** — score the athlete vs the AI and the real judges
- Prediction games & social leaderboards
- Real-time stats feed + shareable highlight clips
- Multi-language; accessible (captions, colour-blind-safe overlays)

## 6 · Organiser / Federation Admin  *(web)*
**"Run the event, own the governance."**
- Event setup, athlete seeding, scheduling
- Venue **calibration status** + pre-event go/no-go checklist
- Registration & **consent** management
- Data retention/governance, integrity/anomaly flags, results publishing

---

## Platform (cross-cutting, under every surface)
- Multi-camera 3D capture + per-venue calibration
- **Two-tier inference** — fast *live* tier (on-air) + precise *adjudicated* tier (official score)
- **Deterministic, versioned scoring engine** (rules-as-DSL), bit-reproducible replay
- Roles & RBAC, SSO/MFA for officials, signed audit trail
- GDPR special-category **biometric data governance**
- On-prem officiating loop (never depends on an uplink) + cloud analytics & fan tiers

*Full technical depth: see `../spec/` (architecture `03`, data `03`, validation `11`, security `09`).*
