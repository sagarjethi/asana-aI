/**
 * Yoga Drishti — sample asana templates.
 *
 * A reference form is a DISTRIBUTION of joint-angle targets with tolerance
 * bands (judge-ratified), not one golden skeleton (spec/11). Each template
 * carries three criteria:
 *   - alignment (machine, 10 pts) — angle targets the scoring engine measures
 *   - stability (machine, 10 pts) — COM-sway / micro-movement proxy
 *   - grace     (judge,   10 pts) — human aesthetic judgement
 *
 * Joint names use the EXACT JointName string values from lib/contracts.
 * No nondeterminism here: these are static, hand-authored constants.
 */
import type { AsanaTemplate, AngleTarget, Criterion } from "@/lib/contracts";

/* Natarajasana — Lord of the Dance / dancer's pose.
 * Standing on one straight leg; the other leg bends back and is held overhead
 * by the same-side arm. Big back-bend; lifted thigh; raised front arm. */
const NATARAJASANA_ANGLES: AngleTarget[] = [
  // standing (left) leg: nearly straight at the knee
  { joint: "left_knee", from: "left_hip", to: "left_ankle", target: 178, tolerance: 6, weight: 1.0 },
  // lifted (right) leg: deeply flexed knee as the foot is drawn up behind
  { joint: "right_knee", from: "right_hip", to: "right_ankle", target: 55, tolerance: 12, weight: 0.9 },
  // standing-side hip: open / extended for the back-bend
  { joint: "left_hip", from: "left_shoulder", to: "left_knee", target: 165, tolerance: 10, weight: 0.8 },
  // lifted-side hip: extended behind the body
  { joint: "right_hip", from: "right_shoulder", to: "right_knee", target: 120, tolerance: 12, weight: 0.7 },
  // raised (right) arm reaching forward/up: extended elbow
  { joint: "right_elbow", from: "right_shoulder", to: "right_wrist", target: 168, tolerance: 8, weight: 0.6 },
  // catching (left) arm reaching back to the foot: moderately flexed elbow
  { joint: "left_elbow", from: "left_shoulder", to: "left_wrist", target: 95, tolerance: 12, weight: 0.5 },
  // raised arm lifted high at the shoulder
  { joint: "right_shoulder", from: "right_hip", to: "right_elbow", target: 160, tolerance: 10, weight: 0.6 },
];

/* Vrksasana — tree pose.
 * Standing on one straight leg; opposite foot pressed to the inner thigh
 * (externally rotated, deeply flexed knee out to the side); palms together
 * overhead with arms extended. */
const VRKSASANA_ANGLES: AngleTarget[] = [
  // standing (left) leg: straight, stacked over the ankle
  { joint: "left_knee", from: "left_hip", to: "left_ankle", target: 179, tolerance: 5, weight: 1.0 },
  // bent (right) knee: foot to inner thigh, knee splayed out
  { joint: "right_knee", from: "right_hip", to: "right_ankle", target: 42, tolerance: 12, weight: 0.9 },
  // bent-side hip: externally rotated / abducted
  { joint: "right_hip", from: "right_shoulder", to: "right_knee", target: 110, tolerance: 12, weight: 0.8 },
  // standing-side hip: tall and neutral
  { joint: "left_hip", from: "left_shoulder", to: "left_knee", target: 175, tolerance: 7, weight: 0.8 },
  // both arms extended overhead, palms together
  { joint: "left_elbow", from: "left_shoulder", to: "left_wrist", target: 172, tolerance: 7, weight: 0.7 },
  { joint: "right_elbow", from: "right_shoulder", to: "right_wrist", target: 172, tolerance: 7, weight: 0.7 },
  { joint: "left_shoulder", from: "left_hip", to: "left_elbow", target: 168, tolerance: 9, weight: 0.6 },
  { joint: "right_shoulder", from: "right_hip", to: "right_elbow", target: 168, tolerance: 9, weight: 0.6 },
];

function criteriaFor(angles: AngleTarget[]): Criterion[] {
  return [
    {
      key: "alignment",
      label: "Alignment",
      maxPoints: 10,
      source: "machine",
      angles,
    },
    {
      key: "stability",
      label: "Stability & Hold",
      maxPoints: 10,
      source: "machine",
    },
    {
      key: "grace",
      label: "Grace & Expression",
      maxPoints: 10,
      source: "judge",
    },
  ];
}

export const TEMPLATES: AsanaTemplate[] = [
  {
    id: "natarajasana",
    name: "Natarajasana",
    segmenterLabel: "dancer_pose",
    holdSeconds: 20,
    criteria: criteriaFor(NATARAJASANA_ANGLES),
  },
  {
    id: "vrksasana",
    name: "Vrksasana",
    segmenterLabel: "tree_pose",
    holdSeconds: 20,
    criteria: criteriaFor(VRKSASANA_ANGLES),
  },
];

/** Look up a template by id. */
export function getTemplate(id: string): AsanaTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
