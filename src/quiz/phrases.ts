import type { LanguagePack, Topic } from "../languages/types";

export const PHRASE_QUIZ_TOPIC_ID = "__essential_phrases__";

export function getPhraseQuizTier(pack: LanguagePack) {
  return pack.quiz.tiers[1] ?? pack.quiz.tiers[0];
}

export function buildPhraseQuizTopic(pack: LanguagePack): Topic | undefined {
  const phraseSet = pack.sharedVocabularySets[0];
  const tier = getPhraseQuizTier(pack);
  if (!phraseSet || !tier) return undefined;
  const groupByEntry = new Map(phraseSet.groups.flatMap((group) => group.entryIds.map((entryId) => [entryId, group.id] as const)));
  const vocabulary = phraseSet.vocabulary.map((entry) => ({
    ...entry,
    topicId: PHRASE_QUIZ_TOPIC_ID,
    primarySceneId: groupByEntry.get(entry.id) ?? phraseSet.groups[0]?.id ?? "essentials",
    tags: entry.tags.includes("domain") ? entry.tags : [...entry.tags, "domain"]
  }));
  return {
    id: PHRASE_QUIZ_TOPIC_ID,
    title: phraseSet.title,
    shortTitle: "Essential phrases",
    description: phraseSet.description,
    categoryId: "essentials",
    collectionId: "essentials",
    scenes: phraseSet.groups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      vocabularyIds: group.entryIds,
      dialogueIds: [],
      sentencePatternIds: [],
      responsePatternIds: []
    })),
    relatedTopicIds: [],
    sharedVocabularySetIds: [phraseSet.id],
    vocabulary,
    dialogues: [],
    sentencePatterns: [],
    responsePatterns: [],
    quizTierIds: [tier.id]
  };
}
