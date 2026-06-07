/**
 * POST /api/rounds/[id]/start — set a round live (admin or head_judge).
 * 404 if the round does not exist.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const claims = requireRole(req, ["admin", "head_judge"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const round = store.startRound(params.id);
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  return NextResponse.json(round);
}
