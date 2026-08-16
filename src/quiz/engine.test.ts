import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "../languages";
import { japanesePack } from "../languages/ja/japanese";
import { normalizeAnswer } from "../languages/ja/quiz";
import { gradeQuestion, mergeVariantQuestions, nextConfidence, segmentGraphemes } from "./engine";

const topic = japanesePack.topics.find((item) => item.id === "airports-flights")!;
const makeQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: "test",
  languageCode: "ja",
  topicId: topic.id,
  sourceId: topic.vocabulary[0].masteryKey,
  sceneId: topic.scenes[0].id,
  tierId: "script-recall",
  variantId: "formal",
  prompt: "excuse me",
  promptLanguage: "en",
  canonicalAnswer: "すみません",
  acceptedAnswers: ["すみません"],
  answerLanguage: "ja",
  answerRepresentationId: "target",
  answerLabel: "Japanese answer",
  answerPlaceholder: "Type Japanese",
  helper: "",
  ...overrides
});

describe("grapheme-aware answer grading", () => {
  it("uses pack normalization and explicitly authored aliases", () => {
    expect(normalizeAnswer(" ＡＲＩＧＡＴＯＵ！ ")).toBe("arigatou");
    const question = makeQuestion({ canonicalAnswer: "arigatou gozaimasu", acceptedAnswers: ["arigatou gozaimasu", "arigatō gozaimasu"], answerLanguage: "en" });
    expect(japanesePack.quiz.grade(question, "ARIGATŌ GOZAIMASU").status).toBe("correct");
  });

  it("marks a one-grapheme typo as a near miss", () => {
    const result = japanesePack.quiz.grade(makeQuestion(), "すみまへん");
    expect(result.status).toBe("near-miss");
    expect(result.diff.some((part) => part.kind !== "same")).toBe(true);
  });

  it("keeps the remainder aligned after a missing character", () => {
    const question = makeQuestion({ canonicalAnswer: "takushii noriba", acceptedAnswers: ["takushii noriba"], answerLanguage: "en" });
    const result = japanesePack.quiz.grade(question, "takushi noriba");
    expect(result.diff.filter((part) => part.kind !== "same")).toEqual([{ value: "i", kind: "missing" }]);
  });

  it("does not globally reject Latin target answers", () => {
    const question = makeQuestion({ languageCode: "id", canonicalAnswer: "selamat", acceptedAnswers: ["selamat"], answerLanguage: "id" });
    expect(gradeQuestion(question, "Selamat", (value) => value.trim().toLocaleLowerCase("id"), "id").status).toBe("correct");
  });

  it("segments multi-codepoint display units as graphemes", () => {
    expect(segmentGraphemes("ก้", "th")).toEqual(["ก้"]);
  });
});

describe("pack-owned quiz generation", () => {
  it("returns the same 24 unique questions for the same seed", () => {
    const options = { languageCode: "ja", topicId: topic.id, tierId: "romaji-recall", variantId: "formal", seed: 31415 };
    const first = japanesePack.quiz.generate(topic, options);
    expect(first).toEqual(japanesePack.quiz.generate(topic, options));
    expect(first).toHaveLength(24);
    expect(new Set(first.map((item) => item.id)).size).toBe(24);
  });

  it("prioritizes unseen and low-confidence items", () => {
    const domain = topic.vocabulary.filter((entry) => entry.tags.includes("domain"));
    const mastery = Object.fromEntries(domain.slice(0, 70).map((entry) => [entry.masteryKey, 5]));
    const generated = japanesePack.quiz.generate(topic, { languageCode: "ja", topicId: topic.id, tierId: "script-recall", variantId: "formal", seed: 9, mastery });
    expect(generated.filter((item) => mastery[item.sourceId] === undefined).length).toBeGreaterThan(0);
  });

  it("does not repeat correctly answered questions while enough unanswered questions remain", () => {
    const options = { languageCode: "ja", topicId: topic.id, tierId: "script-recall", variantId: "formal", seed: 19 };
    const first = japanesePack.quiz.generate(topic, options);
    const second = japanesePack.quiz.generate(topic, { ...options, correctQuestionIds: new Set(first.map((question) => question.id)) });
    expect(second).toHaveLength(24);
    expect(second.some((question) => first.some((answered) => answered.id === question.id))).toBe(false);
  });

  it("replaces only unanswered questions when the speech variant changes", () => {
    const baseOptions = { languageCode: "ja", topicId: topic.id, tierId: "sentence-production", seed: 81 };
    const formal = japanesePack.quiz.generate(topic, { ...baseOptions, variantId: "formal" });
    const informal = japanesePack.quiz.generate(topic, { ...baseOptions, variantId: "informal" });
    const merged = mergeVariantQuestions(formal, 5, informal, 24, normalizeAnswer);
    expect(merged).toHaveLength(24);
    expect(merged.slice(0, 5).every((item) => item.variantId === "formal")).toBe(true);
    expect(merged.slice(5).every((item) => item.variantId === "informal")).toBe(true);
  });

  it("applies bounded confidence", () => {
    expect(nextConfidence(3, true)).toBe(4);
    expect(nextConfidence(5, true)).toBe(5);
    expect(nextConfidence(1, false)).toBe(0);
  });
});
