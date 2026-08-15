import type { GradeResult, QuizQuestion } from "../languages/types";

export const DEFAULT_QUIZ_SIZE = 24;
export const DEFAULT_PASS_SCORE = 20;

export function segmentGraphemes(value: string, locale = "en"): string[] {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }
  return Array.from(value);
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

function diffGraphemes(input: string, expected: string, locale: string): GradeResult["diff"] {
  const left = segmentGraphemes(input, locale);
  const right = segmentGraphemes(expected, locale);
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

export function gradeQuestion(
  question: QuizQuestion,
  input: string,
  normalize: (value: string) => string,
  locale: string
): GradeResult {
  const normalizedInput = normalize(input);
  const accepted = question.acceptedAnswers.map(normalize);
  const canonical = normalize(question.canonicalAnswer);
  if (accepted.includes(normalizedInput)) {
    return {
      status: "correct",
      canonicalAnswer: question.canonicalAnswer,
      normalizedInput,
      diff: diffGraphemes(canonical, canonical, locale)
    };
  }
  const nearest = accepted.reduce(
    (best, candidate) => {
      const score = distance(segmentGraphemes(normalizedInput, locale), segmentGraphemes(candidate, locale));
      return score < best.score ? { value: candidate, score } : best;
    },
    { value: canonical, score: Number.POSITIVE_INFINITY }
  );
  const threshold = Math.max(1, Math.floor(segmentGraphemes(nearest.value, locale).length * 0.15));
  return {
    status: nearest.score <= threshold ? "near-miss" : "incorrect",
    canonicalAnswer: question.canonicalAnswer,
    normalizedInput,
    diff: diffGraphemes(normalizedInput, canonical, locale)
  };
}

export function seededRandom(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function selectSceneBalancedQuestions(
  candidates: QuizQuestion[],
  options: { count: number; seed: number; mastery?: Record<string, number> }
): QuizQuestion[] {
  const random = seededRandom(options.seed);
  const ranked = candidates
    .map((question) => ({
      question,
      priority: Object.prototype.hasOwnProperty.call(options.mastery ?? {}, question.sourceId) ? 1 : 0,
      mastery: options.mastery?.[question.sourceId] ?? 0,
      tie: random()
    }))
    .sort((a, b) => a.priority - b.priority || a.mastery - b.mastery || a.tie - b.tie);
  const sceneIds = Array.from(new Set(ranked.map(({ question }) => question.sceneId)));
  if (sceneIds.length < 2) return ranked.slice(0, options.count).map(({ question }) => question);

  const selected: typeof ranked = [];
  const selectedIds = new Set<string>();
  const base = Math.floor(options.count / sceneIds.length);
  let remainder = options.count % sceneIds.length;
  for (const sceneId of sceneIds) {
    const quota = base + (remainder-- > 0 ? 1 : 0);
    for (const candidate of ranked.filter(({ question }) => question.sceneId === sceneId).slice(0, quota)) {
      selected.push(candidate);
      selectedIds.add(candidate.question.id);
    }
  }
  for (const candidate of ranked) {
    if (selected.length >= options.count) break;
    if (!selectedIds.has(candidate.question.id)) selected.push(candidate);
  }
  return selected.map(({ question }) => question);
}

export function mergeVariantQuestions(
  previous: QuizQuestion[],
  currentIndex: number,
  regenerated: QuizQuestion[],
  count: number,
  normalizePrompt: (value: string) => string
): QuizQuestion[] {
  const answered = previous.slice(0, currentIndex);
  const usedSources = new Set(answered.map((question) => question.sourceId));
  const usedPrompts = new Set(answered.map((question) => normalizePrompt(question.prompt)));
  const remaining = regenerated.filter(
    (question) => !usedSources.has(question.sourceId) && !usedPrompts.has(normalizePrompt(question.prompt))
  );
  const required = count - answered.length;
  if (remaining.length < required) {
    throw new Error(`Speech-variant switch produced only ${remaining.length} unused questions; ${required} required`);
  }
  return [...answered, ...remaining.slice(0, required)];
}

export const nextConfidence = (current: number, correct: boolean) =>
  Math.max(0, Math.min(5, current + (correct ? 1 : -2)));
