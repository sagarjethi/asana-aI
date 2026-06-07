"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/client/auth";
import { Button, Card } from "@/components/ui";
import type { Session } from "@/lib/contracts";

const DEMO_ACCOUNTS = [
  { email: "organizer@yoga.dev", label: "Organizer" },
  { email: "judge@yoga.dev", label: "Judge" },
  { email: "coach@yoga.dev", label: "Coach" },
  { email: "saanvi@yoga.dev", label: "Athlete" },
];
const DEMO_PASSWORD = "demo123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const doLogin = React.useCallback(
    async (loginEmail: string, loginPassword: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Invalid email or password.");
        }
        const data = (await res.json()) as Session;
        setSession(data.token, data.user);
        router.push("/dashboard");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed.");
        setBusy(false);
      }
    },
    [router],
  );

  return (
    <main className="bg-sunrise flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-black tracking-tight text-ink">
          ◐ Yoga&nbsp;Drishti
        </Link>
        <Card className="mt-4 rounded-2xl">
          <h1 className="font-display text-2xl font-black text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-sun-900/60">Log in to your account.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              doLogin(email, password);
            }}
          >
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-sun-900/60">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-sun-700 hover:underline">
              Sign up
            </Link>
          </p>
        </Card>

        {/* Demo quick-login */}
        <Card className="mt-4 rounded-2xl">
          <h2 className="text-sm font-semibold text-ink">Demo accounts</h2>
          <p className="mt-0.5 text-xs text-sun-900/60">
            One-click login (password <code className="font-mono">demo123</code>).
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => doLogin(a.email, DEMO_PASSWORD)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
