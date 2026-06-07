/**
 * GET /api/rounds/[id] — round detail: template, performances, results.
 * 404 if the round does not exist.
 */
import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getTemplate } from "@/lib/sample/templates";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const round = store.getRound(params.id);
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  return NextResponse.json({
    round,
    template: getTemplate(round.asanaTemplateId) ?? null,
    performances: store.listPerformancesByRound(params.id),
    results: store.roundResults(params.id),
  });
}
