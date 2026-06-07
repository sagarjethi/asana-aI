"use client";

/**
 * Athlete — Practice.
 * POSTs sample pose frames to /api/score and renders an explainable result:
 * an alignment ScoreRing, a CriterionBar per criterion, and a "Show me why"
 * deductions list. The demo path requires no camera. Warm sunrise theme.
 */
import * as React from "react";
import type { AsanaTemplate, PerformanceScore } from "@/lib/contracts";
import { Button, Card, Badge, Stat } from "@/components/ui";
import { ScoreRing } from "@/components/ScoreRing";
import { CriterionBar } from "@/components/CriterionBar";
import { sampleFrames } from "@/lib/sample/keypoints";

export default function AthletePage() {
  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [templateName, setTemplateName] = React.useState<string>("");
  const [score, setScore] = React.useState<PerformanceScore | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showWhy, setShowWhy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const runScore = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asanaTemplateId: id, frames: sampleFrames(id) }),
      });
      if (!res.ok) throw new Error(`score failed (${res.status})`);
      const data: PerformanceScore = await res.json();
      setScore(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve a template, then auto-run once (demo path).
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: AsanaTemplate[]) => {
        const first = Array.isArray(data) ? data[0] : undefined;
        const id = first?.id ?? "natarajasana";
        if (cancelled) return;
        setTemplateId(id);
        setTemplateName(first?.name ?? id);
        void runScore(id);
      })
      .catch(() => {
        if (cancelled) return;
        setTemplateId("natarajasana");
        setTemplateName("natarajasana");
        void runScore("natarajasana");
      });
    return () => {
      cancelled = true;
    };
  }, [runScore]);

  const alignment = score?.criteria.find((c) => c.criterion === "alignment");
  const ringValue = alignment ? alignment.value : score?.total ?? 0;
  const ringMax = alignment ? alignment.maxPoints : score?.maxTotal ?? 30;
  const ringLabel = alignment ? "Alignment" : "Total";

  return (
    <main className="bg-sunrise min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Practice</p>
            <h1 className="mt-1 font-display text-4xl font-black text-ink">
              {templateName || "Loading…"}
            </h1>
            <p className="mt-1 text-sm text-sun-900/70">
              AI measures every pose. Run a practice take to see your explainable score.
            </p>
          </div>
          <Button
            size="lg"
            disabled={loading || !templateId}
            onClick={() => templateId && runScore(templateId)}
          >
            {loading ? "Scoring…" : score ? "Practice again" : "Start practice"}
          </Button>
        </header>

        {error ? (
          <Card className="mt-6 rounded-2xl border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Score ring */}
          <Card className="flex flex-col items-center justify-center rounded-2xl md:col-span-1">
            <ScoreRing value={ringValue} max={ringMax} label={ringLabel} />
            <div className="mt-4 flex items-center gap-2">
              <Badge tone="sun">
                Total {score ? score.total.toFixed(1) : "—"} / {score?.maxTotal ?? 30}
              </Badge>
              {score ? (
                <Badge
                  tone={
                    score.confidenceState === "ok"
                      ? "success"
                      : score.confidenceState === "reduced"
                        ? "warning"
                        : "danger"
                  }
                >
                  {score.confidenceState}
                </Badge>
              ) : null}
            </div>
          </Card>

          {/* Criteria */}
          <Card className="rounded-2xl md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Per-criterion
            </h2>
            <div className="mt-4 space-y-5">
              {score && score.criteria.length > 0 ? (
                score.criteria.map((c) => <CriterionBar key={c.criterion} score={c} />)
              ) : (
                <p className="text-sm text-stone-400">
                  {loading ? "Scoring your take…" : "No score yet."}
                </p>
              )}
            </div>
            {score?.stability ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="Sway RMS" value={score.stability.swayRms.toFixed(2)} />
                <Stat label="Micro-move" value={score.stability.microMovement.toFixed(2)} />
                <Stat
                  label="Stillness"
                  value={`${Math.round(score.stability.stabilityScore * 100)}%`}
                />
              </div>
            ) : null}
          </Card>
        </div>

        {/* Explainable deductions */}
        <Card className="mt-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Deductions
            </h2>
            <Button
              size="sm"
              variant="secondary"
              disabled={!score || score.deductions.length === 0}
              onClick={() => setShowWhy((v) => !v)}
            >
              {showWhy ? "Hide" : "Show me why"}
            </Button>
          </div>
          {showWhy && score ? (
            score.deductions.length === 0 ? (
              <p className="mt-4 text-sm text-emerald-700">
                Clean take — no deductions triggered.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {score.deductions.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-sun-200/70 bg-white/70 p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="sun">{d.criterion}</Badge>
                        {d.abstained ? <Badge tone="warning">deferred to judge</Badge> : null}
                      </div>
                      <p className="mt-1.5 text-sm text-ink">{d.reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-lg font-black tabular-nums text-sun-700">
                        −{d.magnitude.toFixed(1)}
                      </div>
                      <span className="text-[11px] text-stone-400 tabular-nums">
                        {Math.round(d.confidence * 100)}% conf.
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="mt-3 text-sm text-stone-400">
              Every point is traceable to a rule and a frame. Tap “Show me why”.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
