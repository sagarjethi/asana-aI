"use client";

/** Closing call-to-action band, reiterating the principle. */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { GradientSheen } from "./primitives";
import { useSession } from "@/lib/client/auth";

export function FinalCTA() {
  const { user, loading } = useSession();
  const authed = !loading && !!user;

  return (
    <section className="bg-paper px-5 pb-20 pt-4 sm:px-8 sm:pb-28">
      <Reveal className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-sun-300/60 bg-sunrise px-6 py-16 text-center shadow-xl shadow-sun-900/10 sm:px-12 sm:py-24">
        <GradientSheen />
        <p className="relative inline-flex items-center gap-2 rounded-full border border-sun-300/70 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sun-700 backdrop-blur">
          <span aria-hidden className="text-sun-600">◐</span>
          AI suggests · the judge confirms
        </p>
        <h2 className="relative mx-auto mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Make every pose scorable. Make yoga watchable.
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-ink/65">
          Start scoring from a single camera today, or talk to us about bringing
          explainable officiating to your federation or broadcast.
        </p>
        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={authed ? "/dashboard" : "/signup"}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sun-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sun-900/20 transition hover:bg-sun-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {authed ? "Go to dashboard" : "Get started"}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sun-300 bg-white/70 px-8 py-3.5 text-base font-semibold text-sun-800 backdrop-blur transition hover:border-sun-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Log in
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
