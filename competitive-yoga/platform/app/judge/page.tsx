"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card } from "@/components/ui";
import { RoundStatusBadge } from "@/components/organizer/StatusBadge";
import type { AsanaTemplate, Round } from "@/lib/contracts";

export default function JudgeRoundsPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [rounds, setRounds] = React.useState<Round[] | null>(null);
  const [templates, setTemplates] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    authFetch("/api/judge/rounds")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Round[]) => setRounds(data))
      .catch(() => setError("Could not load your rounds."));
    authFetch("/api/templates")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: AsanaTemplate[]) =>
        setTemplates(Object.fromEntries(data.map((t) => [t.id, t.name]))),
      )
      .catch(() => {/* names optional */});
  }, [user]);

  if (loading || !user) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-sun-900/60">Loading…</p>
      </Shell>
    );
  }

  return (
    <Shell tone="warm">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun-600">Judge</p>
        <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-ink">My rounds</h1>
        <p className="mt-1 text-sun-900/60">Rounds assigned to you for officiating.</p>
      </header>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 space-y-3">
        {rounds === null && !error ? (
          <p className="text-sm text-sun-900/60">Loading rounds…</p>
        ) : rounds && rounds.length === 0 ? (
          <Card className="rounded-2xl">
            <p className="text-ink/80">No rounds assigned to you yet.</p>
          </Card>
        ) : (
          rounds?.map((r) => {
            const asanaName = templates[r.asanaTemplateId] ?? r.asanaTemplateId;
            const href = `/referee?roundId=${encodeURIComponent(r.id)}&templateId=${encodeURIComponent(r.asanaTemplateId)}`;
            return (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    {r.name || asanaName}
                  </h2>
                  <p className="text-sm text-sun-900/60">
                    {asanaName} · {r.format} · {r.category.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RoundStatusBadge status={r.status} />
                  <Link href={href}>
                    <Button size="sm">Open console →</Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Shell>
  );
}
