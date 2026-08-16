import { gradeQuestion, mergeVariantQuestions, selectSceneBalancedQuestions } from "../../quiz/engine";
import type {
  GenerateQuizOptions,
  GradeResult,
  QuizQuestion,
  QuizTierDefinition,
  QuizTierId,
  SpeechVariantId,
  Topic,
  VocabularyEntry
} from "../types";
import { formFor, renderPattern } from "./helpers";

export const QUIZ_SIZE = 24;
export const PASS_SCORE = 20;

export const quizTiers: QuizTierDefinition[] = [
  {
    id: "romaji-recall",
    step: 1,
    title: "Read the word",
    shortTitle: "Romaji",
    description: "Type the romaji for Japanese vocabulary.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  },
  {
    id: "script-recall",
    step: 2,
    title: "Write the word",
    shortTitle: "Japanese",
    description: "Type kana or kanji from the English meaning.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  },
  {
    id: "sentence-production",
    step: 3,
    title: "Build the sentence",
    shortTitle: "Sentences",
    description: "Translate practical English sentences into Japanese.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  },
  {
    id: "response-production",
    step: 4,
    title: "Reply naturally",
    shortTitle: "Responses",
    description: "Read Japanese and type an appropriate Japanese response.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  }
];

const punctuation = /[\s。、，,.!?！？「」『』（）()・:：;；'’\-]/gu;

export function normalizeAnswer(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(punctuation, "");
}

export function gradeAnswer(question: QuizQuestion, input: string): GradeResult {
  return gradeQuestion(question, input, normalizeAnswer, question.answerLanguage);
}

const scriptAnswers = (entry: VocabularyEntry, variantId: SpeechVariantId) => {
  const form = formFor(entry, variantId);
  return Array.from(new Set([
    form.representations.target,
    form.representations.reading,
    ...(form.aliases.target ?? [])
  ].filter(Boolean)));
};

function vocabularyQuestion(
  topic: Topic,
  entry: VocabularyEntry,
  tierId: QuizTierId,
  variantId: SpeechVariantId
): QuizQuestion {
  const form = formFor(entry, variantId);
  if (tierId === "romaji-recall") {
    return {
      id: `${tierId}:${variantId}:${entry.id}`,
      languageCode: "ja",
      topicId: topic.id,
      sourceId: entry.masteryKey,
      sceneId: entry.primarySceneId,
      tierId,
      variantId,
      prompt: form.representations.target,
      promptLanguage: "ja",
      canonicalAnswer: form.representations.romanization,
      acceptedAnswers: [form.representations.romanization, ...(form.aliases.romanization ?? [])],
      answerLanguage: "en",
      answerRepresentationId: "romanization",
      answerLabel: "Romaji answer",
      answerPlaceholder: "Type romaji",
      helper: entry.meanings.join(" · ")
    };
  }
  return {
    id: `${tierId}:${variantId}:${entry.id}`,
    languageCode: "ja",
    topicId: topic.id,
    sourceId: entry.masteryKey,
    sceneId: entry.primarySceneId,
    tierId,
    variantId,
    prompt: entry.meanings[0],
    promptLanguage: "en",
    canonicalAnswer: form.representations.target,
    acceptedAnswers: scriptAnswers(entry, variantId),
    answerLanguage: "ja",
    answerRepresentationId: "target",
    answerLabel: "Japanese answer",
    answerPlaceholder: "日本語で入力",
    helper: "Write this in Japanese script."
  };
}

function patternQuestions(topic: Topic, tierId: QuizTierId, variantId: SpeechVariantId): QuizQuestion[] {
  const vocabulary = new Map(topic.vocabulary.map((entry) => [entry.id, entry]));
  if (tierId === "sentence-production") {
    return topic.sentencePatterns.flatMap((pattern) =>
      pattern.slotEntryIds.length ? pattern.slotEntryIds.map((entryId) => {
        const entry = vocabulary.get(entryId)!;
        const form = formFor(entry, variantId);
        const targetTemplate = pattern.targetTextByVariant[variantId];
        const canonical = renderPattern(targetTemplate, entry, variantId, "target");
        const reading = targetTemplate.replaceAll("{term}", form.representations.reading);
        return {
          id: `${tierId}:${variantId}:${pattern.id}:${entryId}`,
          languageCode: "ja",
          topicId: topic.id,
          sourceId: entry.masteryKey,
          sceneId: pattern.sceneId,
          tierId,
          variantId,
          prompt: renderPattern(pattern.sourceText, entry, variantId, "source", pattern.slotSourceText?.[entry.id]),
          promptLanguage: "en",
          canonicalAnswer: canonical,
          acceptedAnswers: Array.from(new Set([canonical, reading])),
          answerLanguage: "ja",
          answerRepresentationId: "target",
          answerLabel: "Japanese answer",
          answerPlaceholder: "日本語で入力",
          helper: variantId === "formal" ? "Use the polite form." : "Use the casual form."
        };
      }) : [{
        id: `${tierId}:${variantId}:${pattern.id}`,
        languageCode: "ja",
        topicId: topic.id,
        sourceId: pattern.id,
        sceneId: pattern.sceneId,
        tierId,
        variantId,
        prompt: pattern.sourceText,
        promptLanguage: "en",
        canonicalAnswer: pattern.targetTextByVariant[variantId],
        acceptedAnswers: [pattern.targetTextByVariant[variantId]],
        answerLanguage: "ja",
        answerRepresentationId: "target",
        answerLabel: "Japanese answer",
        answerPlaceholder: "日本語で入力",
        helper: variantId === "formal" ? "Use the polite form from the scene." : "Use the casual form from the scene."
      }]
    );
  }

  return topic.responsePatterns.flatMap((pattern) =>
    pattern.slotEntryIds.length ? pattern.slotEntryIds.map((entryId) => {
      const entry = vocabulary.get(entryId)!;
      const form = formFor(entry, variantId);
      const answerTemplate = pattern.answerTargetTextByVariant[variantId];
      const canonical = renderPattern(answerTemplate, entry, variantId, "target");
      const reading = answerTemplate.replaceAll("{term}", form.representations.reading);
      return {
        id: `${tierId}:${variantId}:${pattern.id}:${entryId}`,
        languageCode: "ja",
        topicId: topic.id,
        sourceId: entry.masteryKey,
        sceneId: pattern.sceneId,
        tierId,
        variantId,
        prompt: renderPattern(pattern.promptTargetTextByVariant[variantId], entry, variantId, "target"),
        promptLanguage: "ja",
        canonicalAnswer: canonical,
        acceptedAnswers: Array.from(new Set([canonical, reading])),
        answerLanguage: "ja",
        answerRepresentationId: "target",
        answerLabel: "Japanese answer",
        answerPlaceholder: "日本語で入力",
        helper: variantId === "formal" ? "Reply politely in Japanese." : "Reply casually in Japanese."
      };
    }) : [{
      id: `${tierId}:${variantId}:${pattern.id}`,
      languageCode: "ja",
      topicId: topic.id,
      sourceId: pattern.id,
      sceneId: pattern.sceneId,
      tierId,
      variantId,
      prompt: pattern.promptTargetTextByVariant[variantId],
      promptLanguage: "ja",
      canonicalAnswer: pattern.answerTargetTextByVariant[variantId],
      acceptedAnswers: [pattern.answerTargetTextByVariant[variantId]],
      answerLanguage: "ja",
      answerRepresentationId: "target",
      answerLabel: "Japanese answer",
      answerPlaceholder: "日本語で入力",
      helper: variantId === "formal" ? "Reply politely using the scene dialogue." : "Reply casually using the scene dialogue."
    }]
  );
}

export function generateQuiz(topic: Topic, options: GenerateQuizOptions): QuizQuestion[] {
  const count = options.count ?? QUIZ_SIZE;
  const candidates = options.tierId === "romaji-recall" || options.tierId === "script-recall"
    ? topic.vocabulary.map((entry) => vocabularyQuestion(topic, entry, options.tierId, options.variantId))
    : patternQuestions(topic, options.tierId, options.variantId);
  return selectSceneBalancedQuestions(candidates, {
    count,
    seed: options.seed,
    mastery: options.mastery,
    correctQuestionIds: options.correctQuestionIds
  });
}

export function mergeSpeechVariantQuestions(
  previous: QuizQuestion[],
  currentIndex: number,
  regenerated: QuizQuestion[],
  count = QUIZ_SIZE
): QuizQuestion[] {
  return mergeVariantQuestions(previous, currentIndex, regenerated, count, normalizeAnswer);
}
