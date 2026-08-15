import { describe, expect, it } from "vitest";
import { japanesePack } from "./japanese";
import type { QuizTier, Register } from "./types";
import { generateQuiz, QUIZ_SIZE } from "../quiz/engine";
import { hasJapaneseDefinitionContext } from "./definitions";

const tiers: QuizTier[] = ["romaji-recall", "script-recall", "sentence-production", "response-production"];
const registers: Register[] = ["formal", "informal"];

describe("Japanese language pack", () => {
  it("ships all 16 open topics with complete study material", () => {
    expect(japanesePack.topics).toHaveLength(16);
    expect(japanesePack.collections).toHaveLength(5);
    expect(japanesePack.sharedVocabularySets[0].vocabulary).toHaveLength(40);
    for (const topic of japanesePack.topics) {
      expect(topic.vocabulary.length).toBeGreaterThanOrEqual(120);
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBeGreaterThanOrEqual(80);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(new Set(topic.scenes.flatMap((scene) => scene.vocabularyIds)).size).toBe(
        topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length
      );
      for (const scene of topic.scenes) {
        expect(scene.dialogueIds).toHaveLength(1);
        expect(scene.sentencePatternIds.length).toBeGreaterThanOrEqual(2);
        expect(scene.responsePatternIds.length).toBeGreaterThanOrEqual(2);
      }
      expect(topic.tierAvailability).toEqual(tiers);
      expect(new Set(topic.vocabulary.map((entry) => entry.id)).size).toBe(topic.vocabulary.length);
    }
  });

  it("keeps aircraft terminology canonical to the Aircraft topic", () => {
    const aircraft = japanesePack.topics.find((topic) => topic.id === "aircraft-jsdf")!;
    const aircraftMeanings = new Set(
      aircraft.vocabulary.filter((entry) => entry.tags.includes("domain")).flatMap((entry) => entry.meanings)
    );
    const aircraftForms = new Set(
      aircraft.vocabulary
        .filter((entry) => entry.tags.includes("domain"))
        .flatMap((entry) => [entry.sharedForm.kana, entry.sharedForm.kanji].filter(Boolean))
    );
    const entriesElsewhere = japanesePack.topics
      .filter((topic) => topic.id !== aircraft.id)
      .flatMap((topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain")));
    const meaningsElsewhere = entriesElsewhere.flatMap((entry) => entry.meanings);
    const formsElsewhere = entriesElsewhere.flatMap((entry) => [entry.sharedForm.kana, entry.sharedForm.kanji].filter(Boolean));
    expect(meaningsElsewhere.filter((meaning) => aircraftMeanings.has(meaning))).toEqual([]);
    expect(formsElsewhere.filter((form) => aircraftForms.has(form))).toEqual([]);
  });

  it("provides at least 24 validated candidates for every tier and register", () => {
    for (const topic of japanesePack.topics) {
      for (const tier of tiers) {
        for (const register of registers) {
          const questions = generateQuiz(topic, { topicId: topic.id, tier, register, seed: 42 });
          expect(questions).toHaveLength(QUIZ_SIZE);
          expect(new Set(questions.map((item) => item.id)).size).toBe(QUIZ_SIZE);
          expect(topic.scenes.every((scene) => questions.some((question) => question.sceneId === scene.id))).toBe(true);
        }
      }
    }
  });

  it("uses authored English labels where a natural sentence needs inflection or an article", () => {
    const food = japanesePack.topics.find((topic) => topic.id === "food-allergies")!;
    const emergencies = japanesePack.topics.find((topic) => topic.id === "emergencies-help")!;
    expect(food.sentencePatterns.some((pattern) => Object.values(pattern.slotEnglish ?? {}).includes("peanuts"))).toBe(true);
    expect(emergencies.sentencePatterns.some((pattern) => Object.values(pattern.slotEnglish ?? {}).includes("an ambulance"))).toBe(true);
  });

  it("exposes normalization and quiz generation through the language-pack contract", () => {
    expect(japanesePack.normalizer(" Ａ！ ")).toBe("a");
    expect(japanesePack.quizGenerators.generate(japanesePack.topics[0], {
      topicId: japanesePack.topics[0].id,
      tier: "romaji-recall",
      register: "formal",
      seed: 1
    })).toHaveLength(QUIZ_SIZE);
  });

  it("provides an authored Japanese definition context for every study scene", () => {
    for (const topic of japanesePack.topics) {
      for (const scene of topic.scenes) {
        expect(hasJapaneseDefinitionContext(topic.id, scene.id)).toBe(true);
      }
    }
  });
});
