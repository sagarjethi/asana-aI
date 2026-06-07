"use client";

/**
 * How it works — the honest pipeline: Capture → Measure → Score → Confirm,
 * plus the two-tier idea (on-device pose today, multi-camera 3D on the roadmap).
 */
import Image from "next/image";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./primitives";
import { Aperture, Ruler, Calculator, Gavel } from "lucide-react";

const STEPS = [
  {
    icon: Aperture,
    title: "Capture",
    body: "TensorFlow.js + MoveNet (SinglePose Lightning) tracks 17 keypoints from a single camera, entirely in the browser. Frames never leave the device.",
  },
  {
    icon: Ruler,
    title: "Measure",
    body: "Vector geometry turns keypoints into joint angles — the elbow, hip, knee, and spine bends that define each asana — with a 5° measurement noise floor.",
  },
  {
    icon: Calculator,
    title: "Score",
    body: "Angles are compared against judge-ratified bands, not one “golden” pose. Stability adds centre-of-mass sway and micro-movement. A rules-DSL proposes deductions.",
  },
  {
    icon: Gavel,
    title: "Confirm",
    body: "Every output carries calibrated confidence and abstains when unsure. The judge reviews, adjusts, and ratifies. The human call is the final score.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-console text-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/10">
              <Image
                src="/landing/capture-3d.jpg"
                alt="A multi-camera rig surrounding an athlete, capturing the pose from several angles for 3D reconstruction."
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-console-bg/70 via-transparent to-transparent"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                Live now · monocular on-device pose
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sun-200 ring-1 ring-white/15">
                Roadmap · multi-camera 3D triangulation
              </span>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionLabel tone="paper">How it works</SectionLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 max-w-md font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
                A deterministic pipeline, built two tiers deep.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-lg text-paper/70">
                The pilot runs the full chain from a single phone. The same
                engine accepts multi-camera 3D input as the hardware tier comes
                online — same scores, more precision.
              </p>
            </Reveal>
          </div>
        </div>

        <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal as="li" key={s.title} index={i}>
                <div className="group h-full rounded-2xl border border-white/10 bg-console-panel p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-sun-400/40">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sun-500/15 text-sun-300 ring-1 ring-sun-400/30">
                      <Icon size={20} aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="font-display text-sm font-bold text-white/25"
                    >
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/65">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
