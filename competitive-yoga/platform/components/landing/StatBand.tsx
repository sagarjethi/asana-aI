"use client";

/**
 * Proof band — big tabular count-up numbers on hairline dividers, then a slow
 * marquee ribbon of asana names. Numbers are amber; everything else neutral.
 */
import * as React from "react";
import { Reveal, CountUp, MonoLabel } from "./ui";

type Stat = { value: React.ReactNode; label: string };

const STATS: Stat[] = [
  { value: <><CountUp to={3} />–<CountUp to={8} suffix="°" /></>, label: "Joint-angle accuracy" },
  { value: <CountUp to={17} />, label: "Joints tracked, live" },
  { value: <CountUp to={100} suffix="%" />, label: "On-device, camera-only" },
  { value: <CountUp to={5} suffix="°" />, label: "Measurement noise floor" },
];

const RIBBON = [
  "Vrksasana", "Natarajasana", "Bakasana", "Sirsasana", "Hanumanasana",
  "Trikonasana", "Adho Mukha", "Pincha Mayurasana", "Kapotasana", "Vasisthasana",
];

export function StatBand() {
  return (
    <section
      aria-label="By the numbers"
      className="relative z-10 border-y border-white/10 bg-[#0B0B11]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <MonoLabel accent>Measured, not guessed</MonoLabel>
        </Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="bg-[#0B0B11] p-7 sm:p-9">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-5xl font-bold leading-none tracking-tight text-amber-500 sm:text-6xl">
                {s.value}
              </dd>
              <p className="mt-3 text-sm text-zinc-400">{s.label}</p>
            </Reveal>
          ))}
        </dl>
      </div>

      {/* Marquee ribbon */}
      <div
        aria-hidden
        className="relative flex overflow-hidden border-t border-white/10 py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="landing-marquee flex shrink-0 items-center gap-12 pr-12">
            {[...RIBBON, ...RIBBON].map((name, i) => (
              <span
                key={`${dup}-${i}`}
                className="whitespace-nowrap font-display text-xs font-medium uppercase tracking-[0.3em] text-zinc-600"
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
