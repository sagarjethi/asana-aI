"use client";

/**
 * Referee — the officiating console.
 * "AI suggests · the judge confirms." Subscribes to the live SSE stream and
 * renders: live pose angles, a scrolling candidate-deduction feed (approve /
 * override), a per-criterion score panel, and the confidence-state chip.
 */
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type {
  AsanaTemplate,
  CriterionScore,
  Deduction,
  JointAngle,
  LiveEvent,
  ResultRow,
} from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Badge, Stat } from "@/components/ui";
import { DeductionCard } from "@/components/DeductionCard";
import { cn } from "@/lib/utils";

type ConfidenceState = "ok" | "reduced" | "human_only";
type DeductionStatus = "pending" | "approved" | "overridden";

const CONFIDENCE_META: Record<ConfidenceState, { tone: "success" | "warning" | "danger"; label: string }> = {
  ok: { tone: "success", label: "Confidence OK" },
  reduced: { tone: "warning", label: "Reduced confidence" },
  human_only: { tone: "danger", label: "Human only" },
};

function RefereeConsole() {
  const searchParams = useSearchParams();
  const roundId = searchParams.get("roundId");
  const templateIdParam = searchParams.get("templateId");

  const [templateId, setTemplateId] = React.useState<string | null>(templateIdParam);
  const [asana, setAsana] = React.useState<string>("");
  const [roundStatus, setRoundStatus] = React.useState<string>("scheduled");
  const [angles, setAngles] = React.useState<JointAngle[]>([]);
  const [frameT, setFrameT] = React.useState<number>(0);
  const [frameConfidence, setFrameConfidence] = React.useState<number>(1);
  const [confidenceState, setConfidenceState] = React.useState<ConfidenceState>("ok");
  const [deductions, setDeductions] = React.useState<Deduction[]>([]);
  const [statuses, setStatuses] = React.useState<Record<string, DeductionStatus>>({});
  const [criteria, setCriteria] = React.useState<Record<string, CriterionScore>>({});
  const [connected, setConnected] = React.useState(false);
  const performanceIdRef = React.useRef<string>("live");

  // Resolve a templateId to subscribe to (fall back to /api/templates[0] if no param).
  React.useEffect(() => {
    if (templateIdParam) {
      setTemplateId(templateIdParam);
      return;
    }
    let cancelled = false;
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: AsanaTemplate[]) => {
        if (cancelled) return;
        const first = Array.isArray(data) ? data[0] : undefined;
        if (first) {
          setTemplateId(first.id);
          setAsana(first.name);
        } else {
          setTemplateId("natarajasana");
        }
      })
      .catch(() => !cancelled && setTemplateId("natarajasana"));
    return () => {
      cancelled = true;
    };
  }, [templateIdParam]);

  // Open the SSE stream once we have a templateId.
  React.useEffect(() => {
    if (!templateId) return;
    const es = new EventSource(`/api/live?templateId=${encodeURIComponent(templateId)}`);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (msg) => {
      let ev: LiveEvent;
      try {
        ev = JSON.parse(msg.data) as LiveEvent;
      } catch {
        return;
      }
      switch (ev.type) {
        case "round_state":
          setRoundStatus(ev.status);
          setAsana(ev.asana);
          break;
        case "pose_frame_summary":
          setAngles(ev.angles);
          setFrameT(ev.t);
          setFrameConfidence(ev.confidence);
          break;
        case "candidate_deduction":
          setDeductions((prev) => [ev.deduction, ...prev].slice(0, 50));
          break;
        case "criterion_score":
          setCriteria((prev) => ({ ...prev, [ev.score.criterion]: ev.score }));
          break;
        case "judge_override":
          setCriteria((prev) => {
            const cur = prev[ev.criterion];
            return cur
              ? { ...prev, [ev.criterion]: { ...cur, value: ev.value, source: "judge", pending: false } }
              : prev;
          });
          break;
        default:
          break;
      }
    };
    return () => es.close();
  }, [templateId]);

  const postOverride = React.useCallback(
    (criterion: string, value: number, reason: string) => {
      // asanaTemplateId is required by /api/judge/override (read outside the
      // zod schema) so the override can recompute the performance.
      if (!templateId) return;
      fetch("/api/judge/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanaTemplateId: templateId,
          performanceId: performanceIdRef.current,
          criterion,
          value,
          reason,
        }),
      }).catch(() => {
        /* optimistic UI already updated */
      });
    },
    [templateId],
  );

  const handleApprove = React.useCallback((d: Deduction) => {
    setStatuses((prev) => ({ ...prev, [d.id]: "approved" }));
  }, []);

  const handleOverride = React.useCallback(
    (d: Deduction, value: number) => {
      setStatuses((prev) => ({ ...prev, [d.id]: "overridden" }));
      postOverride(d.criterion, value, `Judge override on ${d.ruleId}`);
    },
    [postOverride],
  );

  const [publishing, setPublishing] = React.useState(false);
  const [published, setPublished] = React.useState<ResultRow[] | null>(null);
  const [publishError, setPublishError] = React.useState<string | null>(null);

  const handlePublish = React.useCallback(async () => {
    if (!roundId) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await authFetch(`/api/rounds/${roundId}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Could not publish results.");
      const rows = (await res.json()) as ResultRow[];
      setPublished(rows);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }, [roundId]);

  const cm = CONFIDENCE_META[confidenceState];
  const criterionList = Object.values(criteria);
  const runningTotal = criterionList.reduce((s, c) => s + c.value, 0);
  const pendingCount = deductions.filter((d) => (statuses[d.id] ?? "pending") === "pending").length;

  return (
    <Shell tone="console">
      <div>
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-500">
              Officiating Console
            </p>
            <h1 className="font-display text-3xl font-black text-paper">
              AI suggests · the judge confirms
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              {asana || "—"} · round {roundStatus}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {roundId ? (
              <>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? "Publishing…" : "Publish results"}
                </Button>
                <Link
                  href={`/judge`}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-300 hover:text-white"
                >
                  ← My rounds
                </Link>
              </>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                connected ? "text-emerald-400" : "text-stone-500",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  connected ? "animate-pulse bg-emerald-400" : "bg-stone-600",
                )}
              />
              {connected ? "live" : "offline"}
            </span>
            <Badge tone={cm.tone}>{cm.label}</Badge>
            <div className="hidden gap-1 sm:flex">
              {(["ok", "reduced", "human_only"] as ConfidenceState[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "text-stone-300 hover:bg-console-line",
                    confidenceState === s && "bg-console-line text-paper",
                  )}
                  onClick={() => setConfidenceState(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Live pose angles */}
          <Card tone="console" className="rounded-2xl lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-300">
                Live pose
              </h2>
              <span className="text-xs text-stone-500 tabular-nums">t+{frameT}ms</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat tone="console" label="Frame conf." value={`${Math.round(frameConfidence * 100)}%`} />
              <Stat tone="console" label="Angles" value={angles.length} />
            </div>
            <ul className="mt-4 space-y-1.5">
              {angles.length === 0 ? (
                <li className="text-xs text-stone-500">Waiting for pose frames…</li>
              ) : (
                angles.map((a) => (
                  <li
                    key={a.joint}
                    className="flex items-center justify-between rounded-lg bg-console-bg px-3 py-1.5 text-sm"
                  >
                    <span className="text-stone-300">{a.joint.replace(/_/g, " ")}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-paper">
                        {a.degrees.toFixed(0)}°
                      </span>
                      <span className="text-[11px] text-stone-500 tabular-nums">
                        {Math.round(a.confidence * 100)}%
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>

          {/* Candidate deduction feed */}
          <Card tone="console" className="rounded-2xl lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-300">
                Candidate deductions
              </h2>
              <Badge tone={pendingCount ? "warning" : "neutral"}>{pendingCount} pending</Badge>
            </div>
            <div className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {deductions.length === 0 ? (
                <p className="text-xs text-stone-500">No deductions suggested yet.</p>
              ) : (
                deductions.map((d) => (
                  <DeductionCard
                    key={d.id}
                    deduction={d}
                    status={statuses[d.id] ?? "pending"}
                    onApprove={handleApprove}
                    onOverride={handleOverride}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Per-criterion score panel */}
          <Card tone="console" className="rounded-2xl lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-300">
                Running score
              </h2>
              <span className="font-display text-2xl font-black tabular-nums text-sun-400">
                {runningTotal.toFixed(1)}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {criterionList.length === 0 ? (
                <p className="text-xs text-stone-500">Scores will appear as the round runs.</p>
              ) : (
                criterionList.map((c) => (
                  <div key={c.criterion}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-paper">
                        {c.criterion}
                        <Badge tone={c.source === "judge" ? "sun" : "neutral"}>{c.source}</Badge>
                        {c.pending ? <Badge tone="warning">pending</Badge> : null}
                      </span>
                      <span className="font-semibold tabular-nums text-stone-300">
                        {c.value.toFixed(1)}
                        <span className="text-stone-500"> / {c.maxPoints}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-console-line">
                      <div
                        className="h-full rounded-full bg-sun-500 transition-[width] duration-500"
                        style={{ width: `${Math.min(100, (c.value / (c.maxPoints || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Published results */}
        {publishError ? (
          <p className="mt-4 rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
            {publishError}
          </p>
        ) : null}
        {published ? (
          <Card tone="console" className="mt-4 rounded-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-300">
              Published results
            </h2>
            {published.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No results to publish yet.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {published.map((row) => (
                    <tr key={row.athleteId} className="border-t border-console-line">
                      <td className="py-1.5 pr-2 tabular-nums text-stone-500">#{row.rank}</td>
                      <td className="py-1.5 text-paper">{row.athleteName}</td>
                      <td className="py-1.5 text-right font-semibold tabular-nums text-sun-400">
                        {row.total.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        ) : null}
      </div>
    </Shell>
  );
}

export default function RefereePage() {
  return (
    <React.Suspense
      fallback={
        <Shell tone="console">
          <p className="text-sm text-stone-400">Loading console…</p>
        </Shell>
      }
    >
      <RefereeConsole />
    </React.Suspense>
  );
}
