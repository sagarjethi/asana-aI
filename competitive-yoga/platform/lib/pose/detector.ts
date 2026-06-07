"use client";

/**
 * Yoga Drishti — live pose detector (browser only).
 *
 * Thin wrapper over @tensorflow-models/pose-detection's MoveNet. TensorFlow is
 * imported LAZILY inside createDetector() so nothing TF-related runs at module
 * import or build time (keeps SSR / bundling clean — heavy WASM/WebGL backends
 * only load when a client actually starts detecting).
 */
import type { Keypoint, JointName } from "@/lib/contracts";

/** The joints our domain cares about. MoveNet emits more (eyes, ears); we drop those. */
const JOINT_NAMES: ReadonlySet<string> = new Set<JointName>([
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
]);

/**
 * Create a MoveNet SinglePose Lightning detector.
 *
 * TFJS + the pose-detection model are imported inside this function on purpose:
 * the imports (and the WebGL/WASM backend they pull in) must never execute
 * during SSR or at build time. Returns the raw detector (typed `any` to avoid
 * a hard build-time dependency on the model's types).
 */
export async function createDetector(): Promise<any> {
  // Lazy, client-side-only imports.
  await import("@tensorflow/tfjs");
  const poseDetection = await import("@tensorflow-models/pose-detection");

  const model = poseDetection.SupportedModels.MoveNet;
  return poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });
}

/**
 * Map a raw detector pose to our Keypoint[].
 *
 * MoveNet keypoints carry snake_case names ("left_knee") and a `score`. We keep
 * only the joints in our JointName set and normalize the score to a 0..1 number.
 */
export function toKeypoints(pose: any): Keypoint[] {
  const raw: any[] = pose?.keypoints ?? [];
  const out: Keypoint[] = [];

  for (const kp of raw) {
    const name = kp?.name as string | undefined;
    if (!name || !JOINT_NAMES.has(name)) continue;

    const score = typeof kp.score === "number" ? kp.score : 0;
    out.push({
      name: name as JointName,
      x: kp.x,
      y: kp.y,
      score: Math.max(0, Math.min(1, score)),
    });
  }

  return out;
}
