"use client";

/**
 * Product — an asymmetric bento grid, one tile per role, each linking into the
 * live app. Tiles hover-lift (translateY + border glow). Built on a typed API
 * (auth, events/enroll, rounds, score, perform, override, live SSE, results,
 * leaderboard).
 */
import Image from "next/image";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, User, ClipboardList, Gavel, CalendarRange, type LucideIcon } from "lucide-react";
import { Reveal, RevealGroup, revealItem, MonoLabel } from "./ui";

type Surface = {
  icon: LucideIcon;
  role: string;
  href: string;
  image: string | null;
  alt: string;
  blurb: string;
  features: string[];
  className: string;
};

const SURFACES: Surface[] = [
  {
    icon: User,
    role: "Athlete",
    href: "/athlete/practice",
    image: "/landing/athlete-app.jpg",
    alt: "The athlete app showing live alignment scoring, asana practice, and progress over time.",
    blurb: "Real-time alignment scoring from your phone camera.",
    features: ["Practice any asana vs ratified bands", "Track stability over time"],
    className: "md:col-span-2 md:row-span-2",
  },
  {
    icon: Gavel,
    role: "Judge",
    href: "/judge",
    image: null,
    alt: "",
    blurb: "Ranked, confidence-scored suggestions. One-tap ratify, adjust, or override.",
    features: ["Signed, replayable record"],
    className: "md:col-span-2",
  },
  {
    icon: ClipboardList,
    role: "Coach",
    href: "/coach",
    image: "/landing/simulcam.jpg",
    alt: "A ghost-comparison Simulcam view overlaying two athletes' poses for analysis.",
    blurb: "Score trends, weakness heatmaps, head-to-head Simulcam.",
    features: [],
    className: "md:col-span-2",
  },
  {
    icon: CalendarRange,
    role: "Organizer",
    href: "/organizer",
    image: "/landing/ecosystem.jpg",
    alt: "The broader yoga ecosystem app for organising events and rounds.",
    blurb: "Create events and rounds; publish live over an SSE leaderboard.",
    features: [],
    className: "md:col-span-2",
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B11]";

export function Surfaces() {
  return (
    <section id="product" className="relative z-10 scroll-mt-20 bg-[#0B0B11]">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="max-w-2xl">
          <Reveal>
            <MonoLabel accent>Product</MonoLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#F4F4F5]">
              One platform, four points of view.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Every surface runs on the same typed API — auth, events, rounds,
              scoring, overrides, results, and a live SSE feed.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-14 grid auto-rows-[minmax(11rem,1fr)] grid-cols-1 gap-4 md:grid-cols-4"
          stagger={0.07}
        >
          {SURFACES.map((s) => {
            const Icon = s.icon;
            const hasImage = !!s.image;
            return (
              <motion.a
                key={s.role}
                href={s.href}
                variants={revealItem}
                aria-label={`Open ${s.role}`}
                className={
                  "group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-[#14141C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_20px_60px_-20px_rgba(245,158,11,0.25)] " +
                  focusRing +
                  " " +
                  s.className
                }
              >
                {hasImage && (
                  <>
                    <Image
                      src={s.image as string}
                      alt={s.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-40 transition-all duration-500 group-hover:scale-105 group-hover:opacity-50"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08080B] via-[#08080B]/55 to-[#08080B]/20" />
                  </>
                )}

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-amber-400 backdrop-blur">
                      <Icon size={20} aria-hidden />
                    </span>
                    <ArrowUpRight
                      size={20}
                      aria-hidden
                      className="text-zinc-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-400"
                    />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-[#F4F4F5]">
                    {s.role}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-300">
                    {s.blurb}
                  </p>
                  {s.features.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {s.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-zinc-400">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-500/70" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.a>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
