/**
 * Yoga Drishti — marketing landing page.
 *
 * A DARK, cinematic, scroll-driven story: intro hook → numbered chapters →
 * climax CTA. It has its own chrome (not the app Shell). A fixed amber scroll-
 * progress rail tracks reading position; a faint film-grain overlay adds
 * texture. All motion lives in the components and is fully gated behind
 * prefers-reduced-motion.
 */
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { StatBand } from "@/components/landing/StatBand";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Trust } from "@/components/landing/Trust";
import { Surfaces } from "@/components/landing/Surfaces";
import { Vision } from "@/components/landing/Vision";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollProgress } from "@/components/landing/ui";

export default function Home() {
  return (
    <div className="landing-grain relative min-h-screen bg-[#08080B] text-[#F4F4F5] selection:bg-amber-500/30 selection:text-amber-100">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <Hero />
        <StatBand />
        <Problem />
        <HowItWorks />
        <Trust />
        <Surfaces />
        <Vision />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
