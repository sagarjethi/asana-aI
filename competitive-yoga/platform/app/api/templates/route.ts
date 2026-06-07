/**
 * GET /api/templates — list all asana templates (demo: static constants).
 */
import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/sample/templates";

export async function GET() {
  return NextResponse.json(TEMPLATES);
}
