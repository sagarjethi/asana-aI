/**
 * Yoga Drishti — authentication helpers (JWT, role gating, demo users).
 *
 * The pilot ships a fixed set of demo users (one per role) so reviewers can
 * exercise every console without provisioning a database. Real users live in
 * the `users` table; both paths produce the same JWT shape: { sub, role }.
 */
import jwt from "jsonwebtoken";
import type { Role } from "@/lib/contracts";

/** Token claims we sign & verify. */
export interface TokenClaims {
  sub: string; // user id (or demo email)
  role: Role;
}

const JWT_SECRET: string =
  process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me";

const TOKEN_TTL = "12h";

/** Sign a short-lived session token. */
export function signToken(p: { sub: string; role: Role }): string {
  return jwt.sign({ sub: p.sub, role: p.role }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

/** Verify a token; returns claims or null when invalid/expired. */
export function verifyToken(t: string): TokenClaims | null {
  try {
    const decoded = jwt.verify(t, JWT_SECRET);
    if (
      decoded &&
      typeof decoded === "object" &&
      typeof (decoded as Record<string, unknown>).sub === "string" &&
      typeof (decoded as Record<string, unknown>).role === "string"
    ) {
      const { sub, role } = decoded as { sub: string; role: Role };
      return { sub, role };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read the bearer token from an incoming Request's Authorization header. */
export function bearerFrom(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/**
 * Gate a route: returns the claims when the caller holds one of `roles`,
 * otherwise null (caller should respond 401/403). An empty `roles` array means
 * "any authenticated user".
 */
export function requireRole(
  req: Request,
  roles: Role[],
): TokenClaims | null {
  const token = bearerFrom(req);
  if (!token) return null;
  const claims = verifyToken(token);
  if (!claims) return null;
  if (roles.length > 0 && !roles.includes(claims.role)) return null;
  return claims;
}

/** Demo credentials — one account per officiating role. */
export const DEMO_USERS: { email: string; password: string; role: Role }[] = [
  { email: "athlete@yoga.dev", password: "athlete123", role: "athlete" },
  { email: "coach@yoga.dev", password: "coach123", role: "coach" },
  { email: "referee@yoga.dev", password: "referee123", role: "referee" },
  { email: "judge@yoga.dev", password: "judge123", role: "head_judge" },
  { email: "admin@yoga.dev", password: "admin123", role: "admin" },
];

/** Look up a demo user by credentials (constant-shape, no DB needed). */
export function findDemoUser(
  email: string,
  password: string,
): { email: string; role: Role } | null {
  const u = DEMO_USERS.find(
    (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password,
  );
  return u ? { email: u.email, role: u.role } : null;
}
