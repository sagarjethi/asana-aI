/**
 * Yoga Drishti — marketing landing page.
 *
 * The front door for federations, broadcasters, and athletes. It has its own
 * sticky chrome (not the app Shell). Motion is provided by framer-motion and is
 * fully gated behind prefers-reduced-motion in each component.
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

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-sun-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sun-600"
      >
        Skip to content
      </a>
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
    </>
  );
}
