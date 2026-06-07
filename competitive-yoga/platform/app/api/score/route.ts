/**
 * POST /api/score — score a performance.
 * Body: { asanaTemplateId, frames } (zScoreRequest). 404 if template unknown.
 * Returns a PerformanceScore from the scoring engine.
 */
import { NextResponse } from "next/server";
import { zScoreRequest, type PoseFrame } from "@/lib/contracts";
import { getTemplate } from "@/lib/sample/templates";
import { scorePerformance } from "@/lib/scoring";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = zScoreRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const template = getTemplate(parsed.data.asanaTemplateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const score = scorePerformance(template, parsed.data.frames as PoseFrame[]);
  return NextResponse.json(score);
}
