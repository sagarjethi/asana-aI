"use client";

/** Chapter 01 — The problem: yoga is invisible to a judge and hard to watch. */
import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, MonoLabel, useParallax } from "./ui";

const PAINS = [
  {
    head: "Invisible to the eye",
    body: "A balance held a fraction of a degree off, a hip rotated past tolerance — the difference between medals lives in angles no judge can measure in real time.",
  },
  {
    head: "Impossible to broadcast",
    body: "Stillness doesn’t telegraph difficulty. Audiences can’t see why one hold scores higher than another, so the sport stays hard to follow.",
  },
  {
    head: "Hard to trust",
    body: "Hand-scored panels invite dispute. Without a record of what was measured and why, every close call becomes an argument.",
  },
];

export function Problem() {
  const { ref, y } = useParallax(["-7%", "7%"]);

  return (
    <section className="relative z-10 bg-[#08080B]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-28 sm:px-8 sm:py-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <MonoLabel accent>01 — The problem</MonoLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 max-w-xl font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#F4F4F5]">
              The most precise sport is the hardest one to{" "}
              <span className="text-amber-500">score.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
              Yoga rewards control measured in single degrees and held for
              seconds. The human eye can’t catch it, the camera couldn’t explain
              it — until now.
            </p>
          </Reveal>

          <ul className="mt-12 space-y-8">
            {PAINS.map((p, i) => (
              <Reveal as="li" key={p.head} delay={0.08 * i}>
                <div className="flex gap-5 border-t border-white/10 pt-6">
                  <span
                    aria-hidden
                    className="font-display text-sm font-medium tabular-nums text-amber-500"
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#F4F4F5]">
                      {p.head}
                    </h3>
                    <p className="mt-2 text-zinc-400">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="relative lg:mt-0">
          <div
            ref={ref}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10"
          >
            <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
              <Image
                src="/landing/world.jpg"
                alt="Thousands of people practising yoga together at sunrise in an open field."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#08080B] via-[#08080B]/30 to-transparent"
            />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-[#14141C]/90 p-5 backdrop-blur-xl sm:left-8 sm:max-w-xs">
            <p className="font-display text-3xl font-bold tabular-nums text-amber-500">
              300M+
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              practitioners worldwide, and no shared language for who is best.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
