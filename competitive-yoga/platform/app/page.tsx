import Link from "next/link";

const surfaces = [
  { href: "/referee", title: "Referee Console", desc: "AI suggests, the judge confirms — live deductions, confidence, replay." },
  { href: "/leaderboard", title: "Live Leaderboard", desc: "Real-time standings for the current round." },
  { href: "/athlete", title: "Athlete", desc: "Practice with real-time alignment scoring + progress." },
  { href: "/coach", title: "Coach", desc: "Score trends, weakness heatmap, head-to-head." },
];

export default function Home() {
  return (
    <main className="bg-sunrise min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun-600">
          Competitive Yoga · Officiating &amp; Broadcast
        </p>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-ink">
          ◐ Yoga Drishti
        </h1>
        <p className="mt-3 max-w-xl text-lg text-sun-900/70">
          The pilot platform. AI measures every pose; the human judge confirms. Every score is
          explainable, signed, and replayable.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {surfaces.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-sun-200 bg-white/70 p-6 transition hover:border-sun-400 hover:shadow-lg"
            >
              <h2 className="font-display text-2xl font-bold text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-sun-900/70">{s.desc}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-xs text-sun-900/50">
          Pilot scope: Solo format, monocular pose MVP, deterministic scoring engine. Multi-camera 3D
          &amp; broadcast hardware layers are simulated. See <code>README.md</code>.
        </p>
      </div>
    </main>
  );
}
