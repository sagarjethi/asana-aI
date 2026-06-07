/**
 * GET /api/live?templateId=... — Server-Sent-Events stream of a demo round.
 *
 * Sequence (monotonic `seq`):
 *   round_state(live)
 *   -> time-spaced pose_frame_summary chunks (computeAngles on the alignment
 *      targets) with occasional candidate_deduction (from scorePerformance)
 *   -> leaderboard_update
 *   -> round_state(complete)
 *   -> close
 *
 * Pacing is via setTimeout (total ~10-12s). Event PAYLOADS never embed
 * wall-clock-derived values — frame.t comes from the sample data, not Date.now().
 */
import type {
  LiveEvent,
  LeaderboardRow,
  PoseFrame,
  AngleTarget,
} from "@/lib/contracts";
import { TEMPLATES, getTemplate } from "@/lib/sample/templates";
import { scorePerformance, computeAngles } from "@/lib/scoring";
import { sampleFrames } from "@/lib/sample/keypoints";

export const dynamic = "force-dynamic";

const DEMO_ROWS: LeaderboardRow[] = [
  { athleteId: "ath-1", athleteName: "Ananya Rao", country: "IN", total: 0, rank: 1 },
  { athleteId: "ath-2", athleteName: "Mei Lin", country: "CN", total: 0, rank: 2 },
  { athleteId: "ath-3", athleteName: "Sofia Costa", country: "BR", total: 0, rank: 3 },
];

/** Collect the alignment criterion's angle targets for a template. */
function alignmentTargets(templateId: string): AngleTarget[] {
  const template = getTemplate(templateId);
  const alignment = template?.criteria.find((c) => c.key === "alignment");
  return alignment?.angles ?? [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId") ?? TEMPLATES[0].id;
  const template = getTemplate(templateId) ?? TEMPLATES[0];

  const frames: PoseFrame[] = sampleFrames(template.id);
  const targets = alignmentTargets(template.id);
  const performance = scorePerformance(template, frames);

  // Total wall budget ~11s across all emitted frames.
  const TOTAL_MS = 9000;
  // Emit at most ~24 frame summaries to keep the stream lively but bounded.
  const maxFrames = Math.min(frames.length, 24);
  const step = Math.max(1, Math.floor(frames.length / maxFrames));
  const selected = frames.filter((_, i) => i % step === 0).slice(0, maxFrames);
  const perFrameMs = Math.max(120, Math.floor(TOTAL_MS / (selected.length + 2)));

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let seq = 0;
      let closed = false;
      const timers: ReturnType<typeof setTimeout>[] = [];

      const send = (evt: LiveEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      };

      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const at = (ms: number, fn: () => void) => {
        timers.push(setTimeout(fn, ms));
      };

      // Abort cleanly if the client disconnects.
      req.signal.addEventListener("abort", () => {
        for (const t of timers) clearTimeout(t);
        finish();
      });

      // 1) round goes live
      send({
        type: "round_state",
        seq: seq++,
        roundId: "demo-round",
        status: "live",
        asana: template.name,
      });

      // 2) pose frame summaries + occasional candidate deductions
      let cursor = perFrameMs;
      selected.forEach((frame, idx) => {
        const fireAt = cursor;
        cursor += perFrameMs;
        at(fireAt, () => {
          const angles = computeAngles(frame, targets);
          send({
            type: "pose_frame_summary",
            seq: seq++,
            t: frame.t,
            confidence: frame.confidence,
            angles,
          });
          // Sprinkle in a candidate deduction every few frames, drawn from the
          // precomputed performance so it is deterministic.
          if (performance.deductions.length > 0 && idx % 4 === 3) {
            const dIdx =
              Math.floor(idx / 4) % performance.deductions.length;
            send({
              type: "candidate_deduction",
              seq: seq++,
              deduction: performance.deductions[dIdx],
            });
          }
        });
      });

      // 3) leaderboard update (after all frames)
      const tailStart = cursor + perFrameMs;
      at(tailStart, () => {
        send({
          type: "leaderboard_update",
          seq: seq++,
          rows: DEMO_ROWS,
        });
      });

      // 4) round complete, then close
      at(tailStart + perFrameMs, () => {
        send({
          type: "round_state",
          seq: seq++,
          roundId: "demo-round",
          status: "complete",
          asana: template.name,
        });
        finish();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
