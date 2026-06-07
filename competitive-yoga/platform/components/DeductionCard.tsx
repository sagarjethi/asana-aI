"use client";

/**
 * DeductionCard — one candidate deduction in the referee feed.
 * "AI suggests · the judge confirms": the card surfaces the machine's reason
 * and confidence, then lets the human Approve or Override (with a point value).
 */
import * as React from "react";
import type { Deduction } from "@/lib/contracts";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface DeductionCardProps {
  deduction: Deduction;
  /** mark this candidate approved as-is */
  onApprove?: (d: Deduction) => void;
  /** override with a judge-entered magnitude (points) */
  onOverride?: (d: Deduction, value: number) => void;
  /** once acted on, the card shows a resolved state */
  status?: "pending" | "approved" | "overridden";
  className?: string;
}

function confidenceTone(c: number): "success" | "warning" | "danger" {
  if (c >= 0.8) return "success";
  if (c >= 0.6) return "warning";
  return "danger";
}

export function DeductionCard({
  deduction,
  onApprove,
  onOverride,
  status = "pending",
  className,
}: DeductionCardProps) {
  const [overriding, setOverriding] = React.useState(false);
  const [value, setValue] = React.useState<string>(String(deduction.magnitude));

  const resolved = status !== "pending";
  const pct = Math.round(deduction.confidence * 100);

  return (
    <div
      className={cn(
        "rounded-2xl border border-console-line bg-console-panel p-4 text-paper",
        resolved && "opacity-70",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{deduction.criterion}</Badge>
            <span className="font-mono text-[11px] text-stone-500">{deduction.ruleId}</span>
            {deduction.abstained ? <Badge tone="danger">abstained</Badge> : null}
          </div>
          <p className="mt-2 text-sm leading-snug text-stone-200">{deduction.reason}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-2xl font-black tabular-nums text-sun-400">
            −{deduction.magnitude.toFixed(1)}
          </div>
          <Badge tone={confidenceTone(deduction.confidence)} className="mt-1">
            {pct}%
          </Badge>
        </div>
      </div>

      {resolved ? (
        <div className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-400">
          {status === "approved" ? "Confirmed by judge" : "Overridden by judge"}
        </div>
      ) : overriding ? (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-stone-400">Override points</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-24 rounded-lg border border-console-line bg-console-bg px-2 text-sm text-paper outline-none focus:border-sun-500"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              const v = Number(value);
              if (!Number.isNaN(v)) onOverride?.(deduction, v);
            }}
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" className="text-stone-300 hover:bg-console-line" onClick={() => setOverriding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => onApprove?.(deduction)}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-stone-300 hover:bg-console-line"
            onClick={() => setOverriding(true)}
          >
            Override
          </Button>
        </div>
      )}
    </div>
  );
}

export default DeductionCard;
