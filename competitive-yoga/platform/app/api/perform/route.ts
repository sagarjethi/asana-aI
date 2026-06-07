/**
 * POST /api/perform — an athlete submits a performance into a LIVE round.
 * Body: zPerform { roundId, frames }.
 *   404 if round/template unknown, 409 if the round is not live.
 * Scores the frames against the round's template and persists the performance.
 * Returns { performance, score }.
 */
import { NextResponse } from "next/server";
import { zPerform, type PoseFrame } from "@/lib/contracts";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";
import { getTemplate } from "@/lib/sample/templates";
import { scorePerformance } from "@/lib/scoring";

export async function POST(req: Request) {
  const claims = requireRole(req, ["athlete"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zPerform.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const round = store.getRound(parsed.data.roundId);
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (round.status !== "live") {
    return NextResponse.json({ error: "Round is not live" }, { status: 409 });
  }

  const template = getTemplate(round.asanaTemplateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const athlete = store.getUser(claims.sub);
  if (!athlete) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const score = scorePerformance(template, parsed.data.frames as PoseFrame[]);
  const performance = store.submitScoredPerformance(
    round.id,
    store.publicUser(athlete),
    score,
  );

  return NextResponse.json({ performance, score });
}
