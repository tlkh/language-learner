import type { Topic, VocabularyEntry } from "../types";

const vietnamesePartOfSpeech: Record<string, string> = {
  noun: "danh từ",
  verb: "động từ",
  adjective: "tính từ",
  adverb: "trạng từ",
  phrase: "cụm từ",
  pronoun: "đại từ",
  preposition: "giới từ",
  number: "số từ"
};

export function definitionsForVocabulary(topic: Topic | undefined, entry: VocabularyEntry) {
  const scene = topic?.scenes.find((candidate) => candidate.id === entry.primarySceneId);
  const context = scene?.title ?? topic?.title ?? "common travel situations";
  return {
    target: `Từ ${vietnamesePartOfSpeech[entry.partOfSpeech] ?? "vựng"} dùng trong tình huống “${context}”.`,
    source: `The Vietnamese ${entry.partOfSpeech} or expression for “${entry.meanings.join(" / ")},” used in ${context.toLowerCase()}.`
  };
}
