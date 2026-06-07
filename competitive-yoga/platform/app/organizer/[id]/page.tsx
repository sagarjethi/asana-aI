"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession, authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Stat } from "@/components/ui";
import { EventStatusBadge } from "@/components/organizer/StatusBadge";
import { ManageRound } from "@/components/organizer/ManageRound";
import {
  FORMATS,
  CATEGORIES,
  type AsanaTemplate,
  type CompetitionEvent,
  type Enrollment,
  type Format,
  type Category,
  type Round,
} from "@/lib/contracts";

interface EventDetail {
  event: CompetitionEvent;
  rounds: Round[];
  enrollments: Enrollment[];
}

export default function ManageEventPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [detail, setDetail] = React.useState<EventDetail | null>(null);
  const [templates, setTemplates] = React.useState<AsanaTemplate[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Add-round form state
  const [asanaTemplateId, setAsanaTemplateId] = React.useState("");
  const [format, setFormat] = React.useState<Format>("solo");
  const [category, setCategory] = React.useState<Category>("non_musical");
  const [roundName, setRoundName] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const load = React.useCallback(() => {
    if (!eventId) return;
    authFetch(`/api/events/${eventId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: EventDetail) => setDetail(data))
      .catch(() => setError("Could not load this event."));
  }, [eventId]);

  React.useEffect(() => {
    if (!user) return;
    load();
    authFetch("/api/templates")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: AsanaTemplate[]) => {
        setTemplates(data);
        if (data[0]) setAsanaTemplateId(data[0].id);
      })
      .catch(() => {/* templates optional for view */});
  }, [user, load]);

  const addRound = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!asanaTemplateId) return;
      setAdding(true);
      setError(null);
      try {
        const res = await authFetch(`/api/events/${eventId}/rounds`, {
          method: "POST",
          body: JSON.stringify({
            eventId,
            name: roundName || undefined,
            format,
            category,
            asanaTemplateId,
          }),
        });
        if (!res.ok) throw new Error("Could not add round.");
        setRoundName("");
        load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Add round failed.");
      } finally {
        setAdding(false);
      }
    },
    [eventId, roundName, format, category, asanaTemplateId, load],
  );

  if (loading || !user) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-sun-900/60">Loading…</p>
      </Shell>
    );
  }

  const templateName = (id: string) => templates.find((t) => t.id === id)?.name ?? id;

  return (
    <Shell tone="warm">
      <Link href="/organizer" className="text-sm font-semibold text-sun-700 hover:underline">
        ← Back to events
      </Link>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {!detail ? (
        <p className="mt-6 text-sm text-sun-900/60">Loading event…</p>
      ) : (
        <>
          <header className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl font-black tracking-tight text-ink">
                {detail.event.name}
              </h1>
              {detail.event.venue ? (
                <p className="text-sm text-sun-900/60">{detail.event.venue}</p>
              ) : null}
            </div>
            <EventStatusBadge status={detail.event.status} />
          </header>

          {detail.event.description ? (
            <p className="mt-2 max-w-2xl text-ink/80">{detail.event.description}</p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Rounds" value={detail.rounds.length} />
            <Stat label="Athletes" value={detail.enrollments.length} />
            <Stat
              label="Live rounds"
              value={detail.rounds.filter((r) => r.status === "live").length}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Rounds (left, wider) */}
            <div className="space-y-4 lg:col-span-2">
              <h2 className="font-display text-2xl font-bold text-ink">Rounds</h2>
              {detail.rounds.length === 0 ? (
                <Card className="rounded-2xl">
                  <p className="text-ink/80">No rounds yet. Add one to start.</p>
                </Card>
              ) : (
                detail.rounds.map((r) => (
                  <ManageRound
                    key={r.id}
                    round={r}
                    asanaName={templateName(r.asanaTemplateId)}
                    eventId={eventId}
                    onChanged={load}
                  />
                ))
              )}
            </div>

            {/* Side: add round + enrolled athletes */}
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <h3 className="font-display text-lg font-bold text-ink">Add round</h3>
                <form className="mt-3 space-y-3" onSubmit={addRound}>
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Asana template</span>
                    <select
                      value={asanaTemplateId}
                      onChange={(e) => setAsanaTemplateId(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                    >
                      {templates.length === 0 ? (
                        <option value="">No templates</option>
                      ) : (
                        templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Format</span>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as Format)}
                      className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                    >
                      {FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Category</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Round name</span>
                    <input
                      type="text"
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                      placeholder="Optional"
                    />
                  </label>
                  <Button type="submit" className="w-full" disabled={adding || !asanaTemplateId}>
                    {adding ? "Adding…" : "Add round"}
                  </Button>
                </form>
              </Card>

              <Card className="rounded-2xl">
                <h3 className="font-display text-lg font-bold text-ink">
                  Enrolled athletes
                </h3>
                {detail.enrollments.length === 0 ? (
                  <p className="mt-2 text-sm text-sun-900/60">No athletes enrolled yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5">
                    {detail.enrollments.map((en) => (
                      <li
                        key={en.id}
                        className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-1.5 text-sm"
                      >
                        <span className="text-ink">{en.athleteName}</span>
                        <span className="text-xs text-sun-900/50">{en.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
