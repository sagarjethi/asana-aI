/**
 * Yoga Drishti — shared domain contracts.
 *
 * THE single source of truth that every module (scoring, pose, db, api, web)
 * imports from. Do not duplicate these shapes elsewhere — import from "@/lib/contracts".
 *
 * Derived from competitive-yoga/spec (03-architecture-data, 11-validation, 12-api-contracts).
 */
import { z } from "zod";

/* ----------------------------------------------------------------------------
 * Roles & competition structure
 * ------------------------------------------------------------------------- */
export const ROLES = ["athlete", "coach", "referee", "head_judge", "director", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const FORMATS = ["solo", "pair", "group"] as const;
export type Format = (typeof FORMATS)[number];

export const CATEGORIES = ["non_musical", "musical"] as const;
export type Category = (typeof CATEGORIES)[number];

/* ----------------------------------------------------------------------------
 * Pose primitives (monocular MVP: 2D keypoints + score; 3D-ready via optional z)
 * ------------------------------------------------------------------------- */
export type JointName =
  | "nose"
  | "left_shoulder" | "right_shoulder"
  | "left_elbow" | "right_elbow"
  | "left_wrist" | "right_wrist"
  | "left_hip" | "right_hip"
  | "left_knee" | "right_knee"
  | "left_ankle" | "right_ankle";

export interface Keypoint {
  name: JointName;
  x: number;
  y: number;
  z?: number; // present once multi-camera 3D is wired
  score: number; // detector confidence 0..1
}

export interface PoseFrame {
  t: number; // ms relative to round start
  keypoints: Keypoint[];
  /** mean detector confidence across keypoints, 0..1 */
  confidence: number;
}

/** An angle at a joint formed by (a -> vertex -> b). */
export interface JointAngle {
  joint: JointName; // vertex
  degrees: number;
  confidence: number;
}

/* ----------------------------------------------------------------------------
 * Asana templates & scoring criteria
 * A reference form is a DISTRIBUTION of joint-angle targets with tolerance bands
 * (judge-ratified), NOT one golden skeleton. (spec/11)
 * ------------------------------------------------------------------------- */
export interface AngleTarget {
  /** vertex joint */
  joint: JointName;
  /** the two joints that, with `joint`, define the measured angle */
  from: JointName;
  to: JointName;
  /** ideal angle in degrees */
  target: number;
  /** +/- degrees considered fully acceptable (no deduction inside the band) */
  tolerance: number;
  /** weight of this angle in the criterion (0..1, need not sum to 1) */
  weight: number;
}

export interface Criterion {
  key: string; // e.g. "alignment", "stability", "hold"
  label: string;
  maxPoints: number; // e.g. 10
  /** who owns this criterion's score by default */
  source: "machine" | "judge";
  /** angle targets used to compute a machine criterion (alignment) */
  angles?: AngleTarget[];
}

export interface AsanaTemplate {
  id: string;
  name: string; // e.g. "Natarajasana"
  segmenterLabel?: string; // class label from the pose classifier (asana segmenter)
  holdSeconds: number; // required hold duration
  criteria: Criterion[];
}

/* ----------------------------------------------------------------------------
 * Scoring outputs (deterministic, auditable)
 * ------------------------------------------------------------------------- */
export interface AngleDeviation {
  joint: JointName;
  measured: number;
  target: number;
  /** degrees outside the tolerance band (0 if within) */
  deviation: number;
}

export interface StabilityMetrics {
  /** RMS of center-of-mass sway over the hold window (lower = stiller) */
  swayRms: number;
  /** high-frequency jitter energy after subtracting estimator noise */
  microMovement: number;
  /** 0..1, 1 = perfectly still */
  stabilityScore: number;
}

export interface Deduction {
  id: string;
  t: number; // ms when triggered
  criterion: string;
  ruleId: string;
  ruleVersion: string;
  magnitude: number; // points subtracted (positive number)
  reason: string; // plain-English "knee flexed 8° — alignment −0.3"
  confidence: number; // 0..1 calibrated confidence
  abstained: boolean; // true => below confidence floor, deferred to human
  evidence: {
    frameT: number;
    deviations?: AngleDeviation[];
  };
}

export interface CriterionScore {
  criterion: string;
  source: "machine" | "judge";
  value: number; // points awarded (after deductions)
  maxPoints: number;
  confidence: number;
  ruleVersion: string;
  /** machine suggestion the judge has not yet confirmed/overridden */
  pending?: boolean;
}

export interface PerformanceScore {
  performanceId: string;
  asanaTemplateId: string;
  criteria: CriterionScore[];
  deductions: Deduction[];
  stability?: StabilityMetrics;
  total: number;
  maxTotal: number;
  /** confidence state drives graceful degradation in the UI (spec/02) */
  confidenceState: "ok" | "reduced" | "human_only";
  engineVersion: string;
}

/* ----------------------------------------------------------------------------
 * Domain entities (mirror the Drizzle schema in lib/db/schema.ts)
 * ------------------------------------------------------------------------- */
export interface Athlete {
  id: string;
  name: string;
  country?: string;
  consentBiometric: boolean;
}

export interface CompetitionEvent {
  id: string;
  name: string;
  venue?: string;
  description?: string;
  organizerId?: string;
  status?: "draft" | "open" | "live" | "complete";
  createdAt: string;
}

export interface Round {
  id: string;
  eventId: string;
  name?: string;
  format: Format;
  category: Category;
  asanaTemplateId: string;
  status: "scheduled" | "live" | "complete";
  judgeIds?: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface Performance {
  id: string;
  roundId: string;
  athleteId: string;
  athleteName?: string;
  status?: "pending" | "scored" | "published";
  score?: PerformanceScore;
  performedAt?: string;
  scoredBy?: string;
}

export interface LeaderboardRow {
  athleteId: string;
  athleteName: string;
  country?: string;
  total: number;
  rank: number;
}

/* ----------------------------------------------------------------------------
 * Live event stream (SSE/WebSocket) — discriminated union (spec/12)
 * ------------------------------------------------------------------------- */
export type LiveEvent =
  | { type: "round_state"; seq: number; roundId: string; status: Round["status"]; asana: string }
  | { type: "pose_frame_summary"; seq: number; t: number; confidence: number; angles: JointAngle[] }
  | { type: "candidate_deduction"; seq: number; deduction: Deduction }
  | { type: "criterion_score"; seq: number; score: CriterionScore }
  | { type: "judge_override"; seq: number; criterion: string; value: number; judgeId: string; reason: string }
  | { type: "leaderboard_update"; seq: number; rows: LeaderboardRow[] };

/* ----------------------------------------------------------------------------
 * Zod schemas for API validation (request bodies)
 * ------------------------------------------------------------------------- */
export const zKeypoint = z.object({
  name: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  score: z.number().min(0).max(1),
});

export const zPoseFrame = z.object({
  t: z.number(),
  keypoints: z.array(zKeypoint),
  confidence: z.number().min(0).max(1),
});

export const zScoreRequest = z.object({
  asanaTemplateId: z.string(),
  frames: z.array(zPoseFrame).min(1),
});

export const zJudgeOverride = z.object({
  performanceId: z.string(),
  criterion: z.string(),
  value: z.number().min(0),
  reason: z.string().min(1),
});

export const zLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ScoreRequest = z.infer<typeof zScoreRequest>;
export type JudgeOverrideRequest = z.infer<typeof zJudgeOverride>;

/* ----------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
export const ENGINE_VERSION = "0.1.0";
/** Measurement noise floor — never deduct on differences below this (spec/11). */
export const NOISE_FLOOR_DEGREES = 5;
/** Below this calibrated confidence, the engine abstains and defers to the human. */
export const CONFIDENCE_ABSTAIN_THRESHOLD = 0.6;

/* ----------------------------------------------------------------------------
 * Product layer — accounts, enrollment, results (the end-to-end journeys)
 * ------------------------------------------------------------------------- */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  country?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface Enrollment {
  id: string;
  eventId: string;
  athleteId: string;
  athleteName: string;
  seed?: number;
  status: "enrolled" | "withdrawn";
  createdAt: string;
}

/** A ranked result row for a round or event (extends the live leaderboard row). */
export interface ResultRow extends LeaderboardRow {
  performanceId?: string;
  published?: boolean;
}

/* zod request schemas for the product APIs */
export const zSignup = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(ROLES),
  country: z.string().optional(),
});

export const zCreateEvent = z.object({
  name: z.string().min(1),
  venue: z.string().optional(),
  description: z.string().optional(),
});

export const zCreateRound = z.object({
  eventId: z.string(),
  name: z.string().optional(),
  format: z.enum(FORMATS),
  category: z.enum(CATEGORIES),
  asanaTemplateId: z.string(),
});

export const zEnroll = z.object({
  eventId: z.string(),
});

/** Submit a performance for scoring inside a live round. */
export const zPerform = z.object({
  roundId: z.string(),
  frames: z.array(zPoseFrame).min(1),
});

export type SignupRequest = z.infer<typeof zSignup>;
export type CreateEventRequest = z.infer<typeof zCreateEvent>;
export type CreateRoundRequest = z.infer<typeof zCreateRound>;
