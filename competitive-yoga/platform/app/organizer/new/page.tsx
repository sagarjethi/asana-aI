"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card } from "@/components/ui";
import type { CompetitionEvent } from "@/lib/contracts";

export default function NewEventPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        const res = await authFetch("/api/events", {
          method: "POST",
          body: JSON.stringify({
            name,
            venue: venue || undefined,
            description: description || undefined,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Could not create the event.");
        }
        const ev = (await res.json()) as CompetitionEvent;
        router.push(`/organizer/${ev.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create failed.");
        setBusy(false);
      }
    },
    [name, venue, description, router],
  );

  if (loading || !user) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-sun-900/60">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell tone="warm" width="narrow">
      <Link href="/organizer" className="text-sm font-semibold text-sun-700 hover:underline">
        ← Back to events
      </Link>
      <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-ink">New event</h1>

      <Card className="mt-6 rounded-2xl">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Event name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
              placeholder="Spring Open 2026"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Venue</span>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-sun-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
              placeholder="Optional"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create event"}
          </Button>
        </form>
      </Card>
    </Shell>
  );
}
