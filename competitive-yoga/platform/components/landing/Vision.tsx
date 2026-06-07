"use client";

/** The vision / flywheel — practice app → data → talent → fans → back again. */
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./primitives";

const FLYWHEEL = [
  { n: "01", head: "Practice", body: "Millions train with the app and get scored, every day." },
  { n: "02", head: "Data", body: "Ratified angle bands and stability profiles sharpen the engine." },
  { n: "03", head: "Talent", body: "Standardised scores surface the best athletes, anywhere." },
  { n: "04", head: "Fans", body: "Explainable, watchable competition pulls audiences and federations in." },
];

export function Vision() {
  return (
    <section className="relative isolate overflow-hidden bg-console text-paper">
      <Image
        src="/landing/arena.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-console-bg/85 via-console-bg/80 to-console-bg/95"
      />

      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel tone="paper">The vision</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              From a phone in a living room to a packed arena.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-paper/75">
              Scoring isn’t the product — it’s the flywheel. Each practice
              session feeds the data that makes the sport legible, fundable, and
              finally watchable.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FLYWHEEL.map((f, i) => (
            <Reveal as="li" key={f.n} index={i}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <span className="font-display text-3xl font-black text-sun-400">
                  {f.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-white">
                  {f.head}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/65">
                  {f.body}
                </p>
                {i < FLYWHEEL.length - 1 && (
                  <span
                    aria-hidden
                    className="mt-4 hidden text-sun-400/60 lg:block"
                  >
                    ↓
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
