/**
 * Yoga Drishti — shared UI primitives.
 *
 * Small, dependency-light, Tailwind-styled building blocks every surface
 * imports. Uses the "sun" palette + console tokens from tailwind.config.ts.
 * Only Button is interactive; nothing here needs "use client".
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
 * Button
 * ------------------------------------------------------------------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-sun-600 text-white hover:bg-sun-700 focus-visible:ring-sun-500 shadow-sm",
  secondary:
    "bg-sun-100 text-sun-800 hover:bg-sun-200 focus-visible:ring-sun-400",
  ghost:
    "bg-transparent text-sun-700 hover:bg-sun-100 focus-visible:ring-sun-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

/* ----------------------------------------------------------------------------
 * Card
 * ------------------------------------------------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** dark variant for the officiating console */
  tone?: "paper" | "console";
}

export function Card({ className, tone = "paper", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        tone === "console"
          ? "border-console-line bg-console-panel text-paper"
          : "border-sun-200/70 bg-white/80 text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Badge
 * ------------------------------------------------------------------------- */
type BadgeTone = "neutral" | "success" | "warning" | "danger" | "sun";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-stone-100 text-stone-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  sun: "bg-sun-100 text-sun-800",
};

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Stat — labeled metric tile
 * ------------------------------------------------------------------------- */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "paper" | "console";
}

export function Stat({
  label,
  value,
  hint,
  tone = "paper",
  className,
  ...props
}: StatProps) {
  const dark = tone === "console";
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        dark
          ? "border-console-line bg-console-panel"
          : "border-sun-200/70 bg-white/80",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          dark ? "text-stone-400" : "text-stone-500",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          dark ? "text-paper" : "text-ink",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className={cn("mt-0.5 text-xs", dark ? "text-stone-500" : "text-stone-400")}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
