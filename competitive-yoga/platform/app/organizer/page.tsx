"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card } from "@/components/ui";
import { EventStatusBadge } from "@/components/organizer/StatusBadge";
import type { CompetitionEvent } from "@/lib/contracts";

export default function OrganizerPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [events, setEvents] = React.useState<CompetitionEvent[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    authFetch("/api/events")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: CompetitionEvent[]) => setEvents(data))
      .catch(() => setError("Could not load events."));
  }, [user]);

  if (loading || !user) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-sun-900/60">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell tone="warm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun-600">Organizer</p>
          <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-ink">Events</h1>
        </div>
        <Link href="/organizer/new">
          <Button size="md">New event</Button>
        </Link>
      </header>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 space-y-3">
        {events === null && !error ? (
          <p className="text-sm text-sun-900/60">Loading events…</p>
        ) : events && events.length === 0 ? (
          <Card className="rounded-2xl">
            <p className="text-ink/80">No events yet.</p>
            <Link href="/organizer/new" className="mt-2 inline-block text-sm font-semibold text-sun-700 hover:underline">
              Create your first event →
            </Link>
          </Card>
        ) : (
          events?.map((ev) => (
            <Link key={ev.id} href={`/organizer/${ev.id}`}>
              <Card className="flex items-center justify-between rounded-2xl transition hover:border-sun-400 hover:shadow-md">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">{ev.name}</h2>
                  {ev.venue ? <p className="text-sm text-sun-900/60">{ev.venue}</p> : null}
                </div>
                <EventStatusBadge status={ev.status} />
              </Card>
            </Link>
          ))
        )}
      </div>
    </Shell>
  );
}
