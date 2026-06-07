"use client";

/**
 * Full-bleed hero. Background image gets a gentle parallax (useScroll +
 * useTransform). The headline animates word-by-word with a stagger. All motion
 * is gated behind prefers-reduced-motion.
 */
import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight, Camera, Play, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/client/auth";

const LINE_ONE = ["Make", "every", "pose", "scorable."];
const LINE_TWO = ["Make", "yoga", "watchable."];

export function Hero() {
  const { user, loading } = useSession();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const rawFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = reduce ? undefined : rawY;
  const scale = reduce ? 1.05 : rawScale;
  const contentOpacity = reduce ? 1 : rawFade;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.15 } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.5em" },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  const authed = !loading && !!user;

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <Image
          src="/landing/hero.jpg"
          alt="A yoga athlete holding a balance pose on a lit competition stage, with an AR alignment overlay and live score projected beside them."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Warm gradient scrims for AA contrast over the photo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1c1006]/92 via-[#1c1006]/55 to-[#1c1006]/35"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#3a1c08]/70 via-transparent to-transparent"
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-20 pt-28 sm:px-8 sm:pb-28"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sun-100 backdrop-blur">
            <span aria-hidden className="text-sun-300">◐</span>
            Competitive Yoga · Officiating &amp; Broadcast
          </span>
        </motion.div>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl font-display text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.98] tracking-tight text-white"
        >
          <span className="block">
            {LINE_ONE.map((w, i) => (
              <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block text-sun-300">
            {LINE_TWO.map((w, i) => (
              <motion.span key={i} variants={word} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-sun-50/90 sm:text-xl"
        >
          On-device AI measures every joint angle in real time. The judge confirms
          the call. Scores become explainable, signed, and replayable — and the
          sport becomes broadcast-ready.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href={authed ? "/dashboard" : "/signup"}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sun-500 px-7 py-3.5 text-base font-semibold text-ink shadow-lg shadow-sun-900/30 transition hover:bg-sun-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1006]"
          >
            {authed ? "Go to dashboard" : "Get started"}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/athlete/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1006]"
          >
            <Play size={17} aria-hidden />
            Try the live demo
          </Link>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sun-100/80"
        >
          <span className="inline-flex items-center gap-1.5">
            <Camera size={15} aria-hidden /> Camera-only
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={15} aria-hidden /> On-device AI · frames never leave the device
          </span>
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium uppercase tracking-[0.2em] text-white/60"
        >
          Scroll
        </motion.div>
      )}
    </section>
  );
}
