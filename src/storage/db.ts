import Dexie, { type EntityTable } from "dexie";
import type {
  LanguageCode,
  QuizQuestion,
  QuizTierId,
  SpeechVariantId
} from "../languages/types";
import { nextConfidence } from "../quiz/engine";

export interface PreferenceRecord {
  key: string;
  value: string;
}

export interface MasteryRecord {
  id: string;
  languageCode: LanguageCode;
  topicId: string;
  sourceId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
  confidence: number;
  correct: number;
  incorrect: number;
  updatedAt: number;
}

export interface AttemptRecord {
  id?: number;
  sessionId: string;
  languageCode: LanguageCode;
  topicId: string;
  sourceId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
  questionId: string;
  response: string;
  correct: boolean;
  nearMiss: boolean;
  answeredAt: number;
}

export interface QuizSessionRecord {
  id: string;
  languageCode: LanguageCode;
  topicId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
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
  languageCode: LanguageCode;
  topicId: string;
  tierId: QuizTierId;
  variantId: SpeechVariantId;
  bestScore: number;
  attempts: number;
  passed: boolean;
  completedAt?: number;
}

export interface CharacterSessionItemState {
  itemId: string;
  attempted: boolean;
  completed: boolean;
  failedAttempts: number;
}

export interface CharacterSessionRecord {
  id: string;
  languageCode: LanguageCode;
  courseId: string;
  drillModeId: string;
  selectedItemIds: string[];
  itemStates: CharacterSessionItemState[];
  seed: number;
  completed: boolean;
  startedAt: number;
  updatedAt: number;
}

export interface CharacterAttemptRecord {
  id?: number;
  sessionId: string;
  languageCode: LanguageCode;
  courseId: string;
  drillModeId: string;
  itemId: string;
  response: string;
  correct: boolean;
  answeredAt: number;
}

export interface CharacterMasteryRecord {
  id: string;
  languageCode: LanguageCode;
  courseId: string;
  drillModeId: string;
  itemId: string;
  cleanStreak: number;
  completedSessions: number;
  firstTryCorrect: number;
  failedAttempts: number;
  mastered: boolean;
  updatedAt: number;
}

export const SHARED_MASTERY_TOPIC_ID = "__shared__";
export const MODULAR_PROGRESS_RESET_KEY = "modularProgressResetPending";

export class LanguageLearnerDatabase extends Dexie {
  preferences!: EntityTable<PreferenceRecord, "key">;
  mastery!: EntityTable<MasteryRecord, "id">;
  attempts!: EntityTable<AttemptRecord, "id">;
  sessions!: EntityTable<QuizSessionRecord, "id">;
  tierProgress!: EntityTable<TierProgressRecord, "id">;
  characterSessions!: EntityTable<CharacterSessionRecord, "id">;
  characterAttempts!: EntityTable<CharacterAttemptRecord, "id">;
  characterMastery!: EntityTable<CharacterMasteryRecord, "id">;

  constructor(name = "language-learner") {
    super(name);
    this.version(4).stores({
      preferences: "&key",
      mastery: "&id, topicId, sourceId, register, [topicId+register], [sourceId+register], confidence, updatedAt",
      attempts: "++id, sessionId, topicId, sourceId, tier, register, answeredAt",
      sessions: "&id, topicId, tier, [topicId+tier], updatedAt",
      tierProgress: "&id, topicId, tier, passed, bestScore"
    });
    this.version(5).stores({
      preferences: "&key",
      mastery: "&id, languageCode, topicId, sourceId, tierId, variantId, [languageCode+topicId+tierId+variantId], [languageCode+sourceId+tierId+variantId], confidence, updatedAt",
      attempts: "++id, sessionId, languageCode, topicId, sourceId, tierId, variantId, answeredAt",
      sessions: "&id, languageCode, topicId, tierId, variantId, [languageCode+topicId+tierId+variantId], updatedAt",
      tierProgress: "&id, languageCode, topicId, tierId, variantId, [languageCode+topicId+tierId+variantId], passed, bestScore",
      characterSessions: "&id, languageCode, courseId, drillModeId, [languageCode+courseId+drillModeId], updatedAt",
      characterAttempts: "++id, sessionId, languageCode, courseId, drillModeId, itemId, answeredAt",
      characterMastery: "&id, languageCode, courseId, drillModeId, itemId, [languageCode+courseId+drillModeId], mastered, updatedAt"
    }).upgrade(async (transaction) => {
      await Promise.all([
        transaction.table("mastery").clear(),
        transaction.table("attempts").clear(),
        transaction.table("sessions").clear(),
        transaction.table("tierProgress").clear()
      ]);
      await transaction.table("preferences").put({ key: MODULAR_PROGRESS_RESET_KEY, value: "1" });
    });
  }
}

export const db = new LanguageLearnerDatabase();

export const masteryId = (
  languageCode: LanguageCode,
  topicId: string,
  sourceId: string,
  tierId: QuizTierId,
  variantId: SpeechVariantId
) => `${languageCode}:${topicId}:${sourceId}:${tierId}:${variantId}`;

export const tierProgressId = (
  languageCode: LanguageCode,
  topicId: string,
  tierId: QuizTierId,
  variantId: SpeechVariantId
) => `${languageCode}:${topicId}:${tierId}:${variantId}`;

export async function getMasteryMap(
  languageCode: LanguageCode,
  topicId: string,
  tierId: QuizTierId,
  variantId: SpeechVariantId
): Promise<Record<string, number>> {
  const [topicRecords, sharedRecords] = await Promise.all([
    db.mastery.where("[languageCode+topicId+tierId+variantId]").equals([languageCode, topicId, tierId, variantId]).toArray(),
    db.mastery.where("[languageCode+topicId+tierId+variantId]").equals([languageCode, SHARED_MASTERY_TOPIC_ID, tierId, variantId]).toArray()
  ]);
  return Object.fromEntries([...topicRecords, ...sharedRecords].map((record) => [record.sourceId, record.confidence]));
}

export async function saveAttempt(
  session: QuizSessionRecord,
  question: QuizQuestion,
  response: string,
  correct: boolean,
  nearMiss: boolean,
  isSharedSource: boolean
) {
  const now = Date.now();
  const topicId = isSharedSource ? SHARED_MASTERY_TOPIC_ID : question.topicId;
  const id = masteryId(question.languageCode, topicId, question.sourceId, question.tierId, question.variantId);
  await db.transaction("rw", db.attempts, db.mastery, db.sessions, async () => {
    const current = await db.mastery.get(id);
    await db.mastery.put({
      id,
      languageCode: question.languageCode,
      topicId,
      sourceId: question.sourceId,
      tierId: question.tierId,
      variantId: question.variantId,
      confidence: nextConfidence(current?.confidence ?? 0, correct),
      correct: (current?.correct ?? 0) + (correct ? 1 : 0),
      incorrect: (current?.incorrect ?? 0) + (correct ? 0 : 1),
      updatedAt: now
    });
    await db.attempts.add({
      sessionId: session.id,
      languageCode: question.languageCode,
      topicId: question.topicId,
      sourceId: question.sourceId,
      tierId: question.tierId,
      variantId: question.variantId,
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

export async function completeSession(session: QuizSessionRecord, finalScore: number, passScore: number) {
  const id = tierProgressId(session.languageCode, session.topicId, session.tierId, session.variantId);
  const now = Date.now();
  await db.transaction("rw", db.sessions, db.tierProgress, async () => {
    const current = await db.tierProgress.get(id);
    await db.sessions.update(session.id, {
      completed: true,
      currentIndex: session.questions.length,
      correct: finalScore,
      updatedAt: now
    });
    await db.tierProgress.put({
      id,
      languageCode: session.languageCode,
      topicId: session.topicId,
      tierId: session.tierId,
      variantId: session.variantId,
      bestScore: Math.max(current?.bestScore ?? 0, finalScore),
      attempts: (current?.attempts ?? 0) + 1,
      passed: (current?.passed ?? false) || finalScore >= passScore,
      completedAt: finalScore >= passScore ? now : current?.completedAt
    });
  });
}

export async function latestIncompleteSession(languageCode: LanguageCode) {
  return db.sessions
    .where("languageCode")
    .equals(languageCode)
    .filter((session) => !session.completed)
    .sortBy("updatedAt")
    .then((sessions) => sessions.at(-1));
}

export async function resetLanguageProgress(languageCode: LanguageCode) {
  await db.transaction(
    "rw",
    [db.mastery, db.attempts, db.sessions, db.tierProgress, db.characterSessions, db.characterAttempts, db.characterMastery],
    async () => {
      await Promise.all([
        db.mastery.where("languageCode").equals(languageCode).delete(),
        db.attempts.where("languageCode").equals(languageCode).delete(),
        db.sessions.where("languageCode").equals(languageCode).delete(),
        db.tierProgress.where("languageCode").equals(languageCode).delete(),
        db.characterSessions.where("languageCode").equals(languageCode).delete(),
        db.characterAttempts.where("languageCode").equals(languageCode).delete(),
        db.characterMastery.where("languageCode").equals(languageCode).delete()
      ]);
    }
  );
}

export async function aggregateStats(languageCode: LanguageCode, vocabularyIds: Set<string>) {
  const [mastery, attempts, tiers, sessions] = await Promise.all([
    db.mastery.where("languageCode").equals(languageCode).toArray(),
    db.attempts.where("languageCode").equals(languageCode).toArray(),
    db.tierProgress.where("languageCode").equals(languageCode).toArray(),
    db.sessions.where("languageCode").equals(languageCode).filter((session) => session.completed).toArray()
  ]);
  const masteredIds = new Set(mastery.filter((item) => vocabularyIds.has(item.sourceId) && item.confidence >= 4).map((item) => item.sourceId));
  const seenIds = new Set(mastery.filter((item) => vocabularyIds.has(item.sourceId)).map((item) => item.sourceId));
  return {
    mastered: masteredIds.size,
    seen: seenIds.size,
    correct: attempts.filter((attempt) => attempt.correct).length,
    attempts: attempts.length,
    passedTiers: tiers.filter((tier) => tier.passed).length,
    completedSessions: sessions.length,
    recentAttempts: attempts.filter((attempt) => attempt.answeredAt >= Date.now() - 30 * 24 * 60 * 60 * 1000).length
  };
}

export const characterMasteryId = (
  languageCode: LanguageCode,
  courseId: string,
  drillModeId: string,
  itemId: string
) => `${languageCode}:${courseId}:${drillModeId}:${itemId}`;

export async function getCharacterMasteryMap(languageCode: LanguageCode, courseId: string, drillModeId: string) {
  const records = await db.characterMastery
    .where("[languageCode+courseId+drillModeId]")
    .equals([languageCode, courseId, drillModeId])
    .toArray();
  return new Map(records.map((record) => [record.itemId, record]));
}

export async function saveCharacterAttempt(
  session: CharacterSessionRecord,
  itemId: string,
  response: string,
  correct: boolean,
  nextStates: CharacterSessionItemState[]
) {
  const now = Date.now();
  await db.transaction("rw", db.characterAttempts, db.characterSessions, async () => {
    await db.characterAttempts.add({
      sessionId: session.id,
      languageCode: session.languageCode,
      courseId: session.courseId,
      drillModeId: session.drillModeId,
      itemId,
      response,
      correct,
      answeredAt: now
    });
    await db.characterSessions.update(session.id, { itemStates: nextStates, updatedAt: now });
  });
}

export async function completeCharacterSession(session: CharacterSessionRecord) {
  const now = Date.now();
  await db.transaction("rw", db.characterSessions, db.characterMastery, async () => {
    for (const state of session.itemStates) {
      if (!state.attempted) continue;
      const id = characterMasteryId(session.languageCode, session.courseId, session.drillModeId, state.itemId);
      const current = await db.characterMastery.get(id);
      const clean = state.completed && state.failedAttempts === 0;
      const cleanStreak = clean ? (current?.cleanStreak ?? 0) + 1 : 0;
      await db.characterMastery.put({
        id,
        languageCode: session.languageCode,
        courseId: session.courseId,
        drillModeId: session.drillModeId,
        itemId: state.itemId,
        cleanStreak,
        completedSessions: (current?.completedSessions ?? 0) + 1,
        firstTryCorrect: (current?.firstTryCorrect ?? 0) + (clean ? 1 : 0),
        failedAttempts: (current?.failedAttempts ?? 0) + state.failedAttempts,
        mastered: cleanStreak >= 3,
        updatedAt: now
      });
    }
    await db.characterSessions.update(session.id, { completed: true, itemStates: session.itemStates, updatedAt: now });
  });
}

export async function latestIncompleteCharacterSession(languageCode: LanguageCode, courseId: string) {
  return db.characterSessions
    .where("languageCode")
    .equals(languageCode)
    .filter((session) => session.courseId === courseId && !session.completed)
    .sortBy("updatedAt")
    .then((sessions) => sessions.at(-1));
}
