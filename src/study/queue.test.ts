import { describe, expect, it } from "vitest";
import type { VocabularyEntry, VocabularyPriority } from "../languages/types";
import { aggregateVocabularyReviewSignals, selectStudyQueue } from "./queue";

const vocabularyEntry = (id: string, priority: VocabularyPriority = "useful"): VocabularyEntry => ({
  id,
  topicId: "topic",
  masteryKey: id,
  primarySceneId: "scene",
  priority,
  meanings: [id],
  baseForm: {
    representations: { target: id },
    aliases: {}
  },
  partOfSpeech: "noun",
  tags: ["domain"]
});

describe("focused study queue selection", () => {
  it("limits a focused queue to 12 cards", () => {
    const vocabulary = Array.from({ length: 20 }, (_, index) => vocabularyEntry(`word-${index}`));
    expect(selectStudyQueue(vocabulary, new Map())).toHaveLength(12);
  });

  it("deduplicates tier records with minimum confidence and the latest attempt time", () => {
    const signals = aggregateVocabularyReviewSignals([
      { sourceId: "weak", confidence: 3, updatedAt: 40 },
      { sourceId: "weak", confidence: 1, updatedAt: 20 },
      { sourceId: "weak", confidence: 2, updatedAt: 60 }
    ]);

    expect(signals).toEqual(new Map([["weak", { confidence: 1, latestAttemptAt: 60 }]]));
  });

  it("places weak words before unseen and stronger words", () => {
    const vocabulary = [
      vocabularyEntry("strong"),
      vocabularyEntry("unseen"),
      vocabularyEntry("weak")
    ];
    const signals = aggregateVocabularyReviewSignals([
      { sourceId: "strong", confidence: 4, updatedAt: 10 },
      { sourceId: "weak", confidence: 1, updatedAt: 20 }
    ]);

    expect(selectStudyQueue(vocabulary, signals).map((entry) => entry.id))
      .toEqual(["weak", "unseen", "strong"]);
  });

  it("orders unseen words by authored priority", () => {
    const vocabulary = [
      vocabularyEntry("reference", "reference"),
      vocabularyEntry("useful", "useful"),
      vocabularyEntry("must-know", "must-know")
    ];

    expect(selectStudyQueue(vocabulary, new Map()).map((entry) => entry.id))
      .toEqual(["must-know", "useful", "reference"]);
  });

  it("falls back to authored order when ranking signals are equal", () => {
    const vocabulary = [
      vocabularyEntry("first"),
      vocabularyEntry("second"),
      vocabularyEntry("third")
    ];
    const signals = aggregateVocabularyReviewSignals(vocabulary.map((entry) => ({
      sourceId: entry.id,
      confidence: 2,
      updatedAt: 10
    })));

    expect(selectStudyQueue(vocabulary, signals).map((entry) => entry.id))
      .toEqual(["first", "second", "third"]);
  });

  it("returns only never-shown cards until the whole scope has been seen", () => {
    const vocabulary = [vocabularyEntry("seen-a"), vocabularyEntry("new-a"), vocabularyEntry("seen-b"), vocabularyEntry("new-b")];
    const shown = new Set(["seen-a", "seen-b"]);
    expect(selectStudyQueue(vocabulary, new Map(), 12, shown).map((entry) => entry.id)).toEqual(["new-a", "new-b"]);
    expect(selectStudyQueue(vocabulary, new Map(), 2, new Set(vocabulary.map((entry) => entry.id)))).toHaveLength(2);
  });
});
