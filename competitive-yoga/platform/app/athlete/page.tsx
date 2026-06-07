"use client";

/**
 * Athlete — dashboard.
 * Greets the athlete, surfaces open/live events (with Enroll + Compete for live
 * rounds they're enrolled in), quick links to Practice and My Results, and a
 * list of recent performances. The athlete identity comes from the session —
 * the backend resolves it from the token, so no athleteId is passed.
 */
import * as React from "react";
import Link from "next/link";
import type {
  CompetitionEvent,
  Round,
  Enrollment,
  Performance,
} from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Badge, Stat } from "@/components/ui";
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

export default function AthleteDashboard() {
  const { user, ready } = useGate();
  const [events, setEvents] = React.useState<CompetitionEvent[]>([]);
  const [details, setDetails] = React.useState<Record<string, EventDetail>>({});
  const [perfs, setPerfs] = React.useState<Performance[]>([]);
  const [enrolling, setEnrolling] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadDetail = React.useCallback(async (id: string) => {
    const res = await authFetch(`/api/events/${id}`);
    if (!res.ok) return;
    const d: EventDetail = await res.json();
    setDetails((prev) => ({ ...prev, [id]: d }));
  }, []);

  const loadAll = React.useCallback(async () => {
    try {
      const [evRes, perfRes] = await Promise.all([
        authFetch("/api/events"),
        authFetch("/api/me/performances"),
      ]);
      const all: CompetitionEvent[] = evRes.ok ? await evRes.json() : [];
      const open = all.filter((e) => e.status === "open" || e.status === "live");
      setEvents(open);
      if (perfRes.ok) setPerfs(await perfRes.json());
      await Promise.all(open.map((e) => loadDetail(e.id)));
    } catch {
      setError("Could not load your dashboard.");
    }
  }, [loadDetail]);

  React.useEffect(() => {
    if (ready) void loadAll();
  }, [ready, loadAll]);

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
      setError("Enrollment failed. Please try again.");
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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Athlete</p>
          <h1 className="mt-1 font-display text-4xl font-black text-ink">
            Namaste, {user?.name?.split(" ")[0] ?? "athlete"}
          </h1>
          <p className="mt-1 text-sm text-sun-900/70">
            Practise, compete in live rounds, and track your explainable scores.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/athlete/practice">
            <Button variant="secondary">Practice</Button>
          </Link>
          <Link href="/athlete/results">
            <Button variant="ghost">My results</Button>
          </Link>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open events" value={events.length} />
        <Stat label="Enrolled" value={events.filter((e) => isEnrolled(e.id)).length} />
        <Stat label="Performances" value={perfs.length} />
        <Stat
          label="Best total"
          value={
            perfs.length
              ? Math.max(...perfs.map((p) => p.score?.total ?? 0)).toFixed(1)
              : "—"
          }
          hint="of 30"
        />
      </div>

      {error ? (
        <Card className="mt-4 rounded-2xl border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {/* Open / live events */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Open & live events
          </h2>
          <Link href="/athlete/events" className="text-sm font-medium text-sun-700 hover:underline">
            Browse all →
          </Link>
        </div>
        {events.length === 0 ? (
          <Card className="mt-3 rounded-2xl">
            <p className="text-sm text-stone-400">No open events right now.</p>
          </Card>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {events.map((e) => {
              const d = details[e.id];
              const enrolled = isEnrolled(e.id);
              const liveRounds = (d?.rounds ?? []).filter((r) => r.status === "live");
              return (
                <Card key={e.id} className="rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-bold text-ink">{e.name}</h3>
                      {e.venue ? <p className="text-xs text-stone-500">{e.venue}</p> : null}
                    </div>
                    <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    {d ? `${d.enrollments.filter((x) => x.status === "enrolled").length} enrolled · ${d.rounds.length} rounds` : "Loading…"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {enrolled ? (
                      <Badge tone="success">Enrolled</Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={enrolling === e.id}
                        onClick={() => enroll(e.id)}
                      >
                        {enrolling === e.id ? "Enrolling…" : "Enroll"}
                      </Button>
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
      </section>

      {/* Recent performances */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Recent performances
          </h2>
          <Link href="/athlete/results" className="text-sm font-medium text-sun-700 hover:underline">
            All results →
          </Link>
        </div>
        {perfs.length === 0 ? (
          <Card className="mt-3 rounded-2xl">
            <p className="text-sm text-stone-400">
              No performances yet. Try a{" "}
              <Link href="/athlete/practice" className="font-medium text-sun-700 hover:underline">
                practice run
              </Link>
              .
            </p>
          </Card>
        ) : (
          <Card className="mt-3 rounded-2xl p-0">
            <ul>
              {perfs.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-sun-100 px-5 py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {p.score?.asanaTemplateId ?? "Performance"}
                    </span>
                    {p.performedAt ? (
                      <span className="text-xs text-stone-500">
                        {new Date(p.performedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={p.status === "published" ? "success" : "neutral"}>
                      {p.status ?? "pending"}
                    </Badge>
                    <span className="font-display text-xl font-black tabular-nums text-ink">
                      {p.score ? p.score.total.toFixed(1) : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </Shell>
  );
}
