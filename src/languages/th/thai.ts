import type { LanguagePack, VocabularyGroup } from "../types";
import { thaiCharacterCourse } from "./characters";
import { collections, ESSENTIAL_PHRASE_SET_ID } from "./curriculum";
import { definitionsForVocabulary } from "./definitions";
import { essentialPhraseVocabulary } from "./helpers";
import { generateQuiz, gradeAnswer, normalizeAnswer, quizTiers } from "./quiz";
import { thaiTopics } from "./topics";

const phraseGroup = (id: string, title: string, description: string, start: number, end: number): VocabularyGroup => ({
  id,
  title,
  description,
  entryIds: essentialPhraseVocabulary.slice(start, end).map((entry) => entry.id)
});

const sharedVocabularySets = [{
  id: ESSENTIAL_PHRASE_SET_ID,
  title: "Essential Phrase Kit",
  description: "Forty high-frequency Thai phrases for getting started and staying understood.",
  vocabulary: essentialPhraseVocabulary,
  groups: [
    phraseGroup("first-phrases", "First phrases", "Greetings, thanks, and apologies.", 0, 10),
    phraseGroup("understanding", "Understanding each other", "Ask for repetition, slower speech, and help.", 10, 20),
    phraseGroup("introductions", "Introductions", "Names, origins, and friendly partings.", 20, 30),
    phraseGroup("navigation", "Everyday navigation", "Point, ask, and confirm basic information.", 30, 40)
  ]
}];

const normalizeRepresentation = (representationId: string, value: string) => {
  if (representationId === "glyph") return value.normalize("NFC").trim();
  return normalizeAnswer(value);
};

export const thaiPack: LanguagePack = {
  code: "th",
  name: "Thai",
  nativeName: "ไทย",
  locale: "th",
  sourceLocale: "en",
  mark: "ก",
  targetFontFamily: "var(--font-body)",
  representations: [
    { id: "target", label: "Thai", languageTag: "th", inputMode: "target-script" },
    { id: "reading", label: "Pronunciation", languageTag: "th-Latn", inputMode: "latin" },
    { id: "glyph", label: "Letter or mark", languageTag: "th", inputMode: "target-script" }
  ],
  speechVariants: [{ id: "standard", label: "Standard Thai", nativeLabel: "ภาษาไทยมาตรฐาน", description: "A broadly understood standard pronunciation and spelling." }],
  defaultSpeechVariantId: "standard",
  presentation: {
    tagline: "Practical Thai for travel, daily life, and connection.",
    welcomeTitle: "Thai is ready",
    welcomeDescription: "Thai writing combines consonants, vowel forms, and tone marks around a syllable.",
    keyboardTitle: "Thai input",
    keyboardHelp: "Use a Thai keyboard when possible so you can enter consonants, vowel forms, and tone marks accurately.",
    startTopicId: "greetings-small-talk",
    weakVocabularyTitle: "Worth another look"
  },
  tracks: [
    {
      id: "thai-path",
      title: "Start here",
      description: "Build a practical base before you travel.",
      topicIds: ["greetings-small-talk", "numbers-dates-time", "airports-flights", "directions-navigation", "trains-stations", "buses-terminals", "hotels", "restaurants-food", "shopping-payments", "cleaning-laundry-hygiene"],
      presentation: "path"
    },
    {
      id: "thai-safety",
      title: "Safety essentials",
      description: "Food, weather, and urgent help.",
      topicIds: ["food-allergies", "weather", "emergencies-help"],
      presentation: "featured"
    },
    {
      id: "thai-connections",
      title: "Connect more deeply",
      description: "Cafés, work, study, and local culture.",
      topicIds: ["cafes-coffee", "work-study", "sightseeing-culture"],
      presentation: "optional"
    }
  ],
  collections,
  sharedVocabularySets,
  topics: thaiTopics,
  characterCourse: thaiCharacterCourse,
  defineVocabulary: definitionsForVocabulary,
  normalizeRepresentation,
  searchNormalizer: normalizeAnswer,
  quiz: {
    tiers: quizTiers,
    generate: (topic, options) => generateQuiz(topic, options),
    grade: gradeAnswer
  }
};
