/**
 * GET /api/results?roundId=... — ranked results for a round (public).
 * Returns ResultRow[] (empty array when roundId is missing/unknown).
 */
import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roundId = searchParams.get("roundId");
  if (!roundId) {
    return NextResponse.json([]);
  }
  return NextResponse.json(store.roundResults(roundId));
}
