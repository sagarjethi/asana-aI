"use client";

/**
 * ScoreDetail — shared explainable score panel for the athlete journeys
 * (practice + compete + results). Renders a headline alignment ScoreRing, a
 * CriterionBar per criterion, optional stability stats, and a "Show me why"
 * deduction list. Pure presentation — give it a PerformanceScore.
 */
import * as React from "react";
import type { PerformanceScore } from "@/lib/contracts";
import { Card, Badge, Stat, Button } from "@/components/ui";
import { ScoreRing } from "@/components/ScoreRing";
import { CriterionBar } from "@/components/CriterionBar";

function confTone(s: PerformanceScore["confidenceState"]): "success" | "warning" | "danger" {
  return s === "ok" ? "success" : s === "reduced" ? "warning" : "danger";
}

export function ScoreDetail({ score }: { score: PerformanceScore }) {
  const [showWhy, setShowWhy] = React.useState(false);
  const alignment = score.criteria.find((c) => c.criterion === "alignment");
  const ringValue = alignment ? alignment.value : score.total;
  const ringMax = alignment ? alignment.maxPoints : score.maxTotal || 30;
  const ringLabel = alignment ? "Alignment" : "Total";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col items-center justify-center rounded-2xl md:col-span-1">
          <ScoreRing value={ringValue} max={ringMax} label={ringLabel} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="sun">
              Total {score.total.toFixed(1)} / {score.maxTotal}
            </Badge>
            <Badge tone={confTone(score.confidenceState)}>{score.confidenceState}</Badge>
          </div>
        </Card>

        <Card className="rounded-2xl md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Per-criterion
          </h2>
          <div className="mt-4 space-y-5">
            {score.criteria.length > 0 ? (
              score.criteria.map((c) => <CriterionBar key={c.criterion} score={c} />)
            ) : (
              <p className="text-sm text-stone-400">No criteria recorded.</p>
            )}
          </div>
          {score.stability ? (
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

      <Card className="rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Deductions
          </h2>
          <Button
            size="sm"
            variant="secondary"
            disabled={score.deductions.length === 0}
            onClick={() => setShowWhy((v) => !v)}
          >
            {showWhy ? "Hide" : "Show me why"}
          </Button>
        </div>
        {showWhy ? (
          score.deductions.length === 0 ? (
            <p className="mt-4 text-sm text-emerald-700">Clean take — no deductions triggered.</p>
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
                    <span className="text-[11px] tabular-nums text-stone-400">
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
  );
}

export default ScoreDetail;
