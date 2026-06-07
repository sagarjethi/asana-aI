"use client";

/**
 * The trust section — the credibility centrepiece.
 * "AI suggests, the judge confirms" + "Show me why" (tap a score → exact joint,
 * angle, reason). Emphasises confidence / abstain / noise-floor / human authority.
 */
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./primitives";
import { ScanEye, GitCompareArrows, ShieldCheck, Activity } from "lucide-react";

const PILLARS = [
  {
    icon: ScanEye,
    title: "Show me why",
    body: "Tap any score and see the exact joint, the measured angle, the ratified band it missed, and the rule that fired. No black box — a receipt.",
  },
  {
    icon: Activity,
    title: "Confidence & abstain",
    body: "Each call is calibrated. Below threshold the engine abstains and defers to the human, rather than guessing on a borderline pose.",
  },
  {
    icon: ShieldCheck,
    title: "5° noise floor",
    body: "Nothing is deducted inside the measurement margin. Tolerance is built in, so the system never penalises its own uncertainty.",
  },
  {
    icon: GitCompareArrows,
    title: "Human override wins",
    body: "The judge adjusts or overrides any value. Their decision is the final score — signed, recorded, and replayable end to end.",
  },
];

export function Trust() {
  return (
    <section id="trust" className="scroll-mt-20 bg-sunrise">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel>Trust by design</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
              AI suggests.
              <br />
              <span className="text-sun-600">The judge confirms.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-ink/65">
              Every machine output is advisory. The platform exists to make the
              official faster and more certain — never to replace the call.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="relative overflow-hidden rounded-3xl shadow-2xl shadow-sun-900/20 ring-1 ring-sun-200">
            <div className="relative aspect-[16/11]">
              <Image
                src="/landing/referee.jpg"
                alt="A referee at an officiating console reviewing live deduction suggestions and confidence levels."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1c1006]/90 to-transparent p-6">
              <p className="font-display text-xl font-bold text-white">
                The officiating console
              </p>
              <p className="mt-1 text-sm text-white/75">
                Suggestions arrive ranked by confidence. The judge ratifies in one tap.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="relative overflow-hidden rounded-3xl shadow-2xl shadow-sun-900/20 ring-1 ring-sun-200">
            <div className="relative aspect-[16/11]">
              <Image
                src="/landing/show-me-why.jpg"
                alt="An explainable deduction replay highlighting a specific joint, its measured angle, and the reason for a deduction."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1c1006]/90 to-transparent p-6">
              <p className="font-display text-xl font-bold text-white">
                “Show me why”
              </p>
              <p className="mt-1 text-sm text-white/75">
                Right knee · 162° measured · band 170–180° · −0.3 alignment.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal as="li" key={p.title} index={i}>
                <div className="h-full rounded-2xl border border-sun-200 bg-white/80 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sun-900/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sun-100 text-sun-700">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
