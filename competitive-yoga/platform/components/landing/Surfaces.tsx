"use client";

/**
 * Product surfaces — one card per role, each linking into the live app.
 * Built on a typed API (auth, events/enroll, rounds, score, perform,
 * override, live SSE, results, leaderboard, templates).
 */
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./primitives";
import { ArrowUpRight, User, ClipboardList, Gavel, CalendarRange } from "lucide-react";

const SURFACES = [
  {
    icon: User,
    role: "Athlete",
    href: "/athlete/practice",
    image: "/landing/athlete-app.jpg",
    alt: "Three phone screens showing the athlete app: live alignment, scoring, and progress.",
    features: [
      "Real-time alignment scoring from your phone camera",
      "Practice any asana against ratified angle bands",
      "Track progress and stability over time",
    ],
    span: true,
  },
  {
    icon: ClipboardList,
    role: "Coach",
    href: "/coach",
    image: "/landing/simulcam.jpg",
    alt: "A ghost-comparison Simulcam view overlaying two athletes' poses.",
    features: [
      "Score trends and weakness heatmaps",
      "Head-to-head ghost comparison (Simulcam)",
      "Spot the joint costing the most points",
    ],
  },
  {
    icon: Gavel,
    role: "Judge",
    href: "/judge",
    image: null,
    alt: "",
    features: [
      "Ranked, confidence-scored deduction suggestions",
      "One-tap ratify, adjust, or override",
      "Replayable, signed scoring record",
    ],
  },
  {
    icon: CalendarRange,
    role: "Organizer",
    href: "/organizer",
    image: "/landing/ecosystem.jpg",
    alt: "Consumer lifestyle view of the broader yoga ecosystem app.",
    features: [
      "Create events, rounds, and enrolments",
      "Start and publish rounds live",
      "Live leaderboard over a Server-Sent-Events feed",
    ],
  },
];

export function Surfaces() {
  return (
    <section id="product" className="scroll-mt-20 bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel>Product</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl">
              One platform, four points of view.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg text-ink/65">
              Every surface runs on the same typed API — auth, events, rounds,
              scoring, overrides, results, and a live SSE feed.
            </p>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {SURFACES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal
                as="li"
                key={s.role}
                index={i}
                className={s.span ? "md:col-span-2" : ""}
              >
                <Link
                  href={s.href}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sun-200 bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sun-300 hover:shadow-xl hover:shadow-sun-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:flex-row"
                >
                  {s.image && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:w-2/5">
                      <Image
                        src={s.image}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-100 text-sun-700">
                          <Icon size={19} aria-hidden />
                        </span>
                        <span className="font-display text-2xl font-bold text-ink">
                          {s.role}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={20}
                        aria-hidden
                        className="text-sun-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sun-600"
                      />
                    </div>
                    <ul className="mt-5 space-y-2.5">
                      {s.features.map((f) => (
                        <li
                          key={f}
                          className="flex gap-2.5 text-sm text-ink/70"
                        >
                          <span
                            aria-hidden
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-400"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto pt-5 text-sm font-semibold text-sun-700">
                      Open {s.role.toLowerCase()} →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
