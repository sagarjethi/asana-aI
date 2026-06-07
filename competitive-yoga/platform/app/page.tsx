"use client";

import Link from "next/link";
import { useSession } from "@/lib/client/auth";

const surfaces = [
  { title: "Referee Console", desc: "AI suggests, the judge confirms — live deductions, confidence, replay." },
  { title: "Live Leaderboard", desc: "Real-time standings for the current round." },
  { title: "Athlete", desc: "Practice with real-time alignment scoring + progress." },
  { title: "Coach", desc: "Score trends, weakness heatmap, head-to-head." },
];

const DEMO_ACCOUNTS = [
  { email: "organizer@yoga.dev", role: "Organizer / admin" },
  { email: "judge@yoga.dev", role: "Referee" },
  { email: "coach@yoga.dev", role: "Coach" },
  { email: "saanvi@yoga.dev", role: "Athlete" },
];

export default function Home() {
  const { user, loading } = useSession();

  return (
    <main className="bg-sunrise min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun-600">
          Competitive Yoga · Officiating &amp; Broadcast
        </p>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-ink">
          ◐ Yoga Drishti
        </h1>
        <p className="mt-3 max-w-xl text-lg text-sun-900/70">
          The pilot platform. AI measures every pose; the human judge confirms. Every score is
          explainable, signed, and replayable.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-sun-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sun-700"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-sun-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sun-700"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-sun-300 bg-white/70 px-6 py-3 text-base font-semibold text-sun-800 transition hover:border-sun-400 hover:bg-white"
              >
                Log in
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {surfaces.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-sun-200 bg-white/70 p-6"
            >
              <h2 className="font-display text-2xl font-bold text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-sun-900/70">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Demo logins */}
        <div className="mt-12 rounded-2xl border border-sun-200 bg-white/60 p-6">
          <h3 className="font-display text-lg font-bold text-ink">Try the demo</h3>
          <p className="mt-1 text-sm text-sun-900/70">
            All seeded accounts share the password <code className="rounded bg-sun-100 px-1.5 py-0.5 font-mono text-sun-800">demo123</code>.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                <span className="font-mono text-ink">{a.email}</span>
                <span className="text-sun-900/60">{a.role}</span>
              </li>
            ))}
          </ul>
          <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-sun-700 hover:underline">
            Go to login →
          </Link>
        </div>

        <p className="mt-10 text-xs text-sun-900/50">
          Pilot scope: Solo format, monocular pose MVP, deterministic scoring engine. Multi-camera 3D
          &amp; broadcast hardware layers are simulated. See <code>README.md</code>.
        </p>
      </div>
    </main>
  );
}
