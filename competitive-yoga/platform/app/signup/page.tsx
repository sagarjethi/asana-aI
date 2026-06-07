"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/client/auth";
import { Button, Card } from "@/components/ui";
import { Shell } from "@/components/app/Shell";
import { ROLES, type Role, type Session } from "@/lib/contracts";

const ROLE_LABELS: Record<Role, string> = {
  athlete: "Athlete",
  coach: "Coach",
  referee: "Referee",
  head_judge: "Head judge",
  director: "Director",
  admin: "Organizer / admin",
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("athlete");
  const [country, setCountry] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            country: country || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Could not create your account.");
        }
        const data = (await res.json()) as Session;
        setSession(data.token, data.user);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed.");
        setBusy(false);
      }
    },
    [name, email, password, role, country, router],
  );

  return (
    <Shell tone="warm">
      <div className="mx-auto w-full max-w-md py-6">
        <Card className="rounded-2xl">
          <h1 className="font-display text-2xl font-black text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-sun-900/60">Join the pilot platform.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-ink">Full name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                placeholder="Saanvi Rao"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                placeholder="At least 6 characters"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-ink">Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Country</span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                  placeholder="Optional"
                />
              </label>
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-sun-900/60">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sun-700 hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </Shell>
  );
}
