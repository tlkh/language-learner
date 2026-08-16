import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import { japanesePack } from "../languages/ja/japanese";
import {
  MODULAR_PROGRESS_RESET_KEY,
  LanguageLearnerDatabase,
  completeCharacterSession,
  completeSession,
  db,
  latestIncompleteSession,
  masteryId,
  resetLanguageProgress,
  saveAttempt,
  type CharacterSessionRecord,
  type QuizSessionRecord
} from "./db";

const topic = japanesePack.topics[0];

const makeSession = (id: string, languageCode = "ja"): QuizSessionRecord => {
  const questions = japanesePack.quiz.generate(topic, { languageCode: "ja", topicId: topic.id, tierId: "romaji-recall", variantId: "formal", seed: 123 });
  return {
    id,
    languageCode,
    topicId: topic.id,
    tierId: "romaji-recall",
    variantId: "formal",
    seed: 123,
    questions: questions.map((question) => ({ ...question, languageCode })),
    currentIndex: 0,
    correct: 0,
    completed: false,
    startedAt: Date.now(),
    updatedAt: Date.now()
  };
};

const characterSession = (id: string, failedAttempts = 0, attempted = true): CharacterSessionRecord => ({
  id,
  languageCode: "ja",
  courseId: "kana",
  drillModeId: "recognition",
  selectedItemIds: ["hiragana-main-a-1"],
  itemStates: [{ itemId: "hiragana-main-a-1", attempted, completed: attempted, failedAttempts }],
  seed: 1,
  completed: false,
  startedAt: Date.now(),
  updatedAt: Date.now()
});

afterEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe("language-scoped device progress", () => {
  it("opens the modular IndexedDB schema", () => {
    expect(db.verno).toBe(6);
    expect(db.tables.map((table) => table.name)).toEqual(expect.arrayContaining(["studyProgress", "characterSessions", "characterAttempts", "characterMastery"]));
  });

  it("atomically records a scoped attempt, confidence, and resumable position", async () => {
    const session = makeSession("resume-me");
    await db.sessions.put(session);
    await saveAttempt(session, session.questions[0], "wrong", false, false, false);
    const resumed = await latestIncompleteSession("ja");
    const mastery = await db.mastery.get(masteryId("ja", topic.id, session.questions[0].sourceId, "romaji-recall", "formal"));
    expect(resumed?.id).toBe(session.id);
    expect(resumed?.currentIndex).toBe(1);
    expect(mastery?.incorrect).toBe(1);
  });

  it("isolates sessions and reset operations by language", async () => {
    await db.sessions.bulkPut([makeSession("ja-session"), makeSession("id-session", "id")]);
    expect((await latestIncompleteSession("ja"))?.id).toBe("ja-session");
    expect((await latestIncompleteSession("id"))?.id).toBe("id-session");
    await resetLanguageProgress("ja");
    expect(await db.sessions.get("ja-session")).toBeUndefined();
    expect(await db.sessions.get("id-session")).toBeDefined();
  });

  it("uses pack pass scores and speech-variant namespaced tier records", async () => {
    const failed = makeSession("failed");
    await db.sessions.put(failed);
    await completeSession(failed, 19, 20);
    const id = `ja:${topic.id}:romaji-recall:formal`;
    expect((await db.tierProgress.get(id))?.passed).toBe(false);
    const passed = makeSession("passed");
    await db.sessions.put(passed);
    await completeSession(passed, 20, 20);
    expect(await db.tierProgress.get(id)).toMatchObject({ passed: true, bestScore: 20, attempts: 2, variantId: "formal" });
  });

  it("requires three clean character sessions and resets the streak after a failure", async () => {
    await completeCharacterSession(characterSession("clean-1"));
    await completeCharacterSession(characterSession("clean-2"));
    let mastery = await db.characterMastery.get("ja:kana:recognition:hiragana-main-a-1");
    expect(mastery).toMatchObject({ cleanStreak: 2, mastered: false });
    await completeCharacterSession(characterSession("failed", 1));
    mastery = await db.characterMastery.get("ja:kana:recognition:hiragana-main-a-1");
    expect(mastery).toMatchObject({ cleanStreak: 0, mastered: false, failedAttempts: 1 });
    await completeCharacterSession(characterSession("clean-3"));
    await completeCharacterSession(characterSession("clean-4"));
    await completeCharacterSession(characterSession("clean-5"));
    mastery = await db.characterMastery.get("ja:kana:recognition:hiragana-main-a-1");
    expect(mastery).toMatchObject({ cleanStreak: 3, mastered: true });
  });

  it("does not alter character mastery for unattempted items", async () => {
    await completeCharacterSession(characterSession("unattempted", 0, false));
    expect(await db.characterMastery.count()).toBe(0);
  });
});

describe("schema upgrade", () => {
  it("clears legacy progress, preserves compatible preferences, and sets the reset notice", async () => {
    const name = `language-upgrade-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(4).stores({
      preferences: "&key",
      mastery: "&id, topicId, sourceId, register",
      attempts: "++id, sessionId",
      sessions: "&id, topicId, tier",
      tierProgress: "&id, topicId, tier"
    });
    await legacy.open();
    await legacy.table("preferences").put({ key: "theme", value: "system" });
    await legacy.table("sessions").put({ id: "old", topicId: "old", tier: "old" });
    legacy.close();

    const upgraded = new LanguageLearnerDatabase(name);
    await upgraded.open();
    expect(await upgraded.sessions.count()).toBe(0);
    expect(await upgraded.preferences.get("theme")).toEqual({ key: "theme", value: "system" });
    expect((await upgraded.preferences.get(MODULAR_PROGRESS_RESET_KEY))?.value).toBe("1");
    upgraded.close();
    await Dexie.delete(name);
  });
});
