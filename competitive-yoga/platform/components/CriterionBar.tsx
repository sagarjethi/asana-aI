"use client";

/**
 * CriterionBar — a labeled horizontal progress bar for one CriterionScore.
 * Shows points awarded out of max, source (machine/judge) and pending state.
 */
import * as React from "react";
import type { CriterionScore } from "@/lib/contracts";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface CriterionBarProps {
  score: CriterionScore;
  /** human-friendly label override (criterion key is used otherwise) */
  label?: string;
  tone?: "paper" | "console";
  className?: string;
}

function barColor(pct: number): string {
  if (pct >= 0.85) return "bg-emerald-500";
  if (pct >= 0.6) return "bg-sun-500";
  return "bg-sun-600";
}

export function CriterionBar({ score, label, tone = "paper", className }: CriterionBarProps) {
  const dark = tone === "console";
  const max = score.maxPoints > 0 ? score.maxPoints : 1;
  const pct = Math.max(0, Math.min(1, score.value / max));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", dark ? "text-paper" : "text-ink")}>
            {label ?? score.criterion}
          </span>
          <Badge tone={score.source === "judge" ? "sun" : "neutral"}>
            {score.source}
          </Badge>
          {score.pending ? <Badge tone="warning">pending</Badge> : null}
        </div>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            dark ? "text-stone-300" : "text-stone-600",
          )}
        >
          {score.value.toFixed(1)}
          <span className={dark ? "text-stone-500" : "text-stone-400"}> / {score.maxPoints}</span>
        </span>
      </div>
      <div
        className={cn(
          "h-2.5 w-full overflow-hidden rounded-full",
          dark ? "bg-console-line" : "bg-sun-100",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barColor(pct))}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      {score.confidence < 1 ? (
        <div className={cn("text-[11px]", dark ? "text-stone-500" : "text-stone-400")}>
          confidence {(score.confidence * 100).toFixed(0)}%
        </div>
      ) : null}
    </div>
  );
}

export default CriterionBar;
