"use client";

/**
 * Marketing sticky header — its OWN chrome (not the app Shell).
 * Blur + border fade in once the page is scrolled. Primary CTA flips to
 * "Go to dashboard" when a session exists.
 */
import Link from "next/link";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/client/auth";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#trust", label: "Trust" },
];

export function Header() {
  const { user, loading } = useSession();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const authed = !loading && !!user;

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
        (scrolled
          ? "border-b border-sun-200/70 bg-paper/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent")
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-md font-display text-lg font-black tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <span
            aria-hidden
            className="text-sun-600 transition-transform duration-500 group-hover:rotate-180"
          >
            ◐
          </span>
          Yoga Drishti
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-sun-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sun-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-ink/80 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-sun-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sun-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-sun-200/70 bg-paper/95 px-5 py-4 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-base font-medium text-ink/80 hover:bg-sun-100"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            {authed ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-sun-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-lg bg-sun-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-sun-300 px-4 py-2.5 text-center text-sm font-semibold text-sun-800"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
