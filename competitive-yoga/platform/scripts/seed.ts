/**
 * Yoga Drishti — database seed.
 *
 * Idempotent-ish demo seed. When a DATABASE_URL is configured (`hasDb`), it
 * inserts the asana TEMPLATES plus a few sample athletes, an event, and rounds
 * via Drizzle. When no database is configured it prints a friendly note and
 * exits cleanly — the pilot runs entirely in-memory in demo mode.
 *
 * Typecheck-clean WITHOUT a database: all DB work is dynamically gated behind
 * `hasDb`, so `tsc --noEmit` and a DB-less environment never touch the pool.
 *
 * Run with:  npm run db:seed   (tsx scripts/seed.ts)
 */
import { hasDb, db, schema, closeDb } from "@/lib/db";
import { TEMPLATES } from "@/lib/sample/templates";

const SAMPLE_ATHLETES = [
  { name: "Ananya Rao", country: "IN", consentBiometric: true },
  { name: "Mei Lin", country: "CN", consentBiometric: true },
  { name: "Sofia Costa", country: "BR", consentBiometric: true },
  { name: "Lena Müller", country: "DE", consentBiometric: false },
];

async function main(): Promise<void> {
  if (!hasDb) {
    console.log("demo mode — no seed needed (set DATABASE_URL to seed Postgres)");
    return;
  }

  console.log("Seeding Yoga Drishti database…");

  // 1) Asana templates (carry the full Criterion[] as jsonb).
  const insertedTemplates = await db
    .insert(schema.asanaTemplates)
    .values(
      TEMPLATES.map((t) => ({
        name: t.name,
        segmenterLabel: t.segmenterLabel,
        holdSeconds: t.holdSeconds,
        criteria: t.criteria,
      })),
    )
    .returning({ id: schema.asanaTemplates.id });
  console.log(`  • ${insertedTemplates.length} asana templates`);

  // 2) Athletes.
  const insertedAthletes = await db
    .insert(schema.athletes)
    .values(SAMPLE_ATHLETES)
    .returning({ id: schema.athletes.id });
  console.log(`  • ${insertedAthletes.length} athletes`);

  // 3) One event.
  const [event] = await db
    .insert(schema.events)
    .values({ name: "Pilot Invitational 2026", venue: "Studio A" })
    .returning({ id: schema.events.id });
  console.log(`  • 1 event (${event?.id ?? "?"})`);

  // 4) A round per template (scheduled), linked to the event.
  if (event) {
    const rounds = insertedTemplates.map((tpl) => ({
      eventId: event.id,
      asanaTemplateId: tpl.id,
      format: "solo" as const,
      category: "non_musical" as const,
      status: "scheduled" as const,
    }));
    const insertedRounds = await db
      .insert(schema.rounds)
      .values(rounds)
      .returning({ id: schema.rounds.id });
    console.log(`  • ${insertedRounds.length} rounds`);
  }

  console.log("Seed complete.");
}

main()
  .then(() => closeDb())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await closeDb();
    process.exitCode = 1;
  });
