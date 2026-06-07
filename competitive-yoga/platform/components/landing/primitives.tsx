"use client";

/**
 * Small shared building blocks for the marketing landing page:
 * - <CountUp>  animated number that runs once when scrolled into view
 * - <SectionLabel> the uppercase kicker above section headings
 * - <Eyebrow>  small pill label
 * All respect prefers-reduced-motion.
 */
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import * as React from "react";

/* ---------------------------------------------------------------- CountUp -- */
export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [val, setVal] = React.useState(reduce ? to : from);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, reduce, from, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------ SectionLabel -- */
export function SectionLabel({
  children,
  tone = "sun",
}: {
  children: React.ReactNode;
  tone?: "sun" | "paper";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] " +
        (tone === "paper" ? "text-sun-200" : "text-sun-600")
      }
    >
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Eyebrow -- */
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border border-sun-300/70 bg-white/70 px-3 py-1 text-xs font-semibold text-sun-700 backdrop-blur " +
        className
      }
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Shimmer ---- */
/** A slowly drifting warm gradient sheen — purely decorative. */
export function GradientSheen({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 opacity-50 " + className
        }
        style={{
          background:
            "radial-gradient(60% 50% at 70% 0%, rgba(245,158,11,0.18), transparent 70%)",
        }}
      />
    );
  }
  return (
    <motion.div
      aria-hidden
      className={"pointer-events-none absolute inset-0 " + className}
      style={{
        background:
          "radial-gradient(50% 50% at 50% 0%, rgba(245,158,11,0.22), transparent 70%)",
      }}
      animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
