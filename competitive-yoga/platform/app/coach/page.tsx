"use client";

/**
 * Coach — analytics.
 * Score-trend over sessions (recharts LineChart), a weakness list, and a
 * head-to-head card. Warm sunrise theme. Sample data is plausible/static.
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
import { Card, Badge, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";

const TREND = [
  { session: "S1", total: 21.4, alignment: 7.1, stability: 6.8 },
  { session: "S2", total: 22.0, alignment: 7.4, stability: 6.9 },
  { session: "S3", total: 23.6, alignment: 7.9, stability: 7.2 },
  { session: "S4", total: 23.1, alignment: 7.6, stability: 7.0 },
  { session: "S5", total: 24.8, alignment: 8.3, stability: 7.5 },
  { session: "S6", total: 25.9, alignment: 8.6, stability: 7.9 },
  { session: "S7", total: 26.7, alignment: 8.9, stability: 8.1 },
  { session: "S8", total: 27.4, alignment: 9.1, stability: 8.3 },
];

const WEAKNESSES = [
  { label: "Balance in inversions", delta: -12, note: "Sirsasana entries lose alignment after 8s" },
  { label: "Standing-leg lock", delta: -7, note: "Knee under-extends in Natarajasana" },
  { label: "Shoulder symmetry", delta: -4, note: "Right shoulder lifts higher in Vrksasana" },
  { label: "Hold steadiness", delta: +3, note: "Improving — sway RMS down 18% MoM" },
];

const HEAD_TO_HEAD = {
  me: { name: "You", total: 27.4, alignment: 9.1, stability: 8.3, grace: 8.0 },
  rival: { name: "A. Sharma (rank 1)", total: 28.6, alignment: 9.4, stability: 8.7, grace: 8.5 },
};

function deltaTone(d: number): "success" | "danger" {
  return d >= 0 ? "success" : "danger";
}

export default function CoachPage() {
  const first = TREND[0].total;
  const last = TREND[TREND.length - 1].total;
  const growth = last - first;

  return (
    <main className="bg-sunrise min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Coach</p>
          <h1 className="mt-1 font-display text-4xl font-black text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-sun-900/70">
            Trends, weaknesses and head-to-head across the training block.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Latest total" value={last.toFixed(1)} hint="of 30" />
          <Stat label="Block growth" value={`+${growth.toFixed(1)}`} hint={`over ${TREND.length} sessions`} />
          <Stat label="Sessions" value={TREND.length} />
          <Stat label="Best criterion" value="Alignment" hint="9.1 / 10" />
        </div>

        {/* Trend chart */}
        <Card className="mt-4 rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Score trend
          </h2>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
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

          {/* Head-to-head */}
          <Card className="rounded-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Head-to-head
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-sun-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sun-700">
                  {HEAD_TO_HEAD.me.name}
                </p>
                <p className="mt-1 font-display text-3xl font-black text-ink">
                  {HEAD_TO_HEAD.me.total.toFixed(1)}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  {HEAD_TO_HEAD.rival.name}
                </p>
                <p className="mt-1 font-display text-3xl font-black text-ink">
                  {HEAD_TO_HEAD.rival.total.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(["alignment", "stability", "grace"] as const).map((k) => {
                const me = HEAD_TO_HEAD.me[k];
                const rival = HEAD_TO_HEAD.rival[k];
                const lead = me - rival;
                return (
                  <div key={k}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-ink">{k}</span>
                      <span className="tabular-nums text-stone-600">
                        {me.toFixed(1)} vs {rival.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-sun-100">
                      <div
                        className={cn("h-full", lead >= 0 ? "bg-emerald-500" : "bg-sun-600")}
                        style={{ width: `${(me / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-stone-500">
              Gap to rank 1:{" "}
              <span className="font-semibold text-sun-700">
                {(HEAD_TO_HEAD.rival.total - HEAD_TO_HEAD.me.total).toFixed(1)} pts
              </span>
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
