import { japanesePack } from "../src/content/japanese";
import { generateQuiz, QUIZ_SIZE } from "../src/quiz/engine";
import type { QuizTier, Register } from "../src/content/types";

const errors: string[] = [];
const ids = new Map<string, string>();
const tiers: QuizTier[] = [
  "romaji-recall",
  "script-recall",
  "sentence-production",
  "response-production"
];
const registers: Register[] = ["formal", "informal"];
const japaneseScript = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

if (japanesePack.topics.length !== 16) {
  errors.push(`Expected 16 topics, received ${japanesePack.topics.length}`);
}

const collectedTopicIds = japanesePack.collections.flatMap((collection) => collection.topicIds);
if (collectedTopicIds.length !== japanesePack.topics.length || new Set(collectedTopicIds).size !== japanesePack.topics.length) {
  errors.push("Collections must include every topic exactly once");
}
for (const topic of japanesePack.topics) {
  if (!collectedTopicIds.includes(topic.id)) errors.push(`${topic.id}: missing from collections`);
}

for (const topic of japanesePack.topics) {
  if (topic.vocabulary.length < 120) errors.push(`${topic.id}: only ${topic.vocabulary.length} vocabulary entries`);
  if (topic.dialogues.length < 2 || topic.dialogues.length > 3) {
    errors.push(`${topic.id}: expected 2–3 dialogues, received ${topic.dialogues.length}`);
  }
  const entryKeys = new Set<string>();
  for (const entry of topic.vocabulary) {
    const signature = `${entry.meanings.join("/")}\u0000${entry.sharedForm.kana}\u0000${entry.sharedForm.kanji ?? ""}`;
    const existingSignature = ids.get(entry.id);
    if (existingSignature && existingSignature !== signature) errors.push(`Conflicting vocabulary id: ${entry.id}`);
    ids.set(entry.id, signature);
    if (!entry.meanings.length || !entry.sharedForm.kana || !entry.sharedForm.romaji) {
      errors.push(`${entry.id}: missing meaning, kana, or romaji`);
    }
    if (!japaneseScript.test(entry.sharedForm.kana)) errors.push(`${entry.id}: kana field contains no Japanese script`);
    if (japaneseScript.test(entry.sharedForm.romaji)) errors.push(`${entry.id}: romaji field contains Japanese script`);
    const entryKey = `${entry.meanings[0].trim().toLocaleLowerCase("en")}\u0000${entry.sharedForm.kanji ?? entry.sharedForm.kana}`;
    if (entryKeys.has(entryKey)) errors.push(`${topic.id}: duplicate visible vocabulary entry ${entry.meanings[0]}`);
    entryKeys.add(entryKey);
  }
  const domainEntries = topic.vocabulary.filter((entry) => entry.tags.includes("domain"));
  if (domainEntries.length < 80) errors.push(`${topic.id}: only ${domainEntries.length} topic-specific entries`);
  if (topic.scenes.length !== 3) errors.push(`${topic.id}: expected exactly three scenes`);
  const assignedVocabularyIds = topic.scenes.flatMap((scene) => scene.vocabularyIds);
  if (assignedVocabularyIds.length !== domainEntries.length || new Set(assignedVocabularyIds).size !== domainEntries.length) {
    errors.push(`${topic.id}: every domain entry must belong to exactly one scene`);
  }
  const assignedDialogueIds = topic.scenes.flatMap((scene) => scene.dialogueIds);
  if (assignedDialogueIds.length !== topic.dialogues.length || new Set(assignedDialogueIds).size !== topic.dialogues.length) {
    errors.push(`${topic.id}: every dialogue must belong to exactly one scene`);
  }
  for (const relatedId of topic.relatedTopicIds) {
    if (!japanesePack.topics.some((candidate) => candidate.id === relatedId)) errors.push(`${topic.id}: missing related topic ${relatedId}`);
  }
  for (const pattern of [...topic.sentencePatterns, ...topic.responsePatterns]) {
    for (const sourceId of pattern.slotEntryIds) {
      if (!topic.vocabulary.some((entry) => entry.id === sourceId)) errors.push(`${pattern.id}: missing slot ${sourceId}`);
    }
  }
  for (const scene of topic.scenes) {
    if (scene.sentencePatternIds.length < 2) errors.push(`${topic.id}/${scene.id}: fewer than two sentence functions`);
    if (scene.responsePatternIds.length < 2) errors.push(`${topic.id}/${scene.id}: fewer than two response functions`);
    if (!scene.vocabularyIds.length) errors.push(`${topic.id}/${scene.id}: no vocabulary assigned`);
  }
  for (const dialogue of topic.dialogues) {
    if (dialogue.turns.length < 4) errors.push(`${dialogue.id}: dialogue must have at least four turns`);
    for (const turn of dialogue.turns) {
      if (!turn.japanese.formal || !turn.japanese.informal) errors.push(`${dialogue.id}: missing register text`);
    }
  }
  for (const tier of tiers) {
    for (const register of registers) {
      const questions = generateQuiz(topic, { topicId: topic.id, tier, register, seed: 42, count: QUIZ_SIZE });
      if (questions.length < QUIZ_SIZE) {
        errors.push(`${topic.id}/${tier}/${register}: only ${questions.length} generated questions`);
      }
      if (new Set(questions.map((question) => question.id)).size !== questions.length) {
        errors.push(`${topic.id}/${tier}/${register}: duplicate generated question ids`);
      }
      if (new Set(questions.map((question) => question.prompt)).size !== questions.length) {
        errors.push(`${topic.id}/${tier}/${register}: duplicate visible prompts in generated session`);
      }
      for (const scene of topic.scenes) {
        if (!questions.some((question) => question.sceneId === scene.id)) {
          errors.push(`${topic.id}/${tier}/${register}: checkpoint misses scene ${scene.id}`);
        }
      }
      for (const question of questions) {
        if (!question.acceptedAnswers.length || !question.acceptedAnswers.includes(question.canonicalAnswer)) {
          errors.push(`${question.id}: canonical answer is not accepted`);
        }
      }
    }
  }
}

for (const collection of japanesePack.collections) {
  for (const phraseSetId of collection.phraseSetIds ?? []) {
    if (!japanesePack.sharedVocabularySets.some((set) => set.id === phraseSetId)) {
      errors.push(`${collection.id}: missing shared vocabulary set ${phraseSetId}`);
    }
  }
}

for (const topicId of japanesePack.recommendedPath) {
  if (!japanesePack.topics.some((topic) => topic.id === topicId)) errors.push(`Path references missing topic: ${topicId}`);
}

const aircraftTopic = japanesePack.topics.find((topic) => topic.id === "aircraft-jsdf");
if (!aircraftTopic) {
  errors.push("Missing Aircraft & Japanese Military Aviation topic");
} else {
  const aircraftEntries = aircraftTopic.vocabulary.filter((entry) => entry.tags.includes("domain"));
  const otherEntries = japanesePack.topics
    .filter((topic) => topic.id !== aircraftTopic.id)
    .flatMap((topic) => topic.vocabulary.filter((entry) => entry.tags.includes("domain")));
  const otherMeanings = new Set(otherEntries.flatMap((entry) => entry.meanings.map((meaning) => meaning.toLocaleLowerCase("en"))));
  const otherForms = new Set(otherEntries.flatMap((entry) => [entry.sharedForm.kana, entry.sharedForm.kanji].filter(Boolean)));
  for (const entry of aircraftEntries) {
    for (const meaning of entry.meanings) {
      if (otherMeanings.has(meaning.toLocaleLowerCase("en"))) {
        errors.push(`${entry.id}: Aircraft topic duplicates another topic meaning: ${meaning}`);
      }
    }
    for (const form of [entry.sharedForm.kana, entry.sharedForm.kanji].filter(Boolean)) {
      if (otherForms.has(form)) errors.push(`${entry.id}: Aircraft topic duplicates another topic form: ${form}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${japanesePack.topics.length} topics, ${new Set(japanesePack.topics.flatMap((topic) => topic.vocabulary.map((entry) => entry.id))).size} unique vocabulary records, and all scene-balanced quiz pools.`
);
