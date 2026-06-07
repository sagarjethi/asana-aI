"use client";

import * as React from "react";
import Link from "next/link";
import { authFetch } from "@/lib/client/auth";
import { Button, Card } from "@/components/ui";
import { RoundStatusBadge } from "@/components/organizer/StatusBadge";
import type { ResultRow, Round } from "@/lib/contracts";

export function ManageRound({
  round,
  asanaName,
  eventId,
  onChanged,
}: {
  round: Round;
  asanaName: string;
  eventId: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = React.useState<null | "start" | "publish">(null);
  const [results, setResults] = React.useState<ResultRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    setBusy("start");
    setError(null);
    try {
      const res = await authFetch(`/api/rounds/${round.id}/start`, { method: "POST" });
      if (!res.ok) throw new Error("Could not start round.");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Start failed.");
    } finally {
      setBusy(null);
    }
  }, [round.id, onChanged]);

  const publish = React.useCallback(async () => {
    setBusy("publish");
    setError(null);
    try {
      const res = await authFetch(`/api/rounds/${round.id}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Could not publish results.");
      const rows = (await res.json()) as ResultRow[];
      setResults(rows);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setBusy(null);
    }
  }, [round.id, onChanged]);

  const consoleHref = `/referee?roundId=${encodeURIComponent(round.id)}&templateId=${encodeURIComponent(round.asanaTemplateId)}`;

  return (
    <Card className="rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            {round.name || asanaName}
          </h3>
          <p className="text-sm text-sun-900/60">
            {asanaName} · {round.format} · {round.category.replace("_", " ")}
          </p>
        </div>
        <RoundStatusBadge status={round.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {round.status === "scheduled" ? (
          <Button size="sm" onClick={start} disabled={busy !== null}>
            {busy === "start" ? "Starting…" : "Start"}
          </Button>
        ) : null}
        {round.status === "live" ? (
          <Button size="sm" variant="secondary" onClick={publish} disabled={busy !== null}>
            {busy === "publish" ? "Publishing…" : "Publish results"}
          </Button>
        ) : null}
        {round.status === "complete" ? (
          <Button size="sm" variant="ghost" onClick={publish} disabled={busy !== null}>
            {busy === "publish" ? "Loading…" : "View / republish results"}
          </Button>
        ) : null}
        <Link href={consoleHref}>
          <Button size="sm" variant="ghost">
            Judge console →
          </Button>
        </Link>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {results && results.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-sun-700">
            Published results
          </h4>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {results.map((row) => (
                <tr key={row.athleteId} className="border-t border-sun-100">
                  <td className="py-1.5 pr-2 tabular-nums text-sun-900/60">#{row.rank}</td>
                  <td className="py-1.5 text-ink">{row.athleteName}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums text-ink">
                    {row.total.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : results && results.length === 0 ? (
        <p className="mt-3 text-sm text-sun-900/60">No results to publish yet.</p>
      ) : null}
    </Card>
  );
}
