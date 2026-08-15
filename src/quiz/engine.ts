import { formFor, renderPattern } from "../content/helpers";
import type {
  GenerateQuizOptions,
  GradeResult,
  QuizQuestion,
  QuizTier,
  Register,
  Topic,
  VocabularyEntry
} from "../content/types";

export const QUIZ_SIZE = 24;
export const PASS_SCORE = 20;

const punctuation = /[\s。、，,.!?！？「」『』（）()・:：;；'’\-]/gu;
const latin = /[A-Za-z]/;

export function normalizeAnswer(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(punctuation, "");
}

function distance(a: string[], b: string[]) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[a.length][b.length];
}

function diffGraphemes(input: string, expected: string): GradeResult["diff"] {
  const left = Array.from(input);
  const right = Array.from(expected);
  const output: GradeResult["diff"] = [];
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] === right[index]) output.push({ value: right[index] ?? "", kind: "same" });
    else {
      if (left[index]) output.push({ value: left[index], kind: "extra" });
      if (right[index]) output.push({ value: right[index], kind: "missing" });
    }
  }
  return output;
}

export function gradeAnswer(question: QuizQuestion, input: string): GradeResult {
  const normalizedInput = normalizeAnswer(input);
  const accepted = question.acceptedAnswers.map(normalizeAnswer);
  const canonical = normalizeAnswer(question.canonicalAnswer);
  if (question.tier !== "romaji-recall" && latin.test(normalizedInput)) {
    return {
      status: "incorrect",
      canonicalAnswer: question.canonicalAnswer,
      normalizedInput,
      diff: diffGraphemes(normalizedInput, canonical)
    };
  }
  if (accepted.includes(normalizedInput)) {
    return {
      status: "correct",
      canonicalAnswer: question.canonicalAnswer,
      normalizedInput,
      diff: diffGraphemes(canonical, canonical)
    };
  }
  const nearest = accepted.reduce(
    (best, candidate) => {
      const score = distance(Array.from(normalizedInput), Array.from(candidate));
      return score < best.score ? { value: candidate, score } : best;
    },
    { value: canonical, score: Number.POSITIVE_INFINITY }
  );
  const threshold = Math.max(1, Math.floor(Array.from(nearest.value).length * 0.15));
  return {
    status: nearest.score <= threshold ? "near-miss" : "incorrect",
    canonicalAnswer: question.canonicalAnswer,
    normalizedInput,
    diff: diffGraphemes(normalizedInput, canonical)
  };
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const scriptAnswers = (entry: VocabularyEntry, register: Register) => {
  const form = formFor(entry, register);
  return Array.from(new Set([form.kanji, form.kana, ...entry.aliases.script].filter(Boolean) as string[]));
};

function vocabularyQuestion(topic: Topic, entry: VocabularyEntry, tier: QuizTier, register: Register): QuizQuestion {
  const form = formFor(entry, register);
  if (tier === "romaji-recall") {
    return {
      id: `${tier}:${register}:${entry.id}`,
      topicId: topic.id,
      sourceId: entry.masteryKey,
      sceneId: entry.primarySceneId,
      tier,
      register,
      prompt: form.kanji ?? form.kana,
      promptLanguage: "ja",
      canonicalAnswer: form.romaji,
      acceptedAnswers: [form.romaji, ...entry.aliases.romaji],
      helper: entry.meanings.join(" · ")
    };
  }
  return {
    id: `${tier}:${register}:${entry.id}`,
    topicId: topic.id,
    sourceId: entry.masteryKey,
    sceneId: entry.primarySceneId,
    tier,
    register,
    prompt: entry.meanings[0],
    promptLanguage: "en",
    canonicalAnswer: form.kanji ?? form.kana,
    acceptedAnswers: scriptAnswers(entry, register),
    helper: "Write this in Japanese script."
  };
}

function patternQuestions(topic: Topic, tier: QuizTier, register: Register): QuizQuestion[] {
  const vocabulary = new Map(topic.vocabulary.map((entry) => [entry.id, entry]));
  if (tier === "sentence-production") {
    return topic.sentencePatterns.flatMap((pattern) =>
      pattern.slotEntryIds.length ? pattern.slotEntryIds.map((entryId) => {
        const entry = vocabulary.get(entryId)!;
        const form = formFor(entry, register);
        const canonical = renderPattern(pattern.japanese[register], entry, register, "ja");
        const kana = pattern.japanese[register].replaceAll("{term}", form.kana);
        return {
          id: `${tier}:${register}:${pattern.id}:${entryId}`,
          topicId: topic.id,
          sourceId: entry.masteryKey,
          sceneId: pattern.sceneId,
          tier,
          register,
          prompt: renderPattern(pattern.english, entry, register, "en", pattern.slotEnglish?.[entry.id]),
          promptLanguage: "en" as const,
          canonicalAnswer: canonical,
          acceptedAnswers: Array.from(new Set([canonical, kana])),
          helper: register === "formal" ? "Use the polite form." : "Use the casual form."
        };
      }) : [{
        id: `${tier}:${register}:${pattern.id}`,
        topicId: topic.id,
        sourceId: pattern.id,
        sceneId: pattern.sceneId,
        tier,
        register,
        prompt: pattern.english,
        promptLanguage: "en" as const,
        canonicalAnswer: pattern.japanese[register],
        acceptedAnswers: [pattern.japanese[register]],
        helper: register === "formal" ? "Use the polite form from the scene." : "Use the casual form from the scene."
      }]
    );
  }
  return topic.responsePatterns.flatMap((pattern) =>
    pattern.slotEntryIds.length ? pattern.slotEntryIds.map((entryId) => {
      const entry = vocabulary.get(entryId)!;
      const form = formFor(entry, register);
      const canonical = renderPattern(pattern.answerJapanese[register], entry, register, "ja");
      const kana = pattern.answerJapanese[register].replaceAll("{term}", form.kana);
      return {
        id: `${tier}:${register}:${pattern.id}:${entryId}`,
        topicId: topic.id,
        sourceId: entry.masteryKey,
        sceneId: pattern.sceneId,
        tier,
        register,
        prompt: renderPattern(pattern.promptJapanese[register], entry, register, "ja"),
        promptLanguage: "ja" as const,
        canonicalAnswer: canonical,
        acceptedAnswers: Array.from(new Set([canonical, kana])),
        helper: register === "formal" ? "Reply politely in Japanese." : "Reply casually in Japanese."
      };
    }) : [{
      id: `${tier}:${register}:${pattern.id}`,
      topicId: topic.id,
      sourceId: pattern.id,
      sceneId: pattern.sceneId,
      tier,
      register,
      prompt: pattern.promptJapanese[register],
      promptLanguage: "ja" as const,
      canonicalAnswer: pattern.answerJapanese[register],
      acceptedAnswers: [pattern.answerJapanese[register]],
      helper: register === "formal" ? "Reply politely using the scene dialogue." : "Reply casually using the scene dialogue."
    }]
  );
}

function balanceAcrossScenes(
  ranked: Array<{ question: QuizQuestion; priority: number; mastery: number; tie: number }>,
  count: number
) {
  const sceneIds = Array.from(new Set(ranked.map(({ question }) => question.sceneId)));
  if (sceneIds.length < 2) return ranked.slice(0, count);
  const selected: typeof ranked = [];
  const selectedIds = new Set<string>();
  const base = Math.floor(count / sceneIds.length);
  let remainder = count % sceneIds.length;
  for (const sceneId of sceneIds) {
    const quota = base + (remainder-- > 0 ? 1 : 0);
    for (const candidate of ranked.filter(({ question }) => question.sceneId === sceneId).slice(0, quota)) {
      selected.push(candidate);
      selectedIds.add(candidate.question.id);
    }
  }
  for (const candidate of ranked) {
    if (selected.length >= count) break;
    if (!selectedIds.has(candidate.question.id)) selected.push(candidate);
  }
  return selected;
}

export function generateQuiz(topic: Topic, options: GenerateQuizOptions): QuizQuestion[] {
  const count = options.count ?? QUIZ_SIZE;
  const candidates =
    options.tier === "romaji-recall" || options.tier === "script-recall"
      ? topic.vocabulary.map((entry) => vocabularyQuestion(topic, entry, options.tier, options.register))
      : patternQuestions(topic, options.tier, options.register);
  const random = mulberry32(options.seed);
  const ranked = candidates
    .map((question) => ({
      question,
      priority: Object.prototype.hasOwnProperty.call(options.mastery ?? {}, question.sourceId) ? 1 : 0,
      mastery: options.mastery?.[question.sourceId] ?? 0,
      tie: random()
    }))
    .sort((a, b) => a.priority - b.priority || a.mastery - b.mastery || a.tie - b.tie);
  return balanceAcrossScenes(ranked, count)
    .map(({ question }) => question);
}

export function mergeRegisterQuestions(
  previous: QuizQuestion[],
  currentIndex: number,
  regenerated: QuizQuestion[],
  count = QUIZ_SIZE
): QuizQuestion[] {
  const answered = previous.slice(0, currentIndex);
  const usedSources = new Set(answered.map((question) => question.sourceId));
  const usedPrompts = new Set(answered.map((question) => normalizeAnswer(question.prompt)));
  const remaining = regenerated.filter(
    (question) => !usedSources.has(question.sourceId) && !usedPrompts.has(normalizeAnswer(question.prompt))
  );
  const required = count - answered.length;
  if (remaining.length < required) {
    throw new Error(`Register switch produced only ${remaining.length} unused questions; ${required} required`);
  }
  return [...answered, ...remaining.slice(0, required)];
}

export const nextConfidence = (current: number, correct: boolean) =>
  Math.max(0, Math.min(5, current + (correct ? 1 : -2)));
