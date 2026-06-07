"use client";

/**
 * <Reveal> — fade + translate-up on scroll into view.
 *
 * Uses framer-motion's `whileInView` (once) with a calm easing curve. When the
 * user prefers reduced motion, the animation collapses to an instant, fully
 * visible state — content is never gated behind motion.
 */
import { motion, useReducedMotion, type Variants } from "framer-motion";
import * as React from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** stagger position — multiplies the base delay */
  index?: number;
  /** vertical travel distance in px */
  y?: number;
  /** base delay in seconds */
  delay?: number;
  as?: "div" | "li" | "section" | "span";
}

export function Reveal({
  children,
  index = 0,
  y = 24,
  delay = 0,
  as = "div",
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.7,
        delay: reduce ? 0 : delay + index * 0.08,
        ease: EASE,
      },
    },
  };

  const MotionTag = motion[as] as typeof motion.div;

  // When motion is reduced, render fully visible immediately — never gate
  // content behind a scroll-into-view observer (also protects against any
  // case where the observer doesn't fire: deep links, fast scroll, etc.).
  if (reduce) {
    return (
      <MotionTag initial={false} animate="show" variants={variants} {...(rest as React.ComponentProps<typeof motion.div>)}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={variants}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionTag>
  );
}
