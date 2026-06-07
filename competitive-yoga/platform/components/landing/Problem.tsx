"use client";

/** The problem — yoga is invisible to a judge and hard to watch. */
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./primitives";

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
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <SectionLabel>The problem</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl">
              The most precise sport is the hardest one to score.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-ink/65">
              Yoga rewards control measured in single degrees and held for
              seconds. The human eye can’t catch it, the camera couldn’t explain
              it — until now.
            </p>
          </Reveal>

          <ul className="mt-10 space-y-6">
            {PAINS.map((p, i) => (
              <Reveal as="li" key={p.head} index={i} delay={0.1}>
                <div className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-1 font-display text-2xl font-black text-sun-400"
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">
                      {p.head}
                    </h3>
                    <p className="mt-1 text-ink/65">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-sun-900/20 ring-1 ring-sun-200">
            <Image
              src="/landing/world.jpg"
              alt="Thousands of people practising yoga together at sunrise in an open field."
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#1c1006]/40 to-transparent"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-sun-200 bg-paper/95 p-4 shadow-xl backdrop-blur sm:left-8 sm:max-w-xs">
            <p className="font-display text-2xl font-black text-sun-700">300M+</p>
            <p className="text-sm text-ink/60">
              practitioners worldwide, and no shared language for who is best.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
