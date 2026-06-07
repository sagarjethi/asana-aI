/**
 * GET /api/auth/me — return the current authenticated user.
 * Any authenticated role. 401 if no/invalid token or user is missing.
 */
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const claims = requireRole(req, []);
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = store.getUser(claims.sub);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: store.publicUser(user) });
}
