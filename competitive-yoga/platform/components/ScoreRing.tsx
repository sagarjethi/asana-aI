"use client";

/**
 * ScoreRing — an animated circular gauge for a single headline value
 * (e.g. total score or alignment). Pure SVG, no deps.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScoreRingProps {
  /** current value */
  value: number;
  /** maximum value the ring fills to */
  max: number;
  /** big label under the number, e.g. "Alignment" */
  label?: string;
  /** override the unit shown after the value */
  unit?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** dark console styling */
  tone?: "paper" | "console";
}

function ringColor(pct: number): string {
  if (pct >= 0.85) return "#16a34a"; // emerald-600
  if (pct >= 0.6) return "#f59e0b"; // sun-500
  return "#ea580c"; // sun-600 (warm warning)
}

export function ScoreRing({
  value,
  max,
  label,
  unit,
  size = 180,
  strokeWidth = 14,
  className,
  tone = "paper",
}: ScoreRingProps) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(1, value / safeMax));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;
  const color = ringColor(pct);
  const dark = tone === "console";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dark ? "#2c2722" : "#fed7aa"}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            "font-display text-4xl font-black tabular-nums",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {value.toFixed(1)}
          {unit ? <span className="ml-0.5 text-lg font-semibold">{unit}</span> : null}
        </div>
        {label ? (
          <div
            className={cn(
              "mt-1 text-xs font-medium uppercase tracking-wide",
              dark ? "text-stone-400" : "text-stone-500",
            )}
          >
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ScoreRing;
