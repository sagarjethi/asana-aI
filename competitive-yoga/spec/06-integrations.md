# 06 — Integrations & Third-Party

> Which external apps/hardware to include, why, build-vs-buy, pilot-vs-full, and on-prem/cloud data boundaries.
> Principle: **BUY** broadcast graphics and camera tracking; **BUILD** inference, scoring, data, dashboards, second-screen.

## 1. Integration table

| Integration | What it does | Why | Build vs Buy | Pilot | Full |
|---|---|---|---|---|---|
| **Broadcast graphics engine** — Vizrt **OR** Unreal Engine + Zero Density keying | Renders/keys AR overlays, lower-thirds, Simulcam ghost into the broadcast feed | World-class real-time broadcast graphics is a solved, deep product; rebuilding wastes years | **BUY** | OBS/vMix stand-in | Vizrt or Unreal+Zero Density |
| **Camera tracking** — Mo-Sys / Stype | Real-time PTZ position + lens-encoder data so AR overlays lock to moving camera | AR-on-PTZ requires precise tracked-camera metadata; specialist hardware | **BUY** | Out (fixed/locked cams) | Mo-Sys/Stype on PTZ cams |
| **Machine-vision cameras** — Basler / FLIR | Genlock-capable, high-frame-rate, global-shutter capture for keypoint accuracy | Consumer cams lack genlock/global shutter; 3D accuracy depends on it | BUY (commodity) | 4 cams | 6–8 cams |
| **Video transport** — SDI / NDI / SRT; OBS/vMix → OB van/vision-mixer | Moves feeds edge → graphics → broadcast | Industry-standard transport; pilot uses software mixer, full uses OB van | BUY/standard | OBS or vMix | OB van + vision-mixer over SRT/NDI/SDI |
| **Genlock / PTP clock hardware** | Frame-accurate sync across cameras + inference timestamps | Triangulation + stability are meaningless without sub-frame time alignment | BUY | ★ required | ★ required |
| **GPU / edge** — NVIDIA **L40S** + TensorRT | Runs RTMPose live + ViTPose adjudicated tiers on-prem | On-prem officiating loop must not depend on cloud GPUs | BUY | 1 box, 2× L40S | scaled per format (P3 heaviest) |
| **LLM provider** (explainability + commentary) | Generates "show me why" rationale + commentary scripts | NL explanation/commentary; keep model-agnostic to avoid lock-in | BUY via **Vercel AI Gateway** (model-agnostic) | explainer only | + commentary |
| **TTS** | Voices generated commentary | Automated/assistive broadcast commentary | BUY (provider) | Out | P2+ |
| **AsanaAI app + Postgres** | Existing Next.js + Express + Drizzle + JWT + self-hosted Postgres | The reuse base for athlete/coach/fan/training/data tiers + persistence patterns | **REUSE** (built) | ★ | ★ |
| **Object storage** (S3-class) | Stores 3D skeleton frames, evidence clips, Simulcam ghosts | Frames are large/cold; referenced by URI from Postgres | BUY (cloud) + edge NVMe | ★ edge NVMe hot set | + S3 cold + CDN |
| **OLAP / analytics** | Read-optimized mirror for flywheel, talent funnel, fan analytics | Keep analytics off the officiating critical path | BUILD on managed OLAP | minimal | full product |
| **Auth** | JWT identity + roles (judge/admin/operator/fan) | Override authority + consent enforcement need strong roles | REUSE/extend existing JWT | ★ | ★ |
| **Wearables / IMU / force-plate / EMG** | Ground-truth biomech for calibration & training | Validates camera-only estimates; **training/calibration ONLY** — never at competition | BUY (optional) | optional, training only | training/calibration only |

## 1a. Hardware specs (concrete, not hand-wavy)

**Machine-vision cameras (metric rig — feeds triangulation):**
- Class: **Basler ace 2 / boost** or **FLIR Blackfly S / Oryx**, **global-shutter** CMOS (Sony Pregius), **≥1080p (2–5 MP)**, **100 fps** sustained, **external trigger / genlock input**, 10 GigE or CoaXPress/Camera Link.
- Lens: **fixed focal length** machine-vision C-mount, ~8–12 mm (final value from the lens study, §2a of doc 03), low-distortion, locked focus/iris. No zoom on metric cameras.
- Why this class: consumer/broadcast cams lack hardware trigger + global shutter; rolling shutter corrupts a moving limb and breaks the time-sync budget.

**Broadcast cameras (graphics only — NOT triangulation inputs):** standard broadcast PTZ/box cameras with **Mo-Sys / Stype** tracking heads for AR lock. Kept entirely separate from the metric rig.

**Sync hardware:**
- **PTP grandmaster clock** — IEEE-1588v2, GPS/GNSS-disciplined, e.g. **Meinberg microSync / Evertz 5700MSC** class, with **boundary/transparent-clock switches** and **PTP-aware NICs** on the ingest hosts.
- **Genlock / sync generator** — tri-level sync distribution to all metric cameras' trigger inputs (shared sync gen or PTP-driven hardware trigger). Genlock aligns *exposure*; PTP aligns the *timestamp ledger*. Budget: ≤250 µs inter-camera skew (doc 03 §2b).

**GPU / edge compute:** **NVIDIA L40S** (48 GB, strong FP16/INT8, no datacenter-only power needs — fits a field flight case) + TensorRT. On-prem only.

## 1b. GPU sizing math (N cameras × fps × two-tier)

Target: **8 cameras @ 100 fps = 800 frame-inferences/sec** on the LIVE tier, plus bursty ADJUDICATED re-runs.

- **Live tier (RTMPose, TensorRT FP16/INT8):** a top-down 2D pose pass costs on the order of **~3–6 ms/frame on an L40S** at batch. 800 fps ÷ (1000/5 ms ≈ 200 fps/stream headroom) ⇒ realistically **~4–5 camera streams per L40S** at 100 fps with latency headroom and detector overhead. ⇒ **2× L40S** carries 8 cameras live with margin. Batching across cameras (same PTP instant) improves utilization and is the intended design.
- **Adjudicated tier (ViTPose + volumetric):** heavier (tens of ms to >100 ms/frame) but **off the real-time path** — runs on hold windows and on protest. Allocate **1 additional L40S** (or time-share when live load is low) so adjudication never starves the live tier.
- **Pilot (4 cams @ 100 fps):** **1 box, 2× L40S** comfortably covers live + opportunistic adjudication.
- **Full / heaviest format (group rounds, multiple athletes):** scale to **2 boxes / 4–6× L40S**; group formats multiply person-detections per frame and are the real sizing driver, not camera count alone.
- These are **planning figures** — exact throughput is locked by a pre-event benchmark on the pinned TensorRT engine (the same manifest used for replay, doc 03 §4a) and recorded as a go/no-go item.

## 1c. Broadcast keyer / graphics integration signal path

```
METRIC RIG (8 cams) ──► edge inference ──► 3D skeleton + deductions ──► graphics state (WS)
                                                                            │
BROADCAST CAMS (PTZ + Mo-Sys/Stype tracking) ──► camera + lens-encoder metadata
                                                                            │
                                                                            ▼
                                            ┌──────────────────────────────────────┐
   program video (SDI 3G/12G or 2110) ────►│ GRAPHICS ENGINE  Vizrt  OR  Unreal +  │
                                            │ Zero Density (real-time render + key) │
                                            └───────────────┬──────────────────────┘
                                       fill + key (SDI)  OR  on-engine internal key
                                                            ▼
                                            ┌──────────────────────────────────────┐
                                            │ VISION MIXER / KEYER (OB van)         │──► PROGRAM OUT
                                            └──────────────────────────────────────┘
   transport between sites: SRT (contribution) / NDI (LAN/IP) / SMPTE ST 2110 (full IP plant)
```

- **AR overlays must lock to the moving broadcast camera**, which is why tracked-camera metadata (Mo-Sys/Stype, lens encoders) feeds the graphics engine in real time. The metric rig provides *what to draw* (3D skeleton, ghost, deduction marker); the tracking head provides *where to draw it* relative to the live camera.
- **Fill + key:** the graphics engine outputs a fill signal + key (alpha) channel over SDI to the downstream keyer/mixer (classic broadcast path), or composites internally (Zero Density / Unreal) and outputs finished program. Either path is supported; the keyer integration is a defined SDI/2110 handoff, not a custom protocol.
- **Pilot** collapses this to **OBS/vMix** doing software keying with fixed/locked cameras (no PTZ tracking, no fill+key hardware). **Full** uses the OB-van vision mixer with hardware keying and tracked PTZ.
- **Latency:** the graphics path is allowed seconds of delay relative to the officiating loop; the **referee alert path never blocks on graphics or cloud**.

## 2. Build-vs-buy rationale

- **Buy graphics + camera tracking.** Vizrt, Unreal+Zero Density, Mo-Sys, Stype are mature, broadcast-grade, and not our differentiation. We integrate, we don't rebuild.
- **Build inference, scoring, data, dashboards, second-screen.** This is the moat: the two-tier 3D officiating loop, the deterministic versioned scoring engine, the audit/replay ledger, and the fan/data flywheel. No vendor offers this for competitive yoga.
- **Reuse AsanaAI** for everything athlete/coach/fan/training/data + persistence — ~70% of those tiers.
- **Model-agnostic LLM** via Vercel AI Gateway so explainability/commentary providers can be swapped without code changes and cost/usage is centrally tracked.

## 2a. COTS (buy) vs build — with integration risk

| Component | COTS or build | Integration risk | Mitigation |
|---|---|---|---|
| Broadcast graphics (Vizrt / Unreal+Zero Density) | **COTS** | Med — proprietary scene/data API; data-binding our live deduction state into their templates; on-site engineer dependency | Stand up early on a stable WS/JSON data feed; abstract behind our own graphics-state contract so engine is swappable |
| Camera tracking (Mo-Sys / Stype) | **COTS** | Med-High — calibration of tracked head ↔ our metric world; lens-file accuracy; AR drift if mis-cal | Joint calibration step + drift monitor; only affects broadcast AR, **never officiating** |
| Metric MV cameras (Basler/FLIR) | **COTS (commodity)** | Low — well-documented SDKs (Pylon/Spinnaker), standard trigger/genlock | Lock camera+firmware+lens model; cable/bandwidth validated in bench |
| PTP grandmaster + genlock | **COTS** | Med — must verify end-to-end skew on *our* switches/NICs, not the datasheet number | Measure with sync-witness; ≤250 µs gate is a go/no-go |
| GPU/edge (L40S + TensorRT) | **COTS (assemble)** | Med — TensorRT determinism across GPU archs; thermal/power in a flight case | Pin engine build; persist frozen skeletons (doc 03 §4a); field thermal test |
| Video transport (SDI/NDI/SRT/2110) | **COTS / standards** | Low-Med — IP timing (2110/PTP) at full plant is finicky | Pilot stays on SDI/NDI/SRT; 2110 only with OB-van engineers |
| Inference / triangulation / temporal filter | **BUILD** | Core IP — our risk to own | TDD + accuracy validation (doc 11) |
| Deterministic scoring engine + ledger | **BUILD** | Core IP — correctness is existential | Replay-equivalence + golden-round suite (doc 11) |
| Referee/graphics-control/second-screen UIs | **BUILD (reuse AsanaAI)** | Low | Reuse shell/auth/charts |
| LLM explainer/commentary | **COTS via gateway** | Low — model-agnostic; never source of truth | Evidence is captured data (doc 03 §4d); LLM only renders |

## 2b. Licensing & cost implications at production scale

- **Vizrt:** per-seat/per-engine licensing + annual maintenance; broadcast-grade Viz Engine + Viz Artist + data-integration (Viz Pilot/Trio) stack is the dominant per-event line item. Plan **mid–high five figures USD** per production system, plus on-site operator day rates.
- **Unreal Engine + Zero Density (Reality):** Unreal itself is royalty-friendly for broadcast/non-game use, but **Zero Density Reality** licensing (per render node, annual) and the GPU render nodes are the real cost; comparable to or above Vizrt once you count render hardware and integrators.
- **Mo-Sys / Stype:** tracking heads are **rented per production** (favor rental until cadence justifies purchase); StarTracker/Stype Kit + lens calibration service.
- **Strategy:** keep the graphics engine **behind our own graphics-state contract** so we are not locked to one vendor's pricing; **rent** tracking and OB infrastructure for early events; only the **metric rig + edge GPU box** are capex we own (they are the officiating moat and must be ours/on-prem).

## 3. Data-flow boundaries (on-prem vs cloud)

```
ON-PREM / EDGE (officiating loop — never depends on uplink)
  cameras → PTP sync → GPU inference (RTMPose/ViTPose, TensorRT, L40S)
          → triangulation → 3D skeleton → temporal filter
          → scoring engine + signed ledger (edge Postgres)
          → referee console + graphics compositor + NVMe replay
          → SRT/NDI/SDI → OBS/vMix (pilot) / OB van (full)
          [ LLM explainer call may be local-cached or gateway; broadcast-path
            graphics never blocks on cloud ]

------------------------- boundary: batch, one-way, AFTER final closes -------------------------

CLOUD (post-live, fan, flywheel)
  edge Postgres ──▶ cloud Postgres mirror + OLAP analytics
  edge frames   ──▶ S3-class object store (cold) + CDN
  second-screen real-time service (fan-safe published projections only)
  LLM/TTS for commentary + flywheel analytics + talent funnel
```

**Hard rules:**
1. The officiating critical path (capture → score → referee → broadcast graphics) is fully on-prem and survives an uplink cut.
2. Only **fan-safe published projections** leave the officiating boundary in real time (second-screen). Raw frames, ledger, and adjudication data sync to cloud **after** the final.
3. Biometric/physiology estimates are broadcast-only, labelled "estimated", and gated on athlete consent scopes.
4. Wearable/IMU/force-plate/EMG data exists only in training/calibration environments, never on the competition floor.
