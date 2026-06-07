/**
 * Yoga Drishti — scoring engine public surface.
 *
 * Pure, deterministic, reproducible. Given a template and a sequence of pose
 * frames it produces a fully auditable PerformanceScore: per-criterion scores,
 * itemised deductions with plain-English reasons, stability metrics, and a
 * confidence state that drives graceful UI degradation.
 *
 * No I/O, no wall-clock, no randomness — every output is a pure function of
 * the inputs.
 */
import {
  ENGINE_VERSION,
  type AngleTarget,
  type AsanaTemplate,
  type Criterion,
  type CriterionScore,
  type Deduction,
  type JointAngle,
  type PerformanceScore,
  type PoseFrame,
  type StabilityMetrics,
} from "@/lib/contracts";
import { angleAtJoint, centerOfMass, distance, type Point2 } from "./geometry";
import { evaluateAlignment, RULES_VERSION, type MeasuredAngle } from "./rules";

export { RULES_VERSION } from "./rules";

/* ----------------------------------------------------------------------------
 * Confidence-state thresholds (mean detector confidence over the hold window).
 * ------------------------------------------------------------------------- */
const CONFIDENCE_STATE_OK = 0.75;
const CONFIDENCE_STATE_REDUCED = 0.5;

function round(n: number, dp = 3): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Mean of a numeric list (0 for empty). */
function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/**
 * Compute the angle (with confidence) for each AngleTarget, averaged across
 * the supplied frames. A target with no resolvable keypoints in any frame is
 * omitted. Confidence for a joint is the mean of the three contributing
 * keypoints' detector scores, averaged over the frames that had it.
 */
export function computeAngles(frame: PoseFrame, targets: AngleTarget[]): JointAngle[] {
  return computeMeanAngles([frame], targets).map((m) => ({
    joint: m.target.joint,
    degrees: round(m.measured, 1),
    confidence: round(m.confidence),
  }));
}

/**
 * Internal: mean measured angle + mean per-joint confidence across frames.
 */
function computeMeanAngles(frames: PoseFrame[], targets: AngleTarget[]): MeasuredAngle[] {
  const out: MeasuredAngle[] = [];

  for (const target of targets) {
    const angles: number[] = [];
    const confs: number[] = [];

    for (const frame of frames) {
      const deg = angleAtJoint(frame.keypoints, target.joint, target.from, target.to);
      if (deg === undefined) continue;
      angles.push(deg);

      const kpScores = [target.joint, target.from, target.to].map((name) => {
        const kp = frame.keypoints.find((k) => k.name === name);
        return kp ? kp.score : 0;
      });
      confs.push(mean(kpScores));
    }

    if (angles.length === 0) continue; // unresolvable target — skip

    out.push({
      target,
      measured: mean(angles),
      confidence: mean(confs),
    });
  }

  return out;
}

/**
 * Stability from center-of-mass trajectory: sway RMS (low-frequency drift
 * around the mean position) plus high-frequency micro-movement (frame-to-frame
 * jitter). Both are normalised by a torso scale so the score is resolution
 * independent, then mapped to a 0..1 stabilityScore (1 = perfectly still).
 */
function computeStability(frames: PoseFrame[]): StabilityMetrics {
  const coms: Point2[] = frames.map((f) => centerOfMass(f.keypoints));

  // torso scale: mean shoulder<->hip span across frames; guards the normaliser
  const scales: number[] = [];
  for (const f of frames) {
    const ls = f.keypoints.find((k) => k.name === "left_shoulder");
    const lh = f.keypoints.find((k) => k.name === "left_hip");
    if (ls && lh) scales.push(distance(ls, lh));
  }
  const torso = scales.length > 0 ? mean(scales) : 0;
  const scale = torso > 1e-6 ? torso : 1;

  if (coms.length <= 1) {
    return { swayRms: 0, microMovement: 0, stabilityScore: 1 };
  }

  // sway RMS: RMS distance of each COM from the mean COM
  const meanCom: Point2 = {
    x: mean(coms.map((c) => c.x)),
    y: mean(coms.map((c) => c.y)),
  };
  const swaySq = coms.map((c) => distance(c, meanCom) ** 2);
  const swayRmsPx = Math.sqrt(mean(swaySq));

  // micro-movement: RMS of frame-to-frame COM displacement (high-frequency)
  const stepsSq: number[] = [];
  for (let i = 1; i < coms.length; i++) {
    stepsSq.push(distance(coms[i], coms[i - 1]) ** 2);
  }
  const microPx = Math.sqrt(mean(stepsSq));

  const swayRms = round(swayRmsPx / scale, 4);
  const microMovement = round(microPx / scale, 4);

  // map normalised motion -> [0,1]; weight sway more than fast jitter.
  // SCALE chosen so motion of ~half a torso => score near 0.
  const motion = 0.7 * swayRms + 0.3 * microMovement;
  const stabilityScore = round(Math.max(0, Math.min(1, 1 - motion * 2)), 4);

  return { swayRms, microMovement, stabilityScore };
}

/**
 * Score a performance. Deterministic: the same inputs always yield deep-equal
 * outputs. performanceId is derived from the inputs (no clock / RNG).
 */
export function scorePerformance(
  template: AsanaTemplate,
  frames: PoseFrame[],
  opts?: { judgeOverrides?: Record<string, number> },
): PerformanceScore {
  const overrides = opts?.judgeOverrides ?? {};

  // hold window = all frames (per spec for this engine version)
  const window = frames;

  // mean detector confidence over the window drives the confidence state
  const meanDetectorConf = mean(window.map((f) => f.confidence));
  const confidenceState: PerformanceScore["confidenceState"] =
    meanDetectorConf >= CONFIDENCE_STATE_OK
      ? "ok"
      : meanDetectorConf >= CONFIDENCE_STATE_REDUCED
        ? "reduced"
        : "human_only";

  const allDeductions: Deduction[] = [];
  const criteria: CriterionScore[] = [];
  let stability: StabilityMetrics | undefined;

  // frame timestamp for evidence — first frame, or 0 if none. Deterministic.
  const frameT = window.length > 0 ? window[0].t : 0;

  for (const criterion of template.criteria) {
    const override = overrides[criterion.key];
    const hasOverride = override !== undefined;

    if (criterion.source === "judge") {
      criteria.push(judgeCriterion(criterion, override, hasOverride));
      continue;
    }

    if (criterion.key === "alignment") {
      const measurements = computeMeanAngles(window, criterion.angles ?? []);
      const result = evaluateAlignment({
        criterionKey: criterion.key,
        maxPoints: criterion.maxPoints,
        measurements,
        frameT,
      });
      allDeductions.push(...result.deductions);

      if (hasOverride) {
        criteria.push(overriddenScore(criterion, override));
      } else {
        criteria.push({
          criterion: criterion.key,
          source: "machine",
          value: result.value,
          maxPoints: criterion.maxPoints,
          confidence: result.confidence,
          ruleVersion: RULES_VERSION,
        });
      }
      continue;
    }

    if (criterion.key === "stability") {
      stability = computeStability(window);
      const value = round(stability.stabilityScore * criterion.maxPoints);
      if (hasOverride) {
        criteria.push(overriddenScore(criterion, override));
      } else {
        criteria.push({
          criterion: criterion.key,
          source: "machine",
          value,
          maxPoints: criterion.maxPoints,
          confidence: round(calibratedFromDetector(meanDetectorConf)),
          ruleVersion: RULES_VERSION,
        });
      }
      continue;
    }

    // unknown machine criterion: treat as pending machine-not-scored
    criteria.push({
      criterion: criterion.key,
      source: "machine",
      value: hasOverride ? override : 0,
      maxPoints: criterion.maxPoints,
      confidence: 0,
      ruleVersion: RULES_VERSION,
      pending: !hasOverride,
    });
  }

  const total = round(criteria.reduce((s, c) => s + c.value, 0));
  const maxTotal = template.criteria.reduce((s, c) => s + c.maxPoints, 0);

  return {
    performanceId: derivePerformanceId(template, window),
    asanaTemplateId: template.id,
    criteria,
    deductions: allDeductions,
    stability,
    total,
    maxTotal,
    confidenceState,
    engineVersion: ENGINE_VERSION,
  };
}

/* ----------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/** Smoothstep calibration mirror (kept local to avoid import churn). */
function calibratedFromDetector(c: number): number {
  const x = Math.max(0, Math.min(1, c));
  return x * x * (3 - 2 * x);
}

/** Judge-owned criterion: pending machine-not-scored unless overridden. */
function judgeCriterion(
  criterion: Criterion,
  override: number | undefined,
  hasOverride: boolean,
): CriterionScore {
  if (hasOverride) {
    return overriddenScore(criterion, override as number);
  }
  return {
    criterion: criterion.key,
    source: "judge",
    value: 0,
    maxPoints: criterion.maxPoints,
    confidence: 0,
    ruleVersion: RULES_VERSION,
    pending: true,
  };
}

/** Apply a judge override to a criterion (clamped to [0, maxPoints]). */
function overriddenScore(criterion: Criterion, value: number): CriterionScore {
  const clamped = Math.max(0, Math.min(criterion.maxPoints, value));
  return {
    criterion: criterion.key,
    source: "judge",
    value: round(clamped),
    maxPoints: criterion.maxPoints,
    confidence: 1,
    ruleVersion: RULES_VERSION,
    pending: false,
  };
}

/**
 * Derive a stable performance id from the template id and a cheap fingerprint
 * of the frame stream. Pure: identical inputs -> identical id.
 */
function derivePerformanceId(template: AsanaTemplate, frames: PoseFrame[]): string {
  let h = 2166136261 >>> 0; // FNV-1a
  const mix = (n: number) => {
    // fold a float into the hash via its rounded integer micro-units
    const v = Math.round(n * 1000) | 0;
    h ^= v & 0xff;
    h = Math.imul(h, 16777619) >>> 0;
    h ^= (v >>> 8) & 0xff;
    h = Math.imul(h, 16777619) >>> 0;
  };
  for (let i = 0; i < template.id.length; i++) {
    h ^= template.id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  for (const f of frames) {
    mix(f.t);
    mix(f.confidence);
    for (const k of f.keypoints) {
      mix(k.x);
      mix(k.y);
      mix(k.score);
    }
  }
  return `perf_${template.id}_${h.toString(16).padStart(8, "0")}`;
}
