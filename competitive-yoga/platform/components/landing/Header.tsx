"use client";

/**
 * Marketing header — its OWN chrome (not the app Shell). Transparent over the
 * hero; gains backdrop-blur + bg-black/60 + a hairline border after ~12px of
 * scroll. CTA reflects session state via useSession().
 */
import Link from "next/link";
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/client/auth";
import { EASE_OUT } from "./ui";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#trust", label: "Trust" },
  { href: "#product", label: "Product" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

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
      initial={reduce ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
        (scrolled
          ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent")
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className={
            "group flex items-center gap-2 rounded-md font-display text-[15px] font-semibold tracking-tight text-zinc-100 " +
            focusRing
          }
        >
          <span
            aria-hidden
            className="text-amber-500 transition-transform duration-500 group-hover:rotate-180"
          >
            ◐
          </span>
          <span className="uppercase tracking-[0.18em]">Yoga Drishti</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className={
                  "group relative rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100 " +
                  focusRing
                }
              >
                {n.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-amber-500 transition-transform duration-200 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Link
              href="/dashboard"
              className={
                "rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 " +
                focusRing
              }
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={
                  "rounded-lg px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-zinc-100 " +
                  focusRing
                }
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={
                  "rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400 " +
                  focusRing
                }
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
          className={"rounded-lg p-2 text-zinc-100 md:hidden " + focusRing}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-black/90 px-5 py-4 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={
                    "block rounded-md px-3 py-2.5 text-base font-medium text-zinc-300 hover:bg-white/5 hover:text-zinc-100 " +
                    focusRing
                  }
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
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-black"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-black"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-zinc-200"
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
