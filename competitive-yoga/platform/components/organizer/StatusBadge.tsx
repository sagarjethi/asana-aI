"use client";

import { Badge } from "@/components/ui";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "sun";

const EVENT_TONES: Record<string, BadgeTone> = {
  draft: "neutral",
  open: "sun",
  live: "success",
  complete: "neutral",
};

const ROUND_TONES: Record<string, BadgeTone> = {
  scheduled: "neutral",
  live: "success",
  complete: "neutral",
};

export function EventStatusBadge({ status }: { status?: string }) {
  const s = status ?? "draft";
  return <Badge tone={EVENT_TONES[s] ?? "neutral"}>{s}</Badge>;
}

export function RoundStatusBadge({ status }: { status?: string }) {
  const s = status ?? "scheduled";
  return <Badge tone={ROUND_TONES[s] ?? "neutral"}>{s}</Badge>;
}
