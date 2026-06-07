/**
 * GET /api/me/performances — the calling athlete's performance history.
 * Athlete only.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const claims = requireRole(req, ["athlete"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(store.listPerformancesByAthlete(claims.sub));
}
