import type { Topic, VocabularyEntry } from "../types";

const thaiPartOfSpeech: Record<string, string> = {
  noun: "คำนาม",
  verb: "คำกริยา",
  adjective: "คำคุณศัพท์",
  adverb: "คำวิเศษณ์",
  phrase: "วลี",
  pronoun: "คำสรรพนาม",
  preposition: "คำบุพบท",
  number: "คำบอกจำนวน"
};

export function definitionsForVocabulary(topic: Topic | undefined, entry: VocabularyEntry) {
  const scene = topic?.scenes.find((candidate) => candidate.id === entry.primarySceneId);
  const context = scene?.title ?? topic?.title ?? "common travel situations";
  return {
    target: `คำ${thaiPartOfSpeech[entry.partOfSpeech] ?? "ศัพท์"}ที่ใช้ในสถานการณ์ “${context}”`,
    source: `The Thai ${entry.partOfSpeech} or expression for “${entry.meanings.join(" / ")},” used in ${context.toLowerCase()}.`
  };
}
