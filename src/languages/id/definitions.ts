import type { Topic, VocabularyEntry } from "../types";

const indonesianPartOfSpeech: Record<string, string> = {
  noun: "kata benda",
  verb: "kata kerja",
  adjective: "kata sifat",
  adverb: "kata keterangan",
  phrase: "ungkapan",
  pronoun: "kata ganti",
  preposition: "kata depan",
  number: "kata bilangan"
};

export function definitionsForVocabulary(topic: Topic | undefined, entry: VocabularyEntry) {
  const scene = topic?.scenes.find((candidate) => candidate.id === entry.primarySceneId);
  const context = scene?.title ?? topic?.title ?? "common travel situations";
  return {
    target: `Kata ${indonesianPartOfSpeech[entry.partOfSpeech] ?? "kosakata"} untuk situasi “${context}”.`,
    source: `The Indonesian ${entry.partOfSpeech} or expression for “${entry.meanings.join(" / ")},” used in ${context.toLowerCase()}.`
  };
}
