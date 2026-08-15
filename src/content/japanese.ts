import type { LanguagePack } from "./types";
import { generateQuiz, gradeAnswer, normalizeAnswer } from "../quiz/engine";
import { essentialTopics } from "./topics-essentials";
import { practicalTopics } from "./topics-practical";
import { transitTopics } from "./topics-transit";
import { collections, ESSENTIAL_PHRASE_SET_ID } from "./curriculum";
import { essentialPhraseVocabulary } from "./helpers";

const topics = [...essentialTopics, ...transitTopics, ...practicalTopics];

export const japanesePack: LanguagePack = {
  code: "ja",
  name: "Japanese",
  nativeName: "日本語",
  registers: ["formal", "informal"],
  recommendedPath: [
    "greetings-small-talk",
    "numbers-dates-time",
    "airports-flights",
    "directions-navigation",
    "trains-stations",
    "buses-terminals",
    "hotels",
    "restaurants-food",
    "shopping-payments",
    "cleaning-laundry-hygiene",
    "food-allergies",
    "weather",
    "emergencies-help",
    "photography-cameras",
    "aircraft-jsdf",
    "air-bases-shows-jsdf"
  ],
  recommendedTracks: {
    journey: [
      "greetings-small-talk", "numbers-dates-time", "airports-flights", "directions-navigation",
      "trains-stations", "buses-terminals", "hotels", "restaurants-food", "shopping-payments",
      "cleaning-laundry-hygiene"
    ],
    safety: ["food-allergies", "weather", "emergencies-help"],
    interests: ["photography-cameras", "aircraft-jsdf", "air-bases-shows-jsdf"]
  },
  collections,
  sharedVocabularySets: [{
    id: ESSENTIAL_PHRASE_SET_ID,
    title: "Essential Phrase Kit",
    description: "Forty reusable phrases for politeness, clarification, numbers, and finding your way.",
    vocabulary: essentialPhraseVocabulary
  }],
  topics,
  normalizer: normalizeAnswer,
  quizGenerators: {
    generate: generateQuiz,
    grade: gradeAnswer
  }
};

export const topicById = new Map(japanesePack.topics.map((topic) => [topic.id, topic]));
export const collectionById = new Map(japanesePack.collections.map((collection) => [collection.id, collection]));
export const vocabularyById = new Map([
  ...japanesePack.sharedVocabularySets.flatMap((set) => set.vocabulary),
  ...japanesePack.topics.flatMap((topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain")))
].map((entry) => [entry.id, entry]));
export const sharedVocabularyIds = new Set(essentialPhraseVocabulary.map((entry) => entry.masteryKey));
export const isSharedVocabularyId = (sourceId: string) => sharedVocabularyIds.has(sourceId);
