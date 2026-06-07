/**
 * POST /api/auth/signup — create a real account in the store.
 * Body: zSignup. 409 if the email already exists.
 * Returns { token, user } where token.sub = store user id.
 */
import { NextResponse } from "next/server";
import { zSignup } from "@/lib/contracts";
import { signToken } from "@/lib/auth";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zSignup.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { email, password, name, role, country } = parsed.data;

  if (store.getUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = store.createUser({ email, password, name, role, country });
  const token = signToken({ sub: user.id, role: user.role });
  return NextResponse.json({ token, user: store.publicUser(user) });
}
