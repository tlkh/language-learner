import { gradeQuestion } from "../quiz/engine";
import type { CharacterItem, LanguagePack, QuizQuestion, Topic } from "./types";

function fixtureTopic(code: string, target: string): Topic {
  return {
    id: `${code}-fixture-topic`,
    title: "Fixture topic",
    shortTitle: "Fixture",
    description: "In-memory compatibility content.",
    categoryId: "fixture",
    collectionId: "fixture",
    scenes: [{ id: "scene", title: "Scene", description: "Fixture scene", vocabularyIds: ["word"], dialogueIds: [], sentencePatternIds: [], responsePatternIds: [] }],
    relatedTopicIds: [],
    sharedVocabularySetIds: [],
    vocabulary: [{ id: "word", topicId: `${code}-fixture-topic`, masteryKey: "word", primarySceneId: "scene", priority: "must-know", meanings: ["fixture"], baseForm: { representations: { target }, aliases: {} }, partOfSpeech: "fixture", tags: ["domain"] }],
    dialogues: [], sentencePatterns: [], responsePatterns: [], quizTierIds: ["recognition"]
  };
}

function makeFixturePack(options: {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  target: string;
  normalize: (value: string) => string;
  characterItems: CharacterItem[];
}): LanguagePack {
  const topic = fixtureTopic(options.code, options.target);
  const question = (variantId: string): QuizQuestion => ({
    id: `${options.code}:question`, languageCode: options.code, topicId: topic.id, sourceId: "word", sceneId: "scene", tierId: "recognition", variantId,
    prompt: "fixture", promptLanguage: "en", canonicalAnswer: options.target, acceptedAnswers: [options.target], answerLanguage: options.locale,
    answerRepresentationId: "target", answerLabel: `${options.name} answer`, answerPlaceholder: "Type answer", helper: ""
  });
  return {
    code: options.code, name: options.name, nativeName: options.nativeName, locale: options.locale, sourceLocale: "en", mark: options.target,
    targetFontFamily: "sans-serif",
    representations: [{ id: "target", label: options.name, languageTag: options.locale }, { id: "glyph", label: "Character", languageTag: options.locale }, { id: "reading", label: "Reading", languageTag: options.locale }],
    speechVariants: [{ id: "standard", label: "Standard" }], defaultSpeechVariantId: "standard",
    presentation: { tagline: "Fixture", welcomeTitle: "Fixture", welcomeDescription: "Fixture", keyboardTitle: "Keyboard", keyboardHelp: "Fixture", startTopicId: topic.id, weakVocabularyTitle: "Weak" },
    tracks: [{ id: "fixture", title: "Fixture", description: "Fixture", topicIds: [topic.id], presentation: "path" }],
    collections: [{ id: "fixture", title: "Fixture", description: "Fixture", topicIds: [topic.id], presentation: "path" }],
    sharedVocabularySets: [], topics: [topic],
    characterCourse: {
      id: "characters", title: "Characters", navLabel: "Characters", description: "Fixture", items: options.characterItems,
      collections: [{ id: "characters", title: "Characters", description: "Fixture", sections: [{ id: "characters", title: "Characters", description: "Fixture", groups: [{ id: "all", title: "All", itemIds: options.characterItems.map((item) => item.id) }] }] }],
      drillModes: [{ id: "recognition", title: "Recognition", description: "Fixture", promptRepresentationId: "glyph", answerRepresentationId: "reading", answerLabel: "Reading", answerPlaceholder: "Type reading" }],
      defaultDrillModeId: "recognition", sessionSizes: [10, 20, "all"]
    },
    normalizeRepresentation: (_id, value) => options.normalize(value), searchNormalizer: options.normalize,
    quiz: {
      tiers: [{ id: "recognition", step: 1, title: "Recognition", shortTitle: "Recognition", description: "Fixture", sessionSize: 1, passScore: 1 }],
      generate: (_topic, generateOptions) => [question(generateOptions.variantId)],
      grade: (quizQuestion, input) => gradeQuestion(quizQuestion, input, options.normalize, options.locale)
    }
  };
}

export const indonesianCompatibilityFixture = makeFixturePack({
  code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", locale: "id", target: "selamat",
  normalize: (value) => value.normalize("NFC").trim().toLocaleLowerCase("id"),
  characterItems: [{ id: "id-ng", representations: { glyph: "ng", reading: "eng" } }]
});

export const vietnameseCompatibilityFixture = makeFixturePack({
  code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", locale: "vi", target: "má",
  normalize: (value) => value.normalize("NFC").trim().toLocaleLowerCase("vi"),
  characterItems: [{ id: "vi-a-acute", representations: { glyph: "á", reading: "á" } }]
});

export const thaiCompatibilityFixture = makeFixturePack({
  code: "th", name: "Thai", nativeName: "ไทย", locale: "th", target: "เก้า",
  normalize: (value) => value.normalize("NFC").trim(),
  characterItems: [
    { id: "th-tone-unit", representations: { glyph: "ก้", reading: "ko kai with mai tho" } },
    { id: "th-positional-vowel", representations: { glyph: "เก", reading: "ke" } }
  ]
});
