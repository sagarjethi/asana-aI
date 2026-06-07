/**
 * POST /api/events/[id]/rounds — create a round under an event (admin only).
 * Body: zCreateRound (eventId is taken from the path, overriding the body).
 * judgeIds default to every head_judge user id when none are supplied.
 */
import { NextResponse } from "next/server";
import { zCreateRound } from "@/lib/contracts";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const claims = requireRole(req, ["admin"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zCreateRound.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const judgeIds = store.listUsers("head_judge").map((u) => u.id);

  const round = store.createRound({
    ...parsed.data,
    eventId: params.id,
    judgeIds,
  });
  return NextResponse.json(round);
}
