import { gradeQuestion, selectSceneBalancedQuestions } from "../../quiz/engine";
import type {
  GenerateQuizOptions,
  GradeResult,
  QuizChoiceOption,
  QuizQuestion,
  QuizTierDefinition,
  Topic,
  VocabularyEntry
} from "../types";
import { formFor } from "./helpers";

export const QUIZ_SIZE = 10;
export const PASS_SCORE = 8;

export const quizTiers: QuizTierDefinition[] = [
  { id: "recognition", step: 1, title: "Recognize the meaning", shortTitle: "Recognize", description: "Read Japanese with its kana and choose the English meaning.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE },
  { id: "recall", step: 2, title: "Recall the Japanese", shortTitle: "Recall", description: "Type kana or kanji from the English meaning.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE },
  { id: "in-context", step: 3, title: "Use it in context", shortTitle: "In context", description: "Choose the sentence or reply that fits a real interaction.", sessionSize: QUIZ_SIZE, passScore: PASS_SCORE }
];

const punctuation = /[\s。、，,.!?！？「」『』（）()・:：;；'’\-]/gu;

export function normalizeAnswer(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(punctuation, "");
}

export function gradeAnswer(question: QuizQuestion, input: string): GradeResult {
  return gradeQuestion(question, input, normalizeAnswer, question.answerLanguage);
}

const domainVocabulary = (topic: Topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain"));

const scriptAnswers = (entry: VocabularyEntry) => {
  const form = formFor(entry, "formal");
  return Array.from(new Set([
    form.representations.target,
    form.representations.reading,
    ...(form.aliases.target ?? [])
  ].filter(Boolean)));
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function choiceOptions(
  correctId: string,
  pool: Array<{ id: string; text: string; reading?: string }>,
  language: string
): QuizChoiceOption[] {
  const correct = pool.find((item) => item.id === correctId);
  if (!correct) throw new Error(`Missing correct choice ${correctId}`);
  const unique = pool.filter((item, index, items) =>
    item.id === correctId || items.findIndex((candidate) => candidate.text === item.text) === index
  );
  const distractors = unique
    .filter((candidate) => candidate.id !== correctId && candidate.text !== correct.text)
    .sort((a, b) => stableHash(`${correctId}:${a.id}`) - stableHash(`${correctId}:${b.id}`))
    .slice(0, 3);
  const selected = [correct, ...distractors];
  if (selected.length < 4) throw new Error(`Choice ${correctId} has fewer than four unique options`);
  const rotation = stableHash(`${correctId}:order`) % selected.length;
  return [...selected.slice(rotation), ...selected.slice(0, rotation)].map((item) => ({ ...item, language }));
}

function vocabularyQuestions(topic: Topic, tierId: "recognition" | "recall"): QuizQuestion[] {
  const entries = domainVocabulary(topic);
  const meaningPool = entries.map((entry) => ({ id: entry.id, text: entry.meanings.join(" / ") }));
  return entries.map((entry) => {
    const form = formFor(entry, "formal");
    if (tierId === "recognition") {
      return {
        kind: "choice",
        id: `${tierId}:formal:${entry.id}`,
        languageCode: "ja",
        topicId: topic.id,
        sourceId: entry.masteryKey,
        learningPriority: entry.priority,
        sceneId: entry.primarySceneId,
        tierId,
        variantId: "formal",
        prompt: form.representations.target,
        promptReading: form.representations.reading,
        promptLanguage: "ja",
        canonicalAnswer: entry.meanings[0],
        acceptedAnswers: [entry.id],
        answerLanguage: "en",
        answerRepresentationId: "meaning",
        answerLabel: "Choose the meaning",
        answerPlaceholder: "",
        helper: "Read the Japanese and its kana.",
        explanation: `${form.representations.target}${form.representations.reading !== form.representations.target ? `（${form.representations.reading}）` : ""} means “${entry.meanings.join(" / ")}.”`,
        options: choiceOptions(entry.id, meaningPool, "en"),
        correctOptionId: entry.id
      } satisfies QuizQuestion;
    }
    return {
      kind: "text",
      id: `${tierId}:formal:${entry.id}`,
      languageCode: "ja",
      topicId: topic.id,
      sourceId: entry.masteryKey,
      learningPriority: entry.priority,
      sceneId: entry.primarySceneId,
      tierId,
      variantId: "formal",
      prompt: entry.meanings[0],
      promptLanguage: "en",
      canonicalAnswer: form.representations.target,
      acceptedAnswers: scriptAnswers(entry),
      answerLanguage: "ja",
      answerRepresentationId: "target",
      answerLabel: "Japanese answer",
      answerPlaceholder: "日本語で入力",
      helper: "Kana or the usual kanji form is accepted.",
      explanation: form.representations.reading !== form.representations.target ? `Reading: ${form.representations.reading}` : undefined
    } satisfies QuizQuestion;
  });
}

function contextQuestions(topic: Topic): QuizQuestion[] {
  const lines = topic.scenes.flatMap((scene) => scene.dialogueIds.flatMap((dialogueId) => {
    const scenario = topic.dialogues.find((candidate) => candidate.id === dialogueId);
    return scenario?.turns.map((turn, index) => ({
      id: `${scenario.id}:turn:${index + 1}`,
      sceneId: scene.id,
      source: turn.sourceText,
      text: turn.targetTextByVariant.formal,
      reading: turn.targetReadingByVariant?.formal
    })) ?? [];
  }));
  const optionPool = lines.map(({ id, text, reading }) => ({ id, text, reading }));
  const sentenceChoices = lines.map((line) => ({
    kind: "choice",
    id: `in-context:formal:sentence:${line.id}`,
    languageCode: "ja",
    topicId: topic.id,
    sourceId: `sentence:${line.id}`,
    sceneId: line.sceneId,
    tierId: "in-context",
    variantId: "formal",
    prompt: line.source,
    promptLanguage: "en",
    canonicalAnswer: line.text,
    acceptedAnswers: [line.id],
    answerLanguage: "ja",
    answerRepresentationId: "target",
    answerLabel: "Choose the Japanese line",
    answerPlaceholder: "",
    helper: "Choose the polite line that matches the situation.",
    explanation: line.reading ? `${line.text}（${line.reading}）` : line.text,
    options: choiceOptions(line.id, optionPool, "ja"),
    correctOptionId: line.id
  } satisfies QuizQuestion));
  const responseChoices = topic.scenes.flatMap((scene) => scene.dialogueIds.flatMap((dialogueId) => {
    const scenario = topic.dialogues.find((candidate) => candidate.id === dialogueId);
    if (!scenario) return [];
    return scenario.turns.slice(0, -1).map((turn, index) => {
      const answer = scenario.turns[index + 1];
      const correctId = `${scenario.id}:turn:${index + 2}`;
      return {
        kind: "choice",
        id: `in-context:formal:response:${scenario.id}:${index + 1}`,
        languageCode: "ja",
        topicId: topic.id,
        sourceId: `response:${scenario.id}:${index + 1}`,
        sceneId: scene.id,
        tierId: "in-context",
        variantId: "formal",
        prompt: turn.targetTextByVariant.formal,
        promptReading: turn.targetReadingByVariant?.formal,
        promptLanguage: "ja",
        canonicalAnswer: answer.targetTextByVariant.formal,
        acceptedAnswers: [correctId],
        answerLanguage: "ja",
        answerRepresentationId: "target",
        answerLabel: "Choose the natural reply",
        answerPlaceholder: "",
        helper: `In “${scenario.title},” choose what comes next.`,
        explanation: `${answer.targetTextByVariant.formal}${answer.targetReadingByVariant?.formal ? `（${answer.targetReadingByVariant.formal}）` : ""} — ${answer.sourceText}`,
        options: choiceOptions(correctId, optionPool, "ja"),
        correctOptionId: correctId
      } satisfies QuizQuestion;
    });
  }));
  return [...sentenceChoices, ...responseChoices];
}

export function generateQuiz(topic: Topic, options: GenerateQuizOptions): QuizQuestion[] {
  const count = options.count ?? QUIZ_SIZE;
  const candidates = options.tierId === "recognition" || options.tierId === "recall"
    ? vocabularyQuestions(topic, options.tierId)
    : contextQuestions(topic);
  return selectSceneBalancedQuestions(candidates, {
    count,
    seed: options.seed,
    mastery: options.mastery,
    correctQuestionIds: options.correctQuestionIds
  });
}
