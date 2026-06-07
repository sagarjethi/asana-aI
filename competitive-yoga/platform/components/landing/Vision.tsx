"use client";

/** Vision — full-bleed arena.jpg + the flywheel: practice → data → talent → fans. */
import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, revealItem, MonoLabel, useParallax } from "./ui";

const FLYWHEEL = [
  { n: "01", head: "Practice", body: "Millions train with the app and get scored, every day." },
  { n: "02", head: "Data", body: "Ratified angle bands and stability profiles sharpen the engine." },
  { n: "03", head: "Talent", body: "Standardised scores surface the best athletes, anywhere." },
  { n: "04", head: "Fans", body: "Explainable, watchable competition pulls audiences and federations in." },
];

export function Vision() {
  const { ref, y } = useParallax(["-8%", "8%"]);

  return (
    <section className="relative z-10 isolate overflow-hidden bg-[#08080B]">
      <div ref={ref} className="absolute -inset-y-[10%] inset-x-0 -z-10">
        <motion.div style={{ y }} className="relative h-full w-full">
          <Image
            src="/landing/arena.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
        </motion.div>
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08080B] via-[#08080B]/85 to-[#08080B]"
      />

      <div className="mx-auto max-w-7xl px-5 py-32 sm:px-8 sm:py-40">
        <div className="max-w-2xl">
          <Reveal>
            <MonoLabel accent>The vision</MonoLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-[#F4F4F5]">
              From a phone in a living room to a packed arena.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Scoring isn’t the product — it’s the flywheel. Each practice
              session feeds the data that makes the sport legible, fundable, and
              finally watchable.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {FLYWHEEL.map((f) => (
            <motion.div
              key={f.n}
              variants={revealItem}
              className="bg-[#0B0B11]/80 p-7 backdrop-blur-sm transition-colors duration-200 hover:bg-[#14141C]/90"
            >
              <span className="font-display text-2xl font-bold tabular-nums text-amber-500">
                {f.n}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-[#F4F4F5]">
                {f.head}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
