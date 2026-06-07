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

## 2. Build-vs-buy rationale

- **Buy graphics + camera tracking.** Vizrt, Unreal+Zero Density, Mo-Sys, Stype are mature, broadcast-grade, and not our differentiation. We integrate, we don't rebuild.
- **Build inference, scoring, data, dashboards, second-screen.** This is the moat: the two-tier 3D officiating loop, the deterministic versioned scoring engine, the audit/replay ledger, and the fan/data flywheel. No vendor offers this for competitive yoga.
- **Reuse AsanaAI** for everything athlete/coach/fan/training/data + persistence — ~70% of those tiers.
- **Model-agnostic LLM** via Vercel AI Gateway so explainability/commentary providers can be swapped without code changes and cost/usage is centrally tracked.

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
