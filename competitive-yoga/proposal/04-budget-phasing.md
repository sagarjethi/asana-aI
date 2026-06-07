# 04 — Budget Estimates & Phasing

> **All figures below are INDICATIVE ranges**, intended to size the engagement and inform a go/no-go decision. They are **not a fixed quote**. We will refine every number into a firm statement of work after a short paid discovery / briefing call, once venue count, camera count, target formats and broadcast partners are confirmed. We have deliberately *not* lowballed: a credible multi-camera 3D broadcast officiating pilot is a substantial engagement, and a number that looks cheap usually hides the integration cost that sinks these projects.

## Costing assumptions

These ranges assume:

- **One venue** for the pilot, single-mat, controlled lighting we can characterise during calibration.
- **Camera count per phase**: P1 = 4 synced cameras; P2 = 6; P3 = 6–8.
- **On-prem / edge officiating loop** — one GPU compute box per mat (≈2× L40S-class GPUs), PTP time sync, NVMe replay store, packaged as one transportable flight case. No cloud in the live officiating path.
- **Graphics and camera tracking are bought, not built** — Vizrt or Unreal + Zero Density for AR graphics; Mo-Sys or Stype for camera tracking. We integrate; we do not reinvent.
- **AsanaAI is reused** for the fan, training and data tiers (~70% reuse), which is why those line items are comparatively light.
- Ranges are in USD and cover the build phase only unless stated; ongoing operating cost is itemised separately.

---

## Phased budget

| Phase | Scope | Duration | Core team | Software build | AI / ML & data | Hardware + 3rd-party licences | Indicative total |
|-------|-------|----------|-----------|----------------|----------------|-------------------------------|------------------|
| **P0 — Foundation & training mode** | Data platform foundation, capture/calibration rig, training-mode scoring (non-live), rules-DSL v0, audit/replay store, annotation pipeline | 2–3 mo | Architect, 2 ML, 2 full-stack, data/governance lead, UX (part) | $120k–$200k | $130k–$220k | $40k–$90k (capture rig, storage, dev GPUs) | **$290k–$510k** |
| **P1 — Solo single-mat pilot** | Live two-tier scoring (RTMPose live / ViTPose adjudicated), 4-cam triangulation→3D, deterministic scoring engine, referee dashboard, Simulcam, "show me why" explainer, second-screen v1 | 3–4 mo | Architect, 3 ML, 2–3 full-stack, broadcast-integration eng, governance lead, UX | $180k–$300k | $200k–$340k | $120k–$240k (flight-case compute, PTP, cameras, graphics + tracking licences) | **$500k–$880k** |
| **P2 — Multi-format, multi-camera** | 6 cameras, Musical/Non-Musical, transition/flow scoring, AR overlays at broadcast quality, auto-highlights + AI co-commentary, copilot layer, anti-cheat/anomaly flagging | 3–5 mo | Architect, 3 ML, 3 full-stack, 2 broadcast-integration, governance lead, UX | $220k–$360k | $180k–$320k | $140k–$280k (added cameras/GPU, expanded graphics licences) | **$540k–$960k** |
| **P3 — Group** | 6–8 cameras, multi-athlete tracking & occlusion handling, Group/Pair partial support, hardened production officiating, fairness/bias audit pack | 4–6 mo | Architect, 4 ML, 3 full-stack, 2 broadcast-integration, governance lead, UX | $240k–$400k | $260k–$440k | $160k–$320k (added cameras/compute, redundancy) | **$660k–$1.16M** |

**Indicative full-programme range (P0–P3): ≈ $2.0M–$3.5M**, spread over roughly 12–18 months and gated phase-by-phase so the client can stop or re-scope at any boundary.

### What the AI/ML line buys

3D reconstruction and triangulation; the two-tier inference stack (live RTMPose vs adjudicated ViTPose + volumetric); the deterministic, versioned scoring engine and rules-as-DSL; the asana segmenter (extended from AsanaAI); annotation, calibration and the human-judge agreement studies. This is the irreplaceable IP and the largest single risk area — funded accordingly.

### What the hardware + licences line buys

Edge compute (GPU box per mat), PTP time sync, NVMe replay storage, the synced camera kit, and the recurring/seat licences for the bought graphics engine (Vizrt / Unreal + Zero Density) and camera tracking (Mo-Sys / Stype). Third-party graphics/tracking licensing is the most variable element and is the first thing we pin down in discovery, because it can swing the hardware line by six figures depending on partner and channel reach.

---

## Honest scoring scope (so the budget is read correctly)

The pilot budget delivers what is **auto-scorable now**: Solo held, upright asanas (deviation beyond ~5°), stability / sway, hold-duration and audio events. **Human-judged with machine assist**: Pair/Group contact, inversions, artistry and near-noise-floor cases — the system surfaces evidence, the judge decides. **Broadcast eye-candy, never scoring**: rPPG-derived heart rate, breathing and muscle heatmaps, always labelled *estimated*. Budgeting for full autonomous Group scoring on day one would be dishonest; the phasing reflects what is genuinely deliverable when.

---

## Ongoing operating cost (per event)

Once built, a typical broadcast event runs on:

| Item | Indicative per-event |
|------|----------------------|
| On-site crew (officiating tech + broadcast-integration eng) | $8k–$20k |
| Compute / edge ops + replay storage | $2k–$6k |
| Graphics & tracking licence (per-event or amortised) | $5k–$25k (partner-dependent) |
| Calibration & rehearsal day | $3k–$8k |
| **Per-event total** | **≈ $18k–$60k** |

Multi-event seasons reduce per-event cost materially through amortised setup and reused calibration profiles.

---

## SaaS / licensing model option

The data platform and second-screen do not have to be a one-off build. We can offer them as a recurring licence:

- **Data platform / scoring SaaS** — annual licence per federation, tiered by formats and event volume; includes versioned scoring engine updates, audit/replay hosting and the copilot layer. Indicative **$150k–$450k / yr**.
- **Fan second-screen** — per-season or per-event licence, or a rev-share on engagement/sponsorship, leaning on the reused AsanaAI tier to keep the price low. Indicative **$40k–$120k / season**.
- **Hybrid** — discounted build cost in exchange for a multi-season platform licence, which aligns our incentives with the competition's growth and the data flywheel.

---

## How we de-risk spend

- **Pilot-first.** P0/P1 prove the hard parts (3D scoring, latency, explainability, judge agreement) on Solo before any commitment to multi-camera Group spend. Every phase boundary is a real off-ramp.
- **Reuse of AsanaAI** lowers the fan and data-tier cost: profiles, auth, leaderboards, stats and the real-time pose front-end already exist, so roughly 70% of those tiers is integration rather than new build.
- **Buy, don't build, graphics.** We license Vizrt / Unreal + Zero Density and Mo-Sys / Stype rather than rebuilding broadcast-grade rendering and camera tracking — concentrating our spend on the scoring IP that is actually our differentiator.
- **One flight case.** The single transportable edge unit keeps hardware capex bounded and makes the pilot repeatable across venues without per-site infrastructure projects.
