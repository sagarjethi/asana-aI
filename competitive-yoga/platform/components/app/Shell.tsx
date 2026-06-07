"use client";
/** Page shell: role-aware Nav + a themed main container. Used by journey pages. */
import { Nav } from "@/components/app/Nav";
import { cn } from "@/lib/utils";

export function Shell({
  children,
  tone = "warm",
  width = "wide",
}: {
  children: React.ReactNode;
  tone?: "warm" | "console";
  width?: "wide" | "narrow";
}) {
  const dark = tone === "console";
  return (
    <div className={cn("min-h-screen", dark ? "bg-console" : "bg-sunrise")}>
      <Nav tone={tone} />
      <main className={cn("mx-auto px-5 py-8", width === "narrow" ? "max-w-2xl" : "max-w-6xl")}>
        {children}
      </main>
    </div>
  );
}
