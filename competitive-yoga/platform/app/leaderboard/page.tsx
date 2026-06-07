"use client";

/**
 * Leaderboard — live standings for the current round.
 * Fetches /api/leaderboard and refreshes on a short interval. Sun theme.
 */
import * as React from "react";
import type { LeaderboardRow } from "@/lib/contracts";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const REFRESH_MS = 4000;

function rankBadge(rank: number): { tone: "sun" | "neutral"; ring: string } {
  if (rank === 1) return { tone: "sun", ring: "ring-2 ring-sun-400" };
  if (rank <= 3) return { tone: "sun", ring: "ring-1 ring-sun-300" };
  return { tone: "neutral", ring: "" };
}

export default function LeaderboardPage() {
  const [rows, setRows] = React.useState<LeaderboardRow[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/leaderboard")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data: LeaderboardRow[]) => {
          if (cancelled) return;
          setRows(Array.isArray(data) ? [...data].sort((a, b) => a.rank - b.rank) : []);
          setUpdatedAt(new Date());
          setError(false);
        })
        .catch(() => !cancelled && setError(true));
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="bg-sunrise min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">
              Live standings
            </p>
            <h1 className="mt-1 font-display text-4xl font-black text-ink">Leaderboard</h1>
          </div>
          <div className="text-right text-xs text-sun-900/60">
            {error ? (
              <Badge tone="danger">connection lost</Badge>
            ) : updatedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                updated {updatedAt.toLocaleTimeString()}
              </span>
            ) : (
              "loading…"
            )}
          </div>
        </header>

        <Card className="mt-6 rounded-2xl p-0">
          <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-sun-200/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <span>Rank</span>
            <span>Athlete</span>
            <span className="text-right">Total</span>
          </div>
          {rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-stone-400">
              {error ? "Could not load standings." : "No scores yet."}
            </div>
          ) : (
            <ul>
              {rows.map((row) => {
                const rb = rankBadge(row.rank);
                return (
                  <li
                    key={row.athleteId}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors",
                      "border-b border-sun-100 last:border-b-0 hover:bg-sun-50/60",
                      row.rank === 1 && "bg-sun-50/80",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-full bg-sun-100 text-sm font-bold tabular-nums text-sun-800",
                        rb.ring,
                      )}
                    >
                      {row.rank}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{row.athleteName}</span>
                      {row.country ? (
                        <span className="text-xs text-stone-500">{row.country}</span>
                      ) : null}
                    </span>
                    <span className="text-right font-display text-xl font-black tabular-nums text-ink">
                      {row.total.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <p className="mt-4 text-xs text-sun-900/50">
          Auto-refreshing every {REFRESH_MS / 1000}s.
        </p>
      </div>
    </main>
  );
}
