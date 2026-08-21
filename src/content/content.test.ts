import { describe, expect, it } from "vitest";
import { japanesePack } from "../languages/ja/japanese";
import { hasJapaneseDefinitionContext } from "../languages/ja/definitions";
import { vietnamesePack } from "../languages/vi/vietnamese";
import { thaiPack } from "../languages/th/thai";
import { indonesianPack } from "../languages/id/indonesian";
import { languageCatalog, loadLanguagePack } from "../languages/registry";

describe("language registry", () => {
  it("registers shipped packs and loads them lazily", async () => {
    expect(languageCatalog.map((entry) => entry.code)).toEqual(["ja", "vi", "th", "id"]);
    expect(await loadLanguagePack("ja")).toBe(japanesePack);
    expect(await loadLanguagePack("vi")).toBe(vietnamesePack);
    expect(await loadLanguagePack("th")).toBe(thaiPack);
    expect(await loadLanguagePack("id")).toBe(indonesianPack);
  });
});

describe("Vietnamese language pack", () => {
  it("ships a complete practical curriculum and one standard speech variant", () => {
    expect(vietnamesePack.topics).toHaveLength(17);
    expect(vietnamesePack.collections).toHaveLength(5);
    expect(vietnamesePack.topics.flatMap((topic) => topic.scenes)).toHaveLength(51);
    expect(vietnamesePack.speechVariants).toHaveLength(1);
    expect(vietnamesePack.sharedVocabularySets[0].vocabulary).toHaveLength(48);
    expect(vietnamesePack.characterCourse.items).toHaveLength(46);
    for (const topic of vietnamesePack.topics) {
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBe(24);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(topic.sentencePatterns).toHaveLength(9);
      expect(topic.responsePatterns).toHaveLength(6);
      expect(topic.quizTierIds).toEqual(vietnamesePack.quiz.tiers.map((tier) => tier.id));
      for (const tier of vietnamesePack.quiz.tiers) {
        const questions = vietnamesePack.quiz.generate(topic, { languageCode: "vi", topicId: topic.id, tierId: tier.id, variantId: "standard", seed: 42, count: tier.sessionSize });
        expect(questions).toHaveLength(tier.sessionSize);
        expect(new Set(questions.map((item) => item.id)).size).toBe(tier.sessionSize);
      }
    }
  });

  it("teaches foundational address terms, all six tones, and combined consonants", () => {
    const foundations = vietnamesePack.topics.find((topic) => topic.id === "vietnamese-foundations")!;
    const targets = foundations.vocabulary.filter((entry) => entry.tags.includes("domain")).map((entry) => entry.baseForm.representations.target);
    expect(targets).toEqual(expect.arrayContaining(["tôi", "bạn", "anh", "chị", "em", "dạ", "ạ", "là", "có", "không", "đang", "đã", "sẽ"]));

    const toneItems = vietnamesePack.characterCourse.items.filter((item) => item.id.startsWith("tones-"));
    expect(toneItems.map((item) => item.representations.glyph)).toEqual(["a", "á", "à", "ả", "ã", "ạ"]);
    expect(toneItems.map((item) => item.representations.reading)).toEqual(["ngang", "sắc", "huyền", "hỏi", "ngã", "nặng"]);

    const combined = vietnamesePack.characterCourse.items.filter((item) => item.id.startsWith("combined-consonants-"));
    expect(combined.map((item) => item.representations.glyph)).toEqual(["ch", "gh", "gi", "kh", "ng", "ngh", "nh", "ph", "qu", "th", "tr"]);
  });

  it("separates each written unit's romanized name from its pronunciation hint", () => {
    const breveA = vietnamesePack.characterCourse.items.find((item) => item.representations.glyph === "ă")!;
    expect(breveA.referenceDetails).toEqual([
      { label: "Letter name", value: "a" },
      { label: "Pronunciation hint", value: "short ah, as in father but clipped" }
    ]);
  });

  it("includes Vietnam's emergency numbers and tests meanings instead of pseudo-phonetics", () => {
    const phrases = vietnamesePack.sharedVocabularySets[0].vocabulary.map((entry) => entry.baseForm.representations.target);
    expect(phrases).toEqual(expect.arrayContaining([
      "làm ơn gọi công an theo số 113",
      "làm ơn gọi cứu hỏa theo số 114",
      "làm ơn gọi xe cấp cứu theo số 115"
    ]));

    const topic = vietnamesePack.topics.find((item) => item.id === "greetings-small-talk")!;
    const question = vietnamesePack.quiz.generate(topic, { languageCode: "vi", topicId: topic.id, tierId: "pronunciation-recall", variantId: "standard", seed: 1, count: 1 })[0];
    expect(question.promptLanguage).toBe("vi");
    expect(question.answerLanguage).toBe("en");
    expect(question.answerRepresentationId).toBe("meaning");
  });

  it("preserves Vietnamese tone marks during grading", () => {
    const topic = vietnamesePack.topics.find((item) => item.id === "greetings-small-talk")!;
    const question = vietnamesePack.quiz.generate(topic, { languageCode: "vi", topicId: topic.id, tierId: "word-recall", variantId: "standard", seed: 1, count: 24 })
      .find((item) => item.canonicalAnswer === "tên")!;
    expect(vietnamesePack.quiz.grade(question, "tên").status).toBe("correct");
    expect(vietnamesePack.quiz.grade(question, "ten").status).not.toBe("correct");
  });
});

describe("Thai language pack", () => {
  it("ships a complete practical curriculum and Thai writing course", () => {
    expect(thaiPack.topics).toHaveLength(16);
    expect(thaiPack.collections).toHaveLength(5);
    expect(thaiPack.topics.flatMap((topic) => topic.scenes)).toHaveLength(48);
    expect(thaiPack.speechVariants).toHaveLength(1);
    expect(thaiPack.sharedVocabularySets[0].vocabulary).toHaveLength(40);
    expect(thaiPack.characterCourse.items).toHaveLength(81);
    expect(thaiPack.characterCourse.collections.map((collection) => collection.title)).toEqual(["Thai consonants", "Thai vowels", "Tone marks"]);
    for (const topic of thaiPack.topics) {
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBe(24);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(topic.quizTierIds).toEqual(thaiPack.quiz.tiers.map((tier) => tier.id));
      for (const tier of thaiPack.quiz.tiers) {
        const questions = thaiPack.quiz.generate(topic, { languageCode: "th", topicId: topic.id, tierId: tier.id, variantId: "standard", seed: 42, count: tier.sessionSize });
        expect(questions).toHaveLength(24);
        expect(new Set(questions.map((item) => item.id)).size).toBe(24);
      }
    }
  });

  it("preserves Thai tone marks during grading", () => {
    const topic = thaiPack.topics.find((item) => item.id === "greetings-small-talk")!;
    const question = thaiPack.quiz.generate(topic, { languageCode: "th", topicId: topic.id, tierId: "word-recall", variantId: "standard", seed: 1, count: 24 })
      .find((item) => item.canonicalAnswer === "ร้อน")!;
    expect(thaiPack.quiz.grade(question, "ร้อน").status).toBe("correct");
    expect(thaiPack.quiz.grade(question, "รอน").status).not.toBe("correct");
  });

  it("distinguishes consonant names from initial and final sounds", () => {
    const koKai = thaiPack.characterCourse.items.find((item) => item.representations.glyph === "ก")!;
    expect(koKai.referenceDetails).toEqual([
      { label: "Letter name", value: "ko kai" },
      { label: "Initial sound hint", value: "k, as in skate, with little puff of air" },
      { label: "Final sound hint", value: "a clipped k, as at the end of back" }
    ]);
  });
});

describe("Indonesian language pack", () => {
  it("ships a complete practical curriculum and alphabet course", () => {
    expect(indonesianPack.topics).toHaveLength(16);
    expect(indonesianPack.collections).toHaveLength(5);
    expect(indonesianPack.topics.flatMap((topic) => topic.scenes)).toHaveLength(48);
    expect(indonesianPack.speechVariants).toHaveLength(1);
    expect(indonesianPack.sharedVocabularySets[0].vocabulary).toHaveLength(40);
    expect(indonesianPack.characterCourse.items).toHaveLength(30);
    expect(indonesianPack.characterCourse.collections.map((collection) => collection.title)).toEqual(["Indonesian alphabet", "Common digraphs"]);
    for (const topic of indonesianPack.topics) {
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBe(24);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(topic.quizTierIds).toEqual(indonesianPack.quiz.tiers.map((tier) => tier.id));
      for (const tier of indonesianPack.quiz.tiers) {
        const questions = indonesianPack.quiz.generate(topic, { languageCode: "id", topicId: topic.id, tierId: tier.id, variantId: "standard", seed: 42, count: tier.sessionSize });
        expect(questions).toHaveLength(24);
        expect(new Set(questions.map((item) => item.id)).size).toBe(24);
      }
    }
  });

  it("normalizes Indonesian case without changing the answer", () => {
    const topic = indonesianPack.topics.find((item) => item.id === "greetings-small-talk")!;
    const question = indonesianPack.quiz.generate(topic, { languageCode: "id", topicId: topic.id, tierId: "word-recall", variantId: "standard", seed: 1, count: 24 })
      .find((item) => item.canonicalAnswer === "nama")!;
    expect(indonesianPack.quiz.grade(question, "NAMA").status).toBe("correct");
  });

  it("labels official romanized letter names separately from pronunciation hints", () => {
    const c = indonesianPack.characterCourse.items.find((item) => item.representations.glyph === "c")!;
    expect(c.referenceDetails).toEqual([
      { label: "Letter name", value: "ce" },
      { label: "Pronunciation hint", value: "ch, as in chair" }
    ]);
  });
});

describe("non-Japanese character guidance", () => {
  it("uses basic Latin letter names and avoids IPA notation", () => {
    for (const pack of [vietnamesePack, thaiPack, indonesianPack]) {
      const details = pack.characterCourse.items.flatMap((item) => item.referenceDetails ?? []);
      expect(details.some((detail) => detail.label === "Pronunciation (IPA)")).toBe(false);
      expect(details.filter((detail) => detail.label === "Letter name").every((detail) => /^[\x20-\x7E]+$/.test(detail.value))).toBe(true);
      expect(details.filter((detail) => detail.label.toLowerCase().includes("sound hint") || detail.label === "Pronunciation hint").every((detail) => !/\/[^/]+\//.test(detail.value))).toBe(true);
    }
  });
});

describe("Japanese language pack", () => {
  it("retains the complete curriculum and pack-owned quiz metadata", () => {
    expect(japanesePack.topics).toHaveLength(16);
    expect(japanesePack.collections).toHaveLength(5);
    expect(japanesePack.topics.flatMap((topic) => topic.scenes)).toHaveLength(48);
    expect(new Set(japanesePack.topics.flatMap((topic) => topic.vocabulary.map((entry) => entry.id))).size).toBe(1389);
    expect(japanesePack.quiz.tiers.map((tier) => tier.id)).toEqual(["recognition", "recall", "in-context"]);
    expect(japanesePack.quiz.tiers.every((tier) => tier.sessionSize === 10 && tier.passScore === 8)).toBe(true);
    expect(japanesePack.sharedVocabularySets[0].vocabulary).toHaveLength(40);
    for (const topic of japanesePack.topics) {
      expect(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).length).toBeGreaterThanOrEqual(80);
      expect(topic.dialogues).toHaveLength(3);
      expect(topic.scenes).toHaveLength(3);
      expect(topic.quizTierIds).toEqual(japanesePack.quiz.tiers.map((tier) => tier.id));
      expect(topic.sentencePatterns.every((pattern) => pattern.slotEntryIds.length === 0)).toBe(true);
      expect(topic.responsePatterns.every((pattern) => pattern.slotEntryIds.length === 0)).toBe(true);
      for (const scene of topic.scenes) {
        expect(scene.dialogueIds).toHaveLength(1);
        expect(scene.sentencePatternIds.length).toBeGreaterThanOrEqual(2);
        expect(scene.responsePatternIds.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("keeps additive-label vocabulary in the Food Safety ingredient scene", () => {
    const topic = japanesePack.topics.find((item) => item.id === "food-allergies")!;
    const scene = topic.scenes.find((item) => item.id === "ingredients-cross-contact")!;
    const meanings = new Set(
      scene.vocabularyIds.flatMap((id) => topic.vocabulary.find((entry) => entry.id === id)?.meanings ?? [])
    );

    expect([...meanings]).toEqual(expect.arrayContaining([
      "food additive",
      "additives section",
      "preservative",
      "coloring",
      "sweetener",
      "flavoring",
      "antioxidant",
      "emulsifier",
      "pH regulator"
    ]));
  });

  it("generates deterministic, scene-balanced polite sessions for every checkpoint", () => {
    for (const topic of japanesePack.topics) for (const tier of japanesePack.quiz.tiers) {
      const options = { languageCode: "ja", topicId: topic.id, tierId: tier.id, variantId: "formal", seed: 42, count: tier.sessionSize };
      const first = japanesePack.quiz.generate(topic, options);
      expect(first).toEqual(japanesePack.quiz.generate(topic, options));
      expect(first).toHaveLength(10);
      expect(new Set(first.map((item) => item.id)).size).toBe(10);
      expect(topic.scenes.every((scene) => first.some((question) => question.sceneId === scene.id))).toBe(true);
      expect(first.every((question) => question.variantId === "formal")).toBe(true);
    }
  });

  it("assesses the complete topic vocabulary and uses authored dialogue in context", () => {
    for (const topic of japanesePack.topics) {
      const domainIds = new Set(topic.vocabulary.filter((entry) => entry.tags.includes("domain")).map((entry) => entry.id));
      for (const tierId of ["recognition", "recall"] as const) {
        const pool = japanesePack.quiz.generate(topic, { languageCode: "ja", topicId: topic.id, tierId, variantId: "formal", seed: 1, count: Number.MAX_SAFE_INTEGER });
        expect(new Set(pool.map((question) => question.sourceId))).toEqual(domainIds);
      }
      const authoredLines = new Set(topic.dialogues.flatMap((dialogue) => dialogue.turns.map((turn) => turn.targetTextByVariant.formal)));
      const context = japanesePack.quiz.generate(topic, { languageCode: "ja", topicId: topic.id, tierId: "in-context", variantId: "formal", seed: 1, count: Number.MAX_SAFE_INTEGER });
      expect(context.every((question) => question.kind === "choice" && authoredLines.has(question.canonicalAnswer))).toBe(true);
    }
  });

  it("provides kana readings for every authored polite dialogue line", () => {
    const ideograph = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
    for (const turn of japanesePack.topics.flatMap((topic) => topic.dialogues.flatMap((dialogue) => dialogue.turns))) {
      if (ideograph.test(turn.targetTextByVariant.formal)) {
        expect(turn.targetReadingByVariant?.formal).toBeTruthy();
        expect(turn.targetReadingByVariant?.formal).not.toMatch(ideograph);
      }
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
