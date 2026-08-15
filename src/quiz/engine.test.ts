import { describe, expect, it } from "vitest";
import { japanesePack } from "../content";
import type { QuizQuestion } from "../content/types";
import { generateQuiz, gradeAnswer, mergeRegisterQuestions, nextConfidence, normalizeAnswer, PASS_SCORE, QUIZ_SIZE } from "./engine";

const topic = japanesePack.topics.find((item) => item.id === "airports-flights")!;

const question = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: "test",
  topicId: topic.id,
  sourceId: topic.vocabulary[0].id,
  sceneId: topic.scenes[0].id,
  tier: "script-recall",
  register: "formal",
  prompt: "excuse me",
  promptLanguage: "en",
  canonicalAnswer: "すみません",
  acceptedAnswers: ["すみません"],
  helper: "",
  ...overrides
});

describe("answer grading", () => {
  it("normalizes NFKC, case, whitespace, and harmless punctuation", () => {
    expect(normalizeAnswer(" ＡＲＩＧＡＴＯＵ！ ")).toBe("arigatou");
  });

  it("accepts only explicitly authored aliases", () => {
    const result = gradeAnswer(
      question({ tier: "romaji-recall", canonicalAnswer: "arigatou gozaimasu", acceptedAnswers: ["arigatou gozaimasu", "arigatō gozaimasu"] }),
      "ARIGATŌ GOZAIMASU"
    );
    expect(result.status).toBe("correct");
  });

  it("marks a one-grapheme typo as a near miss without accepting it", () => {
    const result = gradeAnswer(question(), "すみまへん");
    expect(result.status).toBe("near-miss");
    expect(result.diff.some((part) => part.kind !== "same")).toBe(true);
  });

  it("rejects romaji in script-production tiers", () => {
    expect(gradeAnswer(question(), "sumimasen").status).toBe("incorrect");
  });
});

describe("quiz generation", () => {
  it("returns the same 24 unique questions for the same seed", () => {
    const options = { topicId: topic.id, tier: "romaji-recall" as const, register: "formal" as const, seed: 31415 };
    const first = generateQuiz(topic, options);
    const second = generateQuiz(topic, options);
    expect(first).toEqual(second);
    expect(first).toHaveLength(QUIZ_SIZE);
    expect(new Set(first.map((item) => item.id)).size).toBe(QUIZ_SIZE);
  });

  it("prioritizes low-confidence items before mastered items", () => {
    const groups = Array.from(new Set(topic.vocabulary.map((entry) => entry.primarySceneId)));
    const weak = groups.flatMap((sceneId) => topic.vocabulary.filter((entry) => entry.primarySceneId === sceneId).slice(0, QUIZ_SIZE / groups.length));
    const mastery = Object.fromEntries(topic.vocabulary.map((entry) => [entry.id, weak.includes(entry) ? 0 : 5]));
    const generated = generateQuiz(topic, {
      topicId: topic.id,
      tier: "script-recall",
      register: "informal",
      seed: 9,
      mastery
    });
    expect(new Set(generated.map((item) => item.sourceId))).toEqual(new Set(weak.map((entry) => entry.id)));
  });

  it("selects unseen items before prior mistakes", () => {
    const groups = Array.from(new Set(topic.vocabulary.map((entry) => entry.primarySceneId)));
    const priorMistakes = groups.flatMap((sceneId) => topic.vocabulary.filter((entry) => entry.primarySceneId === sceneId).slice(0, QUIZ_SIZE / groups.length));
    const mastery = Object.fromEntries(priorMistakes.map((entry) => [entry.id, 0]));
    const generated = generateQuiz(topic, {
      topicId: topic.id,
      tier: "romaji-recall",
      register: "formal",
      seed: 27,
      mastery
    });
    expect(generated.every((item) => !priorMistakes.some((entry) => entry.id === item.sourceId))).toBe(true);
  });

  it("balances every checkpoint across the topic scenes and shared phrase kit", () => {
    const generated = generateQuiz(topic, { topicId: topic.id, tier: "script-recall", register: "formal", seed: 44 });
    const counts = generated.reduce<Record<string, number>>((result, item) => ({ ...result, [item.sceneId]: (result[item.sceneId] ?? 0) + 1 }), {});
    expect(Object.values(counts)).toEqual([6, 6, 6, 6]);
  });

  it("switches register without repeating answered template items", () => {
    const formal = generateQuiz(topic, {
      topicId: topic.id,
      tier: "sentence-production",
      register: "formal",
      seed: 81
    });
    const informal = generateQuiz(topic, {
      topicId: topic.id,
      tier: "sentence-production",
      register: "informal",
      seed: 81,
      mastery: Object.fromEntries(formal.slice(0, 5).map((item) => [item.sourceId, 1]))
    });
    const merged = mergeRegisterQuestions(formal, 5, informal);

    expect(merged).toHaveLength(QUIZ_SIZE);
    expect(merged.slice(0, 5).every((item) => item.register === "formal")).toBe(true);
    expect(merged.slice(5).every((item) => item.register === "informal")).toBe(true);
    expect(new Set(merged.map((item) => item.sourceId)).size).toBe(QUIZ_SIZE);
    expect(new Set(merged.map((item) => item.prompt)).size).toBe(QUIZ_SIZE);
  });

  it("applies the documented confidence and passing boundaries", () => {
    expect(nextConfidence(3, true)).toBe(4);
    expect(nextConfidence(5, true)).toBe(5);
    expect(nextConfidence(1, false)).toBe(0);
    expect(PASS_SCORE).toBe(20);
  });
});
