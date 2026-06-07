/**
 * Yoga Drishti — pose module public surface.
 *
 * Re-exports the synthetic frame generator and exposes a small confidence
 * helper. The live detector (detector.ts) is intentionally NOT re-exported here
 * so that importing this module never drags in TensorFlow on the server.
 */
import type { PoseFrame } from "@/lib/contracts";

export { sampleFrames } from "@/lib/sample/keypoints";

/**
 * Mean detector confidence across a frame's keypoints (0..1).
 * Returns 0 for an empty frame to stay defined.
 */
export function meanConfidence(frame: PoseFrame): number {
  const kps = frame.keypoints;
  if (kps.length === 0) return 0;
  return kps.reduce((sum, k) => sum + k.score, 0) / kps.length;
}
