/**
 * Yoga Drishti — synthetic pose frames.
 *
 * `sampleFrames(templateId)` returns a deterministic ~60-frame HOLD of the
 * template's target pose. The skeleton is constructed so that the alignment
 * angles measured by the scoring engine land NEAR (mostly ON) the template's
 * AngleTarget targets — yielding a high-but-imperfect score with a couple of
 * small deductions once per-frame wobble is added.
 *
 * Determinism is absolute: the only source of variation is a seeded mulberry32
 * PRNG keyed off a constant seed + frame index. No wall-clock time, no global
 * Math.random. Two calls with the same templateId are deep-equal.
 *
 * Joint placement is a forward-kinematic construction: anchor joints (nose,
 * shoulders, hips, plus any limb root not otherwise driven) are fixed, then
 * every AngleTarget places its distal `to` joint at exactly the target angle
 * relative to the (already placed) vertex and `from` joints. Processing the
 * targets in root→leaf order guarantees each `to` joint is the one being set.
 */
import type { JointName, Keypoint, PoseFrame, AsanaTemplate } from "@/lib/contracts";
import { TEMPLATES, getTemplate } from "@/lib/sample/templates";

/** Every joint our contracts define — a frame must carry all of them. */
const ALL_JOINTS: JointName[] = [
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
];

const FRAME_COUNT = 60;
const FRAME_STEP_MS = 50;
/** Constant seed — combined with the frame index this makes wobble reproducible. */
const WOBBLE_SEED = 0x59_4f_47_41; // "YOGA"
/** Peak per-axis wobble in normalized image units (a few pixels at 720p). */
const WOBBLE_AMPLITUDE = 0.004;

interface Pt {
  x: number;
  y: number;
}

/**
 * mulberry32 — a tiny, fast, fully deterministic 32-bit PRNG.
 * Same seed in => same stream out. Returns floats in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d_2b_79_f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Round to 6 decimals so serialized frames are clean and stable. */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * Place a distal joint so that the angle (from -> vertex -> placed) equals
 * `deg`. We take the direction vertex->from, rotate it by `sign * deg`, and
 * step `len` along it from the vertex.
 */
function place(vertex: Pt, from: Pt, deg: number, len: number, sign: number): Pt {
  const baseAngle = Math.atan2(from.y - vertex.y, from.x - vertex.x);
  const theta = baseAngle + sign * deg2rad(deg);
  return { x: vertex.x + len * Math.cos(theta), y: vertex.y + len * Math.sin(theta) };
}

/** Ordered placement instruction: set `to` from vertex `joint` + `from`. */
interface Placement {
  joint: JointName; // vertex (must already be placed)
  from: JointName; // reference arm (must already be placed)
  to: JointName; // distal joint produced by this step
  target: number; // degrees
  len: number; // segment length in normalized units
  sign: number; // rotation direction (+1 / -1) to keep the limb plausible
}

interface PoseLayout {
  anchors: Record<string, Pt>;
  placements: Placement[];
}

/**
 * Hand-tuned forward-kinematic layouts. Targets/angles mirror the template
 * AngleTargets exactly so the scoring engine sees the intended form. Lengths
 * and signs are chosen to keep the figure anatomically plausible and inside
 * the normalized image frame.
 */
const LAYOUTS: Record<string, PoseLayout> = {
  // Natarajasana — standing on a straight left leg, right leg lifted & flexed
  // behind, right arm reaching up/forward, left arm bent back to catch.
  natarajasana: {
    anchors: {
      nose: { x: 0.5, y: 0.16 },
      left_shoulder: { x: 0.44, y: 0.26 },
      right_shoulder: { x: 0.56, y: 0.26 },
      left_hip: { x: 0.46, y: 0.52 },
      right_hip: { x: 0.54, y: 0.52 },
      // left arm catches the foot — not driven by any shoulder AngleTarget,
      // so it is an anchor and its elbow target then places the wrist.
      left_elbow: { x: 0.4, y: 0.38 },
    },
    placements: [
      { joint: "left_hip", from: "left_shoulder", to: "left_knee", target: 165, len: 0.2, sign: 1 },
      { joint: "right_hip", from: "right_shoulder", to: "right_knee", target: 120, len: 0.17, sign: 1 },
      { joint: "left_knee", from: "left_hip", to: "left_ankle", target: 178, len: 0.18, sign: 1 },
      { joint: "right_knee", from: "right_hip", to: "right_ankle", target: 55, len: 0.15, sign: 1 },
      { joint: "right_shoulder", from: "right_hip", to: "right_elbow", target: 160, len: 0.14, sign: -1 },
      { joint: "right_elbow", from: "right_shoulder", to: "right_wrist", target: 168, len: 0.13, sign: -1 },
      { joint: "left_elbow", from: "left_shoulder", to: "left_wrist", target: 95, len: 0.13, sign: 1 },
    ],
  },
  // Vrksasana — tree: straight left leg, right foot to inner thigh (knee
  // splayed), both arms extended overhead with palms together.
  vrksasana: {
    anchors: {
      nose: { x: 0.5, y: 0.18 },
      left_shoulder: { x: 0.44, y: 0.28 },
      right_shoulder: { x: 0.56, y: 0.28 },
      left_hip: { x: 0.47, y: 0.54 },
      right_hip: { x: 0.53, y: 0.54 },
    },
    placements: [
      { joint: "left_hip", from: "left_shoulder", to: "left_knee", target: 175, len: 0.2, sign: 1 },
      { joint: "right_hip", from: "right_shoulder", to: "right_knee", target: 110, len: 0.14, sign: -1 },
      { joint: "left_knee", from: "left_hip", to: "left_ankle", target: 179, len: 0.18, sign: 1 },
      { joint: "right_knee", from: "right_hip", to: "right_ankle", target: 42, len: 0.12, sign: 1 },
      { joint: "left_shoulder", from: "left_hip", to: "left_elbow", target: 168, len: 0.14, sign: 1 },
      { joint: "right_shoulder", from: "right_hip", to: "right_elbow", target: 168, len: 0.14, sign: -1 },
      { joint: "left_elbow", from: "left_shoulder", to: "left_wrist", target: 172, len: 0.11, sign: 1 },
      { joint: "right_elbow", from: "right_shoulder", to: "right_wrist", target: 172, len: 0.11, sign: -1 },
    ],
  },
};

/** Build the exact base skeleton (no wobble) for a layout. */
function buildBaseSkeleton(layout: PoseLayout): Record<JointName, Pt> {
  const p: Record<string, Pt> = {};
  for (const [name, pt] of Object.entries(layout.anchors)) {
    p[name] = { x: pt.x, y: pt.y };
  }
  for (const step of layout.placements) {
    const vertex = p[step.joint];
    const from = p[step.from];
    p[step.to] = place(vertex, from, step.target, step.len, step.sign);
  }
  return p as Record<JointName, Pt>;
}

/**
 * Base detector confidence per joint (0.8..0.95). Deterministic per joint so
 * frame.confidence is stable; the wobble PRNG perturbs it very slightly.
 */
function baseScoreFor(joint: JointName): number {
  // Spread scores across the band by hashing the joint name deterministically.
  let h = 0;
  for (let i = 0; i < joint.length; i++) h = (h * 31 + joint.charCodeAt(i)) >>> 0;
  return 0.8 + (h % 16) / 100; // 0.80 .. 0.95
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/**
 * Resolve the template to use. Unknown / empty ids fall back to the first
 * template so callers always get usable frames.
 */
function resolveTemplate(templateId: string): AsanaTemplate {
  return getTemplate(templateId) ?? TEMPLATES[0];
}

/**
 * Generate ~60 deterministic PoseFrame for a synthetic HOLD of the template's
 * target pose. Reproducible: identical input => deep-equal output.
 */
export function sampleFrames(templateId: string): PoseFrame[] {
  const template = resolveTemplate(templateId);
  const layout = LAYOUTS[template.id] ?? LAYOUTS[TEMPLATES[0].id];
  const base = buildBaseSkeleton(layout);

  const frames: PoseFrame[] = [];

  for (let f = 0; f < FRAME_COUNT; f++) {
    // A fresh PRNG per frame, seeded by constant + frame index => any frame is
    // reproducible independently and the whole sequence is stable.
    const rand = mulberry32((WOBBLE_SEED + f * 0x9e_37_79_b9) >>> 0);

    const keypoints: Keypoint[] = ALL_JOINTS.map((joint) => {
      const pt = base[joint];
      // Centered wobble in [-amp, +amp]; tiny, so angles stay near target.
      const dx = (rand() - 0.5) * 2 * WOBBLE_AMPLITUDE;
      const dy = (rand() - 0.5) * 2 * WOBBLE_AMPLITUDE;
      const ds = (rand() - 0.5) * 0.02; // <= 0.01 score jitter
      const score = clamp01(round6(baseScoreFor(joint) + ds));
      return {
        name: joint,
        x: round6(clamp01(pt.x + dx)),
        y: round6(clamp01(pt.y + dy)),
        score,
      };
    });

    const confidence = round6(
      keypoints.reduce((sum, k) => sum + k.score, 0) / keypoints.length,
    );

    frames.push({ t: f * FRAME_STEP_MS, keypoints, confidence });
  }

  return frames;
}
