"use client";

/**
 * Athlete — Compete in a LIVE round.
 * Reads ?roundId & ?templateId, then "Perform now" POSTs deterministic sample
 * frames to /api/perform. On success it shows the recorded score and a link to
 * results. Handles 409 (round not live).
 */
import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Performance, PerformanceScore } from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Badge } from "@/components/ui";
import { ScoreDetail } from "@/components/athlete/ScoreDetail";
import { useGate } from "@/components/athlete/useGate";
import { sampleFrames } from "@/lib/sample/keypoints";

interface PerformResponse {
  performance: Performance;
  score: PerformanceScore;
}

function CompeteInner() {
  const { ready } = useGate();
  const params = useSearchParams();
  const roundId = params.get("roundId") ?? "";
  const templateId = params.get("templateId") ?? "natarajasana";

  const [result, setResult] = React.useState<PerformResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notLive, setNotLive] = React.useState(false);

  const perform = async () => {
    if (!roundId) {
      setError("Missing round. Open this from a live event.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotLive(false);
    try {
      const res = await authFetch("/api/perform", {
        method: "POST",
        body: JSON.stringify({ roundId, frames: sampleFrames(templateId) }),
      });
      if (res.status === 409) {
        setNotLive(true);
        return;
      }
      if (!res.ok) throw new Error(`perform failed (${res.status})`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <p className="text-sm text-stone-400">Loading…</p>;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">
            Live round · Compete
          </p>
          <h1 className="mt-1 font-display text-4xl font-black text-ink">{templateId}</h1>
          <p className="mt-1 text-sm text-sun-900/70">
            One take is recorded and scored for the official standings.
          </p>
        </div>
        <Button size="lg" disabled={loading || !!result} onClick={perform}>
          {loading ? "Recording…" : result ? "Recorded" : "Perform now"}
        </Button>
      </header>

      {notLive ? (
        <Card className="mt-6 rounded-2xl border-amber-200 bg-amber-50">
          <p className="text-sm font-medium text-amber-800">This round is not live.</p>
          <p className="mt-1 text-sm text-amber-700">
            You can only perform while the referee has the round open. Check back when it goes live.
          </p>
          <Link href="/athlete" className="mt-3 inline-block text-sm font-medium text-sun-700 hover:underline">
            ← Back to dashboard
          </Link>
        </Card>
      ) : null}

      {error ? (
        <Card className="mt-6 rounded-2xl border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/70">
            <div>
              <p className="text-sm font-medium text-emerald-800">Performance recorded.</p>
              <p className="text-xs text-emerald-700">
                Status:{" "}
                <Badge tone="success">{result.performance.status ?? "scored"}</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/athlete/results">
                <Button variant="secondary">My results</Button>
              </Link>
              <Link href={`/leaderboard?roundId=${roundId}`}>
                <Button>Round results</Button>
              </Link>
            </div>
          </Card>
          <ScoreDetail score={result.score} />
        </div>
      ) : !notLive ? (
        <Card className="mt-6 rounded-2xl">
          <p className="text-sm text-stone-400">
            When you’re ready, tap “Perform now” to record your take.
          </p>
        </Card>
      ) : null}
    </>
  );
}

export default function CompetePage() {
  return (
    <Shell tone="warm">
      <Suspense fallback={<p className="text-sm text-stone-400">Loading…</p>}>
        <CompeteInner />
      </Suspense>
    </Shell>
  );
}
