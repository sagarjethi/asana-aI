"use client";

/** Final CTA band — bold, amber, magnetic primary button. */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/client/auth";
import { Reveal, MonoLabel, MagneticButton } from "./ui";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080B]";

export function FinalCTA() {
  const { user, loading } = useSession();
  const authed = !loading && !!user;

  return (
    <section className="relative z-10 bg-[#08080B] px-5 pb-28 pt-4 sm:px-8 sm:pb-36">
      <Reveal className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-20 text-center sm:px-12 sm:py-28">
        {/* subtle inner texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(0,0,0,0.45), transparent 70%)",
          }}
        />
        <MonoLabel className="relative !text-black/70">
          <span aria-hidden>◐</span>
          AI suggests · the judge confirms
        </MonoLabel>
        <h2 className="relative mx-auto mt-6 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-black">
          Competitive yoga, finally scored.
        </h2>
        <p className="relative mx-auto mt-6 max-w-xl text-lg leading-relaxed text-black/75">
          Start scoring from a single camera today, or talk to us about bringing
          explainable officiating to your federation or broadcast.
        </p>
        <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton
            href={authed ? "/dashboard" : "/signup"}
            className={
              "group inline-flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-[#F4F4F5] transition-colors hover:bg-zinc-900 " +
              focusRing
            }
          >
            {authed ? "Dashboard" : "Get started"}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
          <Link
            href="/athlete/practice"
            className={
              "inline-flex items-center justify-center gap-2 rounded-xl border border-black/25 bg-black/5 px-8 py-4 text-base font-semibold text-black transition hover:bg-black/10 " +
              focusRing
            }
          >
            See live scoring
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
