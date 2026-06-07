"use client";

/**
 * Athlete — Practice (stateless).
 * Pick a template, POST deterministic sample frames to /api/score, and render
 * an explainable result (ScoreRing + per-criterion bars + "Show me why"
 * deductions). No camera needed. Re-run to take again.
 */
import * as React from "react";
import type { AsanaTemplate, PerformanceScore, PoseFrame } from "@/lib/contracts";
import { authFetch } from "@/lib/client/auth";
import { Shell } from "@/components/app/Shell";
import { Button, Card } from "@/components/ui";
import { ScoreDetail } from "@/components/athlete/ScoreDetail";
import { CameraPose } from "@/components/athlete/CameraPose";
import { useGate } from "@/components/athlete/useGate";
import { sampleFrames } from "@/lib/sample/keypoints";

type Mode = "demo" | "live";

export default function PracticePage() {
  const { ready } = useGate();
  const [templates, setTemplates] = React.useState<AsanaTemplate[]>([]);
  const [templateId, setTemplateId] = React.useState<string>("");
  const [score, setScore] = React.useState<PerformanceScore | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("demo");

  React.useEffect(() => {
    if (!ready) return;
    authFetch("/api/templates")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: AsanaTemplate[]) => {
        const list = Array.isArray(data) ? data : [];
        setTemplates(list);
        setTemplateId((cur) => cur || list[0]?.id || "natarajasana");
      })
      .catch(() => {
        setTemplates([]);
        setTemplateId((cur) => cur || "natarajasana");
      });
  }, [ready]);

  const scoreFrames = React.useCallback(async (id: string, frames: PoseFrame[]) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/score", {
        method: "POST",
        body: JSON.stringify({ asanaTemplateId: id, frames }),
      });
      if (!res.ok) throw new Error(`score failed (${res.status})`);
      setScore(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const runDemo = React.useCallback(
    (id: string) => scoreFrames(id, sampleFrames(id)),
    [scoreFrames],
  );

  if (!ready) {
    return (
      <Shell tone="warm">
        <p className="text-sm text-stone-400">Loading…</p>
      </Shell>
    );
  }

  const currentName =
    templates.find((t) => t.id === templateId)?.name ?? templateId ?? "—";

  return (
    <Shell tone="warm">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-600">Practice</p>
          <h1 className="mt-1 font-display text-4xl font-black text-ink">{currentName}</h1>
          <p className="mt-1 text-sm text-sun-900/70">
            AI measures every pose. Run a practice take to see your explainable score.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col text-xs font-medium text-stone-500">
            Asana
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setScore(null);
              }}
              className="mt-1 h-10 rounded-lg border border-sun-200 bg-white/80 px-3 text-sm text-ink outline-none focus:border-sun-500"
            >
              {templates.length === 0 ? (
                <option value="natarajasana">Natarajasana</option>
              ) : (
                templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </label>
          {mode === "demo" ? (
            <Button size="lg" disabled={loading || !templateId} onClick={() => runDemo(templateId)}>
              {loading ? "Scoring…" : score ? "Practice again" : "Start practice"}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-5 inline-flex rounded-lg border border-sun-200 bg-white/70 p-1">
        {(["demo", "live"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setScore(null);
              setError(null);
            }}
            className={
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors " +
              (mode === m
                ? "bg-sun-600 text-white shadow-sm"
                : "text-sun-800 hover:bg-sun-100")
            }
          >
            {m === "demo" ? "Demo (sample)" : "Live camera"}
          </button>
        ))}
      </div>

      {error ? (
        <Card className="mt-6 rounded-2xl border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {mode === "live" ? (
        <div className="mt-6">
          <CameraPose
            key={templateId}
            templateId={templateId}
            busy={loading}
            onScore={(frames) => scoreFrames(templateId, frames)}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {score ? (
          <ScoreDetail score={score} />
        ) : (
          <Card className="rounded-2xl">
            <p className="text-sm text-stone-400">
              {loading
                ? "Scoring your take…"
                : mode === "live"
                  ? "Start the camera, hold the pose, then capture & score."
                  : "Pick an asana and start a practice run."}
            </p>
          </Card>
        )}
      </div>
    </Shell>
  );
}
