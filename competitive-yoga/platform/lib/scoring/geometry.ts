/**
 * Yoga Drishti — scoring geometry helpers.
 *
 * Pure, deterministic functions over keypoints. No I/O, no clock, no RNG.
 * All angles are returned in degrees.
 */
import type { JointName, Keypoint } from "@/lib/contracts";

export interface Point2 {
  x: number;
  y: number;
}

const RAD_TO_DEG = 180 / Math.PI;

/** Look up a keypoint by joint name; returns undefined if absent. */
export function findKeypoint(keypoints: Keypoint[], name: JointName): Keypoint | undefined {
  return keypoints.find((k) => k.name === name);
}

/**
 * Angle in degrees at `vertex` formed by the rays vertex->a and vertex->b,
 * via the vector dot product. Returns a value in [0, 180].
 * Degenerate inputs (a coincident point) yield 0.
 */
export function angleAt(vertex: Point2, a: Point2, b: Point2): number {
  const ax = a.x - vertex.x;
  const ay = a.y - vertex.y;
  const bx = b.x - vertex.x;
  const by = b.y - vertex.y;

  const magA = Math.hypot(ax, ay);
  const magB = Math.hypot(bx, by);
  if (magA === 0 || magB === 0) return 0;

  const dot = ax * bx + ay * by;
  // clamp to guard against floating-point drift outside [-1, 1]
  let cos = dot / (magA * magB);
  if (cos > 1) cos = 1;
  if (cos < -1) cos = -1;

  return Math.acos(cos) * RAD_TO_DEG;
}

/**
 * Angle in degrees at the `vertex` keypoint formed by three keypoints
 * (from -> vertex -> to), resolved by joint name. Returns undefined if any
 * of the three keypoints is missing.
 */
export function angleAtJoint(
  keypoints: Keypoint[],
  vertex: JointName,
  from: JointName,
  to: JointName,
): number | undefined {
  const v = findKeypoint(keypoints, vertex);
  const a = findKeypoint(keypoints, from);
  const b = findKeypoint(keypoints, to);
  if (!v || !a || !b) return undefined;
  return angleAt(v, a, b);
}

/**
 * Center-of-mass estimate: a confidence-weighted mean of the keypoints.
 * Each keypoint contributes in proportion to its detector score, so
 * low-confidence joints sway the estimate less. Falls back to a plain mean
 * if total weight is zero. Returns the origin for an empty set.
 */
export function centerOfMass(keypoints: Keypoint[]): Point2 {
  if (keypoints.length === 0) return { x: 0, y: 0 };

  let wSum = 0;
  let xSum = 0;
  let ySum = 0;
  for (const k of keypoints) {
    const w = k.score;
    wSum += w;
    xSum += k.x * w;
    ySum += k.y * w;
  }

  if (wSum === 0) {
    // all-zero confidence: unweighted mean so we still have a sane estimate
    const n = keypoints.length;
    let px = 0;
    let py = 0;
    for (const k of keypoints) {
      px += k.x;
      py += k.y;
    }
    return { x: px / n, y: py / n };
  }

  return { x: xSum / wSum, y: ySum / wSum };
}

/** Euclidean distance between two points. */
export function distance(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
