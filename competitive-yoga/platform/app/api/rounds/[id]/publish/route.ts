/**
 * POST /api/rounds/[id]/publish — publish a round's results (admin or head_judge).
 * Returns ResultRow[]. 404 if the round does not exist.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const claims = requireRole(req, ["admin", "head_judge"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!store.getRound(params.id)) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const results = store.publishRound(params.id);
  return NextResponse.json(results);
}
