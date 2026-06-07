/**
 * Yoga Drishti — Drizzle (node-postgres) schema.
 *
 * Mirrors the domain entities in lib/contracts and spec/03-architecture-data.
 * Hot transactional state lives here; cold artifacts (3D skeleton frames,
 * evidence clips) are referenced by URI. audit_log is append-only + hash-chained.
 *
 * Every table is exported.
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  bigserial,
} from "drizzle-orm/pg-core";
import type {
  Role,
  Format,
  Category,
  Criterion,
  AngleDeviation,
  StabilityMetrics,
} from "@/lib/contracts";

/* ----------------------------------------------------------------------------
 * Identity & auth
 * ------------------------------------------------------------------------- */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull().default("athlete"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ----------------------------------------------------------------------------
 * Competition entities
 * ------------------------------------------------------------------------- */
export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country"),
  /** consent is first-class (spec/09): biometric/data/broadcast scopes */
  consentBiometric: boolean("consent_biometric").notNull().default(false),
  /** limb lengths for body-size-fair normalization */
  anthropometrics: jsonb("anthropometrics").$type<Record<string, number>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  venue: text("venue"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const asanaTemplates = pgTable("asana_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  segmenterLabel: text("segmenter_label"),
  holdSeconds: integer("hold_seconds").notNull().default(20),
  /** full Criterion[] (alignment angle targets, stability, grace) */
  criteria: jsonb("criteria").$type<Criterion[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  format: text("format").$type<Format>().notNull().default("solo"),
  category: text("category").$type<Category>().notNull().default("non_musical"),
  asanaTemplateId: uuid("asana_template_id")
    .notNull()
    .references(() => asanaTemplates.id),
  status: text("status")
    .$type<"scheduled" | "live" | "complete">()
    .notNull()
    .default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const performances = pgTable("performances", {
  id: uuid("id").primaryKey().defaultRandom(),
  roundId: uuid("round_id")
    .notNull()
    .references(() => rounds.id, { onDelete: "cascade" }),
  athleteId: uuid("athlete_id")
    .notNull()
    .references(() => athletes.id),
  /** URI to frozen 3D skeleton frames in cold object store (spec/03) */
  poseFramesUri: text("pose_frames_uri"),
  total: doublePrecision("total"),
  maxTotal: doublePrecision("max_total"),
  confidenceState: text("confidence_state")
    .$type<"ok" | "reduced" | "human_only">()
    .notNull()
    .default("ok"),
  engineVersion: text("engine_version"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ----------------------------------------------------------------------------
 * Scoring outputs
 * ------------------------------------------------------------------------- */
export const criteriaScores = pgTable("criteria_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  performanceId: uuid("performance_id")
    .notNull()
    .references(() => performances.id, { onDelete: "cascade" }),
  criterion: text("criterion").notNull(),
  source: text("source").$type<"machine" | "judge">().notNull(),
  value: doublePrecision("value").notNull(),
  maxPoints: doublePrecision("max_points").notNull(),
  confidence: doublePrecision("confidence").notNull().default(1),
  ruleVersion: text("rule_version").notNull(),
  /** machine suggestion not yet confirmed/overridden by a judge */
  pending: boolean("pending").notNull().default(false),
  /** links live->adjudicated / machine->override (spec/03) */
  supersedes: uuid("supersedes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deductions = pgTable("deductions", {
  id: uuid("id").primaryKey().defaultRandom(),
  performanceId: uuid("performance_id")
    .notNull()
    .references(() => performances.id, { onDelete: "cascade" }),
  /** ms when triggered, relative to round start */
  t: doublePrecision("t").notNull(),
  criterion: text("criterion").notNull(),
  ruleId: text("rule_id").notNull(),
  ruleVersion: text("rule_version").notNull(),
  magnitude: doublePrecision("magnitude").notNull(),
  reason: text("reason").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  abstained: boolean("abstained").notNull().default(false),
  /** §4d explainability: frozen frame ref + per-joint deviations */
  evidence: jsonb("evidence")
    .$type<{ frameT: number; deviations?: AngleDeviation[] }>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stabilityMetrics = pgTable("stability_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  performanceId: uuid("performance_id")
    .notNull()
    .references(() => performances.id, { onDelete: "cascade" }),
  metrics: jsonb("metrics").$type<StabilityMetrics>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ----------------------------------------------------------------------------
 * Append-only, hash-chained audit log (spec/03, spec/09)
 * ------------------------------------------------------------------------- */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** monotonic sequence */
  seq: bigserial("seq", { mode: "number" }),
  actorId: uuid("actor_id"),
  actorRole: text("actor_role").$type<Role>(),
  action: text("action").notNull(),
  subjectType: text("subject_type"),
  subjectId: uuid("subject_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  /** hash-chain link to previous entry */
  prevHash: text("prev_hash"),
  hash: text("hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Convenient inferred row types for callers. */
export type UserRow = typeof users.$inferSelect;
export type AthleteRow = typeof athletes.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type RoundRow = typeof rounds.$inferSelect;
export type AsanaTemplateRow = typeof asanaTemplates.$inferSelect;
export type PerformanceRow = typeof performances.$inferSelect;
export type CriteriaScoreRow = typeof criteriaScores.$inferSelect;
export type DeductionRow = typeof deductions.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
