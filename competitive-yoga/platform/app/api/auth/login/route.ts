/**
 * POST /api/auth/login — demo credential login.
 * Body: { email, password } (zLogin). Matches DEMO_USERS; returns a JWT + role.
 */
import { NextResponse } from "next/server";
import { zLogin } from "@/lib/contracts";
import { findDemoUser, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zLogin.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const user = findDemoUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ sub: user.email, role: user.role });
  return NextResponse.json({ token, role: user.role });
}
