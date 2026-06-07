"use client";

/**
 * Athlete — My results / history.
 * GET /api/me/performances and list each with asana, total and status. Each row
 * expands to the full explainable score (per-criterion + deductions).
 */
import * as React from "react";
import Link from "next/link";
import type { Performance } from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Card, Badge, Button } from "@/components/ui";
import { ScoreDetail } from "@/components/athlete/ScoreDetail";
import { useGate } from "@/components/athlete/useGate";

function statusTone(s?: string): "success" | "warning" | "neutral" {
  if (s === "published") return "success";
  if (s === "scored") return "neutral";
  return "warning";
}

export default function ResultsPage() {
  const { ready } = useGate();
  const [perfs, setPerfs] = React.useState<Performance[]>([]);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    authFetch("/api/me/performances")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Performance[]) => setPerfs(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load your results."))
      .finally(() => setLoaded(true));
  }, [ready]);

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
        <h1 className="mt-1 font-display text-4xl font-black text-ink">My results</h1>
        <p className="mt-1 text-sm text-sun-900/70">
          Every performance, with its explainable breakdown.
        </p>
      </header>

      {error ? (
        <Card className="mt-4 rounded-2xl border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {loaded && perfs.length === 0 && !error ? (
        <Card className="mt-6 rounded-2xl">
          <p className="text-sm text-stone-400">
            No performances yet. Start with a{" "}
            <Link href="/athlete/practice" className="font-medium text-sun-700 hover:underline">
              practice run
            </Link>
            .
          </p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {perfs.map((p) => {
            const isOpen = !!open[p.id];
            return (
              <li key={p.id}>
                <Card className="rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-ink">
                        {p.score?.asanaTemplateId ?? "Performance"}
                      </h3>
                      {p.performedAt ? (
                        <p className="text-xs text-stone-500">
                          {new Date(p.performedAt).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusTone(p.status)}>{p.status ?? "pending"}</Badge>
                      <span className="font-display text-2xl font-black tabular-nums text-ink">
                        {p.score ? p.score.total.toFixed(1) : "—"}
                        <span className="text-sm font-semibold text-stone-400">
                          {" "}
                          / {p.score?.maxTotal ?? 30}
                        </span>
                      </span>
                      {p.score ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
                        >
                          {isOpen ? "Hide" : "Details"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {isOpen && p.score ? (
                    <div className="mt-4 border-t border-sun-100 pt-4">
                      <ScoreDetail score={p.score} />
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}
