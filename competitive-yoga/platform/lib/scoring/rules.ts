/**
 * Yoga Drishti — declarative deduction-rule model and evaluator.
 *
 * Pure & deterministic. The single alignment rule turns per-joint angle
 * deviations into point deductions, scaled by each target's weight and the
 * criterion's maxPoints, capped at maxPoints. Confidence is calibrated from
 * detector confidence; below the abstain threshold the deduction is flagged
 * for human review.
 */
import {
  CONFIDENCE_ABSTAIN_THRESHOLD,
  NOISE_FLOOR_DEGREES,
  type AngleDeviation,
  type AngleTarget,
  type Deduction,
} from "@/lib/contracts";

/** Bump when the deduction math, thresholds, or rule shapes change. */
export const RULES_VERSION = "rules-1.0.0";

/** Id of the single alignment deduction rule. */
export const ALIGNMENT_RULE_ID = "alignment.angle_deviation";

/**
 * How aggressively a degree of deviation (beyond tolerance) converts into a
 * fraction of the per-target point budget. At SEVERITY_FULL_DEGREES degrees
 * past tolerance, a target is considered a "full" miss (severity 1.0).
 */
const SEVERITY_FULL_DEGREES = 45;

/** A measured angle paired with the target it should satisfy. */
export interface MeasuredAngle {
  target: AngleTarget;
  /** measured angle in degrees */
  measured: number;
  /** detector confidence for this measurement, 0..1 */
  confidence: number;
}

/** Input to the alignment evaluator. */
export interface AlignmentRuleInput {
  criterionKey: string;
  maxPoints: number;
  measurements: MeasuredAngle[];
  /** ms timestamp to stamp on emitted deductions / evidence */
  frameT: number;
}

/** Output of the alignment evaluator. */
export interface AlignmentRuleResult {
  deductions: Deduction[];
  /** points awarded after capped deductions */
  value: number;
  /** calibrated confidence over the contributing measurements */
  confidence: number;
  /** true if calibrated confidence is below the abstain floor */
  abstained: boolean;
}

/**
 * Calibrate raw detector confidence into a scoring confidence. We shape the
 * raw value with a smoothstep curve, keeping it monotonic: lower keypoint
 * confidence -> lower calibrated confidence. Deterministic, bounded to [0, 1].
 */
export function calibrateConfidence(detectorConfidence: number): number {
  const c = Math.max(0, Math.min(1, detectorConfidence));
  return c * c * (3 - 2 * c); // smoothstep, preserves 0->0 and 1->1
}

function round(n: number, dp = 3): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/**
 * Severity in [0, 1] for how far a measured angle sits beyond its tolerance
 * band. Deviations within tolerance OR within the noise floor are 0.
 */
function severityFor(deviationBeyondTolerance: number): number {
  if (deviationBeyondTolerance <= 0) return 0;
  return Math.min(1, deviationBeyondTolerance / SEVERITY_FULL_DEGREES);
}

/** Human-readable phrasing for which way the joint missed. */
function describeDirection(measured: number, target: number): string {
  return measured > target ? "extended" : "flexed";
}

/**
 * Evaluate the alignment criterion. For each target whose absolute error
 * exceeds BOTH its tolerance and the global noise floor, emit a deduction
 * proportional to severity, weight and the per-criterion point budget. Total
 * deductions are capped at maxPoints.
 */
export function evaluateAlignment(input: AlignmentRuleInput): AlignmentRuleResult {
  const { criterionKey, maxPoints, measurements, frameT } = input;

  // total weight defines how the point budget is shared across targets
  const totalWeight = measurements.reduce((s, m) => s + m.target.weight, 0);

  const raw: Deduction[] = [];
  let confSum = 0;
  let confCount = 0;

  for (let i = 0; i < measurements.length; i++) {
    const m = measurements[i];
    confSum += m.confidence;
    confCount += 1;

    const error = Math.abs(m.measured - m.target.target);
    const beyondTolerance = error - m.target.tolerance;

    // gate on BOTH tolerance and the absolute noise floor
    if (beyondTolerance <= 0) continue;
    if (error <= NOISE_FLOOR_DEGREES) continue;

    const severity = severityFor(beyondTolerance);
    if (severity === 0) continue;

    // this target's share of the point budget
    const budget = totalWeight > 0 ? (m.target.weight / totalWeight) * maxPoints : 0;
    const magnitude = round(severity * budget);
    if (magnitude <= 0) continue;

    const calibrated = round(calibrateConfidence(m.confidence));
    const deviation: AngleDeviation = {
      joint: m.target.joint,
      measured: round(m.measured, 1),
      target: m.target.target,
      deviation: round(beyondTolerance, 1),
    };

    raw.push({
      // deterministic id: rule + joint + ordinal (no clock, no RNG)
      id: `${ALIGNMENT_RULE_ID}#${m.target.joint}#${i}`,
      t: frameT,
      criterion: criterionKey,
      ruleId: ALIGNMENT_RULE_ID,
      ruleVersion: RULES_VERSION,
      magnitude,
      reason:
        `${m.target.joint} ${describeDirection(m.measured, m.target.target)} ` +
        `${round(beyondTolerance, 1)}° beyond target — ${criterionKey} −${magnitude}`,
      confidence: calibrated,
      abstained: calibrated < CONFIDENCE_ABSTAIN_THRESHOLD,
      evidence: { frameT, deviations: [deviation] },
    });
  }

  // cap total deductions at the point budget
  const rawTotal = raw.reduce((s, d) => s + d.magnitude, 0);
  let deductions = raw;
  if (rawTotal > maxPoints && rawTotal > 0) {
    const scale = maxPoints / rawTotal;
    deductions = raw.map((d) => ({ ...d, magnitude: round(d.magnitude * scale) }));
  }

  const cappedTotal = Math.min(maxPoints, deductions.reduce((s, d) => s + d.magnitude, 0));
  const value = round(Math.max(0, maxPoints - cappedTotal));

  const meanConf = confCount > 0 ? confSum / confCount : 0;
  const confidence = round(calibrateConfidence(meanConf));
  const abstained = confidence < CONFIDENCE_ABSTAIN_THRESHOLD;

  return { deductions, value, confidence, abstained };
}
