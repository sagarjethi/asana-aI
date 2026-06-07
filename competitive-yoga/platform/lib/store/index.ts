/**
 * Yoga Drishti — in-memory product store (the persistent data layer for the
 * end-to-end journeys). Survives across requests AND Next dev HMR via globalThis.
 *
 * This is the demo/runtime backbone so the WHOLE flow works with no Postgres:
 *   organizer creates event → athletes enroll → judge runs round →
 *   performances are scored → results publish → athletes/coaches review.
 *
 * The Drizzle schema in lib/db/schema.ts is the production persistence path;
 * this store is its in-memory equivalent for the pilot demo.
 */
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type {
  Role,
  User,
  CompetitionEvent,
  Round,
  Enrollment,
  Performance,
  PerformanceScore,
  ResultRow,
  Format,
  Category,
} from "@/lib/contracts";
import { TEMPLATES } from "@/lib/sample/templates";

export interface StoredUser extends User {
  passwordHash: string;
}

interface Db {
  users: Map<string, StoredUser>;
  events: Map<string, CompetitionEvent>;
  rounds: Map<string, Round>;
  enrollments: Map<string, Enrollment>;
  performances: Map<string, Performance>;
}

const ts = (i = 0) => new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString();

function publicUser(u: StoredUser): User {
  const { passwordHash, ...rest } = u;
  return rest;
}

function makeStore() {
  const db: Db = {
    users: new Map(),
    events: new Map(),
    rounds: new Map(),
    enrollments: new Map(),
    performances: new Map(),
  };

  /* -------------------------------- users -------------------------------- */
  function createUser(input: {
    email: string;
    name: string;
    role: Role;
    password: string;
    country?: string;
  }): StoredUser {
    const existing = getUserByEmail(input.email);
    if (existing) throw new Error("Email already registered");
    const u: StoredUser = {
      id: `usr_${nanoid(10)}`,
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      country: input.country,
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(input.password, 8),
    };
    db.users.set(u.id, u);
    return u;
  }
  const getUser = (id: string) => db.users.get(id) ?? null;
  const getUserByEmail = (email: string) =>
    [...db.users.values()].find((u) => u.email === email.toLowerCase()) ?? null;
  const listUsers = (role?: Role) =>
    [...db.users.values()].filter((u) => (role ? u.role === role : true)).map(publicUser);
  function verifyCredentials(email: string, password: string): StoredUser | null {
    const u = getUserByEmail(email);
    if (!u) return null;
    return bcrypt.compareSync(password, u.passwordHash) ? u : null;
  }

  /* ------------------------------- events -------------------------------- */
  function createEvent(input: {
    name: string;
    venue?: string;
    description?: string;
    organizerId?: string;
  }): CompetitionEvent {
    const e: CompetitionEvent = {
      id: `evt_${nanoid(8)}`,
      name: input.name,
      venue: input.venue,
      description: input.description,
      organizerId: input.organizerId,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    db.events.set(e.id, e);
    return e;
  }
  const listEvents = () => [...db.events.values()];
  const getEvent = (id: string) => db.events.get(id) ?? null;
  function setEventStatus(id: string, status: CompetitionEvent["status"]) {
    const e = db.events.get(id);
    if (e) e.status = status;
    return e ?? null;
  }

  /* ----------------------------- enrollments ----------------------------- */
  function enroll(eventId: string, athlete: User): Enrollment {
    const dup = [...db.enrollments.values()].find(
      (en) => en.eventId === eventId && en.athleteId === athlete.id && en.status === "enrolled",
    );
    if (dup) return dup;
    const en: Enrollment = {
      id: `enr_${nanoid(8)}`,
      eventId,
      athleteId: athlete.id,
      athleteName: athlete.name,
      status: "enrolled",
      createdAt: new Date().toISOString(),
    };
    db.enrollments.set(en.id, en);
    return en;
  }
  const listEnrollments = (eventId: string) =>
    [...db.enrollments.values()].filter((e) => e.eventId === eventId && e.status === "enrolled");
  const listEnrollmentsForAthlete = (athleteId: string) =>
    [...db.enrollments.values()].filter((e) => e.athleteId === athleteId && e.status === "enrolled");
  function withdraw(enrollmentId: string) {
    const en = db.enrollments.get(enrollmentId);
    if (en) en.status = "withdrawn";
    return en ?? null;
  }

  /* ------------------------------- rounds -------------------------------- */
  function createRound(input: {
    eventId: string;
    name?: string;
    format: Format;
    category: Category;
    asanaTemplateId: string;
    judgeIds?: string[];
  }): Round {
    const r: Round = {
      id: `rnd_${nanoid(8)}`,
      eventId: input.eventId,
      name: input.name,
      format: input.format,
      category: input.category,
      asanaTemplateId: input.asanaTemplateId,
      status: "scheduled",
      judgeIds: input.judgeIds ?? [],
    };
    db.rounds.set(r.id, r);
    return r;
  }
  const listRounds = (eventId: string) =>
    [...db.rounds.values()].filter((r) => r.eventId === eventId);
  const getRound = (id: string) => db.rounds.get(id) ?? null;
  const listRoundsForJudge = (judgeId: string) =>
    [...db.rounds.values()].filter((r) => (r.judgeIds ?? []).includes(judgeId));
  function startRound(id: string) {
    const r = db.rounds.get(id);
    if (r) {
      r.status = "live";
      r.startedAt = new Date().toISOString();
      setEventStatus(r.eventId, "live");
    }
    return r ?? null;
  }
  function completeRound(id: string) {
    const r = db.rounds.get(id);
    if (r) {
      r.status = "complete";
      r.completedAt = new Date().toISOString();
    }
    return r ?? null;
  }

  /* ---------------------------- performances ----------------------------- */
  function createPerformance(roundId: string, athlete: User): Performance {
    const p: Performance = {
      id: `prf_${nanoid(8)}`,
      roundId,
      athleteId: athlete.id,
      athleteName: athlete.name,
      status: "pending",
      performedAt: new Date().toISOString(),
    };
    db.performances.set(p.id, p);
    return p;
  }
  function recordScore(performanceId: string, score: PerformanceScore, scoredBy?: string) {
    const p = db.performances.get(performanceId);
    if (p) {
      p.score = score;
      p.status = "scored";
      p.scoredBy = scoredBy;
    }
    return p ?? null;
  }
  /** Create + score in one step (the athlete "compete" action). */
  function submitScoredPerformance(roundId: string, athlete: User, score: PerformanceScore): Performance {
    const p = createPerformance(roundId, athlete);
    p.score = score;
    p.status = "scored";
    return p;
  }
  const getPerformance = (id: string) => db.performances.get(id) ?? null;
  const listPerformancesByRound = (roundId: string) =>
    [...db.performances.values()].filter((p) => p.roundId === roundId);
  const listPerformancesByAthlete = (athleteId: string) =>
    [...db.performances.values()].filter((p) => p.athleteId === athleteId);
  function publishRound(roundId: string) {
    listPerformancesByRound(roundId).forEach((p) => {
      if (p.status === "scored") p.status = "published";
    });
    completeRound(roundId);
    return roundResults(roundId);
  }

  /* ------------------------------- results ------------------------------- */
  function roundResults(roundId: string): ResultRow[] {
    const scored = listPerformancesByRound(roundId).filter((p) => p.score);
    const rows = scored
      .map((p) => {
        const u = getUser(p.athleteId);
        return {
          athleteId: p.athleteId,
          athleteName: p.athleteName ?? u?.name ?? "Unknown",
          country: u?.country,
          total: p.score!.total,
          performanceId: p.id,
          published: p.status === "published",
          rank: 0,
        } as ResultRow;
      })
      .sort((a, b) => b.total - a.total);
    rows.forEach((r, i) => (r.rank = i + 1));
    return rows;
  }

  /* -------------------------------- seed --------------------------------- */
  function seed() {
    if (db.users.size > 0) return;
    const organizer = createUser({ email: "organizer@yoga.dev", name: "Asha Rao", role: "admin", password: "demo123", country: "IN" });
    const judge = createUser({ email: "judge@yoga.dev", name: "Marcus Hale", role: "head_judge", password: "demo123", country: "GB" });
    createUser({ email: "coach@yoga.dev", name: "Lena Voss", role: "coach", password: "demo123", country: "DE" });
    const athletes = [
      createUser({ email: "saanvi@yoga.dev", name: "Saanvi Patel", role: "athlete", password: "demo123", country: "IN" }),
      createUser({ email: "mei@yoga.dev", name: "Mei Lin", role: "athlete", password: "demo123", country: "CN" }),
      createUser({ email: "amara@yoga.dev", name: "Amara Kim", role: "athlete", password: "demo123", country: "KR" }),
      createUser({ email: "sofia@yoga.dev", name: "Sofia Mendes", role: "athlete", password: "demo123", country: "BR" }),
    ];
    const event = createEvent({
      name: "Yoga Pro League — Spring Open",
      venue: "Mumbai Arena",
      description: "Solo, Non-Musical. Open enrollment.",
      organizerId: organizer.id,
    });
    setEventStatus(event.id, "open");
    createRound({
      eventId: event.id,
      name: "Round 1 — Balance",
      format: "solo",
      category: "non_musical",
      asanaTemplateId: TEMPLATES[0]?.id ?? "natarajasana",
      judgeIds: [judge.id],
    });
    athletes.slice(0, 3).forEach((a) => enroll(event.id, a));
  }

  return {
    publicUser,
    createUser, getUser, getUserByEmail, listUsers, verifyCredentials,
    createEvent, listEvents, getEvent, setEventStatus,
    enroll, listEnrollments, listEnrollmentsForAthlete, withdraw,
    createRound, listRounds, getRound, listRoundsForJudge, startRound, completeRound,
    createPerformance, recordScore, submitScoredPerformance, getPerformance,
    listPerformancesByRound, listPerformancesByAthlete, publishRound,
    roundResults,
    seed,
  };
}

type Store = ReturnType<typeof makeStore>;

const g = globalThis as unknown as { __YD_STORE?: Store };
export const store: Store = (g.__YD_STORE ??= (() => {
  const s = makeStore();
  s.seed();
  return s;
})());
