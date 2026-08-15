import { gradeQuestion, selectSceneBalancedQuestions } from "../../quiz/engine";
import type {
  GenerateQuizOptions,
  GradeResult,
  QuizQuestion,
  QuizTierDefinition,
  QuizTierId,
  Topic,
  VocabularyEntry
} from "../types";
import { formFor, renderPattern } from "./helpers";

export const QUIZ_SIZE = 24;
export const PASS_SCORE = 20;
export const SENTENCE_QUIZ_SIZE = 9;
export const RESPONSE_QUIZ_SIZE = 6;

export const quizTiers: QuizTierDefinition[] = [
  {
    // This persistence key predates the content audit. Keep it stable for
    // existing progress even though the learner-facing tier now tests meaning.
    id: "pronunciation-recall",
    step: 1,
    title: "Understand the word",
    shortTitle: "Meaning",
    description: "Read Vietnamese spelling and type the English meaning.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  },
  {
    id: "word-recall",
    step: 2,
    title: "Write the word",
    shortTitle: "Vietnamese",
    description: "Type Vietnamese spelling, including its tone marks.",
    sessionSize: QUIZ_SIZE,
    passScore: PASS_SCORE
  },
  {
    id: "sentence-production",
    step: 3,
    title: "Build the sentence",
    shortTitle: "Sentences",
    description: "Translate practical English prompts into Vietnamese.",
    sessionSize: SENTENCE_QUIZ_SIZE,
    passScore: 8
  },
  {
    id: "response-production",
    step: 4,
    title: "Reply naturally",
    shortTitle: "Responses",
    description: "Read Vietnamese and type an appropriate Vietnamese response.",
    sessionSize: RESPONSE_QUIZ_SIZE,
    passScore: 5
  }
];

const punctuation = /[。、，,.!?！？「」『』（）()"'’:：;；]/gu;

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("vi")
    .replace(punctuation, " ")
    .replace(/\s+/gu, " ");
}

export function gradeAnswer(question: QuizQuestion, input: string): GradeResult {
  return gradeQuestion(question, input, normalizeAnswer, question.answerLanguage);
}

const domainVocabulary = (topic: Topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain"));

const vocabularyQuestion = (topic: Topic, entry: VocabularyEntry, tierId: QuizTierId): QuizQuestion => {
  const form = formFor(entry, "standard");
  if (tierId === "pronunciation-recall") {
    return {
      id: `${tierId}:standard:${entry.id}`,
      languageCode: "vi",
      topicId: topic.id,
      sourceId: entry.masteryKey,
      sceneId: entry.primarySceneId,
      tierId,
      variantId: "standard",
      prompt: form.representations.target,
      promptLanguage: "vi",
      canonicalAnswer: entry.meanings[0],
      acceptedAnswers: [...entry.meanings],
      answerLanguage: "en",
      answerRepresentationId: "meaning",
      answerLabel: "English meaning",
      answerPlaceholder: "Type the meaning",
      helper: "Read the Vietnamese word, including its tone marks."
    };
  }
  return {
    id: `${tierId}:standard:${entry.id}`,
    languageCode: "vi",
    topicId: topic.id,
    sourceId: entry.masteryKey,
    sceneId: entry.primarySceneId,
    tierId,
    variantId: "standard",
    prompt: entry.meanings[0],
    promptLanguage: "en",
    canonicalAnswer: form.representations.target,
    acceptedAnswers: [form.representations.target, ...(form.aliases.target ?? [])],
    answerLanguage: "vi",
    answerRepresentationId: "target",
    answerLabel: "Vietnamese answer",
    answerPlaceholder: "Nhập tiếng Việt",
    helper: "Keep every Vietnamese tone mark."
  };
};

const patternQuestions = (topic: Topic, tierId: QuizTierId): QuizQuestion[] => {
  if (tierId === "sentence-production") {
    return topic.sentencePatterns.flatMap((pattern) => pattern.slotEntryIds.length
      ? pattern.slotEntryIds.map((entryId) => {
        const entry = topic.vocabulary.find((candidate) => candidate.id === entryId)!;
        const canonical = renderPattern(pattern.targetTextByVariant.standard, entry, "standard", "target");
        return {
          id: `${tierId}:standard:${pattern.id}:${entryId}`,
          languageCode: "vi",
          topicId: topic.id,
          sourceId: entry.masteryKey,
          sceneId: pattern.sceneId,
          tierId,
          variantId: "standard",
          prompt: renderPattern(pattern.sourceText, entry, "standard", "source", pattern.slotSourceText?.[entry.id]),
          promptLanguage: "en",
          canonicalAnswer: canonical,
          acceptedAnswers: [canonical],
          answerLanguage: "vi",
          answerRepresentationId: "target",
          answerLabel: "Vietnamese answer",
          answerPlaceholder: "Nhập tiếng Việt",
          helper: "Write the complete Vietnamese sentence with its tone marks."
        } satisfies QuizQuestion;
      })
      : [{
        id: `${tierId}:standard:${pattern.id}`,
        languageCode: "vi",
        topicId: topic.id,
        sourceId: pattern.id,
        sceneId: pattern.sceneId,
        tierId,
        variantId: "standard",
        prompt: pattern.sourceText,
        promptLanguage: "en",
        canonicalAnswer: pattern.targetTextByVariant.standard,
        acceptedAnswers: [pattern.targetTextByVariant.standard],
        answerLanguage: "vi",
        answerRepresentationId: "target",
        answerLabel: "Vietnamese answer",
        answerPlaceholder: "Nhập tiếng Việt",
        helper: "Write the complete Vietnamese sentence with its tone marks."
      } satisfies QuizQuestion]);
  }
  return topic.responsePatterns.flatMap((pattern) => pattern.slotEntryIds.length
    ? pattern.slotEntryIds.map((entryId) => {
      const entry = topic.vocabulary.find((candidate) => candidate.id === entryId)!;
      const canonical = renderPattern(pattern.answerTargetTextByVariant.standard, entry, "standard", "target");
      return {
        id: `${tierId}:standard:${pattern.id}:${entryId}`,
        languageCode: "vi",
        topicId: topic.id,
        sourceId: entry.masteryKey,
        sceneId: pattern.sceneId,
        tierId,
        variantId: "standard",
        prompt: renderPattern(pattern.promptTargetTextByVariant.standard, entry, "standard", "target"),
        promptLanguage: "vi",
        canonicalAnswer: canonical,
        acceptedAnswers: [canonical],
        answerLanguage: "vi",
        answerRepresentationId: "target",
        answerLabel: "Vietnamese answer",
        answerPlaceholder: "Nhập tiếng Việt",
        helper: "Reply in natural Vietnamese and keep the tone marks."
      } satisfies QuizQuestion;
    })
    : [{
      id: `${tierId}:standard:${pattern.id}`,
      languageCode: "vi",
      topicId: topic.id,
      sourceId: pattern.id,
      sceneId: pattern.sceneId,
      tierId,
      variantId: "standard",
      prompt: pattern.promptTargetTextByVariant.standard,
      promptLanguage: "vi",
      canonicalAnswer: pattern.answerTargetTextByVariant.standard,
      acceptedAnswers: [pattern.answerTargetTextByVariant.standard],
      answerLanguage: "vi",
      answerRepresentationId: "target",
      answerLabel: "Vietnamese answer",
      answerPlaceholder: "Nhập tiếng Việt",
      helper: "Reply in natural Vietnamese and keep the tone marks."
    } satisfies QuizQuestion]);
};

export function generateQuiz(topic: Topic, options: GenerateQuizOptions): QuizQuestion[] {
  const count = options.count ?? QUIZ_SIZE;
  const candidates = options.tierId === "pronunciation-recall" || options.tierId === "word-recall"
    ? domainVocabulary(topic).map((entry) => vocabularyQuestion(topic, entry, options.tierId))
    : patternQuestions(topic, options.tierId);
  return selectSceneBalancedQuestions(candidates, { count, seed: options.seed, mastery: options.mastery });
}
