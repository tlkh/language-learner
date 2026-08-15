import { afterEach, describe, expect, it } from "vitest";
import { japanesePack } from "../content";
import { generateQuiz } from "../quiz/engine";
import {
  completeSession,
  db,
  latestIncompleteSession,
  masteryId,
  saveAttempt,
  type QuizSessionRecord
} from "./db";

const topic = japanesePack.topics[0];

const makeSession = (id: string): QuizSessionRecord => ({
  id,
  topicId: topic.id,
  tier: "romaji-recall",
  seed: 123,
  questions: generateQuiz(topic, { topicId: topic.id, tier: "romaji-recall", register: "formal", seed: 123 }),
  currentIndex: 0,
  correct: 0,
  completed: false,
  startedAt: Date.now(),
  updatedAt: Date.now()
});

afterEach(async () => {
  await Promise.all([
    db.preferences.clear(),
    db.mastery.clear(),
    db.attempts.clear(),
    db.sessions.clear(),
    db.tierProgress.clear()
  ]);
});

describe("device-only progress", () => {
  it("opens the current versioned IndexedDB schema", () => {
    expect(db.verno).toBe(4);
  });

  it("atomically records an attempt, confidence, and resumable position", async () => {
    const session = makeSession("resume-me");
    await db.sessions.put(session);
    await saveAttempt(session, session.questions[0], "wrong", false, false);

    const resumed = await latestIncompleteSession();
    const mastery = await db.mastery.get(masteryId(topic.id, session.questions[0].sourceId, "formal"));
    expect(resumed?.id).toBe(session.id);
    expect(resumed?.currentIndex).toBe(1);
    expect(await db.attempts.where("sessionId").equals(session.id).count()).toBe(1);
    expect(mastery?.confidence).toBe(0);
    expect(mastery?.incorrect).toBe(1);
  });

  it("unlocks at 20/24 but not 19/24", async () => {
    const failed = makeSession("failed");
    await db.sessions.put(failed);
    await completeSession(failed, 19);
    expect((await db.tierProgress.get(`${topic.id}:romaji-recall`))?.passed).toBe(false);

    const passed = makeSession("passed");
    await db.sessions.put(passed);
    await completeSession(passed, 20);
    const progress = await db.tierProgress.get(`${topic.id}:romaji-recall`);
    expect(progress?.passed).toBe(true);
    expect(progress?.bestScore).toBe(20);
    expect(progress?.attempts).toBe(2);
  });
});
