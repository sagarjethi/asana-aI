import { describe, it, expect } from "vitest";
import type { AngleTarget, AsanaTemplate, JointName, Keypoint, PoseFrame } from "@/lib/contracts";
import { getTemplate } from "@/lib/sample/templates";
import { computeAngles, scorePerformance, RULES_VERSION } from "./index";

/**
 * Synthetic alignment targets that use DISJOINT joint names, so a single frame
 * can realise every target's angle exactly with no cross-target coordinate
 * sharing. (The shipped templates reuse joints — e.g. a shoulder is a vertex in
 * one target and an endpoint in another — which cannot all be satisfied by one
 * 2D skeleton, so we use these for exactness assertions and keep the real
 * templates for behaviour that does not depend on hitting exact angles.)
 */
const DISJOINT_TARGETS: AngleTarget[] = [
  { joint: "left_elbow", from: "left_shoulder", to: "left_wrist", target: 90, tolerance: 6, weight: 1.0 },
  { joint: "right_elbow", from: "right_shoulder", to: "right_wrist", target: 150, tolerance: 8, weight: 0.8 },
  { joint: "left_knee", from: "left_hip", to: "left_ankle", target: 170, tolerance: 6, weight: 0.9 },
  { joint: "right_knee", from: "right_hip", to: "right_ankle", target: 60, tolerance: 10, weight: 0.7 },
];

function syntheticTemplate(targets: AngleTarget[] = DISJOINT_TARGETS): AsanaTemplate {
  return {
    id: "synthetic",
    name: "Synthetic",
    holdSeconds: 10,
    criteria: [
      { key: "alignment", label: "Alignment", maxPoints: 10, source: "machine", angles: targets },
      { key: "stability", label: "Stability", maxPoints: 10, source: "machine" },
      { key: "grace", label: "Grace", maxPoints: 10, source: "judge" },
    ],
  };
}

/**
 * Build a PoseFrame realising each target's angle (+delta). Requires the
 * targets to use disjoint joint names; the vertex sits at a per-target anchor,
 * `from` along +x and `to` rotated by target+delta degrees.
 */
function frameForTargets(
  targets: AngleTarget[],
  opts: { deltaDeg?: number; score?: number; t?: number } = {},
): PoseFrame {
  const delta = opts.deltaDeg ?? 0;
  const score = opts.score ?? 0.95;
  const t = opts.t ?? 0;

  const map = new Map<JointName, Keypoint>();
  const ARM = 100;

  targets.forEach((target, i) => {
    const ax = i * 1000;
    const ay = i * 1000;
    const angleRad = ((target.target + delta) * Math.PI) / 180;

    map.set(target.from, { name: target.from, x: ax + ARM, y: ay, score });
    map.set(target.to, {
      name: target.to,
      x: ax + ARM * Math.cos(angleRad),
      y: ay + ARM * Math.sin(angleRad),
      score,
    });
    // vertex written last so its coordinates remain authoritative
    map.set(target.joint, { name: target.joint, x: ax, y: ay, score });
  });

  return { t, keypoints: [...map.values()], confidence: score };
}

function singleTargetFrame(target: AngleTarget, deltaDeg: number, score = 0.95): PoseFrame {
  return frameForTargets([target], { deltaDeg, score });
}

describe("computeAngles", () => {
  it("recovers the target angle from a constructed frame", () => {
    const target = DISJOINT_TARGETS[0];
    const frame = singleTargetFrame(target, 0);
    const angles = computeAngles(frame, [target]);
    expect(angles).toHaveLength(1);
    expect(angles[0].joint).toBe("left_elbow");
    expect(angles[0].degrees).toBeCloseTo(90, 1);
  });
});

describe("scorePerformance — perfect pose", () => {
  it("awards (near) max alignment with no deductions", () => {
    const template = syntheticTemplate();
    const frame = frameForTargets(DISJOINT_TARGETS, { deltaDeg: 0 });
    const result = scorePerformance(template, [frame, frame, frame]);

    const align = result.criteria.find((c) => c.criterion === "alignment")!;
    expect(result.deductions).toHaveLength(0);
    expect(align.value).toBeCloseTo(10, 5);
    expect(align.source).toBe("machine");
    expect(align.ruleVersion).toBe(RULES_VERSION);
  });
});

describe("scorePerformance — off pose", () => {
  it("produces deductions when angles are clearly off", () => {
    const template = syntheticTemplate();
    const frame = frameForTargets(DISJOINT_TARGETS, { deltaDeg: 30 });
    const result = scorePerformance(template, [frame, frame]);

    expect(result.deductions.length).toBeGreaterThan(0);
    for (const d of result.deductions) {
      expect(d.magnitude).toBeGreaterThan(0);
      expect(d.reason).toMatch(/beyond target/);
      expect(d.ruleVersion).toBe(RULES_VERSION);
    }
    const align = result.criteria.find((c) => c.criterion === "alignment")!;
    expect(align.value).toBeLessThan(10);
    expect(align.value).toBeGreaterThanOrEqual(0);
  });

  it("caps total alignment deductions at maxPoints", () => {
    const template = syntheticTemplate();
    const frame = frameForTargets(DISJOINT_TARGETS, { deltaDeg: 90 });
    const result = scorePerformance(template, [frame]);
    const align = result.criteria.find((c) => c.criterion === "alignment")!;
    expect(align.value).toBeGreaterThanOrEqual(0);
    const totalDed = result.deductions.reduce((s, d) => s + d.magnitude, 0);
    expect(totalDed).toBeLessThanOrEqual(10 + 1e-9);
  });
});

describe("scorePerformance — noise floor", () => {
  it("does NOT deduct for a sub-noise-floor deviation", () => {
    // tiny tolerance so the only gate that matters is the global noise floor
    const target: AngleTarget = {
      joint: "left_knee",
      from: "left_hip",
      to: "left_ankle",
      target: 170,
      tolerance: 1, // 4° error is outside tolerance...
      weight: 1,
    };
    const template = syntheticTemplate([target]);
    // 4° deviation: beyond the 1° tolerance but within the 5° noise floor
    const frame = singleTargetFrame(target, 4);
    const result = scorePerformance(template, [frame]);
    expect(result.deductions).toHaveLength(0);
    const align = result.criteria.find((c) => c.criterion === "alignment")!;
    expect(align.value).toBeCloseTo(10, 5);
  });
});

describe("scorePerformance — judge criteria & overrides", () => {
  it("marks judge criteria as pending machine-not-scored by default", () => {
    const template = getTemplate("vrksasana")!;
    const angles = template.criteria.find((c) => c.key === "alignment")!.angles!;
    const result = scorePerformance(template, [frameForTargets(angles)]);
    const grace = result.criteria.find((c) => c.criterion === "grace")!;
    expect(grace.source).toBe("judge");
    expect(grace.value).toBe(0);
    expect(grace.pending).toBe(true);
  });

  it("applies a judge override, marking it source=judge and not pending", () => {
    const template = getTemplate("vrksasana")!;
    const angles = template.criteria.find((c) => c.key === "alignment")!.angles!;
    const result = scorePerformance(template, [frameForTargets(angles)], {
      judgeOverrides: { grace: 8.5 },
    });
    const grace = result.criteria.find((c) => c.criterion === "grace")!;
    expect(grace.source).toBe("judge");
    expect(grace.value).toBe(8.5);
    expect(grace.pending).toBe(false);
  });
});

describe("scorePerformance — stability & confidence state", () => {
  it("reports high stability for a still pose", () => {
    const template = syntheticTemplate();
    const frame = frameForTargets(DISJOINT_TARGETS);
    const result = scorePerformance(template, [frame, frame, frame]);
    expect(result.stability).toBeDefined();
    expect(result.stability!.stabilityScore).toBeCloseTo(1, 5);
    const stab = result.criteria.find((c) => c.criterion === "stability")!;
    expect(stab.value).toBeCloseTo(10, 5);
  });

  it("sets confidenceState from mean detector confidence", () => {
    const template = syntheticTemplate();
    const ok = scorePerformance(template, [frameForTargets(DISJOINT_TARGETS, { score: 0.95 })]);
    const reduced = scorePerformance(template, [frameForTargets(DISJOINT_TARGETS, { score: 0.6 })]);
    const humanOnly = scorePerformance(template, [frameForTargets(DISJOINT_TARGETS, { score: 0.2 })]);
    expect(ok.confidenceState).toBe("ok");
    expect(reduced.confidenceState).toBe("reduced");
    expect(humanOnly.confidenceState).toBe("human_only");
  });
});

describe("scorePerformance — determinism", () => {
  it("returns deep-equal results across two identical calls", () => {
    const template = getTemplate("natarajasana")!;
    const angles = template.criteria.find((c) => c.key === "alignment")!.angles!;
    const frames = [
      frameForTargets(angles, { deltaDeg: 12, t: 0 }),
      frameForTargets(angles, { deltaDeg: 12, t: 33 }),
    ];
    const a = scorePerformance(template, frames, { judgeOverrides: { grace: 7 } });
    const b = scorePerformance(template, frames, { judgeOverrides: { grace: 7 } });
    expect(a).toEqual(b);
  });
});
