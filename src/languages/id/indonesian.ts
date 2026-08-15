import type { LanguagePack, VocabularyGroup } from "../types";
import { indonesianCharacterCourse } from "./characters";
import { collections, ESSENTIAL_PHRASE_SET_ID } from "./curriculum";
import { definitionsForVocabulary } from "./definitions";
import { essentialPhraseVocabulary } from "./helpers";
import { generateQuiz, gradeAnswer, normalizeAnswer, quizTiers } from "./quiz";
import { indonesianTopics } from "./topics";

const phraseGroup = (id: string, title: string, description: string, start: number, end: number): VocabularyGroup => ({ id, title, description, entryIds: essentialPhraseVocabulary.slice(start, end).map((entry) => entry.id) });
const sharedVocabularySets = [{
  id: ESSENTIAL_PHRASE_SET_ID,
  title: "Essential Phrase Kit",
  description: "Forty high-frequency Indonesian phrases for getting started and staying understood.",
  vocabulary: essentialPhraseVocabulary,
  groups: [phraseGroup("first-phrases", "First phrases", "Greetings, thanks, and apologies.", 0, 10), phraseGroup("understanding", "Understanding each other", "Ask for repetition, slower speech, and help.", 10, 20), phraseGroup("introductions", "Introductions", "Names, origins, and friendly partings.", 20, 30), phraseGroup("navigation", "Everyday navigation", "Point, ask, and confirm basic information.", 30, 40)]
}];

const normalizeRepresentation = (representationId: string, value: string) => representationId === "glyph" ? value.normalize("NFC").trim().toLocaleLowerCase("id") : normalizeAnswer(value);

export const indonesianPack: LanguagePack = {
  code: "id",
  name: "Indonesian",
  nativeName: "Bahasa Indonesia",
  locale: "id",
  sourceLocale: "en",
  mark: "A",
  targetFontFamily: "var(--font-body)",
  representations: [
    { id: "target", label: "Indonesian", languageTag: "id", inputMode: "latin" },
    { id: "reading", label: "Pronunciation", languageTag: "id-Latn", inputMode: "latin" },
    { id: "glyph", label: "Letter or digraph", languageTag: "id", inputMode: "latin" }
  ],
  speechVariants: [{ id: "standard", label: "Standard Indonesian", nativeLabel: "Bahasa Indonesia baku", description: "A broadly understood standard pronunciation and spelling." }],
  defaultSpeechVariantId: "standard",
  presentation: {
    tagline: "Practical Indonesian for travel, daily life, and connection.",
    welcomeTitle: "Indonesian is ready",
    welcomeDescription: "Indonesian uses a familiar Latin alphabet and regular spelling patterns.",
    keyboardTitle: "Indonesian input",
    keyboardHelp: "A standard Latin keyboard is sufficient. The writing course also introduces the common digraphs ng, ny, kh, and sy.",
    startTopicId: "greetings-small-talk",
    weakVocabularyTitle: "Worth another look"
  },
  tracks: [
    { id: "indonesian-path", title: "Start here", description: "Build a practical base before you travel.", topicIds: ["greetings-small-talk", "numbers-dates-time", "airports-flights", "directions-navigation", "trains-stations", "buses-terminals", "hotels", "restaurants-food", "shopping-payments", "cleaning-laundry-hygiene"], presentation: "path" },
    { id: "indonesian-safety", title: "Safety essentials", description: "Food, weather, and urgent help.", topicIds: ["food-allergies", "weather", "emergencies-help"], presentation: "featured" },
    { id: "indonesian-connections", title: "Connect more deeply", description: "Cafés, work, study, and local culture.", topicIds: ["cafes-coffee", "work-study", "sightseeing-culture"], presentation: "optional" }
  ],
  collections,
  sharedVocabularySets,
  topics: indonesianTopics,
  characterCourse: indonesianCharacterCourse,
  defineVocabulary: definitionsForVocabulary,
  normalizeRepresentation,
  searchNormalizer: normalizeAnswer,
  quiz: { tiers: quizTiers, generate: (topic, options) => generateQuiz(topic, options), grade: gradeAnswer }
};
