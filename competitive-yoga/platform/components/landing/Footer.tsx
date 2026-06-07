"use client";

/** Marketing footer — mono brand, honest pilot-scope note, and key links. */
import Link from "next/link";

const LINKS: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Practice", href: "/athlete/practice" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Log in", href: "/login" },
  { label: "Get started", href: "/signup" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080B]";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#08080B]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className={
                "inline-flex items-center gap-2 rounded-md font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-zinc-100 " +
                focusRing
              }
            >
              <span aria-hidden className="text-amber-500">◐</span>
              Yoga Drishti
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Officiating &amp; broadcast for competitive yoga. AI suggests, the
              judge confirms — every score explainable, signed, and replayable.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Built with on-device AI · TensorFlow.js + MoveNet
            </p>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <h2 className="font-display text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
              Explore
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-12 gap-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      "group relative text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 " +
                      focusRing
                    }
                  >
                    {l.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-amber-500 transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-7">
          <p className="max-w-3xl text-xs leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-300">Pilot scope:</span> Solo
            format, monocular on-device pose MVP, and a deterministic scoring
            engine are live. Multi-camera 3D triangulation and broadcast Simulcam
            are simulated for the pilot and on the roadmap.
          </p>
          <p className="mt-4 text-xs text-zinc-600">
            © {new Date().getFullYear()} Yoga Drishti. Camera-only · frames never
            leave the device.
          </p>
        </div>
      </div>
    </footer>
  );
}
