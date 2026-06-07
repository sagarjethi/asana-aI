/**
 * GET /api/events/[id] — event detail with its rounds and enrollments.
 * 404 if the event does not exist.
 */
import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = store.getEvent(params.id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    event,
    rounds: store.listRounds(params.id),
    enrollments: store.listEnrollments(params.id),
  });
}
