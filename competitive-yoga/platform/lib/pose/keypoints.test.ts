import { describe, it, expect } from "vitest";
import type { JointName, PoseFrame } from "@/lib/contracts";
import { sampleFrames } from "@/lib/sample/keypoints";
import { meanConfidence } from "@/lib/pose";

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

describe("sampleFrames", () => {
  const KNOWN_ID = "natarajasana";

  it("is reproducible: two calls are deep-equal", () => {
    const a = sampleFrames(KNOWN_ID);
    const b = sampleFrames(KNOWN_ID);
    expect(a).toEqual(b);
    // Distinct object identities (not the same cached array) but equal content.
    expect(a).not.toBe(b);
  });

  it("returns ~60 frames", () => {
    const frames = sampleFrames(KNOWN_ID);
    expect(frames.length).toBe(60);
  });

  it("every frame has a keypoint for every JointName, all scores in 0..1", () => {
    const frames = sampleFrames(KNOWN_ID);
    for (const frame of frames) {
      const names = frame.keypoints.map((k) => k.name).sort();
      expect(names).toEqual([...ALL_JOINTS].sort());

      for (const kp of frame.keypoints) {
        expect(kp.score).toBeGreaterThanOrEqual(0);
        expect(kp.score).toBeLessThanOrEqual(1);
        // Normalized image coords stay in frame.
        expect(kp.x).toBeGreaterThanOrEqual(0);
        expect(kp.x).toBeLessThanOrEqual(1);
        expect(kp.y).toBeGreaterThanOrEqual(0);
        expect(kp.y).toBeLessThanOrEqual(1);
      }
    }
  });

  it("frame.t increments and confidence is in 0..1 and matches mean score", () => {
    const frames = sampleFrames(KNOWN_ID);
    frames.forEach((frame: PoseFrame, i) => {
      expect(frame.t).toBe(i * 50);
      expect(frame.confidence).toBeGreaterThanOrEqual(0);
      expect(frame.confidence).toBeLessThanOrEqual(1);
      expect(frame.confidence).toBeCloseTo(meanConfidence(frame), 5);
    });
  });

  it("falls back to the first template for an unknown id (still 60 valid frames)", () => {
    const frames = sampleFrames("not-a-real-pose");
    expect(frames.length).toBe(60);
    expect(frames[0].keypoints.length).toBe(ALL_JOINTS.length);
  });
});
