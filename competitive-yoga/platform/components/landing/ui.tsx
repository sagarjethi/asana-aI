"use client";

/**
 * Shared building blocks for the DARK cinematic landing page.
 *
 * Every motion primitive is fully gated behind useReducedMotion(): when motion
 * is reduced, content renders visible and static (no transform, no infinite
 * loops). All motion uses transform/opacity only.
 */
import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";

/* Standard editorial ease-out used across reveals. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ----------------------------------------------------------------- Reveal -- */
/** Fade + rise on enter, once. Static + visible when reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span" | "p";
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const MotionTag = (motion as never)[as] as typeof motion.div;

  if (reduce) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container — children get a sequential reveal. */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/* ---------------------------------------------------------------- CountUp -- */
/** Tabular count-up that runs once on view. Static target when reduced. */
export function CountUp({
  to,
  from = 0,
  duration = 1.5,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [val, setVal] = React.useState(reduce ? to : from);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, reduce, from, to, duration]);

  return (
    <span ref={ref} className={"tabular-nums " + className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------- MonoLabel -- */
/** Space-Grotesk uppercase wide-tracking label, e.g. "01 — The problem". */
export function MonoLabel({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-2.5 font-display text-[11px] font-medium uppercase tracking-[0.32em] " +
        (accent ? "text-amber-500 " : "text-zinc-500 ") +
        className
      }
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------- MagneticButton -- */
/**
 * Primary CTA that nudges toward the cursor (a few px) and springs back.
 * Renders as a real <a> for keyboard/semantics; magnetism disabled when reduced
 * motion or on touch (no hover).
 */
export function MagneticButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 300, damping: 20, mass: 0.4 });
  const y = useSpring(0, { stiffness: 300, damping: 20, mass: 0.4 });

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    x.set(Math.max(-8, Math.min(8, mx * 0.25)));
    y.set(Math.max(-8, Math.min(8, my * 0.35)));
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduce ? undefined : { x, y }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

/* --------------------------------------------------------- ScrollProgress -- */
/** Fixed top amber rail driven by page scroll. Hidden when reduced motion. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-amber-500 to-orange-600"
    />
  );
}

/* --------------------------------------------------------- ParallaxImage -- */
/** Subtle vertical parallax (±%) on section images. Static when reduced. */
export function useParallax(range: [string, string] = ["-6%", "6%"]) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], range);
  return { ref, y: reduce ? undefined : raw };
}
