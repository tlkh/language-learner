import type { LanguagePack, VocabularyGroup } from "../types";
import { japaneseCharacterCourse } from "./characters";
import { collections, ESSENTIAL_PHRASE_SET_ID } from "./curriculum";
import { definitionsForVocabulary } from "./definitions";
import { essentialPhraseVocabulary } from "./helpers";
import { generateQuiz, gradeAnswer, normalizeAnswer, quizTiers } from "./quiz";
import { essentialTopics } from "./topics-essentials";
import { practicalTopics } from "./topics-practical";
import { transitTopics } from "./topics-transit";

const topics = [...essentialTopics, ...transitTopics, ...practicalTopics];

const phraseGroup = (id: string, title: string, description: string, start: number, end: number): VocabularyGroup => ({
  id,
  title,
  description,
  entryIds: essentialPhraseVocabulary.slice(start, end).map((entry) => entry.id)
});

export const japanesePack: LanguagePack = {
  code: "ja",
  name: "Japanese",
  nativeName: "日本語",
  locale: "ja",
  sourceLocale: "en",
  mark: "あ",
  targetFontFamily: "var(--font-japanese)",
  representations: [
    { id: "target", label: "Japanese", languageTag: "ja", inputMode: "target-script" },
    { id: "reading", label: "Kana", languageTag: "ja", inputMode: "target-script" },
    { id: "glyph", label: "Kana unit", languageTag: "ja", inputMode: "target-script" },
    { id: "romanization", label: "Romaji", languageTag: "en", inputMode: "latin" }
  ],
  speechVariants: [
    {
      id: "formal",
      label: "Formal",
      nativeLabel: "丁寧",
      compactNativeLabel: "丁寧",
      description: "Polite Japanese is the safe default with staff and strangers."
    },
    {
      id: "informal",
      label: "Casual",
      nativeLabel: "カジュアル",
      compactNativeLabel: "普通",
      description: "Casual forms are for friends and recognition."
    }
  ],
  defaultSpeechVariantId: "formal",
  presentation: {
    tagline: "Practical Japanese for the moments that matter—ready when the signal disappears.",
    welcomeTitle: "Japanese, ready for the trip",
    welcomeDescription: "For Japanese-answer quizzes, add the Japanese keyboard in your phone or computer settings. Romaji answers are accepted only in the first tier.",
    keyboardTitle: "Japanese keyboard",
    keyboardHelp: "On iPhone: Settings → General → Keyboard → Keyboards → Add New Keyboard → Japanese. Choose Kana or Romaji input.",
    startTopicId: "greetings-small-talk",
    weakVocabularyTitle: "Worth another look"
  },
  tracks: [
    {
      id: "journey",
      title: "Your trip-ready path",
      description: "Everything is open. This order simply puts the most useful language first.",
      presentation: "path",
      topicIds: [
        "greetings-small-talk", "numbers-dates-time", "airports-flights", "directions-navigation",
        "trains-stations", "buses-terminals", "hotels", "restaurants-food", "shopping-payments",
        "cleaning-laundry-hygiene"
      ]
    },
    {
      id: "safety",
      title: "Safety kit",
      description: "Food restrictions, weather warnings, and urgent help stay open without prerequisites.",
      presentation: "featured",
      topicIds: ["food-allergies", "weather", "emergencies-help"]
    },
    {
      id: "interests",
      title: "Explore your interests",
      description: "Optional specialist material for photography, aircraft recognition, and public aviation events.",
      presentation: "optional",
      topicIds: ["photography-cameras", "aircraft-jsdf", "air-bases-shows-jsdf"]
    }
  ],
  collections,
  sharedVocabularySets: [{
    id: ESSENTIAL_PHRASE_SET_ID,
    title: "Essential Phrase Kit",
    description: "Forty reusable phrases for politeness, clarification, numbers, and finding your way.",
    vocabulary: essentialPhraseVocabulary,
    groups: [
      phraseGroup("politeness-repair", "Politeness & repair", "Keep an interaction comfortable when you need help.", 0, 11),
      phraseGroup("questions-pointers", "Questions & pointers", "Ask about people, places, choices, and things around you.", 11, 22),
      phraseGroup("time-counts", "Time & simple counts", "Handle immediate plans and basic quantities.", 22, 29),
      phraseGroup("places-direction", "Places & direction", "Find entrances, exits, and the right way forward.", 29, 40)
    ]
  }],
  topics,
  characterCourse: japaneseCharacterCourse,
  defineVocabulary: (topic, entry) => {
    const definitions = definitionsForVocabulary(topic, entry);
    return { target: definitions.japanese, source: definitions.english };
  },
  normalizeRepresentation: (_representationId, value) => normalizeAnswer(value),
  searchNormalizer: (value) => value.normalize("NFKC").trim().toLocaleLowerCase("en"),
  quiz: {
    tiers: quizTiers,
    generate: generateQuiz,
    grade: gradeAnswer
  }
};

export default japanesePack;
