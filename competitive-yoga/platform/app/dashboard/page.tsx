"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Card, Badge } from "@/components/ui";
import type { Role } from "@/lib/contracts";

type QuickLink = { href: string; title: string; desc: string };

const ROLE_GUIDE: Record<
  Role,
  { headline: string; next: string; links: QuickLink[] }
> = {
  athlete: {
    headline: "Compete and improve",
    next: "Browse open events to enroll, or head to Practice to score a pose with live alignment feedback.",
    links: [
      { href: "/athlete/events", title: "Events", desc: "Find and enroll in open competitions." },
      { href: "/athlete/practice", title: "Practice", desc: "Real-time alignment scoring." },
      { href: "/athlete/results", title: "My results", desc: "Your published scores and rank." },
    ],
  },
  coach: {
    headline: "Guide your athletes",
    next: "Open your athletes view to track score trends and spot weak criteria before the next round.",
    links: [
      { href: "/coach", title: "My athletes", desc: "Score trends and weakness heatmap." },
      { href: "/leaderboard", title: "Leaderboard", desc: "Live standings." },
    ],
  },
  referee: {
    headline: "Officiate with confidence",
    next: "Open My rounds to enter the console for any round assigned to you. AI suggests, you confirm.",
    links: [
      { href: "/judge", title: "My rounds", desc: "Rounds assigned to you." },
    ],
  },
  head_judge: {
    headline: "Officiate and oversee",
    next: "Review your assigned rounds in the console, then watch the live leaderboard for final standings.",
    links: [
      { href: "/judge", title: "My rounds", desc: "Rounds assigned to you." },
      { href: "/leaderboard", title: "Leaderboard", desc: "Live standings." },
    ],
  },
  director: {
    headline: "Run the competition",
    next: "Watch the live leaderboard and coordinate with organizers and judges.",
    links: [
      { href: "/leaderboard", title: "Leaderboard", desc: "Live standings." },
    ],
  },
  admin: {
    headline: "Organize the competition",
    next: "Create an event, add rounds with an asana template, then start rounds and publish results.",
    links: [
      { href: "/organizer", title: "Events", desc: "Manage all your events." },
      { href: "/organizer/new", title: "New event", desc: "Create a competition." },
      { href: "/leaderboard", title: "Leaderboard", desc: "Live standings." },
    ],
  },
};

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-sun-900/60">Loading…</p>
      </Shell>
    );
  }

  const guide = ROLE_GUIDE[user.role];

  return (
    <Shell tone="warm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun-600">
            {guide.headline}
          </p>
          <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-ink">
            Welcome, {user.name.split(" ")[0]}
          </h1>
        </div>
        <Badge tone="sun">{user.role.replace("_", " ")}</Badge>
      </header>

      <Card className="mt-6 rounded-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sun-700">
          What to do next
        </h2>
        <p className="mt-2 text-ink/80">{guide.next}</p>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guide.links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full rounded-2xl transition hover:border-sun-400 hover:shadow-md">
              <h3 className="font-display text-xl font-bold text-ink">{l.title}</h3>
              <p className="mt-1 text-sm text-sun-900/70">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
