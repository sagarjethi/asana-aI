"use client";

/**
 * Coach — analytics.
 * Pulls the field from /api/leaderboard (real-ish ranked rows), shows an athlete
 * list with their latest totals, derives a score-trend (recharts LineChart),
 * and keeps the weakness list + head-to-head card. Warm sunrise theme.
 */
import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ResultRow } from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Card, Badge, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useGate } from "@/components/athlete/useGate";

const WEAKNESSES = [
  { label: "Balance in inversions", delta: -12, note: "Sirsasana entries lose alignment after 8s" },
  { label: "Standing-leg lock", delta: -7, note: "Knee under-extends in Natarajasana" },
  { label: "Shoulder symmetry", delta: -4, note: "Right shoulder lifts higher in Vrksasana" },
  { label: "Hold steadiness", delta: +3, note: "Improving — sway RMS down 18% MoM" },
];

function deltaTone(d: number): "success" | "danger" {
  return d >= 0 ? "success" : "danger";
}

/** Derive a plausible 8-session ramp ending at the athlete's latest total. */
function trendFrom(latest: number) {
  const start = Math.max(0, latest - 6);
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const total = start + (latest - start) * t;
    return {
      session: `S${i + 1}`,
      total: Number(total.toFixed(1)),
      alignment: Number((total * 0.33).toFixed(1)),
      stability: Number((total * 0.3).toFixed(1)),
    };
  });
}

export default function CoachPage() {
  const { ready } = useGate();
  const [rows, setRows] = React.useState<ResultRow[]>([]);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const load = () =>
      authFetch("/api/leaderboard")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data: ResultRow[]) => {
          if (cancelled) return;
          setRows(Array.isArray(data) ? [...data].sort((a, b) => a.rank - b.rank) : []);
          setError(false);
        })
        .catch(() => !cancelled && setError(true));
    load();
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [ready]);

  if (!ready) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-stone-400">Loading…</p>
      </Shell>
    );
  }

  const top = rows[0];
  const me = rows[1] ?? top;
  const trend = trendFrom(me?.total ?? 24);
  const last = trend[trend.length - 1].total;
  const growth = last - trend[0].total;

  return (
    <Shell tone="warm">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Coach</p>
        <h1 className="mt-1 font-display text-4xl font-black text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-sun-900/70">
          Field standings, trends, weaknesses and head-to-head.
        </p>
      </header>

      {error ? (
        <Card className="mt-4 rounded-2xl border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">
            Live field unavailable — showing derived analytics.
          </p>
        </Card>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Latest total" value={last.toFixed(1)} hint="of 30" />
        <Stat label="Block growth" value={`+${growth.toFixed(1)}`} hint={`over ${trend.length} sessions`} />
        <Stat label="Field size" value={rows.length} />
        <Stat
          label="Leader"
          value={top ? top.total.toFixed(1) : "—"}
          hint={top?.athleteName ?? "—"}
        />
      </div>

      {/* Trend chart */}
      <Card className="mt-4 rounded-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Score trend</h2>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
              <XAxis dataKey="session" stroke="#9a3412" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 30]} stroke="#9a3412" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #fed7aa",
                  background: "#fffaf3",
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="alignment" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stability" stroke="#fb923c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-full bg-sun-600" /> total
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-full bg-sun-500" /> alignment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-full bg-sun-400" /> stability
          </span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Athlete list */}
        <Card className="rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Athletes
          </h2>
          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-stone-400">No athletes in the field yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {rows.map((r) => (
                <li
                  key={r.athleteId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-sun-200/70 bg-white/70 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sun-100 text-xs font-bold tabular-nums text-sun-800">
                      {r.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{r.athleteName}</p>
                      {r.country ? <p className="text-xs text-stone-500">{r.country}</p> : null}
                    </div>
                  </div>
                  <span className="font-display text-lg font-black tabular-nums text-ink">
                    {r.total.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Weakness list */}
        <Card className="rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Weaknesses
          </h2>
          <ul className="mt-4 space-y-2">
            {WEAKNESSES.map((w) => (
              <li
                key={w.label}
                className="flex items-start justify-between gap-3 rounded-xl border border-sun-200/70 bg-white/70 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{w.label}</p>
                  <p className="text-xs text-stone-500">{w.note}</p>
                </div>
                <Badge tone={deltaTone(w.delta)}>
                  {w.delta > 0 ? "+" : ""}
                  {w.delta}%
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Head-to-head */}
      <Card className="mt-4 rounded-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Head-to-head
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-sun-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-sun-700">
              {me?.athleteName ?? "Your athlete"}
            </p>
            <p className="mt-1 font-display text-3xl font-black text-ink">
              {(me?.total ?? 0).toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {top?.athleteName ?? "Leader"} (rank 1)
            </p>
            <p className="mt-1 font-display text-3xl font-black text-ink">
              {(top?.total ?? 0).toFixed(1)}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {([
            ["alignment", 0.33],
            ["stability", 0.3],
            ["grace", 0.37],
          ] as const).map(([k, w]) => {
            const meV = (me?.total ?? 0) * w;
            const rivalV = (top?.total ?? 0) * w;
            const lead = meV - rivalV;
            return (
              <div key={k}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-ink">{k}</span>
                  <span className="tabular-nums text-stone-600">
                    {meV.toFixed(1)} vs {rivalV.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-sun-100">
                  <div
                    className={cn("h-full", lead >= 0 ? "bg-emerald-500" : "bg-sun-600")}
                    style={{ width: `${Math.min(100, (meV / 10) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Gap to leader:{" "}
          <span className="font-semibold text-sun-700">
            {Math.max(0, (top?.total ?? 0) - (me?.total ?? 0)).toFixed(1)} pts
          </span>
        </p>
      </Card>
    </Shell>
  );
}
