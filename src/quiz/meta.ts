import type { QuizTier } from "../content/types";

export const tierOrder: QuizTier[] = [
  "romaji-recall",
  "script-recall",
  "sentence-production",
  "response-production"
];

export const tierMeta: Record<QuizTier, { step: number; title: string; shortTitle: string; description: string }> = {
  "romaji-recall": {
    step: 1,
    title: "Read the word",
    shortTitle: "Romaji",
    description: "Type the romaji for Japanese vocabulary."
  },
  "script-recall": {
    step: 2,
    title: "Write the word",
    shortTitle: "Japanese",
    description: "Type kana or kanji from the English meaning."
  },
  "sentence-production": {
    step: 3,
    title: "Build the sentence",
    shortTitle: "Sentences",
    description: "Translate practical English sentences into Japanese."
  },
  "response-production": {
    step: 4,
    title: "Reply naturally",
    shortTitle: "Responses",
    description: "Read Japanese and type an appropriate Japanese response."
  }
};
