import Dexie, { type EntityTable } from "dexie";
import type { QuizQuestion, QuizTier, Register } from "../content/types";
import { isSharedVocabularyId, vocabularyById } from "../content";
import { PASS_SCORE, nextConfidence } from "../quiz/engine";

export interface PreferenceRecord {
  key: "register" | "welcomeDismissed";
  value: string;
}

export interface MasteryRecord {
  id: string;
  topicId: string;
  sourceId: string;
  register: Register;
  confidence: number;
  correct: number;
  incorrect: number;
  updatedAt: number;
}

export interface AttemptRecord {
  id?: number;
  sessionId: string;
  topicId: string;
  sourceId: string;
  tier: QuizTier;
  register: Register;
  questionId: string;
  response: string;
  correct: boolean;
  nearMiss: boolean;
  answeredAt: number;
}

export interface QuizSessionRecord {
  id: string;
  topicId: string;
  tier: QuizTier;
  seed: number;
  questions: QuizQuestion[];
  currentIndex: number;
  correct: number;
  completed: boolean;
  startedAt: number;
  updatedAt: number;
}

export interface TierProgressRecord {
  id: string;
  topicId: string;
  tier: QuizTier;
  bestScore: number;
  attempts: number;
  passed: boolean;
  completedAt?: number;
}

export const SHARED_MASTERY_TOPIC_ID = "__shared__";

const masteryTopicForSource = (topicId: string, sourceId: string) => {
  if (isSharedVocabularyId(sourceId)) return SHARED_MASTERY_TOPIC_ID;
  return vocabularyById.get(sourceId)?.topicId ?? topicId;
};

const storedMasteryId = (topicId: string, sourceId: string, register: Register) => {
  const owner = masteryTopicForSource(topicId, sourceId);
  return `${owner}:${sourceId}:${register}`;
};

export class LanguageLearnerDatabase extends Dexie {
  preferences!: EntityTable<PreferenceRecord, "key">;
  mastery!: EntityTable<MasteryRecord, "id">;
  attempts!: EntityTable<AttemptRecord, "id">;
  sessions!: EntityTable<QuizSessionRecord, "id">;
  tierProgress!: EntityTable<TierProgressRecord, "id">;

  constructor(name = "language-learner") {
    super(name);
    this.version(4).stores({
      preferences: "&key",
      mastery: "&id, topicId, sourceId, register, [topicId+register], [sourceId+register], confidence, updatedAt",
      attempts: "++id, sessionId, topicId, sourceId, tier, register, answeredAt",
      sessions: "&id, topicId, tier, [topicId+tier], updatedAt",
      tierProgress: "&id, topicId, tier, passed, bestScore"
    });
  }
}

export const db = new LanguageLearnerDatabase();

export const masteryId = (topicId: string, sourceId: string, register: Register) =>
  storedMasteryId(topicId, sourceId, register);

export async function getMasteryMap(topicId: string, register: Register): Promise<Record<string, number>> {
  const [topicRecords, sharedRecords] = await Promise.all([
    db.mastery.where("[topicId+register]").equals([topicId, register]).toArray(),
    db.mastery.where("[topicId+register]").equals([SHARED_MASTERY_TOPIC_ID, register]).toArray()
  ]);
  const records = [...topicRecords, ...sharedRecords];
  return Object.fromEntries(records.map((record) => [record.sourceId, record.confidence]));
}

export async function saveAttempt(
  session: QuizSessionRecord,
  question: QuizQuestion,
  response: string,
  correct: boolean,
  nearMiss: boolean
) {
  const now = Date.now();
  const sourceId = question.sourceId;
  const masteryTopicId = masteryTopicForSource(question.topicId, sourceId);
  const id = masteryId(masteryTopicId, sourceId, question.register);
  await db.transaction("rw", db.attempts, db.mastery, db.sessions, async () => {
    const current = await db.mastery.get(id);
    await db.mastery.put({
      id,
      topicId: masteryTopicId,
      sourceId,
      register: question.register,
      confidence: nextConfidence(current?.confidence ?? 0, correct),
      correct: (current?.correct ?? 0) + (correct ? 1 : 0),
      incorrect: (current?.incorrect ?? 0) + (correct ? 0 : 1),
      updatedAt: now
    });
    await db.attempts.add({
      sessionId: session.id,
      topicId: question.topicId,
      sourceId,
      tier: question.tier,
      register: question.register,
      questionId: question.id,
      response,
      correct,
      nearMiss,
      answeredAt: now
    });
    await db.sessions.put({
      ...session,
      currentIndex: session.currentIndex + 1,
      correct: session.correct + (correct ? 1 : 0),
      updatedAt: now
    });
  });
}

export async function completeSession(session: QuizSessionRecord, finalScore: number) {
  const id = `${session.topicId}:${session.tier}`;
  const now = Date.now();
  await db.transaction("rw", db.sessions, db.tierProgress, async () => {
    const current = await db.tierProgress.get(id);
    await db.sessions.update(session.id, { completed: true, currentIndex: session.questions.length, correct: finalScore, updatedAt: now });
    await db.tierProgress.put({
      id,
      topicId: session.topicId,
      tier: session.tier,
      bestScore: Math.max(current?.bestScore ?? 0, finalScore),
      attempts: (current?.attempts ?? 0) + 1,
      passed: (current?.passed ?? false) || finalScore >= PASS_SCORE,
      completedAt: finalScore >= PASS_SCORE ? now : current?.completedAt
    });
  });
}

export async function latestIncompleteSession() {
  return db.sessions.orderBy("updatedAt").reverse().filter((session) => !session.completed).first();
}

export async function resetAllProgress() {
  await db.transaction("rw", db.mastery, db.attempts, db.sessions, db.tierProgress, async () => {
    await Promise.all([db.mastery.clear(), db.attempts.clear(), db.sessions.clear(), db.tierProgress.clear()]);
  });
}

export async function aggregateStats() {
  const [mastery, attempts, tiers, sessions] = await Promise.all([
    db.mastery.toArray(),
    db.attempts.toArray(),
    db.tierProgress.toArray(),
    db.sessions.filter((session) => session.completed).toArray()
  ]);
  return {
    mastered: mastery.filter((item) => vocabularyById.has(item.sourceId) && item.confidence >= 4).length,
    seen: mastery.filter((item) => vocabularyById.has(item.sourceId)).length,
    correct: attempts.filter((attempt) => attempt.correct).length,
    attempts: attempts.length,
    passedTiers: tiers.filter((tier) => tier.passed).length,
    completedSessions: sessions.length,
    recentAttempts: attempts.filter((attempt) => attempt.answeredAt >= Date.now() - 30 * 24 * 60 * 60 * 1000).length
  };
}
