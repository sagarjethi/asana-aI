"use client";

/**
 * Chapter 03 — Trust centrepiece: "AI suggests. The judge confirms."
 * Two cinematic images + an interactive "tap a score → reason" callout that
 * reveals the exact joint, angle, band, and rule behind a deduction. Pillars
 * cover Show-me-why / Confidence & abstain / 5° noise floor / Human override.
 */
import Image from "next/image";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScanEye, GitCompareArrows, ShieldCheck, Activity } from "lucide-react";
import { Reveal, RevealGroup, revealItem, MonoLabel, EASE_OUT } from "./ui";

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

const REASONS = [
  { joint: "Right knee", measured: "162°", band: "170–180°", rule: "Alignment −0.3", conf: "0.94" },
  { joint: "Hip rotation", measured: "11°", band: "0–6°", rule: "Symmetry −0.2", conf: "0.88" },
  { joint: "Spine flexion", measured: "—", band: "n/a", rule: "Abstained · low confidence", conf: "0.41" },
];

/** Interactive callout: cycles reasons; also advances on click/keyboard. */
function ScoreCallout() {
  const reduce = useReducedMotion();
  const [i, setI] = React.useState(0);
  const r = REASONS[i];

  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((p) => (p + 1) % REASONS.length), 3200);
    return () => clearInterval(id);
  }, [reduce]);

  const advance = () => setI((p) => (p + 1) % REASONS.length);

  return (
    <button
      type="button"
      onClick={advance}
      aria-label="Cycle through example deduction explanations"
      className="group w-full rounded-2xl border border-white/10 bg-[#14141C] p-6 text-left transition-colors hover:border-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080B]"
    >
      <div className="flex items-center justify-between">
        <MonoLabel accent>
          <ScanEye size={13} aria-hidden /> Tap a score
        </MonoLabel>
        <span className="font-display text-xs uppercase tracking-[0.25em] text-zinc-600">
          {i + 1}/{REASONS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.dl
          key={i}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4"
        >
          <div>
            <dt className="text-xs text-zinc-500">Joint</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-[#F4F4F5]">{r.joint}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Measured</dt>
            <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-amber-500">{r.measured}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Ratified band</dt>
            <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-zinc-300">{r.band}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Confidence</dt>
            <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-zinc-300">{r.conf}</dd>
          </div>
          <div className="col-span-2 border-t border-white/10 pt-4">
            <dt className="text-xs text-zinc-500">Reason</dt>
            <dd className="mt-1 font-medium text-[#F4F4F5]">{r.rule}</dd>
          </div>
        </motion.dl>
      </AnimatePresence>
    </button>
  );
}

export function Trust() {
  return (
    <section id="trust" className="relative z-10 scroll-mt-20 bg-[#08080B]">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="max-w-2xl">
          <Reveal>
            <MonoLabel accent>03 — Trust by design</MonoLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-[#F4F4F5]">
              AI suggests.
              <br />
              <span className="text-amber-500">The judge confirms.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Every machine output is advisory. The platform exists to make the
              official faster and more certain — never to replace the call.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          <Reveal className="group relative overflow-hidden rounded-3xl border border-white/10 lg:col-span-2">
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[26rem]">
              <Image
                src="/landing/referee.jpg"
                alt="A referee at an officiating console reviewing live deduction suggestions ranked by confidence."
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08080B] via-[#08080B]/30 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="font-display text-xl font-semibold text-[#F4F4F5]">The officiating console</p>
              <p className="mt-1.5 max-w-md text-sm text-zinc-300">
                Suggestions arrive ranked by confidence. The judge ratifies in one tap.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex">
            <ScoreCallout />
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal className="group relative overflow-hidden rounded-3xl border border-white/10 lg:col-span-1">
            <div className="relative aspect-[16/10]">
              <Image
                src="/landing/show-me-why.jpg"
                alt="An explainable deduction replay highlighting a specific joint, its measured angle, and the reason for a deduction."
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08080B] to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="font-display text-lg font-semibold text-[#F4F4F5]">Replayable evidence</p>
            </div>
          </Reveal>

          <RevealGroup className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] sm:grid-cols-2 lg:col-span-2">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={revealItem}
                  className="bg-[#08080B] p-7 transition-colors duration-200 hover:bg-[#14141C]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-400">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-[#F4F4F5]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.body}</p>
                </motion.div>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
