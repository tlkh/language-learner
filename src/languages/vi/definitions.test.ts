import { describe, expect, it } from "vitest";
import { vietnamesePack } from "./vietnamese";

describe("Vietnamese vocabulary definitions", () => {
  it("keeps the target-language explanation fully in Vietnamese", () => {
    const topic = vietnamesePack.topics.find((candidate) => candidate.id === "vietnamese-foundations")!;
    const entry = topic.vocabulary.find((candidate) => (
      candidate.tags.includes("domain")
      && candidate.baseForm.representations.target === "tôi"
    ))!;

    expect(vietnamesePack.defineVocabulary?.(topic, entry)).toEqual({
      target: "Đây là một đại từ trong tiếng Việt, thường dùng khi chọn cách xưng hô phù hợp với tuổi tác và mối quan hệ.",
      source: "A Vietnamese pronoun meaning “neutral or formal I,” used in “Choose terms of address.”"
    });
  });

  it("never interpolates English curriculum titles into Vietnamese explanations", () => {
    for (const topic of vietnamesePack.topics) {
      for (const entry of topic.vocabulary) {
        const definition = vietnamesePack.defineVocabulary?.(topic, entry);
        const scene = topic.scenes.find((candidate) => candidate.id === entry.primarySceneId);

        expect(definition?.target).not.toContain(topic.title);
        if (scene) expect(definition?.target).not.toContain(scene.title);
        expect(definition?.target).not.toMatch(/\b(?:choose|terms|address|common|travel|situations|used|when)\b/i);
      }
    }
  });
});
