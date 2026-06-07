/**
 * GET /api/leaderboard?roundId=... — demo leaderboard.
 *
 * No DB required. Takes the first template and scores ~6 sample athletes against
 * sampleFrames, applying a small DETERMINISTIC per-athlete offset (seeded by the
 * athlete index — no Math.random / Date) to a few keypoints so totals differ.
 * Returns LeaderboardRow[] sorted by total desc with 1-based ranks.
 */
import { NextResponse } from "next/server";
import type { LeaderboardRow, PoseFrame, JointName } from "@/lib/contracts";
import { TEMPLATES } from "@/lib/sample/templates";
import { scorePerformance } from "@/lib/scoring";
import { sampleFrames } from "@/lib/sample/keypoints";
import { store } from "@/lib/store";

interface DemoAthlete {
  id: string;
  name: string;
  country: string;
}

const ATHLETES: DemoAthlete[] = [
  { id: "ath-1", name: "Ananya Rao", country: "IN" },
  { id: "ath-2", name: "Mei Lin", country: "CN" },
  { id: "ath-3", name: "Sofia Costa", country: "BR" },
  { id: "ath-4", name: "Lena Müller", country: "DE" },
  { id: "ath-5", name: "Aiko Tanaka", country: "JP" },
  { id: "ath-6", name: "Nadia Haddad", country: "FR" },
];

/** Joints nudged per-athlete to produce deterministic score spread. */
const NUDGE_JOINTS: JointName[] = ["right_knee", "left_hip", "right_elbow"];

/**
 * Apply a deterministic offset to a few keypoints. The offset grows with the
 * athlete index so each athlete deviates a bit more from the reference form,
 * yielding distinct (and reproducible) totals.
 */
function nudgeFrames(frames: PoseFrame[], athleteIndex: number): PoseFrame[] {
  const offset = athleteIndex * 0.012; // fractional, deterministic
  const targets = new Set<JointName>(NUDGE_JOINTS);
  return frames.map((frame) => ({
    ...frame,
    keypoints: frame.keypoints.map((kp) =>
      targets.has(kp.name as JointName)
        ? { ...kp, x: kp.x + offset, y: kp.y - offset }
        : kp,
    ),
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roundId = searchParams.get("roundId") ?? undefined;

  // Real results take precedence: if a round has scored performances, return them.
  if (roundId) {
    const results = store.roundResults(roundId);
    if (results.length > 0) {
      return NextResponse.json(results);
    }
  }

  const template = TEMPLATES[0];
  const base = sampleFrames(template.id);

  const rows: LeaderboardRow[] = ATHLETES.map((athlete, index) => {
    const score = scorePerformance(template, nudgeFrames(base, index));
    return {
      athleteId: athlete.id,
      athleteName: athlete.name,
      country: athlete.country,
      total: score.total,
      rank: 0,
    };
  });

  rows.sort((a, b) => b.total - a.total);
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  return NextResponse.json(rows);
}
