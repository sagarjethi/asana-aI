import { describe, it, expect } from "vitest";
import type { Keypoint } from "@/lib/contracts";
import { angleAt, angleAtJoint, centerOfMass, distance } from "./geometry";

describe("geometry.angleAt", () => {
  it("measures a right angle as ~90 degrees", () => {
    const vertex = { x: 0, y: 0 };
    const a = { x: 1, y: 0 }; // along +x
    const b = { x: 0, y: 1 }; // along +y
    expect(angleAt(vertex, a, b)).toBeCloseTo(90, 6);
  });

  it("measures a straight line as ~180 degrees", () => {
    expect(angleAt({ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(180, 6);
  });

  it("measures coincident rays as ~0 degrees", () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBeCloseTo(0, 4);
  });

  it("returns 0 for a degenerate (zero-length) ray", () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });
});

describe("geometry.angleAtJoint", () => {
  const kps: Keypoint[] = [
    { name: "left_elbow", x: 0, y: 0, score: 0.9 },
    { name: "left_shoulder", x: 1, y: 0, score: 0.9 },
    { name: "left_wrist", x: 0, y: 1, score: 0.9 },
  ];

  it("resolves a right angle at a named vertex", () => {
    expect(angleAtJoint(kps, "left_elbow", "left_shoulder", "left_wrist")).toBeCloseTo(90, 6);
  });

  it("returns undefined when a keypoint is missing", () => {
    expect(angleAtJoint(kps, "left_elbow", "left_shoulder", "right_wrist")).toBeUndefined();
  });
});

describe("geometry.centerOfMass", () => {
  it("returns the origin for an empty set", () => {
    expect(centerOfMass([])).toEqual({ x: 0, y: 0 });
  });

  it("computes a confidence-weighted mean", () => {
    const kps: Keypoint[] = [
      { name: "left_hip", x: 0, y: 0, score: 1 },
      { name: "right_hip", x: 10, y: 0, score: 3 },
    ];
    // weighted toward the higher-confidence point: (0*1 + 10*3)/4 = 7.5
    expect(centerOfMass(kps)).toEqual({ x: 7.5, y: 0 });
  });

  it("falls back to an unweighted mean when all scores are zero", () => {
    const kps: Keypoint[] = [
      { name: "left_hip", x: 0, y: 0, score: 0 },
      { name: "right_hip", x: 4, y: 2, score: 0 },
    ];
    expect(centerOfMass(kps)).toEqual({ x: 2, y: 1 });
  });
});

describe("geometry.distance", () => {
  it("computes euclidean distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
