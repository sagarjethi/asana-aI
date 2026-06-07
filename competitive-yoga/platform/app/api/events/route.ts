/**
 * GET  /api/events — list all events (public).
 * POST /api/events — create an event (admin only). Body: zCreateEvent.
 *   organizerId is taken from the caller's token.
 */
import { NextResponse } from "next/server";
import { zCreateEvent } from "@/lib/contracts";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.listEvents());
}

export async function POST(req: Request) {
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

  const parsed = zCreateEvent.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const event = store.createEvent({ ...parsed.data, organizerId: claims.sub });
  return NextResponse.json(event);
}
