import type { LanguagePack, VocabularyGroup } from "../types";
import { vietnameseCharacterCourse } from "./characters";
import { collections, ESSENTIAL_PHRASE_SET_ID } from "./curriculum";
import { definitionsForVocabulary } from "./definitions";
import { essentialPhraseVocabulary } from "./helpers";
import { generateQuiz, gradeAnswer, normalizeAnswer, quizTiers } from "./quiz";
import { vietnameseTopics } from "./topics";

const phraseGroup = (id: string, title: string, description: string, start: number, end: number): VocabularyGroup => ({
  id,
  title,
  description,
  entryIds: essentialPhraseVocabulary.slice(start, end).map((entry) => entry.id)
});

const sharedVocabularySets = [{
  id: ESSENTIAL_PHRASE_SET_ID,
  title: "Essential Phrase Kit",
  description: "Forty high-frequency Vietnamese phrases for getting started and staying understood.",
  vocabulary: essentialPhraseVocabulary,
  groups: [
    phraseGroup("first-phrases", "First phrases", "Greetings, thanks, and apologies.", 0, 10),
    phraseGroup("understanding", "Understanding each other", "Ask for repetition, slower speech, and help.", 10, 20),
    phraseGroup("introductions", "Introductions", "Names, origins, and friendly partings.", 20, 30),
    phraseGroup("navigation", "Everyday navigation", "Point, ask, and confirm basic information.", 30, 40)
  ]
}];

const normalizeRepresentation = (representationId: string, value: string) => {
  if (representationId === "glyph") return value.normalize("NFC").trim().toLocaleLowerCase("vi");
  return normalizeAnswer(value);
};

export const vietnamesePack: LanguagePack = {
  code: "vi",
  name: "Vietnamese",
  nativeName: "Tiếng Việt",
  locale: "vi",
  sourceLocale: "en",
  mark: "đ",
  targetFontFamily: "var(--font-body)",
  representations: [
    { id: "target", label: "Vietnamese", languageTag: "vi", inputMode: "target-script" },
    { id: "reading", label: "Pronunciation", languageTag: "vi", inputMode: "latin" },
    { id: "glyph", label: "Letter or mark", languageTag: "vi", inputMode: "target-script" }
  ],
  speechVariants: [{ id: "standard", label: "Northern standard", nativeLabel: "Phổ thông", description: "A broadly understood standard pronunciation and spelling." }],
  defaultSpeechVariantId: "standard",
  presentation: {
    tagline: "Practical Vietnamese for travel, daily life, and connection.",
    welcomeTitle: "Vietnamese is ready",
    welcomeDescription: "Vietnamese uses the Latin alphabet, with tone marks that change meaning.",
    keyboardTitle: "Vietnamese input",
    keyboardHelp: "Use a Vietnamese keyboard when possible so you can enter tone marks accurately. The app preserves them when grading.",
    startTopicId: "greetings-small-talk",
    weakVocabularyTitle: "Worth another look"
  },
  tracks: [
    {
      id: "vietnamese-path",
      title: "Start here",
      description: "Build a practical base before you travel.",
      topicIds: ["greetings-small-talk", "numbers-dates-time", "airports-flights", "directions-navigation", "trains-stations", "buses-terminals", "hotels", "restaurants-food", "shopping-payments", "cleaning-laundry-hygiene"],
      presentation: "path"
    },
    {
      id: "vietnamese-safety",
      title: "Safety essentials",
      description: "Food, weather, and urgent help.",
      topicIds: ["food-allergies", "weather", "emergencies-help"],
      presentation: "featured"
    },
    {
      id: "vietnamese-connections",
      title: "Connect more deeply",
      description: "Cafés, work, study, and local culture.",
      topicIds: ["cafes-coffee", "work-study", "sightseeing-culture"],
      presentation: "optional"
    }
  ],
  collections,
  sharedVocabularySets,
  topics: vietnameseTopics,
  characterCourse: vietnameseCharacterCourse,
  defineVocabulary: definitionsForVocabulary,
  normalizeRepresentation,
  searchNormalizer: normalizeAnswer,
  quiz: {
    tiers: quizTiers,
    generate: (topic, options) => generateQuiz(topic, options),
    grade: gradeAnswer
  }
};
