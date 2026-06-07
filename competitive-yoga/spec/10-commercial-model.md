# 10 — Commercial Model

> The business model that turns a multi-camera 3D officiating build into a **product that real people use and that generates revenue** — not a one-off integration project. All figures are **indicative** and consistent with the program budget (P0–P3 ≈ **$2.0M–$3.5M** over 12–18 months) and the per-event operating cost (≈ **$18k–$60k**) in `proposal/04-budget-phasing.md`.

## 1. Revenue streams

We monetise the same underlying IP — owned scoring/inference/data, bought graphics/tracking — across five buyer types so no single contract carries the company.

1. **Federation / organiser licensing (officiating + broadcast platform).** The core. Sold two ways: **per-event** (one-off competitions, championships, exhibitions) at a price that wraps the per-event cost-to-serve plus margin; and **annual platform licence** to a federation running a season, which includes versioned scoring-engine updates, audit/replay hosting, and the referee copilot. Annual is the goal — it converts lumpy event revenue into recurring, defensible ARR.

2. **SaaS subscription — data & analytics platform (teams / coaches / athletes).** A recurring product built on ~70% reuse of AsanaAI (profiles, charts, leaderboards, stats, persistence). Coaches and clubs subscribe for athlete progress tracking, alignment/stability analytics, benchmark percentiles against the competitive dataset, and training-mode capture that feeds the same models. This is the highest-margin line because the platform is built once and served many.

3. **Second-screen / fan monetisation.** A freemium fan app (free real-time leaderboard, fan-safe published projections, basic stats) with revenue from (a) **sponsorship/branding** of overlays and prediction segments, (b) a **prediction-game engagement loop** that lifts session time and retention, (c) **ads** in free tiers, and (d) a thin **premium fan tier** (advanced angles, "show me why" explainer access, ad-free). Sold to the rights-holder as per-season licence **or** a rev-share on engagement/sponsorship.

4. **AsanaAI consumer app (subscriptions).** A standalone consumer subscription product that **cross-subsidises and funnels**: it is the cheapest CAC channel into the ecosystem, the data flywheel that improves the models, and the talent/audience funnel into the competition. Consumer subs fund continuous model improvement that the federation tier then pays a premium for.

5. **Data / benchmark licensing.** Anonymised, aggregated benchmark datasets and percentile models licensed to apparel, wearables, insurers, sports-science and media partners. Pure-margin once governance and consent (see §6) are clean. Never raw biometric data — only aggregated, de-identified products.

6. **Professional services / integration fees.** Paid discovery, per-venue calibration, broadcast OB-van integration, and custom format work. Lower margin, but it lands accounts and de-risks the platform sale.

## 2. Pricing structure & tiers

| Product | Tier | Indicative price | Rationale |
|---|---|---|---|
| Federation/organiser | Per-event | **$60k–$150k / event** | Covers $18k–$60k cost-to-serve plus setup, margin, and IP amortisation |
| Federation/organiser | Annual platform licence | **$150k–$450k / yr** | Matches budget doc; tiered by formats + event volume; recurring ARR |
| Data/analytics SaaS | Athlete | **$8–$15 / mo** | Consumer-grade, volume play |
| Data/analytics SaaS | Coach / club | **$49–$199 / mo** | Multi-athlete dashboards, benchmarks |
| Data/analytics SaaS | Team / academy (seat-based) | **$500–$3,000 / mo** | Bulk seats, API access |
| Fan second-screen | Per-season licence | **$40k–$120k / season** | Reuses AsanaAI; keeps entry price low |
| Fan second-screen | Premium fan | **$3–$6 / mo** | Retention + ARPU lift on engaged minority |
| AsanaAI consumer | Pro subscription | **$10–$20 / mo** | Funnel + flywheel engine |
| Benchmark data | Licence | **$25k–$150k / yr / partner** | Aggregated, de-identified only |
| Professional services | Day-rate / fixed scope | **paid discovery + integration** | Lands accounts, de-risks platform |

Tiering rationale: low consumer price points maximise the **flywheel** (data + funnel); high federation/data prices capture value where switching cost and trust are highest. Annual/recurring is always preferred over one-off because it defends margin and compounds the moat.

## 3. Unit economics

**Cost-to-serve per event** (from budget doc): crew $8k–$20k, compute/edge ops $2k–$6k, graphics/tracking licence $5k–$25k (partner-dependent), calibration/rehearsal $3k–$8k, plus edge-hardware amortisation (one flight case ≈ $120k–$240k capex amortised across events) → **≈ $18k–$60k variable, ~$25k–$70k fully loaded**. At a per-event price of $60k–$150k, **contribution margin runs ~40–70%** and improves materially across a multi-event season (amortised setup, reused calibration profiles).

**The graphics-licence drag is the key margin lever.** Buying Vizrt/Unreal+Zero Density and Mo-Sys/Stype is the right call (we concentrate spend on the scoring IP that is our actual differentiator and avoid rebuilding broadcast-grade rendering), but those recurring/per-channel licences hit gross margin directly and scale with channel reach. **Buy-vs-build logic:** building graphics would consume the IP budget and still under-deliver; the margin hit is the price of speed and quality, and is partly passed through in event pricing.

**CAC / LTV.**
- *Consumer (AsanaAI / athlete SaaS):* low CAC via app stores + content + funnel from broadcast; target **LTV:CAC ≥ 3:1**. Churn-sensitive, so prediction-game and progress-tracking retention loops are economically load-bearing.
- *Coach / team:* higher CAC (sales-assisted) but multi-seat, low churn (data lock-in via athlete history) → strong LTV; the **most attractive SaaS segment**.
- *Federation:* very high CAC (long sales cycle, trust-gated) but very high LTV (annual, multi-season, switching cost in audit-history continuity).

**Gross-margin logic:** SaaS and data licensing are high-margin (build once, serve many); event delivery is mid-margin (variable crew + licence); professional services is low-margin but strategic.

## 4. Flywheel / moat as a commercial asset

Three compounding loops defend pricing:

- **Data network effect.** More events and more consumer use → larger, more diverse labelled dataset → better, fairer models → higher judge agreement → easier federation adoption → more events. Competitors cannot buy this dataset; it is the moat.
- **Talent funnel.** AsanaAI consumers become competitors; the app is the cheapest discovery channel and gives federations a pipeline they value.
- **Audience funnel.** Broadcast + second-screen + prediction game build a fan base that increases sponsorship value and federation willingness to pay.

Each loop feeds the others, which is why low consumer pricing is rational: it fuels a data and audience asset that lets us **defend premium federation and benchmark pricing**.

## 5. Go-to-market & phasing

Mapped to the build phases: **Land a pilot (P0/P1)** — one federation, paid discovery → Solo single-mat pilot proving the hard core. **Expand to a season (P2)** — multi-format, convert to annual platform licence + second-screen rev-share. **Multi-federation (P3)** — Group support, repeatable flight-case deployment, reference customer drives the next sale. **Platform** — open the data/analytics SaaS and benchmark licensing once the dataset is deep.

**IP ownership vs partnership:** we **own** the inference/scoring/data IP (the differentiator and flywheel) and **partner/license** the commodity graphics/tracking. Default contracting position: we retain platform IP and the aggregated dataset; the federation owns its event data and brand. Hybrid deal (discounted build for a multi-season licence) aligns incentives with the competition's growth.

## 6. Key commercial risks & assumptions

- **Revenue concentration on one federation** — the biggest commercial risk early; mitigated by the SaaS/consumer/data lines that don't depend on any single organiser.
- **Graphics-licence terms** swing margin by six figures; pin down in discovery before quoting firm.
- **Judge/federation acceptance** of machine-assisted scoring is the adoption gate; the model is human-judged-with-assist, never autonomous, precisely to protect this.
- **Biometric data legality (GDPR special-category)** gates the data-licensing line; only aggregated/consented products are saleable.
- **Assumptions:** a season materialises after the pilot; consumer funnel converts at modeled CAC; per-event price holds at $60k–$150k. Each is validated at a phase boundary, every one of which is a real off-ramp.
