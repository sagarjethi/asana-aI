"use client";

/**
 * Chapter 02 — How it works: the honest pipeline Capture → Measure → Score →
 * Confirm, plus the two-tier idea (on-device pose today, multi-camera 3D on the
 * roadmap).
 */
import Image from "next/image";
import { motion } from "framer-motion";
import { Aperture, Ruler, Calculator, Gavel } from "lucide-react";
import { Reveal, RevealGroup, revealItem, MonoLabel, useParallax } from "./ui";

const STEPS = [
  {
    icon: Aperture,
    title: "Capture",
    body: "TensorFlow.js + MoveNet (SinglePose Lightning) tracks 17 keypoints from a single camera, entirely in the browser. Frames never leave the device.",
  },
  {
    icon: Ruler,
    title: "Measure",
    body: "Vector geometry turns keypoints into joint angles — elbow, hip, knee, spine — with a 5° measurement noise floor below which nothing is deducted.",
  },
  {
    icon: Calculator,
    title: "Score",
    body: "Angles are compared against judge-ratified bands, not one “golden” pose. Stability adds centre-of-mass sway; a rules-DSL proposes deductions.",
  },
  {
    icon: Gavel,
    title: "Confirm",
    body: "Every output carries calibrated confidence and abstains when unsure. The judge reviews, adjusts, and ratifies. The human call is the final score.",
  },
];

export function HowItWorks() {
  const { ref, y } = useParallax(["-6%", "6%"]);

  return (
    <section id="how" className="relative z-10 scroll-mt-20 bg-[#0E0E15]">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal className="relative order-2 lg:order-1">
            <div
              ref={ref}
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10"
            >
              <motion.div style={{ y }} className="absolute -inset-y-[7%] inset-x-0">
                <Image
                  src="/landing/capture-3d.jpg"
                  alt="A multi-camera rig surrounding an athlete, capturing the pose from several angles for 3D reconstruction."
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-[#08080B]/70 via-transparent to-transparent"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Live now · monocular on-device pose
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400">
                Roadmap · multi-camera 3D triangulation
              </span>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <MonoLabel accent>02 — How it works</MonoLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-6 max-w-md font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#F4F4F5]">
                A deterministic pipeline, built two tiers deep.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
                The pilot runs the full chain from a single phone. The same
                engine accepts multi-camera 3D input as the hardware tier comes
                online — same scores, more precision.
              </p>
            </Reveal>
          </div>
        </div>

        <RevealGroup className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={revealItem}
                className="group bg-[#0E0E15] p-7 transition-colors duration-200 hover:bg-[#14141C]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-400">
                    <Icon size={20} aria-hidden />
                  </span>
                  <span
                    aria-hidden
                    className="font-display text-xs font-medium uppercase tracking-[0.3em] text-zinc-600"
                  >
                    Step 0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-[#F4F4F5]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.body}
                </p>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
