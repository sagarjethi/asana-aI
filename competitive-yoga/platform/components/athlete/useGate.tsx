"use client";

/**
 * useGate — shared session gate for authenticated journey pages.
 * Redirects to /login once we know there is no user. Returns the session so
 * callers can render a loading state until `ready` is true.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client/auth";

export function useGate() {
  const session = useSession();
  const router = useRouter();
  const { loading, user } = session;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  return { ...session, ready: !loading && !!user };
}
