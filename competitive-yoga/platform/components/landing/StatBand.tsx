"use client";

/**
 * Thin trust band directly under the hero. Numbers count up on first view;
 * principle chips fade in. A subtle asana-name marquee runs beneath.
 */
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "./primitives";
import { Reveal } from "./Reveal";

const ASANAS = [
  "Vrksasana",
  "Natarajasana",
  "Trikonasana",
  "Bakasana",
  "Virabhadrasana",
  "Sirsasana",
  "Dhanurasana",
  "Padmasana",
  "Garudasana",
  "Ustrasana",
  "Hanumanasana",
  "Mayurasana",
];

const STATS = [
  { value: <><CountUp to={3} />–<CountUp to={8} suffix="°" /></>, label: "Measurement accuracy" },
  { value: <CountUp to={17} />, label: "Joints tracked, live" },
  { value: <CountUp to={100} suffix="%" />, label: "On-device · camera-only" },
  { value: <><CountUp to={5} suffix="°" /></>, label: "Noise floor before any deduction" },
];

const CHIPS = [
  "AI suggests · judge confirms",
  "Explainable",
  "Signed & replayable",
  "Calibrated confidence · abstains when unsure",
];

export function StatBand() {
  const reduce = useReducedMotion();
  return (
    <section
      aria-label="Key metrics and principles"
      className="relative border-y border-sun-200/70 bg-sunrise"
    >
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={i} index={i} className="text-center sm:text-left">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-4xl font-black tracking-tight text-sun-700 sm:text-5xl">
                {s.value}
              </dd>
              <p className="mt-1.5 text-sm font-medium text-ink/60">{s.label}</p>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.2} className="mt-9 flex flex-wrap items-center gap-2.5">
          {CHIPS.map((c) => (
            <span
              key={c}
              className="rounded-full border border-sun-300/70 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-sun-800"
            >
              {c}
            </span>
          ))}
        </Reveal>
      </div>

      {/* Asana marquee */}
      <div className="relative overflow-hidden border-t border-sun-200/60 py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper to-transparent"
        />
        {reduce ? (
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 px-6 text-sm font-medium uppercase tracking-[0.18em] text-sun-700/50">
            {ASANAS.slice(0, 8).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <motion.ul
            className="flex w-max gap-8 px-4 text-sm font-medium uppercase tracking-[0.18em] text-sun-700/45"
            aria-hidden
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...ASANAS, ...ASANAS].map((a, i) => (
              <li key={i} className="flex items-center gap-8 whitespace-nowrap">
                {a}
                <span className="text-sun-400" aria-hidden>◦</span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
