# 09 — Security, Privacy & Competitive Integrity

> Security and data-protection spec for biometric/pose data on live broadcast. Audience: BE / SRE / Data-Governance. Reads against `03-architecture-data.md` (signed append-only ledger, consent-as-first-class, on-prem officiating) and `08-nfr-reliability-slo.md` (durability/DR). Stack reuse: AsanaAI (Next.js / Express / Drizzle / Postgres / JWT).

**Governance is a sellable trust feature.** The federation is buying defensible, protest-proof officiating of athletes' special-category biometric data on live TV. A demonstrable RBAC model, cryptographic integrity chain, and GDPR-grade governance are not compliance overhead — they are the reason a federation signs (and renews) the officiating contract, and a differentiator for the SaaS data platform.

## 1. RBAC & authorization model

Authorization is **role + scope, least-privilege**, enforced server-side on every API and WebSocket channel (never trust the client). JWT (reused from AsanaAI) carries the subject and role claims; the back-end resolves scopes per resource.

| Role | Scope (least privilege) |
|---|---|
| **athlete** | Own performances, own scores (after publish), own biometric/consent records (access + erasure request). No cross-athlete visibility; no pre-reveal scores. |
| **coach** | Read-only on consenting athletes they are linked to; training data only — **no live-officiating override**. |
| **judge** | Read machine proposals for assigned round; **confirm / override** a criterion (override carries authority, is logged with identity + reason). Cannot edit the ledger or other judges' actions. |
| **head-judge** | All judge scopes + **resolve protests, authorize human-only fallback, final call of record**. The decision authority during a live incident (07 §6.3). |
| **director** | Event lifecycle (setup→live→adjudication→closed), assignments. **No scoring authority** — separation of officiating from administration. |
| **AR-op** | Graphics/overlay control on the broadcast feed only. **No access to authoritative scores or the ledger** — AR is advisory/cosmetic (03 §2). |
| **admin** | Platform/infra config, user lifecycle. **No scoring or override authority and cannot read pre-reveal scores** — separation of duties; admin can run the system but not bias an outcome. |

Principles: judge-override authority is explicit and bounded (a judge overrides *their* criterion, not the ledger); no role can both administer the system and alter an outcome; pre-reveal scores are visible only to assigned officials; the AR operator — who touches the public broadcast — is deliberately the lowest-trust officiating-adjacent role. All authorization decisions are themselves auditable.

## 2. Authentication

- **SSO + mandatory MFA for all officials** (judge / head-judge / director / admin) — federation IdP via OIDC/SAML where available, falling back to the AsanaAI JWT issuer with enforced TOTP/WebAuthn. Officials are the high-value identities; their actions are of record.
- **Short-lived tokens**, refresh with rotation; per-event session binding for officials so a session can't outlive the event.
- **Step-up auth** for high-authority actions: override and protest resolution can require re-assertion (WebAuthn touch) so an unattended console can't be misused.
- Athlete/coach/fan auth reuses the existing AsanaAI flow; fans are lowest-trust and fully partitioned from officiating.

## 3. Threat model & mitigations

| Threat | Vector | Mitigation |
|---|---|---|
| **Tamper with scores** | Edit DB rows / replay store to change an outcome | Append-only, **hash-chained, signed** ledger (§4); final value = last authoritative event, never an in-place update; any chain break is detectable and a SEV-1 (08 §4). |
| **Replay / deepfake of footage** | Inject doctored video to fake a deduction or clear one | **Sign captured frames at the camera/capture boundary** (§4); triangulation requires ≥ 2 genuine, PTP-consistent views — a single injected stream fails geometric + temporal consistency; calibration-bound. |
| **Insider collusion** | Judge + admin / two officials conspire | Separation of duties (§1: admin can't score, director can't score); every override logged with identity + reason; machine-vs-judge divergence monitored (08 §4); head-judge + protest path provides a second check; key-holder ≠ deployer (07 §6.5). |
| **Score leakage before reveal** | Pre-reveal scores exfiltrated for betting/PR | Scores are pre-reveal-restricted by role (§1); second-screen/fan tables receive only a **published fan-safe projection** (03 §6); no fan/AR/coach path to authoritative pre-reveal data. |
| **DoS during live event** | Flood APIs / second-screen to disrupt | Officiating loop is **on-prem and air-gappable from the public internet** (03 §1) — fan-facing DoS cannot reach scoring; rate-limiting + WAF on cloud surfaces; second-screen degrades without touching officiating. |
| **Supply-chain** | Compromised dependency / model weights / TensorRT engine | Pinned, content-addressed, **signed bundle** (07 §6.2); SBOM + dependency scanning in CI; model weights hashed and verified at load; reproducible builds. |

## 4. Cryptographic integrity chain

The integrity chain is end-to-end, from photons to protest:

1. **Signed captured video / frames.** Capture nodes sign frame batches (hash + capture-node key + PTP timestamp). Provenance of every pixel that feeds a deduction is verifiable; doctored or out-of-band footage fails verification.
2. **Hash-chained append-only ledger.** `audit_log` (03 §6) carries `seq` (monotonic), `prev_hash` (chain), and `signature` per event. Score, override, confirm, protest, and replay are all immutable signed events. Any deletion, edit, or reordering breaks the chain and is detectable on verification.
3. **Key management.** Signing keys (capture, ledger) live in an **HSM / managed KMS**, never in code, images, or env files (07 §6.5). A **key ceremony** with multi-party control provisions and rotates keys; the `key-id` is recorded in each signature so rotation never breaks historical verification. **Separation of duties: the ledger-key holder is not the bundle deployer.**
4. **Tamper-evidence for protests.** A protest replays (calibration_set, pose_frames refs, rule_versions, ledger) and **verifies the full signature + hash chain** before re-deriving scores (03 §4, 08 §5). The replay is itself a signed ledger event. This makes the audit trail not just stored but *provable* — the protest-grade property the federation pays for.

## 5. Data privacy & governance

Pose, joint-angle, and any rPPG/breathing estimation are **GDPR Article 9 special-category biometric data**. Governance is normative, not best-effort.

- **Lawful basis & explicit consent.** Processing biometric special-category data relies on **explicit, granular, opt-in consent** (and, for the competitive context, contract with the federation). Consent is first-class in the data model — `consent_broadcast`, `consent_data_flywheel`, `consent_biometric_estimation`, with `consent_version` + `consent_signed_at` (03 §6). Each scope is independently grantable/revocable; biometric estimation (rPPG/breathing) is **off by default**.
- **Purpose limitation.** Live-officiating data is used to officiate; flywheel/training analytics require the separate `consent_data_flywheel` scope. Officiating data is **not** silently repurposed into the SaaS data platform.
- **Separation of live-officiating vs training data.** The officiating ledger (edge, then verified cloud mirror) is segregated from the training/flywheel datasets; the OLAP/data-platform copy is a governed, consent-filtered projection — never a raw dump of officiating records.
- **Retention schedules.** Raw/near-raw evidence video retained only for protest-window + governance duration, then deleted (08 §3). Skeletons + ledger retained per the federation/governance schedule. Retention is enforced, logged, and is both a cost and a privacy control.
- **Athlete access & erasure rights.** Athletes can access their data and request erasure. **Tension with the immutable ledger is resolved by design:** erasure removes/de-identifies personal raw media and athlete-identifying fields and **crypto-shreds** keys for personal payloads, while the **integrity chain (hashes, scoring decisions of record) is retained** under the legal-obligation/public-interest-in-fair-competition basis. The audit trail stays provable; the person's recoverable biometric media does not persist beyond its basis.
- **Minors / safeguarding.** Junior athletes require **guardian consent**, stricter retention and access controls, no second-screen exposure of minors' biometric estimates, and safeguarding-aware data handling. Treated as a distinct, higher-protection class.
- **Cross-border transfer.** Edge keeps data in-territory during the event; any cloud sync respects data residency, uses appropriate transfer mechanisms (SCCs / adequacy), and the cloud region is selectable per federation contract.

## 6. Pen-test, audit cadence & secrets/PII handling

- **Cadence:** independent penetration test annually and before any new federation go-live; threat-model review each release that touches authz, the ledger, or the integrity chain; pre-event security checklist as a gating runbook (07 §6.4); continuous dependency/SBOM scanning + secret scanning in CI.
- **Secrets & PII handling:** secrets in a managed store, injected at deploy, rotated and re-pinned per event (07 §6.5); PII/biometric data encrypted in transit (mTLS internally, TLS externally) and at rest; least-privilege DB roles; access to special-category data is itself logged. No PII or secrets in logs, repos, or images.
- **Trust posture as product:** the pen-test reports, the signed integrity chain, the consent/retention controls, and the auditable RBAC are packaged as a **federation-facing trust dossier** — a contract-winning and contract-renewing asset, and a selling point for the SaaS data platform's enterprise buyers.
