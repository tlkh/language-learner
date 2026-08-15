import { describe, expect, it } from "vitest";
import { japanesePack } from "../languages/ja/japanese";
import { hasJapaneseDefinitionContext } from "../languages/ja/definitions";
import { languageCatalog, loadLanguagePack } from "../languages/registry";

describe("language registry", () => {
  it("registers only shipped packs and loads Japanese lazily", async () => {
    expect(languageCatalog.map((entry) => entry.code)).toEqual(["ja"]);
    expect(await loadLanguagePack("ja")).toBe(japanesePack);
    await expect(loadLanguagePack("vi")).rejects.toThrow("Unknown language pack");
  });
});

describe("Japanese language pack", () => {
  it("retains the complete curriculum and pack-owned quiz metadata", () => {
    expect(japanesePack.topics).toHaveLength(16);
    expect(japanesePack.collections).toHaveLength(5);
    expect(japanesePack.topics.flatMap((topic) => topic.scenes)).toHaveLength(48);
    expect(new Set(japanesePack.topics.flatMap((topic) => topic.vocabulary.map((entry) => entry.id))).size).toBe(1374);
    expect(japanesePack.quiz.tiers).toHaveLength(4);
    expect(japanesePack.sharedVocabularySets[0].vocabulary).toHaveLength(40);
    for (const topic of japanesePack.topics) {
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBeGreaterThanOrEqual(80);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(topic.quizTierIds).toEqual(japanesePack.quiz.tiers.map((tier) => tier.id));
      for (const scene of topic.scenes) {
        expect(scene.dialogueIds).toHaveLength(1);
        expect(scene.sentencePatternIds.length).toBeGreaterThanOrEqual(2);
        expect(scene.responsePatternIds.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("generates deterministic, scene-balanced sessions for every tier and speech variant", () => {
    for (const topic of japanesePack.topics) for (const tier of japanesePack.quiz.tiers) for (const variant of japanesePack.speechVariants) {
      const options = { languageCode: "ja", topicId: topic.id, tierId: tier.id, variantId: variant.id, seed: 42, count: tier.sessionSize };
      const first = japanesePack.quiz.generate(topic, options);
      expect(first).toEqual(japanesePack.quiz.generate(topic, options));
      expect(first).toHaveLength(24);
      expect(new Set(first.map((item) => item.id)).size).toBe(24);
      expect(topic.scenes.every((scene) => first.some((question) => question.sceneId === scene.id))).toBe(true);
    }
  });

  it("keeps aircraft terminology canonical to the Aircraft topic", () => {
    const aircraft = japanesePack.topics.find((topic) => topic.id === "aircraft-jsdf")!;
    const aircraftEntries = aircraft.vocabulary.filter((entry) => entry.tags.includes("domain"));
    const aircraftMeanings = new Set(aircraftEntries.flatMap((entry) => entry.meanings));
    const aircraftForms = new Set(aircraftEntries.flatMap((entry) => Object.values(entry.baseForm.representations)));
    const elsewhere = japanesePack.topics.filter((topic) => topic.id !== aircraft.id).flatMap((topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain")));
    expect(elsewhere.flatMap((entry) => entry.meanings).filter((meaning) => aircraftMeanings.has(meaning))).toEqual([]);
    expect(elsewhere.flatMap((entry) => Object.values(entry.baseForm.representations)).filter((form) => aircraftForms.has(form))).toEqual([]);
  });

  it("ships the complete 214-unit kana hierarchy", () => {
    expect(japanesePack.characterCourse.items).toHaveLength(214);
    expect(japanesePack.characterCourse.collections.map((collection) => collection.title)).toEqual(["Hiragana", "Katakana"]);
    for (const collection of japanesePack.characterCourse.collections) {
      expect(collection.sections.map((section) => section.groups.flatMap((group) => group.itemIds).length)).toEqual([46, 25, 36]);
    }
  });

  it("provides authored definition context for every study scene", () => {
    for (const topic of japanesePack.topics) for (const scene of topic.scenes) expect(hasJapaneseDefinitionContext(topic.id, scene.id)).toBe(true);
  });
});
