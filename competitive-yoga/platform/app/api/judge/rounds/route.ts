/**
 * GET /api/judge/rounds — rounds assigned to the calling judge (referee or
 * head_judge), each annotated with its event name when resolvable.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const claims = requireRole(req, ["referee", "head_judge"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rounds = store.listRoundsForJudge(claims.sub).map((r) => ({
    ...r,
    eventName: store.getEvent(r.eventId)?.name,
  }));

  return NextResponse.json(rounds);
}
