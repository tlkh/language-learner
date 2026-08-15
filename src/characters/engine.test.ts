import { describe, expect, it } from "vitest";
import { japanesePack } from "../languages/ja/japanese";
import type { CharacterMasteryRecord } from "../storage/db";
import { firstTryScore, gradeCharacterAnswer, selectCharacterItems } from "./engine";

const masteryRecord = (itemId: string, cleanStreak: number, mastered = false): CharacterMasteryRecord => ({
  id: `ja:kana:recognition:${itemId}`, languageCode: "ja", courseId: "kana", drillModeId: "recognition", itemId,
  cleanStreak, completedSessions: cleanStreak, firstTryCorrect: cleanStreak, failedAttempts: 0, mastered, updatedAt: 1
});

describe("character session selection", () => {
  const ids = japanesePack.characterCourse.items.slice(0, 30).map((item) => item.id);

  it("samples 10, 20, all, and fewer-than-requested sets", () => {
    expect(selectCharacterItems(ids, 10, new Map(), 1)).toHaveLength(10);
    expect(selectCharacterItems(ids, 20, new Map(), 1)).toHaveLength(20);
    expect(selectCharacterItems(ids, "all", new Map(), 1)).toHaveLength(30);
    expect(selectCharacterItems(ids.slice(0, 7), 10, new Map(), 1)).toHaveLength(7);
  });

  it("prioritizes unmastered and lower-streak characters before deterministic ties", () => {
    const mastery = new Map<string, CharacterMasteryRecord>(ids.map((id, index) => [id, masteryRecord(id, index < 5 ? 3 : 1, index < 5)]));
    const first = selectCharacterItems(ids, 10, mastery, 99);
    expect(first.every((id) => !mastery.get(id)?.mastered)).toBe(true);
    expect(first).toEqual(selectCharacterItems(ids, 10, mastery, 99));
  });

  it("accepts canonical romaji and explicit aliases", () => {
    const shi = japanesePack.characterCourse.items.find((item) => item.representations.romanization === "shi")!;
    expect(gradeCharacterAnswer(japanesePack, shi, "romanization", "SHI")).toBe(true);
    expect(gradeCharacterAnswer(japanesePack, shi, "romanization", "si")).toBe(true);
  });

  it("calculates first-try recall independently of later recovery", () => {
    expect(firstTryScore([{ completed: true, failedAttempts: 0 }, { completed: true, failedAttempts: 2 }, { completed: false, failedAttempts: 0 }])).toBe(1);
  });
});
