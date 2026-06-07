/**
 * POST /api/auth/login — log in against the store, falling back to demo users.
 * Body: { email, password } (zLogin).
 *
 * First tries store.verifyCredentials. If that fails, tries findDemoUser and
 * PROVISIONS the demo account into the store (so a real store id is issued and
 * the token's sub points at a persisted user). Otherwise 401.
 * Returns { token, user }.
 */
import { NextResponse } from "next/server";
import { zLogin } from "@/lib/contracts";
import { findDemoUser, signToken } from "@/lib/auth";
import { store } from "@/lib/store";

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

  let user = store.verifyCredentials(email, password);

  if (!user) {
    const demo = findDemoUser(email, password);
    if (!demo) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // Provision the demo account into the store so it has a real store id.
    user =
      store.getUserByEmail(demo.email) ??
      store.createUser({
        email: demo.email,
        password,
        role: demo.role,
        name: demo.email.split("@")[0],
      });
  }

  const token = signToken({ sub: user.id, role: user.role });
  return NextResponse.json({ token, user: store.publicUser(user) });
}
