import { gradeQuestion, selectSceneBalancedQuestions } from "../../quiz/engine";
import type { GenerateQuizOptions, GradeResult, QuizQuestion, QuizTierDefinition, QuizTierId, Topic, VocabularyEntry } from "../types";
import { formFor, renderPattern } from "./helpers";

export const QUIZ_SIZE = 24;
export const PASS_SCORE = 20;

export const quizTiers: QuizTierDefinition[] = [
  { id: "pronunciation-recall", step: 1, title: "Read the word", shortTitle: "Pronunciation", description: "Type the pronunciation of Thai words and phrases.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE },
  { id: "word-recall", step: 2, title: "Write the word", shortTitle: "Thai", description: "Type Thai spelling with its tone marks and vowel forms.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE },
  { id: "sentence-production", step: 3, title: "Build the sentence", shortTitle: "Sentences", description: "Translate practical English prompts into Thai.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE },
  { id: "response-production", step: 4, title: "Reply naturally", shortTitle: "Responses", description: "Read Thai and type an appropriate Thai response.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE }
];

const punctuation = /[。、，,.!?！？「」『』（）()"'’:：;；]/gu;

export function normalizeAnswer(value: string): string {
  return value.normalize("NFC").trim().toLocaleLowerCase("th").replace(punctuation, " ").replace(/\s+/gu, " ");
}

export function gradeAnswer(question: QuizQuestion, input: string): GradeResult {
  return gradeQuestion(question, input, normalizeAnswer, question.answerLanguage);
}

const domainVocabulary = (topic: Topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain"));

const vocabularyQuestion = (topic: Topic, entry: VocabularyEntry, tierId: QuizTierId): QuizQuestion => {
  const form = formFor(entry, "standard");
  if (tierId === "pronunciation-recall") {
    return {
      id: `${tierId}:standard:${entry.id}`, languageCode: "th", topicId: topic.id, sourceId: entry.masteryKey, sceneId: entry.primarySceneId, tierId, variantId: "standard",
      prompt: form.representations.target, promptLanguage: "th", canonicalAnswer: form.representations.reading, acceptedAnswers: [form.representations.reading, ...(form.aliases.reading ?? [])],
      answerLanguage: "th-Latn", answerRepresentationId: "reading", answerLabel: "Pronunciation", answerPlaceholder: "Type the pronunciation", helper: entry.meanings.join(" · ")
    };
  }
  return {
    id: `${tierId}:standard:${entry.id}`, languageCode: "th", topicId: topic.id, sourceId: entry.masteryKey, sceneId: entry.primarySceneId, tierId, variantId: "standard",
    prompt: entry.meanings[0], promptLanguage: "en", canonicalAnswer: form.representations.target, acceptedAnswers: [form.representations.target, ...(form.aliases.target ?? [])],
    answerLanguage: "th", answerRepresentationId: "target", answerLabel: "Thai answer", answerPlaceholder: "พิมพ์ภาษาไทย", helper: "Keep the Thai tone marks and vowel signs."
  };
};

const patternQuestions = (topic: Topic, tierId: QuizTierId): QuizQuestion[] => {
  if (tierId === "sentence-production") {
    return topic.sentencePatterns.flatMap((pattern) => pattern.slotEntryIds.length
      ? pattern.slotEntryIds.map((entryId) => {
        const entry = topic.vocabulary.find((candidate) => candidate.id === entryId)!;
        const canonical = renderPattern(pattern.targetTextByVariant.standard, entry, "standard", "target");
        return {
          id: `${tierId}:standard:${pattern.id}:${entryId}`, languageCode: "th", topicId: topic.id, sourceId: entry.masteryKey, sceneId: pattern.sceneId, tierId, variantId: "standard",
          prompt: renderPattern(pattern.sourceText, entry, "standard", "source", pattern.slotSourceText?.[entry.id]), promptLanguage: "en", canonicalAnswer: canonical, acceptedAnswers: [canonical],
          answerLanguage: "th", answerRepresentationId: "target", answerLabel: "Thai answer", answerPlaceholder: "พิมพ์ภาษาไทย", helper: "Write the complete Thai sentence with its script and marks."
        } satisfies QuizQuestion;
      })
      : [{
        id: `${tierId}:standard:${pattern.id}`, languageCode: "th", topicId: topic.id, sourceId: pattern.id, sceneId: pattern.sceneId, tierId, variantId: "standard",
        prompt: pattern.sourceText, promptLanguage: "en", canonicalAnswer: pattern.targetTextByVariant.standard, acceptedAnswers: [pattern.targetTextByVariant.standard], answerLanguage: "th", answerRepresentationId: "target", answerLabel: "Thai answer", answerPlaceholder: "พิมพ์ภาษาไทย", helper: "Write the complete Thai sentence with its script and marks."
      } satisfies QuizQuestion]);
  }
  return topic.responsePatterns.flatMap((pattern) => pattern.slotEntryIds.length
    ? pattern.slotEntryIds.map((entryId) => {
      const entry = topic.vocabulary.find((candidate) => candidate.id === entryId)!;
      const canonical = renderPattern(pattern.answerTargetTextByVariant.standard, entry, "standard", "target");
      return {
        id: `${tierId}:standard:${pattern.id}:${entryId}`, languageCode: "th", topicId: topic.id, sourceId: entry.masteryKey, sceneId: pattern.sceneId, tierId, variantId: "standard",
        prompt: pattern.promptTargetTextByVariant.standard, promptLanguage: "th", canonicalAnswer: canonical, acceptedAnswers: [canonical], answerLanguage: "th", answerRepresentationId: "target", answerLabel: "Thai answer", answerPlaceholder: "พิมพ์ภาษาไทย", helper: "Reply in natural Thai and keep the written marks."
      } satisfies QuizQuestion;
    })
    : [{
      id: `${tierId}:standard:${pattern.id}`, languageCode: "th", topicId: topic.id, sourceId: pattern.id, sceneId: pattern.sceneId, tierId, variantId: "standard",
      prompt: pattern.promptTargetTextByVariant.standard, promptLanguage: "th", canonicalAnswer: pattern.answerTargetTextByVariant.standard, acceptedAnswers: [pattern.answerTargetTextByVariant.standard], answerLanguage: "th", answerRepresentationId: "target", answerLabel: "Thai answer", answerPlaceholder: "พิมพ์ภาษาไทย", helper: "Reply in natural Thai and keep the written marks."
    } satisfies QuizQuestion]);
};

export function generateQuiz(topic: Topic, options: GenerateQuizOptions): QuizQuestion[] {
  const count = options.count ?? QUIZ_SIZE;
  const candidates = options.tierId === "pronunciation-recall" || options.tierId === "word-recall"
    ? domainVocabulary(topic).map((entry) => vocabularyQuestion(topic, entry, options.tierId))
    : patternQuestions(topic, options.tierId);
  return selectSceneBalancedQuestions(candidates, { count, seed: options.seed, mastery: options.mastery });
}
