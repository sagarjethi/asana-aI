/**
 * POST /api/judge/override — a referee/head_judge overrides a criterion value.
 * Auth: bearer JWT with role referee|head_judge (401 otherwise).
 * Body: zJudgeOverride + asanaTemplateId (required, read manually since the zod
 * schema does not model it). Recomputes the performance from sample frames with
 * the override applied and returns the resulting PerformanceScore.
 */
import { NextResponse } from "next/server";
import { zJudgeOverride } from "@/lib/contracts";
import { requireRole } from "@/lib/auth";
import { getTemplate } from "@/lib/sample/templates";
import { scorePerformance } from "@/lib/scoring";
import { sampleFrames } from "@/lib/sample/keypoints";

export async function POST(req: Request) {
  const auth = requireRole(req, ["referee", "head_judge"]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zJudgeOverride.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  // asanaTemplateId is not part of zJudgeOverride — read it directly.
  const asanaTemplateId =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).asanaTemplateId
      : undefined;
  if (typeof asanaTemplateId !== "string" || asanaTemplateId.length === 0) {
    return NextResponse.json(
      { error: "asanaTemplateId is required" },
      { status: 400 },
    );
  }

  const template = getTemplate(asanaTemplateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const frames = sampleFrames(template.id);
  const score = scorePerformance(template, frames, {
    judgeOverrides: { [parsed.data.criterion]: parsed.data.value },
  });
  return NextResponse.json(score);
}
