"use client";

/**
 * Cinematic hero. The background image gets scroll-linked parallax + scale +
 * opacity (useScroll/useTransform). The headline animates word-by-word on load;
 * a floating live "ALIGNMENT" chip ticks a number. Everything is gated behind
 * useReducedMotion — static + visible when reduced.
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
import { ArrowRight, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/client/auth";
import { MagneticButton, MonoLabel, EASE_OUT } from "./ui";

const LINE_ONE = ["Competitive", "yoga,"];
const LINE_TWO = ["finally", "scored."];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

/** Live-feeling alignment number that drifts around 98.7. */
function useTickingNumber(reduce: boolean | null) {
  const [v, setV] = React.useState(98.7);
  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setV(() => 98.4 + Math.random() * 0.6);
    }, 1400);
    return () => clearInterval(id);
  }, [reduce]);
  return v;
}

export function Hero() {
  const { user, loading } = useSession();
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const tick = useTickingNumber(reduce);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const rawFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = reduce ? undefined : rawY;
  const scale = reduce ? 1.06 : rawScale;
  const contentOpacity = reduce ? 1 : rawFade;

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.12 },
    },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.5em" },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  const authed = !loading && !!user;

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#08080B]"
    >
      {/* Parallax background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <Image
          src="/landing/hero.jpg"
          alt="A competitive yoga athlete holding a balance pose on a lit stage, with a live alignment overlay tracing their joints."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Dark scrims for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08080B] via-[#08080B]/70 to-[#08080B]/40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#08080B]/85 via-transparent to-transparent"
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-24 pt-28 sm:px-8 sm:pb-32"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-7"
        >
          <MonoLabel accent>
            <span aria-hidden>◐</span>
            Officiating &amp; Broadcast for Competitive Yoga
          </MonoLabel>
        </motion.div>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-[18ch] font-display text-[clamp(2.7rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-[#F4F4F5]"
        >
          <span className="block">
            {LINE_ONE.map((w, i) => (
              <motion.span
                key={i}
                variants={word}
                className="mr-[0.22em] inline-block"
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block">
            {LINE_TWO.map((w, i) => (
              <motion.span
                key={i}
                variants={word}
                className={
                  "mr-[0.22em] inline-block " +
                  (w === "scored." ? "text-amber-500" : "")
                }
              >
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
        >
          On-device AI measures every joint angle in real time. The judge confirms
          the call. Scores become explainable, signed, and replayable — and the
          sport becomes broadcast-ready.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.64 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <MagneticButton
            href={authed ? "/dashboard" : "/signup"}
            className={
              "group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-base font-semibold text-black shadow-[0_8px_40px_-12px_rgba(245,158,11,0.6)] transition-colors hover:bg-amber-400 " +
              focusRing
            }
          >
            {authed ? "Dashboard" : "Get started"}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </MagneticButton>
          <Link
            href="/athlete/practice"
            className={
              "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-zinc-100 backdrop-blur transition hover:bg-white/[0.08] " +
              focusRing
            }
          >
            See live scoring
          </Link>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.82 }}
          className="mt-7"
        >
          <MonoLabel>camera-only · on-device AI</MonoLabel>
        </motion.p>
      </motion.div>

      {/* Floating live alignment chip */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: EASE_OUT }}
        className="pointer-events-none absolute right-5 top-24 z-10 hidden sm:right-8 sm:block lg:top-28"
      >
        <div className="rounded-2xl border border-white/10 bg-[#14141C]/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            />
            <MonoLabel>Alignment</MonoLabel>
          </div>
          <div className="mt-1.5 font-display text-4xl font-bold tabular-nums text-[#F4F4F5]">
            {tick.toFixed(1)}
            <span className="ml-1 text-base font-medium text-zinc-500">%</span>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, 7, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500"
        >
          <ChevronDown size={22} />
        </motion.div>
      )}
    </section>
  );
}
