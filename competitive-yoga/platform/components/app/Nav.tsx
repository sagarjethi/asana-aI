"use client";
/** Role-aware top navigation + session controls. Shared across all journeys. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/client/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/contracts";

const LINKS: Record<string, { href: string; label: string }[]> = {
  athlete: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/athlete/events", label: "Events" },
    { href: "/athlete/practice", label: "Practice" },
    { href: "/athlete/results", label: "My results" },
  ],
  coach: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/coach", label: "Athletes" },
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  referee: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/judge", label: "My rounds" },
  ],
  head_judge: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/judge", label: "My rounds" },
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/organizer", label: "Events" },
    { href: "/organizer/new", label: "New event" },
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  director: [{ href: "/dashboard", label: "Dashboard" }],
};

export function Nav({ tone = "warm" }: { tone?: "warm" | "console" }) {
  const { user, logout } = useSession();
  const pathname = usePathname();
  const links = user ? LINKS[user.role as Role] ?? [] : [];
  const dark = tone === "console";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-4 border-b px-5 py-3 backdrop-blur",
        dark ? "border-console-line bg-console-bg/90 text-paper" : "border-sun-200 bg-paper/85 text-ink",
      )}
    >
      <Link href={user ? "/dashboard" : "/"} className="font-display text-lg font-black tracking-tight">
        ◐ Yoga&nbsp;Drishti
      </Link>
      <nav className="ml-2 hidden gap-1 sm:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              pathname === l.href
                ? dark ? "bg-console-panel text-white" : "bg-sun-100 text-sun-800"
                : dark ? "text-paper/70 hover:text-white" : "text-ink/70 hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className={cn("hidden md:inline", dark ? "text-paper/70" : "text-ink/60")}>
              {user.name} · <span className="capitalize">{user.role.replace("_", " ")}</span>
            </span>
            <button
              onClick={logout}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition",
                dark ? "bg-console-panel hover:bg-console-line" : "bg-sun-600 text-white hover:bg-sun-700",
              )}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-lg px-3 py-1.5 font-medium hover:underline">Log in</Link>
            <Link href="/signup" className="rounded-lg bg-sun-600 px-3 py-1.5 font-medium text-white hover:bg-sun-700">
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
