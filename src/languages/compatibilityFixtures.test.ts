import { describe, expect, it } from "vitest";
import { indonesianCompatibilityFixture, thaiCompatibilityFixture, vietnameseCompatibilityFixture } from "./compatibilityFixtures";

describe("future pack compatibility fixtures", () => {
  it("supports Indonesian with one speech variant and Latin target text", () => {
    expect(indonesianCompatibilityFixture.speechVariants).toHaveLength(1);
    const topic = indonesianCompatibilityFixture.topics[0];
    const question = indonesianCompatibilityFixture.quiz.generate(topic, { languageCode: "id", topicId: topic.id, tierId: "recognition", variantId: "standard", seed: 1 })[0];
    expect(indonesianCompatibilityFixture.quiz.grade(question, "SELAMAT").status).toBe("correct");
  });

  it("accepts canonically equivalent Vietnamese sequences while preserving tone", () => {
    const topic = vietnameseCompatibilityFixture.topics[0];
    const question = vietnameseCompatibilityFixture.quiz.generate(topic, { languageCode: "vi", topicId: topic.id, tierId: "recognition", variantId: "standard", seed: 1 })[0];
    expect(vietnameseCompatibilityFixture.quiz.grade(question, "ma\u0301").status).toBe("correct");
    expect(vietnameseCompatibilityFixture.quiz.grade(question, "mà").status).not.toBe("correct");
  });

  it("keeps Thai consonant, positional-vowel, and tone units as arbitrary multi-codepoint strings", () => {
    expect(thaiCompatibilityFixture.characterCourse.items.map((item) => Array.from(item.representations.glyph).length)).toEqual([2, 2]);
    expect(thaiCompatibilityFixture.characterCourse.items[0].representations.glyph).toBe("ก้");
  });
});
