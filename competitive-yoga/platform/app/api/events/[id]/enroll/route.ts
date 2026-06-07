/**
 * POST /api/events/[id]/enroll — enroll the calling athlete into an event.
 * Athlete only. Returns the Enrollment.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const claims = requireRole(req, ["athlete"]);
  if (!claims) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const athlete = store.getUser(claims.sub);
  if (!athlete) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollment = store.enroll(params.id, store.publicUser(athlete));
  return NextResponse.json(enrollment);
}
