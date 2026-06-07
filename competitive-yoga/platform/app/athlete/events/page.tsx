"use client";

/**
 * Athlete — browse all events.
 * Lists every event with status + enrolled count and an Enroll button. Live
 * rounds the athlete is enrolled in expose a Compete link.
 */
import * as React from "react";
import Link from "next/link";
import type { CompetitionEvent, Round, Enrollment } from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Badge } from "@/components/ui";
import { useGate } from "@/components/athlete/useGate";

interface EventDetail {
  event: CompetitionEvent;
  rounds: Round[];
  enrollments: Enrollment[];
}

function statusTone(s?: string): "success" | "warning" | "sun" | "neutral" {
  if (s === "live") return "success";
  if (s === "open") return "sun";
  if (s === "complete") return "neutral";
  return "warning";
}

export default function AthleteEventsPage() {
  const { user, ready } = useGate();
  const [events, setEvents] = React.useState<CompetitionEvent[]>([]);
  const [details, setDetails] = React.useState<Record<string, EventDetail>>({});
  const [enrolling, setEnrolling] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(async (id: string) => {
    const res = await authFetch(`/api/events/${id}`);
    if (!res.ok) return;
    const d: EventDetail = await res.json();
    setDetails((prev) => ({ ...prev, [id]: d }));
  }, []);

  const load = React.useCallback(async () => {
    try {
      const res = await authFetch("/api/events");
      const all: CompetitionEvent[] = res.ok ? await res.json() : [];
      setEvents(all);
      await Promise.all(all.map((e) => loadDetail(e.id)));
    } catch {
      setError("Could not load events.");
    }
  }, [loadDetail]);

  React.useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  const myId = user?.id;
  const isEnrolled = (id: string) =>
    !!details[id]?.enrollments.some(
      (en) => en.athleteId === myId && en.status === "enrolled",
    );

  const enroll = async (id: string) => {
    setEnrolling(id);
    setError(null);
    try {
      const res = await authFetch(`/api/events/${id}/enroll`, { method: "POST", body: "{}" });
      if (!res.ok) throw new Error();
      await loadDetail(id);
    } catch {
      setError("Enrollment failed.");
    } finally {
      setEnrolling(null);
    }
  };

  if (!ready) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-stone-400">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell tone="warm">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Athlete</p>
        <h1 className="mt-1 font-display text-4xl font-black text-ink">Events</h1>
        <p className="mt-1 text-sm text-sun-900/70">Find a competition and enroll.</p>
      </header>

      {error ? (
        <Card className="mt-4 rounded-2xl border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {events.length === 0 ? (
        <Card className="mt-6 rounded-2xl">
          <p className="text-sm text-stone-400">No events yet.</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {events.map((e) => {
            const d = details[e.id];
            const enrolled = isEnrolled(e.id);
            const open = e.status === "open" || e.status === "live";
            const liveRounds = (d?.rounds ?? []).filter((r) => r.status === "live");
            const count = d?.enrollments.filter((x) => x.status === "enrolled").length ?? 0;
            return (
              <Card key={e.id} className="rounded-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-bold text-ink">{e.name}</h3>
                    {e.venue ? <p className="text-xs text-stone-500">{e.venue}</p> : null}
                  </div>
                  <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                </div>
                {e.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">{e.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-stone-500">
                  {d ? `${count} enrolled · ${d.rounds.length} rounds` : "Loading…"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {enrolled ? (
                    <Badge tone="success">Enrolled</Badge>
                  ) : open ? (
                    <Button size="sm" disabled={enrolling === e.id} onClick={() => enroll(e.id)}>
                      {enrolling === e.id ? "Enrolling…" : "Enroll"}
                    </Button>
                  ) : (
                    <Badge tone="neutral">Enrollment closed</Badge>
                  )}
                  {enrolled &&
                    liveRounds.map((r) => (
                      <Link
                        key={r.id}
                        href={`/athlete/compete?roundId=${r.id}&templateId=${r.asanaTemplateId}`}
                      >
                        <Button size="sm" variant="primary">
                          Compete · {r.name ?? r.asanaTemplateId}
                        </Button>
                      </Link>
                    ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
