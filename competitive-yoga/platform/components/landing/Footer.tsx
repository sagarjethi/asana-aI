"use client";

/** Marketing footer — brand, honest pilot-scope note, and key links. */
import Link from "next/link";

const LINKS: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Practice", href: "/athlete/practice" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Log in", href: "/login" },
  { label: "Get started", href: "/signup" },
];

export function Footer() {
  return (
    <footer className="border-t border-sun-200/70 bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md font-display text-lg font-black tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500"
            >
              <span aria-hidden className="text-sun-600">◐</span>
              Yoga Drishti
            </Link>
            <p className="mt-3 text-sm text-ink/60">
              Officiating &amp; broadcast for competitive yoga. AI suggests, the
              judge confirms — every score explainable, signed, and replayable.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sun-100 px-3 py-1 text-xs font-medium text-sun-800">
              Built with on-device AI · TensorFlow.js + MoveNet
            </p>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink/40">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium text-ink/70 transition-colors hover:text-sun-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-sun-200/70 pt-6">
          <p className="text-xs leading-relaxed text-ink/45">
            <span className="font-semibold text-ink/60">Pilot scope:</span> Solo
            format, monocular on-device pose MVP, and a deterministic scoring
            engine are live. Multi-camera 3D triangulation and broadcast Simulcam
            are simulated for the pilot and on the roadmap.
          </p>
          <p className="mt-4 text-xs text-ink/40">
            © {new Date().getFullYear()} Yoga Drishti. Camera-only · frames never
            leave the device.
          </p>
        </div>
      </div>
    </footer>
  );
}
